<template>
  <div class="chat-wrapper">
    <div class="pulsating-background">
      <div class="pulse-element element-1"></div>
      <div class="pulse-element element-2"></div>
      <div class="pulse-element element-3"></div>
      </div>

    <header class="chat-header">
      <div class="chat-title">AI Ассистент</div>
      <div class="header-buttons">
        <button @click="handleLogout">Выйти</button>
        <button @click="handleNavigateToHome">На главную</button>
      </div>
    </header>

    <main class="chat-main">
      <aside class="sidebar">
        <h2>История</h2>
        <div v-if="loadingHistory" class="history-loading">Загрузка...</div>
        <ul v-else class="history-list">
          <li v-if="lastQueries.length === 0" class="empty-history">История пуста</li>
          <li v-for="(item, index) in lastQueries" :key="item.id || index">
            <button @click="openHistoryModal(item)" :title="item.question">{{ truncateQuery(item.question) }}</button>
          </li>
        </ul>
        <button @click="fetchLastQueries" class="refresh-btn">Обновить</button>
      </aside>

      <section class="chat-area">
        <div class="messages-container">
          <div v-if="messages.length === 0" class="empty-chat">Начните диалог с AI</div>
          <transition-group name="message-transition" tag="div">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="['chat-message', message.sender === 'user' ? 'from-user' : 'from-ai']"
            >
              <div class="bubble">
                <strong>{{ message.sender === 'user' ? 'Вы' : 'ИИ' }}</strong>
                <p>{{ message.text }}</p>
              </div>
            </div>
          </transition-group>
          <div v-if="loadingAiResponse" class="chat-message from-ai">
            <div class="bubble loading">
              <span class="typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        </div>

        <div class="input-container">
          <textarea
            ref="textareaRef"
            v-model="userQuery"
            @input="adjustTextareaHeight"
            @keydown.enter.prevent="sendQuery"
            placeholder="Введите сообщение..."
            class="chat-input"
            rows="1"
          ></textarea>
          <button @click="sendQuery" class="send-button" :disabled="loadingAiResponse || !userQuery.trim()">
            <svg viewBox="0 0 24 24" fill="currentColor" class="send-icon">
              <path d="M7 11l5-5 5 5M7 13l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </section>
    </main>
    <HistoryModal
      :isVisible="showHistoryModal"
      :historyItem="selectedHistoryItem"
      @close="closeHistoryModal"
      @copy-query="copyQueryToInput"/>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, nextTick } from 'vue';
import HistoryModal from '@/components/HistoryModal.vue'; // ИСПРАВЛЕН ПУТЬ ИМПОРТА


const logoutFromApp = inject('logout');
const navigateToHomeFromApp = inject('navigateToHome');

const userQuery = ref('');
const messages = ref([]);
const lastQueries = ref([]);
const loadingAiResponse = ref(false);
const loadingHistory = ref(false);
const textareaRef = ref(null);

const showHistoryModal = ref(false);
const selectedHistoryItem = ref({});

let messageIdCounter = 0;
const consecutiveUserMessages = ref(0);


const openHistoryModal = (item) => {
  console.log('Открытие модального окна для элемента:', item);
  selectedHistoryItem.value = item;
  showHistoryModal.value = true;
  console.log('Текущее состояние showHistoryModal:', showHistoryModal.value);

};


const closeHistoryModal = () => {
  showHistoryModal.value = false;
  selectedHistoryItem.value = {}; 
};


const fetchLastQueries = async () => {
  loadingHistory.value = true;
  console.log('Запрос истории запросов...');
  try {
    const response = await fetch('http://localhost:8000/get_history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('AccessToken')}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('История получена:', data);
      lastQueries.value = data || [];
    } else {
      const errorData = await response.json();
      console.error('Ошибка получения истории:', response.status, errorData);
      // ИСПРАВЛЕНО: теперь это объект, как ожидается в v-for HistoryModal
      lastQueries.value = [{ id: 'error-load', question: 'Ошибка загрузки истории.', answer: 'Пожалуйста, попробуйте обновить страницу.' }];
    }
  } catch (error) {
    console.error('Ошибка сети при получении истории:', error);
    // ИСПРАВЛЕНО: теперь это объект
    lastQueries.value = [{ id: 'error-network', question: 'Ошибка сети.', answer: 'Проверьте ваше интернет-соединение.' }];
  } finally {
    loadingHistory.value = false;
  }
};

