<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const particles = ref([]);
const numParticles = 30; // Количество частиц
const particleSizeRange = [5, 15]; // Диапазон размеров частиц
const animationDurationRange = [15, 30]; // Диапазон длительности анимации

const createParticle = () => {
    const size = Math.random() * (particleSizeRange[1] - particleSizeRange[0]) + particleSizeRange[0];
    const top = Math.random() * 100; // Процент от высоты родителя
    const left = Math.random() * 100; // Процент от ширины родителя
    const animationDuration = Math.random() * (animationDurationRange[1] - animationDurationRange[0]) + animationDurationRange[0];
    const delay = Math.random() * 5; // Задержка для stagger эффекта

    return {
        id: Math.random().toString(36).substring(2, 9),
        style: {
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `${delay}s`,
            opacity: Math.random() * 0.5 + 0.3 // Случайная прозрачность
        }
    };
};

onMounted(() => {
    for (let i = 0; i < numParticles; i++) {
        particles.value.push(createParticle());
    }
});

// Добавим эффект параллакса для частиц при движении мыши (опционально)
const particlesContainer = ref(null);
const handleMouseMove = (e) => {
    if (particlesContainer.value) {
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = particlesContainer.value;

        const xMove = (clientX / offsetWidth - 0.5) * 30; // Чувствительность
        const yMove = (clientY / offsetHeight - 0.5) * 30; // Чувствительность

        particlesContainer.value.style.transform = `translate(${xMove}px, ${yMove}px)`;
    }
};

onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
    <div class="particles-container" ref="particlesContainer">
        <div
            v-for="particle in particles"
            :key="particle.id"
            class="particle"
            :style="particle.style"
        ></div>
    </div>
</template>

<style scoped>
.particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none; /* Чтобы не блокировать события мыши на элементах под ним */
    perspective: 1000px; /* Для 3D-эффекта параллакса */
    transition: transform 0.1s ease-out; /* Плавное движение за мышью */
}

.particle {
    position: absolute;
    background-color: rgba(96, 165, 250, 0.6); /* Синие полупрозрачные частицы */
    border-radius: 50%;
    filter: blur(1px); /* Немного размытия для мягкости */
    animation: floatParticle linear infinite alternate;
}

@keyframes floatParticle {
    0% {
        transform: translate(0, 0) scale(1);
    }
    25% {
        transform: translate(10px, -10px) scale(1.05);
    }
    50% {
        transform: translate(0, 20px) scale(0.95);
    }
    75% {
        transform: translate(-15px, -5px) scale(1.1);
    }
    100% {
        transform: translate(0, 0) scale(1);
    }
}
</style>