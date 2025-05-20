<script setup>
import { ref, onMounted } from 'vue';

const sectionRef = ref(null);
const cardRef = ref(null);
const imageRef = ref(null);

onMounted(() => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (cardRef.value) {
                    cardRef.value.classList.add('is-visible');
                }
                if (imageRef.value) {
                    imageRef.value.classList.add('is-visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    if (sectionRef.value) {
        observer.observe(sectionRef.value.querySelector('.section-content-wrapper'));
    }
});
</script>

<template>
    <section id="project-goal" class="section" ref="sectionRef">
        <div class="container mx-auto px-4">
            <div class="section-content-wrapper flex-lg-row-reverse">
                <div class="content-card animate-on-scroll animate-from-right" ref="cardRef">
                    <h2 class="text-3xl md:text-4xl font-bold mb-6">Наша Цель</h2>
                    <p class="text-lg md:text-xl leading-relaxed mb-4">
                        Мы стремимся предоставить каждому удобный и интуитивно понятный инструмент для поиска
                        достоверной и актуальной информации о законах Республики Беларусь.
                    </p>
                    <p class="text-lg md:text-xl leading-relaxed">
                        Наша миссия – помочь вам не только избегать правонарушений, но и лучше понимать свои права и обязанности.
                        Получайте мгновенные, четкие ответы, основанные на полной законодательной базе страны,
                        и чувствуйте себя увереннее в любой правовой ситуации.
                    </p>
                </div>

                <img src="../../images/4.jpg"
                     alt="Наша цель"
                     class="section-image animate-image-from-left"
                     ref="imageRef">
            </div>
        </div>
    </section>
</template>

<style scoped>
@import "../assets/css/section.css";

/* Для этой карточки: появление справа */
.animate-from-right.is-visible {
    animation: fadeInSlideRight 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>