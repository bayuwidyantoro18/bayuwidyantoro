<template>
  <ReservasiDriverApprovalPwa
    v-if="isPwa"
    :loading="loading"
    :saving="saving"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :approve-modal="approveModal"
    :detail-modal="detailModal"
    :selected="selected"
    :approve-form="approveForm"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-label="statusLabel"
    :status-class="statusClass"
    :format-date="formatDate"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-approve-modal="openApproveModal"
    :close-approve-modal="closeApproveModal"
    :submit-approve="submitApprove"
    :reject-reservasi="rejectReservasi"
    :open-detail="openDetail"
    :close-detail="closeDetail"
  />

  <ReservasiDriverApprovalWeb
    v-else
    :loading="loading"
    :saving="saving"
    :list="list"
    :filter="filter"
    :pagination="pagination"
    :approve-modal="approveModal"
    :detail-modal="detailModal"
    :selected="selected"
    :approve-form="approveForm"
    :driver-options="driverOptions"
    :kendaraan-options="kendaraanOptions"
    :status-label="statusLabel"
    :status-class="statusClass"
    :format-date="formatDate"
    :load-data="loadData"
    :reset-filter="resetFilter"
    :open-approve-modal="openApproveModal"
    :close-approve-modal="closeApproveModal"
    :submit-approve="submitApprove"
    :reject-reservasi="rejectReservasi"
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

import ReservasiDriverApprovalWeb from './components/ReservasiDriverApprovalWeb.vue'
import ReservasiDriverApprovalPwa from './components/ReservasiDriverApprovalPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const saving = ref(false)
const approveModal = ref(false)
const detailModal = ref(false)
const selected = ref(null)

const list = ref([])
const driverOptions = ref([])
const kendaraanOptions = ref([])

const defaults = ref({
  driver_id: '',
  kendaraan_id: ''
})

const filter = reactive({
  status: 'pending',
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

const approveForm = reactive({
  driver_id: '',
  kendaraan_id: ''
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
  const response = await api.get('/reservasi-driver/approval/options')
  const data = response.data.data || {}

  driverOptions.value = data.drivers || []
  kendaraanOptions.value = data.kendaraans || []

  defaults.value = {
    driver_id: data.defaults?.driver_id || '',
    kendaraan_id: data.defaults?.kendaraan_id || ''
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
    const response = await api.get('/reservasi-driver/approval', {
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
      text: error.response?.data?.message || 'Gagal memuat data approval reservasi.'
    })
  } finally {
    loading.value = false
  }
}

const openApproveModal = (item) => {
  selected.value = item
  approveForm.driver_id = item.driver_id || defaults.value.driver_id || ''
  approveForm.kendaraan_id = item.kendaraan_id || defaults.value.kendaraan_id || ''
  approveModal.value = true
}

const closeApproveModal = () => {
  approveModal.value = false
  selected.value = null
  approveForm.driver_id = ''
  approveForm.kendaraan_id = ''
}

const submitApprove = async () => {
  if (!selected.value) return

  if (!approveForm.driver_id || !approveForm.kendaraan_id) {
    Swal.fire('Validasi', 'Driver dan kendaraan wajib dipilih.', 'warning')
    return
  }

  saving.value = true

  try {
    await api.post(`/reservasi-driver/approval/${selected.value.id}/approve`, {
      driver_id: approveForm.driver_id,
      kendaraan_id: approveForm.kendaraan_id
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Reservasi berhasil disetujui.',
      timer: 1400,
      showConfirmButton: false
    })

    closeApproveModal()
    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Reservasi gagal disetujui.'
    })
  } finally {
    saving.value = false
  }
}

const rejectReservasi = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Tolak / batalkan reservasi?',
    html: `<strong>${item.kode_reservasi}</strong> akan ditolak / dibatalkan.`,
    input: 'textarea',
    inputPlaceholder: 'Wajib isi alasan penolakan / pembatalan',
    inputValidator: (value) => {
      if (!value) {
        return 'Alasan wajib diisi.'
      }

      return null
    },
    showCancelButton: true,
    confirmButtonText: 'Ya, Tolak',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/reservasi-driver/approval/${item.id}/reject`, {
      alasan_batal: result.value
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Reservasi berhasil ditolak / dibatalkan.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Reservasi gagal ditolak.'
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
  filter.status = 'pending'
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