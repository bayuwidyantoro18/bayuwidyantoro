<template>
  <ReservasiDriverPerjalananPwa
    v-if="isPwa"
    :loading="loading"
    :processing-id="processingId"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :status-perjalanan-label="statusPerjalananLabel"
    :status-perjalanan-class="statusPerjalananClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-detail="openDetail"
    :close-detail="closeDetail"
    :start-trip="startTrip"
    :arrived-trip="arrivedTrip"
    :standby-trip="standbyTrip"
    :return-office="returnOffice"
    :continue-trip="continueTrip"
    :finish-trip="finishTrip"
  />

  <ReservasiDriverPerjalananWeb
    v-else
    :loading="loading"
    :processing-id="processingId"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :status-perjalanan-label="statusPerjalananLabel"
    :status-perjalanan-class="statusPerjalananClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-detail="openDetail"
    :close-detail="closeDetail"
    :start-trip="startTrip"
    :arrived-trip="arrivedTrip"
    :standby-trip="standbyTrip"
    :return-office="returnOffice"
    :continue-trip="continueTrip"
    :finish-trip="finishTrip"
  />
</template>

<script setup>
import { demoPosition } from "../../demo/browser.js"
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ReservasiDriverPerjalananWeb from './components/ReservasiDriverPerjalananWeb.vue'
import ReservasiDriverPerjalananPwa from './components/ReservasiDriverPerjalananPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const processingId = ref(null)
const detailModal = ref(false)
const selected = ref(null)
const list = ref([])

const filter = reactive({
  status_perjalanan: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  keyword: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

const cleanParams = (params) => {
  const result = {}

  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      result[key] = params[key]
    }
  })

  return result
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/reservasi-driver/perjalanan', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        status_perjalanan: filter.status_perjalanan,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        keyword: filter.keyword
      })
    })

    list.value = response.data.data || []
    Object.assign(pagination, response.data.pagination || {})
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat data perjalanan.'
    })
  } finally {
    loading.value = false
  }
}

const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!demoPosition) {
      resolve(null)
      return
    }

    demoPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      () => {
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

const processAction = async (item, endpoint, title, text, successText, confirmButtonColor = '#0d6efd') => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    html: `<strong>${item.kode_reservasi}</strong><br>${text}`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Proses',
    cancelButtonText: 'Batal',
    confirmButtonColor
  })

  if (!result.isConfirmed) return

  processingId.value = item.id

  try {
    const location = await getCurrentLocation()

    await api.post(`/reservasi-driver/perjalanan/${item.id}/${endpoint}`, location || {})

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: successText,
      timer: 1300,
      showConfirmButton: false
    })

    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Aksi perjalanan gagal diproses.'
    })
  } finally {
    processingId.value = null
  }
}

const startTrip = (item) => {
  processAction(
    item,
    'start',
    'Mulai perjalanan?',
    'Status driver akan berubah menjadi dalam perjalanan ke lokasi.',
    'Perjalanan berhasil dimulai.',
    '#0d6efd'
  )
}

const arrivedTrip = (item) => {
  processAction(
    item,
    'arrived',
    'Sudah sampai lokasi?',
    'Status perjalanan akan berubah menjadi sampai lokasi.',
    'Status sampai lokasi berhasil disimpan.',
    '#198754'
  )
}

const standbyTrip = (item) => {
  processAction(
    item,
    'standby',
    'Driver standby di lokasi?',
    'Driver akan tercatat menunggu di lokasi antar.',
    'Status standby berhasil disimpan.',
    '#f59e0b'
  )
}

const returnOffice = (item) => {
  processAction(
    item,
    'return-office',
    'Kembali ke kantor?',
    'Driver akan tercatat dalam perjalanan kembali ke kantor.',
    'Status kembali ke kantor berhasil disimpan.',
    '#0dcaf0'
  )
}

const continueTrip = (item) => {
  processAction(
    item,
    'continue-trip',
    'Lanjut ke tujuan berikutnya?',
    'Driver akan melanjutkan perjalanan ke tujuan selanjutnya.',
    'Status lanjut tujuan berhasil disimpan.',
    '#6366f1'
  )
}

const finishTrip = (item) => {
  processAction(
    item,
    'finish',
    'Selesaikan perjalanan?',
    'Driver akan kembali standby dan kendaraan menjadi tersedia.',
    'Perjalanan berhasil diselesaikan.',
    '#198754'
  )
}

const openDetail = (item) => {
  selected.value = item
  detailModal.value = true
}

const closeDetail = () => {
  detailModal.value = false
  selected.value = null
}

const resetFilter = async () => {
  filter.status_perjalanan = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.keyword = ''

  await loadData(1)
}

const formatDate = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusReservasiLabel = (status) => {
  return {
    pending: 'Menunggu Approval',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    on_progress: 'Dalam Perjalanan',
    completed: 'Selesai',
    incomplete: 'Perjalanan Tidak Selesai'
  }[status] || status || '-'
}

const statusReservasiClass = (status) => {
  return {
    pending: 'bg-warning text-dark',
    approved: 'bg-success',
    rejected: 'bg-danger',
    cancelled: 'bg-secondary',
    on_progress: 'bg-primary',
    completed: 'bg-info text-dark',
    incomplete: 'bg-danger'
  }[status] || 'bg-secondary'
}

const statusPerjalananLabel = (status) => {
  return {
    belum_mulai: 'Belum Mulai',
    menuju_lokasi: 'Menuju Lokasi',
    sampai_lokasi: 'Sampai Lokasi',
    standby_lokasi: 'Standby Lokasi',
    perjalanan_pulang: 'Perjalanan Pulang',
    lanjut_tujuan: 'Lanjut Tujuan',
    selesai: 'Selesai',
    tidak_selesai: 'Perjalanan Tidak Selesai'
  }[status] || status || '-'
}

const statusPerjalananClass = (status) => {
  return {
    belum_mulai: 'bg-secondary',
    menuju_lokasi: 'bg-primary',
    sampai_lokasi: 'bg-success',
    standby_lokasi: 'bg-warning text-dark',
    perjalanan_pulang: 'bg-info text-dark',
    lanjut_tujuan: 'bg-indigo',
    selesai: 'bg-success',
    tidak_selesai: 'bg-danger'
  }[status] || 'bg-secondary'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
:global(.swal2-container) {
  z-index: 99999 !important;
}

:global(.bg-indigo) {
  background-color: #6366f1 !important;
  color: #ffffff !important;
}
</style>