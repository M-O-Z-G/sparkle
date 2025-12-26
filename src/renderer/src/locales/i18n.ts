import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './en-US.json'
import ruRU from './ru-RU.json'
import faIR from './fa-IR.json'
import zhCN from './zh-CN.json'

const resources = {
  'en-US': { translation: enUS },
  'ru-RU': { translation: ruRU },
  'fa-IR': { translation: faIR },
  'zh-CN': { translation: zhCN }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
