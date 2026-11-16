<template>
  <TerminasiPwa
    v-if="isPwaMode"
    :loading="loading"
    :pegawais="pegawais"
    :filtered-pegawais="filteredPegawais"
    :paginated-pegawais="paginatedPegawais"
    :filter="filter"
    :current-page="currentPage"
    :per-page="perPage"
    :total-pages="totalPages"
    :pagination-pages="paginationPages"
    :selected-pegawai="selectedPegawai"
    :detail-modal="detailModal"
    :summary="summary"
    :format-date="formatDate"
    @load-data="loadTerminasi"
    @update-filter="updateFilter"
    @reset-filter="resetFilter"
    @change-page="changePage"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />

  <TerminasiWeb
    v-else
    :loading="loading"
    :pegawais="pegawais"
    :filtered-pegawais="filteredPegawais"
    :paginated-pegawais="paginatedPegawais"
    :filter="filter"
    :current-page="currentPage"
    :per-page="perPage"
    :total-pages="totalPages"
    :pagination-pages="paginationPages"
    :selected-pegawai="selectedPegawai"
    :detail-modal="detailModal"
    :summary="summary"
    :format-date="formatDate"
    @load-data="loadTerminasi"
    @update-filter="updateFilter"
    @reset-filter="resetFilter"
    @change-page="changePage"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'
import TerminasiWeb from './components/TerminasiWeb.vue'
import TerminasiPwa from './components/TerminasiPwa.vue'

const { isPwa: isPwaMode } = usePwaMode()

const loading = ref(false)
const pegawais = ref([])
const currentPage = ref(1)
const perPage = ref(10)
const detailModal = ref(false)
const selectedPegawai = ref(null)

const filter = reactive({
  keyword: '',
  kategori_pegawai: '',
  alasan_terminasi: '',
  tanggal_dari: '',
  tanggal_sampai: ''
})

const loadTerminasi = async () => {
  loading.value = true

  try {
    const response = await api.get('/pegawai', {
      params: {
        status: 'Non Aktif'
      }
    })

    const payload = response.data?.data || response.data || []
    pegawais.value = Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Gagal memuat data terminasi:', error)
    pegawais.value = []
  } finally {
    loading.value = false
  }
}

const normalize = (value) => String(value || '').toLowerCase().trim()

const filteredPegawais = computed(() => {
  const keyword = normalize(filter.keyword)
  const kategori = filter.kategori_pegawai
  const alasan = filter.alasan_terminasi
  const tanggalDari = filter.tanggal_dari
  const tanggalSampai = filter.tanggal_sampai

  return pegawais.value.filter((pegawai) => {
    const searchable = [
      pegawai.nip,
      pegawai.nik,
      pegawai.nama,
      pegawai.jabatan,
      pegawai.unit_kerja,
      pegawai.departemen,
      pegawai.kategori_pegawai,
      pegawai.alasan_terminasi,
      pegawai.keterangan_terminasi
    ].map(normalize).join(' ')

    const matchKeyword = !keyword || searchable.includes(keyword)
    const matchKategori = !kategori || pegawai.kategori_pegawai === kategori
    const matchAlasan = !alasan || pegawai.alasan_terminasi === alasan

    const tanggalTerminasi = pegawai.tanggal_terminasi || ''
    const matchTanggalDari = !tanggalDari || tanggalTerminasi >= tanggalDari
    const matchTanggalSampai = !tanggalSampai || tanggalTerminasi <= tanggalSampai

    return matchKeyword && matchKategori && matchAlasan && matchTanggalDari && matchTanggalSampai
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredPegawais.value.length / perPage.value) || 1
})

const paginatedPegawais = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredPegawais.value.slice(start, start + perPage.value)
})

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 4) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 3) pages.push('...')

  pages.push(total)

  return pages
})

const summary = computed(() => {
  const total = pegawais.value.length
  const internal = pegawais.value.filter((item) => item.kategori_pegawai === 'Pegawai Internal').length
  const penugasan = pegawais.value.filter((item) => item.kategori_pegawai === 'Pegawai Penugasan').length
  const berakhirKontrak = pegawais.value.filter((item) => item.alasan_terminasi === 'Berakhir Kontrak').length
  const resign = pegawais.value.filter((item) => ['Resign', 'Mengundurkan Diri'].includes(item.alasan_terminasi)).length
  const pensiun = pegawais.value.filter((item) => item.alasan_terminasi === 'Pensiun').length
  const selesaiPenugasan = pegawais.value.filter((item) => item.alasan_terminasi === 'Selesai Penugasan').length

  return {
    total,
    internal,
    penugasan,
    berakhirKontrak,
    resign,
    pensiun,
    selesaiPenugasan
  }
})

const updateFilter = ({ field, value }) => {
  filter[field] = value
  currentPage.value = 1
}

const resetFilter = () => {
  filter.keyword = ''
  filter.kategori_pegawai = ''
  filter.alasan_terminasi = ''
  filter.tanggal_dari = ''
  filter.tanggal_sampai = ''
  currentPage.value = 1
}

const changePage = (page) => {
  if (page === '...') return

  const nextPage = Number(page)

  if (nextPage < 1 || nextPage > totalPages.value) return

  currentPage.value = nextPage
}

const openDetail = (pegawai) => {
  selectedPegawai.value = pegawai
  detailModal.value = true
}

const closeDetail = () => {
  detailModal.value = false
  selectedPegawai.value = null
}

const formatDate = (date) => {
  if (!date) return '-'

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  } catch (error) {
    return date
  }
}

watch(filteredPegawais, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(() => {
  loadTerminasi()
})
</script>
