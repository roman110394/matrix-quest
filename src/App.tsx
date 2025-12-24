import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  Lock,
  Trophy,
  Zap,
  Server,
  Shield,
  Package,
  Globe,
  Key,
  User,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

// === Типы ===
type Difficulty = 'easy' | 'normal' | 'hard' | 'ultra';
type ProgressData = {
  playerName: string;
  serverIP: string;
  serverPassword: string;
  checkboxes: Record<string, boolean>;
  completedDifficulties: Difficulty[];
  startedAt: string | null;
};
type Step = {
  id: string;
  text: string;
  command?: string;
  hint?: string;
};
type Quest = {
  id: string;
  chapter: 1 | 2 | 3 | 4;
  title: string;
  icon: any;
  description: string;
  achievement: { id: string; name: string; desc: string };
  steps: Step[];
};

// === Хранилище прогресса ===
const ProgressStorage = {
  get: (): ProgressData => {
    const data = localStorage.getItem('matrixQuestProgress');
    return data
      ? JSON.parse(data)
      : {
          playerName: '',
          serverIP: '',
          serverPassword: '',
          checkboxes: {},
          completedDifficulties: [],
          startedAt: null,
        };
  },
  save: (data: ProgressData) => {
    localStorage.setItem('matrixQuestProgress', JSON.stringify(data));
  },
};

