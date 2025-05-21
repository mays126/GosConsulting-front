<script setup>
import { ref, onMounted, provide, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Импортируем useRouter и useRoute
import HamburgerMenu from './components/HamburgerMenu.vue';
import Modal from './components/Modal.vue';
import AppFooter from './components/AppFooter.vue';

const router = useRouter();
const route = useRoute(); // Используем useRoute для доступа к текущему маршруту

const isMenuOpen = ref(false);
const isModalVisible = ref(false);
const lastScrollY = ref(0);
const mainNavigationRef = ref(null);

// Реактивное состояние для отслеживания аутентификации
const isAuthenticated = ref(false);

// Проверяем, является ли текущий маршрут маршрутом чата
const isChatRoute = ref(false);
watch(
  () => route.name,
  (newName) => {
    isChatRoute.value = newName === 'Chat';
    // Дополнительно: если уходим с чата, убедимся, что меню не фиксировано
    if (!isChatRoute.value && document.body.classList.contains('menu-open')) {
      toggleMenu(false); // Принудительно закрываем меню, если пользователь ушел с чата
    }
  },
  { immediate: true } // Выполнить сразу при монтировании
);


// Функция для обновления состояния аутентификации
const updateAuthState = () => {
  isAuthenticated.value = !!localStorage.getItem('AccessToken');
  console.log('isAuthenticated updated:', isAuthenticated.value);
};

// Обновляем состояние при монтировании и при изменении localStorage (для синхронизации между вкладками)
onMounted(() => {
  updateAuthState();
  window.addEventListener('storage', (event) => {
    if (event.key === 'AccessToken') {
      updateAuthState();
    }
  });
});

// Watch за изменениями localStorage.getItem('AccessToken') все еще полезен
watch(() => localStorage.getItem('AccessToken'), (newValue, oldValue) => {
  if (newValue !== oldValue) {
    updateAuthState();
  }
});


const toggleMenu = (forceState) => {
  const newState = forceState !== undefined ? forceState : !isMenuOpen.value;
  if (newState === isMenuOpen.value) return;

  isMenuOpen.value = newState;
  const body = document.body;
  const navigationElement = mainNavigationRef.value;

  if (isMenuOpen.value) {
    lastScrollY.value = window.scrollY;
    body.style.top = `-${lastScrollY.value}px`;
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.overflowY = 'hidden';
    body.classList.add('menu-open');
    if (navigationElement) navigationElement.style.visibility = 'visible';
  } else {
    body.classList.remove('menu-open');
    if (navigationElement) {
      const handleTransitionEnd = () => {
        if (!isMenuOpen.value) {
          navigationElement.style.visibility = 'hidden';
          body.style.position = '';
          body.style.top = '';
          body.style.width = '';
          body.style.overflowY = '';
          window.scrollTo({ top: lastScrollY.value, behavior: 'auto' });
        }
        if (navigationElement.getAttribute('data-transition-listener') === 'true') {
          navigationElement.removeEventListener('transitionend', handleTransitionEnd);
          navigationElement.removeAttribute('data-transition-listener');
        }
      };
      if (navigationElement.getAttribute('data-transition-listener') !== 'true') {
        navigationElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
        navigationElement.setAttribute('data-transition-listener', 'true');
      } else {
          if (!isMenuOpen.value) {
             navigationElement.style.visibility = 'hidden';
             body.style.position = '';
             body.style.top = '';
             body.style.width = '';
             body.style.overflowY = '';
             window.scrollTo({ top: lastScrollY.value, behavior: 'auto' });
          }
      }
    }
  }
};

const openModal = () => { isModalVisible.value = true; };
const closeModal = () => { isModalVisible.value = false; };

// Функция, которую Modal.vue будет вызывать после успешной аутентификации
const handleAuthSuccess = () => {
  updateAuthState(); // <-- ЭТО КЛЮЧЕВОЕ МЕСТО! Вызываем сразу после успешного логина/регистрации
  closeModal();      // Закрываем модальное окно
  router.push({ name: 'Chat' }); // Перенаправляем на страницу чата
};

// Функция для программной прокрутки к секции
const scrollToSection = async (sectionId) => {
  if (isMenuOpen.value) {
    toggleMenu(false);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  if (route.name !== 'Home') {
    await router.push({ name: 'Home', hash: `#${sectionId}` });
  } else {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Элемент с ID "${sectionId}" не найден для прокрутки.`);
    }
  }
};

// Функция LOGOUT, которая должна быть доступна глобально
// Она будет использоваться как в App.vue (для главного меню), так и в ChatView.vue
const logout = async () => { // Сделаем асинхронной, чтобы дождаться ответа бэкенда
  console.log('Начало процесса выхода...');
  try {
    const response = await fetch('http://localhost:8000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Важно для отправки куки
    });

    if (response.ok) {
      console.log('Бэкенд успешно обработал выход.');
    } else {
      const errorData = await response.json();
      console.error('Ошибка бэкенда при выходе:', response.status, errorData);
      // Даже если бэкенд вернул ошибку, мы всё равно очищаем фронтенд-сессию
    }
  } catch (error) {
    console.error('Ошибка сети при выходе:', error);
  } finally {
    // Эти действия выполняются независимо от успеха запроса к бэкенду
    localStorage.removeItem('AccessToken'); // 1. Удаляем токен
    updateAuthState(); // 2. ОБНОВЛЯЕМ СОСТОЯНИЕ СРАЗУ!
    if (isMenuOpen.value) toggleMenu(false); // 3. Закрываем гамбургер-меню, если оно открыто
    router.push({ name: 'Home' }); // 4. Перенаправляем на главную страницу
    window.location.reload();
    console.log('Фронтенд-сессия очищена, пользователь перенаправлен на главную.');
  }
};

// Функция для навигации на главную страницу без логаута
const navigateToHome = () => {
  if (isMenuOpen.value) toggleMenu(false); // Закрываем меню, если оно открыто
  router.push({ name: 'Home' }); // 4. Перенаправляем на главную страницу
  console.log('Переход на главную страницу без выхода из системы.');
};


// --- Предоставляем функции другим компонентам ---
provide('openModal', openModal);
provide('closeModal', closeModal);
provide('isModalVisible', isModalVisible);
provide('handleAuthSuccess', handleAuthSuccess); // Для Modal.vue после успешной авторизации
provide('scrollToSection', scrollToSection);
provide('logout', logout); // Для ChatView.vue и других мест, где нужна кнопка выхода
provide('navigateToHome', navigateToHome); // Для ChatView.vue
</script>

<template>
  <template v-if="!isChatRoute">
    <HamburgerMenu :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" @close-menu="toggleMenu(false)" />
    <nav id="main-navigation" class="main-navigation" :aria-hidden="!isMenuOpen" ref="mainNavigationRef">
      <ul>
        <template v-if="!isAuthenticated">
          <li><a href="#" @click.prevent="openModal(); toggleMenu(false);">Войти/Регистрация</a></li>
        </template>
        <template v-else>
            <li><router-link :to="{ name: 'Chat' }" @click="toggleMenu(false)">Перейти в чат</router-link></li>
            <li><a href="#" @click.prevent="logout">Выйти</a></li>
        </template>
        <li><a href="#about-project" @click.prevent="scrollToSection('about-project')">О проекте</a></li>
        <li><a href="#project-goal" @click.prevent="scrollToSection('project-goal')">Наша Цель</a></li>
        <li><a href="#about-us" @click.prevent="scrollToSection('about-us')">О нас</a></li>
      </ul>
    </nav>
  </template>

  <router-view v-slot="{ Component, route: currentRoute }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="currentRoute.path" />
    </transition>
  </router-view>

  <AppFooter v-if="!isChatRoute" /> <Modal :is-visible="isModalVisible" @close-modal="closeModal" />
</template>

<style>
/* Ваши глобальные стили и стили перехода */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #111827;
  color: #E5E7EB;
}

/* Стили для хедера чата (чтобы он был над всем) */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1a202c; /* Темный фон */
  color: #fff;
  padding: 1rem;
  z-index: 1000; /* Чтобы быть поверх других элементов */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between; /* Для размещения кнопок */
  align-items: center;
}

.chat-header button {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: background-color 0.15s ease-in-out;
  cursor: pointer;
}

.chat-header .btn-logout {
  background-color: #ef4444; /* red-500 */
  color: #fff;
}
.chat-header .btn-logout:hover {
  background-color: #dc2626; /* red-600 */
}

.chat-header .btn-home {
  background-color: #3b82f6; /* blue-500 */
  color: #fff;
}
.chat-header .btn-home:hover {
  background-color: #2563eb; /* blue-600 */
}
</style>