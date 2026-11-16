<template>
  <LaporanPwa
    v-if="isPwa"
    :loading="loading"
    :is-exporting-excel="isExportingExcel"
    :is-exporting-pdf="isExportingPdf"
    :laporan="laporan"
    :paginated-laporan="paginatedLaporan"
    :summary="summary"
    :filter="filter"
    :unit-kerja-options="unitKerjaOptions"
    :current-page="currentPage"
    :total-pages="totalPages"
    :format-date="formatDate"
    :set-filter="setFilter"
    :load-laporan="loadLaporan"
    :reset-filter="resetFilter"
    :change-page="changePage"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
  />

  <LaporanWeb
    v-else
    :loading="loading"
    :is-exporting-excel="isExportingExcel"
    :is-exporting-pdf="isExportingPdf"
    :laporan="laporan"
    :paginated-laporan="paginatedLaporan"
    :summary="summary"
    :filter="filter"
    :unit-kerja-options="unitKerjaOptions"
    :current-page="currentPage"
    :per-page="perPage"
    :total-pages="totalPages"
    :pagination-pages="paginationPages"
    :format-date="formatDate"
    :set-filter="setFilter"
    :load-laporan="loadLaporan"
    :reset-filter="resetFilter"
    :change-page="changePage"
    :export-excel="exportExcel"
    :export-pdf="exportPdf"
  />
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import LaporanWeb from './components/LaporanWeb.vue'
import LaporanPwa from './components/LaporanPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const isExportingExcel = ref(false)
const isExportingPdf = ref(false)

const laporan = ref([])
const unitKerjaOptions = ref([])

const summary = reactive({
  total: 0,
  aktif: 0,
  diperpanjang: 0,
  berakhir: 0
})

const filter = reactive({
  unit_kerja: '',
  status: '',
  tanggal_dari: '',
  tanggal_sampai: ''
})

const currentPage = ref(1)
const perPage = ref(10)

const cleanParams = (params) => {
  const result = {}

  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      result[key] = params[key]
    }
  })

  return result
}

const setFilter = (key, value) => {
  filter[key] = value
}

const totalPages = computed(() => {
  return Math.ceil(laporan.value.length / perPage.value) || 1
})

const paginatedLaporan = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return laporan.value.slice(start, start + perPage.value)
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const normalizeRows = (responseData) => {
  const directData = responseData?.data

  if (Array.isArray(directData)) {
    return directData
  }

  if (Array.isArray(directData?.data)) {
    return directData.data
  }

  if (Array.isArray(responseData?.laporan)) {
    return responseData.laporan
  }

  if (Array.isArray(responseData)) {
    return responseData
  }

  return []
}

const normalizeSummary = (responseData) => {
  const nested = responseData?.data && !Array.isArray(responseData.data)
    ? responseData.data
    : responseData

  summary.total = nested?.total ?? nested?.summary?.total ?? 0
  summary.aktif = nested?.aktif ?? nested?.summary?.aktif ?? 0
  summary.diperpanjang = nested?.diperpanjang ?? nested?.summary?.diperpanjang ?? 0
  summary.berakhir = nested?.berakhir ?? nested?.summary?.berakhir ?? 0
}

const loadUnitKerja = async () => {
  try {
    const response = await api.get('/pegawai')
    const rows = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []

    unitKerjaOptions.value = [
      ...new Set(
        rows
          .map((item) => item.unit_kerja)
          .filter(Boolean)
      )
    ].sort()
  } catch (error) {
    console.error('Gagal load unit kerja:', error)
    unitKerjaOptions.value = []
  }
}

const loadLaporan = async () => {
  loading.value = true

  try {
    const response = await api.get('/laporan/pkwt', {
      params: cleanParams(filter)
    })

    normalizeSummary(response.data || {})
    laporan.value = normalizeRows(response.data || {})
    currentPage.value = 1
  } catch (error) {
    console.error('Gagal load laporan PKWT:', error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengambil data laporan PKWT.'
    })
  } finally {
    loading.value = false
  }
}

const resetFilter = async () => {
  filter.unit_kerja = ''
  filter.status = ''
  filter.tanggal_dari = ''
  filter.tanggal_sampai = ''

  await loadLaporan()
}

const downloadFile = async (url, filename, mimeType) => {
  const response = await api.get(url, {
    params: cleanParams(filter),
    responseType: 'blob'
  })

  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || mimeType
  })

  const blobUrl = window.URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = blobUrl
  link.download = filename
  window.document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl)
  }, 1000)
}

const exportExcel = async () => {
  isExportingExcel.value = true

  try {
    await downloadFile(
      '/laporan/pkwt/export-excel',
      'laporan-pkwt.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  } catch (error) {
    console.error('Gagal export Excel:', error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal Export',
      text: 'Export Excel gagal diproses.'
    })
  } finally {
    isExportingExcel.value = false
  }
}

const exportPdf = async () => {
  isExportingPdf.value = true

  try {
    await downloadFile(
      '/laporan/pkwt/export-pdf',
      'laporan-pkwt.pdf',
      'application/pdf'
    )
  } catch (error) {
    console.error('Gagal export PDF:', error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal Export',
      text: 'Export PDF gagal diproses.'
    })
  } finally {
    isExportingPdf.value = false
  }
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(async () => {
  await loadUnitKerja()
  await loadLaporan()
})
</script>

<style scoped>
:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>
