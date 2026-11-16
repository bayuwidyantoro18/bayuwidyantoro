<template>
  <NomorSuratDashboardPwa
    v-if="isPwa"
    :loading="loading"
    :summary="summary"
    :top-proses-list="topProsesList"
    :recent-list="recentList"
    :format-date-time="formatDateTime"
    :status-class="statusClass"
    @reload="loadData"
  />

  <NomorSuratDashboardWeb
    v-else
    :loading="loading"
    :summary="summary"
    :top-proses-list="topProsesList"
    :recent-list="recentList"
    :format-date-time="formatDateTime"
    :status-class="statusClass"
    @reload="loadData"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import NomorSuratDashboardWeb from './components/NomorSuratDashboardWeb.vue'
import NomorSuratDashboardPwa from './components/NomorSuratDashboardPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)

const summary = ref({
  nomor_aktif: 0,
  nomor_tidak_aktif: 0,
  total_bulan_ini: 0,
  total_tahun_ini: 0
})

const topProsesList = ref([])
const recentList = ref([])

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/nomor-surat/dashboard')

    summary.value = response.data.summary || {
      nomor_aktif: 0,
      nomor_tidak_aktif: 0,
      total_bulan_ini: 0,
      total_tahun_ini: 0
    }

    topProsesList.value = response.data.top_proses || []
    recentList.value = response.data.recent || []
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat dashboard nomor surat.',
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

const statusClass = (status) => {
  if (status === 'Aktif') return 'bg-success'
  if (status === 'Tidak Aktif') return 'bg-secondary'
  if (status === 'Dibatalkan') return 'bg-danger'
  return 'bg-secondary'
}

onMounted(() => {
  loadData()
})
</script>