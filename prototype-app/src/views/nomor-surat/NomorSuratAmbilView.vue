<template>
    <NomorSuratAmbilPwa
    v-if="isPwa"
    :form="form"
    :jenis-options="jenisOptions"
    :recent-list="recentList"
    :loading="loading"
    :saving="saving"
    :format-date-time="formatDateTime"
    :format-date="formatDate"
    :status-class="statusClass"
    @update-form="updateForm"
    @submit="submitForm"
    @reload="loadData"
    @reset-form="resetForm"
    @toggle-form="showForm = !showForm"
    />

  <NomorSuratAmbilWeb
    v-else
    :form="form"
    :filter="filter"
    :edit-form="editForm"
    :jenis-options="jenisOptions"
    :recent-list="recentList"
    :pagination="pagination"
    :loading="loading"
    :saving="saving"
    :updating="updating"
    :show-form="showForm"
    :show-filter="showFilter"
    :show-edit-modal="editModal"
    :show-upload-modal="showUploadModal"
    :previewing="previewing"
    :importing="importing"
    :downloading-template="downloadingTemplate"
    :upload-file-name="uploadFile?.name || ''"
    :upload-input-key="uploadInputKey"
    :preview-data="previewData"
    :preview-summary="previewSummary"
    :format-date-time="formatDateTime"
    :format-date="formatDate"
    :status-class="statusClass"
    @update-form="updateForm"
    @update-filter="updateFilter"
    @update-edit-form="updateEditForm"
    @submit="submitForm"
    @submit-edit="submitEdit"
    @open-edit-modal="openEditModal"
    @close-edit-modal="closeEditModal"
    @nonaktif-nomor-surat="nonaktifNomorSurat"
    @reload="loadRecent(1)"
    @change-page="changePage"
    @reset-filter="resetFilter"
    @toggle-form="showForm = !showForm"
    @toggle-filter="showFilter = !showFilter"
    @open-upload-modal="openUploadModal"
    @close-upload-modal="closeUploadModal"
    @download-template="downloadTemplate"
    @file-change="onUploadFileChange"
    @preview-import="previewImport"
    @store-import="storeImport"
    @cancel-import="closeUploadModal"
  />
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import NomorSuratAmbilWeb from './components/NomorSuratAmbilWeb.vue'
import NomorSuratAmbilPwa from './components/NomorSuratAmbilPwa.vue'

const { isPwa } = usePwaMode()

const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = getLocalDateString()

const loading = ref(false)
const saving = ref(false)
const showForm = ref(true)
const jenisOptions = ref([])
const recentList = ref([])

const showUploadModal = ref(false)
const previewing = ref(false)
const importing = ref(false)
const downloadingTemplate = ref(false)

const uploadFile = ref(null)
const uploadInputKey = ref(0)
const previewData = ref([])
const previewSummary = ref({
  total: 0,
  valid: 0,
  invalid: 0
})

const showFilter = ref(false)
const editModal = ref(false)
const updating = ref(false)

const filter = reactive({
  jenis_surat: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  keyword: ''
})

const editForm = reactive({
  id: null,
  nomor_surat: '',
  perihal: '',
  tujuan: '',
  keterangan: ''
})

