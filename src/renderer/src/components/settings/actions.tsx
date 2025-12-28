import { Button, Tooltip } from '@heroui/react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import {
  checkUpdate,
  createHeapSnapshot,
  quitApp,
  quitWithoutCore,
  resetAppConfig,
  cancelUpdate
} from '@renderer/utils/ipc'
import { useState, useEffect } from 'react'
import UpdaterModal from '../updater/updater-modal'
import { version } from '@renderer/utils/init'
import { IoIosHelpCircle } from 'react-icons/io'
import { startTour } from '@renderer/utils/driver'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../base/base-confirm'
import { useTranslation } from 'react-i18next'

const Actions: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [newVersion, setNewVersion] = useState('')
  const [changelog, setChangelog] = useState('')
  const [openUpdate, setOpenUpdate] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{
    downloading: boolean
    progress: number
    error?: string
  }>({
    downloading: false,
    progress: 0
  })

  useEffect(() => {
    const handleUpdateStatus = (
      _: Electron.IpcRendererEvent,
      status: typeof updateStatus
    ): void => {
      setUpdateStatus(status)
    }

    window.electron.ipcRenderer.on('update-status', handleUpdateStatus)

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('update-status')
    }
  }, [])

  const handleCancelUpdate = async (): Promise<void> => {
    try {
      await cancelUpdate()
      setUpdateStatus({ downloading: false, progress: 0 })
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      {openUpdate && (
        <UpdaterModal
          onClose={() => setOpenUpdate(false)}
          version={newVersion}
          changelog={changelog}
          updateStatus={updateStatus}
          onCancel={handleCancelUpdate}
        />
      )}
      {confirmOpen && (
        <ConfirmModal
          onChange={setConfirmOpen}
          title={t('actions.resetApp.confirm.title')}
          description={
            <>
              {t('actions.resetApp.confirm.description').replace('⚠️ ', '')}
              <span className="text-red-500">
                {t('actions.resetApp.confirm.description').includes('操作不可撤销')
                  ? t('actions.resetApp.confirm.description').split('，')[1]
                  : ''}
              </span>
            </>
          }
          confirmText={t('actions.resetApp')}
          cancelText={t('cancel')}
          onConfirm={resetAppConfig}
        />
      )}
      <SettingCard>
        <SettingItem title={t('actions.openTour')} divider>
          <Button size="sm" onPress={() => startTour(navigate)}>
            {t('actions.openTour')}
          </Button>
        </SettingItem>
        <SettingItem title={t('actions.checkUpdate')} divider>
          <Button
            size="sm"
            isLoading={checkingUpdate}
            onPress={async () => {
              try {
                setCheckingUpdate(true)
                const version = await checkUpdate()
                if (version) {
                  setNewVersion(version.version)
                  setChangelog(version.changelog)
                  setOpenUpdate(true)
                } else {
                  new window.Notification(t('actions.checkUpdate.latest'), {
                    body: t('actions.checkUpdate.noUpdate')
                  })
                }
              } catch (e) {
                alert(e)
              } finally {
                setCheckingUpdate(false)
              }
            }}
          >
            {t('actions.checkUpdate')}
          </Button>
        </SettingItem>
        <SettingItem
          title={t('actions.resetApp')}
          actions={
            <Tooltip content={t('actions.resetApp.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
          divider
        >
          <Button size="sm" onPress={() => setConfirmOpen(true)}>
            {t('actions.resetApp')}
          </Button>
        </SettingItem>
        <SettingItem
          title={t('actions.clearCache')}
          actions={
            <Tooltip content={t('actions.clearCache.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
          divider
        >
          <Button size="sm" onPress={() => localStorage.clear()}>
            {t('actions.clearCache')}
          </Button>
        </SettingItem>
        <SettingItem
          title={t('actions.createHeapSnapshot')}
          actions={
            <Tooltip content={t('actions.createHeapSnapshot.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
          divider
        >
          <Button size="sm" onPress={createHeapSnapshot}>
            {t('actions.createHeapSnapshot')}
          </Button>
        </SettingItem>
        <SettingItem
          title={t('actions.quitWithoutCore')}
          actions={
            <Tooltip content={t('actions.quitWithoutCore.help')}>
              <Button isIconOnly size="sm" variant="light">
                <IoIosHelpCircle className="text-lg" />
              </Button>
            </Tooltip>
          }
          divider
        >
          <Button size="sm" onPress={quitWithoutCore}>
            {t('quit')}
          </Button>
        </SettingItem>
        <SettingItem title={t('actions.quitApp')} divider>
          <Button size="sm" onPress={quitApp}>
            {t('actions.quitApp')}
          </Button>
        </SettingItem>
        <SettingItem title={t('actions.appVersion')}>
          <div>v{version}</div>
        </SettingItem>
      </SettingCard>
    </>
  )
}

export default Actions
