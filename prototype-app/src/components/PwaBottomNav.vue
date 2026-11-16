<template>
  <nav class="pwa-bottom-nav" @click.stop>
    <button
      type="button"
      class="nav-side-btn"
      :class="{ disabled: isPortalDashboard }"
      :disabled="isPortalDashboard"
      :title="isPortalDashboard ? 'Menu modul tersedia setelah masuk modul' : 'Buka menu modul'"
      @click="toggleModuleMenu"
    >
      <i class="fas fa-bars-staggered"></i>
      <span>Menu</span>
    </button>

    <button type="button" class="nav-home-wrap" title="Beranda" @click="goHome">
      <span class="nav-home-btn">
        <i class="fas fa-house"></i>
      </span>
      <span>Beranda</span>
    </button>

    <button type="button" class="nav-side-btn profile-btn" title="Profil" @click="toggleProfileMenu">
      <i class="fas fa-user"></i>
      <span>Profil</span>
    </button>

    <transition name="sheet-fade">
      <div
        v-if="showModuleMenu || showProfileMenu"
        class="sheet-backdrop"
        @click="closeSheets"
      ></div>
    </transition>

    <transition name="sheet-slide">
      <section v-if="showModuleMenu" class="bottom-sheet module-sheet">
        <div class="sheet-handle"></div>

        <header class="sheet-head">
          <div>
            <span>Menu Modul</span>
            <h6>{{ currentModuleTitle }}</h6>
          </div>

          <button type="button" @click="closeSheets">
            <i class="fas fa-times"></i>
          </button>
        </header>

        <div v-if="!activeMenu.length" class="sheet-empty">
          <i class="fas fa-circle-exclamation"></i>
          <strong>Menu belum tersedia</strong>
          <span>Periksa hak akses pengguna atau refresh halaman.</span>
          <button type="button" class="refresh-menu-btn" @click="refreshNavigation">
            <i class="fas fa-sync-alt"></i> Refresh Menu
          </button>
        </div>

        <div v-else class="sheet-menu-list">
          <template v-for="item in activeMenu" :key="item.key || item.route || item.label">
            <div v-if="item.children?.length" class="sheet-group">
              <div class="sheet-group-title">
                <span class="group-icon">
                  <i :class="item.icon"></i>
                </span>
                <span>{{ item.label }}</span>
              </div>

              <button
                v-for="child in item.children"
                :key="child.route"
                type="button"
                class="sheet-menu-item child"
                :class="{ active: isActiveMenu(child.route) }"
                @click="goRoute(child.route)"
              >
                <span class="menu-icon">
                  <i :class="child.icon"></i>
                </span>
                <span class="menu-text">{{ child.label }}</span>
                <i class="fas fa-chevron-right arrow"></i>
              </button>
            </div>

            <button
              v-else
              type="button"
              class="sheet-menu-item"
              :class="{ active: isActiveMenu(item.route) }"
              @click="goRoute(item.route)"
            >
              <span class="menu-icon">
                <i :class="item.icon"></i>
              </span>
              <span class="menu-text">{{ item.label }}</span>
              <i class="fas fa-chevron-right arrow"></i>
            </button>
          </template>
        </div>
      </section>
    </transition>

    <transition name="sheet-slide">
      <section v-if="showProfileMenu" class="bottom-sheet profile-sheet">
        <div class="sheet-handle"></div>

        <header class="sheet-head">
          <div>
            <span>Akun</span>
            <h6>Profil Pengguna</h6>
          </div>

          <button type="button" @click="closeSheets">
            <i class="fas fa-times"></i>
          </button>
        </header>

        <div class="profile-actions">
          <button type="button" class="logout" @click="logout">
            <span class="menu-icon"><i class="fas fa-right-from-bracket"></i></span>
            <span>Kembali ke portofolio</span>
          </button>
        </div>
      </section>
    </transition>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccessControl } from '../composables/useAccessControl'

const route = useRoute()
const router = useRouter()

const showModuleMenu = ref(false)
const showProfileMenu = ref(false)

const { modules, loadNavigation, loadingNavigation } = useAccessControl()

