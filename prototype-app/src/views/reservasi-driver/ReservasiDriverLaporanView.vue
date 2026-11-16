<template>
  <ReservasiDriverLaporanPwa
    v-if="isPwa"
    :loading="loading"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-reservasi-options="statusReservasiOptions"
    :status-perjalanan-options="statusPerjalananOptions"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :status-perjalanan-label="statusPerjalananLabel"
    :status-perjalanan-class="statusPerjalananClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
    :open-detail="openDetail"
    :close-detail="closeDetail"
  />

  <ReservasiDriverLaporanWeb
    v-else
    :loading="loading"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-reservasi-options="statusReservasiOptions"
    :status-perjalanan-options="statusPerjalananOptions"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :status-perjalanan-label="statusPerjalananLabel"
    :status-perjalanan-class="statusPerjalananClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
    :open-detail="openDetail"
    :close-detail="closeDetail"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ReservasiDriverLaporanWeb from './components/ReservasiDriverLaporanWeb.vue'
import ReservasiDriverLaporanPwa from './components/ReservasiDriverLaporanPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const detailModal = ref(false)
const selected = ref(null)

const list = ref([])
const driverOptions = ref([])
const kendaraanOptions = ref([])

const filter = reactive({
  status_reservasi: '',
  status_perjalanan: '',
  driver_id: '',
  kendaraan_id: '',
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

const statusReservasiOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu Approval' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'on_progress', label: 'Dalam Perjalanan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'incomplete', label: 'Perjalanan Tidak Selesai' }
]

const statusPerjalananOptions = [
  { value: '', label: 'Semua Perjalanan' },
  { value: 'belum_mulai', label: 'Belum Mulai' },
  { value: 'menuju_lokasi', label: 'Menuju Lokasi' },
  { value: 'sampai_lokasi', label: 'Sampai Lokasi' },
  { value: 'standby_lokasi', label: 'Standby Lokasi' },
  { value: 'perjalanan_pulang', label: 'Perjalanan Pulang' },
  { value: 'lanjut_tujuan', label: 'Lanjut Tujuan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'tidak_selesai', label: 'Perjalanan Tidak Selesai' }
]

const cleanParams = (params) => {
  const result = {}

  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      result[key] = params[key]
    }
  })

  return result
}

const loadOptions = async () => {
  const response = await api.get('/reservasi-driver/laporan/options')
  const data = response.data.data || {}

  driverOptions.value = data.drivers || []
  kendaraanOptions.value = data.kendaraans || []
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/reservasi-driver/laporan', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        ...filter
      })
    })

    list.value = response.data.data || []
    Object.assign(pagination, response.data.pagination || {})
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat laporan reservasi driver.'
    })
  } finally {
    loading.value = false
  }
}

const downloadBlob = (response, filename) => {
  const blob = new Blob([response.data], {
    type: response.headers['content-type']
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(url)
}

const timestampFile = () => {
  const now = new Date()

  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const i = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')

  return `${y}${m}${d}_${h}${i}${s}`
}

const exportExcel = async () => {
  exportingExcel.value = true

  try {
    const response = await api.get('/reservasi-driver/laporan/export-excel', {
      params: cleanParams(filter),
      responseType: 'blob'
    })

    downloadBlob(response, `laporan_reservasi_driver_${timestampFile()}.xlsx`)
  } catch (error) {
    Swal.fire('Gagal', 'Export Excel gagal diproses.', 'error')
  } finally {
    exportingExcel.value = false
  }
}

const exportPdf = async () => {
  exportingPdf.value = true

  try {
    const response = await api.get('/reservasi-driver/laporan/export-pdf', {
      params: cleanParams(filter),
      responseType: 'blob'
    })

    downloadBlob(response, `laporan_reservasi_driver_${timestampFile()}.pdf`)
  } catch (error) {
    Swal.fire('Gagal', 'Export PDF gagal diproses.', 'error')
  } finally {
    exportingPdf.value = false
  }
}

const resetFilter = async () => {
  filter.status_reservasi = ''
  filter.status_perjalanan = ''
  filter.driver_id = ''
  filter.kendaraan_id = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.keyword = ''

  await loadData(1)
}

const openDetail = (item) => {
  selected.value = item
  detailModal.value = true
}

const closeDetail = () => {
  detailModal.value = false
  selected.value = null
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
    completed: 'bg-success',
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

onMounted(async () => {
  await loadOptions()
  await loadData()
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