import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { relaunchApp, webdavDelete, webdavRestore } from '@renderer/utils/ipc'
import React, { useState } from 'react'
import { MdDeleteForever } from 'react-icons/md'
import { useTranslation } from 'react-i18next'
interface Props {
  filenames: string[]
  onClose: () => void
}
const WebdavRestoreModal: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { filenames: names, onClose } = props
  const { appConfig: { disableAnimation = false } = {} } = useAppConfig()
  const [filenames, setFilenames] = useState<string[]>(names)
  const [restoring, setRestoring] = useState(false)

  return (
    <Modal
      backdrop={disableAnimation ? 'transparent' : 'blur'}
      disableAnimation={disableAnimation}
      classNames={{ backdrop: 'top-[48px]' }}
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex app-drag">{t('modal.webdavRestore.title')}</ModalHeader>
        <ModalBody>
          {filenames.length === 0 ? (
            <div className="flex justify-center">{t('webdav.restoreSuccess')}</div>
          ) : (
            filenames.map((filename) => (
              <div className="flex" key={filename}>
                <Button
                  size="sm"
                  fullWidth
                  isLoading={restoring}
                  variant="flat"
                  onPress={async () => {
                    setRestoring(true)
                    try {
                      await webdavRestore(filename)
                      await relaunchApp()
                    } catch (e) {
                      alert(`${t('webdav.restoreFailed')}: ${e}`)
                    } finally {
                      setRestoring(false)
                    }
                  }}
                >
                  {filename}
                </Button>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="ml-2"
                  onPress={async () => {
                    try {
                      await webdavDelete(filename)
                      setFilenames(filenames.filter((name) => name !== filename))
                    } catch (e) {
                      alert(`${t('error.unknown')}: ${e}`)
                    }
                  }}
                >
                  <MdDeleteForever className="text-lg" />
                </Button>
              </div>
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="light" onPress={onClose}>
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default WebdavRestoreModal
