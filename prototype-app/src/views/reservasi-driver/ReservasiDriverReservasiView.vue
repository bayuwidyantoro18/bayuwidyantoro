<template>
  <ReservasiDriverReservasiPwa
    v-if="isPwa"
    :loading="loading"
    :saving="saving"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :form="form"
    :form-modal="formModal"
    :detail-modal="detailModal"
    :is-edit="isEdit"
    :selected="selected"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-label="statusLabel"
    :status-class="statusClass"
    :format-date="formatDate"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-create-modal="openCreateModal"
    :open-edit-modal="openEditModal"
    :close-form-modal="closeFormModal"
    :submit-form="submitForm"
    :cancel-reservasi="cancelReservasi"
    :open-detail="openDetail"
    :close-detail="closeDetail"
    :add-tujuan="addTujuan"
    :remove-tujuan="removeTujuan"
    :today-date="todayDate"
    :current-time="currentTime"
  />

  <ReservasiDriverReservasiWeb
    v-else
    :loading="loading"
    :saving="saving"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :form="form"
    :form-modal="formModal"
    :detail-modal="detailModal"
    :is-edit="isEdit"
    :selected="selected"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-label="statusLabel"
    :status-class="statusClass"
    :format-date="formatDate"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-create-modal="openCreateModal"
    :open-edit-modal="openEditModal"
    :close-form-modal="closeFormModal"
    :submit-form="submitForm"
    :cancel-reservasi="cancelReservasi"
    :open-detail="openDetail"
    :close-detail="closeDetail"
    :add-tujuan="addTujuan"
    :remove-tujuan="removeTujuan"
    :today-date="todayDate"
    :current-time="currentTime"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ReservasiDriverReservasiWeb from './components/ReservasiDriverReservasiWeb.vue'
import ReservasiDriverReservasiPwa from './components/ReservasiDriverReservasiPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const saving = ref(false)
const formModal = ref(false)
const detailModal = ref(false)
const isEdit = ref(false)
const selected = ref(null)

const list = ref([])
const driverOptions = ref([])
const kendaraanOptions = ref([])

const userInfo = ref({
  name: '',
  unit_kerja: ''
})

const DEFAULT_LOKASI_JEMPUT = 'Kantor mPro Jakarta Mampang'

const defaults = ref({
  lokasi_jemput: DEFAULT_LOKASI_JEMPUT,
  driver_id: '',
  kendaraan_id: ''
})

