<template>
  <div class="chat-wrapper">
    <div class="pulsating-background">
      <div class="pulse-element element-1"></div>
      <div class="pulse-element element-2"></div>
      <div class="pulse-element element-3"></div>
    </div>

    <header class="chat-header">
      <button
        class="burger-btn"
        @click="toggleSidebar"
        aria-label="Открыть меню"
      >
        <span></span><span></span><span></span>
      </button>
      <div class="chat-title">AI Ассистент</div>
      <div class="header-buttons">
        <button @click="handleLogout">Выйти</button>
        <button @click="handleNavigateToHome">На главную</button>
      </div>
    </header>

    <main class="chat-main">
      <aside
        class="sidebar"
        :class="{ 'sidebar-mobile': isMobile, 'sidebar-open': isSidebarOpen }"
        v-show="!isMobile || isSidebarOpen"
      >
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

      <section class="chat-area" :class="{ 'blurred': isMobile && isSidebarOpen }">

        <div class="messages-container">
          <div v-if="messages.length === 0" class="empty-chat">Начните диалог с AI</div>
          <transition-group name="message-transition" tag="div">
            <div v-for="message in messages" :key="message.id"
              :class="['chat-message', message.sender === 'user' ? 'from-user' : 'from-ai']">
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
          <textarea ref="textareaRef" v-model="userQuery" @input="adjustTextareaHeight"
            @keydown.enter.prevent="sendQuery" placeholder="Введите сообщение..." class="chat-input"
            rows="1"></textarea>
          <button @click="sendQuery" class="send-button" :disabled="loadingAiResponse || !userQuery.trim()">
            <svg viewBox="0 0 24 24" fill="currentColor" class="send-icon">
              <path d="M7 11l5-5 5 5M7 13l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </main>
    <HistoryModal :isVisible="showHistoryModal" :historyItem="selectedHistoryItem" @close="closeHistoryModal"
      @copy-query="copyQueryToInput" />
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

const isSidebarOpen = ref(false);
const isMobile = ref(false);


const showHistoryModal = ref(false);
const selectedHistoryItem = ref({});

let messageIdCounter = 0;
const consecutiveUserMessages = ref(0);


const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) isSidebarOpen.value = false;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

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
    } else if (response.status == 401) {
      const response_refresh = await fetch('http://localhost:8000/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const refresh_data = await response_refresh.json();
      if (response_refresh.ok) {
        localStorage.setItem("AccessToken", refresh_data.access_token);
        const response_retry = await fetch('http://localhost:8000/get_history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('AccessToken')}`
          },
          credentials: 'include'
        });
        const retry_data = await response_retry.json();
        lastQueries.value = retry_data || [];
      } else {
        messages.value.push({ id: messageIdCounter++, sender: 'ai', text: `Ошибка: ${errorData.detail || 'Неизвестная ошибка'}` });
      }

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
      console.log("Дошел");
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
    const response = await fetch('http://localhost:8000/send_request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('AccessToken')}`
      },
      body: JSON.stringify({ question: queryToSend }),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Ответ ИИ получен:', data);
      messages.value.push({ id: messageIdCounter++, sender: 'ai', text: data || 'Извините, я не смог получить ответ.' });
      await fetchLastQueries();
    } else if (response.status == 401) {
      const response_refresh = await fetch('http://localhost:8000/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      data = await response_refresh.json();
      if (response_refresh.ok) {
        localStorage.setItem("AccessToken", data.access_token);
        const response = await fetch('http://localhost:8000/send_request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('AccessToken')}`
          },
          body: JSON.stringify({ query: queryToSend }),
          credentials: 'include'
        });
        console.log('Ответ ИИ получен:', data);
        messages.value.push({ id: messageIdCounter++, sender: 'ai', text: data.answer || 'Извините, я не смог получить ответ.' });
        await fetchLastQueries();
      } else {
        messages.value.push({ id: messageIdCounter++, sender: 'ai', text: `Ошибка: ${errorData.detail || 'Неизвестная ошибка'}` });
      }

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

  checkMobile();
  window.addEventListener('resize', checkMobile);
});
</script>

<style scoped>
@import "../assets/css/chat.css";
</style>