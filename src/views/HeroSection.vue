<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import FloatingParticles from '../components/FloatingParticles.vue'; // Импортируем частицы

const heroContent = ref(null);
const heroSection = ref(null); // Добавим ref для самой HeroSection

// Intersection Observer for scroll animations (if not handled globally)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Анимация появления содержимого Hero Section при загрузке
                if (heroContent.value) {
                    heroContent.value.querySelectorAll('.animate-on-load').forEach(el => {
                        setTimeout(() => {
                            el.classList.add('is-visible');
                        }, parseInt(el.dataset.delay || 0)); // Use a data attribute for delay
                    });
                }
                observer.unobserve(entry.target); // Остановить наблюдение после появления
            }
        });
    }, observerOptions);

    if (heroSection.value) {
        observer.observe(heroSection.value); // Наблюдаем за HeroSection
    }
});

// Добавим эффект параллакса для содержимого Hero Section при прокрутке
const handleScrollParallax = () => {
    if (heroSection.value && heroContent.value) { // Добавим проверку heroContent.value
        const scrollPos = window.scrollY;
        // Эффект для фонового оверлея
        const overlayElement = heroSection.value.querySelector('.hero-overlay');
        if (overlayElement) {
             const overlayTransform = Math.min(scrollPos * 0.1, 50); // Двигаем фон оверлея медленнее
             overlayElement.style.transform = `translateY(${overlayTransform}px)`;
        }


        // Эффект для самого контента
        const contentTransform = Math.min(scrollPos * 0.3, 100); // Двигаем контент чуть быстрее
        heroContent.value.style.transform = `translateY(${contentTransform}px)`;
        heroContent.value.style.opacity = 1 - (scrollPos / window.innerHeight * 0.8); // Постепенное затухание
    }
};

onMounted(() => {
    window.addEventListener('scroll', handleScrollParallax);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScrollParallax);
});
</script>

<template>
    <header id="hero" class="hero-section" ref="heroSection">
        <div class="hero-overlay"></div>
        <FloatingParticles /> <div class="hero-content container mx-auto" ref="heroContent">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-on-load" data-delay="200">Ваш Надежный Правовой Консультант</h1>
            <p class="text-xl md:text-2xl mb-10 max-w-2xl animate-on-load" data-delay="400">
                Мгновенные ответы и актуальная информация по законодательству Республики Беларусь.
                Разбирайтесь в законах легко и быстро.
            </p>
            </div>
    </header>
</template>

<style scoped>
/* Hero section styles from style.css */
.hero-section {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    padding: 4rem 1rem;
    overflow: hidden; /* Важно, чтобы частицы не выходили за пределы секции */
    /* background: url('https://via.placeholder.com/1920x1080/0F172A/1E293B?text=Abstract+Background') no-repeat center center / cover; */
    
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Более темный оверлей для контраста */
    z-index: 0;
    will-change: transform; /* Для плавного параллакса */
}

.hero-content {
    position: relative;
    z-index: 1; /* Убедимся, что контент поверх частиц */
    max-width: 800px;
    will-change: transform, opacity; /* Для плавного параллакса */
}

.hero-content h1,
.hero-content p,
.hero-content div { /* Удалить div, если нет других div, требующих анимации */
    will-change: opacity, transform;
}

/* Анимации появления элементов при загрузке Hero Section */
.animate-on-load {
    opacity: 0;
    transform: translateY(30px);
}

.animate-on-load.is-visible {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}


</style>