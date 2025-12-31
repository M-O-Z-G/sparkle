#!/bin/bash

# Russian
cat src/renderer/src/locales/ru-RU.json | jq '. + {
  "advanced.title": "Дополнительные настройки",
  "advanced.autoLightweight": "Автоматический облегчённый режим",
  "advanced.autoLightweight.help": "Автоматический переход в облегчённый режим после закрытия окна на указанное время",
  "advanced.lightweightBehavior": "Поведение облегчённого режима",
  "advanced.lightweightBehavior.core": "Только ядро",
  "advanced.lightweightBehavior.tray": "Закрыть только рендерер",
  "advanced.autoLightweightDelay": "Задержка автоматического облегчённого режима",
  "advanced.copyEnvType": "Копировать тип переменной окружения",
  "advanced.corePriority": "Приоритет процесса ядра",
  "advanced.corePriority.realtime": "Реальное время",
  "advanced.corePriority.high": "Высокий",
  "advanced.corePriority.aboveNormal": "Выше нормального",
  "advanced.corePriority.normal": "Нормальный",
  "advanced.corePriority.belowNormal": "Ниже нормального",
  "advanced.corePriority.low": "Низкий",
  "advanced.controlDns": "Управление настройками DNS",
  "advanced.controlSniff": "Управление настройками сниффинга доменов",
  "advanced.networkDetection": "Остановка ядра при отключении сети",
  "advanced.networkDetection.help": "При включении приложение автоматически остановит ядро при отключении сети и перезапустит при восстановлении",
  "advanced.networkDetectionInterval": "Интервал обнаружения сети",
  "advanced.networkDetectionBypass": "Обход интерфейсов обнаружения",
  "advanced.pauseSSID": "Прямое подключение для определённых WiFi SSID",
  "advanced.seconds": "секунд"
}' > /tmp/ru-RU.json && mv /tmp/ru-RU.json src/renderer/src/locales/ru-RU.json

# Persian
cat src/renderer/src/locales/fa-IR.json | jq '. + {
  "advanced.title": "تنظیمات پیشرفته",
  "advanced.autoLightweight": "حالت سبک خودکار",
  "advanced.autoLightweight.help": "ورود خودکار به حالت سبک پس از بستن پنجره برای مدت زمان مشخص",
  "advanced.lightweightBehavior": "رفتار حالت سبک",
  "advanced.lightweightBehavior.core": "فقط هسته را نگه دار",
  "advanced.lightweightBehavior.tray": "فقط رندرر را ببند",
  "advanced.autoLightweightDelay": "تاخیر حالت سبک خودکار",
  "advanced.copyEnvType": "کپی نوع متغیر محیطی",
  "advanced.corePriority": "اولویت فرآیند هسته",
  "advanced.corePriority.realtime": "زمان واقعی",
  "advanced.corePriority.high": "بالا",
  "advanced.corePriority.aboveNormal": "بالاتر از عادی",
  "advanced.corePriority.normal": "عادی",
  "advanced.corePriority.belowNormal": "پایین‌تر از عادی",
  "advanced.corePriority.low": "پایین",
  "advanced.controlDns": "کنترل تنظیمات DNS",
  "advanced.controlSniff": "کنترل تنظیمات شناسایی دامنه",
  "advanced.networkDetection": "توقف هسته در قطع شبکه",
  "advanced.networkDetection.help": "با فعال کردن، برنامه به طور خودکار هسته را در صورت قطع شبکه متوقف می‌کند و در بازگشت شبکه مجدداً راه‌اندازی می‌کند",
  "advanced.networkDetectionInterval": "بازه تشخیص شبکه",
  "advanced.networkDetectionBypass": "عبور از رابط‌های تشخیص",
  "advanced.pauseSSID": "اتصال مستقیم در SSID وای‌فای خاص",
  "advanced.seconds": "ثانیه"
}' > /tmp/fa-IR.json && mv /tmp/fa-IR.json src/renderer/src/locales/fa-IR.json

# Chinese
cat src/renderer/src/locales/zh-CN.json | jq '. + {
  "advanced.title": "更多设置",
  "advanced.autoLightweight": "自动开启轻量模式",
  "advanced.autoLightweight.help": "关闭窗口指定时间后自动进入轻量模式",
  "advanced.lightweightBehavior": "轻量模式行为",
  "advanced.lightweightBehavior.core": "仅保留内核",
  "advanced.lightweightBehavior.tray": "仅关闭渲染进程",
  "advanced.autoLightweightDelay": "自动开启轻量模式延时",
  "advanced.copyEnvType": "复制环境变量类型",
  "advanced.corePriority": "内核进程优先级",
  "advanced.corePriority.realtime": "实时",
  "advanced.corePriority.high": "高",
  "advanced.corePriority.aboveNormal": "高于正常",
  "advanced.corePriority.normal": "正常",
  "advanced.corePriority.belowNormal": "低于正常",
  "advanced.corePriority.low": "低",
  "advanced.controlDns": "接管 DNS 设置",
  "advanced.controlSniff": "接管域名嗅探设置",
  "advanced.networkDetection": "断网时停止内核",
  "advanced.networkDetection.help": "开启后，应用会在检测到网络断开时自动停止内核，并在网络恢复后自动重启内核",
  "advanced.networkDetectionInterval": "断网检测间隔",
  "advanced.networkDetectionBypass": "绕过检测的接口",
  "advanced.pauseSSID": "在特定的 WiFi SSID 下直连",
  "advanced.seconds": "秒"
}' > /tmp/zh-CN.json && mv /tmp/zh-CN.json src/renderer/src/locales/zh-CN.json

echo "Translation keys added successfully!"
