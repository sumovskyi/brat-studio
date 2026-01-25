# 🚀 BRAT Studio - Deploy & Handoff Guide

## Быстрый способ: Netlify (FREE)

### Шаг 1: Создать аккаунт
1. Перейти на [netlify.com](https://netlify.com)
2. Войти через GitHub/Google

### Шаг 2: Задеплоить
1. Просто **перетащи папку `brat-studio`** на страницу Netlify
2. Получишь URL вида: `random-name-123.netlify.app`

### Шаг 3: Подключить домен (опционально)
1. Купи домен на Namecheap/GoDaddy (bratstudio.ca ~$15/год)
2. В Netlify: Domain Settings → Add domain
3. Следуй инструкциям по настройке DNS

---

## Альтернатива: Vercel

```bash
# Установи Vercel CLI
npm install -g vercel

# В папке brat-studio запусти:
vercel
```

---

## Альтернатива: GitHub Pages (бесплатно)

1. Создай репозиторий на GitHub
2. Загрузи файлы:
```bash
cd brat-studio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/brat-studio.git
git push -u origin main
```
3. Settings → Pages → Source: main branch

---

## 📦 Передача дизайнеру

### Что отправить:
```
📁 brat-studio/
├── index.html          ← Главная
├── about.html          ← О нас  
├── corporate.html      ← B2B
├── masterclass.html    ← Воркшопы
├── coaching.html       ← 1:1 коучинг
├── studio.html         ← Studio Labs
├── courses.html        ← Курсы (скоро)
├── contact.html        ← Контакт + форма
├── payment.html        ← Оплата
├── robots.txt          ← SEO
├── sitemap.xml         ← SEO
├── css/style.css       ← Стили
└── js/
    ├── main.js         ← Анимации
    └── form-handler.js ← Формы
```

### Инструкции для дизайнера:

#### 1. Цвета (CSS переменные в style.css)
```css
--color-accent: #3C5072;      /* Brady Blue - основной */
--color-accent-light: #5B7A9D;
--color-bg: #0A0A0F;          /* Тёмный фон */
--color-bg-light: #12121A;
```

#### 2. Шрифты
- **Заголовки**: Playfair Display (serif)
- **Текст**: Inter (sans-serif)

#### 3. Изображения для добавления:
- **Hero background** → css/style.css линия с `.hero__bg`
- **OG Image** (1200x630px) → images/og-image.jpg
- **Фото Катерины** → добавить в HTML

#### 4. Редактирование контента:
- Открыть HTML файл в любом редакторе
- Изменить текст внутри тегов
- Сохранить

---

## 🔧 Технические настройки

### Google Sheets для форм:
1. См. инструкции в `js/form-handler.js`
2. Создать Google Apps Script
3. Вставить URL в конфиг

### Метрики (опционально):
- Google Analytics: добавить скрипт в `<head>`
- Hotjar: для записи сессий

---

## ✅ Чеклист перед запуском:

- [ ] Заменить placeholder контент
- [ ] Добавить реальные фото
- [ ] Настроить Google Sheets интеграцию  
- [ ] Заменить hello@bratstudio.ca на реальный email
- [ ] Добавить ссылки на Instagram/LinkedIn
- [ ] Создать OG изображение (1200x630px)
- [ ] Купить и настроить домен
- [ ] Протестировать на мобильных
