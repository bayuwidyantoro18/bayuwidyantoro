<template>
  <aside class="app-sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo-box">
        <img
          :src="'/prototipe/branding-demo.svg'"
          alt="mPro Logo"
          class="brand-logo"
        >
      </div>

      <div class="brand-text">
        <div class="brand-title">mPro Internal</div>
        <div class="brand-subtitle">System</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav nav-pills nav-sidebar flex-column">
        <li class="nav-item">
          <router-link
            to="/dashboard"
            class="nav-link sidebar-link back-link"
          >
            <i class="nav-icon fas fa-arrow-left"></i>
            <span>Beranda</span>
          </router-link>
        </li>

        <li class="sidebar-heading">
          <span>{{ moduleTitle }}</span>
        </li>

        <li
          v-for="item in activeMenu"
          :key="item.label"
          class="nav-item"
        >
          <template v-if="item.children">
            <button
              type="button"
              class="nav-link sidebar-link sidebar-parent-btn"
              :class="{ active: isParentActive(item) }"
              @click="toggleSubmenu(item.label)"
            >
              <i class="nav-icon" :class="item.icon"></i>
              <span>{{ item.label }}</span>

              <i
                class="fas fa-chevron-down submenu-arrow"
                :class="{ rotate: openedSubmenus.includes(item.label) }"
              ></i>
            </button>

            <div
              v-if="openedSubmenus.includes(item.label)"
              class="submenu-wrapper"
            >
              <router-link
                v-for="child in item.children"
                :key="child.route"
                :to="child.route"
                class="nav-link sidebar-link submenu-link"
                :class="{ active: isActiveMenu(child.route) }"
              >
                <i class="nav-icon" :class="child.icon"></i>
                <span>{{ child.label }}</span>
              </router-link>
            </div>
          </template>

          <router-link
            v-else
            :to="item.route"
            class="nav-link sidebar-link"
            :class="{ active: isActiveMenu(item.route) }"
          >
            <i class="nav-icon" :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccessControl } from '../composables/useAccessControl'

const route = useRoute()

const {
  modules,
  loadNavigation
} = useAccessControl()

const openedSubmenus = ref([])

const fallbackMenuModules = {
  profil: {
    title: 'Profil Saya',
    menus: [
      {
        label: 'Akun Saya',
        route: '/profil-saya?tab=akun',
        icon: 'fas fa-user-shield'
      },
      {
        label: 'Data Saya',
        route: '/profil-saya?tab=data',
        icon: 'fas fa-id-card'
      },
      {
        label: 'Dokumen Saya',
        route: '/dokumen-saya',
        icon: 'fas fa-folder-open'
      }
    ]
  }
}

const currentModule = computed(() => {
  // Seluruh halaman di bawah /kehadiran memakai sidebar modul Kehadiran,
  // termasuk route pengajuan/koreksi yang metadata izinnya memakai modul lain.
  if (route.path === '/kehadiran' || route.path.startsWith('/kehadiran/')) {
    return 'kehadiran'
  }

  return route.meta.module || 'pkwt'
})

const currentModuleData = computed(() => {
  return modules.value.find((item) => {
    return item.module_key === currentModule.value ||
      item.code === currentModule.value
  }) || null
})

const moduleTitle = computed(() => {
  if (currentModuleData.value) {
    return currentModuleData.value.module_name ||
      currentModuleData.value.name ||
      'mPro Internal Home'
  }

  return fallbackMenuModules[currentModule.value]?.title || 'mPro Internal Home'
})

