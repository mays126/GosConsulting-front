<script setup>
// Импортируем секции, которые ранее были в App.vue
import HeroSection from './HeroSection.vue';
import AboutProject from './AboutProject.vue';
import ProjectGoal from './ProjectGoal.vue';
import AboutUs from './AboutUs.vue';
// Предполагается, что AIDisclamer - это компонент
import AIDisclamer from '../components/AIDisclamer.vue';
</script>

<template>
  <HeroSection />
  <main>
    <AboutProject id="about-project" />
    <ProjectGoal id="project-goal" />
    <AboutUs id="about-us" />
    <AIDisclamer />
  </main>
</template>

<style scoped>

</style>
