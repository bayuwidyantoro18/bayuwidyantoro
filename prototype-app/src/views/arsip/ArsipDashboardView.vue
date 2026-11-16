<template>
  <ArsipDashboardPwa
    v-if="isPwa"
    :loading="loading"
    :summary="summary"
    :total-per-unit="totalPerUnit"
    :akan-berakhir="akanBerakhir"
    :sudah-berakhir="sudahBerakhir"
    :user-access="userAccess"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :status-expired-class="statusExpiredClass"
    :open-document="openDocument"
    :go-unit="goUnit"
    @reload="loadData"
  />

  <ArsipDashboardWeb
    v-else
    :loading="loading"
    :summary="summary"
    :total-per-unit="totalPerUnit"
    :akan-berakhir="akanBerakhir"
    :sudah-berakhir="sudahBerakhir"
    :user-access="userAccess"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :status-expired-class="statusExpiredClass"
    :open-document="openDocument"
    :go-unit="goUnit"
    @reload="loadData"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ArsipDashboardWeb from './components/ArsipDashboardWeb.vue'
import ArsipDashboardPwa from './components/ArsipDashboardPwa.vue'

const router = useRouter()
const { isPwa } = usePwaMode()

const loading = ref(false)

const summary = ref({
  total_dokumen: 0,
  total_folder: 0,
  dokumen_berjangka_aktif: 0,
  dokumen_akan_berakhir: 0,
  dokumen_sudah_berakhir: 0
})

const userAccess = ref({
  is_superadmin: false,
  unit_kerja: '',
  allowed_unit_ids: []
})

const totalPerUnit = ref([])
const akanBerakhir = ref([])
const sudahBerakhir = ref([])

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/arsip/dashboard')
    const data = response.data.data || {}

    summary.value = data.summary || {
      total_dokumen: 0,
      total_folder: 0,
      dokumen_berjangka_aktif: 0,
      dokumen_akan_berakhir: 0,
      dokumen_sudah_berakhir: 0
    }

    userAccess.value = data.user_access || {
      is_superadmin: false,
      unit_kerja: '',
      allowed_unit_ids: []
    }

    totalPerUnit.value = data.total_per_unit || []
    akanBerakhir.value = data.akan_berakhir || []
    sudahBerakhir.value = data.sudah_berakhir || []
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat dashboard arsip.'
    })
  } finally {
    loading.value = false
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

const statusExpiredClass = (doc) => {
  const sisaHari = Number(doc?.sisa_hari ?? 0)

  if (sisaHari < 0) return 'bg-danger'
  if (sisaHari <= 7) return 'bg-warning text-dark'
  return 'bg-primary'
}

const openDocument = async (doc) => {
  if (!doc?.id) return

  const newTab = window.open('', '_blank')

  try {
    const response = await api.get(`/arsip/documents/${doc.id}/view`, {
      responseType: 'blob'
    })

    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })
    const fileUrl = window.URL.createObjectURL(blob)

    if (newTab) {
      newTab.location.href = fileUrl
    } else {
      window.open(fileUrl, '_blank')
    }

    setTimeout(() => {
      window.URL.revokeObjectURL(fileUrl)
    }, 60000)
  } catch (error) {
    if (newTab) {
      newTab.close()
    }

    Swal.fire({
      icon: 'error',
      title: 'Gagal Membuka Dokumen',
      text: error.response?.data?.message || 'File dokumen tidak dapat dibuka.'
    })
  }
}

const goUnit = (unit) => {
  if (!unit?.slug) return
  router.push(`/arsip/unit/${unit.slug}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>