<template>
  <NomorSuratLaporanPwa
    v-if="isPwa"
    :loading="loading"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :filter="filter"
    :jenis-options="jenisOptions"
    :status-options="statusOptions"
    :list="list"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected-data="selectedData"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :status-class="statusClass"
    :status-label="statusLabel"
    @update-filter="updateFilter"
    @load-data="loadData(1)"
    @change-page="loadData"
    @reset-filter="resetFilter"
    @export-excel="exportExcel"
    @export-pdf="exportPdf"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />

  <NomorSuratLaporanWeb
    v-else
    :loading="loading"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :filter="filter"
    :jenis-options="jenisOptions"
    :status-options="statusOptions"
    :list="list"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected-data="selectedData"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :status-class="statusClass"
    :status-label="statusLabel"
    @update-filter="updateFilter"
    @load-data="loadData(1)"
    @change-page="loadData"
    @reset-filter="resetFilter"
    @export-excel="exportExcel"
    @export-pdf="exportPdf"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import NomorSuratLaporanWeb from './components/NomorSuratLaporanWeb.vue'
import NomorSuratLaporanPwa from './components/NomorSuratLaporanPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const detailModal = ref(false)
const selectedData = ref(null)

const list = ref([])
const jenisOptions = ref([])

const filter = reactive({
  status: '',
  jenis_surat: '',
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

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'tidak_aktif', label: 'Tidak Aktif' }
]

const fallbackJenisOptions = [
  { value: 'surat_masuk', label: 'Surat Masuk' },
  { value: 'surat_masuk_direksi', label: 'Surat Masuk Direksi' },
  { value: 'surat_keluar', label: 'Surat Keluar' },
  { value: 'memo', label: 'Memo' },
  { value: 'bast', label: 'BAST' },
  { value: 'pks', label: 'PKS' },
  { value: 'po', label: 'PO' },
  { value: 'spk', label: 'SPK' },
  { value: 'skk', label: 'SKK' },
  { value: 'spbk', label: 'SPBK' },
  { value: 'skpd', label: 'SKPD' },
  { value: 'surat_jalan', label: 'Surat Jalan' },
  { value: 'pkwt', label: 'PKWT' }
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

const loadJenis = async () => {
  try {
    const response = await api.get('/nomor-surat/jenis')
    jenisOptions.value = response.data.data || fallbackJenisOptions
  } catch (error) {
    jenisOptions.value = fallbackJenisOptions
  }
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/nomor-surat/laporan', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        status: filter.status,
        jenis_surat: filter.jenis_surat,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        keyword: filter.keyword
      })
    })

    list.value = response.data.data || []

    const meta = response.data.pagination || {}

    pagination.current_page = meta.current_page || 1
    pagination.last_page = meta.last_page || 1
    pagination.per_page = meta.per_page || 10
    pagination.total = meta.total || 0
    pagination.from = meta.from || 0
    pagination.to = meta.to || 0
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat laporan nomor surat.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const updateFilter = ({ field, value }) => {
  filter[field] = value
}

const resetFilter = async () => {
  filter.status = ''
  filter.jenis_surat = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.keyword = ''

  await loadData(1)
}

const exportExcel = async () => {
  exportingExcel.value = true

  try {
    const response = await api.get('/nomor-surat/laporan/export-excel', {
      params: cleanParams({
        status: filter.status,
        jenis_surat: filter.jenis_surat,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        keyword: filter.keyword
      }),
      responseType: 'blob'
    })

    downloadBlob(response.data, `laporan_nomor_surat_${timestampFile()}.xlsx`)
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal ekspor laporan Excel.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    exportingExcel.value = false
  }
}

const exportPdf = async () => {
  exportingPdf.value = true

  try {
    const response = await api.get('/nomor-surat/laporan/export-pdf', {
      params: cleanParams({
        status: filter.status,
        jenis_surat: filter.jenis_surat,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        keyword: filter.keyword
      }),
      responseType: 'blob'
    })

    downloadBlob(response.data, `laporan_nomor_surat_${timestampFile()}.pdf`)
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal ekspor laporan PDF.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    exportingPdf.value = false
  }
}

const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]))
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

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')

  return `${year}${month}${date}_${hour}${minute}`
}

const openDetail = (item) => {
  selectedData.value = item
  detailModal.value = true
}

const closeDetail = () => {
  selectedData.value = null
  detailModal.value = false
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

const statusLabel = (status) => {
  if (status === 'Aktif') return 'Aktif'
  if (status === 'Tidak Aktif') return 'Tidak Aktif'
  if (status === 'Dibatalkan') return 'Dibatalkan'

  return status || '-'
}

const statusClass = (status) => {
  if (status === 'Aktif') return 'bg-success'
  if (status === 'Tidak Aktif') return 'bg-secondary'
  if (status === 'Dibatalkan') return 'bg-danger'

  return 'bg-secondary'
}

onMounted(async () => {
  await loadJenis()
  await loadData()
})
</script>