<template>
  <AgendaRiwayatPerjalananPwa
    v-if="isPwa"
    :filter="filter"
    :loading="loading"
    :summary="summary"
    :agenda-list="agendaList"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @update-filter="updateFilter"
    @load-data="loadData"
    @reset-filter="resetFilter"
    @lihat-foto="lihatFoto"
  />

  <AgendaRiwayatPerjalananWeb
    v-else
    :filter="filter"
    :loading="loading"
    :summary="summary"
    :agenda-list="agendaList"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @update-filter="updateFilter"
    @load-data="loadData"
    @reset-filter="resetFilter"
    @lihat-foto="lihatFoto"
  />

  <AgendaPhotoViewer
    :visible="showPhotoViewer"
    :agenda-id="selectedPhotoAgendaId"
    @close="tutupPhotoViewer"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import AgendaRiwayatPerjalananPwa from './components/AgendaRiwayatPerjalananPwa.vue'
import AgendaRiwayatPerjalananWeb from './components/AgendaRiwayatPerjalananWeb.vue'
import AgendaPhotoViewer from './components/AgendaPhotoViewer.vue'
import './components/agendaPhotoViewer.css'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .slice(0, 10)

const loading = ref(false)
const agendaList = ref([])

const filter = reactive({
  tanggal_mulai: firstDayOfMonth,
  tanggal_selesai: today,
  status: '',
  keyword: ''
})

const summary = ref({
  total: 0,
  antrian: 0,
  dalam_perjalanan: 0,
  sampai_tujuan: 0,
  selesai: 0,
  batal: 0
})

const statusOptions = [
  { value: '', label: 'Semua Status', shortLabel: 'Semua' },
  { value: 'antrian', label: 'Antrian', shortLabel: 'Antrian' },
  { value: 'dalam_perjalanan', label: 'Sedang Dalam Perjalanan', shortLabel: 'Jalan' },
  { value: 'sampai_tujuan', label: 'Sampai di Tujuan', shortLabel: 'Sampai' },
  { value: 'selesai', label: 'Selesai', shortLabel: 'Selesai' },
  { value: 'batal', label: 'Batal', shortLabel: 'Batal' }
]

const updateFilter = ({ field, value }) => {
  filter[field] = value
}

const resetFilter = async () => {
  filter.tanggal_mulai = firstDayOfMonth
  filter.tanggal_selesai = today
  filter.status = ''
  filter.keyword = ''

  await loadData()
}

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/agenda-perjalanan/riwayat', {
      params: {
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        status: filter.status || undefined,
        keyword: filter.keyword || undefined
      }
    })

    summary.value = response.data.summary || {}
    agendaList.value = response.data.data || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat riwayat perjalanan.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const userName = (agenda) => {
  return agenda.user?.name || agenda.user?.username || '-'
}

const statusLabel = (status) => {
  const labels = {
    antrian: 'Antrian',
    dalam_perjalanan: 'Sedang Dalam Perjalanan',
    sampai_tujuan: 'Sampai di Tujuan',
    selesai: 'Selesai',
    batal: 'Batal'
  }

  return labels[status] || status
}

const statusBadgeClass = (status) => {
  const classes = {
    antrian: 'bg-secondary',
    dalam_perjalanan: 'bg-primary',
    sampai_tujuan: 'bg-warning text-dark',
    selesai: 'bg-success',
    batal: 'bg-danger'
  }

  return classes[status] || 'bg-secondary'
}

const hasLokasi = (lat, lng) => {
  return lat !== null && lat !== undefined && lng !== null && lng !== undefined
}

const lokasiText = (lat, lng) => {
  if (!hasLokasi(lat, lng)) return '-'
  return `${lat}, ${lng}`
}

const mapsUrl = (lat, lng) => {
  if (!hasLokasi(lat, lng)) return null
  return `https://www.google.com/maps?q=${lat},${lng}`
}

const lokasiTerbaru = (agenda) => {
  if (hasLokasi(agenda.selesai_latitude, agenda.selesai_longitude)) {
    return {
      label: 'Lokasi Selesai',
      koordinat: lokasiText(agenda.selesai_latitude, agenda.selesai_longitude),
      url: mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude)
    }
  }

  if (hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)) {
    return {
      label: 'Lokasi Sampai',
      koordinat: lokasiText(agenda.sampai_latitude, agenda.sampai_longitude),
      url: mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude)
    }
  }

  if (hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)) {
    return {
      label: 'Lokasi Mulai',
      koordinat: lokasiText(agenda.mulai_latitude, agenda.mulai_longitude),
      url: mapsUrl(agenda.mulai_latitude, agenda.mulai_longitude)
    }
  }

  return {
    label: '-',
    koordinat: '-',
    url: null
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

const showPhotoViewer = ref(false)
const selectedPhotoAgendaId = ref(null)

const lihatFoto = (agendaId) => {
  if (!agendaId) return
  selectedPhotoAgendaId.value = agendaId
  showPhotoViewer.value = true
}

const tutupPhotoViewer = () => {
  showPhotoViewer.value = false
  selectedPhotoAgendaId.value = null
}

onMounted(() => {
  loadData()
})
</script>