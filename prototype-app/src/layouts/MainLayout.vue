<template>
  <div
    class="app-wrapper"
    :class="{ 'pwa-mode': isPwa }"
  >
    <AppSidebar v-if="!hideSidebar && !isPwa" />

    <div
      class="app-main"
      :class="{
        'without-sidebar': hideSidebar || isPwa,
        'pwa-main': isPwa
      }"
    >

    <div v-if="!hideSidebar && !isPwa" class="web-navbar-wrapper">
      <AppNavbar />
    </div>

      <main
        class="content-area"
        :class="{
          'pwa-content-area': isPwa,
          'portal-content-area': hideSidebar
        }"
      >
        <RouterView />
      </main>
    </div>

    <div v-if="isPwa && !isPortal" class="global-pwa-notification">
      <NotificationBell />
    </div>

    <PwaBottomNav v-if="isPwa" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from '../components/AppSidebar.vue'
import AppNavbar from '../components/AppNavbar.vue'
import PwaBottomNav from '../components/PwaBottomNav.vue'
import NotificationBell from '../components/NotificationBell.vue'
import { usePwaMode } from '../composables/usePwaMode'

const route = useRoute()
const { isPwa } = usePwaMode()

const isPortal = computed(() => route.path === '/dashboard')

const hideSidebar = computed(() => {
  return route.meta.hideSidebar === true
})

</script>

<style scoped>
.app-wrapper {
  --sidebar-width: 220px;
  --navbar-height: 46px;

  min-height: 100vh;
  background: #f3f6fa;
}

/* Area utama web */
.app-main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.2s ease;
  background: #f3f6fa;
}

.app-main.without-sidebar,
.app-main.pwa-main {
  margin-left: 0;
}

/* Wrapper navbar web */
.web-navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 1010;
  height: var(--navbar-height);
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 0.1rem 0.35rem rgba(15, 23, 42, 0.035);
}

/* Konten web */
.content-area {
  padding: 12px 16px 16px;
  min-height: calc(100vh - var(--navbar-height));
}

.portal-content-area {
  padding: 0 !important;
  min-height: 100vh;
}

/* Supaya container-fluid dari halaman child tidak menambah jarak lagi */
.content-area :deep(.container-fluid) {
  padding-left: 0;
  padding-right: 0;
}

/* Rapikan heading halaman child */
.content-area :deep(h1),
.content-area :deep(h2),
.content-area :deep(h3) {
  margin-top: 0;
}

/* Card umum lebih clean */
.content-area :deep(.card) {
  border-radius: 10px;
}

/* PWA */
.global-pwa-notification{position:fixed;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:1200}.pwa-mode {
  background-color: #f8fafc;
}

.pwa-content-area {
  padding: calc(10px + env(safe-area-inset-top)) 10px 82px;
  min-height: 100vh;
}

.pwa-mode :deep(.navbar) {
  min-height: 52px;
}

.pwa-mode :deep(.navbar-brand) {
  font-size: 14px;
}

/* Ketika aplikasi dibuka sebagai PWA standalone */
@media (display-mode: standalone) {
  .web-navbar-wrapper {
    display: none !important;
  }
}

@media (display-mode: fullscreen) {
  .web-navbar-wrapper {
    display: none !important;
  }
}

@media (display-mode: minimal-ui) {
  .web-navbar-wrapper {
    display: none !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
  }

  .content-area {
    padding: 10px;
  }
}
</style>