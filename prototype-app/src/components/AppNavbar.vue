<template>
  <nav class="app-navbar">
    <div class="navbar-left">
      <span class="navbar-title">
        {{ pageTitle }}
      </span>
    </div>

    <div class="navbar-right">
      <NotificationBell />
      <div class="user-menu" @click.stop>
        <button
          class="user-button"
          type="button"
          @click="toggleUserMenu"
        >
          <i class="fas fa-user-circle"></i>
          <span>{{ username }}</span>
          <i class="fas fa-caret-down caret-icon"></i>
        </button>

        <div
          v-if="showUserMenu"
          class="user-dropdown-menu"
        >
          <button
            class="dropdown-item text-danger"
            type="button"
            @click="logout"
          >
            <i class="fas fa-sign-out-alt"></i>
            <span>Kembali ke portofolio</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from './NotificationBell.vue'

const route = useRoute()

const showUserMenu = ref(false)

const username = 'Akun Demo'

const pageTitle = computed(() => {
  const moduleName = route.meta?.module

  const titles = {
    pkwt: 'Kontrak Pegawai',
    agenda: 'Agenda Harian',
    'reservasi-driver': 'Reservasi Driver',
    'makan-siang': 'Pesan Makan Siang',
    arsip: 'Arsip Perusahaan',
    'nomor-surat': 'Nomor Surat',
    profil: 'Profil Saya',
    pengaturan: 'Pengaturan',
    sistem: 'Pengaturan Sistem'
  }

  return titles[moduleName] || 'mPro Internal Home'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const logout = () => { window.location.assign('/#portfolio') }

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>

<style scoped>
.app-navbar {
  height: 46px;
  min-height: 46px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}

.navbar-left {
  min-width: 0;
}

.navbar-title {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu {
  position: relative;
}

.user-button {
  height: 32px;
  border: 0;
  background: transparent;
  color: #111827;
  padding: 4px 8px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  transition: background 0.15s ease;
}

.user-button:hover {
  background: #f3f4f6;
}

.user-button i {
  font-size: 13px;
}

.caret-icon {
  font-size: 11px !important;
  color: #64748b;
}

.user-dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 7px);
  min-width: 178px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  box-shadow: 0 0.75rem 1.8rem rgba(15, 23, 42, 0.16);
  z-index: 999999;
  padding: 6px;
}

.dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 8px 9px;
  text-align: left;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.dropdown-item i {
  width: 15px;
  text-align: center;
  font-size: 12px;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 5px 0;
}

.text-danger {
  color: #dc3545 !important;
}

.text-danger:hover {
  background: #fff1f2;
  color: #b91c1c !important;
}
</style>