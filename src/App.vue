<script setup>
import { ref, onMounted, provide, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Импортируем useRouter и useRoute
import HamburgerMenu from './components/HamburgerMenu.vue';
import Modal from './components/Modal.vue';
import AppFooter from './components/AppFooter.vue';

const router = useRouter();
const route = useRoute();

const isMenuOpen = ref(false);
const isModalVisible = ref(false);
const lastScrollY = ref(0);
const mainNavigationRef = ref(null);

// Реактивное состояние для отслеживания аутентификации
const isAuthenticated = ref(!!localStorage.getItem('AccessToken'));

// Следим за изменениями в localStorage для обновления isAuthenticated
// Это простой способ; для более сложных приложений лучше использовать Pinia или Vuex
const updateAuthState = () => {
  isAuthenticated.value = !!localStorage.getItem('AccessToken');
};

// Обновляем состояние при монтировании
onMounted(() => {
  updateAuthState();
  // Добавляем слушатель на событие storage для синхронизации между вкладками (опционально)
  window.addEventListener('storage', (event) => {
    if (event.key === 'AccessToken') {
      updateAuthState();
    }
  });
});

// Также можно следить через watch, если токен может меняться другими способами в текущей вкладке
// watch(() => localStorage.getItem('AccessToken'), updateAuthState); // Это может быть избыточно с window.addEventListener('storage')

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
    body.style.overflowY = 'hidden'; // Важно для предотвращения прокрутки фона
    body.classList.add('menu-open');
    if (navigationElement) navigationElement.style.visibility = 'visible';
  } else {
    body.classList.remove('menu-open');
    if (navigationElement) {
      const handleTransitionEnd = () => {
        if (!isMenuOpen.value) { // Дополнительная проверка, что меню все еще закрыто
          navigationElement.style.visibility = 'hidden';
          body.style.position = '';
          body.style.top = '';
          body.style.width = '';
          body.style.overflowY = '';
          window.scrollTo({ top: lastScrollY.value, behavior: 'auto' });
        }
        // Удаляем слушатель только если он был добавлен для этого элемента
        if (navigationElement.getAttribute('data-transition-listener') === 'true') {
            navigationElement.removeEventListener('transitionend', handleTransitionEnd);
            navigationElement.removeAttribute('data-transition-listener');
        }
      };
      // Убедимся, что слушатель добавляется только один раз
      if (navigationElement.getAttribute('data-transition-listener') !== 'true') {
        navigationElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
        navigationElement.setAttribute('data-transition-listener', 'true');
      } else { // Если transitionend не сработает (например, нет transition), выполняем действия сразу
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

provide('openModal', openModal);
provide('closeModal', closeModal);
provide('isModalVisible', isModalVisible);

// Функция, которую Modal.vue будет вызывать после успешной аутентификации
const handleAuthChange = () => {
  updateAuthState(); // Обновляем состояние аутентификации
  // closeModal(); // Модальное окно закроется само через emit('close-modal') в Modal.vue
};
provide('handleAuthChange', handleAuthChange);

const scrollToSection = async (sectionId) => {
  // Если мы не на главной странице, сначала переходим на нее
  if (route.name !== 'Home') {
    await router.push({ name: 'Home' });
    // Даем Vue время на обновление DOM после смены роута
    await nextTick();
  }

  // Закрываем меню, если оно открыто
  if (isMenuOpen.value) {
    toggleMenu(false);
    // Ждем завершения анимации закрытия меню, если она есть
    // Это упрощенный вариант, может потребоваться более точное ожидание transitionend
    await new Promise(resolve => setTimeout(resolve, 300)); // Предполагая длительность анимации 0.3s
  }
  
  await nextTick(); // Еще один nextTick для надежности

  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth' });
  } else {
    console.warn(`Элемент с ID "${sectionId}" не найден для прокрутки.`);
  }
};

const navigateToChat = () => {
  if (isMenuOpen.value) toggleMenu(false);
  router.push({ name: 'Chat' });
};

const logout = () => {
  localStorage.removeItem('AccessToken');
  updateAuthState(); // Обновляем isAuthenticated
  if (isMenuOpen.value) toggleMenu(false);
  router.push({ name: 'Home' }).finally(() => {
    window.location.reload();
  }); // Перенаправляем на главную страницу
};

// onMounted для currentYear лучше оставить в AppFooter.vue, если он там используется
// onMounted(() => {
//   const currentYearSpan = document.getElementById('currentYear');
//   if (currentYearSpan) {
//     currentYearSpan.textContent = new Date().getFullYear();
//   }
// });
</script>

<template>
  <HamburgerMenu :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" @close-menu="toggleMenu(false)" />

  <nav id="main-navigation" class="main-navigation" :aria-hidden="!isMenuOpen" ref="mainNavigationRef">
    <ul>
      <template v-if="!isAuthenticated">
        <li><a href="#" @click.prevent="openModal(); toggleMenu(false);">Войти/Регистрация</a></li>
      </template>
      <template v-else>
         <li><a href="#" @click.prevent="navigateToChat">Перейти в чат</a></li>
         <li><a href="#" @click.prevent="logout">Выйти</a></li>
      </template>
      <li><a href="#about-project" @click.prevent="scrollToSection('about-project')">О проекте</a></li>
      <li><a href="#project-goal" @click.prevent="scrollToSection('project-goal')">Наша Цель</a></li>
      <li><a href="#about-us" @click.prevent="scrollToSection('about-us')">О нас</a></li>
    </ul>
  </nav>

  <router-view v-slot="{ Component, route: currentRoute }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="currentRoute.path" />
    </transition>
  </router-view>

  <AppFooter />

  <Modal :is-visible="isModalVisible" @close-modal="closeModal" />
</template>

<style>
/* Стили для анимации перехода между страницами (опционально) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Стили для body когда меню открыто (если .menu-open добавляется к body) */
/* body.menu-open { */
  /* overflow: hidden; */ /* Управляется через JS */
/* } */

/* main-navigation управляется через JS, но можно добавить базовое скрытие */
/* .main-navigation {
  visibility: hidden;
}
.main-navigation[style*="visibility: visible"] {
  visibility: visible !important;
} */
</style>
