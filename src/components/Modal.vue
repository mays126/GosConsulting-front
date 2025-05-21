<script setup>
import { ref, watchEffect, inject } from 'vue';
import { useRouter } from 'vue-router'; // Импортируем useRouter

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close-modal']);
const router = useRouter(); // Получаем экземпляр роутера

const handleAuthChange = inject('handleAuthChange'); // Инжектим функцию из App.vue

const activeForm = ref('login'); // 'login' или 'register'
const loginUsername = ref('');
const loginPassword = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const errorMessage = ref('');

// Функция для очистки полей и сообщения об ошибке
const clearFieldsAndError = () => {
  loginUsername.value = '';
  loginPassword.value = '';
  registerUsername.value = '';
  registerPassword.value = '';
  registerConfirmPassword.value = '';
  errorMessage.value = '';
};

watchEffect(() => {
  if (props.isVisible) {
    document.body.style.overflow = 'hidden';
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    // Не сбрасываем ошибку и активную форму здесь, чтобы сообщение об успешной регистрации оставалось
    // errorMessage.value = '';
    // activeForm.value = 'login'; // Начинаем с формы входа только при первом открытии
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    // Очищаем поля при закрытии модального окна
    // clearFieldsAndError(); // Перенесено в обработчики закрытия
  }
});

const handleCloseModal = () => {
  clearFieldsAndError();
  emit('close-modal');
};


const showLogin = () => {
  activeForm.value = 'login';
  errorMessage.value = ''; // Очищаем ошибку при переключении
};

const showRegister = () => {
  activeForm.value = 'register';
  errorMessage.value = ''; // Очищаем ошибку при переключении
};

const checkPasswordMismatch = () => {
  if (registerPassword.value !== registerConfirmPassword.value && registerConfirmPassword.value !== '') {
    errorMessage.value = 'Пароли не совпадают!';
    return true;
  } else {
    // Очищаем ошибку только если это была ошибка о несовпадении паролей
    if (errorMessage.value === 'Пароли не совпадают!') {
      errorMessage.value = '';
    }
    return false;
  }
};

const loginUser = async () => {
  errorMessage.value = '';
  try {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: loginUsername.value,
        password: loginPassword.value,
      }),
      credentials: 'include',
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Вход успешен:', data);
      localStorage.setItem('AccessToken', data.access_token);
      handleAuthChange(); // Уведомляем App.vue об изменении состояния аутентификации
      clearFieldsAndError(); // Очищаем поля
      emit('close-modal');   // Закрываем модальное окно
      router.push({ name: 'Chat' }); // Перенаправляем на страницу чата
    } else {
      if (response.status === 401 || response.status === 400) {
        errorMessage.value = data.detail || 'Неверный логин или пароль.';
      } else {
        errorMessage.value = data.detail || data.message || 'Ошибка входа. Проверьте данные.';
      }
      console.error('Ошибка входа:', data, response.status);
    }
  } catch (error) {
    console.error('Ошибка сети или сервера при входе:', error);
    errorMessage.value = 'Произошла ошибка при попытке входа. Попробуйте еще раз.';
  }
};

const registerUser = async () => {
  errorMessage.value = '';
  if (checkPasswordMismatch()) {
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: registerUsername.value,
        password: registerPassword.value,
      }),
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Регистрация успешна:', data);
      // Если сервер возвращает токен при регистрации (авто-логин)
      if (data.access_token) {
        localStorage.setItem('AccessToken', data.access_token);
        handleAuthChange();
        clearFieldsAndError();
        emit('close-modal');
        router.push({ name: 'Chat' });
      } else {
        // Если авто-логина нет, переключаем на форму входа и показываем сообщение
        const registeredUsername = registerUsername.value; // Сохраняем перед очисткой
        clearFieldsAndError();
        activeForm.value = 'login';
        loginUsername.value = registeredUsername; // Предзаполняем имя пользователя
        errorMessage.value = 'Регистрация успешна! Теперь вы можете войти.';
        // Не закрываем модальное окно, чтобы пользователь мог войти
      }
    } else {
      if (response.status === 400 && data.detail === "User already exsists") { // Опечатка "exsists" из вашего кода
        errorMessage.value = "Пользователь с таким именем уже существует";
      } else {
        errorMessage.value = data.detail || data.message || 'Ошибка регистрации. Попробуйте еще раз.';
      }
      console.error('Ошибка регистрации:', data);
    }
  } catch (error) {
    console.error('Ошибка сети или сервера при регистрации:', error);
    errorMessage.value = 'Произошла ошибка при попытке регистрации. Попробуйте еще раз.';
  }
};
</script>

