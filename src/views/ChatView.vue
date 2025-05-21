<template>
  <div class="chat-page-wrapper flex flex-col min-h-screen bg-gray-900 text-white">
    <header class="chat-header">
      <div class="chat-header-actions">
        <button @click="handleLogout" class="header-btn">Выйти</button>
        <button @click="handleNavigateToHome" class="header-btn">На главную</button>
      </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-center pt-20 pb-8 px-4 sm:px-6 md:px-8">
      <section class="ai-assistant-container bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col">
        <h1 class="text-3xl font-bold text-blue-400 mb-6 text-center">Ваш AI-помощник</h1>

        <div class="ai-response-area bg-gray-700 p-5 rounded-lg flex-grow mb-6 overflow-y-auto border border-gray-600">
          <p v-if="loadingAiResponse" class="text-gray-400 italic text-lg text-center animate-pulse">ИИ думает...</p>
          <div v-else-if="aiResponse" class="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
            {{ aiResponse }}
          </div>
          <p v-else class="text-gray-400 italic text-lg text-center">Задайте свой первый вопрос ИИ.</p>
        </div>

        <div class="query-input-section">
          <textarea
            v-model="userQuery"
            @keydown.enter.prevent="sendQuery"
            placeholder="Задайте ваш вопрос ИИ..."
            rows="4"
            class="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-y"
          ></textarea>
          <button
            @click="sendQuery"
            :disabled="loadingAiResponse || !userQuery.trim()"
            class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Отправить запрос
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';

// Инжектируем централизованные функции из App.vue
const logoutFromApp = inject('logout');
const navigateToHomeFromApp = inject('navigateToHome');

// --- Состояния для управления UI и данными ---
const userQuery = ref(''); // Состояние для поля ввода пользователя
const aiResponse = ref(''); // Состояние для ответа ИИ
const loadingAiResponse = ref(false); // Индикатор загрузки ответа ИИ

// --- Функции для взаимодействия с бэкендом (заглушки) ---

// Функция для отправки запроса ИИ
const sendQuery = async () => {
  if (!userQuery.value.trim() || loadingAiResponse.value) return;

  const queryToSend = userQuery.value.trim();
  userQuery.value = ''; // Очищаем поле ввода сразу
  aiResponse.value = ''; // Очищаем предыдущий ответ

  loadingAiResponse.value = true;
  console.log('Отправка запроса ИИ:', queryToSend);

  try {
    // ЗАГЛУШКА: Замените на реальный API-эндпоинт ИИ
    const response = await fetch('http://localhost:8000/api/ask_ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('AccessToken')}` // Если требуется авторизация
      },
      body: JSON.stringify({ query: queryToSend }),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Ответ ИИ получен:', data);
      aiResponse.value = data.answer || 'Извините, я не смог получить ответ.'; // Ожидаем, например: { "answer": "..." }
      // Здесь пока не обновляем историю, т.к. сайдбара нет.
    } else {
      const errorData = await response.json();
      console.error('Ошибка ответа ИИ:', response.status, errorData);
      aiResponse.value = `Ошибка: ${errorData.detail || 'Неизвестная ошибка'}`;
    }
  } catch (error) {
    console.error('Ошибка сети при запросе ИИ:', error);
    aiResponse.value = 'Ошибка сети. Пожалуйста, попробуйте еще раз.';
  } finally {
    loadingAiResponse.value = false;
  }
};

// --- Функции, инжектированные из App.vue (остаются без изменений) ---
const handleLogout = async () => {
  if (logoutFromApp) {
    logoutFromApp();
  } else {
    console.warn('Функция logout не доступна.');
    localStorage.removeItem('AccessToken');
  }
};

const handleNavigateToHome = () => {
  if (navigateToHomeFromApp) {
    navigateToHomeFromApp();
  } else {
    console.warn('Функция navigateToHome не доступна.');
  }
};

// --- Жизненный цикл компонента ---
onMounted(() => {
  // На этой стадии не нужно ничего загружать, т.к. истории пока нет
});
</script>

<style scoped>
/* Общая обертка для страницы чата */
.chat-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #111827; /* bg-gray-900 */
}

/* Хедер страницы чата (стили из предыдущего запроса, которые вы уже одобрили) */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1a202c; /* Темный фон */
  padding: 0.75rem 1rem;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

/* Стили для кнопок в хедере */
.header-btn {
  background-color: transparent;
  color: #a0aec0; /* gray-400 */
  border: 1px solid transparent;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.header-btn:hover {
  background-color: rgba(66, 153, 225, 0.1); /* blue-500 с прозрачностью */
  color: #4299e1; /* blue-500 */
  border-color: rgba(66, 153, 225, 0.3);
}

.header-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* Основная секция контента */
.main {
  /* Важно: flex-grow для того, чтобы main занимал все доступное пространство */
  flex-grow: 1;
  /* Центрирование контента внутри main */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Центрируем по вертикали, если контента мало */
  /* padding-top для отступа от фиксированного хедера */
  /* Высота хедера примерно 4rem (0.75rem padding сверху + 0.75rem padding снизу + высота кнопок ~2.5rem = 4rem) */
  padding-top: 5rem; /* Немного больше, чем высота хедера, для запаса */
  padding-bottom: 2rem; /* Отступ снизу */
}

/* Контейнер для работы с ИИ (центральный блок) */
.ai-assistant-container {
  max-width: 48rem; /* max-w-3xl = 48rem = 768px */
  min-height: 50vh; /* Минимальная высота, чтобы блок не был слишком маленьким */
  display: flex;
  flex-direction: column; /* Элементы внутри будут располагаться вертикально */
  flex-grow: 1; /* Позволяет контейнеру расти в main */
  justify-content: space-between; /* Распределяет пространство между элементами */
}

/* Область отображения ответа ИИ */
.ai-response-area {
  min-height: 150px; /* Минимальная высота для заглушки */
  flex-grow: 1; /* Позволяет этой области заполнять доступное пространство */
  display: flex; /* Для центрирования текста заглушки */
  align-items: center; /* Центрирование по вертикали */
  justify-content: center; /* Центрирование по горизонтали */
}

/* Добавляем стили для скроллбаров (Webkit) */
.ai-response-area::-webkit-scrollbar,
textarea::-webkit-scrollbar {
  width: 8px;
}
.ai-response-area::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track {
  background: #1f2937; /* bg-gray-800 */
  border-radius: 4px;
}
.ai-response-area::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
  background: #4b5563; /* gray-600 */
  border-radius: 4px;
}
.ai-response-area::-webkit-scrollbar-thumb:hover,
textarea::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* gray-700 */
}

/* Стили для текстареа */
textarea {
  resize: vertical; /* Разрешаем изменение размера только по вертикали */
  min-height: 5rem; /* Минимальная высота textarea */
  max-height: 15rem; /* Максимальная высота textarea */
}

/* Стили для кнопки отправки */
.query-input-section button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Анимация для "ИИ думает..." */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>