const fallbackMenuModules = {
  profil: {
    title: 'Profil Saya',
    menus: [
      {
        key: 'akun',
        label: 'Akun Saya',
        route: '/profil-saya?tab=akun',
        icon: 'fas fa-user-shield'
      },
      {
        key: 'data',
        label: 'Data Saya',
        route: '/profil-saya?tab=data',
        icon: 'fas fa-id-card'
      }
    ]
  }
}

const isPortalDashboard = computed(() => {
  return route.path === '/dashboard' || route.meta?.hideSidebar === true
})

const currentModule = computed(() => {
  if (route.path.startsWith('/kehadiran/')) return 'kehadiran'
  if (route.path.startsWith('/profil-saya')) {
    return 'profil'
  }

  return route.meta?.module || 'pkwt'
})

const currentModuleData = computed(() => {
  return modules.value.find((item) => {
    return item.module_key === currentModule.value || item.code === currentModule.value
  }) || null
})

const currentModuleTitle = computed(() => {
  return currentModuleData.value?.module_name ||
    currentModuleData.value?.name ||
    fallbackMenuModules[currentModule.value]?.title ||
    'Menu Modul'
})

const normalizeMenu = (menu) => {
  const children = Array.isArray(menu.children)
    ? menu.children
        .map(normalizeMenu)
        .filter((child) => child.route && child.route !== '#')
    : null

  return {
    key: menu.menu_key || menu.key || menu.code || '',
    label: menu.menu_name || menu.name || menu.label || 'Menu',
    route: menu.route || menu.path || '#',
    icon: menu.icon || 'fas fa-circle-dot',
    permissions: menu.permissions || {},
    children: children?.length ? children : null
  }
}

const groupKehadiranMenus = (menus) => {
  if (currentModule.value !== 'kehadiran') return menus

  const pengaturan = menus.find(
    (item) => item.key === 'pengaturan' || item.route === '/kehadiran/pengaturan'
  )

  const settingsGroup = pengaturan
    ? {
        key: 'pengaturan_kehadiran_group',
        label: 'Pengaturan Kehadiran',
        route: '#',
        icon: 'fas fa-cog',
        children: [
          {
            key: 'pengaturan_kehadiran',
            label: 'Kehadiran',
            route: '/kehadiran/pengaturan/kehadiran',
            icon: 'fas fa-user-clock',
            permissions: pengaturan.permissions || {}
          },
          {
            key: 'pengaturan_cuti_izin',
            label: 'Cuti & Izin',
            route: '/kehadiran/pengaturan/cuti-izin',
            icon: 'fas fa-calendar-check',
            permissions: pengaturan.permissions || {}
          },
          {
            key: 'pengaturan_lembur',
            label: 'Lembur',
            route: '/kehadiran/pengaturan/lembur',
            icon: 'fas fa-business-time',
          },
          {
            key: 'pengaturan_dokumen',
            label: 'Dokumen',
            route: '/kehadiran/pengaturan/dokumen',
            icon: 'fas fa-file-invoice',
            permissions: pengaturan.permissions || {}
          },
          {
            key: 'pengaturan_lokasi',
            label: 'Lokasi Kantor & Cabang',
            route: '/kehadiran/pengaturan/lokasi',
            icon: 'fas fa-location-dot',
            permissions: pengaturan.permissions || {}
          }
        ]
      }
    : null

  const laporan = []
  const laporanKehadiran = menus.find((item) => item.key === 'laporan_kehadiran' || item.route === '/kehadiran/laporan')
  const laporanLembur = menus.find((item) => item.key === 'laporan_lembur' || item.route === '/kehadiran/laporan-lembur')
  const laporanIzinCuti = menus.find((item) => item.key === 'laporan_izin_cuti' || item.route === '/kehadiran/laporan-izin-cuti')

  if (laporanKehadiran) laporan.push({ ...laporanKehadiran, label: 'Laporan Kehadiran', route: '/kehadiran/laporan', icon: 'fas fa-calendar-check' })
  if (laporanLembur) laporan.push({ ...laporanLembur, label: 'Laporan Lembur', route: '/kehadiran/laporan-lembur', icon: 'fas fa-business-time' })
  if (laporanIzinCuti) laporan.push({ ...laporanIzinCuti, label: 'Laporan Izin & Cuti', route: '/kehadiran/laporan-izin-cuti', icon: 'fas fa-file-medical' })

  const excludedKeys = ['pengaturan', 'laporan_kehadiran', 'laporan_lembur', 'laporan_izin_cuti']
  const excludedRoutes = ['/kehadiran/pengaturan', '/kehadiran/laporan', '/kehadiran/laporan-lembur', '/kehadiran/laporan-izin-cuti']

  const otherMenus = menus.filter((item) => {
    return !excludedKeys.includes(item.key) && !excludedRoutes.includes(item.route)
  })

  if (settingsGroup) otherMenus.push(settingsGroup)

  if (laporan.length) {
    otherMenus.push({
      key: 'laporan_group',
      label: 'Laporan',
      route: '#',
      icon: 'fas fa-chart-bar',
      children: laporan
    })
  }

  return otherMenus
}

