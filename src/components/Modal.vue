<script setup>
import { ref, watchEffect, onMounted, nextTick } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close-modal']);

// Reactive state for managing form input values
const loginUsername = ref('');
const loginPassword = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const errorMessage = ref(''); // To display server-side errors or other messages

// Watch for changes in isVisible to toggle body scroll lock
watchEffect(() => {
  if (props.isVisible) {
    document.body.style.overflow = 'hidden';
    // Calculate scrollbar width and apply padding-right
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    errorMessage.value = ''; // Clear error message when modal opens
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    // Clear form inputs when modal closes
    loginUsername.value = '';
    loginPassword.value = '';
    registerUsername.value = '';
    registerPassword.value = '';
    registerConfirmPassword.value = '';
  }
});

// Functions to switch forms in the modal
const showLogin = () => {
  nextTick(() => {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('modal-title').textContent = 'Вход';
    errorMessage.value = ''; // Clear messages when switching forms
  });
};

const showRegister = () => {
  nextTick(() => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Регистрация';
    errorMessage.value = ''; // Clear messages when switching forms
  });
};

// Check for password mismatch
const checkPasswordMismatch = () => {
  if (registerPassword.value !== registerConfirmPassword.value && registerConfirmPassword.value !== '') {
    errorMessage.value = 'Пароли не совпадают!';
    return true;
  } else {
    errorMessage.value = '';
    return false;
  }
};

// --- API Request Functions ---

// Function to handle user login
const loginUser = async () => {
  errorMessage.value = ''; // Clear previous errors

  try {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Вход успешен:', data);
      localStorage.setItem('AccessToken', data.access_token);
      emit('close-modal'); // Close modal on successful login
      alert('Вход успешен!'); // Simple success feedback
    } else {
      errorMessage.value = data.message || 'Ошибка входа. Проверьте данные.';
      console.error('Ошибка входа:', data);
    }
  } catch (error) {
    console.error('Ошибка сети или сервера при входе:', error);
    errorMessage.value = 'Произошла ошибка при попытке входа. Попробуйте еще раз.';
  }
};

// Function to handle user registration
const registerUser = async () => {
  errorMessage.value = ''; // Clear previous errors

  if (checkPasswordMismatch()) {
    return; // Stop if passwords don't match
  }

  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerUsername.value,
        password: registerPassword.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Регистрация успешна:', data);
    //   localStorage.setItem('AccessToken', data.access_token);
      emit('close-modal'); // Close modal on successful registration
      alert('Регистрация успешна! Теперь вы можете войти.'); // Simple success feedback
    } else {
      errorMessage.value = data.message || 'Ошибка регистрации. Попробуйте другое имя пользователя.';
      console.error('Ошибка регистрации:', data);
    }
  } catch (error) {
    console.error('Ошибка сети или сервера при регистрации:', error);
    errorMessage.value = 'Произошла ошибка при попытке регистрации. Попробуйте еще раз.';
  }
};

// --- Lifecycle Hooks and DOM interactions ---

onMounted(() => {
  // Use nextTick to ensure DOM elements are available if the modal is initially visible
  nextTick(() => {

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegister();
    });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLogin();
    });
  });
});
</script>