const sendQuery = async () => {
  if (!userQuery.value.trim() || loadingAiResponse.value) return;

  const queryToSend = userQuery.value.trim();

  let shouldAnimateRemoval = false;
  if (consecutiveUserMessages.value > 0) {
    shouldAnimateRemoval = true;
  }

  // --- Начинаем блок анимации до отправки запроса ИИ ---
  if (shouldAnimateRemoval) {
    // Удаляем последние 2 сообщения (пользовательское и ИИ-ответ)
    if (messages.value.length >= 2) {
        messages.value = messages.value.slice(0, messages.value.length - 2);
    } else {
        messages.value = []; // Если сообщений меньше двух, очищаем все
    }
    
    // Ждем, пока Vue обновит DOM и начнет анимацию "leave"
    await nextTick();
    // Ждем, пока анимация "leave" полностью завершится
    await new Promise(resolve => setTimeout(resolve, 800)); // !!! Соответствует длительности keyframes !!!
  }
  // --- Конец блока анимации ---

  // Только ПОСЛЕ завершения анимации (или сразу, если анимация не нужна)
  // добавляем новое сообщение пользователя и отправляем запрос к ИИ.
  messages.value.push({ id: messageIdCounter++, sender: 'user', text: queryToSend });
  userQuery.value = ''; // Очищаем поле ввода сразу после добавления сообщения
  
  consecutiveUserMessages.value++; // Увеличиваем счетчик при каждом сообщении пользователя

  loadingAiResponse.value = true;
  console.log('Отправка запроса ИИ:', queryToSend);

  try {
    const response = await fetch('http://localhost:8000/api/ask_ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('AccessToken')}`
      },
      body: JSON.stringify({ query: queryToSend }),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Ответ ИИ получен:', data);
      messages.value.push({ id: messageIdCounter++, sender: 'ai', text: data.answer || 'Извините, я не смог получить ответ.' });
      await fetchLastQueries();
      consecutiveUserMessages.value = 0; // Сбрасываем счетчик ТОЛЬКО при успешном ответе ИИ
    } else {
      const errorData = await response.json();
      console.error('Ошибка ответа ИИ:', response.status, errorData);
      messages.value.push({ id: messageIdCounter++, sender: 'ai', text: `Ошибка: ${errorData.detail || 'Неизвестная ошибка'}` });
      // consecutiveUserMessages.value НЕ сбрасывается здесь при ошибке
    }
  } catch (error) {
    console.error('Ошибка сети при запросе ИИ:', error);
    messages.value.push({ id: messageIdCounter++, sender: 'ai', text: 'Ошибка сети. Пожалуйста, попробуйте еще раз.' });
    // consecutiveUserMessages.value НЕ сбрасывается здесь при ошибке сети
  } finally {
    loadingAiResponse.value = false;
    await nextTick();
    adjustTextareaHeight();
    scrollToBottom();
  }
};

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`; 
    
    const maxHeight = 160; 
    if (textareaRef.value.scrollHeight > maxHeight) {
      textareaRef.value.style.overflowY = 'auto';
      textareaRef.value.style.height = `${maxHeight}px`;
    } else {
      textareaRef.value.style.overflowY = 'hidden';
    }
  }
};

const copyQueryToInput = (query) => {
  userQuery.value = query;
  nextTick(() => adjustTextareaHeight());
};

const truncateQuery = (query, maxLength = 25) => {
  return query.length > maxLength ? query.substring(0, maxLength) + '...' : query;
};

const scrollToBottom = () => {
  const chatMessages = document.querySelector('.messages-container');
  if (chatMessages) {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth' // Плавная прокрутка
    });
  }
};

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

onMounted(() => {
  fetchLastQueries();
  adjustTextareaHeight();
  nextTick(() => scrollToBottom());
});
</script>

<style scoped>
/* Общие стили и цвета */
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1e2a38; /* Основной фон */
  font-family: 'Segoe UI', sans-serif;
  color: #f0f0f0;
  position: relative; /* Для позиционирования пульсирующего фона */
  overflow: hidden; /* Обрезает фон, если он выходит за пределы */
}

/* Пульсирующий фон */
.pulsating-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0; /* Под всеми остальными элементами */
  /* backdrop-filter: blur(5px); */ /* Можно раскомментировать для эффекта матового стекла */
  /* -webkit-backdrop-filter: blur(5px); */
}

/* Общие стили для пульсирующих элементов */
.pulse-element {
  position: absolute;
  border-radius: 50%; /* Круглая форма */
  opacity: 0.15; /* Начальная прозрачность */
  filter: blur(80px); /* Увеличим размытие для более мягкого свечения */
  will-change: transform, opacity; /* Оптимизация */
  animation: pulse-and-move 25s infinite ease-in-out alternate; /* Новая анимация, длительность 25s */
}

/* Индивидуальные настройки для каждого элемента */
.element-1 {
  width: 600px;
  height: 600px;
  top: -150px;
  left: -150px;
  background: radial-gradient(circle at center, #4c80ff 0%, rgba(76, 128, 255, 0) 70%); /* Синий градиент */
  animation-duration: 22s; /* Разная длительность */
  animation-delay: 0s;
}

.element-2 {
  width: 800px;
  height: 800px;
  bottom: -200px;
  right: -200px;
  background: radial-gradient(circle at center, #93c5fd 0%, rgba(147, 197, 253, 0) 70%); /* Светло-синий градиент */
  animation-duration: 28s; /* Разная длительность */
  animation-delay: 8s; /* Разная задержка */
}

.element-3 {
  width: 450px;
  height: 450px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Центрирование */
  background: radial-gradient(circle at center, #6a0dad 0%, rgba(106, 13, 173, 0) 70%); /* Фиолетовый градиент */
  animation-duration: 20s; /* Разная длительность */
  animation-delay: 15s; /* Разная задержка */
}

/* Новая анимация для элемента 3 (может быть и для остальных) */
@keyframes pulse-and-move {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.1;
  }
  20% {
    transform: translate(30px, 40px) scale(1.08) rotate(5deg);
    opacity: 0.22;
  }
  40% {
    transform: translate(-20px, -30px) scale(0.95) rotate(-5deg);
    opacity: 0.15;
  }
  60% {
    transform: translate(10px, -50px) scale(1.03) rotate(8deg);
    opacity: 0.2;
  }
  80% {
    transform: translate(-40px, 20px) scale(0.97) rotate(-3deg);
    opacity: 0.12;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.1;
  }
}

/* 1. Хедер */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #273849; /* Темно-серый */
  padding: 12px 24px;
  display: flex;
  justify-content: space-between; /* Распределяем элементы по краям */
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Легкая тень */
  z-index: 10; /* Сверху пульсирующего фона */
}

.chat-title {
  font-size: 22px;
  font-weight: 600;
  color: #93c5fd; /* Светло-синий */
  margin-left: 10px; /* Отступ слева */
}

.header-buttons button {
  margin-left: 10px;
  padding: 8px 16px;
  background: #3c4b5e; /* Фон кнопок */
  border: none;
  color: #fff; /* Текст белый */
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s; /* Плавный переход для фона и цвета текста */
}

.header-buttons button:hover {
  background: #536476; /* При наведении */
  color: #93c5fd; /* Текст светло-синий */
}

/* 2. Основное содержимое (main) */
.chat-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 60px; /* Должен начинаться ровно под хедером */
  height: calc(100vh - 60px); /* Занимает оставшееся пространство */
  position: relative; /* Для z-index */
  z-index: 1; /* Над пульсирующим фоном */
}


/* 3. Сайдбар */
.sidebar {
  width: 260px; /* Фиксированная ширина */
  background: linear-gradient(to bottom, #1e293b, #0f172a); /* Градиент */
  padding: 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%; /* Занимает всю высоту chat-main */
  overflow: hidden;
}

.sidebar h2 {
  font-size: 20px; /* Крупный */
  font-weight: 600; /* Жирный */
  margin-bottom: 16px;
  color: #93c5fd; /* Светло-синий */
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(100% - 80px); /* Приблизительный отступ от заголовка и кнопки "обновить" */
  scrollbar-width: thin;
  padding-right: 15px; /* НОВОЕ: Добавляем отступ справа, чтобы анимация не вызывала скролл */
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-thumb {
  background-color: #475569;
  border-radius: 3px;
}

.history-list button {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #cbd5e1;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  font-size: 14px;

  min-height: 40px;
  height: 40px;
  line-height: 24px;

  display: block;
  width: calc(100% - 3px); /* НОВОЕ: Уменьшаем ширину на 3px, чтобы оставить место для сдвига */
  box-sizing: border-box;

  overflow: hidden; 
  white-space: nowrap; 
  text-overflow: ellipsis; 
}

.history-list button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(3px);
}

.empty-history {
  color: #64748b;
  font-style: italic;
}

.refresh-btn {
  margin-top: auto; /* Прижать к низу */
  padding: 10px;
  background: #3b82f6; /* Фон #3b82f6 */
  color: white; /* Текст белый */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  user-select: none;
}

.refresh-btn::before {
  content: '↻';
  font-size: 16px;
}

.refresh-btn:hover {
  background: #2563eb; /* При наведении */
}

.history-loading {
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

/* 4. Основная область чата */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px 20px; /* Отступы: 20px слева, справа, снизу. Сверху 0. */
  background: transparent; /* Теперь фон прозрачен, чтобы видеть пульсирующий фон */
  position: relative;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 10px;
  padding-top: 20px; /* Отступ сверху, чтобы сообщения начинались не сразу от края */
  position: relative; /* Для псевдоэлементов градиента */
}

/* Градиент "затухания" сверху */
.messages-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px; /* Высота градиента */
  background: linear-gradient(to bottom, #1e2a38, rgba(30, 42, 56, 0)); /* От цвета фона к прозрачному */
  z-index: 1; /* Поверх сообщений */
  pointer-events: none; /* Чтобы не блокировать прокрутку */
}

/* Градиент "затухания" снизу */
.messages-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px; /* Высота градиента */
  background: linear-gradient(to top, #1e2a38, rgba(30, 42, 56, 0)); /* От цвета фона к прозрачному */
  z-index: 1;
  pointer-events: none;
}


.empty-chat {
  color: #888;
  text-align: center;
  margin-top: 20px;
}

.chat-message {
  display: flex;
  /* Анимация появления (keyframes) */
  animation: fadeInUp 0.3s ease;
}

.chat-message.from-user {
  justify-content: flex-end;
}

.chat-message.from-ai {
  justify-content: flex-start;
}

.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 60%; /* Максимальная ширина */
  word-wrap: break-word;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.chat-message.from-user .bubble {
  background-color: #4c80ff; /* Фоновый цвет для пользователя */
  color: white; /* Текст белый */
  border-bottom-right-radius: 4px; /* Закругление углов */
}

.chat-message.from-ai .bubble {
  background-color: #3b4e65; /* Фоновый цвет для AI */
  color: #f1f1f1; /* Текст */
  border-bottom-left-radius: 4px; /* Закругление углов */
}

.bubble strong {
  font-size: 0.8em; /* Размер заголовков "Вы/ИИ" */
  opacity: 0.7; /* Прозрачность */
  display: block; /* Чтобы имя было над текстом сообщения */
  margin-bottom: 4px;
}

.bubble.loading {
  font-style: italic;
  color: #ccc;
  display: flex; /* Для выравнивания точек */
  align-items: flex-end; /* Выравнивание по нижней части текста */
  justify-content: center;
}

/* Анимация печати (typing indicator) */
.typing-indicator span {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
  color: #aaa; /* Цвет точек */
  font-size: 1.2em; /* Размер точек */
  line-height: 1; /* Убрать лишний пробел */
  margin: 0 1px;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px); /* Точки поднимаются */
  }
}

/* 5. Поле ввода (textarea) */
.input-container {
  display: flex;
  align-items: flex-end; /* Выравнивает элементы по нижнему краю */
  justify-content: center; /* Центрирование */
  gap: 12px; /* Расстояние между элементами */
  margin-top: 16px;
  padding-top: 10px; /* Добавим небольшой отступ сверху для контейнера ввода */
}

.chat-input {
  flex: 1; /* Позволяет textarea заполнить доступное пространство */
  min-height: 40px;
  max-height: 160px; /* Максимальная высота */
  resize: none; /* Пользователь не может растягивать */
  border: none; /* Границы отсутствуют */
  border-radius: 20px; /* Закругление углов */
  padding: 10px 16px;
  font-size: 16px;
  background: #2c3e50; /* Фон */
  color: white; /* Текст белый */
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: height 0.2s ease-out; /* Плавное изменение высоты */
}

.chat-input:focus {
  box-shadow: 0 0 0 3px rgba(76, 128, 255, 0.3); /* Синяя обводка при фокусе */
}

/* Стили для новой кнопки отправки */
.send-button {
  background-color: #ffffff; /* Белый фон */
  border: none;
  border-radius: 50%; /* Круглая форма */
  width: 40px; /* Ширина */
  height: 40px; /* Высота */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s; /* Быстрый transform для нажатия */
  flex-shrink: 0; /* Не сжимать кнопку */
}

.send-button:hover:not(:disabled) {
  background-color: #e0e0e0; /* Светлее при наведении */
  transform: translateY(-2px); /* Небольшое смещение вверх при наведении */
}

.send-button:active:not(:disabled) {
  transform: scale(0.95); /* Немного уменьшается при нажатии */
  background-color: #d0d0d0; /* Еще светлее */
}

.send-button:disabled {
  background-color: #cccccc; /* Серый фон для отключенной кнопки */
  cursor: not-allowed;
  opacity: 0.6;
}

.send-icon {
  width: 24px; /* Размер иконки */
  height: 24px;
  color: #1e2a38; /* Темный цвет стрелки (основной фон чата) */
}


/* 6. Анимация "уходящего" контекста */
/* Классы transition-group */
/* Анимация появления */
.message-transition-enter-active {
  transition: all 0.3s ease; /* Быстрое появление */
}

.message-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* Анимация исчезновения через keyframes */
.message-transition-leave-active {
  animation: fade-out-and-shrink 0.8s ease-in-out forwards; /* forwards сохраняет конечное состояние */
  overflow: hidden; /* Обрезает содержимое во время схлопывания */
  
  /* Начальные значения для smooth анимации keyframes */
  opacity: 1;
  transform: translateY(0) scale(1) scaleY(1);
  max-height: 1000px; /* Достаточно большое начальное значение, чтобы анимация max-height была видна */
  margin-bottom: 14px; 
  padding-top: 10px; 
  padding-bottom: 10px;
}

/* Этот класс теперь не нужен, так как конечное состояние определяется keyframes */
.message-transition-leave-to {
  /* Все эти свойства теперь задаются в keyframes */
}

/* Определяем keyframes для исчезающей анимации */
@keyframes fade-out-and-shrink {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    max-height: 1000px; /* Начальная высота, должна быть больше самой высокой баббл */
    margin-bottom: 14px; /* Начальный margin-bottom из .messages-container gap */
    padding-top: 10px; /* Начальные padding из .bubble */
    padding-bottom: 10px;
  }
  70% { 
    opacity: 0.2; 
    transform: translateY(10px) scale(0.9); /* Небольшое смещение и уменьшение */
    max-height: 50px; /* Начинает схлопываться */
    margin-bottom: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  100% {
    opacity: 0; 
    transform: translateY(20px) scale(0.8) scaleY(0); /* Полное схлопывание */
    max-height: 0; 
    margin-top: 0; /* Полностью убираем отступы */
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    pointer-events: none; /* Гарантируем, что элемент неактивен после исчезновения */
  }
}

/* Перемещение элементов, если они остаются в списке */
.message-transition-move {
  transition: transform 0.6s ease; 
}


/* Анимация появления (стандартная) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>