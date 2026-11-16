<template>
  <AgendaRekapKinerjaPwa
    v-if="isPwa"
    :filter="filter"
    :loading="loading"
    :summary="summary"
    :rekap-list="rekapList"
    :status-options="statusOptions"
    :format-date-time="formatDateTime"
    :format-duration="formatDuration"
    @update-filter="updateFilter"
    @load-data="loadData"
    @reset-filter="resetFilter"
  />

  <AgendaRekapKinerjaWeb
    v-else
    :filter="filter"
    :loading="loading"
    :summary="summary"
    :rekap-list="rekapList"
    :status-options="statusOptions"
    :format-date-time="formatDateTime"
    :format-duration="formatDuration"
    @update-filter="updateFilter"
    @load-data="loadData"
    @reset-filter="resetFilter"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import AgendaRekapKinerjaPwa from './components/AgendaRekapKinerjaPwa.vue'
import AgendaRekapKinerjaWeb from './components/AgendaRekapKinerjaWeb.vue'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .slice(0, 10)

const loading = ref(false)
const rekapList = ref([])

const filter = reactive({
  tanggal_mulai: firstDayOfMonth,
  tanggal_selesai: today,
  status: '',
  keyword: ''
})

const summary = ref({
  total_petugas: 0,
  total_agenda: 0,
  total_selesai: 0,
  total_batal: 0,
  total_berjalan: 0,
  petugas_teraktif: '-'
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
    const response = await api.get('/agenda-perjalanan/rekap-kinerja', {
      params: {
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        status: filter.status || undefined,
        keyword: filter.keyword || undefined
      }
    })

    summary.value = response.data.summary || {}
    rekapList.value = response.data.data || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat rekap kinerja petugas.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
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

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '-'

  const jam = Math.floor(minutes / 60)
  const menit = minutes % 60

  if (jam > 0 && menit > 0) {
    return `${jam} jam ${menit} menit`
  }

  if (jam > 0) {
    return `${jam} jam`
  }

  return `${menit} menit`
}

onMounted(() => {
  loadData()
})
</script>