import React, { useState } from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import EditableList from '../base/base-list-editor'
import { Switch } from '@heroui/react'
import { isValidDnsServer, isValidDomainWildcard } from '@renderer/utils/validate'
import { useTranslation } from 'react-i18next'

interface AdvancedDnsSettingProps {
  respectRules: boolean
  directNameserver: string[]
  proxyServerNameserver: string[]
  nameserverPolicy: Record<string, string | string[]>
  hosts?: IHost[]
  useHosts: boolean
  useSystemHosts: boolean
  onRespectRulesChange: (v: boolean) => void
  onDirectNameserverChange: (list: string[]) => void
  onProxyNameserverChange: (list: string[]) => void
  onNameserverPolicyChange: (policy: Record<string, string | string[]>) => void
  onUseSystemHostsChange: (v: boolean) => void
  onUseHostsChange: (v: boolean) => void
  onHostsChange: (hosts: IHost[]) => void
  onErrorChange?: (hasError: boolean) => void
}

const AdvancedDnsSetting: React.FC<AdvancedDnsSettingProps> = ({
  respectRules,
  directNameserver,
  proxyServerNameserver,
  nameserverPolicy,
  hosts,
  useHosts,
  useSystemHosts,
  onRespectRulesChange,
  onDirectNameserverChange,
  onProxyNameserverChange,
  onNameserverPolicyChange,
  onUseSystemHostsChange,
  onUseHostsChange,
  onHostsChange,
  onErrorChange
}) => {
  const { t } = useTranslation()
  const [directNameserverError, setDirectNameserverError] = useState<string | null>(null)
  const [proxyNameserverError, setProxyNameserverError] = useState<string | null>(null)
  const [nameserverPolicyError, setNameserverPolicyError] = useState<string | null>(null)
  const [hostsError, setHostsError] = useState<string | null>(null)

  React.useEffect(() => {
    const hasError = Boolean(
      directNameserverError || proxyNameserverError || nameserverPolicyError || hostsError
    )
    onErrorChange?.(hasError)
  }, [
    directNameserverError,
    proxyNameserverError,
    nameserverPolicyError,
    hostsError,
    onErrorChange
  ])

  return (
    <SettingCard title={t('dns.advanced.title')}>
      <SettingItem title={t('dns.respectRules')} divider>
        <Switch
          size="sm"
          isSelected={respectRules}
          isDisabled={proxyServerNameserver.length === 0}
          onValueChange={onRespectRulesChange}
        />
      </SettingItem>
      <EditableList
        title={t('dns.directNameserver')}
        items={directNameserver}
        validate={(part) => isValidDnsServer(part as string)}
        onChange={(list) => {
          const arr = list as string[]
          onDirectNameserverChange(arr)
          const firstInvalid = arr.find((f) => !isValidDnsServer(f).ok)
          setDirectNameserverError(
            firstInvalid ? (isValidDnsServer(firstInvalid).error ?? t('error.format')) : null
          )
        }}
        placeholder={t('dns.exampleServer')}
      />
      <EditableList
        title={t('dns.proxyServerNameserver')}
        items={proxyServerNameserver}
        validate={(part) => isValidDnsServer(part as string)}
        onChange={(list) => {
          const arr = list as string[]
          onProxyNameserverChange(arr)
          const firstInvalid = arr.find((f) => !isValidDnsServer(f).ok)
          setProxyNameserverError(
            firstInvalid ? (isValidDnsServer(firstInvalid).error ?? t('error.format')) : null
          )
        }}
        placeholder={t('dns.exampleServer')}
      />

      <EditableList
        title={t('dns.nameserverPolicy')}
        items={nameserverPolicy}
        validatePart1={(part1) => isValidDomainWildcard(part1)}
        validatePart2={(part2) => {
          const parts = part2
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
          for (const p of parts) {
            const result = isValidDnsServer(p)
            if (!result.ok) {
              return result
            }
          }
          return { ok: true }
        }}
        onChange={(newValue) => {
          onNameserverPolicyChange(newValue as Record<string, string | string[]>)
          try {
            const rec = newValue as Record<string, string | string[]>
            for (const domain of Object.keys(rec)) {
              if (!isValidDomainWildcard(domain).ok) {
                setNameserverPolicyError(isValidDomainWildcard(domain).error ?? t('error.format'))
                return
              }
            }
            for (const v of Object.values(rec)) {
              if (Array.isArray(v)) {
                for (const vv of v) {
                  if (!isValidDnsServer(vv).ok) {
                    setNameserverPolicyError(isValidDnsServer(vv).error ?? t('error.format'))
                    return
                  }
                }
              } else {
                const parts = (v as string)
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean)
                for (const p of parts) {
                  if (!isValidDnsServer(p).ok) {
                    setNameserverPolicyError(isValidDnsServer(p).error ?? t('error.format'))
                    return
                  }
                }
              }
            }
            setNameserverPolicyError(null)
          } catch (e) {
            setNameserverPolicyError(t('error.format'))
          }
        }}
        placeholder={t('dns.domainPlaceholder')}
        part2Placeholder={t('dns.serverPlaceholder')}
        objectMode="record"
      />
      <SettingItem title={t('dns.useSystemHosts')} divider>
        <Switch size="sm" isSelected={useSystemHosts} onValueChange={onUseSystemHostsChange} />
      </SettingItem>
      <SettingItem title={t('dns.customHosts')}>
        <Switch size="sm" isSelected={useHosts} onValueChange={onUseHostsChange} />
      </SettingItem>
      {useHosts && (
        <EditableList
          items={hosts ? Object.fromEntries(hosts.map((h) => [h.domain, h.value])) : {}}
          validatePart1={(part1) => isValidDomainWildcard(part1)}
          onChange={(rec) => {
            const hostArr: IHost[] = Object.entries(rec as Record<string, string | string[]>).map(
              ([domain, value]) => ({
                domain,
                value: value as string | string[]
              })
            )
            onHostsChange(hostArr)
            for (const domain of Object.keys(rec as Record<string, string | string[]>)) {
              if (!isValidDomainWildcard(domain).ok) {
                setHostsError(isValidDomainWildcard(domain).error ?? t('error.format'))
                return
              }
            }
            setHostsError(null)
          }}
          placeholder={t('dns.domainPlaceholder')}
          part2Placeholder={t('dns.hostPlaceholder')}
          objectMode="record"
          divider={false}
        />
      )}
    </SettingCard>
  )
}

export default AdvancedDnsSetting
