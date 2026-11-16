<template>
  <AgendaMonitoringLokasiPwa
    v-if="isPwa"
    :filter="filter"
    :loading="loading"
    :agenda-list="agendaList"
    :summary="summary"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    :has-lokasi="hasLokasi"
    :lokasi-text="lokasiText"
    :maps-url="mapsUrl"
    @update-tanggal="updateTanggal"
    @update-status="updateStatus"
    @load-data="loadData"
  />

  <AgendaMonitoringLokasiWeb
    v-else
    :filter="filter"
    :loading="loading"
    :agenda-list="agendaList"
    :summary="summary"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    :has-lokasi="hasLokasi"
    :lokasi-text="lokasiText"
    :maps-url="mapsUrl"
    @update-tanggal="updateTanggal"
    @update-status="updateStatus"
    @load-data="loadData"
  />
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import AgendaMonitoringLokasiPwa from './components/AgendaMonitoringLokasiPwa.vue'
import AgendaMonitoringLokasiWeb from './components/AgendaMonitoringLokasiWeb.vue'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)

const loading = ref(false)
const agendaList = ref([])

const filter = reactive({
  tanggal: today,
  status: ''
})

const statusOptions = [
  {
    value: '',
    label: 'Semua',
    shortLabel: 'Semua',
    icon: 'fas fa-layer-group'
  },
  {
    value: 'antrian',
    label: 'Antrian',
    shortLabel: 'Antrian',
    icon: 'fas fa-list'
  },
  {
    value: 'dalam_perjalanan',
    label: 'Sedang Dalam Perjalanan',
    shortLabel: 'Jalan',
    icon: 'fas fa-route'
  },
  {
    value: 'sampai_tujuan',
    label: 'Sampai di Tujuan',
    shortLabel: 'Sampai',
    icon: 'fas fa-map-marker-alt'
  },
  {
    value: 'selesai',
    label: 'Selesai',
    shortLabel: 'Selesai',
    icon: 'fas fa-check'
  },
  {
    value: 'batal',
    label: 'Batal',
    shortLabel: 'Batal',
    icon: 'fas fa-times'
  }
]

const summary = computed(() => {
  const result = {
    total: agendaList.value.length,
    antrian: 0,
    dalam_perjalanan: 0,
    sampai_tujuan: 0,
    selesai: 0,
    batal: 0,
    ada_lokasi: 0
  }

  agendaList.value.forEach((agenda) => {
    if (result[agenda.status] !== undefined) {
      result[agenda.status] += 1
    }

    if (lokasiTerbaru(agenda).url) {
      result.ada_lokasi += 1
    }
  })

  return result
})

const updateTanggal = async (value) => {
  filter.tanggal = value
  await loadData()
}

const updateStatus = async (value) => {
  filter.status = value
  await loadData()
}

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/agenda-perjalanan', {
      params: {
        tanggal: filter.tanggal,
        status: filter.status || undefined
      }
    })

    agendaList.value = response.data.data || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat data monitoring lokasi.',
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
      label: 'Lokasi Selesai',
      shortLabel: 'Selesai',
      koordinat: lokasiText(agenda.selesai_latitude, agenda.selesai_longitude),
      url: mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude),
      icon: 'fas fa-check-circle'
    }
  }

  if (hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)) {
    return {
      label: 'Lokasi Sampai',
      shortLabel: 'Sampai',
      koordinat: lokasiText(agenda.sampai_latitude, agenda.sampai_longitude),
      url: mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude),
      icon: 'fas fa-map-marker-alt'
    }
  }

  if (hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)) {
    return {
      label: 'Lokasi Mulai',
      shortLabel: 'Mulai',
      koordinat: lokasiText(agenda.mulai_latitude, agenda.mulai_longitude),
      url: mapsUrl(agenda.mulai_latitude, agenda.mulai_longitude),
      icon: 'fas fa-play-circle'
    }
  }

  return {
    label: 'Belum Ada Lokasi',
    shortLabel: '-',
    koordinat: '-',
    url: null,
    icon: 'fas fa-map'
  }
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

onMounted(() => {
  loadData()
})
</script>