const normalizeMenu = (menu) => {
  const children = Array.isArray(menu.children)
    ? menu.children.map(normalizeMenu).filter((child) => child.route && child.route !== '#')
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

const groupNomorSuratMenus = (menus) => {
  if (currentModule.value !== 'nomor-surat') {
    return menus
  }

  const dashboardMenus = menus.filter((item) => item.key === 'dashboard')
  const suratMasuk = menus.find((item) => item.key === 'surat_masuk' || item.route === '/nomor-surat/surat-masuk')
  const suratKeluar = menus.find((item) => {
    return item.key === 'surat_keluar' ||
      item.key === 'ambil_nomor' ||
      item.route === '/nomor-surat/surat-keluar' ||
      item.route === '/nomor-surat/ambil'
  })

  const nomorSuratChildren = []

  if (suratMasuk) {
    nomorSuratChildren.push({
      ...suratMasuk,
      label: 'Surat Masuk',
      route: '/nomor-surat/surat-masuk',
      icon: 'fas fa-inbox'
    })
  }

  if (suratKeluar) {
    nomorSuratChildren.push({
      ...suratKeluar,
      key: 'surat_keluar',
      label: 'Surat Keluar',
      route: '/nomor-surat/surat-keluar',
      icon: 'fas fa-paper-plane'
    })
  }

  const usedKeys = ['dashboard', 'surat_masuk', 'surat_keluar', 'ambil_nomor']
  const usedRoutes = ['/nomor-surat/surat-masuk', '/nomor-surat/surat-keluar', '/nomor-surat/ambil']

  const otherMenus = menus.filter((item) => {
    return !usedKeys.includes(item.key) && !usedRoutes.includes(item.route)
  })

  const result = [...dashboardMenus]

  if (nomorSuratChildren.length) {
    result.push({
      key: 'nomor_surat_group',
      label: 'Nomor Surat',
      route: '#',
      icon: 'fas fa-envelope-open-text',
      children: nomorSuratChildren
    })
  }

  return [...result, ...otherMenus]
}

const groupKehadiranMenus = (menus) => {
  if (currentModule.value !== 'kehadiran') {
    return menus
  }

  // Pilih menu berdasarkan route terlebih dahulu agar key seperti "koreksi"
  // tidak tertukar antara koreksi kehadiran, cuti, dan lembur.
  const findMenu = (keys, routes) => {
    const byRoute = menus.find((item) => routes.includes(item.route))
    if (byRoute) return byRoute
    return menus.find((item) => keys.includes(item.key))
  }

  const makeChild = (source, key, label, route, icon) => {
    if (!source) return null
    return { ...source, key, label, route, icon, children: null }
  }

  const dashboard = findMenu(
    ['dashboard'],
    ['/kehadiran/dashboard']
  )

  const presensi = makeChild(
    findMenu(['presensi'], ['/kehadiran/presensi']),
    'presensi',
    'Presensi',
    '/kehadiran/presensi',
    'fas fa-user-clock'
  )
  const koreksiKehadiran = makeChild(
    findMenu(['koreksi_kehadiran', 'koreksi'], ['/kehadiran/koreksi']),
    'koreksi_kehadiran',
    'Koreksi',
    '/kehadiran/koreksi',
    'fas fa-user-edit'
  )
  const rekapKehadiran = makeChild(
    findMenu(['rekap_kehadiran'], ['/kehadiran/rekap']),
    'rekap_kehadiran',
    'Rekap Kehadiran',
    '/kehadiran/rekap',
    'fas fa-table'
  )

  const pengajuanCuti = makeChild(
    findMenu(['pengajuan_cuti_izin', 'pengajuan_cuti'], ['/kehadiran/cuti-izin']),
    'pengajuan_cuti_izin',
    'Pengajuan',
    '/kehadiran/cuti-izin',
    'fas fa-calendar-plus'
  )
  const koreksiCuti = makeChild(
    findMenu(
      ['koreksi_cuti_izin', 'koreksi_cuti', 'cuti_izin_koreksi'],
      ['/kehadiran/cuti-izin/koreksi']
    ),
    'koreksi_cuti_izin',
    'Koreksi',
    '/kehadiran/cuti-izin/koreksi',
    'fas fa-calendar-check'
  )

  const pengajuanLembur = makeChild(
    findMenu(['pengajuan_lembur', 'lembur'], ['/kehadiran/lembur']),
    'pengajuan_lembur',
    'Pengajuan',
    '/kehadiran/lembur',
    'fas fa-business-time'
  )
  const koreksiLembur = makeChild(
    findMenu(['koreksi_lembur'], ['/kehadiran/lembur/koreksi']),
    'koreksi_lembur',
    'Koreksi',
    '/kehadiran/lembur/koreksi',
    'fas fa-clock'
  )

  const persetujuan = findMenu(
    ['persetujuan'],
    ['/kehadiran/persetujuan']
  )

  const laporanKehadiran = makeChild(
    findMenu(['laporan_kehadiran', 'kehadiran'], ['/kehadiran/laporan']),
    'laporan_kehadiran',
    'Kehadiran',
    '/kehadiran/laporan',
    'fas fa-calendar-check'
  )
  const laporanCuti = makeChild(
    findMenu(['laporan_izin_cuti', 'cuti_izin'], ['/kehadiran/laporan-izin-cuti']),
    'laporan_izin_cuti',
    'Cuti & Ijin',
    '/kehadiran/laporan-izin-cuti',
    'fas fa-file-medical'
  )
  const laporanLembur = makeChild(
    findMenu(['laporan_lembur', 'lembur'], ['/kehadiran/laporan-lembur']),
    'laporan_lembur',
    'Lembur',
    '/kehadiran/laporan-lembur',
    'fas fa-business-time'
  )

  // Pengaturan memakai satu izin menu induk dari backend. Submenu di bawah
  // merupakan shortcut ke halaman pengaturan yang sudah didefinisikan router.
  const pengaturan = findMenu(
    ['pengaturan'],
    ['/kehadiran/pengaturan', '/pengaturan/kehadiran']
  )
  const settingsGroup = pengaturan
    ? {
        key: 'pengaturan_group',
        label: 'Pengaturan',
        route: '#',
        icon: 'fas fa-cog',
        permissions: pengaturan.permissions || {},
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
            label: 'Cuti & Ijin',
            route: '/kehadiran/pengaturan/cuti-izin',
            icon: 'fas fa-calendar-check',
            permissions: pengaturan.permissions || {}
          },
          {
            key: 'pengaturan_lembur',
            label: 'Lembur',
            route: '/kehadiran/pengaturan/lembur',
            icon: 'fas fa-business-time',
            permissions: pengaturan.permissions || {}
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
            label: 'Lokasi Kantor',
            route: '/kehadiran/pengaturan/lokasi',
            icon: 'fas fa-location-dot',
            permissions: pengaturan.permissions || {}
          }
        ]
      }
    : null

  const group = (key, label, icon, children) => {
    const availableChildren = children.filter(Boolean)
    return availableChildren.length
      ? { key, label, route: '#', icon, children: availableChildren }
      : null
  }

  const desiredMenus = [
    dashboard ? { ...dashboard, label: 'Dashboard', route: '/kehadiran/dashboard', children: null } : null,
    group('kehadiran_group', 'Kehadiran', 'fas fa-clock', [
      presensi,
      koreksiKehadiran,
      rekapKehadiran
    ]),
    group('cuti_izin_group', 'Cuti & Ijin', 'fas fa-calendar-alt', [
      pengajuanCuti,
      koreksiCuti
    ]),
    group('lembur_group', 'Lembur', 'fas fa-business-time', [
      pengajuanLembur,
      koreksiLembur
    ]),
    persetujuan
      ? { ...persetujuan, label: 'Persetujuan', route: '/kehadiran/persetujuan', children: null }
      : null,
    group('laporan_group', 'Laporan', 'fas fa-chart-bar', [
      laporanKehadiran,
      laporanCuti,
      laporanLembur
    ]),
    settingsGroup
  ].filter(Boolean)

  // Jangan tampilkan ulang item yang sudah dimasukkan ke dalam kelompok.
  // Item backend lain yang tidak termasuk struktur standar tetap dipertahankan.
  const usedKeys = new Set([
    'dashboard', 'presensi', 'koreksi', 'koreksi_kehadiran',
    'rekap_kehadiran', 'pengajuan_cuti_izin', 'pengajuan_cuti',
    'koreksi_cuti_izin', 'koreksi_cuti', 'cuti_izin_koreksi',
    'pengajuan_lembur', 'lembur', 'koreksi_lembur', 'persetujuan',
    'laporan_kehadiran', 'laporan_izin_cuti', 'cuti_izin',
    'laporan_lembur', 'pengaturan'
  ])
  const usedRoutes = new Set([
    '/kehadiran/dashboard', '/kehadiran/presensi', '/kehadiran/koreksi',
    '/kehadiran/rekap', '/kehadiran/cuti-izin',
    '/kehadiran/cuti-izin/koreksi', '/kehadiran/lembur',
    '/kehadiran/lembur/koreksi', '/kehadiran/persetujuan',
    '/kehadiran/laporan', '/kehadiran/laporan-izin-cuti',
    '/kehadiran/laporan-lembur', '/kehadiran/pengaturan',
    '/pengaturan/kehadiran', '/pengaturan/cuti-izin', '/pengaturan/lembur',
    '/pengaturan/dokumen', '/pengaturan/dokumen/slip-gaji', '/pengaturan/lokasi',
    '/pengaturan/kehadiran/lokasi', '/kehadiran/pengaturan/cuti-izin',
    '/kehadiran/pengaturan/lembur', '/kehadiran/pengaturan/dokumen',
    '/kehadiran/pengaturan/lokasi'
  ])
  const extras = menus.filter((item) =>
    !usedKeys.has(item.key) && !usedRoutes.has(item.route)
  )

  return [...desiredMenus, ...extras]
}

