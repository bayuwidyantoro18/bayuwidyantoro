<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const navigation = [
  { label: 'HOME', id: 'home', href: '#home' },
  { label: 'PROFESSIONAL', id: 'professional', href: '#professional' },
  { label: 'PORTFOLIO', id: 'portfolio', href: '#portfolio' },
  { label: 'EXPERIENCE', id: 'experience', href: '#experience' },
  { label: 'CONTACT', id: 'contact', href: '#contact' },
];
const menuOpen = ref(false);
const scrolled = ref(false);
const activeSection = ref('home');
let observer: IntersectionObserver | undefined;

function closeMenu(id?: string) {
  menuOpen.value = false;
  if (id) activeSection.value = id;
}
function onScroll() { scrolled.value = window.scrollY > 12; }
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu();
}
watch(menuOpen, (open) => {
  document.body.classList.toggle('mobile-menu-open', open);
});
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  observer = new IntersectionObserver((entries) => {
    const matching = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (matching[0]) activeSection.value = matching[0].target.id;
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .05, .25] });
  navigation.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) observer?.observe(el);
  });
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onKeyDown);
  document.body.classList.remove('mobile-menu-open');
  observer?.disconnect();
});
</script>

<template>
  <header class="site-header" :class="{ 'site-header--scrolled': scrolled, 'site-header--open': menuOpen }">
    <div class="nav-inner">
      <a class="nav-brand" href="#home" aria-label="Bayu Widyantoro – home" @click="closeMenu('home')">BW<span>.</span></a>
      <nav id="primary-navigation" class="nav-links" :class="{ 'nav-links--open': menuOpen }" aria-label="Main navigation">
        <a v-for="item in navigation" :key="item.id" :href="item.href"
           :class="{ 'nav-link--active': activeSection === item.id }"
           :aria-current="activeSection === item.id ? 'location' : undefined"
           @click="closeMenu(item.id)">{{ item.label }}</a>
      </nav>
      <a class="nav-contact" href="mailto:bayu.widyantoro24@gmail.com" aria-label="Send Bayu an email">LET'S TALK <span aria-hidden="true">↗</span></a>
      <button class="nav-toggle" type="button" :aria-expanded="menuOpen" aria-controls="primary-navigation"
              :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>