const form = reactive({
  jenis_surat: 'surat_keluar',
  tanggal_surat: today,
  perihal: '',
  tujuan: '',
  keterangan: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

const fallbackJenisOptions = [
  { value: 'surat_keluar', label: 'Surat Keluar', contoh_format: 'mPro/OP.0001/X/2025' },
  { value: 'memo', label: 'Memo', contoh_format: 'mPro/ME.0001/X/2025' },
  { value: 'bast', label: 'BAST', contoh_format: 'mPro/BAST.0001/X/2025' },
  { value: 'pks', label: 'PKS', contoh_format: 'mPro/PKS.0001/X/2025' },
  { value: 'po', label: 'PO', contoh_format: 'mPro/PO.0001/X/2025' },
  { value: 'spk', label: 'SPK', contoh_format: 'mPro/SPK.0001/X/2025' },
  { value: 'skk', label: 'SKK', contoh_format: 'mPro/SKK.0001/X/2025' },
  { value: 'spbk', label: 'SPBK', contoh_format: 'mPro/SPBK.0001/X/2025' },
  { value: 'skpd', label: 'SKPD', contoh_format: 'mPro/SKPD.0001/X/2025' },
  { value: 'surat_jalan', label: 'Surat Jalan', contoh_format: 'mPro/SJ.0001/X/2025' },
  { value: 'pkwt', label: 'PKWT', contoh_format: '0001/ADM-SAM/PKWT/X/2025' }
]

const updateForm = ({ field, value }) => {
  form[field] = value
}

const resetForm = () => {
  form.jenis_surat = jenisOptions.value?.[0]?.value || ''
  form.tanggal_surat = getLocalDateString()
  form.perihal = ''
  form.tujuan = ''
  form.keterangan = ''
}

const loadJenis = async () => {
  try {
    const response = await api.get('/nomor-surat/jenis')
    jenisOptions.value = response.data.data || fallbackJenisOptions
  } catch (error) {
    jenisOptions.value = fallbackJenisOptions
  }
}

const loadRecent = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/nomor-surat', {
      params: {
        page,
        per_page: pagination.per_page,
        jenis_surat: filter.jenis_surat || undefined,
        tanggal_mulai: filter.tanggal_mulai || undefined,
        tanggal_selesai: filter.tanggal_selesai || undefined,
        keyword: filter.keyword || undefined
      }
    })

    recentList.value = response.data.data || []

    const meta = response.data.pagination || {}

    pagination.current_page = meta.current_page || 1
    pagination.last_page = meta.last_page || 1
    pagination.per_page = meta.per_page || 10
    pagination.total = meta.total || 0
    pagination.from = meta.from || 0
    pagination.to = meta.to || 0
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memuat data nomor surat terbaru.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  if (page < 1 || page > pagination.last_page) {
    return
  }

  if (page === pagination.current_page) {
    return
  }

  await loadRecent(page)
}

const updateFilter = ({ field, value }) => {
  filter[field] = value
}

const resetFilter = async () => {
  filter.jenis_surat = ''
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.keyword = ''

  await loadRecent(1)
}

const openEditModal = (item) => {
  editForm.id = item.id
  editForm.nomor_surat = item.nomor_surat
  editForm.perihal = item.perihal || ''
  editForm.tujuan = item.tujuan || ''
  editForm.keterangan = item.keterangan || ''

  editModal.value = true
}

const closeEditModal = () => {
  editModal.value = false

  editForm.id = null
  editForm.nomor_surat = ''
  editForm.perihal = ''
  editForm.tujuan = ''
  editForm.keterangan = ''
}

const updateEditForm = ({ field, value }) => {
  editForm[field] = value
}

const submitEdit = async () => {
  if (!editForm.perihal) {
    Swal.fire({
      icon: 'warning',
      title: 'Perihal wajib diisi',
      text: 'Silakan isi perihal terlebih dahulu.'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'question',
    title: 'Simpan perubahan?',
    text: 'Data nomor surat akan diperbarui.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Simpan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0d6efd'
  })

  if (!result.isConfirmed) return

  updating.value = true

  try {
    const response = await api.put(`/nomor-surat/${editForm.id}`, {
      perihal: editForm.perihal,
      tujuan: editForm.tujuan,
      keterangan: editForm.keterangan
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data.message || 'Data berhasil diperbarui.',
      timer: 1400,
      showConfirmButton: false
    })

    closeEditModal()
    await loadRecent()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data gagal diperbarui.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    updating.value = false
  }
}

const nonaktifNomorSurat = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Nonaktifkan nomor surat?',
    html: `
      <div style="text-align:left">
        <p>Nomor surat berikut akan dipindahkan ke riwayat:</p>
        <strong>${item.nomor_surat}</strong>
      </div>
    `,
    input: 'textarea',
    inputPlaceholder: 'Alasan nonaktif / hapus nomor surat',
    showCancelButton: true,
    confirmButtonText: 'Ya, Nonaktifkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    const response = await api.delete(`/nomor-surat/${item.id}`, {
      data: {
        alasan_batal: result.value || 'Dinonaktifkan oleh user.'
      }
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data.message || 'Nomor surat berhasil dinonaktifkan.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadRecent()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Nomor surat gagal dinonaktifkan.',
      confirmButtonColor: '#dc3545'
    })
  }
}

