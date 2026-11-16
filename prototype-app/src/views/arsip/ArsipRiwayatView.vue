<template>
  <ArsipRiwayatPwa
    v-if="isPwa"
    :loading="loading"
    :logs="logs"
    :pagination="pagination"
    :filter="filter"
    :options="options"
    :selected-log="selectedLog"
    :detail-modal="detailModal"
    :format-date-time="formatDateTime"
    :format-json-value="formatJsonValue"
    :load-data="loadData"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
    :open-detail="openDetail"
    :close-detail="closeDetail"
  />

  <ArsipRiwayatWeb
    v-else
    :loading="loading"
    :logs="logs"
    :pagination="pagination"
    :filter="filter"
    :options="options"
    :selected-log="selectedLog"
    :detail-modal="detailModal"
    :format-date-time="formatDateTime"
    :format-json-value="formatJsonValue"
    :load-data="loadData"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
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

import ArsipRiwayatWeb from './components/ArsipRiwayatWeb.vue'
import ArsipRiwayatPwa from './components/ArsipRiwayatPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const logs = ref([])
const selectedLog = ref(null)
const detailModal = ref(false)

const options = reactive({
  units: [],
  actions: []
})

const filter = reactive({
  keyword: '',
  arsip_unit_id: '',
  aksi: '',
  tanggal_mulai: '',
  tanggal_selesai: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
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
  try {
    const response = await api.get('/arsip/riwayat/options')
    const data = response.data.data || {}

    options.units = data.units || []
    options.actions = data.actions || []
  } catch {
    options.units = []
    options.actions = []
  }
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/arsip/riwayat', {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        keyword: filter.keyword,
        arsip_unit_id: filter.arsip_unit_id,
        aksi: filter.aksi,
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai
      })
    })

    const data = response.data.data || {}

    logs.value = data.logs || []
    Object.assign(pagination, data.pagination || {})
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat riwayat arsip.'
    })
  } finally {
    loading.value = false
  }
}

const updateFilter = async () => {
  await loadData(1)
}

const resetFilter = async () => {
  filter.keyword = ''
  filter.arsip_unit_id = ''
  filter.aksi = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''

  await loadData(1)
}

const openDetail = (log) => {
  selectedLog.value = log
  detailModal.value = true
}

const closeDetail = () => {
  selectedLog.value = null
  detailModal.value = false
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

const formatJsonValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
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