import React, { useState, useEffect } from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import { Button, Input, Select, SelectItem, Switch, Tab, Tabs, Tooltip } from '@heroui/react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import {
  copyEnv,
  patchControledMihomoConfig,
  restartCore,
  startNetworkDetection,
  stopNetworkDetection
} from '@renderer/utils/ipc'
import { platform } from '@renderer/utils/init'
import { IoIosHelpCircle } from 'react-icons/io'
import { BiCopy } from 'react-icons/bi'
import EditableList from '../base/base-list-editor'
import { useTranslation } from 'react-i18next'

const emptyArray: string[] = []

const AdvancedSettings: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const {
    controlDns = true,
    controlSniff = true,
    pauseSSID,
    mihomoCpuPriority = 'PRIORITY_NORMAL',
    autoLightweight = false,
    autoLightweightDelay = 60,
    autoLightweightMode = 'core',
    envType = [platform === 'win32' ? 'powershell' : 'bash'],
    networkDetection = false,
    networkDetectionBypass = ['VMware', 'vEthernet'],
    networkDetectionInterval = 10
  } = appConfig || {}

  const pauseSSIDArray = pauseSSID ?? emptyArray

  const [pauseSSIDInput, setPauseSSIDInput] = useState(pauseSSIDArray)

  const [bypass, setBypass] = useState(networkDetectionBypass)
  const [interval, setInterval] = useState(networkDetectionInterval)

  useEffect(() => {
    setPauseSSIDInput(pauseSSIDArray)
  }, [pauseSSIDArray])

  return (
    <SettingCard title={t('advanced.title')}>
      <SettingItem
        title={t('advanced.autoLightweight')}
        actions={
          <Tooltip content={t('advanced.autoLightweight.help')}>
            <Button isIconOnly size="sm" variant="light">
              <IoIosHelpCircle className="text-lg" />
            </Button>
          </Tooltip>
        }
        divider
      >
        <Switch
          size="sm"
          isSelected={autoLightweight}
          onValueChange={(v) => {
            patchAppConfig({ autoLightweight: v })
          }}
        />
      </SettingItem>
      {autoLightweight && (
        <>
          <SettingItem title={t('advanced.lightweightBehavior')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={autoLightweightMode}
              onSelectionChange={(v) => {
                patchAppConfig({ autoLightweightMode: v as 'core' | 'tray' })
                if (v === 'core') {
                  patchAppConfig({ autoLightweightDelay: Math.max(autoLightweightDelay, 5) })
                }
              }}
            >
              <Tab key="core" title={t('advanced.lightweightBehavior.core')} />
              <Tab key="tray" title={t('advanced.lightweightBehavior.tray')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('advanced.autoLightweightDelay')} divider>
            <Input
              size="sm"
              className="w-[100px]"
              type="number"
              endContent={t('advanced.seconds')}
              value={autoLightweightDelay.toString()}
              onValueChange={async (v: string) => {
                let num = parseInt(v)
                if (isNaN(num)) num = 0
                const minDelay = autoLightweightMode === 'core' ? 5 : 0
                if (num < minDelay) num = minDelay
                await patchAppConfig({ autoLightweightDelay: num })
              }}
            />
          </SettingItem>
        </>
      )}
      <SettingItem
        title={t('advanced.copyEnvType')}
        actions={envType.map((type) => (
          <Button
            key={type}
            title={type}
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => copyEnv(type)}
          >
            <BiCopy className="text-lg" />
          </Button>
        ))}
        divider
      >
        <Select
          classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
          className="w-[150px]"
          size="sm"
          selectionMode="multiple"
          selectedKeys={new Set(envType)}
          disallowEmptySelection={true}
          onSelectionChange={async (v) => {
            try {
              await patchAppConfig({
                envType: Array.from(v) as ('bash' | 'cmd' | 'powershell')[]
              })
            } catch (e) {
              alert(e)
            }
          }}
        >
          <SelectItem key="bash">Bash</SelectItem>
          <SelectItem key="cmd">CMD</SelectItem>
          <SelectItem key="powershell">PowerShell</SelectItem>
          <SelectItem key="nushell">NuShell</SelectItem>
        </Select>
      </SettingItem>
      {platform === 'win32' && (
        <SettingItem title={t('advanced.corePriority')} divider>
          <Select
            classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
            className="w-[150px]"
            size="sm"
            selectedKeys={new Set([mihomoCpuPriority])}
            disallowEmptySelection={true}
            onSelectionChange={async (v) => {
              try {
                await patchAppConfig({
                  mihomoCpuPriority: v.currentKey as Priority
                })
                await restartCore()
              } catch (e) {
                alert(e)
              }
            }}
          >
            <SelectItem key="PRIORITY_HIGHEST">{t('advanced.corePriority.realtime')}</SelectItem>
            <SelectItem key="PRIORITY_HIGH">{t('advanced.corePriority.high')}</SelectItem>
            <SelectItem key="PRIORITY_ABOVE_NORMAL">
              {t('advanced.corePriority.aboveNormal')}
            </SelectItem>
            <SelectItem key="PRIORITY_NORMAL">{t('advanced.corePriority.normal')}</SelectItem>
            <SelectItem key="PRIORITY_BELOW_NORMAL">
              {t('advanced.corePriority.belowNormal')}
            </SelectItem>
            <SelectItem key="PRIORITY_LOW">{t('advanced.corePriority.low')}</SelectItem>
          </Select>
        </SettingItem>
      )}
      <SettingItem title={t('advanced.controlDns')} divider>
        <Switch
          size="sm"
          isSelected={controlDns}
          onValueChange={async (v) => {
            try {
              await patchAppConfig({ controlDns: v })
              await patchControledMihomoConfig({})
              await restartCore()
            } catch (e) {
              alert(e)
            }
          }}
        />
      </SettingItem>
      <SettingItem title={t('advanced.controlSniff')} divider>
        <Switch
          size="sm"
          isSelected={controlSniff}
          onValueChange={async (v) => {
            try {
              await patchAppConfig({ controlSniff: v })
              await patchControledMihomoConfig({})
              await restartCore()
            } catch (e) {
              alert(e)
            }
          }}
        />
      </SettingItem>
      <SettingItem
        title={t('advanced.networkDetection')}
        actions={
          <Tooltip content={t('advanced.networkDetection.help')}>
            <Button isIconOnly size="sm" variant="light">
              <IoIosHelpCircle className="text-lg" />
            </Button>
          </Tooltip>
        }
        divider
      >
        <Switch
          size="sm"
          isSelected={networkDetection}
          onValueChange={(v) => {
            patchAppConfig({ networkDetection: v })
            if (v) {
              startNetworkDetection()
            } else {
              stopNetworkDetection()
            }
          }}
        />
      </SettingItem>
      {networkDetection && (
        <>
          <SettingItem title={t('advanced.networkDetectionInterval')} divider>
            <div className="flex">
              {interval !== networkDetectionInterval && (
                <Button
                  size="sm"
                  color="primary"
                  className="mr-2"
                  onPress={async () => {
                    await patchAppConfig({ networkDetectionInterval: interval })
                    await startNetworkDetection()
                  }}
                >
                  {t('confirm')}
                </Button>
              )}
              <Input
                size="sm"
                type="number"
                className="w-[100px]"
                endContent={t('advanced.seconds')}
                value={interval.toString()}
                min={1}
                onValueChange={(v) => {
                  setInterval(parseInt(v))
                }}
              />
            </div>
          </SettingItem>
          <SettingItem title={t('advanced.networkDetectionBypass')}>
            {bypass.length != networkDetectionBypass.length && (
              <Button
                size="sm"
                color="primary"
                onPress={async () => {
                  await patchAppConfig({ networkDetectionBypass: bypass })
                  await startNetworkDetection()
                }}
              >
                {t('confirm')}
              </Button>
            )}
          </SettingItem>
          <EditableList items={bypass} onChange={(list) => setBypass(list as string[])} />
        </>
      )}
      <SettingItem title={t('advanced.pauseSSID')}>
        {pauseSSIDInput.join('') !== pauseSSIDArray.join('') && (
          <Button
            size="sm"
            color="primary"
            onPress={() => {
              patchAppConfig({ pauseSSID: pauseSSIDInput })
            }}
          >
            {t('confirm')}
          </Button>
        )}
      </SettingItem>
      <EditableList
        items={pauseSSIDInput}
        onChange={(list) => setPauseSSIDInput(list as string[])}
        divider={false}
      />
    </SettingCard>
  )
}

export default AdvancedSettings