const submitForm = async () => {
  if (!form.perihal) {
    Swal.fire({
      icon: 'warning',
      title: 'Perihal Wajib Diisi',
      text: 'Silakan isi perihal surat terlebih dahulu.'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'question',
    title: 'Buat nomor surat keluar?',
    text: 'Sistem akan membuat nomor surat keluar berdasarkan jenis dan tanggal surat yang dipilih.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Buat Nomor',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0d6efd'
  })

  if (!result.isConfirmed) return

  saving.value = true

  try {
    const response = await api.post('/nomor-surat', {
      jenis_surat: form.jenis_surat,
      tanggal_surat: form.tanggal_surat,
      perihal: form.perihal,
      tujuan: form.tujuan,
      keterangan: form.keterangan
    })

    await Swal.fire({
      icon: 'success',
      title: 'Nomor Surat Keluar Berhasil Dibuat',
      html: `
        <div style="text-align:left">
          <p class="mb-1">Nomor surat:</p>
          <h5><strong>${response.data.data.nomor_surat}</strong></h5>
        </div>
      `,
      confirmButtonColor: '#0d6efd'
    })

    resetForm()
    await loadRecent()
  } catch (error) {
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors)[0][0] : null

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: firstError || error.response?.data?.message || 'Nomor surat gagal diambil.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    saving.value = false
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

const formatDate = (value) => {
  if (!value) return '-'

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const statusClass = (status) => {
  if (status === 'Aktif') return 'bg-success'
  if (status === 'Dibatalkan') return 'bg-danger'
  return 'bg-secondary'
}

const onUploadFileChange = (event) => {
  uploadFile.value = event.target.files[0] || null

  previewData.value = []
  previewSummary.value = {
    total: 0,
    valid: 0,
    invalid: 0
  }
}

const resetUploadMassal = () => {
  uploadFile.value = null
  previewData.value = []
  previewSummary.value = {
    total: 0,
    valid: 0,
    invalid: 0
  }

  uploadInputKey.value++
}

const openUploadModal = () => {
  resetUploadMassal()
  showUploadModal.value = true
}

const closeUploadModal = () => {
  resetUploadMassal()
  showUploadModal.value = false
}

const downloadTemplate = async () => {
  downloadingTemplate.value = true

  try {
    const response = await api.get('/nomor-surat/template', {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_nomor_surat.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Template gagal diunduh.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    downloadingTemplate.value = false
  }
}

const previewImport = async () => {
  if (!uploadFile.value) {
    Swal.fire({
      icon: 'warning',
      title: 'File Belum Dipilih',
      text: 'Silakan pilih file Excel terlebih dahulu.'
    })
    return
  }

  previewing.value = true

  try {
    const formData = new FormData()
    formData.append('file_excel', uploadFile.value)

    const response = await api.post('/nomor-surat/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    previewData.value = response.data.data || []
    previewSummary.value = response.data.summary || {
      total: 0,
      valid: 0,
      invalid: 0
    }

    Swal.fire({
      icon: 'success',
      title: 'Preview Berhasil',
      text: 'Silakan cek data preview sebelum disimpan.',
      timer: 1400,
      showConfirmButton: false
    })
  } catch (error) {
    previewData.value = []
    previewSummary.value = {
      total: 0,
      valid: 0,
      invalid: 0
    }

    Swal.fire({
      icon: 'error',
      title: 'Gagal Preview',
      text: error.response?.data?.message || 'Preview data upload gagal.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    previewing.value = false
  }
}

const storeImport = async () => {
  if (!previewData.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Preview Belum Ada',
      text: 'Silakan lakukan preview data terlebih dahulu.'
    })
    return
  }

  const validRows = previewData.value.filter(
    (item) => item.is_valid === true
  )

  if (validRows.length === 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'Tidak Ada Data Valid',
      text: 'Tidak ada baris valid yang dapat disimpan.'
    })
    return
  }

  const confirm = await Swal.fire({
    icon: 'question',
    title: 'Simpan data hasil upload?',
    text: 'Hanya data valid yang akan disimpan.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Simpan Data',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0d6efd'
  })

  if (!confirm.isConfirmed) return

  importing.value = true

  try {
    const response = await api.post('/nomor-surat/import/store', {
      data: validRows
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data.message || 'Data upload berhasil disimpan.',
      confirmButtonColor: '#0d6efd'
    })

    closeUploadModal()
    await loadRecent()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data upload gagal disimpan.',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await loadJenis()
  await loadRecent()
})
</script>