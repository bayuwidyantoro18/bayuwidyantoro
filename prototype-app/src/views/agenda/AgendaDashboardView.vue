<template>
  <AgendaDashboardPwa
    v-if="isPwa"
    :tanggal="tanggal"
    :loading="loading"
    :summary="summary"
    :agenda-list="agendaList"
    :summary-cards="pwaSummaryCards"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :progress-percent="progressPercent"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @update-tanggal="updateTanggal"
    @refresh="loadDashboard"
    @lihat-foto="lihatFoto"
  />

  <AgendaDashboardWeb
    v-else
    :tanggal="tanggal"
    :loading="loading"
    :summary="summary"
    :agenda-list="agendaList"
    :summary-cards="summaryCards"
    :steps="steps"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :progress-percent="progressPercent"
    :current-step-index="currentStepIndex"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @update-tanggal="updateTanggal"
    @refresh="loadDashboard"
    @lihat-foto="lihatFoto"
  />

  <AgendaPhotoViewer
    :visible="showPhotoViewer"
    :agenda-id="selectedPhotoAgendaId"
    @close="tutupPhotoViewer"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import AgendaDashboardPwa from './components/AgendaDashboardPwa.vue'
import AgendaDashboardWeb from './components/AgendaDashboardWeb.vue'
import AgendaPhotoViewer from './components/AgendaPhotoViewer.vue'
import './components/agendaPhotoViewer.css'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)

const tanggal = ref(today)
const loading = ref(false)
const agendaList = ref([])

const summary = ref({
  antrian: 0,
  dalam_perjalanan: 0,
  sampai_tujuan: 0,
  selesai: 0,
  batal: 0
})

let intervalId = null

const summaryCards = [
  { key: 'antrian', label: 'Antrian' },
  { key: 'dalam_perjalanan', label: 'Perjalanan' },
  { key: 'sampai_tujuan', label: 'Sampai' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'batal', label: 'Batal' }
]

const pwaSummaryCards = [
  {
    key: 'antrian',
    label: 'Antrian',
    icon: 'fas fa-list',
    class: 'bg-secondary'
  },
  {
    key: 'dalam_perjalanan',
    label: 'Jalan',
    icon: 'fas fa-route',
    class: 'bg-primary'
  },
  {
    key: 'sampai_tujuan',
    label: 'Sampai',
    icon: 'fas fa-map-marker-alt',
    class: 'bg-warning text-dark'
  },
  {
    key: 'selesai',
    label: 'Selesai',
    icon: 'fas fa-check',
    class: 'bg-success'
  },
  {
    key: 'batal',
    label: 'Batal',
    icon: 'fas fa-times',
    class: 'bg-danger'
  }
]

const steps = [
  {
    key: 'mulai',
    label: 'Mulai',
    icon: 'fas fa-play'
  },
  {
    key: 'dalam_perjalanan',
    label: 'Perjalanan',
    icon: 'fas fa-route'
  },
  {
    key: 'sampai_tujuan',
    label: 'Sampai',
    icon: 'fas fa-map-marker-alt'
  },
  {
    key: 'selesai',
    label: 'Selesai',
    icon: 'fas fa-check'
  }
]

const updateTanggal = async (value) => {
  tanggal.value = value
  await loadDashboard()
}

const loadDashboard = async () => {
  loading.value = true

  try {
    const response = await api.get('/agenda-perjalanan/dashboard', {
      params: {
        tanggal: tanggal.value
      }
    })

    summary.value = response.data.summary || {}
    agendaList.value = response.data.data || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat dashboard agenda.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const userName = (agenda) => {
  return agenda.user?.name || agenda.user?.username || '-'
}

const progressPercent = (status) => {
  if (status === 'antrian') return 0
  if (status === 'dalam_perjalanan') return 40
  if (status === 'sampai_tujuan') return 70
  if (status === 'selesai') return 100
  if (status === 'batal') return 100
  return 0
}

const currentStepIndex = (status) => {
  if (status === 'antrian') return -1
  if (status === 'dalam_perjalanan') return 1
  if (status === 'sampai_tujuan') return 2
  if (status === 'selesai') return 3
  return -1
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

const hasLokasi = (lat, lng) => {
  return lat !== null && lat !== undefined && lng !== null && lng !== undefined
}

const lokasiText = (lat, lng) => {
  if (!hasLokasi(lat, lng)) {
    return '-'
  }

  return `${lat}, ${lng}`
}

const mapsUrl = (lat, lng) => {
  if (!hasLokasi(lat, lng)) {
    return null
  }

  return `https://www.google.com/maps?q=${lat},${lng}`
}

const lokasiTerbaru = (agenda) => {
  if (hasLokasi(agenda.selesai_latitude, agenda.selesai_longitude)) {
    return {
      label: 'Selesai',
      koordinat: lokasiText(agenda.selesai_latitude, agenda.selesai_longitude),
      url: mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude)
    }
  }

  if (hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)) {
    return {
      label: 'Sampai Tujuan',
      koordinat: lokasiText(agenda.sampai_latitude, agenda.sampai_longitude),
      url: mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude)
    }
  }

  if (hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)) {
    return {
      label: 'Mulai',
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

onMounted(() => {
  loadDashboard()

  intervalId = setInterval(() => {
    loadDashboard()
  }, 15000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>