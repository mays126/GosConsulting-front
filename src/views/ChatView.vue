<template>
    <div class="chat-page-container p-4 sm:p-8 min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg text-white">
        <h1 class="text-3xl font-bold text-blue-400 mb-6 text-center">Чат</h1>
  
        <div class="chat-content-placeholder h-64 bg-gray-700 rounded-md p-4 mb-6 flex items-center justify-center">
          <p class="text-gray-400 italic">Здесь будет отображаться содержимое чата...</p>
        </div>
  
        <button
          @click="handleLogout"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Выйти
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { inject } from 'vue'; // Только inject нужен
  
  // Инжектируем функцию logout, которую мы предоставляем в App.vue
  // Это централизованная функция, которая обрабатывает:
  // 1. Очистку AccessToken из localStorage
  // 2. Обновление состояния isAuthenticated в App.vue
  // 3. Перенаправление на главную страницу
  const logoutFromApp = inject('logout');
  
  // Локальная функция, которая будет вызвана при клике на кнопку "Выйти"
  const handleLogout = async () => {
    // Шаг 1: Отправляем запрос на бэкенд для завершения сессии на сервере
    try {
      const response = await fetch('http://localhost:8000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      if (response.ok) {
        console.log('Успешный выход с бэкенда.');
      } else {
        const errorData = await response.json();
        console.error('Ошибка выхода с бэкенда:', errorData);
        // Здесь можно добавить логику для отображения ошибки пользователю,
        // если выход на бэкенде не удался (но обычно мы все равно выходим на фронте).
      }
    } catch (error) {
      console.error('Ошибка сети при попытке выхода:', error);
      // Обработка ошибок сети
    }
  
    // Шаг 2: Вызываем централизованную функцию logout из App.vue
    // Она позаботится об очистке токена на фронте и перенаправлении.
    if (logoutFromApp) {
      logoutFromApp();
    } else {
      // Если по какой-то причине функция не была инжектирована (ошибка в provide/inject),
      // выполняем минимальные действия здесь, чтобы не зависеть полностью.
      console.warn('Функция logout не доступна через provide/inject. Выполняю локальную очистку.');
      localStorage.removeItem('AccessToken'); // Очищаем токен
      // Если нужно, вручную перенаправляем, если router не инжектирован
      // import { useRouter } from 'vue-router'; const router = useRouter(); router.push({ name: 'Home' });
    }
  };
  </script>
  
  <style scoped>
  /* Стили для контейнера страницы чата */
  .chat-page-container {
    /* Ваши стили из TailwindCSS и возможно, дополнительные */
    /* min-height: calc(100vh - 100px); */
  }
  
  /* Стили для плейсхолдера содержимого чата */
  .chat-content-placeholder {
    /* Ваши стили для плейсхолдера */
  }
  </style>