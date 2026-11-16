<template>
  <ApprovalPkwtPwa
    v-if="isPwa"
    :loading="loading"
    :submitting="submitting"
    :approvals="approvals"
    :filtered-approvals="filteredApprovals"
    :paginated-approvals="paginatedApprovals"
    :search-approval="searchApproval"
    :filter-status-approval="filterStatusApproval"
    :filter-unit-kerja-approval="filterUnitKerjaApproval"
    :filter-tanggal-dari="filterTanggalDari"
    :filter-tanggal-sampai="filterTanggalSampai"
    :unit-kerja-approval-options="unitKerjaApprovalOptions"
    :approval-current-page="approvalCurrentPage"
    :approval-total-pages="approvalTotalPages"
    :format-tanggal="formatTanggal"
    :status-label="statusLabel"
    :status-class="statusClass"
    :set-search-approval="setSearchApproval"
    :set-filter-status-approval="setFilterStatusApproval"
    :set-filter-unit-kerja-approval="setFilterUnitKerjaApproval"
    :set-filter-tanggal-dari="setFilterTanggalDari"
    :set-filter-tanggal-sampai="setFilterTanggalSampai"
    :reset-filter-approval="resetFilterApproval"
    :change-approval-page="changeApprovalPage"
    :load-approval="loadApproval"
    :buka-modal-setujui="bukaModalSetujui"
    :tolak="tolak"
    :proses-pkwt="prosesPkwt"
    :buka-modal-upload="bukaModalUpload"
  />

  <ApprovalPkwtWeb
    v-else
    :loading="loading"
    :submitting="submitting"
    :approvals="approvals"
    :filtered-approvals="filteredApprovals"
    :paginated-approvals="paginatedApprovals"
    :search-approval="searchApproval"
    :filter-status-approval="filterStatusApproval"
    :filter-unit-kerja-approval="filterUnitKerjaApproval"
    :filter-tanggal-dari="filterTanggalDari"
    :filter-tanggal-sampai="filterTanggalSampai"
    :unit-kerja-approval-options="unitKerjaApprovalOptions"
    :approval-current-page="approvalCurrentPage"
    :approval-per-page="approvalPerPage"
    :approval-total-pages="approvalTotalPages"
    :approval-pagination-pages="approvalPaginationPages"
    :open-approval-action-id="openApprovalActionId"
    :format-tanggal="formatTanggal"
    :status-label="statusLabel"
    :status-class="statusClass"
    :set-search-approval="setSearchApproval"
    :set-filter-status-approval="setFilterStatusApproval"
    :set-filter-unit-kerja-approval="setFilterUnitKerjaApproval"
    :set-filter-tanggal-dari="setFilterTanggalDari"
    :set-filter-tanggal-sampai="setFilterTanggalSampai"
    :reset-filter-approval="resetFilterApproval"
    :change-approval-page="changeApprovalPage"
    :toggle-approval-action="toggleApprovalAction"
    :close-approval-action="closeApprovalAction"
    :load-approval="loadApproval"
    :buka-modal-setujui="bukaModalSetujui"
    :tolak="tolak"
    :proses-pkwt="prosesPkwt"
    :buka-modal-upload="bukaModalUpload"
  />

  <!-- Modal Approval -->
  <div v-if="showApprovalModal" class="approval-layer">
    <div class="approval-modal-card">
      <div class="approval-modal-head">
        <div>
          <h5>Form Approval Perpanjangan Kontrak</h5>
          <p>{{ selectedApproval?.pegawai?.nama || '-' }}</p>
        </div>

        <button type="button" @click="closeApprovalModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="approval-modal-body">
        <div class="employee-preview">
          <div>
            <span>NIP</span>
            <strong>{{ selectedApproval?.pegawai?.nip || '-' }}</strong>
          </div>

          <div>
            <span>Unit Kerja</span>
            <strong>{{ selectedApproval?.unit_kerja || selectedApproval?.pegawai?.unit_kerja || '-' }}</strong>
          </div>

          <div>
            <span>Tanggal Berakhir</span>
            <strong>{{ formatTanggal(selectedApproval?.pkwt?.tanggal_berakhir) }}</strong>
          </div>
        </div>

        <div class="form-group-custom">
          <label>Durasi Perpanjangan</label>
          <select v-model="approvalForm.durasi_bulan" class="form-select form-select-sm">
            <option v-for="n in 24" :key="n" :value="n">
              {{ n }} Bulan
            </option>
          </select>
        </div>

        <div class="form-group-custom">
          <label>Catatan Kadiv/Direksi</label>
          <textarea
            v-model="approvalForm.catatan_kadiv"
            class="form-control form-control-sm"
            rows="4"
            placeholder="Masukkan catatan approval..."
          ></textarea>
        </div>
      </div>

      <div class="approval-modal-foot">
        <button type="button" class="btn btn-sm btn-light" @click="closeApprovalModal">
          Batal
        </button>

        <button
          type="button"
          class="btn btn-sm btn-success"
          :disabled="submitting"
          @click="submitSetujui"
        >
          <i class="fas fa-check me-1"></i>
          Simpan Approval
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Upload PDF -->
  <div v-if="showUploadModal" class="approval-layer">
    <div class="approval-modal-card">
      <div class="approval-modal-head">
        <div>
          <h5>Upload PDF PKWT</h5>
          <p>{{ selectedUpload?.pegawai?.nama || '-' }}</p>
        </div>

        <button type="button" @click="closeUploadModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="approval-modal-body">
        <div class="employee-preview two">
          <div>
            <span>NIP</span>
            <strong>{{ selectedUpload?.pegawai?.nip || '-' }}</strong>
          </div>

          <div>
            <span>Durasi</span>
            <strong>{{ selectedUpload?.durasi_bulan ? selectedUpload.durasi_bulan + ' bulan' : '-' }}</strong>
          </div>
        </div>

        <div class="form-group-custom">
          <label>Nomor Kontrak Baru</label>
          <input
            v-model="nomorKontrakBaru"
            type="text"
            class="form-control form-control-sm"
            placeholder="Masukkan nomor kontrak baru"
          >
        </div>

        <div class="form-group-custom">
          <label>File PKWT PDF</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            class="form-control form-control-sm"
            @change="handleFile"
          >
          <small>Format file yang diizinkan hanya PDF.</small>
        </div>
      </div>

      <div class="approval-modal-foot">
        <button type="button" class="btn btn-sm btn-light" @click="closeUploadModal">
          Batal
        </button>

        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="submitting"
          @click="uploadPkwt"
        >
          <i class="fas fa-upload me-1"></i>
          Upload & Selesaikan
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

