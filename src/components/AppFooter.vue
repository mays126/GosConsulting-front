<script setup>
import { ref, onMounted } from 'vue';

const currentYear = ref('');

// On component mount, set the current year
onMounted(() => {
    currentYear.value = new Date().getFullYear();
});
</script>

<template>
    <footer class="main-footer">
        <div class="footer-content">
            <p class="footer-copyright">&copy; {{ currentYear }} Ваш Правовой Консультант. Все права защищены.</p>
            
            <div class="footer-links">
                <p class="footer-tagline">Создано с целью повышения правовой грамотности.</p>
                
                <div class="social-links">
                    <p>Наши контакты:</p>
                    <a href="https://t.me/TXUFIOG" target="_blank" class="social-link">
                        <i class="fab fa-telegram-plane"></i> @TXUFIOG
                    </a>
                    <a href="https://t.me/CHETV1" target="_blank" class="social-link">
                        <i class="fab fa-telegram-plane"></i> @CHETV1
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
/* Import the dedicated footer styles */
@import "../assets/css/footer.css";
</style>
