<template>
  <ReservasiDriverRiwayatPwa
    v-if="isPwa"
    :loading="loading"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :action-options="actionOptions"
    :action-label="actionLabel"
    :action-class="actionClass"
    :format-date-time="formatDateTime"
    :compact-changes="compactChanges"
    :change-items="changeItems"
    :format-value="formatValue"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-detail="openDetail"
    :close-detail="closeDetail"
  />

  <ReservasiDriverRiwayatWeb
    v-else
    :loading="loading"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :detail-modal="detailModal"
    :selected="selected"
    :action-options="actionOptions"
    :action-label="actionLabel"
    :action-class="actionClass"
    :format-date-time="formatDateTime"
    :compact-changes="compactChanges"
    :change-items="changeItems"
    :format-value="formatValue"
    :load-data="loadData"
    :reset-filter="resetFilter"
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

import ReservasiDriverRiwayatWeb from './components/ReservasiDriverRiwayatWeb.vue'
import ReservasiDriverRiwayatPwa from './components/ReservasiDriverRiwayatPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const detailModal = ref(false)
const selected = ref(null)
const list = ref([])

const filter = reactive({
  aksi: '',
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
  { value: 'create', label: 'Tambah Reservasi' },
  { value: 'update', label: 'Ubah Reservasi' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Tolak' },
  { value: 'cancel', label: 'Batal' },
  { value: 'start', label: 'Mulai' },
  { value: 'arrived', label: 'Sampai' },
  { value: 'standby', label: 'Standby' },
  { value: 'return_office', label: 'Kembali' },
  { value: 'continue_trip', label: 'Lanjut' },
  { value: 'finish', label: 'Selesai' },
  { value: 'incomplete', label: 'Tidak Selesai' }
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

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/reservasi-driver/riwayat', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        aksi: filter.aksi,
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
      text: error.response?.data?.message || 'Gagal memuat riwayat reservasi driver.'
    })
  } finally {
    loading.value = false
  }
}

const resetFilter = async () => {
  filter.aksi = ''
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
  return {
    create: 'Tambah',
    update: 'Ubah',
    approve: 'Approve',
    reject: 'Tolak',
    cancel: 'Batal',
    start: 'Mulai',
    arrived: 'Sampai',
    standby: 'Standby',
    return_office: 'Kembali',
    continue_trip: 'Lanjut',
    finish: 'Selesai',
    incomplete: 'Tidak Selesai'
  }[aksi] || aksi || '-'
}

const actionClass = (aksi) => {
  return {
    create: 'bg-primary',
    update: 'bg-warning text-dark',
    approve: 'bg-success',
    reject: 'bg-danger',
    cancel: 'bg-secondary',
    start: 'bg-primary',
    arrived: 'bg-success',
    standby: 'bg-warning text-dark',
    return_office: 'bg-info text-dark',
    continue_trip: 'bg-indigo',
    finish: 'bg-success',
    incomplete: 'bg-danger'
  }[aksi] || 'bg-secondary'
}

const fieldLabel = (field) => {
  return {
    kode_reservasi: 'Kode Reservasi',
    tanggal_reservasi: 'Tanggal Reservasi',
    jam_mulai: 'Jam Mulai',
    jam_selesai_estimasi: 'Jam Selesai Estimasi',
    nama_pemohon: 'Pemohon',
    unit_kerja: 'Unit Kerja',
    lokasi_jemput: 'Lokasi Jemput',
    tujuan_awal: 'Tujuan Awal',
    keperluan: 'Keperluan',
    driver_id: 'Driver',
    kendaraan_id: 'Kendaraan',
    status_reservasi: 'Status Reservasi',
    status_perjalanan: 'Status Perjalanan',
    approved_at: 'Waktu Approve',
    approved_by: 'Disetujui Oleh',
    cancelled_at: 'Waktu Batal',
    cancelled_by: 'Dibatalkan Oleh',
    cancelled_by_name: 'Nama Pembatal',
    cancelled_by_role: 'Role Pembatal',
    alasan_batal: 'Alasan Batal',
    started_at: 'Waktu Mulai',
    arrived_at: 'Waktu Sampai',
    returned_at: 'Waktu Kembali',
    finished_at: 'Waktu Selesai',
    updated_at: 'Waktu Update',
    created_at: 'Waktu Input',
    tujuans: 'Daftar Tujuan'
  }[field] || field
}

const isIsoDateString = (value) => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  if (isIsoDateString(value)) {
    return formatDateTime(value)
  }

  if (Array.isArray(value)) {
    return `${value.length} data`
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
    before: formatValue(value?.before),
    after: formatValue(value?.after)
  }))
}

const compactChanges = (changes) => {
  const items = changeItems(changes)

  if (items.length === 0) {
    return '-'
  }

  return items
    .slice(0, 3)
    .map((item) => item.label)
    .join(', ')
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