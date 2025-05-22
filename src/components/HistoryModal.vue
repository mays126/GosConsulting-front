<template>
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close-button" @click="closeModal">×</button>
          <h3>История запроса</h3>
          <div class="chat-screenshot">
            <div class="chat-message from-user">
              <div class="bubble">
                <strong>Вы</strong>
                <p>{{ historyItem.question }}</p>
              </div>
            </div>
            <div class="chat-message from-ai">
              <div class="bubble">
                <strong>ИИ</strong>
                <p>{{ historyItem.answer }}</p>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="copyQueryToInputAndClose(historyItem.question)" class="action-button">Копировать запрос</button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, watch } from 'vue';
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true
    },
    historyItem: {
      type: Object,
      default: () => ({ question: '', answer: '' })
    }
  });
  
  const emit = defineEmits(['close', 'copy-query']);
  
  const closeModal = () => {
    emit('close');
  };
  
  const copyQueryToInputAndClose = (query) => {
    emit('copy-query', query);
    closeModal();
  };
  
  // Блокировка прокрутки фона при открытом модальном окне
  watch(() => props.isVisible, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  </script>
  
  <style scoped>
  /* Стили для overlay и модального окна */
  /* Увеличенная специфичность для modal-overlay */
  body .modal-overlay { /* Добавлен 'body' для большей специфичности */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.5) !important; /* Временно ярко-красный для отладки, с прозрачностью */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999 !important; /* ОЧЕНЬ ВЫСОКИЙ Z-INDEX ДЛЯ ТЕСТИРОВАНИЯ! */
  
    /* Эффект блюра на заднем фоне */
    backdrop-filter: blur(8px); /* Это применит блюр к тому, что ПОД overlay */
    -webkit-backdrop-filter: blur(8px); /* Для совместимости с Safari */
  }
   
  /* Увеличенная специфичность для modal-content */
  body .modal-content { /* Добавлен 'body' для большей специфичности */
    background: #0000FF !important; /* Временно синий фон для отладки */
    border-radius: 12px;
    padding: 25px 30px;
    max-width: 600px; /* Максимальная ширина */
    width: 90%; /* Адаптивная ширина */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    color: #FFFF00 !important; /* Временно желтый текст для отладки */
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
   
  .modal-close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    color: #cbd5e1;
    cursor: pointer;
    transition: color 0.2s;
  }
   
  .modal-close-button:hover {
    color: #93c5fd;
  }
   
  h3 {
    font-size: 22px;
    color: #93c5fd;
    margin-bottom: 15px;
    text-align: center;
  }
   
  /* Стили для "скриншота чата" - используем ваши существующие стили */
  .chat-screenshot {
    background: #1e2a38; /* Фон, имитирующий чат-область */
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px; /* Ограничим высоту, чтобы не было слишком длинных модальных окон */
    overflow-y: auto; /* Прокрутка, если содержимое слишком длинное */
    border: 1px solid rgba(255, 255, 255, 0.1); /* Тонкая рамка */
  }
   
  /* Переиспользуем стили из ChatView для сообщений */
  .chat-message {
    display: flex;
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
    max-width: 90%; /* Чуть шире для модалки */
    word-wrap: break-word;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
   
  .chat-message.from-user .bubble {
    background-color: #4c80ff;
    color: white;
    border-bottom-right-radius: 4px;
  }
   
  .chat-message.from-ai .bubble {
    background-color: #3b4e65;
    color: #f1f1f1;
    border-bottom-left-radius: 4px;
  }
   
  .bubble strong {
    font-size: 0.8em;
    opacity: 0.7;
    display: block;
    margin-bottom: 4px;
  }
   
  .modal-actions {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }
   
  .action-button {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 15px;
  }
   
  .action-button:hover {
    background: #2563eb;
  }
   
  /* Анимация появления/исчезновения модального окна */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
   
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0 !important; /* Убедитесь, что начальная/конечная прозрачность правильно контролируется */
    transform: translateY(-20px) scale(0.95) !important; /* Убедитесь, что трансформация правильно контролируется */
  }
  </style>