<template>
  <PkwtPwa
    v-if="isPwa"
    :loading="loading"
    :pkwts="pkwts"
    :filtered-pkwts="filteredPkwts"
    :paginated-pkwts="paginatedPkwts"
    :search-pkwt="searchPkwt"
    :filter-status-pkwt="filterStatusPkwt"
    :filter-berakhir-dari="filterBerakhirDari"
    :filter-berakhir-sampai="filterBerakhirSampai"
    :pkwt-current-page="pkwtCurrentPage"
    :pkwt-total-pages="pkwtTotalPages"
    :pkwt-pagination-pages="pkwtPaginationPages"
    :format-date="formatDate"
    :status-class="statusClass"
    :sisa-hari="sisaHari"
    :set-search-pkwt="setSearchPkwt"
    :set-filter-status-pkwt="setFilterStatusPkwt"
    :set-filter-berakhir-dari="setFilterBerakhirDari"
    :set-filter-berakhir-sampai="setFilterBerakhirSampai"
    :reset-filter-pkwt="resetFilterPkwt"
    :change-pkwt-page="changePkwtPage"
    :load-pkwt="loadPkwt"
    :tambah-pkwt="tambahPkwt"
    :edit-pkwt="editPkwt"
    :lihat-detail-pkwt="lihatDetailPkwt"
    :hapus-pkwt="hapusPkwt"
  />

  <PkwtWeb
    v-else
    :loading="loading"
    :pkwts="pkwts"
    :filtered-pkwts="filteredPkwts"
    :paginated-pkwts="paginatedPkwts"
    :search-pkwt="searchPkwt"
    :filter-status-pkwt="filterStatusPkwt"
    :filter-berakhir-dari="filterBerakhirDari"
    :filter-berakhir-sampai="filterBerakhirSampai"
    :pkwt-current-page="pkwtCurrentPage"
    :pkwt-per-page="pkwtPerPage"
    :pkwt-total-pages="pkwtTotalPages"
    :pkwt-pagination-pages="pkwtPaginationPages"
    :open-action-id="openActionId"
    :format-date="formatDate"
    :status-class="statusClass"
    :sisa-hari="sisaHari"
    :set-search-pkwt="setSearchPkwt"
    :set-filter-status-pkwt="setFilterStatusPkwt"
    :set-filter-berakhir-dari="setFilterBerakhirDari"
    :set-filter-berakhir-sampai="setFilterBerakhirSampai"
    :reset-filter-pkwt="resetFilterPkwt"
    :change-pkwt-page="changePkwtPage"
    :toggle-action="toggleAction"
    :close-action="closeAction"
    :load-pkwt="loadPkwt"
    :tambah-pkwt="tambahPkwt"
    :edit-pkwt="editPkwt"
    :lihat-detail-pkwt="lihatDetailPkwt"
    :hapus-pkwt="hapusPkwt"
  />

  <div v-if="showModal" class="modal-layer">
    <div class="form-card">
      <div class="modal-head">
        <div>
          <h5>{{ isEdit ? 'Edit PKWT' : 'Tambah PKWT' }}</h5>
          <p>Lengkapi data kontrak pegawai dan upload file PKWT dalam format PDF.</p>
        </div>

        <button type="button" @click="tutupModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body-custom">
        <div class="row g-2">
          <div class="col-md-12">
            <label class="form-label compact-label">Pegawai</label>
            <select v-model="form.pegawai_id" class="form-select form-select-sm compact-input">
              <option value="">-- Pilih Pegawai --</option>
              <option
                v-for="pegawai in pegawaiInternalOptions"
                :key="pegawai.id"
                :value="pegawai.id"
              >
                {{ pegawai.nip }} - {{ pegawai.nama }}
              </option>
            </select>
          </div>

          <div class="col-md-12">
            <label class="form-label compact-label">Nomor Kontrak</label>
            <input
              v-model="form.nomor_kontrak"
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Contoh: PKWT/001/VII/2026"
            >
          </div>

          <div class="col-md-6">
            <label class="form-label compact-label">Tanggal Mulai</label>
            <input
              v-model="form.tanggal_mulai"
              type="date"
              class="form-control form-control-sm compact-input"
            >
          </div>

          <div class="col-md-6">
            <label class="form-label compact-label">Tanggal Berakhir</label>
            <input
              v-model="form.tanggal_berakhir"
              type="date"
              class="form-control form-control-sm compact-input"
            >
          </div>

          <div class="col-md-6">
            <label class="form-label compact-label">Status</label>
            <select v-model="form.status" class="form-select form-select-sm compact-input">
              <option value="Aktif">Aktif</option>
              <option value="Diperpanjang">Diperpanjang</option>
              <option value="Berakhir">Berakhir</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label compact-label">Upload File PKWT</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              class="form-control form-control-sm compact-input"
              @change="handleFilePkwt"
            >
          </div>
        </div>

        <div v-if="isEdit && !filePkwt" class="file-note">
          Kosongkan file jika tidak ingin mengganti file PKWT yang sudah ada.
        </div>
      </div>

      <div class="modal-foot">
        <button type="button" class="btn btn-sm btn-light" :disabled="submitting" @click="tutupModal">
          Batal
        </button>

        <button type="button" class="btn btn-sm btn-primary" :disabled="submitting" @click="simpanPkwt">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
          {{ isEdit ? 'Update' : 'Simpan' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showDetailModal" class="modal-layer">
    <div class="detail-card">
      <div class="modal-head">
        <div>
          <h5>Detail Kontrak PKWT</h5>
          <p>{{ selectedPkwt?.nomor_kontrak || '-' }}</p>
        </div>

        <button type="button" @click="tutupDetailModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body-custom">
        <div class="detail-summary">
          <div>
            <span>Nama Pegawai</span>
            <strong>{{ selectedPkwt?.pegawai?.nama || '-' }}</strong>
          </div>

          <div>
            <span>NIP</span>
            <strong>{{ selectedPkwt?.pegawai?.nip || '-' }}</strong>
          </div>

          <div>
            <span>Jabatan</span>
            <strong>{{ selectedPkwt?.pegawai?.jabatan || '-' }}</strong>
          </div>

          <div>
            <span>Unit Kerja</span>
            <strong>{{ selectedPkwt?.pegawai?.unit_kerja || '-' }}</strong>
          </div>
        </div>

        <div class="detail-section">
          <h6>Informasi Kontrak</h6>

          <div class="detail-row">
            <span>Nomor Kontrak</span>
            <strong>{{ selectedPkwt?.nomor_kontrak || '-' }}</strong>
          </div>

          <div class="detail-row">
            <span>Tanggal Mulai</span>
            <strong>{{ formatDate(selectedPkwt?.tanggal_mulai) }}</strong>
          </div>

          <div class="detail-row">
            <span>Tanggal Berakhir</span>
            <strong>{{ formatDate(selectedPkwt?.tanggal_berakhir) }}</strong>
          </div>

          <div class="detail-row">
            <span>Status</span>
            <strong>
              <span class="status-pill" :class="statusClass(selectedPkwt?.status)">
                {{ selectedPkwt?.status || '-' }}
              </span>
            </strong>
          </div>
        </div>

        <div class="detail-section">
          <h6>File PKWT</h6>

          <div v-if="selectedPkwt?.file_url" class="file-box">
            <i class="fas fa-file-pdf"></i>
            <div>
              <strong>File PKWT tersedia</strong>
              <span>Klik tombol di bawah untuk membuka preview PDF.</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary" @click="previewPdf(selectedPkwt.file_url)">
              Preview PDF
            </button>
          </div>

          <p v-else class="empty-file">File kontrak tidak tersedia.</p>
        </div>
      </div>

      <div class="modal-foot">
        <button type="button" class="btn btn-sm btn-light" @click="tutupDetailModal">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import PkwtWeb from './components/PkwtWeb.vue'
import PkwtPwa from './components/PkwtPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const submitting = ref(false)

const pkwts = ref([])
const pegawais = ref([])

const searchPkwt = ref('')
const filterStatusPkwt = ref('')
const filterBerakhirDari = ref('')
const filterBerakhirSampai = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const showDetailModal = ref(false)
const selectedPkwt = ref(null)

const openActionId = ref(null)
const filePkwt = ref(null)

const form = ref({
  pegawai_id: '',
  nomor_kontrak: '',
  tanggal_mulai: '',
  tanggal_berakhir: '',
  status: 'Aktif'
})

const normalizeCollection = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
    if (Array.isArray(payload?.data?.[key])) return payload.data[key]
  }

  if (Array.isArray(payload?.data)) return payload.data

  return []
}

