<template>
  <NomorSuratRiwayatPwa
    v-if="isPwa"
    :loading="loading"
    :exporting="exporting"
    :filter="filter"
    :jenis-options="jenisOptions"
    :action-options="actionOptions"
    :list="list"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected-log="selectedLog"
    :format-date-time="formatDateTime"
    :action-class="actionClass"
    :action-label="actionLabel"
    :compact-changes="compactChanges"
    :change-items="changeItems"
    :format-value="formatValue"
    @update-filter="updateFilter"
    @load-data="loadData(1)"
    @change-page="loadData"
    @reset-filter="resetFilter"
    @export-excel="exportExcel"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />

  <NomorSuratRiwayatWeb
    v-else
    :loading="loading"
    :exporting="exporting"
    :filter="filter"
    :jenis-options="jenisOptions"
    :action-options="actionOptions"
    :list="list"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected-log="selectedLog"
    :format-date-time="formatDateTime"
    :action-class="actionClass"
    :action-label="actionLabel"
    :compact-changes="compactChanges"
    :change-items="changeItems"
    :format-value="formatValue"
    @update-filter="updateFilter"
    @load-data="loadData(1)"
    @change-page="loadData"
    @reset-filter="resetFilter"
    @export-excel="exportExcel"
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

import NomorSuratRiwayatWeb from './components/NomorSuratRiwayatWeb.vue'
import NomorSuratRiwayatPwa from './components/NomorSuratRiwayatPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const exporting = ref(false)
const detailModal = ref(false)
const selectedLog = ref(null)

const list = ref([])
const jenisOptions = ref([])

const filter = reactive({
  aksi: '',
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

const actionOptions = [
  { value: '', label: 'Semua Aksi' },
  { value: 'create', label: 'Tambah Data' },
  { value: 'update', label: 'Ubah Data' },
  { value: 'import', label: 'Upload Massal' },
  { value: 'nonaktif', label: 'Nonaktif / Hapus' }
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
    const response = await api.get('/nomor-surat/riwayat', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        aksi: filter.aksi,
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
      text: 'Gagal memuat riwayat nomor surat.',
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
  filter.aksi = ''
  filter.jenis_surat = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.keyword = ''

  await loadData(1)
}

const exportExcel = async () => {
  exporting.value = true

  try {
    const response = await api.get('/nomor-surat/riwayat/export-excel', {
      params: cleanParams({
        aksi: filter.aksi,
        jenis_surat: filter.jenis_surat,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        keyword: filter.keyword
      }),
      responseType: 'blob'
    })

    downloadBlob(response.data, 'riwayat_nomor_surat.xlsx')
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal ekspor data riwayat.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    exporting.value = false
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

const openDetail = (item) => {
  selectedLog.value = item
  detailModal.value = true
}

const closeDetail = () => {
  selectedLog.value = null
  detailModal.value = false
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

const actionLabel = (aksi) => {
  const labels = {
    create: 'Tambah',
    update: 'Ubah',
    import: 'Upload',
    nonaktif: 'Nonaktif'
  }

  return labels[aksi] || aksi || '-'
}

const actionClass = (aksi) => {
  if (aksi === 'create') return 'bg-success'
  if (aksi === 'update') return 'bg-warning text-dark'
  if (aksi === 'import') return 'bg-primary'
  if (aksi === 'nonaktif') return 'bg-danger'

  return 'bg-secondary'
}

const fieldLabel = (field) => {
  const labels = {
    perihal: 'Perihal',
    tujuan: 'Tujuan',
    keterangan: 'Keterangan',
    status: 'Status',
    alasan_batal: 'Alasan Batal',
    dibatalkan_at: 'Waktu Nonaktif',
    tanggal_surat: 'Tanggal Surat',
    nomor_surat: 'Nomor Surat',
    label_jenis_surat: 'Jenis Surat'
  }

  return labels[field] || field
}

const isDateField = (field) => {
  return [
    'tanggal_surat',
    'created_at',
    'updated_at',
    'dibatalkan_at'
  ].includes(field)
}

const isIsoDateString = (value) => {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
}

const formatValue = (value, field = '') => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (isDateField(field) || isIsoDateString(value)) {
    return formatDateTime(value)
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const changeItems = (changes) => {
  if (!changes || typeof changes !== 'object') {
    return []
  }

  return Object.entries(changes).map(([field, value]) => ({
    field,
    label: fieldLabel(field),
    before: formatValue(value?.before, field),
    after: formatValue(value?.after, field)
  }))
}

const compactChanges = (changes) => {
  const items = changeItems(changes)

  if (!items.length) {
    return '-'
  }

  return items.map((item) => item.label).join(', ')
}

onMounted(async () => {
  await loadJenis()
  await loadData()
})
</script>