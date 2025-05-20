<script setup>
import { ref, onMounted } from 'vue';

const sectionRef = ref(null);
const cardRef = ref(null); // Ref для карточки
const imageRef = ref(null); // Ref для изображения

onMounted(() => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Срабатывает, когда 10% элемента видно
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс анимации к карточке
                if (cardRef.value) {
                    cardRef.value.classList.add('is-visible');
                }
                // Добавляем класс анимации к изображению
                if (imageRef.value) {
                    imageRef.value.classList.add('is-visible');
                }
                observer.unobserve(entry.target); // Прекращаем наблюдение после появления
            }
        });
    }, observerOptions);

    if (sectionRef.value) {
        // Наблюдаем за корневым элементом section-content-wrapper
        observer.observe(sectionRef.value.querySelector('.section-content-wrapper'));
    }
});
</script>

<template>
    <section id="about-project" class="section" ref="sectionRef">
        <div class="container mx-auto px-4">
            <div class="section-content-wrapper flex-lg-row">
                <div class="content-card animate-on-scroll animate-from-left" ref="cardRef">
                    <h2 class="text-3xl md:text-4xl font-bold mb-6">О Проекте</h2>
                    <p class="text-lg md:text-xl leading-relaxed mb-4">
                        Этот проект создан, чтобы упростить доступ к правовой информации. Нередко молодые люди, да и не только,
                        сталкиваются с трудностями из-за недостаточного понимания административного или уголовного кодекса.
                    </p>
                    <p class="text-lg md:text-xl leading-relaxed">
                        Наша платформа призвана стать вашим надежным помощником в мире юриспруденции,
                        помогая разобраться в сложных правовых вопросах и избежать неприятных ситуаций,
                        связанных с незнанием законов.
                    </p>
                </div>

                <img src="../../images/3.jpg"
                     alt="Концепция проекта"
                     class="section-image animate-image-from-right"
                     ref="imageRef">
            </div>
        </div>
    </section>
</template>

<style scoped>
@import "../assets/css/section.css";

/* Переопределяем анимацию для content-card, если необходимо (иначе используется общая animate-on-scroll) */
/* Для этой карточки: появление слева */
.animate-from-left.is-visible {
    animation: fadeInSlideLeft 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>