// === Данные квестов ===
const questsData: Quest[] = [
  // === Глава 1: Основы ===
  {
    id: 'quest_1_1',
    chapter: 1,
    title: 'Квест 1.1: Первый вход по SSH',
    icon: Server,
    description: 'Подключись к серверу и не облажайся',
    achievement: { id: 'first_ssh', name: 'SSH Master', desc: 'Успешно подключился к серверу' },
    steps: [
      { id: 'step_1', text: 'Открыл терминал (Linux/macOS) или PuTTY (Windows)', hint: 'На Windows качай PuTTY с официального сайта' },
      { id: 'step_2', text: 'Подключился по SSH: ssh root@МОЙ_IP', command: 'ssh root@ВАШ_IP_АДРЕС' },
      { id: 'step_3', text: 'Ввёл пароль (он не отображается при вводе — это нормально)', hint: 'Пароль вводится вслепую, просто печатай и жми Enter' },
      { id: 'step_4', text: 'Вижу приветствие сервера (Welcome to Ubuntu...)', command: 'apt update && apt upgrade -y' },
      { id: 'step_5', text: 'Обновил систему командой выше', command: 'apt install -y curl wget nano htop ufw git' },
      { id: 'step_6', text: 'Установил базовые инструменты', hint: 'Эти утилиты пригодятся на всех этапах' },
    ],
  },
  {
    id: 'quest_1_2',
    chapter: 1,
    title: 'Квест 1.2: Защищаем периметр',
    icon: Shield,
    description: 'Настрой firewall, чтобы хакеры не зашли в гости',
    achievement: { id: 'firewall_master', name: 'Firewall Guardian', desc: 'Настроил защиту сервера' },
    steps: [
      { id: 'step_1', text: 'Разрешил SSH (чтобы не заблокировать себя)', command: 'ufw allow 22/tcp' },
      { id: 'step_2', text: 'Разрешил HTTP и HTTPS', command: 'ufw allow 80/tcp\nufw allow 443/tcp' },
      { id: 'step_3', text: 'Разрешил Matrix federation порт', command: 'ufw allow 8448/tcp' },
      { id: 'step_4', text: 'Включил firewall', command: 'ufw enable' },
      { id: 'step_5', text: 'Проверил статус (должно быть "Status: active")', command: 'ufw status', hint: 'Должны быть видны все разрешённые порты' },
    ],
  },
  {
    id: 'quest_1_3',
    chapter: 1,
    title: 'Квест 1.3: Ставим Docker',
    icon: Package,
    description: 'Установи Docker — твой швейцарский нож',
    achievement: { id: 'docker_master', name: 'Docker Apprentice', desc: 'Освоил контейнеризацию' },
    steps: [
      { id: 'step_1', text: 'Скачал и запустил установщик Docker', command: 'curl -fsSL https://get.docker.com -o get-docker.sh\nsh get-docker.sh' },
      { id: 'step_2', text: 'Добавил Docker в автозагрузку', command: 'systemctl enable docker' },
      { id: 'step_3', text: 'Установил Docker Compose', command: 'apt install -y docker-compose' },
      { id: 'step_4', text: 'Проверил версии (должны показаться номера)', command: 'docker --version\ndocker-compose --version', hint: 'Должно быть что-то вроде Docker version 24.x' },
    ],
  },
  {
    id: 'quest_1_4',
    chapter: 1,
    title: 'Квест 1.4: Настраиваем домен',
    icon: Globe,
    description: 'Дай серверу человеческое имя',
    achievement: { id: 'dns_wizard', name: 'DNS Wizard', desc: 'Настроил DNS-записи' },
    steps: [
      { id: 'step_1', text: 'Купил домен (или использую бесплатный)', hint: 'Можно использовать afraid.org или другие бесплатные DNS' },
      { id: 'step_2', text: 'Создал A-запись: matrix.твой.домен → IP сервера', hint: 'В панели регистратора добавь A-запись' },
      { id: 'step_3', text: 'Создал A-запись: element.твой.домен → IP сервера', hint: 'Это будет для веб-интерфейса' },
      { id: 'step_4', text: 'Подождал 5-10 минут обновления DNS', hint: 'DNS не обновляется мгновенно, нужно терпение' },
      { id: 'step_5', text: 'Проверил командой ping (должен показать IP)', command: 'ping matrix.твой.домен', hint: 'Замени "твой.домен" на реальный домен' },
    ],
  },
  {
    id: 'quest_1_5',
    chapter: 1,
    title: 'Квест 1.5: Matrix Synapse',
    icon: Zap,
    description: 'Разворачиваем сердце мессенджера',
    achievement: { id: 'matrix_architect', name: 'Matrix Architect', desc: 'Развернул Matrix Synapse' },
    steps: [
      { id: 'step_1', text: 'Создал папку проекта', command: 'mkdir -p /opt/matrix\ncd /opt/matrix' },
      { id: 'step_2', text: 'Создал docker-compose.yml (скопировал конфиг)', command: 'nano docker-compose.yml', hint: 'Вставь конфиг из инструкции, замени ПАРОЛЬ и ДОМЕН' },
      { id: 'step_3', text: 'Сгенерировал конфигурацию Synapse', command: 'docker-compose run --rm synapse generate' },
      { id: 'step_4', text: 'Отредактировал homeserver.yaml (database + registration)', command: 'nano ./synapse-data/homeserver.yaml', hint: 'Найди секции database и enable_registration' },
      { id: 'step_5', text: 'Запустил контейнеры', command: 'docker-compose up -d' },
      { id: 'step_6', text: 'Проверил статус (оба контейнера "Up")', command: 'docker-compose ps', hint: 'Должны быть matrix-postgres и matrix-synapse' },
    ],
  },
  {
    id: 'quest_1_6',
    chapter: 1,
    title: 'Квест 1.6: HTTPS сертификаты',
    icon: Key,
    description: 'Включаем шифрование связи',
    achievement: { id: 'https_hero', name: 'HTTPS Hero', desc: 'Настроил SSL-сертификаты' },
    steps: [
      { id: 'step_1', text: 'Установил Nginx и Certbot', command: 'apt install -y nginx certbot python3-certbot-nginx' },
      { id: 'step_2', text: 'Создал конфиг Nginx для Matrix', command: 'nano /etc/nginx/sites-available/matrix', hint: 'Скопируй конфиг из инструкции' },
      { id: 'step_3', text: 'Активировал конфиг', command: 'ln -s /etc/nginx/sites-available/matrix /etc/nginx/sites-enabled/\nnginx -t\nsystemctl reload nginx' },
      { id: 'step_4', text: 'Получил SSL-сертификат от Let\'s Encrypt', command: 'certbot --nginx -d matrix.твой.домен', hint: 'Введи email и согласись с условиями' },
      { id: 'step_5', text: 'Проверил HTTPS (должен вернуть JSON)', command: 'curl https://matrix.твой.домен/_matrix/client/versions', hint: 'Должен показать список версий API' },
    ],
  },
  {
    id: 'quest_1_7',
    chapter: 1,
    title: 'Квест 1.7: Первый пользователь',
    icon: User,
    description: 'Создай админа (это ты, Лёня)',
    achievement: { id: 'admin_created', name: 'Server Administrator', desc: 'Создал первого пользователя' },
    steps: [
      { id: 'step_1', text: 'Запустил команду создания пользователя', command: 'docker exec -it matrix-synapse register_new_matrix_user -u admin -p ТВОЙ_ПАРОЛЬ -a -c /data/homeserver.yaml http://localhost:8008', hint: 'Замени ТВОЙ_ПАРОЛЬ на сложный пароль' },
      { id: 'step_2', text: 'Увидел сообщение "Success!"', hint: 'Если ошибка - проверь, запущен ли контейнер' },
      { id: 'step_3', text: 'Записал свои учётные данные в надёжное место', hint: 'Username: admin, Password: твой пароль, Server: matrix.твой.домен' },
    ],
  },
  {
    id: 'quest_1_8',
    chapter: 1,
    title: 'Квест 1.8: Element Web',
    icon: MessageSquare,
    description: 'Запускаем красивый интерфейс',
    achievement: { id: 'element_master', name: 'Element Master', desc: 'Развернул веб-интерфейс' },
    steps: [
      { id: 'step_1', text: 'Добавил Element в docker-compose.yml', command: 'nano /opt/matrix/docker-compose.yml', hint: 'Добавь секцию element из инструкции' },
      { id: 'step_2', text: 'Создал конфиг Element', command: 'nano /opt/matrix/element-config.json', hint: 'Не забудь заменить домен на свой' },
      { id: 'step_3', text: 'Создал Nginx конфиг для Element', command: 'nano /etc/nginx/sites-available/element' },
      { id: 'step_4', text: 'Активировал конфиг и получил SSL', command: 'ln -s /etc/nginx/sites-available/element /etc/nginx/sites-enabled/\ncertbot --nginx -d element.твой.домен\nsystemctl reload nginx' },
      { id: 'step_5', text: 'Перезапустил все контейнеры', command: 'cd /opt/matrix\ndocker-compose up -d' },
      { id: 'step_6', text: 'Открыл https://element.твой.домен в браузере', hint: 'Должна открыться страница Element' },
      { id: 'step_7', text: 'Залогинился своим пользователем (admin)', hint: 'Username: admin, Password: твой пароль' },
      { id: 'step_8', text: 'СОЗДАЛ ПЕРВУЮ КОМНАТУ!', hint: 'Поздравляю! Ты прошёл всю первую главу!' },
    ],
  },
  // === Глава 2: Hard Mode ===
  {
    id: 'quest_2_1',
    chapter: 2,
    title: 'Квест 2.1: Включаем федерацию',
    icon: Globe,
    description: 'Твой сервер теперь дружит с тысячами других по всему миру',
    achievement: { id: 'federation_master', name: 'Federation Lord', desc: 'Присоединился к глобальной Matrix-сети' },
    steps: [
      { id: 'step_1', text: 'Открыл homeserver.yaml', command: 'nano /opt/matrix/synapse-data/homeserver.yaml' },
      { id: 'step_2', text: 'Убедился, что enable_federation: true (по умолчанию включено)' },
      { id: 'step_3', text: 'Перезапустил Synapse', command: 'cd /opt/matrix && docker-compose restart synapse' },
      { id: 'step_4', text: 'Проверил федерацию', command: 'curl https://matrix.твой.домен/_matrix/federation/v1/version', hint: 'Должен вернуть JSON с версией' },
      { id: 'step_5', text: 'Зашёл на federationtester.matrix.org → ввёл свой домен', hint: 'Все галочки зелёные — федерация работает!' },
      { id: 'step_6', text: 'Пригласил друга с matrix.org в комнату — он зашёл!', hint: 'Ты теперь часть глобальной сети!' },
    ],
  },
  {
    id: 'quest_2_2',
    chapter: 2,
    title: 'Квест 2.2: Бридж в Telegram',
    icon: MessageSquare,
    description: 'Друзья из Telegram пишут прямо в твои Matrix-комнаты',
    achievement: { id: 'telegram_bridge', name: 'Bridge Engineer', desc: 'Соединил Telegram с Matrix' },
    steps: [
      { id: 'step_1', text: 'Создал бота в @BotFather и получил токен' },
      { id: 'step_2', text: 'Добавил mautrix-telegram в docker-compose.yml' },
      { id: 'step_3', text: 'Запустил контейнер', command: 'docker-compose up -d mautrix-telegram' },
      { id: 'step_4', text: 'В Element → Настройки → Labs → Включил "mautrix-telegram"' },
      { id: 'step_5', text: 'Авторизовался через QR-код в Telegram' },
      { id: 'step_6', text: 'Порталил любимый канал/группу в Matrix', hint: 'Теперь всё в одном месте!' },
    ],
  },
  {
    id: 'quest_2_3',
    chapter: 2,
    title: 'Квест 2.3: Бридж в Discord',
    icon: MessageSquare,
    description: 'Твой Discord-сервер теперь живёт в Matrix',
    achievement: { id: 'discord_bridge', name: 'Discord Overlord', desc: 'Соединил Discord с Matrix' },
    steps: [
      { id: 'step_1', text: 'Создал приложение и бота на discord.com/developers' },
      { id: 'step_2', text: 'Добавил mautrix-discord в docker-compose.yml' },
      { id: 'step_3', text: 'Запустил контейнер', command: 'docker-compose up -d mautrix-discord' },
      { id: 'step_4', text: 'В Element → Настройки → Привязал Discord-аккаунт' },
      { id: 'step_5', text: 'Порталил свой Discord-сервер в Matrix', hint: 'Голосовые каналы тоже работают!' },
    ],
  },
  {
    id: 'quest_2_4',
    chapter: 2,
    title: 'Квест 2.4: Бридж в WhatsApp',
    icon: MessageSquare,
    description: 'Твой личный WhatsApp теперь в Element',
    achievement: { id: 'whatsapp_bridge', name: 'WhatsApp Whisperer', desc: 'Соединил WhatsApp с Matrix' },
    steps: [
      { id: 'step_1', text: 'Добавил mautrix-whatsapp в docker-compose.yml' },
      { id: 'step_2', text: 'Запустил контейнер', command: 'docker-compose up -d mautrix-whatsapp' },
      { id: 'step_3', text: 'В Element → Настройки → Labs → Включил "mautrix-whatsapp"' },
      { id: 'step_4', text: 'Отсканировал QR-код своим WhatsApp' },
      { id: 'step_5', text: 'Писал в личку и группы — всё работает!', hint: 'Даже голосовые сообщения!' },
    ],
  },
  {
    id: 'quest_2_5',
    chapter: 2,
    title: 'Квест 2.5: Своё облачное хранилище',
    icon: Package,
    description: 'Больше никаких ограничений на файлы',
    achievement: { id: 'storage_king', name: 'Storage Sovereign', desc: 'Поднял неограниченное хранилище медиа' },
    steps: [
      { id: 'step_1', text: 'Выбрал хранилище: Backblaze B2 / Wasabi / Hetzner Storage Box / MinIO' },
      { id: 'step_2', text: 'Создал аккаунт и бакет' },
      { id: 'step_3', text: 'Получил access_key и secret_key' },
      { id: 'step_4', text: 'Отредактировал homeserver.yaml — добавил секцию media_storage' },
      { id: 'step_5', text: 'Перезапустил Synapse', command: 'docker-compose restart synapse' },
      { id: 'step_6', text: 'Отправил 1 ГБ файл — он загрузился!', hint: 'Теперь можно хоть 4K-видео, хоть бэкапы' },
    ],
  },
  {
    id: 'quest_2_6',
    chapter: 2,
    title: 'Квест 2.6: Закрываем регистрацию',
    icon: Lock,
    description: 'Только ты решаешь, кто входит в бункер',
    achievement: { id: 'gatekeeper', name: 'Gatekeeper', desc: 'Получил полный контроль над пользователями' },
    steps: [
      { id: 'step_1', text: 'Отредактировал homeserver.yaml' },
      { id: 'step_2', text: 'Установил enable_registration: false' },
      { id: 'step_3', text: 'Перезапустил Synapse' },
      { id: 'step_4', text: 'Попытался зарегистрироваться — не получилось', hint: 'Теперь только ты создаёшь пользователей вручную' },
      { id: 'step_5', text: 'Создал пользователя для друга командой register_new_matrix_user' },
    ],
  },
  {
    id: 'quest_2_7',
    chapter: 2,
    title: 'Квест 2.7: Кастомизация Element',
    icon: MessageSquare,
    description: 'Теперь это не Element, а ТВОЙ мессенджер',
    achievement: { id: 'brand_master', name: 'Brand Architect', desc: 'Сделал уникальный интерфейс' },
    steps: [
      { id: 'step_1', text: 'Отредактировал element-config.json' },
      { id: 'step_2', text: 'Изменил brand, default_theme, logo' },
      { id: 'step_3', text: 'Добавил своё приветствие на главной' },
      { id: 'step_4', text: 'Перезапустил Element', command: 'docker-compose restart element' },
      { id: 'step_5', text: 'Открыл element.твой.домен — увидел свой бренд!', hint: 'Теперь это "Лёнин Бункер" или "КиберКазарма"' },
    ],
  },
  {
    id: 'quest_2_8',
    chapter: 2,
    title: 'Квест 2.8: Боты и автоматизация',
    icon: Zap,
    description: 'Твой бункер теперь живёт своей жизнью',
    achievement: { id: 'bot_lord', name: 'Bot Lord', desc: 'Добавил умных помощников' },
    steps: [
      { id: 'step_1', text: 'Выбрал бота: mjolnir (модерация), honoroit (приветствия), rss-bot и т.д.' },
      { id: 'step_2', text: 'Добавил бота в docker-compose.yml' },
      { id: 'step_3', text: 'Настроил права и комнаты' },
      { id: 'step_4', text: 'Протестировал — бот отвечает!', hint: 'Теперь авто-модерация, новости, напоминания' },
      { id: 'step_5', text: 'Поздравляю! Ты прошёл Hard Mode!' },
    ],
  },
  // === Глава 3: Ultra Hard Mode ===
  {
    id: 'quest_3_1',
    chapter: 3,
    title: 'Квест 3.1: Мониторинг (Prometheus + Grafana)',
    icon: Zap,
    description: 'Теперь ты всегда знаешь, жив ли сервер',
    achievement: { id: 'monitoring_master', name: 'Observer', desc: 'Поднял мониторинг и алерты' },
    steps: [
      { id: 'step_1', text: 'Добавил Prometheus и Grafana в docker-compose.yml' },
      { id: 'step_2', text: 'Настроил сбор метрик Synapse и PostgreSQL' },
      { id: 'step_3', text: 'Импортировал готовые дашборды Matrix' },
      { id: 'step_4', text: 'Настроил алерты в Telegram/Discord', hint: 'Alertmanager + webhook' },
      { id: 'step_5', text: 'Провалил тестовый алерт — получил уведомление!', hint: 'Теперь ты не проспишь падение' },
    ],
  },
  {
    id: 'quest_3_2',
    chapter: 3,
    title: 'Квест 3.2: Централизованные логи (Loki)',
    icon: Package,
    description: 'Всё, что происходит — записывается навечно',
    achievement: { id: 'logging_master', name: 'Archivist', desc: 'Собрал все логи в одном месте' },
    steps: [
      { id: 'step_1', text: 'Добавил Loki + Promtail в стек' },
      { id: 'step_2', text: 'Настроил вывод логов всех контейнеров в Loki' },
      { id: 'step_3', text: 'Открыл Grafana → Explore → нашёл лог по запросу' },
      { id: 'step_4', text: 'Настроил retention 90 дней', hint: 'Логи хранятся 3 месяца' },
    ],
  },
  {
    id: 'quest_3_3',
    chapter: 3,
    title: 'Квест 3.3: Автоматические бэкапы',
    icon: Shield,
    description: 'Даже если сервер сгорит — данные живы',
    achievement: { id: 'backup_master', name: 'Survivor', desc: 'Настроил disaster recovery' },
    steps: [
      { id: 'step_1', text: 'Создал скрипт дампа PostgreSQL и медиа' },
      { id: 'step_2', text: 'Настроил cron на ежедневный бэкап' },
      { id: 'step_3', text: 'Шифровал архивы GPG' },
      { id: 'step_4', text: 'Загружал бэкапы в Hetzner Storage Box / Backblaze' },
      { id: 'step_5', text: 'Протестировал восстановление на тестовом сервере', hint: 'Всё встало за 20 минут!' },
    ],
  },
  {
    id: 'quest_3_4',
    chapter: 3,
    title: 'Квест 3.4: Высокая доступность (HA)',
    icon: Server,
    description: 'Один сервер упал — второй взял нагрузку',
    achievement: { id: 'ha_master', name: 'Immortal', desc: 'Построил отказоустойчивый кластер' },
    steps: [
      { id: 'step_1', text: 'Поднял второй сервер в другой стране' },
      { id: 'step_2', text: 'Настроил репликацию PostgreSQL (streaming)' },
      { id: 'step_3', text: 'Поставил Traefik/HAProxy с health-check' },
      { id: 'step_4', text: 'Настроил автоматический failover' },
      { id: 'step_5', text: 'Выключил первый сервер — клиенты даже не заметили!', hint: 'Доступность 99.99%' },
    ],
  },
  {
    id: 'quest_3_5',
    chapter: 3,
    title: 'Квест 3.5: Защита от DDoS и брутфорса',
    icon: Shield,
    description: 'Твой бункер выдержит любую атаку',
    achievement: { id: 'defense_master', name: 'Fortress Builder', desc: 'Сделал сервер неприступным' },
    steps: [
      { id: 'step_1', text: 'Поставил Cloudflare с "Under Attack" mode' },
      { id: 'step_2', text: 'Добавил CrowdSec + Fail2Ban' },
      { id: 'step_3', text: 'Настроил rate-limiting в Nginx' },
      { id: 'step_4', text: 'Включил geo-блокировку (по желанию)' },
      { id: 'step_5', text: 'Провёл тестовую атаку — всё отразилось!', hint: 'CrowdSec забанил IP автоматически' },
    ],
  },
  {
    id: 'quest_3_6',
    chapter: 3,
    title: 'Квест 3.6: Скрытность и обфускация',
    icon: Key,
    description: 'Тебя не найдут, даже если будут искать',
    achievement: { id: 'stealth_master', name: 'Ghost', desc: 'Скрыл сервер от сканирования' },
    steps: [
      { id: 'step_1', text: 'Убрал заголовки Server и X-Powered-By' },
      { id: 'step_2', text: 'Сменил порт federation с 8448 на 443' },
      { id: 'step_3', text: 'Добавил .onion-адрес через Tor' },
      { id: 'step_4', text: 'Настроил доступ только через Cloudflare' },
      { id: 'step_5', text: 'Проверил на shodan.io — сервер не виден!', hint: 'Полная невидимость' },
    ],
  },
  {
    id: 'quest_3_7',
    chapter: 3,
    title: 'Квест 3.7: Автообновления',
    icon: Zap,
    description: 'Сервер обновляется сам, пока ты спишь',
    achievement: { id: 'autoupdate_master', name: 'Self-Healer', desc: 'Включил автоматическое обновление' },
    steps: [
      { id: 'step_1', text: 'Добавил Watchtower в docker-compose.yml' },
      { id: 'step_2', text: 'Настроил обновление только stable-образов' },
      { id: 'step_3', text: 'Включил уведомления о обновлениях' },
      { id: 'step_4', text: 'Watchtower обновил образ — контейнер перезапустился сам!' },
    ],
  },
  {
    id: 'quest_3_8',
    chapter: 3,
    title: 'Квест 3.8: Полная автоматизация (Ansible/Terraform)',
    icon: Globe,
    description: 'Новый сервер — одной командой',
    achievement: { id: 'automation_master', name: 'Infrastructure God', desc: 'Автоматизировал весь деплой' },
    steps: [
      { id: 'step_1', text: 'Написал Ansible playbook / Terraform модуль' },
      { id: 'step_2', text: 'Всё от VDS до Matrix разворачивается одной командой' },
      { id: 'step_3', text: 'Протестировал на новом сервере — всё встало за 15 минут' },
      { id: 'step_4', text: 'Добавил в README: "ansible-playbook site.yml — и готово"' },
      { id: 'step_5', text: 'Поздравляю! Ты прошёл Ultra Hard Mode!' },
    ],
  },
  // === Глава 4: God Mode ===
  {
    id: 'quest_4_1',
    chapter: 4,
    title: 'Квест 4.1: Mesh-сеть (Yggdrasil)',
    icon: Globe,
    description: 'Доступ к бункеру даже при полном отключении интернета',
    achievement: { id: 'mesh_master', name: 'Mesh Weaver', desc: 'Построил сеть поверх сети' },
    steps: [
      { id: 'step_1', text: 'Установил Yggdrasil на сервер и свой компьютер' },
      { id: 'step_2', text: 'Получил уникальный Yggdrasil-IP (200::/7)' },
      { id: 'step_3', text: 'Подключился к серверу по Yggdrasil-IP' },
      { id: 'step_4', text: 'Протестировал — работает без обычного интернета!', hint: 'Даже если РКН всё заблокирует — ты внутри' },
    ],
  },
  {
    id: 'quest_4_2',
    chapter: 4,
    title: 'Квест 4.2: .onion-адрес для Matrix',
    icon: Key,
    description: 'Твой мессенджер теперь в даркнете',
    achievement: { id: 'onion_master', name: 'Shadow Operator', desc: 'Скрыл сервер в Tor' },
    steps: [
      { id: 'step_1', text: 'Установил Tor на сервер' },
      { id: 'step_2', text: 'Настроил hidden service для портов 80 и 8448' },
      { id: 'step_3', text: 'Получил .onion-адрес' },
      { id: 'step_4', text: 'Открыл Element через Tor Browser — всё работает!' },
      { id: 'step_5', text: 'Поделился .onion с другом — он зашёл анонимно', hint: 'Полная приватность' },
    ],
  },
  {
    id: 'quest_4_3',
    chapter: 4,
    title: 'Квест 4.3: Zero Trust доступ',
    icon: Shield,
    description: 'Никто не войдёт без твоего разрешения',
    achievement: { id: 'zerotrust_master', name: 'Gatekeeper Supreme', desc: 'Внедрил Zero Trust' },
    steps: [
      { id: 'step_1', text: 'Поднял Authelia или OAuth2-Proxy' },
      { id: 'step_2', text: 'Включил 2FA (TOTP или WebAuthn)' },
      { id: 'step_3', text: 'Настроил политику: только доверенные устройства' },
      { id: 'step_4', text: 'Попытался зайти без 2FA — не пустило', hint: 'Даже с паролем — доступ закрыт' },
    ],
  },
  {
    id: 'quest_4_4',
    chapter: 4,
    title: 'Квест 4.4: Децентрализованное хранилище (IPFS)',
    icon: Package,
    description: 'Файлы живы вечно, даже без твоего сервера',
    achievement: { id: 'ipfs_master', name: 'Content Sovereign', desc: 'Распределил медиа по сети' },
    steps: [
      { id: 'step_1', text: 'Поднял IPFS-нод на сервере' },
      { id: 'step_2', text: 'Настроил Synapse на хранение медиа в IPFS' },
      { id: 'step_3', text: 'Отправил фото — получил CID' },
      { id: 'step_4', text: 'Выключил сервер — фото открылось через public gateway!', hint: 'ipfs.io/ipfs/CID...' },
    ],
  },
  {
    id: 'quest_4_5',
    chapter: 4,
    title: 'Квест 4.5: Самоподписанные сертификаты + DANE/TLSA',
    icon: Key,
    description: 'Независимость от Let\'s Encrypt и CA',
    achievement: { id: 'dane_master', name: 'Crypto Sovereign', desc: 'Ушёл от централизованных CA' },
    steps: [
      { id: 'step_1', text: 'Сгенерировал свой корневой сертификат' },
      { id: 'step_2', text: 'Добавил TLSA-запись в DNS (через DNSSEC)' },
      { id: 'step_3', text: 'Настроил Nginx на свой сертификат' },
      { id: 'step_4', text: 'Проверил в браузере — зелёный замок без предупреждений', hint: 'Только твоя подпись доверяется' },
    ],
  },
  {
    id: 'quest_4_6',
    chapter: 4,
    title: 'Квест 4.6: Offline-first Element',
    icon: MessageSquare,
    description: 'Мессенджер работает без интернета',
    achievement: { id: 'offline_master', name: 'Resilient Communicator', desc: 'Сделал Element автономным' },
    steps: [
      { id: 'step_1', text: 'Настроил PWA и Service Worker в Element' },
      { id: 'step_2', text: 'Включил кэширование сообщений и комнат' },
      { id: 'step_3', text: 'Выключил интернет — открыл Element — всё на месте!' },
      { id: 'step_4', text: 'Подключился обратно — сообщения синхронизировались', hint: 'Как в Telegram, но свой' },
    ],
  },
  {
    id: 'quest_4_7',
    chapter: 4,
    title: 'Квест 4.7: Собственный бридж',
    icon: Zap,
    description: 'Ты сам решаешь, с чем соединять Matrix',
    achievement: { id: 'custom_bridge_master', name: 'Bridge Architect', desc: 'Написал свой бридж' },
    steps: [
      { id: 'step_1', text: 'Выбрал сервис (Slack, Signal, IRC — что угодно)' },
      { id: 'step_2', text: 'Написал бридж на Python/Go с matrix-nio/mautrix' },
      { id: 'step_3', text: 'Добавил в docker-compose.yml' },
      { id: 'step_4', text: 'Подключил — сообщения пошли в обе стороны!', hint: 'Теперь ты бог интеграций' },
    ],
  },
  {
    id: 'quest_4_8',
    chapter: 4,
    title: 'Квест 4.8: Цифровое бессмертие',
    icon: Trophy,
    description: 'Твой бункер переживёт тебя',
    achievement: { id: 'immortal', name: 'Digital Immortal', desc: 'Твой мессенджер живёт вечно' },
    steps: [
      { id: 'step_1', text: 'Настроил репликацию на 3+ континента' },
      { id: 'step_2', text: 'Добавил cold storage бэкапов в Arweave/Sia' },
      { id: 'step_3', text: 'Написал "завещание": инструкцию по восстановлению' },
      { id: 'step_4', text: 'Поделился ключами с доверенными' },
      { id: 'step_5', text: 'Поздравляю! Ты стал бессмертным в цифровом мире.' },
    ],
  },
];