import ApprovalPkwtWeb from './components/ApprovalPkwtWeb.vue'
import ApprovalPkwtPwa from './components/ApprovalPkwtPwa.vue'

const { isPwa } = usePwaMode()

const loading = ref(false)
const submitting = ref(false)
const approvals = ref([])

const searchApproval = ref('')
const filterStatusApproval = ref('')
const filterUnitKerjaApproval = ref('')
const filterTanggalDari = ref('')
const filterTanggalSampai = ref('')

const showApprovalModal = ref(false)
const selectedApproval = ref(null)

const approvalForm = ref({
  durasi_bulan: 12,
  catatan_kadiv: ''
})

const showUploadModal = ref(false)
const selectedUpload = ref(null)
const filePkwt = ref(null)
const nomorKontrakBaru = ref('')
const openApprovalActionId = ref(null)

const setSearchApproval = (value) => {
  searchApproval.value = value
}

const setFilterStatusApproval = (value) => {
  filterStatusApproval.value = value
}

const setFilterUnitKerjaApproval = (value) => {
  filterUnitKerjaApproval.value = value
}

const setFilterTanggalDari = (value) => {
  filterTanggalDari.value = value
}

const setFilterTanggalSampai = (value) => {
  filterTanggalSampai.value = value
}

const toggleApprovalAction = (id) => {
  openApprovalActionId.value = openApprovalActionId.value === id ? null : id
}

const closeApprovalAction = () => {
  openApprovalActionId.value = null
}

const unitKerjaApprovalOptions = computed(() => {
  return [...new Set(
    approvals.value
      .map((item) => item.unit_kerja ?? item.pegawai?.unit_kerja)
      .filter(Boolean)
  )].sort()
})