const normalizeDate = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const setSearchPkwt = (value) => {
  searchPkwt.value = value
}

const setFilterStatusPkwt = (value) => {
  filterStatusPkwt.value = value
}

const setFilterBerakhirDari = (value) => {
  filterBerakhirDari.value = value
}

const setFilterBerakhirSampai = (value) => {
  filterBerakhirSampai.value = value
}

const pegawaiInternalOptions = computed(() => {
  return pegawais.value.filter((pegawai) => {
    return pegawai.kategori_pegawai === 'Pegawai Internal' && pegawai.status === 'Aktif'
  })
})

const filteredPkwts = computed(() => {
  const keyword = searchPkwt.value.toLowerCase().trim()

  return pkwts.value.filter((item) => {
    const nama = String(item.pegawai?.nama ?? '').toLowerCase()
    const nip = String(item.pegawai?.nip ?? '').toLowerCase()
    const nomorKontrak = String(item.nomor_kontrak ?? '').toLowerCase()
    const status = String(item.status ?? '')
    const tanggalBerakhir = String(item.tanggal_berakhir ?? '')

    const cocokKeyword =
      !keyword ||
      nama.includes(keyword) ||
      nip.includes(keyword) ||
      nomorKontrak.includes(keyword)

    const cocokStatus =
      !filterStatusPkwt.value ||
      status === filterStatusPkwt.value

    const cocokTanggalDari =
      !filterBerakhirDari.value ||
      tanggalBerakhir >= filterBerakhirDari.value

    const cocokTanggalSampai =
      !filterBerakhirSampai.value ||
      tanggalBerakhir <= filterBerakhirSampai.value

    return cocokKeyword && cocokStatus && cocokTanggalDari && cocokTanggalSampai
  })
})