const groupNomorSuratMenus = (menus) => {
  if (currentModule.value !== 'nomor-surat') return menus

  const dashboard = menus.filter((item) => item.key === 'dashboard')
  const suratMasuk = menus.find((item) => item.key === 'surat_masuk' || item.route === '/nomor-surat/surat-masuk')
  const suratKeluar = menus.find((item) => item.key === 'surat_keluar' || item.key === 'ambil_nomor' || item.route === '/nomor-surat/surat-keluar' || item.route === '/nomor-surat/ambil')

  const children = []
  if (suratMasuk) children.push({ ...suratMasuk, label: 'Surat Masuk', route: '/nomor-surat/surat-masuk', icon: 'fas fa-inbox' })
  if (suratKeluar) children.push({ ...suratKeluar, label: 'Surat Keluar', route: '/nomor-surat/surat-keluar', icon: 'fas fa-paper-plane' })

  const usedKeys = ['dashboard', 'surat_masuk', 'surat_keluar', 'ambil_nomor']
  const usedRoutes = ['/nomor-surat/surat-masuk', '/nomor-surat/surat-keluar', '/nomor-surat/ambil']

  const others = menus.filter((item) => !usedKeys.includes(item.key) && !usedRoutes.includes(item.route))

  if (children.length) {
    return [
      ...dashboard,
      {
        key: 'nomor_surat_group',
        label: 'Nomor Surat',
        route: '#',
        icon: 'fas fa-envelope-open-text',
        children
      },
      ...others
    ]
  }

  return [...dashboard, ...others]
}

const activeMenu = computed(() => {
  const rawMenus = currentModuleData.value?.menus

  if (Array.isArray(rawMenus) && rawMenus.length) {
    const menus = rawMenus
      .map(normalizeMenu)
      .filter((menu) => (menu.children?.length) || (menu.route && menu.route !== '#'))

    return groupNomorSuratMenus(groupKehadiranMenus(menus))
  }

  return fallbackMenuModules[currentModule.value]?.menus || []
})

const closeSheets = () => {
  showModuleMenu.value = false
  showProfileMenu.value = false
}

const toggleModuleMenu = () => {
  if (isPortalDashboard.value) return

  showProfileMenu.value = false
  showModuleMenu.value = !showModuleMenu.value
}

const toggleProfileMenu = () => {
  showModuleMenu.value = false
  showProfileMenu.value = !showProfileMenu.value
}

const goHome = () => {
  closeSheets()
  router.push('/dashboard')
}

const goRoute = async (target) => {
  if (!target || target === '#') return

  closeSheets()
  await router.push(target)
}

const refreshNavigation = async () => {
  await loadNavigation(true)
}

const logout = () => { window.location.assign('/#portfolio') }

const isActiveMenu = (menuRoute) => {
  if (!menuRoute || menuRoute === '#') return false

  const [path, queryString] = menuRoute.split('?')

  if (route.path !== path) return false
  if (!queryString) return true

  const params = new URLSearchParams(queryString)

  for (const [key, value] of params.entries()) {
    if (route.query[key] !== value) return false
  }

  return true
}

watch(
  () => route.fullPath,
  () => closeSheets()
)

onMounted(async () => {
  await loadNavigation()
})
</script>

<style scoped>
.pwa-bottom-nav {
  --navy: #061b3a;
  --navy-2: #123b73;
  --orange: #ff7a1a;
  --muted: #64748b;

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(68px + env(safe-area-inset-bottom));
  padding: 0 20px env(safe-area-inset-bottom);
  z-index: 2200;
  display: grid;
  grid-template-columns: 1fr 92px 1fr;
  align-items: center;
  justify-items: center;
  background: rgba(255, 255, 255, .97);
  border-top: 1px solid rgba(6, 27, 58, .10);
  box-shadow: 0 -10px 30px rgba(6, 27, 58, .12);
  backdrop-filter: blur(16px);
}