<template>
  <teleport to="body">
    <div :class="['modal-overlay', { 'is-visible': isVisible }]" @click.self="emit('close-modal')">
      <div class="modal-content">
        <button class="close-button" @click="emit('close-modal')">&times;</button>
        <h2 id="modal-title" class="modal-title">Вход</h2>

        <div id="login-form">
          <div class="input-group mb-4">
            <label for="login-username" class="block text-gray-400 text-sm font-bold mb-2">Имя пользователя:</label>
            <input type="text" id="login-username" placeholder="Введите ваше имя" class="form-input" v-model="loginUsername">
          </div>
          <div class="input-group mb-6">
            <label for="login-password" class="block text-gray-400 text-sm font-bold mb-2">Пароль:</label>
            <input type="password" id="login-password" placeholder="Введите пароль" class="form-input" v-model="loginPassword" @keyup.enter="loginUser">
          </div>
          <p v-if="errorMessage && !document.getElementById('register-form')?.classList.contains('hidden')" class="error-message text-red-400 text-center text-sm mb-4">{{ errorMessage }}</p>

          <button id="login-button" type="button" class="button-primary font-bold mb-2" @click="loginUser">Войти</button>
          <p class="text-center text-gray-400 text-base">Нет аккаунта? <a href="#" id="show-register" class="text-blue-400 hover:underline">Зарегистрироваться</a></p>
        </div>

        <div id="register-form" class="hidden">
          <div class="input-group mb-4">
            <label for="register-username" class="block text-gray-400 text-sm font-bold mb-2">Имя пользователя:</label>
            <input type="text" id="register-username" placeholder="Введите ваше имя" class="form-input" v-model="registerUsername">
          </div>
          <div class="input-group mb-4">
            <label for="register-password" class="block text-gray-400 text-sm font-bold mb-2">Пароль:</label>
            <input type="password" id="register-password" placeholder="Введите пароль" class="form-input" v-model="registerPassword" @input="checkPasswordMismatch">
          </div>
          <div class="input-group mb-6">
            <label for="register-confirm-password" class="block text-gray-400 text-sm font-bold mb-2">Подтвердите пароль:</label>
            <input type="password" id="register-confirm-password" placeholder="Подтвердите пароль" class="form-input" v-model="registerConfirmPassword" @input="checkPasswordMismatch" @keyup.enter="registerUser">
          </div>
          <p v-if="errorMessage && !document.getElementById('login-form')?.classList.contains('hidden')" class="error-message text-red-400 text-center text-sm mb-4">{{ errorMessage }}</p>

          <button id="register-button" type="button" class="button-primary font-bold mb-2" @click="registerUser">Зарегистрироваться</button>
          <p class="text-center text-gray-400 text-base">Уже есть аккаунт? <a href="#" id="show-login" class="text-blue-400 hover:underline">Войти</a></p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style>
/* Global modal styles can go here or in a dedicated modal.css */
/* These styles ensure the modal appears correctly and is responsive */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* Dark semi-transparent overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Ensure it's on top of other content */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.is-visible {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background-color: #1F2937; /* Darker background for the modal itself */
    padding: 2.5rem 2rem;
    border-radius: 0.75rem; /* Rounded corners */
    max-width: 450px; /* Max width for readability */
    width: 90%; /* Responsive width */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    position: relative;
    color: #E5E7EB; /* Light text color */
    transform: translateY(20px); /* Initial state for entry animation */
    opacity: 0; /* Initial state for entry animation */
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-overlay.is-visible .modal-content {
    transform: translateY(0);
    opacity: 1;
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #9CA3AF;
    cursor: pointer;
    transition: color 0.3s ease;
}

.close-button:hover {
    color: #E5E7EB;
}

.modal-title {
    font-size: 2rem;
    font-weight: bold;
    color: #93C5FD; /* Blue color for titles */
    text-align: center;
    margin-bottom: 2rem;
}

.input-group label {
    font-weight: 600;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #374151; /* Dark input background */
    border: 1px solid #4B5563; /* Subtle border */
    border-radius: 0.375rem;
    color: #E5E7EB; /* Light text color in input */
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input::placeholder {
    color: #9CA3AF;
}

.form-input:focus {
    border-color: #60A5FA; /* Blue border on focus */
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.5);
}

.button-primary {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background-color: #60A5FA; /* Blue button */
    color: white;
    border-radius: 0.375rem;
    font-size: 1.125rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
}

.button-primary:hover {
    background-color: #3B82F6; /* Darker blue on hover */
    transform: translateY(-1px);
}

.button-primary:active {
    transform: translateY(0);
}

.error-message {
    color: #EF4444; /* Red for error messages */
    font-weight: 500;
}
</style>