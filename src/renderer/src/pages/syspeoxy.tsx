import { Button, Input, Switch, Tab, Tabs, Tooltip } from '@heroui/react'
import BasePage from '@renderer/components/base/base-page'
import SettingCard from '@renderer/components/base/base-setting-card'
import SettingItem from '@renderer/components/base/base-setting-item'
import EditableList from '@renderer/components/base/base-list-editor'
import PacEditorModal from '@renderer/components/sysproxy/pac-editor-modal'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { platform } from '@renderer/utils/init'
import { openUWPTool, triggerSysProxy } from '@renderer/utils/ipc'
import React, { Key, useEffect, useState } from 'react'
import ByPassEditorModal from '@renderer/components/sysproxy/bypass-editor-modal'
import { IoIosHelpCircle } from 'react-icons/io'
import { useTranslation } from 'react-i18next'

const defaultPacScript = `
function FindProxyForURL(url, host) {
  return "PROXY 127.0.0.1:%mixed-port%; SOCKS5 127.0.0.1:%mixed-port%; DIRECT;";
}
`

const Sysproxy: React.FC = () => {
  const { t } = useTranslation()
  const defaultBypass: string[] =
    platform === 'linux'
      ? [
          'localhost',
          '.local',
          '127.0.0.1/8',
          '192.168.0.0/16',
          '10.0.0.0/8',
          '172.16.0.0/12',
          '::1'
        ]
      : platform === 'darwin'
        ? [
            '127.0.0.1/8',
            '192.168.0.0/16',
            '10.0.0.0/8',
            '172.16.0.0/12',
            'localhost',
            '*.local',
            '*.crashlytics.com',
            '<local>'
          ]
        : [
            'localhost',
            '127.*',
            '192.168.*',
            '10.*',
            '172.16.*',
            '172.17.*',
            '172.18.*',
            '172.19.*',
            '172.20.*',
            '172.21.*',
            '172.22.*',
            '172.23.*',
            '172.24.*',
            '172.25.*',
            '172.26.*',
            '172.27.*',
            '172.28.*',
            '172.29.*',
            '172.30.*',
            '172.31.*',
            '<local>'
          ]

  const { appConfig, patchAppConfig } = useAppConfig()
  const { sysProxy, onlyActiveDevice = false } =
    appConfig || ({ sysProxy: { enable: false } } as AppConfig)
  const [changed, setChanged] = useState(false)
  const [values, originSetValues] = useState({
    enable: sysProxy.enable,
    host: sysProxy.host ?? '',
    bypass: sysProxy.bypass ?? defaultBypass,
    mode: sysProxy.mode ?? 'manual',
    pacScript: sysProxy.pacScript ?? defaultPacScript,
    settingMode: sysProxy.settingMode ?? 'exec'
  })
  useEffect(() => {
    originSetValues((prev) => ({
      ...prev,
      enable: sysProxy.enable
    }))
  }, [sysProxy.enable])
  const [openEditor, setOpenEditor] = useState(false)
  const [openPacEditor, setOpenPacEditor] = useState(false)

  const setValues = (v: typeof values): void => {
    originSetValues(v)
    setChanged(true)
  }
  const onSave = async (): Promise<void> => {
    // check valid TODO
    await patchAppConfig({ sysProxy: values })
    setChanged(false)
    if (values.enable) {
      try {
        await triggerSysProxy(values.enable, onlyActiveDevice)
      } catch (e) {
        alert(e)
        await patchAppConfig({ sysProxy: { enable: false } })
      }
    }
  }

  return (
    <BasePage
      title={t('sysproxy.title')}
      header={
        changed && (
          <Button color="primary" className="app-nodrag" size="sm" onPress={onSave}>
            {t('save')}
          </Button>
        )
      }
    >
      {openPacEditor && (
        <PacEditorModal
          script={values.pacScript || defaultPacScript}
          onCancel={() => setOpenPacEditor(false)}
          onConfirm={(script: string) => {
            setValues({ ...values, pacScript: script })
            setOpenPacEditor(false)
          }}
        />
      )}
      {openEditor && (
        <ByPassEditorModal
          bypass={values.bypass}
          onCancel={() => setOpenEditor(false)}
          onConfirm={async (list: string[]) => {
            setOpenEditor(false)
            setValues({
              ...values,
              bypass: list
            })
          }}
        />
      )}
      <SettingCard className="sysproxy-settings">
        <SettingItem title={t('sysproxy.host')} divider>
          <Input
            size="sm"
            className="w-[50%]"
            value={values.host}
            placeholder={t('sysproxy.host.placeholder')}
            onValueChange={(v) => {
              setValues({ ...values, host: v })
            }}
          />
        </SettingItem>
        <SettingItem title={t('sysproxy.mode')} divider>
          <Tabs
            size="sm"
            color="primary"
            selectedKey={values.mode}
            onSelectionChange={(key: Key) => setValues({ ...values, mode: key as SysProxyMode })}
          >
            <Tab key="manual" title={t('sysproxy.mode.manual')} />
            <Tab key="auto" title={t('sysproxy.mode.auto')} />
          </Tabs>
        </SettingItem>
        {platform === 'win32' && (
          <SettingItem title={t('sysproxy.uwp')} divider>
            <Button
              size="sm"
              onPress={async () => {
                await openUWPTool()
              }}
            >
              {t('sysproxy.uwp.open')}
            </Button>
          </SettingItem>
        )}
        {platform == 'darwin' && (
          <>
            <SettingItem title={t('sysproxy.settingMode')} divider>
              <Tabs
                size="sm"
                color="primary"
                selectedKey={values.settingMode}
                onSelectionChange={(key) => {
                  setValues({ ...values, settingMode: key as 'exec' | 'service' })
                }}
              >
                <Tab key="exec" title={t('sysproxy.settingMode.exec')} />
                <Tab key="service" title={t('sysproxy.settingMode.service')} />
              </Tabs>
            </SettingItem>
            <SettingItem
              title={t('sysproxy.onlyActive')}
              actions={
                <Tooltip
                  content={
                    <>
                      <div>{t('sysproxy.onlyActive.tip')}</div>
                    </>
                  }
                >
                  <Button isIconOnly size="sm" variant="light">
                    <IoIosHelpCircle className="text-lg" />
                  </Button>
                </Tooltip>
              }
              divider
            >
              <Switch
                size="sm"
                isSelected={onlyActiveDevice}
                isDisabled={!values.settingMode || values.settingMode !== 'service'}
                onValueChange={(v) => {
                  patchAppConfig({ onlyActiveDevice: v })
                }}
              />
            </SettingItem>
          </>
        )}
        {values.mode === 'auto' && (
          <SettingItem title={t('sysproxy.pac')}>
            <Button size="sm" onPress={() => setOpenPacEditor(true)}>
              {t('sysproxy.pac.edit')}
            </Button>
          </SettingItem>
        )}
        {values.mode === 'manual' && (
          <>
            <SettingItem title={t('sysproxy.bypass.add')} divider>
              <Button
                size="sm"
                onPress={() => {
                  setValues({
                    ...values,
                    bypass: Array.from(new Set([...defaultBypass, ...values.bypass]))
                  })
                }}
              >
                {t('sysproxy.bypass.add')}
              </Button>
            </SettingItem>
            <SettingItem title={t('sysproxy.bypass.list')}>
              <Button
                size="sm"
                onPress={async () => {
                  setOpenEditor(true)
                }}
              >
                {t('edit')}
              </Button>
            </SettingItem>
            <EditableList
              items={values.bypass}
              onChange={(list) => setValues({ ...values, bypass: list as string[] })}
              placeholder={t('sysproxy.bypass.placeholder')}
              divider={false}
            />
          </>
        )}
      </SettingCard>
    </BasePage>
  )
}

export default Sysproxy
