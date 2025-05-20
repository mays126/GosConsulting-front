<script setup>
import { ref, onMounted } from 'vue';

const disclaimerSectionRef = ref(null); // Ref для самой секции

onMounted(() => {
    // Intersection Observer для анимации появления секции
    const observerOptions = {
        root: null, // Наблюдаем относительно viewport
        rootMargin: '0px',
        threshold: 0.1 // Секция становится видимой, когда 10% её в viewport
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс 'is-visible' для запуска анимаций
                if (disclaimerSectionRef.value) {
                    disclaimerSectionRef.value.classList.add('is-visible');
                }
                observer.unobserve(entry.target); // Прекращаем наблюдение после появления
            }
        });
    }, observerOptions);

    if (disclaimerSectionRef.value) {
        observer.observe(disclaimerSectionRef.value);
    }
});
</script>

<template>
    <section id="ai-disclaimer" class="ai-disclaimer-section" ref="disclaimerSectionRef">
        <div class="container mx-auto px-4 py-16">
            <div class="ai-disclaimer-card">
                <div class="icon-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="ai-disclaimer-title">Важное уведомление об информации от ИИ</h2>
                <p class="ai-disclaimer-text">
                    Мы используем технологию Google Gemini для предоставления информации.
                    Важно помнить, что ответы, сгенерированные искусственным интеллектом, не являются
                    юридическими консультациями или окончательными фактами.
                </p>
                <p class="ai-disclaimer-text">
                    ИИ постоянно учится, но мы не можем полностью контролировать точность его ответов.
                    Всегда сверяйтесь с официальными источниками и при необходимости обращайтесь к квалифицированным юристам.
                </p>
                <div class="ai-logo-container">
                    <p>Мы используем:</p>
                    <img src="/images/gemini-brand.png" alt="Google Gemini Logo" class="gemini-logo">
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Импортируем стили для этого блока */
@import "../assets/css/ai-disclaimer.css";

/* Общие keyframes для анимаций, чтобы избежать дублирования
   Если они уже есть в section.css, убедитесь, что они доступны глобально
   или скопируйте сюда. Я их включаю на всякий случай. */

@keyframes fadeInSlideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInSlideUpEnhanced {
    from {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>