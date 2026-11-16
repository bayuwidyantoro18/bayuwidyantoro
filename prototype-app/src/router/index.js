import { createRouter, createWebHashHistory } from 'vue-router'

import { systems } from '../demo/catalog.js'
import { registerNavigation } from '../demo/navigation.js'

import MainLayout from '../layouts/MainLayout.vue'


const ManajemenKehadiranDashboardView = () => import('../views/kehadiran/ManajemenKehadiranDashboardView.vue')
const KehadiranView = () => import('../views/kehadiran/KehadiranView.vue')
const PengajuanCutiIzinView = () => import('../views/kehadiran/PengajuanCutiIzinView.vue')
const RekapKehadiranView = () => import('../views/kehadiran/RekapKehadiranView.vue')
const KoreksiKehadiranView = () => import('../views/kehadiran/KoreksiKehadiranView.vue')
const PengajuanLemburView = () => import('../views/kehadiran/PengajuanLemburView.vue')
const KoreksiCutiView = () => import('../views/kehadiran/KoreksiCutiView.vue')
const KoreksiLemburView = () => import('../views/kehadiran/KoreksiLemburView.vue')
const PersetujuanView = () => import('../views/kehadiran/PersetujuanView.vue')
const LaporanKehadiranView = () => import('../views/kehadiran/LaporanKehadiranView.vue')
const LaporanLemburView = () => import('../views/kehadiran/LaporanLemburView.vue')
const LaporanIzinCutiView = () => import('../views/kehadiran/LaporanIzinCutiView.vue')
const PengaturanKehadiranView = () => import('../views/kehadiran/pengaturan/PengaturanKehadiranView.vue')
const PengaturanCutiIzinView = () => import('../views/kehadiran/pengaturan/PengaturanCutiIzinView.vue')
const KehadiranLocationSettingsView = () => import('../views/kehadiran/pengaturan/KehadiranLocationSettingsView.vue')
const PengaturanSlipGajiView = () => import('../views/kehadiran/pengaturan/PengaturanSlipGajiView.vue')
const PengaturanLemburView = () => import('../views/kehadiran/pengaturan/PengaturanLemburView.vue')

const DashboardView = () => import('../views/pkwt/DashboardView.vue')
const PegawaiView = () => import('../views/pkwt/PegawaiView.vue')
const PkwtView = () => import('../views/pkwt/PkwtView.vue')
const ApprovalPkwtView = () => import('../views/pkwt/ApprovalPkwtView.vue')
const TerminasiView = () => import('../views/pkwt/TerminasiView.vue')
const LaporanView = () => import('../views/pkwt/LaporanView.vue')

const AgendaDashboardView = () => import('../views/agenda/AgendaDashboardView.vue')
const AgendaPerjalananView = () => import('../views/agenda/AgendaPerjalananView.vue')
const AgendaLaporanView = () => import('../views/agenda/AgendaLaporanView.vue')
const AgendaMonitoringLokasiView = () => import('../views/agenda/AgendaMonitoringLokasiView.vue')
const AgendaRiwayatPerjalananView = () => import('../views/agenda/AgendaRiwayatPerjalananView.vue')
const AgendaKalenderView = () => import('../views/agenda/AgendaKalenderView.vue')
const AgendaRekapKinerjaView = () => import('../views/agenda/AgendaRekapKinerjaView.vue')

const ReservasiDriverDashboardView = () => import('../views/reservasi-driver/ReservasiDriverDashboardView.vue')
const ReservasiDriverReservasiView = () => import('../views/reservasi-driver/ReservasiDriverReservasiView.vue')
const ReservasiDriverApprovalView = () => import('../views/reservasi-driver/ReservasiDriverApprovalView.vue')
const ReservasiDriverPerjalananView = () => import('../views/reservasi-driver/ReservasiDriverPerjalananView.vue')
const ReservasiDriverRiwayatView = () => import('../views/reservasi-driver/ReservasiDriverRiwayatView.vue')
const ReservasiDriverLaporanView = () => import('../views/reservasi-driver/ReservasiDriverLaporanView.vue')

const ArsipDashboardView = () => import('../views/arsip/ArsipDashboardView.vue')
const ArsipUnitView = () => import('../views/arsip/ArsipUnitView.vue')
const ArsipRiwayatView = () => import('../views/arsip/ArsipRiwayatView.vue')
const ArsipLaporanView = () => import('../views/arsip/ArsipLaporanView.vue')

