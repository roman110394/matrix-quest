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
      { 
        id: 'step_1', 
        text: 'Открыл терминал на своём компьютере', 
        hint: 'На Windows — PuTTY (скачай с putty.org), на macOS/Linux — встроенный Terminal. Это твой первый шаг в мир настоящего администрирования!' 
      },
      { 
        id: 'step_2', 
        text: 'Подключился по SSH к серверу', 
        command: 'ssh root@ТВОЙ_IP_АДРЕС', 
        hint: 'Замени ТВОЙ_IP_АДРЕС на реальный IP сервера. Если просит "Are you sure you want to continue connecting?" — пиши yes.' 
      },
      { 
        id: 'step_3', 
        text: 'Ввёл пароль root (он не отображается — это нормально)', 
        hint: 'Пароль печатается "вслепую". Просто набирай и жми Enter. Если ошибка — проверь, правильно ли ввёл IP и пароль.' 
      },
      { 
        id: 'step_4', 
        text: 'Увидел приветствие сервера (что-то вроде "Welcome to Ubuntu")', 
        hint: 'Поздравляю — ты внутри! Это твой цифровой бункер. Теперь ты — root, бог этого сервера.' 
      },
      { 
        id: 'step_5', 
        text: 'Обновил систему до последних пакетов', 
        command: 'apt update && apt upgrade -y', 
        hint: 'Это важно для безопасности. Сервер скачает и установит все обновления. Может занять 5–10 минут.' 
      },
      { 
        id: 'step_6', 
        text: 'Установил базовые инструменты', 
        command: 'apt install -y curl wget nano htop ufw git', 
        hint: 'curl/wget — для скачивания, nano — редактор, htop — красивый топ, ufw — firewall, git — для версионности. Теперь у тебя есть швейцарский нож!' 
      },
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
      { 
        id: 'step_1', 
        text: 'Разрешил порт SSH (22), чтобы не заблокировать себя навсегда', 
        command: 'ufw allow 22/tcp', 
        hint: 'Это критично! Если забудешь — потеряешь доступ к серверу.' 
      },
      { 
        id: 'step_2', 
        text: 'Разрешил веб-порты (HTTP и HTTPS)', 
        command: 'ufw allow 80/tcp\nufw allow 443/tcp', 
        hint: '80 — для HTTP, 443 — для HTTPS. Нужны для будущего сайта Element и сертификатов.' 
      },
      { 
        id: 'step_3', 
        text: 'Разрешил порт федерации Matrix (8448)', 
        command: 'ufw allow 8448/tcp', 
        hint: 'Без этого другие серверы Matrix не смогут общаться с твоим.' 
      },
      { 
        id: 'step_4', 
        text: 'Включил firewall', 
        command: 'ufw enable', 
        hint: 'Подтверди "y". Теперь по умолчанию всё заблокировано, кроме разрешённых портов.' 
      },
      { 
        id: 'step_5', 
        text: 'Проверил статус firewall', 
        command: 'ufw status verbose', 
        hint: 'Должно быть "Status: active" и список разрешённых портов. Если что-то не так — пиши ufw delete для удаления правила.' 
      },
    ],
  },
  {
    id: 'quest_1_3',
    chapter: 1,
    title: 'Квест 1.3: Ставим Docker',
    icon: Package,
    description: 'Установи Docker — твой швейцарский нож будущего',
    achievement: { id: 'docker_master', name: 'Docker Apprentice', desc: 'Освоил контейнеризацию' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Установил Docker одним скриптом', 
        command: 'curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh', 
        hint: 'Официальный способ. Скрипт сам всё настроит под Ubuntu.' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил Docker в автозагрузку', 
        command: 'systemctl enable docker', 
        hint: 'Теперь Docker стартует при перезагрузке сервера.' 
      },
      { 
        id: 'step_3', 
        text: 'Установил Docker Compose (для управления несколькими контейнерами)', 
        command: 'apt install -y docker-compose', 
        hint: 'В новых версиях это docker compose (без дефиса), но пока работает старый.' 
      },
      { 
        id: 'step_4', 
        text: 'Проверил, что всё установилось', 
        command: 'docker --version && docker-compose --version', 
        hint: 'Должны вывести версии. Если ошибка — перезагрузи сервер: reboot' 
      },
    ],
  },
  {
    id: 'quest_1_4',
    chapter: 1,
    title: 'Квест 1.4: Настраиваем домен',
    icon: Globe,
    description: 'Дай своему бункеру красивое имя вместо IP',
    achievement: { id: 'dns_wizard', name: 'DNS Wizard', desc: 'Настроил DNS-записи' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Приобрёл домен или взял бесплатный', 
        hint: 'Можно купить на reg.ru, 2domains и т.д., или бесплатно на freedns.afraid.org / duckdns.org' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил A-запись: matrix.твойдомен.ru → IP сервера', 
        hint: 'В панели регистратора: тип A, имя matrix, значение — твой IP сервера' 
      },
      { 
        id: 'step_3', 
        text: 'Добавил A-запись: element.твойдомен.ru → тот же IP', 
        hint: 'Это будет адрес веб-клиента Element' 
      },
      { 
        id: 'step_4', 
        text: 'Подождал распространения DNS (5–30 минут)', 
        hint: 'DNS не мгновенный. Пей кофе, скоро всё заработает.' 
      },
      { 
        id: 'step_5', 
        text: 'Проверил, что домен резолвится', 
        command: 'ping matrix.твойдомен.ru', 
        hint: 'Должен пинговаться твой IP. Если нет — подожди ещё или проверь записи.' 
      },
    ],
  },
  {
    id: 'quest_1_5',
    chapter: 1,
    title: 'Квест 1.5: Matrix Synapse — сердце мессенджера',
    icon: Zap,
    description: 'Разворачиваем основной сервер Matrix',
    achievement: { id: 'matrix_architect', name: 'Matrix Architect', desc: 'Развернул Matrix Synapse' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Создал папку для проекта', 
        command: 'mkdir -p /opt/matrix && cd /opt/matrix', 
        hint: 'Всё будет храниться здесь — удобно и аккуратно.' 
      },
      { 
        id: 'step_2', 
        text: 'Создал docker-compose.yml', 
        command: 'nano docker-compose.yml', 
        hint: 'Вставь конфиг из официальной документации Synapse. Замени server_name на свой домен и пароль БД на сложный!' 
      },
      { 
        id: 'step_3', 
        text: 'Сгенерировал начальную конфигурацию', 
        command: 'docker-compose run --rm synapse generate', 
        hint: 'Это создаст homeserver.yaml и ключи.' 
      },
      { 
        id: 'step_4', 
        text: 'Отредактировал homeserver.yaml', 
        command: 'nano synapse-data/homeserver.yaml', 
        hint: 'Найди: enable_registration: true → сделай false (потом), и проверь подключение к БД (postgres).' 
      },
      { 
        id: 'step_5', 
        text: 'Запустил контейнеры', 
        command: 'docker-compose up -d', 
        hint: 'Первый запуск долгий — скачивает образы. Проверь docker-compose logs -f если что-то не так.' 
      },
      { 
        id: 'step_6', 
        text: 'Проверил, что всё работает', 
        command: 'docker-compose ps', 
        hint: 'Должны быть Up: synapse и postgres. Если ошибка — смотри логи: docker-compose logs synapse' 
      },
    ],
  },
  {
    id: 'quest_1_6',
    chapter: 1,
    title: 'Квест 1.6: HTTPS — шифруем всё',
    icon: Key,
    description: 'Включаем шифрование, чтобы никто не подглядывал',
    achievement: { id: 'https_hero', name: 'HTTPS Hero', desc: 'Настроил SSL-сертификаты' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Установил Nginx и Certbot', 
        command: 'apt install -y nginx certbot python3-certbot-nginx', 
        hint: 'Nginx — реверс-прокси, Certbot — бесплатные сертификаты от Let\'s Encrypt.' 
      },
      { 
        id: 'step_2', 
        text: 'Создал конфиг Nginx для Matrix', 
        command: 'nano /etc/nginx/sites-available/matrix', 
        hint: 'Вставь готовый конфиг (прокси на порт 8008 Synapse и 8448 для федерации). Ищи примеры в документации Synapse.' 
      },
      { 
        id: 'step_3', 
        text: 'Активировал конфиг и перезапустил Nginx', 
        command: 'ln -s /etc/nginx/sites-available/matrix /etc/nginx/sites-enabled/\nnginx -t && systemctl reload nginx', 
        hint: 'nginx -t проверяет синтаксис. Если ошибка — исправь конфиг.' 
      },
      { 
        id: 'step_4', 
        text: 'Получил бесплатный SSL-сертификат', 
        command: 'certbot --nginx -d matrix.твойдомен.ru', 
        hint: 'Введи email (для уведомлений), согласись с условиями. Certbot сам настроит HTTPS.' 
      },
      { 
        id: 'step_5', 
        text: 'Проверил, что HTTPS работает', 
        command: 'curl https://matrix.твойдомен.ru/_matrix/client/versions', 
        hint: 'Должен вернуть JSON с версиями API. Открой в браузере — зелёный замок!' 
      },
    ],
  },
  {
    id: 'quest_1_7',
    chapter: 1,
    title: 'Квест 1.7: Первый пользователь — ты админ!',
    icon: User,
    description: 'Создай своего первого пользователя (это ты, Лёня)',
    achievement: { id: 'admin_created', name: 'Server Administrator', desc: 'Создал первого пользователя' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Создал администратора через команду', 
        command: 'docker exec -it matrix-synapse register_new_matrix_user -u admin -p СЛОЖНЫЙ_ПАРОЛЬ -a -c /data/homeserver.yaml http://localhost:8008', 
        hint: 'Замени СЛОЖНЫЙ_ПАРОЛЬ на что-то надёжное (20+ символов). -a — делает админом.' 
      },
      { 
        id: 'step_2', 
        text: 'Увидел "Success!" или новый пользователь создан', 
        hint: 'Если ошибка — проверь, запущен ли контейнер Synapse и правильный ли путь к homeserver.yaml.' 
      },
      { 
        id: 'step_3', 
        text: 'Записал данные в надёжное место', 
        hint: 'Логин: @admin:твойдомен.ru\nПароль: тот, что задал\nСервер: https://matrix.твойдомен.ru\nЭто твой мастер-аккаунт — потеряешь, всё пропало!' 
      },
    ],
  },
  {
    id: 'quest_1_8',
    chapter: 1,
    title: 'Квест 1.8: Element Web — красивый клиент',
    icon: MessageSquare,
    description: 'Запускаем веб-интерфейс, как в Telegram, но свой',
    achievement: { id: 'element_master', name: 'Element Master', desc: 'Развернул веб-интерфейс' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Добавил сервис Element в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Вставь секцию element из официальной документации. Укажи свой домен.' 
      },
      { 
        id: 'step_2', 
        text: 'Создал конфиг для Element', 
        command: 'nano /opt/matrix/element-config.json', 
        hint: 'Минимальный конфиг: {"default_server_config": {"m.homeserver": {"base_url": "https://matrix.твойдомен.ru"}}}' 
      },
      { 
        id: 'step_3', 
        text: 'Создал Nginx-конфиг для Element', 
        command: 'nano /etc/nginx/sites-available/element', 
        hint: 'Прокси на порт Element (обычно 80 внутри контейнера).' 
      },
      { 
        id: 'step_4', 
        text: 'Активировал и получил SSL для Element', 
        command: 'ln -s /etc/nginx/sites-available/element /etc/nginx/sites-enabled/\ncertbot --nginx -d element.твойдомен.ru\nsystemctl reload nginx', 
        hint: 'Теперь оба поддомена с HTTPS.' 
      },
      { 
        id: 'step_5', 
        text: 'Перезапустил все контейнеры', 
        command: 'cd /opt/matrix && docker-compose up -d', 
        hint: 'Element теперь доступен.' 
      },
      { 
        id: 'step_6', 
        text: 'Открыл https://element.твойдомен.ru в браузере', 
        hint: 'Должна загрузиться красивая страница входа Element.' 
      },
      { 
        id: 'step_7', 
        text: 'Залогинился как admin', 
        hint: 'Введи @admin:твойдомен.ru и пароль. Добро пожаловать в свой мессенджер!' 
      },
      { 
        id: 'step_8', 
        text: 'Создал первую комнату и написал в неё', 
        hint: 'Поздравляю! Ты прошёл первую главу. У тебя есть свой защищённый мессенджер. Это только начало.' 
      },
    ],
  },
  // === Глава 2: Hard Mode ===
  {
    id: 'quest_2_1',
    chapter: 2,
    title: 'Квест 2.1: Включаем федерацию',
    icon: Globe,
    description: 'Твой сервер теперь не одинок — он становится частью огромной глобальной сети Matrix',
    achievement: { id: 'federation_master', name: 'Federation Lord', desc: 'Присоединился к глобальной Matrix-сети' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Открыл файл конфигурации homeserver.yaml', 
        command: 'nano /opt/matrix/synapse-data/homeserver.yaml', 
        hint: 'Это главный файл, где живёт вся магия твоего сервера. Будь осторожен — ошибки здесь могут сломать всё.' 
      },
      { 
        id: 'step_2', 
        text: 'Убедился, что federation включена (enable_federation: true)', 
        hint: 'По умолчанию она уже true. Если false — включи. Это значит, что твой сервер будет общаться с тысячами других по всему миру.' 
      },
      { 
        id: 'step_3', 
        text: 'Перезапустил Synapse, чтобы изменения применились', 
        command: 'cd /opt/matrix && docker-compose restart synapse', 
        hint: 'Сервер перезапустится за 10–20 секунд. Если что-то сломалось — смотри логи: docker-compose logs -f synapse' 
      },
      { 
        id: 'step_4', 
        text: 'Проверил, что федерация отвечает', 
        command: 'curl https://matrix.твойдомен.ru/_matrix/federation/v1/version', 
        hint: 'Должен вернуться JSON с версией Synapse. Если 404 или ошибка — проверь DNS и порт 8448 в firewall.' 
      },
      { 
        id: 'step_5', 
        text: 'Протестировал на federationtester.matrix.org', 
        hint: 'Зайди на сайт, введи свой домен (matrix.твойдомен.ru) — все галочки должны быть зелёными. Это значит, что ты в деле!' 
      },
      { 
        id: 'step_6', 
        text: 'Пригласил друга с matrix.org в комнату — и он зашёл!', 
        hint: 'Создай комнату в Element, добавь @username:matrix.org — он увидит приглашение. Теперь вы общаетесь через федерацию. Ты — часть децентрализованного будущего!' 
      },
    ],
  },
  {
    id: 'quest_2_2',
    chapter: 2,
    title: 'Квест 2.2: Бридж в Telegram',
    icon: MessageSquare,
    description: 'Теперь сообщения из Telegram приходят прямо в твои Matrix-комнаты',
    achievement: { id: 'telegram_bridge', name: 'Bridge Engineer', desc: 'Соединил Telegram с Matrix' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Создал бота в Telegram через @BotFather', 
        hint: 'Напиши @BotFather → /newbot → задай имя и username. Сохрани токен — это ключ к бриджу.' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил mautrix-telegram в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Вставь готовую секцию из документации mautrix-telegram. Не забудь вставить свой Telegram-токен!' 
      },
      { 
        id: 'step_3', 
        text: 'Запустил бридж', 
        command: 'docker-compose up -d mautrix-telegram', 
        hint: 'Первый запуск — бридж попросит QR-код для входа в Telegram.' 
      },
      { 
        id: 'step_4', 
        text: 'В Element включил Labs → mautrix-telegram', 
        hint: 'Настройки → Labs → включи "Bridge Telegram". Появится кнопка "Link Telegram account".' 
      },
      { 
        id: 'step_5', 
        text: 'Отсканировал QR-код в Telegram', 
        hint: 'Открой Telegram → Настройки → Устройства → "Link Telegram account" → сканируй код. Бридж авторизуется.' 
      },
      { 
        id: 'step_6', 
        text: 'Порталил любимый канал или группу в Matrix', 
        hint: 'В Element → "Portal" → введи @telegram:твойдомен.ru → выбери чат → создай портал. Теперь сообщения идут в обе стороны!' 
      },
    ],
  },
  {
    id: 'quest_2_3',
    chapter: 2,
    title: 'Квест 2.3: Бридж в Discord',
    icon: MessageSquare,
    description: 'Твой Discord-сервер теперь живёт внутри Matrix',
    achievement: { id: 'discord_bridge', name: 'Discord Overlord', desc: 'Соединил Discord с Matrix' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Создал приложение и бота на Discord Developer Portal', 
        hint: 'discord.com/developers → New Application → Bot → Reset Token. Скопируй токен.' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил mautrix-discord в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Вставь секцию из документации mautrix-discord. Вставь свой Discord-токен.' 
      },
      { 
        id: 'step_3', 
        text: 'Запустил бридж', 
        command: 'docker-compose up -d mautrix-discord', 
        hint: 'Бридж создаст ссылку для входа — зайди по ней в браузере.' 
      },
      { 
        id: 'step_4', 
        text: 'В Element привязал Discord-аккаунт', 
        hint: 'Настройки → Labs → включи "Bridge Discord". Появится кнопка "Link Discord account".' 
      },
      { 
        id: 'step_5', 
        text: 'Порталил свой Discord-сервер в Matrix', 
        hint: 'Создай комнату → "Portal" → введи @discord:твойдомен.ru → выбери сервер → портал создан. Теперь чаты синхронизированы!' 
      },
    ],
  },
  {
    id: 'quest_2_4',
    chapter: 2,
    title: 'Квест 2.4: Бридж в WhatsApp',
    icon: MessageSquare,
    description: 'Твой личный WhatsApp теперь живёт в Element',
    achievement: { id: 'whatsapp_bridge', name: 'WhatsApp Whisperer', desc: 'Соединил WhatsApp с Matrix' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Добавил mautrix-whatsapp в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Вставь секцию из официальной документации mautrix-whatsapp.' 
      },
      { 
        id: 'step_2', 
        text: 'Запустил бридж', 
        command: 'docker-compose up -d mautrix-whatsapp', 
        hint: 'Первый запуск — создаст QR-код для входа в WhatsApp.' 
      },
      { 
        id: 'step_3', 
        text: 'В Element включил Labs → mautrix-whatsapp', 
        hint: 'Настройки → Labs → включи "Bridge WhatsApp". Появится кнопка "Link WhatsApp".' 
      },
      { 
        id: 'step_4', 
        text: 'Отсканировал QR-код своим WhatsApp', 
        hint: 'Открой WhatsApp → Настройки → Связанные устройства → "Связать устройство" → сканируй код.' 
      },
      { 
        id: 'step_5', 
        text: 'Писал в личку и группы — всё идёт в Matrix!', 
        hint: 'Поздравляю! Теперь WhatsApp, Telegram, Discord — всё в одном месте. Ты — бог мессенджеров!' 
      },
    ],
  },
  {
    id: 'quest_2_5',
    chapter: 2,
    title: 'Квест 2.5: Своё облачное хранилище',
    icon: Package,
    description: 'Больше никаких ограничений на размер файлов — ты хозяин медиа',
    achievement: { id: 'storage_king', name: 'Storage Sovereign', desc: 'Поднял неограниченное хранилище медиа' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Выбрал облако: Backblaze B2, Wasabi, Hetzner Storage Box или MinIO', 
        hint: 'Backblaze B2 — дешёвый и надёжный. Создай аккаунт и бакет.' 
      },
      { 
        id: 'step_2', 
        text: 'Получил access_key и secret_key', 
        hint: 'Это как логин/пароль для твоего облака. Сохрани в надёжном месте!' 
      },
      { 
        id: 'step_3', 
        text: 'Отредактировал homeserver.yaml — добавил media_storage', 
        command: 'nano /opt/matrix/synapse-data/homeserver.yaml', 
        hint: 'Добавь секцию: media_store_path: /data/media_store, и настройки S3 (bucket, endpoint, keys).' 
      },
      { 
        id: 'step_4', 
        text: 'Перезапустил Synapse', 
        command: 'docker-compose restart synapse', 
        hint: 'Теперь все фото, видео, файлы идут в облако.' 
      },
      { 
        id: 'step_5', 
        text: 'Отправил большой файл (1 ГБ+) — он загрузился!', 
        hint: 'Проверь в Element — файл открывается мгновенно. Ты победил лимиты Telegram и WhatsApp!' 
      },
      { 
        id: 'step_6', 
        text: 'Поздравляю! У тебя неограниченное хранилище', 
        hint: 'Теперь можешь слать 4K-видео, архивы, бэкапы — хоть терабайты.' 
      },
    ],
  },
  // === Глава 3: Ultra Hard Mode ===
  {
    id: 'quest_3_1',
    chapter: 3,
    title: 'Квест 3.1: Мониторинг (Prometheus + Grafana)',
    icon: Zap,
    description: 'Теперь ты всегда в курсе, жив ли сервер, сколько он жрёт ресурсов и когда пора паниковать',
    achievement: { id: 'monitoring_master', name: 'Observer', desc: 'Поднял мониторинг и алерты' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Добавил Prometheus, Grafana и экспортеры в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Вставь готовые секции из документации Synapse. Prometheus собирает метрики, Grafana — рисует красивые графики.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил сбор метрик Synapse, PostgreSQL и системы', 
        hint: 'В prometheus.yml добавь jobs для портов 9092 (Synapse), postgres_exporter и node_exporter (для CPU/RAM/диск).' 
      },
      { 
        id: 'step_3', 
        text: 'Запустил новые контейнеры', 
        command: 'docker-compose up -d prometheus grafana', 
        hint: 'Grafana доступна на http://твой_IP:3000 (логин admin, пароль admin — смени сразу!).' 
      },
      { 
        id: 'step_4', 
        text: 'Импортировал готовые дашборды Matrix в Grafana', 
        hint: 'В Grafana → Dashboards → Import → вставь ID 11074 или 13639. Увидишь графики сообщений, пользователей, нагрузки.' 
      },
      { 
        id: 'step_5', 
        text: 'Настроил алерты (например, если CPU > 80% или сервер упал)', 
        hint: 'В Alertmanager добавь webhook в Telegram или Discord. Теперь если что-то сломается — ты получишь уведомление мгновенно.' 
      },
      { 
        id: 'step_6', 
        text: 'Протестировал алерт (например, перезагрузил сервер)', 
        hint: 'Получил уведомление? Отлично — ты больше никогда не проспишь падение бункера!' 
      },
    ],
  },
  {
    id: 'quest_3_2',
    chapter: 3,
    title: 'Квест 3.2: Централизованные логи (Loki + Promtail)',
    icon: Package,
    description: 'Все логи в одном месте — больше не придётся искать по контейнерам',
    achievement: { id: 'logging_master', name: 'Archivist', desc: 'Собрал все логи в одном месте' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Добавил Loki и Promtail в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Loki — хранилище логов, Promtail — агент, который их собирает.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил Promtail на сбор логов всех контейнеров', 
        hint: 'В promtail.yml укажи пути /var/lib/docker/containers/*/*.log и лейблы по контейнерам.' 
      },
      { 
        id: 'step_3', 
        text: 'Запустил Loki и Promtail', 
        command: 'docker-compose up -d loki promtail', 
        hint: 'Логи начнут поступать автоматически.' 
      },
      { 
        id: 'step_4', 
        text: 'Открыл Grafana → Explore → выбрал Loki как источник', 
        hint: 'Теперь можно искать логи по запросу, например {container="synapse"} |~ "error".' 
      },
      { 
        id: 'step_5', 
        text: 'Настроил retention (хранение логов 90+ дней)', 
        hint: 'В loki.yml укажи table_manager.retention_period: 2160h (90 дней). Логи теперь живут долго!' 
      },
      { 
        id: 'step_6', 
        text: 'Нашёл старый лог ошибки и разобрался в проблеме', 
        hint: 'Поздравляю — ты теперь настоящий детектив серверных преступлений!' 
      },
    ],
  },
  {
    id: 'quest_3_3',
    chapter: 3,
    title: 'Квест 3.3: Автоматические бэкапы',
    icon: Shield,
    description: 'Даже если сервер сгорит — твои данные выживут',
    achievement: { id: 'backup_master', name: 'Survivor', desc: 'Настроил disaster recovery' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Написал скрипт дампа PostgreSQL и медиа', 
        command: 'nano /opt/matrix/backup.sh', 
        hint: 'pg_dumpall + rsync медиа. Сделай скрипт исполняемым: chmod +x backup.sh' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил cron на ежедневный запуск', 
        command: 'crontab -e', 
        hint: 'Добавь строку: 0 3 * * * /opt/matrix/backup.sh — бэкап в 3 ночи каждый день.' 
      },
      { 
        id: 'step_3', 
        text: 'Зашифровал архивы GPG', 
        hint: 'В скрипте добавь gpg --symmetric --cipher-algo AES256. Пароль храни в надёжном месте.' 
      },
      { 
        id: 'step_4', 
        text: 'Настроил загрузку бэкапов в облако (Hetzner Storage Box, Backblaze)', 
        hint: 'Используй rclone или rsync. Бэкапы теперь в безопасном месте.' 
      },
      { 
        id: 'step_5', 
        text: 'Протестировал восстановление на тестовом сервере', 
        hint: 'Всё встало за 20–30 минут? Отлично — ты готов к апокалипсису!' 
      },
    ],
  },
  {
    id: 'quest_3_4',
    chapter: 3,
    title: 'Квест 3.4: Высокая доступность (HA)',
    icon: Server,
    description: 'Один сервер упал — второй взял нагрузку. Клиенты даже не заметили',
    achievement: { id: 'ha_master', name: 'Immortal', desc: 'Построил отказоустойчивый кластер' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Поднял второй сервер в другой стране/провайдере', 
        hint: 'Разные локации — защита от региональных сбоев.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил streaming replication PostgreSQL', 
        hint: 'Мастер → слейв. Данные реплицируются в реальном времени.' 
      },
      { 
        id: 'step_3', 
        text: 'Поставил Traefik или HAProxy с health-check', 
        hint: 'Балансировщик проверяет здоровье серверов и перенаправляет трафик на живой.' 
      },
      { 
        id: 'step_4', 
        text: 'Настроил автоматический failover', 
        hint: 'Patroni или pg_auto_failover — если мастер упал, слейв становится мастером.' 
      },
      { 
        id: 'step_5', 
        text: 'Выключил основной сервер — клиенты продолжили общаться!', 
        hint: 'Доступность 99.99%. Ты построил настоящий бункер!' 
      },
    ],
  },
  {
    id: 'quest_3_5',
    chapter: 3,
    title: 'Квест 3.5: Защита от DDoS и брутфорса',
    icon: Shield,
    description: 'Твой бункер выдержит любую атаку — от школьника до государства',
    achievement: { id: 'defense_master', name: 'Fortress Builder', desc: 'Сделал сервер неприступным' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Подключил Cloudflare (или аналог)', 
        hint: 'Включи "Under Attack" mode и proxy-режим. Cloudflare отразит большинство DDoS.' 
      },
      { 
        id: 'step_2', 
        text: 'Установил CrowdSec и Fail2Ban', 
        hint: 'CrowdSec — сообщество банов плохих IP. Fail2Ban — классика бана по логам.' 
      },
      { 
        id: 'step_3', 
        text: 'Настроил rate-limiting в Nginx', 
        hint: 'Ограничь запросы на /_matrix и API — боты не пройдут.' 
      },
      { 
        id: 'step_4', 
        text: 'Включил geo-блокировку (по желанию)', 
        hint: 'Разреши только нужные страны — остальной мир в бан.' 
      },
      { 
        id: 'step_5', 
        text: 'Провёл тестовую атаку (или посмотрел логи)', 
        hint: 'CrowdSec забанил подозрительные IP? Ты — неприступная крепость!' 
      },
    ],
  },
  {
    id: 'quest_3_6',
    chapter: 3,
    title: 'Квест 3.6: Скрытность и обфускация',
    icon: Key,
    description: 'Тебя не найдут, даже если будут специально искать',
    achievement: { id: 'stealth_master', name: 'Ghost', desc: 'Скрыл сервер от сканирования' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Убрал все информативные заголовки', 
        hint: 'В Nginx: server_tokens off; proxy_hide_header X-Powered-By и т.д.' 
      },
      { 
        id: 'step_2', 
        text: 'Сменил порт федерации на 443 (стандартный HTTPS)', 
        hint: 'В homeserver.yaml и Nginx — меньше шансов на блокировку.' 
      },
      { 
        id: 'step_3', 
        text: 'Добавил .onion-адрес через Tor', 
        hint: 'Установи Tor, настрой hidden service на порты 80/443. Получишь .onion-домен.' 
      },
      { 
        id: 'step_4', 
        text: 'Настроил доступ только через Cloudflare (IP-restriction)', 
        hint: 'В firewall разреши только IP Cloudflare — прямой доступ по IP заблокирован.' 
      },
      { 
        id: 'step_5', 
        text: 'Проверил на shodan.io и censys.io — сервер не виден!', 
        hint: 'Полная невидимость. Ты — призрак в сети.' 
      },
    ],
  },
  {
    id: 'quest_3_7',
    chapter: 3,
    title: 'Квест 3.7: Автообновления',
    icon: Zap,
    description: 'Сервер обновляется сам, пока ты спишь или пьёшь кофе',
    achievement: { id: 'autoupdate_master', name: 'Self-Healer', desc: 'Включил автоматическое обновление' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Добавил Watchtower в docker-compose.yml', 
        command: 'nano /opt/matrix/docker-compose.yml', 
        hint: 'Watchtower следит за обновлениями образов и перезапускает контейнеры.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил обновление только stable-образов', 
        hint: 'В переменных окружения: WATCHTOWER_LABEL_ENABLE=true и лейблы com.centurylinklabs.watchtower.enable=true.' 
      },
      { 
        id: 'step_3', 
        text: 'Включил уведомления о обновлениях (Telegram/Discord)', 
        hint: 'WATCHTOWER_NOTIFICATION_URL с webhook.' 
      },
      { 
        id: 'step_4', 
        text: 'Watchtower обновил образ — контейнер перезапустился сам!', 
        hint: 'Ты больше не тратишь часы на обновления. Сервер лечит себя сам.' 
      },
    ],
  },
  {
    id: 'quest_3_8',
    chapter: 3,
    title: 'Квест 3.8: Полная автоматизация (Ansible/Terraform)',
    icon: Globe,
    description: 'Новый сервер с Matrix — одной командой',
    achievement: { id: 'automation_master', name: 'Infrastructure God', desc: 'Автоматизировал весь деплой' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Написал Ansible playbook или Terraform-модуль', 
        hint: 'Всё от установки Ubuntu до запуска docker-compose — в коде.' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил все конфиги как шаблоны (docker-compose.yml, nginx.conf и т.д.)', 
        hint: 'Переменные: домен, пароли, токены — в variables.yml или tfvars.' 
      },
      { 
        id: 'step_3', 
        text: 'Протестировал на новом VDS — всё встало за 15–20 минут', 
        hint: 'ansible-playbook site.yml или terraform apply — и готово!' 
      },
      { 
        id: 'step_4', 
        text: 'Добавил README с инструкцией "Как поднять бункер за 15 минут"', 
        hint: 'Теперь любой (или ты в будущем) может восстановить всё одной командой.' 
      },
      { 
        id: 'step_5', 
        text: 'Поздравляю! Ты прошёл Ultra Hard Mode', 
        hint: 'Ты больше не админ — ты бог инфраструктуры.' 
      },
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
      { 
        id: 'step_1', 
        text: 'Установил Yggdrasil на сервер и свой компьютер', 
        hint: 'Официальный сайт yggdrasil-network.github.io — пакеты для Ubuntu и Windows.' 
      },
      { 
        id: 'step_2', 
        text: 'Сгенерировал конфиги и подключился к пирам', 
        hint: 'Yggdrasil создаст уникальный IPv6-адрес в диапазоне 200::/7.' 
      },
      { 
        id: 'step_3', 
        text: 'Подключился к серверу по Yggdrasil-IP', 
        hint: 'SSH и Element работают через mesh-сеть.' 
      },
      { 
        id: 'step_4', 
        text: 'Протестировал — отключил обычный интернет, но связь осталась!', 
        hint: 'Даже если провайдеры/РКН всё заблокируют — ты внутри своей сети.' 
      },
    ],
  },
  {
    id: 'quest_4_2',
    chapter: 4,
    title: 'Квест 4.2: .onion-адрес для Matrix',
    icon: Key,
    description: 'Твой мессенджер теперь доступен в даркнете',
    achievement: { id: 'onion_master', name: 'Shadow Operator', desc: 'Скрыл сервер в Tor' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Установил Tor на сервер', 
        command: 'apt install tor', 
        hint: 'Простая установка из репозитория.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил hidden service для портов 80 и 443', 
        command: 'nano /etc/tor/torrc', 
        hint: 'Добавь HiddenServiceDir /var/lib/tor/matrix/ и HiddenServicePort 80 127.0.0.1:80' 
      },
      { 
        id: 'step_3', 
        text: 'Перезапустил Tor и получил .onion-адрес', 
        command: 'systemctl restart tor && cat /var/lib/tor/matrix/hostname', 
        hint: 'Длинный .onion — твой секретный адрес.' 
      },
      { 
        id: 'step_4', 
        text: 'Открыл Element через Tor Browser', 
        hint: 'Введи http://твой.onion — всё работает анонимно!' 
      },
      { 
        id: 'step_5', 
        text: 'Поделился .onion с другом — он зашёл без следа', 
        hint: 'Полная анонимность и приватность. Ты в тенях.' 
      },
    ],
  },
  {
    id: 'quest_4_3',
    chapter: 4,
    title: 'Квест 4.3: Zero Trust доступ',
    icon: Shield,
    description: 'Никто не войдёт без многофакторной проверки — даже с паролем',
    achievement: { id: 'zerotrust_master', name: 'Gatekeeper Supreme', desc: 'Внедрил Zero Trust' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Поднял Authelia или OAuth2-Proxy перед Nginx', 
        hint: 'Authelia — мощный 2FA-сервер с TOTP, WebAuthn, push-уведомлениями.' 
      },
      { 
        id: 'step_2', 
        text: 'Включил 2FA для всех пользователей', 
        hint: 'TOTP (Google Authenticator) или аппаратный ключ YubiKey.' 
      },
      { 
        id: 'step_3', 
        text: 'Настроил политики: только доверенные устройства и сети', 
        hint: 'Блокируем вход с новых IP или без 2FA.' 
      },
      { 
        id: 'step_4', 
        text: 'Попытался зайти без 2FA — доступ закрыт', 
        hint: 'Даже зная пароль — без второго фактора не пройдёшь. Ты — абсолютный страж.' 
      },
    ],
  },
  {
    id: 'quest_4_4',
    chapter: 4,
    title: 'Квест 4.4: Децентрализованное хранилище (IPFS)',
    icon: Package,
    description: 'Файлы живут вечно, даже если твой сервер исчезнет',
    achievement: { id: 'ipfs_master', name: 'Content Sovereign', desc: 'Распределил медиа по сети' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Поднял IPFS-ноду на сервере', 
        command: 'docker run -d ipfs/go-ipfs', 
        hint: 'IPFS — децентрализованная файловая система.' 
      },
      { 
        id: 'step_2', 
        text: 'Настроил Synapse на хранение медиа в IPFS', 
        hint: 'В homeserver.yaml добавь плагин или внешний uploader для IPFS.' 
      },
      { 
        id: 'step_3', 
        text: 'Отправил фото — получил CID (уникальный хэш)', 
        hint: 'Файл теперь распределён по сети IPFS.' 
      },
      { 
        id: 'step_4', 
        text: 'Выключил сервер — фото открылось через public gateway', 
        command: 'https://ipfs.io/ipfs/CID', 
        hint: 'Файлы вечны. Ты победил централизацию!' 
      },
    ],
  },
  {
    id: 'quest_4_5',
    chapter: 4,
    title: 'Квест 4.5: Самоподписанные сертификаты + DANE/TLSA',
    icon: Key,
    description: 'Полная независимость от Let\'s Encrypt и централизованных CA',
    achievement: { id: 'dane_master', name: 'Crypto Sovereign', desc: 'Ушёл от централизованных CA' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Сгенерировал свой корневой CA и сертификат сервера', 
        hint: 'Используй OpenSSL или cfssl. Ты теперь свой собственный удостоверяющий центр.' 
      },
      { 
        id: 'step_2', 
        text: 'Добавил TLSA-запись в DNS (через DNSSEC)', 
        hint: 'TLSA привязывает сертификат к домену на уровне DNS.' 
      },
      { 
        id: 'step_3', 
        text: 'Настроил Nginx на свой сертификат', 
        hint: 'Браузеры доверяют только твоей подписи (если установить CA).' 
      },
      { 
        id: 'step_4', 
        text: 'Проверил в браузере — зелёный замок без предупреждений', 
        hint: 'Только ты решаешь, кому доверять. Полная крипто-суверенность!' 
      },
    ],
  },
  {
    id: 'quest_4_6',
    chapter: 4,
    title: 'Квест 4.6: Offline-first Element',
    icon: MessageSquare,
    description: 'Мессенджер работает без интернета — как в старые добрые времена',
    achievement: { id: 'offline_master', name: 'Resilient Communicator', desc: 'Сделал Element автономным' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Настроил PWA и Service Worker в Element', 
        hint: 'В element-config.json включи offlineMode или используй кастомную сборку.' 
      },
      { 
        id: 'step_2', 
        text: 'Включил кэширование сообщений и комнат', 
        hint: 'IndexedDB хранит историю локально.' 
      },
      { 
        id: 'step_3', 
        text: 'Выключил интернет — открыл Element — всё на месте!', 
        hint: 'Читаешь старые чаты, пишешь сообщения (отправятся при подключении).' 
      },
      { 
        id: 'step_4', 
        text: 'Подключился обратно — сообщения синхронизировались', 
        hint: 'Как в Telegram, но свой и полностью автономный.' 
      },
    ],
  },
  {
    id: 'quest_4_7',
    chapter: 4,
    title: 'Квест 4.7: Собственный бридж',
    icon: Zap,
    description: 'Ты сам решаешь, с каким сервисом соединять Matrix',
    achievement: { id: 'custom_bridge_master', name: 'Bridge Architect', desc: 'Написал свой бридж' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Выбрал сервис (Slack, Signal, IRC, VK — что угодно)', 
        hint: 'Начни с простого — например, IRC или RSS.' 
      },
      { 
        id: 'step_2', 
        text: 'Написал бридж на Python (matrix-nio) или Go (mautrix)', 
        hint: 'Есть шаблоны — скопируй и адаптируй под свой сервис.' 
      },
      { 
        id: 'step_3', 
        text: 'Добавил бридж в docker-compose.yml', 
        command: 'docker-compose up -d my-custom-bridge', 
        hint: 'Настрой авторизацию и порталинг.' 
      },
      { 
        id: 'step_4', 
        text: 'Подключил — сообщения пошли в обе стороны!', 
        hint: 'Теперь ты бог интеграций. Matrix соединяет ВСЁ.' 
      },
    ],
  },
  {
    id: 'quest_4_8',
    chapter: 4,
    title: 'Квест 4.8: Цифровое бессмертие',
    icon: Trophy,
    description: 'Твой бункер переживёт тебя, цивилизацию и даже апокалипсис',
    achievement: { id: 'immortal', name: 'Digital Immortal', desc: 'Твой мессенджер живёт вечно' },
    steps: [
      { 
        id: 'step_1', 
        text: 'Настроил репликацию на серверы в 3+ континентах', 
        hint: 'Глобальное распределение — данные в Америке, Европе, Азии.' 
      },
      { 
        id: 'step_2', 
        text: 'Подключил холодное хранилище в блокчейне (Arweave, Sia, Filecoin)', 
        hint: 'Бэкапы загружены навечно — платишь один раз, хранится вечно.' 
      },
      { 
        id: 'step_3', 
        text: 'Написал "цифровое завещание" — полную инструкцию восстановления', 
        hint: 'С паролями, ключами, контактами, шагами. Несколько копий в разных местах.' 
      },
      { 
        id: 'step_4', 
        text: 'Передал доступ доверенным людям', 
        hint: 'Твой бункер продолжит жить даже после тебя.' 
      },
      { 
        id: 'step_5', 
        text: 'Ты стал цифровым бессмертным', 
        hint: 'Лёня, ты прошёл весь путь. От новичка до бога цифрового мира. Это не просто сервер — это твоё наследие. Спасибо, что прошёл этот квест. Ты — легенда.' 
      },
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
              — С любовью и уважением, Твой анонимный дед мороз (2025)
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