const filterGlobalPengaturanMenus = (menus) => {
  if (currentModule.value !== 'pengaturan') {
    return menus
  }

  // Pengaturan global hanya untuk konfigurasi portal dan akses pengguna.
  // Konfigurasi Kehadiran/Cuti/Lembur/Dokumen/Lokasi dikelola dari
  // Manajemen Kehadiran > Pengaturan.
  const excludedKeys = new Set([
    'kehadiran', 'cuti_izin', 'cuti-izin', 'cuti_ijin', 'lembur',
    'dokumen', 'lokasi', 'lokasi_radius', 'lokasi_kantor'
  ])
  const excludedLabels = new Set([
    'kehadiran', 'cuti & ijin', 'cuti & izin', 'cuti ijin', 'cuti izin',
    'lembur', 'dokumen', 'lokasi', 'lokasi (radius)', 'lokasi kantor'
  ])
  const excludedRoutes = new Set([
    '/pengaturan/kehadiran',
    '/pengaturan/kehadiran/koreksi',
    '/pengaturan/kehadiran/jam-kerja',
    '/pengaturan/kehadiran/event-shift',
    '/pengaturan/kehadiran/lokasi',
    '/pengaturan/cuti-izin',
    '/pengaturan/cuti-izin/hak-cuti',
    '/pengaturan/lembur',
    '/pengaturan/dokumen',
    '/pengaturan/dokumen/slip-gaji',
    '/pengaturan/lokasi'
  ])

  return menus.filter((item) => {
    if (excludedKeys.has(item.key)) return false
    if (excludedLabels.has(String(item.label || '').trim().toLowerCase())) return false
    if (excludedRoutes.has(item.route)) return false
    return true
  })
}

