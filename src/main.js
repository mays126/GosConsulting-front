// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Импортируем настроенный роутер
import './assets/css/main.css'; // Ваши глобальные стили

const app = createApp(App);

app.use(router); // Подключаем роутер к приложению

// Глобальное свойство для плавной прокрутки (можно оставить, если используется)
// Его работа может потребовать корректировки при навигации между разными страницами.
// Для прокрутки внутри одной страницы (например, HomeView) должно работать.
app.config.globalProperties.$scrollToElement = (targetElement) => {
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

app.mount('#app');