// === Компоненты ===
const WelcomePage: React.FC<{ onStart: (data: { name: string; serverIP: string; serverPassword: string }) => void }> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [serverIP, setServerIP] = useState('');
  const [serverPassword, setServerPassword] = useState('');
  const handleStart = () => {
    if (name.trim() && serverIP.trim() && serverPassword.trim()) {
      onStart({ name, serverIP, serverPassword });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
              ПОЗДРАВЛЯЕМ, ЛЁНЯ!
            </h1>
            <div className="text-xl text-gray-300 space-y-2">
              <p>Ты получил в подарок:</p>
              <div className="space-y-1 text-cyan-400">
                <p>Доступ к VDS-серверу</p>
                <p>Интерактивный курс по созданию мессенджера</p>
                <p>Полную цифровую свободу</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Твоё имя (для персонализации):</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Леонид" className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">IP-адрес сервера:</label>
              <input type="text" value={serverIP} onChange={(e) => setServerIP(e.target.value)} placeholder="95.216.123.45" className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Пароль root:</label>
              <input type="password" value={serverPassword} onChange={(e) => setServerPassword(e.target.value)} placeholder="Введи пароль от сервера" className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors font-mono" />
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-300">
              <p className="font-semibold mb-1">Важно:</p>
              <p>Сохрани эти данные в надёжном месте! Они понадобятся для подключения к серверу.</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={!name.trim() || !serverIP.trim() || !serverPassword.trim()}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            НАЧАТЬ КВЕСТ 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

const ProloguePage: React.FC<{ playerName: string; onContinue: () => void }> = ({ playerName, onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6">
            ПРОЛОГ: ДОБРО ПОЖАЛОВАТЬ В БУДУЩЕЕ, {playerName.toUpperCase()}
          </h1>
          <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
            <p>Слушай, {playerName}. Знаешь, что самое смешное в 2025-м? Мы живём в эпоху, когда твои сообщения читают больше народу, чем твои посты в соцсетях. Алгоритмы, корпорации, три буквы из разных стран — все хотят знать, как дела у тебя и твоей бабушки.</p>
            <p>Помнишь старый добрый интернет? Когда можно было поднять свой сервер в подвале, и никто не спрашивал разрешения? Так вот, <span className="text-cyan-400 font-semibold">это время вернулось</span>.</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-6">
              <h3 className="text-2xl font-bold text-red-400 mb-4">Железный занавес 2.0</h3>
              <p>Мы живём в мире, где:</p>
              <ul className="space-y-2 text-red-300">
                <li>• Telegram могут заблокировать за завтраком</li>
                <li>• WhatsApp читает метаданные (и не только) на обед</li>
                <li>• Discord продаёт твои предпочтения рекламодателям на ужин</li>
              </ul>
            </div>
            <p className="text-xl font-semibold text-cyan-400">
              Твоя миссия, {playerName}, если ты решишь её принять — поднять <span className="text-purple-400">свой личный мессенджер</span>.
            </p>
            <p className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 my-6">
              ТВОЙ. СУВЕРЕННЫЙ. НЕПРОБИВАЕМЫЙ.
            </p>
            <p className="text-sm text-gray-400 italic">Это не паранойя, {playerName}. Это цифровая гигиена.</p>
          </div>
          <button onClick={onContinue} className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all transform hover:scale-105">
            ПРИНЯТЬ МИССИЮ →
          </button>
        </div>
      </div>
    </div>
  );
};

const DifficultySelect: React.FC<{
  playerName: string;
  onChoose: (diff: Difficulty) => void;
  completed: Difficulty[];
}> = ({ playerName, onChoose, completed = [] }) => {
  const levels = [
    { value: 'easy', label: '🟢 Easy — Новичок', desc: 'Глава 1: Основы Matrix', title: 'Junior DevOps Engineer' },
    { value: 'normal', label: '🟡 Normal — Продвинутый', desc: 'Глава 2: Бриджи, федерация, S3', title: 'Mid-level Matrix Operator' },
    { value: 'hard', label: '🟠 Hard — Профессионал', desc: 'Глава 3: Мониторинг, HA, защита', title: 'Senior Self-Hosted Sovereign' },
    { value: 'ultra', label: '🔴 Ultra — Легенда', desc: 'Глава 4: God Mode — бессмертие', title: 'Digital Immortal' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 text-center">
          ВЫБЕРИ УРОВЕНЬ, {playerName.toUpperCase()}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChoose(level.value as Difficulty)}
              className="relative p-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl hover:scale-105 transition-all shadow-lg border border-purple-500/30"
            >
              {completed.includes(level.value as Difficulty) && (
                <div className="absolute top-4 right-4">
                  <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                </div>
              )}
              <h3 className="text-3xl font-bold mb-4 text-white">{level.label}</h3>
              <p className="text-lg text-gray-300 mb-2">{level.desc}</p>
              <p className="text-sm text-cyan-400 italic">По завершению: {level.title} 🏆</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-slate-900 rounded-lg p-4 border border-purple-500/30 my-2">
      <pre className="text-cyan-400 font-mono text-sm overflow-x-auto">{code}</pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  );
};

const QuestStep: React.FC<{
  step: Step;
  questId: string;
  checked: boolean;
  onToggle: (questId: string, stepId: string) => void;
}> = ({ step, questId, checked, onToggle }) => {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
      <label className="flex items-start space-x-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(questId, step.id)}
          className="mt-1 w-5 h-5 rounded border-purple-500/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-800"
        />
        <div className="flex-1">
          <span className={`text-gray-300 ${checked ? 'line-through opacity-50' : ''}`}>{step.text}</span>
          {step.command && <CodeBlock code={step.command} />}
          {step.hint && <p className="text-sm text-yellow-400 mt-2">💡 {step.hint}</p>}
        </div>
      </label>
    </div>
  );
};

const QuestCard: React.FC<{
  quest: Quest;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  checkboxes: Record<string, boolean>;
  onToggleStep: (questId: string, stepId: string) => void;
}> = ({ quest, isUnlocked, isCompleted, progress, checkboxes, onToggleStep }) => {
  const [isExpanded, setIsExpanded] = useState(isCompleted || progress > 0);
  const Icon = quest.icon;
  if (!isUnlocked) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 opacity-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-700 rounded-lg p-3">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-500">{quest.title}</h3>
              <p className="text-sm text-gray-600">Заблокировано — заверши предыдущий квест</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`bg-slate-800/50 rounded-xl p-6 border ${isCompleted ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-purple-500/30'} transition-all`}>
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-4">
          <div className={`rounded-lg p-3 ${isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
            {isCompleted ? <Trophy className="w-6 h-6 text-green-400" /> : <Icon className="w-6 h-6 text-cyan-400" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{quest.title}</h3>
            <p className="text-sm text-gray-400">{quest.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Прогресс</div>
            <div className="text-lg font-bold text-cyan-400">{Math.round(progress)}%</div>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-6 space-y-4">
          {quest.steps.map((step) => (
            <QuestStep
              key={step.id}
              step={step}
              questId={quest.id}
              checked={checkboxes[`${quest.id}_${step.id}`] || false}
              onToggle={onToggleStep}
            />
          ))}
          {isCompleted && (
            <div className="mt-8 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-lg p-6 text-center">
              <Trophy className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-green-400">{quest.achievement.name}</div>
              <div className="text-gray-300">{quest.achievement.desc}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// === Главный компонент ===
export default function App() {
  const [gameState, setGameState] = useState<'welcome' | 'prologue' | 'difficulty' | 'quests'>('welcome');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [progress, setProgress] = useState<ProgressData>(ProgressStorage.get());
  const [headerClickCount, setHeaderClickCount] = useState(0);
  const [snowEnabled, setSnowEnabled] = useState(true);

  // === Переключение снега ===
  const toggleSnow = () => {
    const newValue = !snowEnabled;
    setSnowEnabled(newValue);
    localStorage.setItem('show_snow', String(newValue));

    // управление внешним скриптом
    if (typeof (window as any).toggleSnow === 'function') {
      (window as any).toggleSnow(newValue);
    }
  };

  // === Сохранение прогресса ===
  useEffect(() => {
    ProgressStorage.save(progress);
  }, [progress]);

  // === Инициализация снега при загрузке ===
  useEffect(() => {
    const saved = localStorage.getItem('show_snow');
    const enabled = saved === null ? true : saved === 'true';

    setSnowEnabled(enabled);

    // синхронизация с внешним скриптом
    if (typeof (window as any).toggleSnow === 'function') {
      (window as any).toggleSnow(enabled);
    }
  }, []);

  const handleStart = ({ name, serverIP, serverPassword }: { name: string; serverIP: string; serverPassword: string }) => {
    const newProgress: ProgressData = {
      ...progress,
      playerName: name,
      serverIP,
      serverPassword,
      startedAt: new Date().toISOString(),
    };
    setProgress(newProgress);
    setGameState('prologue');
  };

  const handlePrologueContinue = () => setGameState('difficulty');

  const handleDifficultyChoose = (diff: Difficulty) => {
    setCurrentDifficulty(diff);
    setGameState('quests');
  };

  const playSound = (type: 'check' | 'victory' | 'pop') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'check') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(900, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.start();
      osc.stop(audioContext.currentTime + 0.2);
    } else if (type === 'victory') {
      const notes = [600, 800, 1000, 1200, 1500];
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          osc.start();
          osc.stop(audioContext.currentTime + 0.4);
        }, index * 100);
      });
      setTimeout(() => {
        [800, 1000, 1200].forEach(freq => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          gain.gain.value = 0.15;
          osc.start();
          osc.stop(audioContext.currentTime + 0.8);
        });
      }, 500);
    } else if (type === 'pop') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 500;
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      osc.start();
      osc.stop(audioContext.currentTime + 0.05);
    }
  };

  const handleToggleStep = (questId: string, stepId: string) => {
    const key = `${questId}_${stepId}`;
    const wasChecked = progress.checkboxes[key];
    setProgress((prev) => ({
      ...prev,
      checkboxes: {
        ...prev.checkboxes,
        [key]: !wasChecked,
      },
    }));
    if (!wasChecked) {
      playSound('check');
    }
  };

  const calculateQuestProgress = (quest: Quest): number => {
    const total = quest.steps.length;
    const completed = quest.steps.filter((step) => progress.checkboxes[`${quest.id}_${step.id}`]).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const isQuestCompleted = (quest: Quest) => calculateQuestProgress(quest) === 100;

  const isQuestUnlocked = (index: number, quests: Quest[]) => index === 0 || isQuestCompleted(quests[index - 1]);

  const getQuestsForDifficulty = (diff: Difficulty): Quest[] => {
    if (diff === 'easy') return questsData.filter(q => q.chapter === 1);
    if (diff === 'normal') return questsData.filter(q => q.chapter === 2);
    if (diff === 'hard') return questsData.filter(q => q.chapter === 3);
    if (diff === 'ultra') return questsData.filter(q => q.chapter === 4);
    return [];
  };

  const visibleQuests = currentDifficulty ? getQuestsForDifficulty(currentDifficulty) : [];
  const totalProgress = visibleQuests.length > 0
    ? visibleQuests.reduce((acc, q) => acc + calculateQuestProgress(q), 0) / visibleQuests.length
    : 0;

  const getChapterName = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'Глава 1: Основы';
      case 'normal': return 'Глава 2: Экосистема';
      case 'hard': return 'Глава 3: Отказоустойчивость';
      case 'ultra': return 'Глава 4: God Mode';
      default: return '';
    }
  };

  const getTitleForDifficulty = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'Junior DevOps Engineer 🏆';
      case 'normal': return 'Mid-level Matrix Operator 🏆';
      case 'hard': return 'Senior Self-Hosted Sovereign 🏆';
      case 'ultra': return 'Digital Immortal 🏆';
      default: return '';
    }
  };

  const allLevelsCompleted = ['easy', 'normal', 'hard', 'ultra'].every(level =>
    progress.completedDifficulties.includes(level as Difficulty)
  );

  const completeCurrentChapter = () => {
    if (!currentDifficulty) return;
    const quests = getQuestsForDifficulty(currentDifficulty);
    const newCheckboxes: Record<string, boolean> = { ...progress.checkboxes };
    quests.forEach(quest => {
      quest.steps.forEach(step => {
        newCheckboxes[`${quest.id}_${step.id}`] = true;
      });
    });
    setProgress(prev => ({
      ...prev,
      checkboxes: newCheckboxes,
    }));
    playSound('victory');
  };

  const handleHeaderClick = () => {
    setHeaderClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        completeCurrentChapter();
        return 0;
      }
      return newCount;
    });
  };

  useEffect(() => {
    if (totalProgress === 100 && currentDifficulty) {
      playSound('victory');
    }
  }, [totalProgress]);

  useEffect(() => {
    if (currentDifficulty) {
      playSound('pop');
    }
  }, [currentDifficulty]);

  useEffect(() => {
    if (totalProgress === 100 && currentDifficulty && !progress.completedDifficulties.includes(currentDifficulty)) {
      setProgress(prev => ({
        ...prev,
        completedDifficulties: [...prev.completedDifficulties, currentDifficulty]
      }));
    }
  }, [totalProgress, currentDifficulty, progress.completedDifficulties]);

  if (gameState === 'welcome') return <WelcomePage onStart={handleStart} />;
  if (gameState === 'prologue') return <ProloguePage playerName={progress.playerName} onContinue={handlePrologueContinue} />;
  if (gameState === 'difficulty') return <DifficultySelect playerName={progress.playerName} onChoose={handleDifficultyChoose} completed={progress.completedDifficulties || []} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Снег — плавное вкл/выкл */}
      <div
        className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-1000 ease-in-out ${
          snowEnabled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Хедер */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setGameState('difficulty')}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Вернуться к выбору уровня
              </button>
              <div>
                <h1
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer select-none"
                  onClick={handleHeaderClick}
                >
                  Matrix Quest: Цифровой Бункер
                </h1>
                <p className="text-sm text-gray-400">Привет, {progress.playerName || 'Гость'}!</p>
                {headerClickCount > 0 && headerClickCount < 5 && (
                  <p className="text-xs text-yellow-400 mt-1">Ещё {5 - headerClickCount} клика для теста...</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleSnow}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full text-white font-bold shadow-2xl hover:scale-110 transition-all transform hover:rotate-6 duration-300"
              >
                {snowEnabled ? (
                  <>
                    <span className="text-3xl">🥶</span> Хватит мёрзнуть!
                  </>
                ) : (
                  <>
                    <span className="text-3xl">🎅</span> Давай метель!
                  </>
                )}
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-400">Прогресс уровня</div>
                <div className="text-2xl font-bold text-cyan-400">{Math.round(totalProgress)}%</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Твои учётные данные</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">IP-адрес:</div>
              <div className="font-mono text-white bg-slate-900/50 px-3 py-2 rounded">{progress.serverIP || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Пароль root:</div>
              <div className="font-mono text-white bg-slate-900/50 px-3 py-2 rounded">••••••••</div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            {currentDifficulty ? getChapterName(currentDifficulty) : ''}
          </h2>
          {visibleQuests.map((quest, index) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isUnlocked={isQuestUnlocked(index, visibleQuests)}
              isCompleted={isQuestCompleted(quest)}
              progress={calculateQuestProgress(quest)}
              checkboxes={progress.checkboxes}
              onToggleStep={handleToggleStep}
            />
          ))}
        </div>
        {/* Финальный экран — все 4 уровня */}
        {allLevelsCompleted && totalProgress === 100 && (
          <div className="mt-12 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-red-600/30 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/50 shadow-2xl text-center">
            <Trophy className="w-40 h-40 text-yellow-400 mx-auto mb-8 animate-pulse" />
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 mb-8">
              ТЫ — ЛЕГЕНДА, {progress.playerName.toUpperCase()}!
            </h1>
            <p className="text-3xl font-bold text-cyan-300 mb-6">
              Ты прошёл ВСЕ ЧЕТЫРЕ УРОВНЯ.
            </p>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-10">
              Ты не просто поднял сервер. Ты создал цифровой бункер, который переживёт всё.
              <br /><br />
              Спасибо тебе за прохождение. Это был не просто квест — это был мой подарок тебе.
              <br />
              Ты — настоящий DevOps-инженер, суверен своего кода и мастер своего мира.
            </p>
            <p className="text-xl italic text-purple-300 mb-12">
              — С любовью и уважением, автор игры (2025)
            </p>
            <button
              onClick={() => setGameState('difficulty')}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-xl hover:scale-110 transition-all shadow-2xl"
            >
              ВЕРНУТЬСЯ К ВЫБОРУ УРОВНЯ
            </button>
          </div>
        )}
        {/* Обычный экран победы */}
        {totalProgress === 100 && currentDifficulty && !allLevelsCompleted && (
          <div className="mt-12 bg-gradient-to-r from-green-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-12 border border-green-500/50 shadow-2xl text-center">
            <Trophy className="w-32 h-32 text-green-400 mx-auto mb-8 animate-pulse" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-6">
              ПОЗДРАВЛЯЮ, {progress.playerName.toUpperCase()}!
            </h1>
            <p className="text-3xl font-bold text-cyan-400 mb-8">
              Ты завершил {getChapterName(currentDifficulty)}!
            </p>
            <p className="text-4xl font-bold text-yellow-400 mb-8">
              {getTitleForDifficulty(currentDifficulty)}
            </p>
            <button
              onClick={() => setGameState('difficulty')}
              className="mt-12 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:scale-110 transition-all shadow-lg"
            >
              ВЕРНУТЬСЯ К ВЫБОРУ УРОВНЯ
            </button>
          </div>
        )}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>Сделано с ❤️ и постиронией для Лёни</p>
        <p className="mt-2">Matrix Quest v4.3 • 2025</p>
      </div>
    </div>
  );
}
