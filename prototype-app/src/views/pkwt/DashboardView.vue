<template>
  <DashboardPwa
    v-if="isPwa"
    :loading="loading"
    :total-pegawai="totalPegawai"
    :jumlah-pegawai-aktif="jumlahPegawaiAktif"
    :jumlah-terminasi="jumlahTerminasi"
    :pegawai-internal-aktif="pegawaiInternalAktif"
    :pegawai-penugasan-aktif="pegawaiPenugasanAktif"
    :terminasi-internal="terminasiInternal"
    :terminasi-penugasan="terminasiPenugasan"
    :kontrak-aktif="kontrakAktif"
    :pending-approval="pendingApproval"
    :status-kontrak="statusKontrak"
    :akan-berakhir="akanBerakhir"
    :sudah-berakhir="sudahBerakhir"
    :kontrak-akan-berakhir="kontrakAkanBerakhir"
    :paginated-data="paginatedData"
    :current-page="currentPage"
    :total-pages="totalPages"
    :pagination-pages="paginationPages"
    :change-page="changePage"
    :load-dashboard="loadDashboard"
    :ajukan-perpanjangan="ajukanPerpanjangan"
  />

  <DashboardWeb
    v-else
    :loading="loading"
    :total-pegawai="totalPegawai"
    :jumlah-pegawai-aktif="jumlahPegawaiAktif"
    :jumlah-terminasi="jumlahTerminasi"
    :pegawai-internal-aktif="pegawaiInternalAktif"
    :pegawai-penugasan-aktif="pegawaiPenugasanAktif"
    :terminasi-internal="terminasiInternal"
    :terminasi-penugasan="terminasiPenugasan"
    :kontrak-aktif="kontrakAktif"
    :pending-approval="pendingApproval"
    :status-kontrak="statusKontrak"
    :akan-berakhir="akanBerakhir"
    :sudah-berakhir="sudahBerakhir"
    :kontrak-akan-berakhir="kontrakAkanBerakhir"
    :paginated-data="paginatedData"
    :current-page="currentPage"
    :total-pages="totalPages"
    :pagination-pages="paginationPages"
    :change-page="changePage"
    :load-dashboard="loadDashboard"
    :ajukan-perpanjangan="ajukanPerpanjangan"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import DashboardWeb from './components/DashboardWeb.vue'
import DashboardPwa from './components/DashboardPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)

/*
|--------------------------------------------------------------------------
| Summary Pegawai
|--------------------------------------------------------------------------
| totalPegawai tetap dipertahankan sebagai alias agar komponen lama tidak error.
| Nilainya sekarang sama dengan jumlah pegawai aktif.
*/
const totalPegawai = ref(0)
const jumlahPegawaiAktif = ref(0)
const jumlahTerminasi = ref(0)
const pegawaiInternalAktif = ref(0)
const pegawaiPenugasanAktif = ref(0)
const terminasiInternal = ref(0)
const terminasiPenugasan = ref(0)

/*
|--------------------------------------------------------------------------
| Summary PKWT
|--------------------------------------------------------------------------
*/
const kontrakAktif = ref(0)
const akanBerakhir = ref(0)
const sudahBerakhir = ref(0)
const pendingApproval = ref(0)
const statusKontrak = ref(0)

const kontrakAkanBerakhir = ref([])

const loadDashboard = async () => {
  loading.value = true

  try {
    const response = await api.get('/dashboard')

    // Mendukung response lama dan response baru
    const data = response.data?.data || response.data || {}

    jumlahPegawaiAktif.value =
      data.jumlah_pegawai_aktif ??
      data.pegawai_aktif ??
      data.total_pegawai_aktif ??
      data.total_pegawai ??
      data.jumlah_pegawai ??
      0

    // Alias lama, sekarang diarahkan ke pegawai aktif
    totalPegawai.value = jumlahPegawaiAktif.value

    jumlahTerminasi.value =
      data.jumlah_terminasi ??
      data.total_terminasi ??
      data.terminasi ??
      0

    pegawaiInternalAktif.value =
      data.pegawai_internal_aktif ??
      data.jumlah_pegawai_internal_aktif ??
      0

    pegawaiPenugasanAktif.value =
      data.pegawai_penugasan_aktif ??
      data.jumlah_pegawai_penugasan_aktif ??
      0

    terminasiInternal.value =
      data.terminasi_internal ??
      data.jumlah_terminasi_internal ??
      0

    terminasiPenugasan.value =
      data.terminasi_penugasan ??
      data.jumlah_terminasi_penugasan ??
      0

    kontrakAktif.value =
      data.kontrak_aktif ??
      0

    akanBerakhir.value =
      data.akan_berakhir ??
      data.kontrak_akan_berakhir ??
      0

    sudahBerakhir.value =
      data.sudah_berakhir ??
      data.kontrak_sudah_berakhir ??
      0

    pendingApproval.value =
      data.pending_approval ??
      data.approval_pending ??
      0

    statusKontrak.value =
      data.status_kontrak ??
      0

    kontrakAkanBerakhir.value =
      data.data_kontrak_akan_berakhir ??
      data.kontrak_akan_berakhir_data ??
      data.kontrak_akan_berakhir_list ??
      []

    currentPage.value = 1
  } catch (error) {
    console.error('Gagal load dashboard PKWT:', error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat dashboard PKWT.'
    })
  } finally {
    loading.value = false
  }
}

const ajukanPerpanjangan = async (id) => {
  const result = await Swal.fire({
    icon: 'question',
    title: 'Ajukan Perpanjangan?',
    text: 'Data PKWT ini akan diajukan untuk proses perpanjangan.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Ajukan',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/approval-pkwt/${id}/ajukan`)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pengajuan perpanjangan berhasil dikirim.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadDashboard()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengajukan perpanjangan.'
    })
  }
}

const currentPage = ref(1)
const perPage = ref(5)

const totalPages = computed(() => {
  return Math.ceil(kontrakAkanBerakhir.value.length / perPage.value) || 1
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return kontrakAkanBerakhir.value.slice(start, start + perPage.value)
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 4) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 3) pages.push('...')

  pages.push(total)

  return pages
})

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>