<template>
  <teleport to="body">
    <div :class="['modal-overlay', { 'is-visible': isVisible }]" @click.self="handleCloseModal">
      <div class="modal-content">
        <button class="close-button" @click="handleCloseModal">&times;</button>
        <h2 id="modal-title" class="modal-title">{{ activeForm === 'login' ? 'Вход' : 'Регистрация' }}</h2>

        <div v-if="activeForm === 'login'">
          <div class="input-group mb-4">
            <label for="login-username" class="block text-gray-400 text-sm font-bold mb-2">Имя пользователя:</label>
            <input type="text" id="login-username" placeholder="Введите ваше имя" class="form-input" v-model="loginUsername">
          </div>
          <div class="input-group mb-6">
            <label for="login-password" class="block text-gray-400 text-sm font-bold mb-2">Пароль:</label>
            <input type="password" id="login-password" placeholder="Введите пароль" class="form-input" v-model="loginPassword" @keyup.enter="loginUser">
          </div>
          <p v-if="errorMessage && activeForm === 'login'" class="error-message text-red-400 text-center text-sm mb-4">{{ errorMessage }}</p>
          <button id="login-button" type="button" class="button-primary font-bold mb-2" @click="loginUser">Войти</button>
          <p class="text-center text-gray-400 text-base">Нет аккаунта? <a href="#" class="text-blue-400 hover:underline" @click.prevent="showRegister">Зарегистрироваться</a></p>
        </div>

        <div v-if="activeForm === 'register'">
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
          <p v-if="errorMessage && activeForm === 'register'" class="error-message text-red-400 text-center text-sm mb-4">{{ errorMessage }}</p>
          <button id="register-button" type="button" class="button-primary font-bold mb-2" @click="registerUser">Зарегистрироваться</button>
          <p class="text-center text-gray-400 text-base">Уже есть аккаунт? <a href="#" class="text-blue-400 hover:underline" @click.prevent="showLogin">Войти</a></p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style>
/* Ваши стили остаются без изменений */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.is-visible {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background-color: #1F2937; /* Tailwind bg-gray-800 */
    padding: 2.5rem 2rem; /* 40px 32px */
    border-radius: 0.75rem; /* 12px */
    max-width: 450px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    position: relative;
    color: #E5E7EB; /* Tailwind text-gray-200 */
    transform: translateY(20px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-overlay.is-visible .modal-content {
    transform: translateY(0);
    opacity: 1;
}

.close-button {
    position: absolute;
    top: 1rem; /* 16px */
    right: 1rem; /* 16px */
    background: none;
    border: none;
    font-size: 2rem; /* 32px */
    line-height: 1;
    color: #9CA3AF; /* Tailwind text-gray-400 */
    cursor: pointer;
    transition: color 0.3s ease;
}

.close-button:hover {
    color: #E5E7EB; /* Tailwind text-gray-200 */
}

.modal-title {
    font-size: 2rem; /* 32px */
    font-weight: bold;
    color: #93C5FD; /* Tailwind text-blue-300 */
    text-align: center;
    margin-bottom: 2rem; /* 32px */
}

.input-group label {
    font-weight: 600; /* semibold */
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem; /* 12px 16px */
    background-color: #374151; /* Tailwind bg-gray-700 */
    border: 1px solid #4B5563; /* Tailwind border-gray-600 */
    border-radius: 0.375rem; /* 6px */
    color: #E5E7EB; /* Tailwind text-gray-200 */
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input::placeholder {
    color: #9CA3AF; /* Tailwind text-gray-400 */
}

.form-input:focus {
    border-color: #60A5FA; /* Tailwind border-blue-500 */
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.5); /* Синяя тень при фокусе */
}

.button-primary {
    width: 100%;
    padding: 0.75rem 1.5rem; /* 12px 24px */
    background-color: #60A5FA; /* Tailwind bg-blue-500 */
    color: white;
    border-radius: 0.375rem; /* 6px */
    font-size: 1.125rem; /* 18px */
    font-weight: bold; /* Добавил для соответствия заголовку */
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
}

.button-primary:hover {
    background-color: #3B82F6; /* Tailwind bg-blue-600 */
    transform: translateY(-1px);
}

.button-primary:active {
    transform: translateY(0);
}

.error-message {
    /* color: #EF4444; */ /* Tailwind text-red-500 - уже есть в <p> */
    font-weight: 500; /* medium */
}
</style>
