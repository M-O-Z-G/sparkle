import React, { useState } from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import { Button, Switch, Tab, Tabs, Tooltip, Select, SelectItem } from '@heroui/react'
import useSWR from 'swr'
import { checkAutoRun, disableAutoRun, enableAutoRun, relaunchApp } from '@renderer/utils/ipc'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { IoIosHelpCircle } from 'react-icons/io'
import ConfirmModal from '../base/base-confirm'
import { useTranslation } from 'react-i18next'

const GeneralConfig: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { data: enable, mutate: mutateEnable } = useSWR('checkAutoRun', checkAutoRun)
  const { appConfig, patchAppConfig } = useAppConfig()
  const {
    silentStart = false,
    autoCheckUpdate,
    updateChannel = 'stable',
    language = 'en-US',
    disableGPU = false,
    disableAnimation = false
  } = appConfig || {}

  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [pendingDisableGPU, setPendingDisableGPU] = useState(disableGPU)

  return (
    <>
      {showRestartConfirm && (
        <ConfirmModal
          title={t('general.restartConfirm.title')}
          description={
            <div>
              <p>{t('general.restartConfirm.description')}</p>
            </div>
          }
          confirmText={t('restart')}
          cancelText={t('cancel')}
          onChange={(open) => {
            if (!open) {
              setPendingDisableGPU(disableGPU)
            }
            setShowRestartConfirm(open)
          }}
          onConfirm={async () => {
            await patchAppConfig({ disableGPU: pendingDisableGPU })
            if (!pendingDisableGPU) {
              await patchAppConfig({ disableAnimation: false })
            }
            await relaunchApp()
          }}
        />
      )}
      <SettingCard>
        <SettingItem title={t('settings.language')} divider>
          <Select
            classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
            className="w-[150px]"
            size="sm"
            selectedKeys={[language]}
            aria-label={t('settings.language')}
            onSelectionChange={async (v) => {
              const newLang = Array.from(v)[0] as 'en-US' | 'zh-CN' | 'ru-RU' | 'fa-IR'
              await patchAppConfig({ language: newLang })
              i18n.changeLanguage(newLang)
            }}
          >
            <SelectItem key="en-US">English</SelectItem>
            <SelectItem key="zh-CN">简体中文</SelectItem>
            <SelectItem key="ru-RU">Русский</SelectItem>
            <SelectItem key="fa-IR">فارسی</SelectItem>
          </Select>
        </SettingItem>
        <SettingItem title={t('general.autoStart')} divider>
          <Switch
            size="sm"
            isSelected={enable}
            onValueChange={async (v) => {
              try {
                if (v) {
                  await enableAutoRun()
                } else {
                  await disableAutoRun()
                }
              } catch (e) {
                alert(e)
              } finally {
                mutateEnable()
              }
            }}
          />
        </SettingItem>
        <SettingItem title={t('general.silentStart')} divider>
          <Switch
            size="sm"
            isSelected={silentStart}
            onValueChange={(v) => {
              patchAppConfig({ silentStart: v })
            }}
          />
        </SettingItem>
        <SettingItem title={t('general.autoCheckUpdate')} divider>
          <Switch
            size="sm"
            isSelected={autoCheckUpdate}
            onValueChange={(v) => {
              patchAppConfig({ autoCheckUpdate: v })
            }}
          />
        </SettingItem>
        <SettingItem title={t('general.updateChannel')} divider>
          <Tabs
            size="sm"
            color="primary"
            selectedKey={updateChannel}
            onSelectionChange={async (v) => {
              patchAppConfig({ updateChannel: v as 'stable' | 'beta' })
            }}
          >
            <Tab key="stable" title={t('general.updateChannel.stable')} />
            <Tab key="beta" title={t('general.updateChannel.beta')} />
          </Tabs>
        </SettingItem>

        <SettingItem
          title={t('general.disableGPU')}
          actions={
            <Tooltip content={t('general.disableGPU.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
          divider
        >
          <Switch
            size="sm"
            isSelected={pendingDisableGPU}
            onValueChange={(v) => {
              setPendingDisableGPU(v)
              setShowRestartConfirm(true)
            }}
          />
        </SettingItem>
        <SettingItem
          title={t('general.disableAnimation')}
          actions={
            <Tooltip content={t('general.disableAnimation.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
        >
          <Switch
            size="sm"
            isSelected={disableAnimation}
            onValueChange={(v) => {
              patchAppConfig({ disableAnimation: v })
            }}
          />
        </SettingItem>
      </SettingCard>
    </>
  )
}

export default GeneralConfig
