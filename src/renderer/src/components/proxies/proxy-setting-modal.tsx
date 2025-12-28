import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs
} from '@heroui/react'
import React, { useState, useEffect } from 'react'
import SettingItem from '../base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import debounce from '@renderer/utils/debounce'
import { useTranslation } from 'react-i18next'

interface Props {
  onClose: () => void
}

const ProxySettingModal: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { onClose } = props
  const { appConfig, patchAppConfig } = useAppConfig()

  const {
    proxyCols = 'auto',
    proxyDisplayOrder = 'default',
    groupDisplayLayout = 'single',
    proxyDisplayLayout = 'double',
    autoCloseConnection = true,
    delayTestUrl,
    delayTestConcurrency,
    delayTestTimeout
  } = appConfig || {}

  const [url, setUrl] = useState(delayTestUrl ?? '')

  const setUrlDebounce = debounce((v: string) => {
    patchAppConfig({ delayTestUrl: v })
  }, 500)

  useEffect(() => {
    setUrl(delayTestUrl ?? '')
  }, [delayTestUrl])

  return (
    <Modal
      backdrop="blur"
      classNames={{ backdrop: 'top-[48px]' }}
      size="xl"
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent className="flag-emoji">
        <ModalHeader className="flex pb-0">{t('proxies.settings')}</ModalHeader>
        <ModalBody className="py-2 gap-1">
          <SettingItem title={t('proxies.cols')} divider>
            <Select
              classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
              className="w-[150px]"
              size="sm"
              selectedKeys={new Set([proxyCols])}
              disallowEmptySelection={true}
              onSelectionChange={async (v) => {
                await patchAppConfig({ proxyCols: v.currentKey as 'auto' | '1' | '2' | '3' | '4' })
              }}
            >
              <SelectItem key="auto">{t('proxies.cols.auto')}</SelectItem>
              <SelectItem key="1">1</SelectItem>
              <SelectItem key="2">2</SelectItem>
              <SelectItem key="3">3</SelectItem>
              <SelectItem key="4">4</SelectItem>
            </Select>
          </SettingItem>
          <SettingItem title={t('proxies.sort')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={proxyDisplayOrder}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  proxyDisplayOrder: v as 'default' | 'delay' | 'name'
                })
              }}
            >
              <Tab key="default" title={t('proxies.sort.default')} />
              <Tab key="delay" title={t('proxies.sort.delay')} />
              <Tab key="name" title={t('proxies.sort.name')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('proxies.layout')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={groupDisplayLayout}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  groupDisplayLayout: v as 'hidden' | 'single' | 'double'
                })
              }}
            >
              <Tab key="hidden" title={t('proxies.layout.hidden')} />
              <Tab key="single" title={t('proxies.layout.single')} />
              <Tab key="double" title={t('proxies.layout.double')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('proxies.layout')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={proxyDisplayLayout}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  proxyDisplayLayout: v as 'hidden' | 'single' | 'double'
                })
              }}
            >
              <Tab key="hidden" title={t('proxies.layout.hidden')} />
              <Tab key="single" title={t('proxies.layout.single')} />
              <Tab key="double" title={t('proxies.layout.double')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('advanced.autoCloseConnection')} divider>
            <Switch
              size="sm"
              isSelected={autoCloseConnection}
              onValueChange={(v) => {
                patchAppConfig({ autoCloseConnection: v })
              }}
            />
          </SettingItem>
          <SettingItem title={t('advanced.delayTestUrl')} divider>
            <Input
              size="sm"
              className="w-[60%]"
              value={url}
              placeholder="默认 https://www.gstatic.com/generate_204"
              onValueChange={(v) => {
                setUrl(v)
                setUrlDebounce(v)
              }}
            />
          </SettingItem>
          <SettingItem title={t('advanced.delayTestConcurrency')} divider>
            <Input
              type="number"
              size="sm"
              className="w-[100px]"
              value={delayTestConcurrency?.toString()}
              placeholder="默认 50"
              onValueChange={(v) => {
                patchAppConfig({ delayTestConcurrency: parseInt(v) })
              }}
            />
          </SettingItem>
          <SettingItem title={t('advanced.delayTestTimeout')}>
            <Input
              type="number"
              size="sm"
              className="w-[100px]"
              value={delayTestTimeout?.toString()}
              placeholder="默认 5000"
              onValueChange={(v) => {
                patchAppConfig({ delayTestTimeout: parseInt(v) })
              }}
            />
          </SettingItem>
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

export default ProxySettingModal