const resetFilterPkwt = () => {
  searchPkwt.value = ''
  filterStatusPkwt.value = ''
  filterBerakhirDari.value = ''
  filterBerakhirSampai.value = ''
  pkwtCurrentPage.value = 1
}

const toggleAction = (id) => {
  openActionId.value = openActionId.value === id ? null : id
}

const closeAction = () => {
  openActionId.value = null
}

const resetForm = () => {
  form.value = {
    pegawai_id: '',
    nomor_kontrak: '',
    tanggal_mulai: '',
    tanggal_berakhir: '',
    status: 'Aktif'
  }

  filePkwt.value = null
  isEdit.value = false
  editId.value = null
}

const loadPkwt = async () => {
  loading.value = true

  try {
    const response = await api.get('/pkwt')
    pkwts.value = normalizeCollection(response.data, ['pkwts', 'data'])
    pkwtCurrentPage.value = 1
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengambil data PKWT.'
    })
  } finally {
    loading.value = false
  }
}

const loadPegawai = async () => {
  try {
    const response = await api.get('/pegawai')
    pegawais.value = normalizeCollection(response.data, ['pegawais', 'data'])
  } catch (error) {
    console.error(error)
  }
}

const tambahPkwt = () => {
  resetForm()
  showModal.value = true
}

const tutupModal = () => {
  showModal.value = false
  resetForm()
}

const editPkwt = (pkwt) => {
  isEdit.value = true
  editId.value = pkwt.id
  filePkwt.value = null

  form.value = {
    pegawai_id: pkwt.pegawai_id || pkwt.pegawai?.id || '',
    nomor_kontrak: pkwt.nomor_kontrak || '',
    tanggal_mulai: normalizeDate(pkwt.tanggal_mulai),
    tanggal_berakhir: normalizeDate(pkwt.tanggal_berakhir),
    status: pkwt.status || 'Aktif'
  }

  showModal.value = true
}

const handleFilePkwt = (event) => {
  filePkwt.value = event?.target?.files?.[0] || null
}

