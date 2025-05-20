import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/main.css'; // Import your global CSS

const app = createApp(App);

// Global utility for smooth scrolling (can also be a mixin or composable)
app.config.globalProperties.$scrollToElement = (targetElement) => {
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

app.mount('#app');