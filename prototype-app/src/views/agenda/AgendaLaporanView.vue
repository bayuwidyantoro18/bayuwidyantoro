<template>
  <AgendaLaporanPwa
    v-if="isPwa"
    :filter="filter"
    :loading="loading"
    :agenda-list="agendaList"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    :has-lokasi="hasLokasi"
    :lokasi-text="lokasiText"
    :maps-url="mapsUrl"
    @update-tanggal="updateTanggal"
    @update-status="updateStatus"
    @load-data="loadData"
    @export-excel="exportExcel"
    @export-pdf="exportPdf"
    @lihat-foto="lihatFoto"
  />

  <AgendaLaporanWeb
    v-else
    :filter="filter"
    :loading="loading"
    :agenda-list="agendaList"
    :exporting-excel="exportingExcel"
    :exporting-pdf="exportingPdf"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :lokasi-terbaru="lokasiTerbaru"
    :has-lokasi="hasLokasi"
    :lokasi-text="lokasiText"
    :maps-url="mapsUrl"
    @update-tanggal="updateTanggal"
    @update-status="updateStatus"
    @load-data="loadData"
    @export-excel="exportExcel"
    @export-pdf="exportPdf"
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

import AgendaLaporanPwa from './components/AgendaLaporanPwa.vue'
import AgendaLaporanWeb from './components/AgendaLaporanWeb.vue'
import AgendaPhotoViewer from './components/AgendaPhotoViewer.vue'
import './components/agendaPhotoViewer.css'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)

const filter = reactive({
  tanggal: today,
  status: ''
})

const loading = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const agendaList = ref([])

const updateTanggal = async (value) => {
  filter.tanggal = value
}

const updateStatus = async (value) => {
  filter.status = value
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
      text: 'Gagal memuat laporan perjalanan.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const exportExcel = async () => {
  exportingExcel.value = true

  try {
    const response = await api.get('/agenda-perjalanan/export/excel', {
      params: {
        tanggal: filter.tanggal,
        status: filter.status || undefined
      },
      responseType: 'blob'
    })

    downloadBlob(response.data, `laporan-agenda-perjalanan-${filter.tanggal}.xlsx`)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File Excel berhasil diunduh.',
      timer: 1800,
      showConfirmButton: false
    })
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal export Excel.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    exportingExcel.value = false
  }
}

const exportPdf = async () => {
  exportingPdf.value = true

  try {
    const response = await api.get('/agenda-perjalanan/export/pdf', {
      params: {
        tanggal: filter.tanggal,
        status: filter.status || undefined
      },
      responseType: 'blob'
    })

    downloadBlob(response.data, `laporan-agenda-perjalanan-${filter.tanggal}.pdf`)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File PDF berhasil diunduh.',
      timer: 1800,
      showConfirmButton: false
    })
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal export PDF.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    exportingPdf.value = false
  }
}

const downloadBlob = (blobData, filename) => {
  const blob = new Blob([blobData])
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(url)
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