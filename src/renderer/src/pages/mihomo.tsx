import { Button, Input, Select, SelectItem, Switch, Tab, Tabs } from '@heroui/react'
import BasePage from '@renderer/components/base/base-page'
import SettingCard from '@renderer/components/base/base-setting-card'
import SettingItem from '@renderer/components/base/base-setting-item'
import ConfirmModal, { ConfirmButton } from '@renderer/components/base/base-confirm'
import PermissionModal from '@renderer/components/mihomo/permission-modal'
import ServiceModal from '@renderer/components/mihomo/service-modal'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import PortSetting from '@renderer/components/mihomo/port-setting'
import { platform } from '@renderer/utils/init'
import { IoMdCloudDownload } from 'react-icons/io'
import PubSub from 'pubsub-js'
import {
  manualGrantCorePermition,
  mihomoUpgrade,
  restartCore,
  revokeCorePermission,
  findSystemMihomo,
  deleteElevateTask,
  checkElevateTask,
  relaunchApp,
  notDialogQuit,
  installService,
  uninstallService,
  startService,
  stopService,
  initService,
  restartService
} from '@renderer/utils/ipc'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ControllerSetting from '@renderer/components/mihomo/controller-setting'
import EnvSetting from '@renderer/components/mihomo/env-setting'
import AdvancedSetting from '@renderer/components/mihomo/advanced-settings'

let systemCorePathsCache: string[] | null = null
let cachePromise: Promise<string[]> | null = null

const getSystemCorePaths = async (): Promise<string[]> => {
  if (systemCorePathsCache !== null) return systemCorePathsCache
  if (cachePromise !== null) return cachePromise

  cachePromise = findSystemMihomo()
    .then((paths) => {
      systemCorePathsCache = paths
      cachePromise = null
      return paths
    })
    .catch(() => {
      cachePromise = null
      return []
    })

  return cachePromise
}

getSystemCorePaths().catch(() => {})