const NomorSuratDashboardView = () => import('../views/nomor-surat/NomorSuratDashboardView.vue')
const NomorSuratAmbilView = () => import('../views/nomor-surat/NomorSuratAmbilView.vue')
const SuratMasukView = () => import('../views/nomor-surat/SuratMasukView.vue')
const NomorSuratRiwayatView = () => import('../views/nomor-surat/NomorSuratRiwayatView.vue')
const NomorSuratLaporanView = () => import('../views/nomor-surat/NomorSuratLaporanView.vue')



const moduleRoutes = [
      // Manajemen Kehadiran
      {
        path: 'kehadiran',
        redirect: '/kehadiran/dashboard'
      },
      {
        path: 'kehadiran/dashboard',
        name: 'kehadiran-dashboard',
        component: ManajemenKehadiranDashboardView,
        meta: { module: 'kehadiran', menuKey: 'dashboard', title: 'Dashboard Kehadiran' }
      },
      {
        path: 'kehadiran/presensi',
        name: 'kehadiran-presensi',
        component: KehadiranView,
        meta: { module: 'kehadiran', menuKey: 'presensi', title: 'Kehadiran' }
      },
      {
        path: 'kehadiran/cuti-izin',
        name: 'kehadiran-cuti-izin',
        component: PengajuanCutiIzinView,
        meta: { module: 'kehadiran', menuKey: 'pengajuan_cuti_izin', title: 'Pengajuan Cuti & Ijin' }
      },
      {
        path: 'kehadiran/cuti-izin/koreksi',
        name: 'kehadiran-cuti-izin-koreksi',
        component: KoreksiCutiView,
        meta: { module: 'kehadiran', menuKey: 'koreksi_cuti_izin', title: 'Koreksi Cuti & Ijin' }
      },
      {
        path: 'kehadiran/lembur/koreksi',
        name: 'kehadiran-lembur-koreksi',
        component: KoreksiLemburView,
        meta: { module: 'kehadiran', menuKey: 'koreksi_lembur', title: 'Koreksi Lembur' }
      },
      {
        path: 'kehadiran/persetujuan',
        name: 'kehadiran-persetujuan',
        component: PersetujuanView,
        meta: { module: 'persetujuan-kehadiran', menuKey: 'persetujuan', title: 'Persetujuan' }
      },
      {
        path: 'kehadiran/rekap',
        name: 'kehadiran-rekap',
        component: RekapKehadiranView,
        meta: { module: 'kehadiran', menuKey: 'rekap_kehadiran', title: 'Rekap Kehadiran' }
      },
      {
        path: 'kehadiran/koreksi',
        name: 'kehadiran-koreksi',
        component: KoreksiKehadiranView,
        meta: { module: 'kehadiran', menuKey: 'koreksi', title: 'Koreksi Kehadiran' }
      },
      {
        path: 'kehadiran/lembur',
        name: 'kehadiran-lembur',
        component: PengajuanLemburView,
        meta: { module: 'kehadiran', menuKey: 'pengajuan_lembur', title: 'Pengajuan Lembur' }
      },
      {
        path: 'kehadiran/laporan',
        name: 'kehadiran-laporan',
        component: LaporanKehadiranView,
        meta: { module: 'laporan-kehadiran', menuKey: 'kehadiran', title: 'Laporan Kehadiran' }
      },
      {
        path: 'kehadiran/laporan-lembur',
        name: 'kehadiran-laporan-lembur',
        component: LaporanLemburView,
        meta: { module: 'laporan-kehadiran', menuKey: 'lembur', title: 'Laporan Lembur' }
      },
      {
        path: 'kehadiran/laporan-izin-cuti',
        name: 'kehadiran-laporan-izin-cuti',
        component: LaporanIzinCutiView,
        meta: { module: 'laporan-kehadiran', menuKey: 'cuti_izin', title: 'Laporan Izin & Cuti' }
      },
      // Pengaturan yang tetap berada di konteks sidebar Manajemen Kehadiran.
      {
        path: 'kehadiran/pengaturan',
        redirect: '/kehadiran/pengaturan/kehadiran'
      },
      {
        path: 'kehadiran/pengaturan/kehadiran',
        name: 'kehadiran-pengaturan-kehadiran',
        component: PengaturanKehadiranView,
        meta: { module: 'kehadiran', menuKey: 'pengaturan', title: 'Pengaturan Kehadiran' }
      },
      {
        path: 'kehadiran/pengaturan/cuti-izin',
        name: 'kehadiran-pengaturan-cuti-izin',
        component: PengaturanCutiIzinView,
        meta: { module: 'kehadiran', menuKey: 'pengaturan', title: 'Pengaturan Cuti & Ijin' }
      },
      {
        path: 'kehadiran/pengaturan/lembur',
        name: 'kehadiran-pengaturan-lembur',
        component: PengaturanLemburView,
        meta: { module: 'kehadiran', menuKey: 'pengaturan', title: 'Pengaturan Lembur' }
      },
      {
        path: 'kehadiran/pengaturan/dokumen',
        name: 'kehadiran-pengaturan-dokumen',
        component: PengaturanSlipGajiView,
        meta: { module: 'kehadiran', menuKey: 'pengaturan', title: 'Dokumen Kehadiran' }
      },
      {
        path: 'kehadiran/pengaturan/lokasi',
        name: 'kehadiran-pengaturan-lokasi',
        component: KehadiranLocationSettingsView,
        meta: { module: 'kehadiran', menuKey: 'pengaturan', title: 'Lokasi Kantor' }
      },

      // Modul PKWT
      {
        path: 'pkwt/dashboard',
        name: 'pkwt-dashboard',
        component: DashboardView,
        meta: {
          module: 'pkwt',
          menuKey: 'dashboard'
        }
      },
      {
        path: 'pegawai',
        name: 'pegawai',
        component: PegawaiView,
        meta: {
          module: 'pkwt',
          menuKey: 'database_pegawai'
        }
      },
      {
        path: 'pkwt',
        name: 'pkwt',
        component: PkwtView,
        meta: {
          module: 'pkwt',
          menuKey: 'data_pkwt'
        }
      },
      {
        path: 'approval-pkwt',
        name: 'approval-pkwt',
        component: ApprovalPkwtView,
        meta: {
          module: 'pkwt',
          menuKey: 'approval_pkwt'
        }
      },
      {
        path: '/terminasi',
        name: 'Terminasi',
        component: TerminasiView,
        meta: {
          requiresAuth: true,
          module: 'pkwt',
          menuKey: 'terminasi'
        }
      },
      {
        path: 'laporan',
        name: 'laporan',
        component: LaporanView,
        meta: {
          module: 'pkwt',
          menuKey: 'laporan_pkwt'
        }
      },

      // Modul Agenda
      {
        path: 'agenda',
        name: 'agenda-dashboard',
        component: AgendaDashboardView,
        meta: {
          module: 'agenda',
          menuKey: 'dashboard'
        }
      },
      {
        path: 'agenda/perjalanan',
        name: 'agenda-perjalanan',
        component: AgendaPerjalananView,
        meta: {
          module: 'agenda',
          menuKey: 'perjalanan'
        }
      },
      {
        path: 'agenda/laporan',
        name: 'agenda-laporan',
        component: AgendaLaporanView,
        meta: {
          module: 'agenda',
          menuKey: 'laporan'
        }
      },
      {
        path: 'agenda/monitoring-lokasi',
        name: 'agenda.monitoring-lokasi',
        component: AgendaMonitoringLokasiView,
        meta: {
          module: 'agenda',
          menuKey: 'monitoring_lokasi'
        }
      },
      {
        path: 'agenda/riwayat-perjalanan',
        name: 'agenda.riwayat-perjalanan',
        component: AgendaRiwayatPerjalananView,
        meta: {
          module: 'agenda',
          menuKey: 'riwayat_perjalanan'
        }
      },
      {
        path: 'agenda/kalender-agenda',
        name: 'agenda.kalender-agenda',
        component: AgendaKalenderView,
        meta: {
          module: 'agenda',
          menuKey: 'kalender_agenda'
        }
      },
      {
        path: 'agenda/rekap-kinerja',
        name: 'agenda.rekap-kinerja',
        component: AgendaRekapKinerjaView,
        meta: {
          module: 'agenda',
          menuKey: 'rekap_kinerja'
        }
      },

      // Modul Reservasi Driver
      {
        path: 'reservasi-driver',
        redirect: '/reservasi-driver/dashboard'
      },
      {
        path: 'reservasi-driver/dashboard',
        name: 'reservasi-driver-dashboard',
        component: ReservasiDriverDashboardView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'dashboard',
          title: 'Dashboard Reservasi Driver'
        }
      },
      {
        path: 'reservasi-driver/reservasi',
        name: 'reservasi-driver-reservasi',
        component: ReservasiDriverReservasiView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'reservasi',
          title: 'Reservasi'
        }
      },
      {
        path: 'reservasi-driver/approval',
        name: 'reservasi-driver-approval',
        component: ReservasiDriverApprovalView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'approval',
          title: 'Approval'
        }
      },
      {
        path: 'reservasi-driver/perjalanan',
        name: 'reservasi-driver-perjalanan',
        component: ReservasiDriverPerjalananView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'perjalanan',
          title: 'Perjalanan'
        }
      },
      {
        path: 'reservasi-driver/riwayat',
        name: 'reservasi-driver-riwayat',
        component: ReservasiDriverRiwayatView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'riwayat',
          title: 'Riwayat'
        }
      },
      {
        path: 'reservasi-driver/laporan',
        name: 'reservasi-driver-laporan',
        component: ReservasiDriverLaporanView,
        meta: {
          module: 'reservasi-driver',
          menuKey: 'laporan',
          title: 'Laporan'
        }
      },

      // Modul Arsip Perusahaan
      {
        path: 'arsip',
        redirect: '/arsip/dashboard',
        meta: {
          module: 'arsip',
          title: 'Arsip Perusahaan'
        }
      },
      {
        path: 'arsip/dashboard',
        name: 'arsip-dashboard',
        component: ArsipDashboardView,
        meta: {
          module: 'arsip',
          menuKey: 'dashboard',
          title: 'Dashboard Arsip'
        }
      },
      {
        path: 'arsip/unit/:unitSlug',
        name: 'arsip-unit',
        component: ArsipUnitView,
        meta: {
          module: 'arsip',
          menuKey: 'arsip_unit',
          title: 'Arsip Unit Kerja'
        }
      },
      {
        path: 'arsip/riwayat',
        name: 'arsip-riwayat',
        component: ArsipRiwayatView,
        meta: {
          module: 'arsip',
          menuKey: 'riwayat',
          title: 'Riwayat Arsip'
        }
      },
      {
        path: 'arsip/laporan',
        name: 'arsip-laporan',
        component: ArsipLaporanView,
        meta: {
          module: 'arsip',
          menuKey: 'laporan',
          title: 'Laporan Arsip'
        }
      },

      // Nomor Surat Perusahaan
      {
        path: 'nomor-surat/dashboard',
        name: 'nomor-surat-dashboard',
        component: NomorSuratDashboardView,
        meta: {
          module: 'nomor-surat',
          menuKey: 'dashboard'
        }
      },
      {
        path: 'nomor-surat/ambil',
        redirect: '/nomor-surat/surat-keluar'
      },
      {
        path: 'nomor-surat/surat-masuk',
        name: 'nomor-surat-surat-masuk',
        component: SuratMasukView,
        meta: {
          module: 'nomor-surat',
          menuKey: 'surat_masuk',
          title: 'Surat Masuk'
        }
      },
      {
        path: 'nomor-surat/surat-keluar',
        name: 'nomor-surat-surat-keluar',
        component: NomorSuratAmbilView,
        meta: {
          module: 'nomor-surat',
          menuKey: 'surat_keluar',
          title: 'Surat Keluar'
        }
      },
      {
        path: 'nomor-surat/riwayat',
        name: 'nomor-surat-riwayat',
        component: NomorSuratRiwayatView,
        meta: {
          module: 'nomor-surat',
          menuKey: 'riwayat'
        }
      },
      {
        path: 'nomor-surat/laporan',
        name: 'nomor-surat-laporan',
        component: NomorSuratLaporanView,
        meta: {
          module: 'nomor-surat',
          menuKey: 'laporan'
        }
      }
]

const slug = document.body.dataset.demo
const system = systems[slug]
const selectedRoutes = moduleRoutes.filter(({ path, meta }) => {
  if (system.module === 'kehadiran') return path.startsWith('kehadiran')
  if (meta?.module === system.module) return true
  return path.startsWith(system.module + '/') || path === system.module
}).map((route) => ({ ...route, path: route.path.replace(/^\//, '') }))

registerNavigation(system, selectedRoutes)

const router = createRouter({
  history: createWebHashHistory(`/prototipe/${slug}/`),
  routes: [{
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: system.home },
      { path: 'dashboard', redirect: system.home },
      ...selectedRoutes,
      { path: ':pathMatch(.*)*', redirect: system.home },
    ],
  }],
})

export default router
