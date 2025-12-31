#!/bin/bash

# Add all remaining missing translation keys

# English
cat src/renderer/src/locales/en-US.json | jq '. + {
  "proxies.groupSettings": "Proxy Group Settings",
  "proxies.cols": "Columns",
  "proxies.groupLayout": "Group Layout",
  "proxies.proxyLayout": "Proxy Layout",
  "advanced.delayTestUrl.placeholder": "Default: https://www.gstatic.com/generate_204",
  "advanced.delayTestConcurrency.placeholder": "Default: 50",
  "advanced.delayTestTimeout.placeholder": "Default: 5000",
  "profiles.searchPlaceholder": "Search profiles",
  "mihomo.logRetentionDays": "Log Retention Days",
  "mihomo.taskStatus": "Task Status",
  "mihomo.taskSchedule": "Task Schedule",
  "mihomo.environment": "Environment Variables"
}' > /tmp/en-US.json && mv /tmp/en-US.json src/renderer/src/locales/en-US.json

# Russian
cat src/renderer/src/locales/ru-RU.json | jq '. + {
  "proxies.groupSettings": "Настройки группы прокси",
  "proxies.cols": "Колонки",
  "proxies.groupLayout": "Макет группы",
  "proxies.proxyLayout": "Макет прокси",
  "advanced.delayTestUrl.placeholder": "По умолчанию: https://www.gstatic.com/generate_204",
  "advanced.delayTestConcurrency.placeholder": "По умолчанию: 50",
  "advanced.delayTestTimeout.placeholder": "По умолчанию: 5000",
  "profiles.searchPlaceholder": "Поиск профилей",
  "mihomo.logRetentionDays": "Дни хранения логов",
  "mihomo.taskStatus": "Статус задачи",
  "mihomo.taskSchedule": "Расписание задачи",
  "mihomo.environment": "Переменные окружения"
}' > /tmp/ru-RU.json && mv /tmp/ru-RU.json src/renderer/src/locales/ru-RU.json

# Persian
cat src/renderer/src/locales/fa-IR.json | jq '. + {
  "proxies.groupSettings": "تنظیمات گروه پروکسی",
  "proxies.cols": "ستون‌ها",
  "proxies.groupLayout": "چیدمان گروه",
  "proxies.proxyLayout": "چیدمان پروکسی",
  "advanced.delayTestUrl.placeholder": "پیش‌فرض: https://www.gstatic.com/generate_204",
  "advanced.delayTestConcurrency.placeholder": "پیش‌فرض: 50",
  "advanced.delayTestTimeout.placeholder": "پیش‌فرض: 5000",
  "profiles.searchPlaceholder": "جستجوی پروفایل‌ها",
  "mihomo.logRetentionDays": "روزهای نگهداری گزارش",
  "mihomo.taskStatus": "وضعیت وظیفه",
  "mihomo.taskSchedule": "برنامه وظیفه",
  "mihomo.environment": "متغیرهای محیطی"
}' > /tmp/fa-IR.json && mv /tmp/fa-IR.json src/renderer/src/locales/fa-IR.json

# Chinese
cat src/renderer/src/locales/zh-CN.json | jq '. + {
  "proxies.groupSettings": "代理组设置",
  "proxies.cols": "列数",
  "proxies.groupLayout": "组布局",
  "proxies.proxyLayout": "代理布局",
  "advanced.delayTestUrl.placeholder": "默认 https://www.gstatic.com/generate_204",
  "advanced.delayTestConcurrency.placeholder": "默认 50",
  "advanced.delayTestTimeout.placeholder": "默认 5000",
  "profiles.searchPlaceholder": "搜索订阅",
  "mihomo.logRetentionDays": "日志保留天数",
  "mihomo.taskStatus": "任务状态",
  "mihomo.taskSchedule": "任务计划",
  "mihomo.environment": "环境变量"
}' > /tmp/zh-CN.json && mv /tmp/zh-CN.json src/renderer/src/locales/zh-CN.json

echo "All remaining translation keys added!"