const filteredApprovals = computed(() => {
  const keyword = searchApproval.value.toLowerCase().trim()

  return approvals.value.filter((item) => {
    const nip = String(item.pegawai?.nip ?? '').toLowerCase()
    const nama = String(item.pegawai?.nama ?? '').toLowerCase()
    const jabatan = String(item.pegawai?.jabatan ?? '').toLowerCase()
    const unitKerja = String(item.unit_kerja ?? item.pegawai?.unit_kerja ?? '')
    const statusProses = String(item.status_proses ?? '')
    const tanggalBerakhir = String(item.pkwt?.tanggal_berakhir ?? '')

    const cocokKeyword =
      !keyword ||
      nip.includes(keyword) ||
      nama.includes(keyword) ||
      jabatan.includes(keyword) ||
      unitKerja.toLowerCase().includes(keyword)

    const cocokStatus =
      !filterStatusApproval.value ||
      statusProses === filterStatusApproval.value

    const cocokUnit =
      !filterUnitKerjaApproval.value ||
      unitKerja === filterUnitKerjaApproval.value

    const cocokTanggalDari =
      !filterTanggalDari.value ||
      tanggalBerakhir >= filterTanggalDari.value

    const cocokTanggalSampai =
      !filterTanggalSampai.value ||
      tanggalBerakhir <= filterTanggalSampai.value

    return cocokKeyword && cocokStatus && cocokUnit && cocokTanggalDari && cocokTanggalSampai
  })
})

const resetFilterApproval = () => {
  searchApproval.value = ''
  filterStatusApproval.value = ''
  filterUnitKerjaApproval.value = ''
  filterTanggalDari.value = ''
  filterTanggalSampai.value = ''
  approvalCurrentPage.value = 1
}

const approvalCurrentPage = ref(1)
const approvalPerPage = ref(10)

const approvalTotalPages = computed(() => {
  return Math.ceil(filteredApprovals.value.length / approvalPerPage.value) || 1
})

const paginatedApprovals = computed(() => {
  const start = (approvalCurrentPage.value - 1) * approvalPerPage.value
  return filteredApprovals.value.slice(start, start + approvalPerPage.value)
})

const changeApprovalPage = (page) => {
  if (page < 1 || page > approvalTotalPages.value) return
  approvalCurrentPage.value = page
}

const approvalPaginationPages = computed(() => {
  const total = approvalTotalPages.value
  const current = approvalCurrentPage.value

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
  [searchApproval, filterStatusApproval, filterUnitKerjaApproval, filterTanggalDari, filterTanggalSampai],
  () => {
    approvalCurrentPage.value = 1
  }
)

const loadApproval = async () => {
  loading.value = true

  try {
    const response = await api.get('/approval-pkwt')

    approvals.value = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []

    approvalCurrentPage.value = 1
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengambil data approval PKWT.'
    })
  } finally {
    loading.value = false
  }
}

const bukaModalSetujui = (item) => {
  closeApprovalAction()
  selectedApproval.value = item

  approvalForm.value = {
    durasi_bulan: item.durasi_bulan || 12,
    catatan_kadiv: item.catatan_kadiv || ''
  }

  showApprovalModal.value = true
}

const closeApprovalModal = () => {
  showApprovalModal.value = false
  selectedApproval.value = null
  approvalForm.value = {
    durasi_bulan: 12,
    catatan_kadiv: ''
  }
}

const submitSetujui = async () => {
  if (!selectedApproval.value?.id) return

  submitting.value = true

  try {
    await api.post(
      `/approval-pkwt/${selectedApproval.value.id}/setujui`,
      approvalForm.value
    )

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pengajuan berhasil disetujui.',
      timer: 1400,
      showConfirmButton: false
    })

    closeApprovalModal()
    await loadApproval()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Gagal menyetujui pengajuan.')
    })
  } finally {
    submitting.value = false
  }
}

const tolak = async (id) => {
  closeApprovalAction()

  const result = await Swal.fire({
    icon: 'warning',
    title: 'Tidak Diperpanjang?',
    text: 'Data ini akan ditandai sebagai tidak diperpanjang.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Tolak',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626'
  })

  if (!result.isConfirmed) return

  submitting.value = true

  try {
    await api.post(`/approval-pkwt/${id}/tolak`)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pengajuan ditandai tidak diperpanjang.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadApproval()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Gagal menolak pengajuan.')
    })
  } finally {
    submitting.value = false
  }
}

