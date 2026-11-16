<template>
  <ReservasiDriverDashboardPwa
    v-if="isPwa"
    :loading="loading"
    :summary="summary"
    :driver-list="driverList"
    :upcoming-list="upcomingList"
    :route-list="routeList"
    :status-driver-label="statusDriverLabel"
    :status-driver-class="statusDriverClass"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :format-date-time="formatDateTime"
    @reload="loadData"
  />

  <ReservasiDriverDashboardWeb
    v-else
    :loading="loading"
    :summary="summary"
    :driver-list="driverList"
    :upcoming-list="upcomingList"
    :route-list="routeList"
    :status-driver-label="statusDriverLabel"
    :status-driver-class="statusDriverClass"
    :status-reservasi-label="statusReservasiLabel"
    :status-reservasi-class="statusReservasiClass"
    :format-date-time="formatDateTime"
    @reload="loadData"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ReservasiDriverDashboardWeb from './components/ReservasiDriverDashboardWeb.vue'
import ReservasiDriverDashboardPwa from './components/ReservasiDriverDashboardPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)

const summary = ref({
  total_hari_ini: 0,
  menunggu_approval: 0,
  sedang_berjalan: 0,
  selesai_hari_ini: 0,
  driver_standby: 0
})

const driverList = ref([])
const upcomingList = ref([])
const routeList = ref([])

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/reservasi-driver/dashboard')
    const data = response.data.data || {}

    summary.value = data.summary || {
      total_hari_ini: 0,
      menunggu_approval: 0,
      sedang_berjalan: 0,
      selesai_hari_ini: 0,
      driver_standby: 0
    }

    driverList.value = data.driver_list || []
    upcomingList.value = data.upcoming_list || []
    routeList.value = data.route_list || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat dashboard reservasi driver.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusDriverLabel = (status) => {
  return {
    standby: 'Standby',
    menuju_lokasi: 'Dalam Perjalanan ke Lokasi',
    standby_lokasi: 'Standby di Lokasi Antar',
    perjalanan_pulang: 'Dalam Perjalanan Pulang',
    perbaikan: 'Perbaikan Kendaraan'
  }[status] || status || '-'
}

const statusDriverClass = (status) => {
  return {
    standby: 'bg-success',
    menuju_lokasi: 'bg-primary',
    standby_lokasi: 'bg-warning text-dark',
    perjalanan_pulang: 'bg-info text-dark',
    perbaikan: 'bg-danger'
  }[status] || 'bg-secondary'
}

const statusReservasiLabel = (status) => {
  return {
    pending: 'Menunggu Approval',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    on_progress: 'Dalam Perjalanan',
    completed: 'Selesai',
    incomplete: 'Tidak Selesai'
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

onMounted(() => {
  loadData()
})
</script>