const Mihomo: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const { core = 'mihomo', maxLogDays = 7, corePermissionMode = 'elevated' } = appConfig || {}
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { ipv6, 'log-level': logLevel = 'info' } = controledMihomoConfig || {}

  const [upgrading, setUpgrading] = useState(false)
  const [showGrantConfirm, setShowGrantConfirm] = useState(false)
  const [showUnGrantConfirm, setShowUnGrantConfirm] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [pendingPermissionMode, setPendingPermissionMode] = useState<string>('')
  const [systemCorePaths, setSystemCorePaths] = useState<string[]>(systemCorePathsCache || [])
  const [loadingPaths, setLoadingPaths] = useState(systemCorePathsCache === null)

  useEffect(() => {
    if (systemCorePathsCache !== null) return

    getSystemCorePaths()
      .then(setSystemCorePaths)
      .catch(() => {})
      .finally(() => setLoadingPaths(false))
  }, [])

  const onChangeNeedRestart = async (patch: Partial<MihomoConfig>): Promise<void> => {
    await patchControledMihomoConfig(patch)
    await restartCore()
  }

  const handleConfigChangeWithRestart = async (key: string, value: unknown): Promise<void> => {
    try {
      await patchAppConfig({ [key]: value })
      await restartCore()
      PubSub.publish('mihomo-core-changed')
    } catch (e) {
      alert(e)
    }
  }

  const handleCoreUpgrade = async (): Promise<void> => {
    try {
      setUpgrading(true)
      await mihomoUpgrade()
      setTimeout(() => PubSub.publish('mihomo-core-changed'), 2000)
    } catch (e) {
      if (typeof e === 'string' && e.includes('already using latest version')) {
        new Notification(t('mihomo.alreadyLatest'))
      } else {
        alert(e)
      }
    } finally {
      setUpgrading(false)
    }
  }

  const handleCoreChange = async (newCore: 'mihomo' | 'mihomo-alpha' | 'system'): Promise<void> => {
    if (newCore === 'system') {
      const paths = await getSystemCorePaths()

      if (paths.length === 0) {
        new Notification(t('mihomo.systemCoreNotFound'), {
          body: t('mihomo.systemCoreNotFoundBody')
        })
        return
      }

      if (!appConfig?.systemCorePath || !paths.includes(appConfig.systemCorePath)) {
        await patchAppConfig({ systemCorePath: paths[0] })
      }
    }
    handleConfigChangeWithRestart('core', newCore)
  }

  const handlePermissionModeChange = async (key: string): Promise<void> => {
    if (platform === 'win32') {
      if (key !== 'elevated') {
        if (await checkElevateTask()) {
          setPendingPermissionMode(key)
          setShowUnGrantConfirm(true)
        } else {
          patchAppConfig({ corePermissionMode: key as 'elevated' | 'service' })
        }
      } else if (key === 'elevated') {
        setPendingPermissionMode(key)
        setShowGrantConfirm(true)
      }
    } else {
      patchAppConfig({ corePermissionMode: key as 'elevated' | 'service' })
    }
  }

  const unGrantButtons: ConfirmButton[] = [
    {
      key: 'cancel',
      text: t('common.cancel'),
      variant: 'light',
      onPress: () => {}
    },
    {
      key: 'confirm',
      text: platform === 'win32' ? t('mihomo.cancelWithoutRestart') : t('mihomo.confirmRevoke'),
      color: 'warning',
      onPress: async () => {
        try {
          if (platform === 'win32') {
            await deleteElevateTask()
            new Notification(t('mihomo.taskCanceled'))
          } else {
            await revokeCorePermission()
            new Notification(t('mihomo.permissionRevoked'))
          }
          await patchAppConfig({
            corePermissionMode: pendingPermissionMode as 'elevated' | 'service'
          })

          await restartCore()
        } catch (e) {
          alert(e)
        }
      }
    },
    ...(platform === 'win32'
      ? [
          {
            key: 'cancel-and-restart',
            text: '取消并重启',
            color: 'danger' as const,
            onPress: async () => {
              try {
                await deleteElevateTask()
                new Notification('任务计划已取消注册')
                await patchAppConfig({
                  corePermissionMode: pendingPermissionMode as 'elevated' | 'service'
                })
                await relaunchApp()
              } catch (e) {
                alert(e)
              }
            }
          }
        ]
      : [])
  ]

  return (
    <BasePage title={t('mihomo.title')}>
      {showGrantConfirm && (
        <ConfirmModal
          onChange={setShowGrantConfirm}
          title={t('mihomo.confirmTaskSchedule')}
          description={t('mihomo.confirmTaskScheduleDesc')}
          onConfirm={async () => {
            await patchAppConfig({
              corePermissionMode: pendingPermissionMode as 'elevated' | 'service'
            })
            await notDialogQuit()
          }}
        />
      )}
      {showUnGrantConfirm && (
        <ConfirmModal
          onChange={setShowUnGrantConfirm}
          title={t('mihomo.confirmCancelTaskSchedule')}
          description={t('mihomo.confirmCancelTaskScheduleDesc')}
          buttons={unGrantButtons}
        />
      )}
      {showPermissionModal && (
        <PermissionModal
          onChange={setShowPermissionModal}
          onRevoke={async () => {
            if (platform === 'win32') {
              await deleteElevateTask()
              new Notification(t('mihomo.taskCanceled'))
            } else {
              await revokeCorePermission()
              new Notification(t('mihomo.permissionRevoked'))
            }
            await restartCore()
          }}
          onGrant={async () => {
            await manualGrantCorePermition()
            new Notification(t('mihomo.permissionGranted'))
            await restartCore()
          }}
        />
      )}
      {showServiceModal && (
        <ServiceModal
          onChange={setShowServiceModal}
          onInit={async () => {
            await initService()
            new Notification(t('mihomo.serviceInitSuccess'))
          }}
          onInstall={async () => {
            await installService()
            new Notification(t('mihomo.serviceInstallSuccess'))
          }}
          onUninstall={async () => {
            await uninstallService()
            new Notification(t('mihomo.serviceUninstallSuccess'))
          }}
          onStart={async () => {
            await startService()
            new Notification(t('mihomo.serviceStartSuccess'))
          }}
          onRestart={async () => {
            await restartService()
            new Notification(t('mihomo.serviceRestartSuccess'))
          }}
          onStop={async () => {
            await stopService()
            new Notification(t('mihomo.serviceStopSuccess'))
          }}
        />
      )}
      <SettingCard>
        <SettingItem
          title={t('mihomo.coreVersion')}
          actions={
            core === 'mihomo' || core === 'mihomo-alpha' ? (
              <Button
                size="sm"
                isIconOnly
                title={t('mihomo.upgradeCore')}
                variant="light"
                isLoading={upgrading}
                onPress={handleCoreUpgrade}
              >
                <IoMdCloudDownload className="text-lg" />
              </Button>
            ) : null
          }
          divider
        >
          <Select
            classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
            className="w-[150px]"
            size="sm"
            selectedKeys={new Set([core])}
            disallowEmptySelection={true}
            onSelectionChange={(v) =>
              handleCoreChange(v.currentKey as 'mihomo' | 'mihomo-alpha' | 'system')
            }
          >
            <SelectItem key="mihomo">{t('mihomo.builtInStable')}</SelectItem>
            <SelectItem key="mihomo-alpha">{t('mihomo.builtInAlpha')}</SelectItem>
            <SelectItem key="system">{t('mihomo.useSystemCore')}</SelectItem>
          </Select>
        </SettingItem>
        {core === 'system' && (
          <SettingItem title={t('mihomo.selectSystemCore')} divider>
            <Select
              classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
              className="w-[350px]"
              size="sm"
              selectedKeys={new Set([appConfig?.systemCorePath || ''])}
              disallowEmptySelection={systemCorePaths.length > 0}
              isDisabled={loadingPaths}
              onSelectionChange={(v) => {
                const selectedPath = v.currentKey as string
                if (selectedPath) handleConfigChangeWithRestart('systemCorePath', selectedPath)
              }}
            >
              {loadingPaths ? (
                <SelectItem key="">{t('mihomo.searchingCore')}</SelectItem>
              ) : systemCorePaths.length > 0 ? (
                systemCorePaths.map((path) => <SelectItem key={path}>{path}</SelectItem>)
              ) : (
                <SelectItem key="">{t('mihomo.systemCoreNotFound')}</SelectItem>
              )}
            </Select>
            {!loadingPaths && systemCorePaths.length === 0 && (
              <div className="mt-2 text-sm text-warning">{t('mihomo.installCoreFirst')}</div>
            )}
          </SettingItem>
        )}
        <SettingItem title={t('mihomo.runMode')} divider>
          <Tabs
            size="sm"
            color="primary"
            selectedKey={corePermissionMode}
            disabledKeys={['service']}
            onSelectionChange={(key) => handlePermissionModeChange(key as string)}
          >
            <Tab
              key="elevated"
              title={platform === 'win32' ? t('mihomo.taskSchedule') : t('mihomo.authorizedRun')}
            />
            <Tab key="service" title={t('mihomo.systemService')} />
          </Tabs>
        </SettingItem>
        <SettingItem
          title={platform === 'win32' ? t('mihomo.taskStatus') : t('mihomo.permissionStatus')}
          divider
        >
          <Button size="sm" color="primary" onPress={() => setShowPermissionModal(true)}>
            {t('common.manage')}
          </Button>
        </SettingItem>
        <SettingItem title={t('mihomo.serviceStatus')} divider>
          <Button size="sm" color="primary" onPress={() => setShowServiceModal(true)}>
            {t('common.manage')}
          </Button>
        </SettingItem>
        <SettingItem title="IPv6" divider>
          <Switch
            size="sm"
            isSelected={ipv6}
            onValueChange={(v) => onChangeNeedRestart({ ipv6: v })}
          />
        </SettingItem>
        <SettingItem title={t('mihomo.logRetentionDays')} divider>
          <Input
            size="sm"
            type="number"
            className="w-[100px]"
            value={maxLogDays.toString()}
            onValueChange={(v) => patchAppConfig({ maxLogDays: parseInt(v) })}
          />
        </SettingItem>
        <SettingItem title={t('mihomo.logLevel')}>
          <Select
            classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
            className="w-[100px]"
            size="sm"
            selectedKeys={new Set([logLevel])}
            disallowEmptySelection={true}
            onSelectionChange={(v) =>
              onChangeNeedRestart({ 'log-level': v.currentKey as LogLevel })
            }
          >
            <SelectItem key="silent">{t('mihomo.logSilent')}</SelectItem>
            <SelectItem key="error">{t('mihomo.logError')}</SelectItem>
            <SelectItem key="warning">{t('mihomo.logWarning')}</SelectItem>
            <SelectItem key="info">{t('mihomo.logInfo')}</SelectItem>
            <SelectItem key="debug">{t('mihomo.logDebug')}</SelectItem>
          </Select>
        </SettingItem>
      </SettingCard>
      <PortSetting />
      <ControllerSetting />
      <EnvSetting />
      <AdvancedSetting />
    </BasePage>
  )
}

export default Mihomo
