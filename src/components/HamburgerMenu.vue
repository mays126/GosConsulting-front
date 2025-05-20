<script setup>
const props = defineProps({
  isMenuOpen: Boolean
});

const emit = defineEmits(['toggle-menu']);
</script>

<template>
  <button
    id="hamburger-button"
    class="hamburger-button"
    :class="{ 'active': isMenuOpen }"
    :aria-expanded="isMenuOpen ? 'true' : 'false'"
    aria-label="Открыть меню"
    @click="emit('toggle-menu')"
  >
    <span class="hamburger-button__line"></span>
    <span class="hamburger-button__line"></span>
    <span class="hamburger-button__line"></span>
  </button>
</template>

<style scoped>
/* Эти стили могут быть здесь с scoped, так как они специфичны для кнопки.
   Или же вы можете перенести их в main.css и убрать 'scoped' здесь,
   если хотите, чтобы они были глобальными и использовались где-то еще. */
.hamburger-button {
    position: fixed;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 30px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0;
    z-index: 1001;
}

.hamburger-button__line {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #93C5FD;
    transition: all 0.3s ease-in-out;
}

.hamburger-button.active .hamburger-button__line:nth-child(1) {
    transform: translateY(13px) rotate(45deg);
}

.hamburger-button.active .hamburger-button__line:nth-child(2) {
    opacity: 0;
}

.hamburger-button.active .hamburger-button__line:nth-child(3) {
    transform: translateY(-13px) rotate(-45deg);
}
</style>