.nav-side-btn,
.nav-home-wrap {
  border: 0;
  outline: 0;
  -webkit-tap-highlight-color: transparent;
  background: transparent;
}

.nav-side-btn {
  width: 54px;
  min-height: 50px;
  border-radius: 14px;
  color: var(--navy);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.nav-side-btn i {
  font-size: 20px;
}

.nav-side-btn span,
.nav-home-wrap > span:last-child {
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
}

.nav-side-btn.disabled {
  opacity: .35;
}

.nav-home-wrap {
  width: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--navy);
}

.nav-home-btn {
  width: 58px;
  height: 58px;
  margin-top: -25px;
  border: 4px solid #fff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--navy), var(--navy-2));
  box-shadow: 0 14px 28px rgba(6, 27, 58, .24);
  font-size: 23px;
}

.profile-btn i {
  font-size: 19px;
}

.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2205;
  background: rgba(6, 27, 58, .28);
}

.bottom-sheet {
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 2210;
  max-height: min(70dvh, 560px);
  overflow: hidden;
  border: 1px solid rgba(6, 27, 58, .10);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(6, 27, 58, .24);
  display: flex;
  flex-direction: column;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  margin: 8px auto 0;
  border-radius: 999px;
  background: #d1d5db;
}

.sheet-head {
  padding: 9px 12px;
  min-height: 52px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-head span {
  display: block;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.sheet-head h6 {
  margin: 2px 0 0;
  color: var(--navy);
  font-size: 14px;
  font-weight: 950;
}

.sheet-head button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.sheet-menu-list,
.profile-actions {
  padding: 8px;
  overflow-y: auto;
}

.sheet-menu-list::-webkit-scrollbar,
.profile-actions::-webkit-scrollbar {
  width: 0;
}

.sheet-group {
  margin-bottom: 8px;
}

.sheet-group-title {
  min-height: 30px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
}

.group-icon,
.menu-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fff1e6;
  color: var(--orange);
}

.sheet-menu-item,
.profile-actions button {
  width: 100%;
  min-height: 42px;
  margin-bottom: 5px;
  padding: 6px 8px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  color: #334155;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 7px;
  text-align: left;
  box-shadow: inset 0 0 0 1px #eef2f7;
}

.sheet-menu-item.child {
  margin-left: 6px;
  width: calc(100% - 6px);
}

.menu-text {
  min-width: 0;
  font-size: 10.5px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-menu-item.active {
  color: #fff;
  background: linear-gradient(135deg, var(--navy), var(--navy-2));
  box-shadow: 0 9px 20px rgba(6, 27, 58, .16);
}

.sheet-menu-item.active .menu-icon {
  color: #fff;
  background: rgba(255,255,255,.14);
}

.arrow {
  color: #94a3b8;
  font-size: 8px;
}

.sheet-menu-item.active .arrow {
  color: #fff;
}

.sheet-empty {
  min-height: 150px;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  color: #64748b;
}

.sheet-empty i {
  color: #f59e0b;
  font-size: 20px;
}

.sheet-empty strong {
  color: #334155;
  font-size: 11px;
}

.sheet-empty span {
  font-size: 8.5px;
}

.refresh-menu-btn {
  margin-top: 5px;
  padding: 7px 10px;
  border: 0;
  border-radius: 9px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 9px;
  font-weight: 900;
}

.profile-actions button {
  grid-template-columns: 30px minmax(0, 1fr);
  align-items: center;
}

.profile-actions button span:last-child {
  color: var(--navy);
  font-size: 10.5px;
  font-weight: 900;
}

.profile-actions .logout .menu-icon {
  background: #fee2e2;
  color: #dc2626;
}

.profile-actions .logout span:last-child {
  color: #dc2626;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active,
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: all .18s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (max-width: 360px) {
  .pwa-bottom-nav {
    padding-left: 12px;
    padding-right: 12px;
  }

  .bottom-sheet {
    left: 6px;
    right: 6px;
  }
}
</style>
