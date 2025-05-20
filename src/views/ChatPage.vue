<script setup>
import { ref, onMounted, nextTick } from 'vue';

// Reactive state
const messages = ref([]); // Stores current chat messages: [{ type: 'user' | 'ai', text: string }]
const currentInput = ref(''); // Input field value
const isLoading = ref(false); // Loading indicator for AI response
const history = ref([]); // Stores 10 recent Q&A from backend
const isHistoryOpen = ref(false); // Controls history sidebar visibility
const chatMessagesContainer = ref(null); // Ref to scroll chat to bottom

// --- Methods ---

// Function to send message to AI
const sendMessage = async () => {
    if (!currentInput.value.trim()) return; // Don't send empty messages

    const userQuery = currentInput.value;
    messages.value.push({ type: 'user', text: userQuery }); // Add user message
    currentInput.value = ''; // Clear input immediately
    scrollToBottom(); // Scroll to show new message

    isLoading.value = true; // Show loading indicator

    try {
        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userQuery }),
        });

        const data = await response.json();

        if (response.ok) {
            const aiAnswer = data.answer || "Извините, не удалось получить ответ.";
            messages.value.push({ type: 'ai', text: aiAnswer }); // Add AI response
            // Update history (optimistically add new item)
            history.value.unshift({ // Add to the beginning
                id: Date.now().toString(), // Simple unique ID for now
                query: userQuery,
                answer: aiAnswer
            });
            if (history.value.length > 10) { // Keep only last 10
                history.value.pop();
            }
        } else {
            messages.value.push({ type: 'ai', text: `Ошибка: ${data.message || 'Неизвестная ошибка на сервере.'}` });
            console.error('AI API Error:', data);
        }
    } catch (error) {
        messages.value.push({ type: 'ai', text: 'Произошла ошибка при подключении к ИИ. Пожалуйста, попробуйте позже.' });
        console.error('Network or server error:', error);
    } finally {
        isLoading.value = false; // Hide loading indicator
        scrollToBottom(); // Scroll after AI response
    }
};

// Function to fetch chat history from backend
const fetchHistory = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/history');
        const data = await response.json();
        if (response.ok) {
            history.value = data.slice(0, 10); // Take only the last 10 items
        } else {
            console.error('Failed to fetch history:', data);
        }
    } catch (error) {
        console.error('Error fetching history:', error);
    }
};

// Function to scroll chat messages to the bottom
const scrollToBottom = () => {
    nextTick(() => {
        if (chatMessagesContainer.value) {
            chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
        }
    });
};

// Function to load a history item back into the input or display it
const loadHistoryItem = (item) => {
    currentInput.value = item.query;
    // Optionally, you could also clear current messages and display this history item in main chat
    // For now, let's just populate the input
};

// Function to toggle history sidebar visibility
const toggleHistory = () => {
    isHistoryOpen.value = !isHistoryOpen.value;
};

// --- Lifecycle Hooks ---
onMounted(() => {
    fetchHistory(); // Load history when component mounts
    scrollToBottom(); // Scroll to bottom initially
});

// Watch messages array to automatically scroll when new messages are added
watchEffect(() => {
    if (messages.value.length > 0) {
        scrollToBottom();
    }
});
</script>

<template>
    <div class="chat-page-container">
        <aside :class="['chat-history-sidebar', { 'open': isHistoryOpen }]">
            <button class="toggle-history-btn" @click="toggleHistory">
                {{ isHistoryOpen ? '&times;' : 'История' }}
            </button>
            <h3 class="sidebar-title">Последние запросы</h3>
            <div class="history-list">
                <p v-if="history.length === 0" class="text-gray-500 text-center text-sm mt-4">История пуста.</p>
                <div v-for="item in history" :key="item.id" class="history-item" @click="loadHistoryItem(item)">
                    <p class="history-query">{{ item.query }}</p>
                    <p class="history-response">{{ item.answer.substring(0, 50) }}...</p>
                </div>
            </div>
        </aside>

        <div class="main-chat-area">
            <div class="ai-disclaimer-banner">
                <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                <p>
                    Внимание: ИИ не хранит контекст беседы. Каждый запрос обрабатывается независимо.
                    Мы используем технологию Google Gemini.
                </p>
            </div>

            <div ref="chatMessagesContainer" class="chat-messages-display">
                <div v-for="(message, index) in messages" :key="index" :class="['chat-bubble', message.type]">
                    <div class="bubble-content">{{ message.text }}</div>
                </div>
                <div v-if="isLoading" class="chat-bubble ai loading">
                    <div class="bubble-content">
                        <span class="dot-animation"></span>
                        <span class="dot-animation delay-1"></span>
                        <span class="dot-animation delay-2"></span>
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <input
                    type="text"
                    v-model="currentInput"
                    @keyup.enter="sendMessage"
                    placeholder="Введите ваш запрос..."
                    class="chat-input"
                    :disabled="isLoading"
                />
                <button @click="sendMessage" :disabled="isLoading" class="send-button">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Importing modal styles from a dedicated file (assuming it exists) */
@import "../assets/css/chat-page.css";

/* Basic dot animation for loading state */
.dot-animation {
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: #93C5FD;
    border-radius: 50%;
    margin: 0 2px;
    animation: bounce 1s infinite;
}

.dot-animation.delay-1 { animation-delay: 0.1s; }
.dot-animation.delay-2 { animation-delay: 0.2s; }

@keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-5px); }
}
</style>    