const activeMenu = computed(() => {
  if (currentModuleData.value?.menus?.length) {
    const menus = currentModuleData.value.menus
      .map(normalizeMenu)
      .filter((menu) => {
        return (menu.children?.length) || (menu.route && menu.route !== '#')
      })

    const groupedMenus = groupKehadiranMenus(
      groupNomorSuratMenus(menus)
    )

    return filterGlobalPengaturanMenus(groupedMenus)
  }

  return fallbackMenuModules[currentModule.value]?.menus || []
})

const isActiveMenu = (menuRoute) => {
  const [path, queryString] = menuRoute.split('?')

  if (route.path !== path) {
    return false
  }

  if (!queryString) {
    return true
  }

  const params = new URLSearchParams(queryString)

  for (const [key, value] of params.entries()) {
    if (route.query[key] !== value) {
      return false
    }
  }

  return true
}

const isParentActive = (item) => {
  return item.children?.some((child) => isActiveMenu(child.route))
}

const toggleSubmenu = (label) => {
  if (openedSubmenus.value.includes(label)) {
    openedSubmenus.value = openedSubmenus.value.filter((item) => item !== label)
    return
  }

  openedSubmenus.value.push(label)
}

watch(
  () => route.fullPath,
  () => {
    activeMenu.value.forEach((item) => {
      if (item.children?.length && isParentActive(item) && !openedSubmenus.value.includes(item.label)) {
        openedSubmenus.value.push(item.label)
      }
    })
  },
  { immediate: true }
)

