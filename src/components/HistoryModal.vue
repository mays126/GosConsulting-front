<template>
    <transition name="modal-fade-hist" v-if="isVisible">
      <div class="modal-overlay-hist" @click.self="closeModal">
        <div class="modal-content-hist">
          <button class="modal-close-button-hist" @click="closeModal">×</button>
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
          <div class="modal-actions-hist">
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


watch(() => props.isVisible, (val) => {
  console.log('Modal visibility changed:', val);
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
  /* Модальное оверлей */
  body .modal-overlay-hist {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 23, 42, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999 !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeInOverlay 0.4s ease forwards;
  }
  
  /* Анимация появления overlay */
  @keyframes fadeInOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  /* Содержимое модального окна */
  body .modal-content-hist {
    background: #1e293b;
    border-radius: 12px;
    padding: 25px 30px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
    position: relative;
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
    animation: modalPopIn 0.5s ease forwards;
  }
  
  @keyframes modalPopIn {
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  /* Кнопка закрытия */
  .modal-close-button-hist {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .modal-close-button-hist:hover {
    color: #60a5fa;
  }
  
  /* Заголовок */
  h3 {
    font-size: 22px;
    color: #60a5fa;
    margin-bottom: 15px;
    text-align: center;
  }
  
  /* Скриншот чата */
  .chat-screenshot {
    background: #0f172a;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeInChat 0.4s ease forwards;
  }
  
  /* Кастомный скроллбар */
  .chat-screenshot::-webkit-scrollbar {
    width: 8px;
  }
  
  .chat-screenshot::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .chat-screenshot::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
  
  .chat-screenshot::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  @keyframes fadeInChat {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Сообщения чата */
  .chat-message {
    display: flex;
    opacity: 0;
    animation: slideMessage 0.4s ease forwards;
  }
  
  .chat-message.from-user {
    justify-content: flex-end;
  }
  
  .chat-message.from-ai {
    justify-content: flex-start;
  }
  
  @keyframes slideMessage {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .bubble {
    padding: 10px 14px;
    border-radius: 16px;
    max-width: 90%;
    word-wrap: break-word;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: background 0.2s ease;
  }
  
  .chat-message.from-user .bubble {
    background-color: #3b82f6;
    color: white;
    border-bottom-right-radius: 4px;
  }
  
  .chat-message.from-ai .bubble {
    background-color: #334155;
    color: #f1f5f9;
    border-bottom-left-radius: 4px;
  }
  
  .bubble strong {
    font-size: 0.8em;
    opacity: 0.7;
    display: block;
    margin-bottom: 4px;
  }
  
  /* Кнопки действий */
  .modal-actions-hist {
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
    transition: background 0.3s, transform 0.2s;
    font-size: 15px;
  }
  
  .action-button:hover {
    background: #2563eb;
    transform: scale(1.05);
  }
  
  /* Анимации появления/исчезновения */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0 !important;
    transform: translateY(-20px) scale(0.95) !important;
  }
  </style>
  