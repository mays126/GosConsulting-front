<script setup>
import { ref, onMounted } from 'vue';

const sectionRef = ref(null);
const memberCard1Ref = ref(null); // Ref для первой карточки участника
const memberCard2Ref = ref(null); // Ref для второй карточки участника

onMounted(() => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Срабатывает, когда 10% элемента видно
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс is-visible к обеим карточкам участников
                // Мы наблюдаем за .team-members-wrapper, поэтому он запускает анимации сразу для обоих
                if (memberCard1Ref.value) {
                    memberCard1Ref.value.classList.add('is-visible');
                }
                if (memberCard2Ref.value) {
                    // Добавим небольшую задержку для второй карточки
                    setTimeout(() => {
                        memberCard2Ref.value.classList.add('is-visible');
                    }, 200); // Появится на 200ms позже первой
                }
                observer.unobserve(entry.target); // Прекращаем наблюдение после появления
            }
        });
    }, observerOptions);

    if (sectionRef.value) {
        // Наблюдаем за оберткой team-members-wrapper
        observer.observe(sectionRef.value.querySelector('.team-members-wrapper'));
    }
});
</script>

<template>
    <section id="about-us" class="section" ref="sectionRef">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-blue-400">О нас</h2>
            <p class="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto text-gray-200">
                Мы — два школьника, объединенные стремлением сделать правовую информацию доступной и понятной каждому.
                Познакомьтесь с командой, стоящей за этим проектом.
            </p>

            <div class="team-members-wrapper">
                <div class="member-card animate-on-scroll animate-member-left" ref="memberCard1Ref">
                    <img src="../../images/IMG_8182.jpg" alt="Григоревич Тимур" class="member-card-image">
                    <h3>Григоревич Тимур</h3>
                    <p>
                        Фронтенд-разработчик и дизайнер, ответственный за пользовательский интерфейс и опыт.
                        Увлечен созданием интуитивно понятных и красивых веб-приложений.
                    </p>
                </div>

                <div class="member-card animate-on-scroll animate-member-right" ref="memberCard2Ref">
                    <img src="../../images/IMG_8184.jpg" alt="Антонов Антон" class="member-card-image">
                    <h3>Антонов Антон</h3>
                    <p>
                        Бэкенд-разработчик и специалист по данным, обеспечивающий функциональность и надежность платформы.
                        Любит работать со сложными системами и базами данных.
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
@import "../assets/css/section.css"; /* Важно: импортируем общие стили */

/* Ничего специфичного для этого компонента больше не нужно, все стили в section.css */
</style>