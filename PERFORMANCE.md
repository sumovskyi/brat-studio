# 🚀 BRAT Studio — Performance Optimization Guide

## Что уже оптимизировано

### ✅ Fonts
- `preconnect` к fonts.googleapis.com
- `preload` шрифтов с `onload` swap
- `display=swap` для предотвращения FOIT

### ✅ CSS
- Critical CSS выделен в `css/critical.css` для инлайна
- CSS переменные для минимизации повторов
- Нет unused CSS (чистый код)

### ✅ JavaScript
- `defer` атрибут на скриптах
- Lazy initialization компонентов

---

## 📋 Чеклист перед продакшеном

### 1. Inline Critical CSS
В каждом HTML файле добавь в `<head>` ПЕРЕД основным CSS:

```html
<style>
  /* Вставь содержимое css/critical.css сюда */
</style>
<link rel="stylesheet" href="css/style.css" media="print" onload="this.media='all'; this.onload=null;">
<noscript><link rel="stylesheet" href="css/style.css"></noscript>
```

### 2. Изображения

**Формат и размеры:**
```bash
# Конвертация в WebP (macOS)
for file in *.jpg *.png; do
  cwebp -q 80 "$file" -o "${file%.*}.webp"
done
```

**Обязательные атрибуты:**
```html
<img 
  src="images/photo.webp" 
  alt="Descriptive text"
  width="400" 
  height="300"
  loading="lazy"
  decoding="async"
>
```

**Hero изображения (выше сгиба):**
- НЕ используй `loading="lazy"`
- Добавь `fetchpriority="high"`
```html
<img src="images/hero.webp" alt="Hero" fetchpriority="high">
```

### 3. Минификация

**CSS (используй cssnano):**
```bash
npx cssnano css/style.css css/style.min.css
```

**HTML (используй html-minifier):**
```bash
npx html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html
```

### 4. Сжатие (на сервере)

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/javascript application/json;
gzip_min_length 256;
```

**Netlify/Vercel:** автоматически сжимают

---

## 📊 Целевые метрики

| Метрика | Цель | Описание |
|---------|------|----------|
| **FCP** (First Contentful Paint) | < 1.8s | Когда появляется первый контент |
| **LCP** (Largest Contentful Paint) | < 2.5s | Когда загружается главный элемент |
| **FID** (First Input Delay) | < 100ms | Задержка первого взаимодействия |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Визуальная стабильность |
| **Total Size** | < 500KB | Всё вместе на первой загрузке |

---

## 🔍 Как тестировать

### Google PageSpeed Insights
https://pagespeed.web.dev/

### Chrome DevTools
1. F12 → Network → отключить кэш
2. Throttling: "Slow 3G"
3. Перезагрузить и смотреть waterfall

### Lighthouse (в Chrome)
1. F12 → Lighthouse tab
2. Выбрать: Performance, Accessibility
3. Device: Mobile
4. Run audit

---

## 🎯 Quick Wins (быстрые улучшения)

### Высокий приоритет
1. ⬜ Загрузить реальные изображения в WebP
2. ⬜ Inline critical CSS
3. ⬜ Добавить width/height ко всем `<img>`
4. ⬜ Минифицировать CSS/JS

### Средний приоритет
5. ⬜ Использовать CDN для статики
6. ⬜ Service Worker для оффлайн
7. ⬜ Preload hero image

### Низкий приоритет
8. ⬜ HTTP/2 Server Push
9. ⬜ Resource hints (prefetch)
10. ⬜ Brotli compression вместо gzip

---

## 📱 Mobile-специфичное

### Touch targets
Все кликабельные элементы минимум 44×44px

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Safe areas (iPhone X+)
```css
padding-bottom: env(safe-area-inset-bottom);
```

### Reduce motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Последнее обновление: 25.01.2025*