onMounted(async () => {
  await loadNavigation()
})
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background: #ffffff;
  color: #111827;
  border-right: 1px solid #e5e7eb;
  z-index: 1030;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0.12rem 0 0.45rem rgba(15, 23, 42, 0.035);
}

/* Scrollbar lebih halus */
.app-sidebar::-webkit-scrollbar {
  width: 5px;
}

.app-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.app-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 999px;
}

/* Brand */
.sidebar-brand {
  min-height: 70px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo {
  width: 34px;
  height: auto;
  display: block;
}

.brand-text {
  min-width: 0;
  line-height: 1.15;
}

.brand-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  margin-top: 2px;
}

/* Navigation */
.sidebar-nav {
  padding: 8px 8px 12px;
}

.nav-sidebar {
  width: 100%;
}

.nav-item {
  width: 100%;
  margin-bottom: 3px;
}

.sidebar-link {
  width: 100%;
  min-height: 34px;
  display: flex !important;
  align-items: center !important;
  gap: 8px;
  padding: 7px 9px;
  color: #374151 !important;
  text-decoration: none;
  border-radius: 8px;
  white-space: nowrap;
  line-height: 1;
  transition: all 0.16s ease;
  border: 1px solid transparent;
}

.sidebar-link .nav-icon {
  width: 18px;
  min-width: 18px;
  text-align: center;
  font-size: 12.5px;
  color: #6b7280 !important;
}

.sidebar-link span {
  color: inherit !important;
  font-size: 12.5px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover */
.sidebar-link:hover {
  background: #f3f4f6 !important;
  color: #111827 !important;
  border-color: #edf2f7;
}

.sidebar-link:hover .nav-icon {
  color: #111827 !important;
}

/* Active */
.sidebar-link.active {
  background: linear-gradient(135deg, #0d6efd, #2563eb) !important;
  color: #ffffff !important;
  font-weight: 800;
  box-shadow: 0 0.35rem 0.75rem rgba(13, 110, 253, 0.22);
}

.sidebar-link.active .nav-icon,
.sidebar-link.active span {
  color: #ffffff !important;
}

/* Back link */
.back-link {
  background: #f8fafc !important;
  color: #475569 !important;
  border-color: #e5e7eb;
}

.back-link .nav-icon {
  color: #475569 !important;
}

.back-link:hover {
  background: #eef2ff !important;
  color: #1d4ed8 !important;
}

.back-link:hover .nav-icon {
  color: #1d4ed8 !important;
}

/* Heading modul */
.sidebar-heading {
  padding: 10px 9px 5px;
  margin-top: 4px;
  font-size: 9.8px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 7px;
}

.sidebar-heading::after {
  content: "";
  height: 1px;
  flex: 1;
  background: #e5e7eb;
}

.sidebar-parent-btn {
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
}

.sidebar-parent-btn .submenu-arrow {
  margin-left: auto;
  font-size: 9px;
  color: #94a3b8;
  transition: transform 0.18s ease;
}

.sidebar-parent-btn .submenu-arrow.rotate {
  transform: rotate(180deg);
}

.sidebar-parent-btn.active {
  background: #f3f4f6 !important;
  color: #111827 !important;
  box-shadow: none !important;
}

.sidebar-parent-btn.active .nav-icon,
.sidebar-parent-btn.active span {
  color: #111827 !important;
}

.submenu-wrapper {
  margin: 3px 0 5px 12px;
  padding-left: 8px;
  border-left: 1px dashed rgba(148, 163, 184, 0.5);
}

.submenu-link {
  min-height: 30px;
  padding: 6px 8px;
  border-radius: 7px;
}

.submenu-link span {
  font-size: 11.5px;
  font-weight: 700;
}

.submenu-link .nav-icon {
  font-size: 11px;
}

/* Supaya tampilan tetap rapi di layar kecil */
@media (max-width: 768px) {
  .app-sidebar {
    width: 220px;
  }
}
</style>