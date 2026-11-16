<template>
  <AgendaKalenderPwa
    v-if="isPwa"
    :loading="loading"
    :calendar-title="calendarTitle"
    :calendar-days="calendarDays"
    :week-labels="weekLabels"
    :selected-date="selectedDate"
    :selected-date-agendas="selectedDateAgendas"
    :summary="monthSummary"
    :filter="filter"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @prev-month="prevMonth"
    @next-month="nextMonth"
    @today="goToday"
    @select-date="selectDate"
    @update-status="updateStatus"
    @load-data="loadData"
    @lihat-foto="lihatFoto"
  />

  <AgendaKalenderWeb
    v-else
    :loading="loading"
    :calendar-title="calendarTitle"
    :calendar-days="calendarDays"
    :week-labels="weekLabels"
    :selected-date="selectedDate"
    :selected-date-agendas="selectedDateAgendas"
    :summary="monthSummary"
    :filter="filter"
    :status-options="statusOptions"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    @prev-month="prevMonth"
    @next-month="nextMonth"
    @today="goToday"
    @select-date="selectDate"
    @update-status="updateStatus"
    @load-data="loadData"
    @lihat-foto="lihatFoto"
  />
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import AgendaKalenderPwa from './components/AgendaKalenderPwa.vue'
import AgendaKalenderWeb from './components/AgendaKalenderWeb.vue'

const { isPwa } = usePwaMode()

const todayDate = new Date()
const viewDate = ref(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
const selectedDate = ref(formatYmd(todayDate))

const loading = ref(false)
const agendaList = ref([])

const filter = reactive({
  status: ''
})

const weekLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const statusOptions = [
  { value: '', label: 'Semua Status', shortLabel: 'Semua', icon: 'fas fa-layer-group' },
  { value: 'antrian', label: 'Antrian', shortLabel: 'Antrian', icon: 'fas fa-list' },
  { value: 'dalam_perjalanan', label: 'Sedang Dalam Perjalanan', shortLabel: 'Jalan', icon: 'fas fa-route' },
  { value: 'sampai_tujuan', label: 'Sampai di Tujuan', shortLabel: 'Sampai', icon: 'fas fa-map-marker-alt' },
  { value: 'selesai', label: 'Selesai', shortLabel: 'Selesai', icon: 'fas fa-check' },
  { value: 'batal', label: 'Batal', shortLabel: 'Batal', icon: 'fas fa-times' }
]

const calendarTitle = computed(() => {
  return viewDate.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

const monthStart = computed(() => {
  return formatYmd(new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1))
})

const monthEnd = computed(() => {
  return formatYmd(new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0))
})

const agendasByDate = computed(() => {
  const grouped = {}

  agendaList.value.forEach((agenda) => {
    const dateKey = normalizeDate(agenda.tanggal)

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }

    grouped[dateKey].push(agenda)
  })

  return grouped
})

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const lastDate = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + lastDate) / 7) * 7

  const cells = []

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month, 1 - startOffset + i)
    const dateString = formatYmd(date)
    const agendas = agendasByDate.value[dateString] || []
    const statuses = [...new Set(agendas.map(item => item.status))].slice(0, 4)

    cells.push({
      date,
      dateString,
      dayNumber: date.getDate(),
      currentMonth: date.getMonth() === month,
      isToday: dateString === formatYmd(todayDate),
      isSelected: dateString === selectedDate.value,
      agendaCount: agendas.length,
      statuses
    })
  }

  return cells
})

const selectedDateAgendas = computed(() => {
  return agendasByDate.value[selectedDate.value] || []
})

const monthSummary = computed(() => {
  const result = {
    total: agendaList.value.length,
    antrian: 0,
    dalam_perjalanan: 0,
    sampai_tujuan: 0,
    selesai: 0,
    batal: 0
  }

  agendaList.value.forEach((agenda) => {
    if (result[agenda.status] !== undefined) {
      result[agenda.status] += 1
    }
  })

  return result
})

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/agenda-perjalanan/riwayat', {
      params: {
        tanggal_mulai: monthStart.value,
        tanggal_selesai: monthEnd.value,
        status: filter.status || undefined
      }
    })

    agendaList.value = response.data.data || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat data kalender agenda.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const prevMonth = async () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
  selectedDate.value = formatYmd(viewDate.value)
  await loadData()
}

const nextMonth = async () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
  selectedDate.value = formatYmd(viewDate.value)
  await loadData()
}

const goToday = async () => {
  const now = new Date()

  viewDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
  selectedDate.value = formatYmd(now)

  await loadData()
}

const selectDate = (dateString) => {
  selectedDate.value = dateString
}

const updateStatus = async (value) => {
  filter.status = value
  await loadData()
}

function formatYmd(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const normalizeDate = (value) => {
  if (!value) return '-'

  if (typeof value === 'string') {
    return value.substring(0, 10)
  }

  return formatYmd(new Date(value))
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
    month: 'long',
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

const lihatFoto = (url) => {
  Swal.fire({
    imageUrl: url,
    imageAlt: 'Bukti Foto Selesai',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#0d6efd',
    width: 380
  })
}

onMounted(() => {
  loadData()
})
</script>