const filter = reactive({
  status: '',
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

const form = reactive({
  id: null,
  tanggal_reservasi: '',
  jam_mulai: '',
  jam_selesai_estimasi: '',
  unit_kerja: '',
  lokasi_jemput: '',
  tujuan_awal: '',
  keperluan: '',
  driver_id: '',
  kendaraan_id: '',
  tujuans: []
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

const loadOptions = async () => {
  const response = await api.get('/reservasi-driver/options')
  const data = response.data.data || {}

  driverOptions.value = data.drivers || []
  kendaraanOptions.value = data.kendaraans || []

  defaults.value = {
    lokasi_jemput: data.defaults?.lokasi_jemput || DEFAULT_LOKASI_JEMPUT,
    driver_id: data.defaults?.driver_id || '',
    kendaraan_id: data.defaults?.kendaraan_id || ''
  }

  userInfo.value = {
    name: data.user?.name || '',
    unit_kerja: data.user?.unit_kerja || ''
  }

  if (driverOptions.value.length === 1) {
    defaults.value.driver_id = driverOptions.value[0].id
  }

  if (kendaraanOptions.value.length === 1) {
    defaults.value.kendaraan_id = kendaraanOptions.value[0].id
  }
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/reservasi-driver/reservasi', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        status: filter.status,
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
      text: errorMessage(error, 'Gagal memuat data reservasi.')
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = null
  form.tanggal_reservasi = todayDate()
  form.jam_mulai = currentTime()
  form.jam_selesai_estimasi = ''
  form.unit_kerja = userInfo.value.unit_kerja || ''
  form.lokasi_jemput = defaults.value.lokasi_jemput || DEFAULT_LOKASI_JEMPUT
  form.tujuan_awal = ''
  form.keperluan = ''
  form.driver_id = defaults.value.driver_id || ''
  form.kendaraan_id = defaults.value.kendaraan_id || ''
  form.tujuans = []
}

const openCreateModal = () => {
  resetForm()
  isEdit.value = false
  formModal.value = true
}

const todayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const currentTime = () => {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
}

const openEditModal = (item) => {
  resetForm()

  isEdit.value = true
  form.id = item.id
  form.tanggal_reservasi = item.tanggal_reservasi?.substring(0, 10) || ''
  form.jam_mulai = item.jam_mulai || ''
  form.jam_selesai_estimasi = item.jam_selesai_estimasi || ''
  form.unit_kerja = item.unit_kerja || ''
  form.lokasi_jemput = item.lokasi_jemput || ''
  form.tujuan_awal = item.tujuan_awal || ''
  form.keperluan = item.keperluan || ''
  form.driver_id = item.driver_id || ''
  form.kendaraan_id = item.kendaraan_id || ''

    form.tujuans = (item.tujuans || [])
    .filter((tujuan) => Number(tujuan.urutan) > 1)
    .map((tujuan) => ({
        tujuan: tujuan.tujuan,
        alamat_tujuan: tujuan.alamat_tujuan || '',
        keterangan: tujuan.keterangan || ''
    }))

  formModal.value = true
}

const closeFormModal = () => {
  formModal.value = false
  resetForm()
}

const addTujuan = () => {
  form.tujuans.push({
    tujuan: '',
    alamat_tujuan: '',
    keterangan: ''
  })
}

const removeTujuan = (index) => {
  form.tujuans.splice(index, 1)
}


const errorMessage = (error, fallback = 'Terjadi kesalahan.') => {
  const response = error?.response?.data

  if (response?.errors) {
    const firstKey = Object.keys(response.errors)[0]
    const firstMessage = response.errors[firstKey]?.[0]

    if (firstMessage) {
      return firstMessage
    }
  }

  return response?.message || fallback
}

const isPastStartTime = () => {
  return form.tanggal_reservasi === todayDate() && form.jam_mulai && form.jam_mulai < currentTime()
}

const submitForm = async () => {
  if (!form.tanggal_reservasi || !form.jam_mulai || !form.jam_selesai_estimasi || !form.lokasi_jemput || !form.tujuan_awal || !form.keperluan) {
    Swal.fire('Validasi', 'Tanggal, jam mulai, jam selesai estimasi, lokasi jemput, tujuan, dan keperluan wajib diisi.', 'warning')
    return
  }

  if (isPastStartTime()) {
    Swal.fire('Validasi', 'Jam mulai tidak boleh lebih kecil dari waktu sekarang.', 'warning')
    return
  }

  saving.value = true

  try {
    const payload = {
      tanggal_reservasi: form.tanggal_reservasi,
      jam_mulai: form.jam_mulai,
      jam_selesai_estimasi: form.jam_selesai_estimasi || null,
      unit_kerja: form.unit_kerja,
      lokasi_jemput: form.lokasi_jemput,
      tujuan_awal: form.tujuan_awal,
      keperluan: form.keperluan,
      driver_id: form.driver_id || null,
      kendaraan_id: form.kendaraan_id || null,
      tujuans: Array.isArray(form.tujuans)
        ? form.tujuans.filter((item) => item && item.tujuan)
        : []
    }

    if (isEdit.value) {
      await api.put(`/reservasi-driver/reservasi/${form.id}`, payload)
    } else {
      await api.post('/reservasi-driver/reservasi', payload)
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isEdit.value ? 'Reservasi berhasil diperbarui.' : 'Reservasi berhasil dibuat.',
      timer: 1400,
      showConfirmButton: false
    })

    closeFormModal()
    await loadData(1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage(error, 'Data gagal disimpan.')
    })
  } finally {
    saving.value = false
  }
}

const cancelReservasi = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Batalkan reservasi?',
    html: `<strong>${item.kode_reservasi}</strong> akan dibatalkan.`,
    input: 'textarea',
    inputPlaceholder: 'Wajib isi alasan pembatalan',
    inputValidator: (value) => {
      if (!value) {
        return 'Alasan pembatalan wajib diisi.'
      }

      return null
    },
    showCancelButton: true,
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/reservasi-driver/reservasi/${item.id}/cancel`, {
      alasan_batal: result.value
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Reservasi berhasil dibatalkan.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage(error, 'Reservasi gagal dibatalkan.')
    })
  }
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
  filter.status = ''
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

const statusLabel = (status) => {
  return {
    pending: 'Menunggu Approval',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    on_progress: 'Dalam Perjalanan',
    completed: 'Selesai'
  }[status] || status || '-'
}

const statusClass = (status) => {
  return {
    pending: 'bg-warning text-dark',
    approved: 'bg-success',
    rejected: 'bg-danger',
    cancelled: 'bg-secondary',
    on_progress: 'bg-primary',
    completed: 'bg-info text-dark'
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
</style>