const simpanPkwt = async () => {
  submitting.value = true

  try {
    const formData = new FormData()

    formData.append('pegawai_id', form.value.pegawai_id)
    formData.append('nomor_kontrak', form.value.nomor_kontrak || '')
    formData.append('tanggal_mulai', form.value.tanggal_mulai)
    formData.append('tanggal_berakhir', form.value.tanggal_berakhir)
    formData.append('status', form.value.status)

    if (filePkwt.value) {
      formData.append('file_pkwt', filePkwt.value)
    }

    if (isEdit.value) {
      formData.append('_method', 'PUT')

      await api.post(`/pkwt/${editId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post('/pkwt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isEdit.value ? 'Data PKWT berhasil diperbarui.' : 'Data PKWT berhasil ditambahkan.',
      timer: 1400,
      showConfirmButton: false
    })

    tutupModal()
    await loadPkwt()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data PKWT gagal disimpan.'
    })
  } finally {
    submitting.value = false
  }
}

const hapusPkwt = async (id) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Data PKWT?',
    text: 'Data PKWT yang dihapus tidak akan tampil lagi pada daftar.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626'
  })

  if (!result.isConfirmed) return

  try {
    await api.delete(`/pkwt/${id}`)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data PKWT berhasil dihapus.',
      timer: 1300,
      showConfirmButton: false
    })

    await loadPkwt()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal menghapus data PKWT.'
    })
  }
}

const lihatDetailPkwt = (pkwt) => {
  selectedPkwt.value = pkwt
  showDetailModal.value = true
}

const tutupDetailModal = () => {
  selectedPkwt.value = null
  showDetailModal.value = false
}

const previewPdf = async (url) => {
  if (!url) return
  const tab = window.open('', '_blank')
  try {
    const response = await api.get(url, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(response.data)
    if (tab) tab.location.href = blobUrl
    else window.open(blobUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
  } catch (error) {
    tab?.close()
    Swal.fire('Gagal', error.response?.data?.message || 'File PKWT tidak dapat dibuka.', 'error')
  }
}

const pkwtCurrentPage = ref(1)
const pkwtPerPage = ref(10)

const pkwtTotalPages = computed(() => {
  return Math.ceil(filteredPkwts.value.length / pkwtPerPage.value) || 1
})

const paginatedPkwts = computed(() => {
  const start = (pkwtCurrentPage.value - 1) * pkwtPerPage.value
  return filteredPkwts.value.slice(start, start + pkwtPerPage.value)
})

const changePkwtPage = (page) => {
  if (page < 1 || page > pkwtTotalPages.value) return
  pkwtCurrentPage.value = page
}

const pkwtPaginationPages = computed(() => {
  const total = pkwtTotalPages.value
  const current = pkwtCurrentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

watch(
  [searchPkwt, filterStatusPkwt, filterBerakhirDari, filterBerakhirSampai],
  () => {
    pkwtCurrentPage.value = 1
  }
)

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const sisaHari = (tanggalBerakhir) => {
  if (!tanggalBerakhir) return null

  const today = new Date()
  const endDate = new Date(tanggalBerakhir)
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
}

const statusClass = (status) => {
  return {
    Aktif: 'success',
    Diperpanjang: 'primary',
    Berakhir: 'danger'
  }[status] || 'secondary'
}

onMounted(async () => {
  await Promise.all([
    loadPkwt(),
    loadPegawai()
  ])
})
</script>

<style scoped>
.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 2120;
  background: rgba(15, 23, 42, .58);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.form-card,
.detail-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(15, 23, 42, .34);
  display: flex;
  flex-direction: column;
}

.form-card {
  width: min(620px, 96vw);
}

.detail-card {
  width: min(760px, 96vw);
  max-height: 92vh;
}

.modal-head {
  min-height: 62px;
  padding: 13px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.modal-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.modal-head button {
  width: 33px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.modal-body-custom {
  padding: 15px;
  overflow-y: auto;
}

.modal-foot {
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.compact-label {
  color: #334155;
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 5px;
}

.compact-input {
  font-size: 12px;
  font-weight: 750;
  border-radius: 10px;
}

.file-note {
  margin-top: 10px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  padding: 9px 11px;
  font-size: 11px;
  font-weight: 800;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.detail-summary > div {
  background: #f8fafc;
  border-radius: 12px;
  padding: 9px;
}

.detail-summary span,
.detail-row span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.detail-summary strong,
.detail-row strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  word-break: break-word;
}

.detail-section {
  margin-top: 13px;
}

.detail-section h6 {
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
  margin-bottom: 7px;
}

.detail-row {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 10px;
  background: #f8fafc;
  border-radius: 11px;
  padding: 9px;
  margin-bottom: 7px;
}

.status-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
}

.status-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.status-pill.secondary {
  background: #e5e7eb;
  color: #475569;
}

.file-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border-radius: 13px;
  padding: 11px;
}

.file-box i {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.file-box div {
  flex: 1;
}

.file-box strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 950;
}

.file-box span {
  display: block;
  color: #64748b;
  font-size: 10.8px;
  font-weight: 750;
}

.empty-file {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
  margin: 0;
}

:global(.swal2-container) {
  z-index: 99999 !important;
}

@media (max-width: 768px) {
  .detail-summary {
    grid-template-columns: 1fr 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .file-box {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
