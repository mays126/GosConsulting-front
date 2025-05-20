<script setup>
import { ref, onMounted, provide } from 'vue';
import HamburgerMenu from './components/HamburgerMenu.vue';
import Modal from './components/Modal.vue';
import AppFooter from './components/AppFooter.vue';
import AIDisclamer from './components/AIDisclamer.vue';

// Импорты из директории `views` (убедитесь, что пути верны)
import HeroSection from './views/HeroSection.vue';
import AboutProject from './views/AboutProject.vue';
import ProjectGoal from './views/ProjectGoal.vue';
import AboutUs from './views/AboutUs.vue';

// Реактивное состояние для видимости меню
const isMenuOpen = ref(false);
const isModalVisible = ref(false);
const lastScrollY = ref(0); // Для хранения последней позиции прокрутки

// Создаем ref для элемента <nav id="main-navigation">
const mainNavigationRef = ref(null);




// Функция для переключения меню
const toggleMenu = (forceState) => {
    const newState = forceState !== undefined ? forceState : !isMenuOpen.value;

    if (newState === isMenuOpen.value) {
        return; // Нет изменений, выходим
    }

    isMenuOpen.value = newState;
    const body = document.body;
    const navigationElement = mainNavigationRef.value;

    if (isMenuOpen.value) {
        // ОТКРЫТИЕ МЕНЮ
        lastScrollY.value = window.scrollY;
        body.style.top = `-${lastScrollY.value}px`;
        body.style.position = 'fixed';
        body.style.width = '100%';
        body.style.overflowY = 'hidden';
        body.classList.add('menu-open');

        if (navigationElement) {
            navigationElement.style.visibility = 'visible';
        }

    } else {
        // ЗАКРЫТИЕ МЕНЮ
        body.classList.remove('menu-open');

        if (navigationElement) {
            const handleTransitionEnd = () => {
                if (!isMenuOpen.value) {
                    navigationElement.style.visibility = 'hidden';

                    // Восстанавливаем scroll позицию и убираем фиксацию
                    body.style.position = '';
                    body.style.top = '';
                    body.style.width = '';
                    body.style.overflowY = '';

                    // Восстановление scroll без скачка
                    window.scrollTo({
                        top: lastScrollY.value,
                        behavior: 'auto'
                    });
                }

                navigationElement.removeEventListener('transitionend', handleTransitionEnd);
            };

            navigationElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }
    }
};
// Функции для модального окна
const openModal = () => {
    isModalVisible.value = true;
};
const closeModal = () => {
    isModalVisible.value = false;
};

// Предоставление (provide) функций для дочерних компонентов
// Это позволит дочерним компонентам вызывать openModal/closeModal
provide('openModal', openModal);
provide('closeModal', closeModal);
provide('isModalVisible', isModalVisible); // Можно предоставить и состояние, если нужно

// Функция для плавной прокрутки
const scrollToSection = (sectionId) => {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;

    const navigationElement = mainNavigationRef.value;

    // Закрываем меню
    toggleMenu(false);

    const handleScrollAfterClose = () => {
        navigationElement.removeEventListener('transitionend', handleScrollAfterClose);

        // Ждем 1 кадр после разморозки scroll
        requestAnimationFrame(() => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    };

    navigationElement.addEventListener('transitionend', handleScrollAfterClose);
};


// Логика для установки текущего года в футере (если AppFooter не делает это сам)
onMounted(() => {
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
</script>

<template>
    <HamburgerMenu :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" @close-menu="toggleMenu(false)" />

    <nav id="main-navigation" class="main-navigation" :aria-hidden="!isMenuOpen" ref="mainNavigationRef">
        <ul>
            <li><a href="#" @click.prevent="openModal(); toggleMenu(false);">Войти/Регистрация</a></li>
            <li><a href="#about-project" @click.prevent="scrollToSection('about-project')">О проекте</a></li>
            <li><a href="#project-goal" @click.prevent="scrollToSection('project-goal')">Наша Цель</a></li>
            <li><a href="#about-us" @click.prevent="scrollToSection('about-us')">О нас</a></li>
        </ul>
    </nav>

    <HeroSection />

    <main>
        <AboutProject />
        <ProjectGoal />
        <AboutUs />
        <AIDisclamer />

    </main>

    <AppFooter />

    <Modal :is-visible="isModalVisible" @close-modal="closeModal" />
</template>

<style>

</style>