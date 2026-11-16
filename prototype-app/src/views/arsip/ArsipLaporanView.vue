<template>
  <ArsipLaporanPwa
    v-if="isPwa"
    :loading="loading"
    :exporting="exporting"
    :summary="summary"
    :documents="documents"
    :pagination="pagination"
    :filter="filter"
    :options="options"
    :format-date="formatDate"
    :format-file-size="formatFileSize"
    :load-data="loadData"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
  />

  <ArsipLaporanWeb
    v-else
    :loading="loading"
    :exporting="exporting"
    :summary="summary"
    :documents="documents"
    :pagination="pagination"
    :filter="filter"
    :options="options"
    :format-date="formatDate"
    :format-file-size="formatFileSize"
    :load-data="loadData"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ArsipLaporanWeb from './components/ArsipLaporanWeb.vue'
import ArsipLaporanPwa from './components/ArsipLaporanPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const exporting = ref(false)
const documents = ref([])

const summary = reactive({
  total_dokumen: 0,
  dokumen_berjangka: 0,
  dokumen_tidak_berjangka: 0,
  dokumen_aktif: 0,
  akan_berakhir: 0,
  sudah_berakhir: 0
})

const options = reactive({
  units: [],
  folders: [],
  tipe_arsip: [],
  status_dokumen: []
})

const filter = reactive({
  keyword: '',
  arsip_unit_id: '',
  arsip_folder_id: '',
  tipe_arsip: '',
  status_dokumen: '',
  tanggal_mulai: '',
  tanggal_selesai: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
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

const reportParams = () => cleanParams({
  keyword: filter.keyword,
  arsip_unit_id: filter.arsip_unit_id,
  arsip_folder_id: filter.arsip_folder_id,
  tipe_arsip: filter.tipe_arsip,
  status_dokumen: filter.status_dokumen,
  tanggal_mulai: filter.tanggal_mulai,
  tanggal_selesai: filter.tanggal_selesai
})

const loadOptions = async () => {
  try {
    const response = await api.get('/arsip/laporan/options')
    const data = response.data.data || {}

    options.units = data.units || []
    options.folders = data.folders || []
    options.tipe_arsip = data.tipe_arsip || []
    options.status_dokumen = data.status_dokumen || []
  } catch {
    options.units = []
    options.folders = []
    options.tipe_arsip = []
    options.status_dokumen = []
  }
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/arsip/laporan', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        ...reportParams()
      })
    })

    const data = response.data.data || {}

    Object.assign(summary, data.summary || {})
    documents.value = data.documents || []
    Object.assign(pagination, data.pagination || {})
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat laporan arsip.'
    })
  } finally {
    loading.value = false
  }
}

const updateFilter = async () => {
  await loadData(1)
}

const resetFilter = async () => {
  filter.keyword = ''
  filter.arsip_unit_id = ''
  filter.arsip_folder_id = ''
  filter.tipe_arsip = ''
  filter.status_dokumen = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''

  await loadData(1)
}

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

const exportExcel = async () => {
  exporting.value = true

  try {
    const response = await api.get('/arsip/laporan/export-excel', {
      params: reportParams(),
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    downloadBlob(blob, 'laporan_arsip.xlsx')
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Export',
      text: 'Export Excel gagal diproses.'
    })
  } finally {
    exporting.value = false
  }
}

const exportPdf = async () => {
  exporting.value = true

  try {
    const response = await api.get('/arsip/laporan/export-pdf', {
      params: reportParams(),
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/pdf'
    })

    downloadBlob(blob, 'laporan_arsip.pdf')
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Export',
      text: 'Export PDF gagal diproses.'
    })
  } finally {
    exporting.value = false
  }
}

const formatDate = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0)

  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`

  return `${(size / 1024 / 1024).toFixed(1)} MB`
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
</style>