const prosesPkwt = async (id) => {
  closeApprovalAction()

  const result = await Swal.fire({
    icon: 'question',
    title: 'Proses Penerbitan PKWT?',
    text: 'Status akan berubah menjadi Penerbitan PKWT.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Proses',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  submitting.value = true

  try {
    await api.post(`/approval-pkwt/${id}/proses-pkwt`)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status berubah menjadi Penerbitan PKWT.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadApproval()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Gagal memproses PKWT.')
    })
  } finally {
    submitting.value = false
  }
}

const bukaModalUpload = (item) => {
  closeApprovalAction()
  selectedUpload.value = item
  filePkwt.value = null
  nomorKontrakBaru.value = ''
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedUpload.value = null
  filePkwt.value = null
  nomorKontrakBaru.value = ''
}

const handleFile = (event) => {
  filePkwt.value = event.target.files?.[0] || null
}

const uploadPkwt = async () => {
  if (!selectedUpload.value?.id) return

  if (!filePkwt.value) {
    Swal.fire('Perhatian', 'Pilih file PDF terlebih dahulu.', 'warning')
    return
  }

  if (!nomorKontrakBaru.value) {
    Swal.fire('Perhatian', 'Nomor kontrak baru wajib diisi.', 'warning')
    return
  }

  const formData = new FormData()
  formData.append('file_pkwt', filePkwt.value)
  formData.append('nomor_kontrak', nomorKontrakBaru.value)

  submitting.value = true

  try {
    await api.post(
      `/approval-pkwt/${selectedUpload.value.id}/upload-pkwt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'PDF berhasil diupload dan status PKWT selesai.',
      timer: 1500,
      showConfirmButton: false
    })

    closeUploadModal()
    await loadApproval()
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal Upload',
      text: getErrorMessage(error, 'Gagal upload PDF.')
    })
  } finally {
    submitting.value = false
  }
}

const statusLabel = (status) => {
  return {
    pending: 'Pending',
    perpanjang_kontrak: 'Perpanjang Kontrak',
    penerbitan_pkwt: 'Penerbitan PKWT',
    tidak_diperpanjang: 'Tidak Diperpanjang',
    selesai: 'Selesai'
  }[status] || status || '-'
}

const statusClass = (status) => {
  return {
    pending: 'warning',
    perpanjang_kontrak: 'success',
    penerbitan_pkwt: 'info',
    tidak_diperpanjang: 'danger',
    selesai: 'primary'
  }[status] || 'secondary'
}

const formatTanggal = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data

  if (data?.message) return data.message

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return fallback
}

onMounted(() => {
  loadApproval()
})
</script>

<style scoped>
.approval-layer {
  position: fixed;
  inset: 0;
  z-index: 2120;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.approval-modal-card {
  width: min(560px, 96vw);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.34);
  display: flex;
  flex-direction: column;
}

.approval-modal-head {
  min-height: 62px;
  padding: 13px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.approval-modal-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.approval-modal-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.approval-modal-head button {
  width: 33px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.approval-modal-body {
  padding: 15px;
  overflow-y: auto;
}

.employee-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 13px;
}

.employee-preview.two {
  grid-template-columns: repeat(2, 1fr);
}

.employee-preview > div {
  background: #f8fafc;
  border-radius: 12px;
  padding: 9px;
}

.employee-preview span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.employee-preview strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  word-break: break-word;
}

.form-group-custom {
  margin-bottom: 12px;
}

.form-group-custom label {
  display: block;
  margin-bottom: 5px;
  color: #334155;
  font-size: 11px;
  font-weight: 900;
}

.form-group-custom small {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.form-control-sm,
.form-select-sm {
  border-radius: 9px;
  font-size: 12px;
  font-weight: 750;
}

.approval-modal-foot {
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:global(.swal2-container) {
  z-index: 99999 !important;
}

@media (max-width: 576px) {
  .employee-preview,
  .employee-preview.two {
    grid-template-columns: 1fr;
  }
}
</style>
