<template>
  <ArsipUnitPwa
    v-if="isPwa"
    :loading="loading"
    :submitting="submitting"
    :unit="unit"
    :current-folder="currentFolder"
    :breadcrumbs="breadcrumbs"
    :folders="folders"
    :documents="documents"
    :pagination="pagination"
    :filter="filter"
    :folder-modal="folderModal"
    :document-modal="documentModal"
    :move-modal="moveModal"
    :folder-form="folderForm"
    :document-form="documentForm"
    :move-form="moveForm"
    :folder-tree="folderTree"
    :selected-folder="selectedFolder"
    :selected-document="selectedDocument"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :format-file-size="formatFileSize"
    :archive-type-label="archiveTypeLabel"
    :status-document-class="statusDocumentClass"
    :load-content="loadContent"
    :open-folder="openFolder"
    :go-root="goRoot"
    :go-breadcrumb="goBreadcrumb"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
    :open-create-folder="openCreateFolder"
    :open-edit-folder="openEditFolder"
    :close-folder-modal="closeFolderModal"
    :submit-folder="submitFolder"
    :delete-folder="deleteFolder"
    :open-upload-document="openUploadDocument"
    :open-bulk-upload="openBulkUpload"
    :open-edit-document="openEditDocument"
    :close-document-modal="closeDocumentModal"
    :submit-document="submitDocument"
    :delete-document="deleteDocument"
    :open-move-document="openMoveDocument"
    :close-move-modal="closeMoveModal"
    :submit-move-document="submitMoveDocument"
    :view-document="viewDocument"
    :download-document="downloadDocument"
    :on-file-change="onFileChange"
  />

  <ArsipUnitWeb
    v-else
    :loading="loading"
    :submitting="submitting"
    :unit="unit"
    :current-folder="currentFolder"
    :breadcrumbs="breadcrumbs"
    :folders="folders"
    :documents="documents"
    :pagination="pagination"
    :filter="filter"
    :folder-modal="folderModal"
    :document-modal="documentModal"
    :move-modal="moveModal"
    :folder-form="folderForm"
    :document-form="documentForm"
    :move-form="moveForm"
    :folder-tree="folderTree"
    :selected-folder="selectedFolder"
    :selected-document="selectedDocument"
    :format-date="formatDate"
    :format-date-time="formatDateTime"
    :format-file-size="formatFileSize"
    :archive-type-label="archiveTypeLabel"
    :status-document-class="statusDocumentClass"
    :load-content="loadContent"
    :open-folder="openFolder"
    :go-root="goRoot"
    :go-breadcrumb="goBreadcrumb"
    :update-filter="updateFilter"
    :reset-filter="resetFilter"
    :open-create-folder="openCreateFolder"
    :open-edit-folder="openEditFolder"
    :close-folder-modal="closeFolderModal"
    :submit-folder="submitFolder"
    :delete-folder="deleteFolder"
    :open-upload-document="openUploadDocument"
    :open-bulk-upload="openBulkUpload"
    :open-edit-document="openEditDocument"
    :close-document-modal="closeDocumentModal"
    :submit-document="submitDocument"
    :delete-document="deleteDocument"
    :open-move-document="openMoveDocument"
    :close-move-modal="closeMoveModal"
    :submit-move-document="submitMoveDocument"
    :view-document="viewDocument"
    :download-document="downloadDocument"
    :on-file-change="onFileChange"
  />

    <div v-if="bulkModal" class="bulk-layer">
    <div class="bulk-card small">
        <div class="bulk-head">
        <div>
            <h5>Upload Massal Dokumen</h5>
            <p>{{ unit?.nama_unit || '-' }} / {{ currentFolder?.nama_folder || 'Root Folder' }}</p>
        </div>

        <button type="button" @click="closeBulkUpload">
            <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="bulk-body">
        <div class="template-box">
            <div>
            <strong>Template Excel</strong>
            <span>Download template, isi metadata, lalu upload kembali.</span>
            </div>

            <button type="button" class="btn btn-sm btn-outline-primary" @click="downloadBulkTemplate">
            <i class="fas fa-download me-1"></i>
            Download Template
            </button>
        </div>

        <label>Upload Template Excel</label>
        <input
            type="file"
            class="form-control form-control-sm"
            accept=".xlsx,.xls"
            @change="onBulkExcelChange"
        >

        <label>Upload File Dokumen</label>
        <input
            type="file"
            class="form-control form-control-sm"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            @change="onBulkFilesChange"
        >

        <small class="bulk-note">
            Maksimal 20 file. Nama file di Excel harus sama persis dengan file yang dipilih.
        </small>
        </div>

        <div class="bulk-foot">
        <button type="button" class="btn btn-sm btn-light" @click="closeBulkUpload">
            Batal
        </button>

        <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="bulkSubmitting"
            @click="previewBulkUpload"
        >
            <i class="fas fa-eye me-1"></i>
            Preview
        </button>
        </div>
    </div>
    </div>

    <div v-if="bulkPreviewModal" class="bulk-layer">
    <div class="bulk-card preview">
        <div class="bulk-head">
        <div>
            <h5>Preview Upload Massal</h5>
            <p>
            Total: {{ bulkSummary.total }},
            Valid: {{ bulkSummary.valid }},
            Invalid: {{ bulkSummary.invalid }}
            </p>
        </div>

        <button type="button" @click="closeBulkPreview">
            <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="bulk-body preview-body">
        <div class="table-responsive">
            <table class="table table-sm table-bordered align-middle bulk-table">
            <thead>
                <tr>
                <th style="width: 55px;">Row</th>
                <th style="width: 190px;">Nama File</th>
                <th style="width: 210px;">Nama Dokumen</th>
                <th style="width: 145px;">Nomor</th>
                <th style="width: 120px;">Kategori</th>
                <th style="width: 130px;">Tipe</th>
                <th style="width: 120px;">Aktif</th>
                <th style="width: 135px;">Tanggal Dokumen</th>
                <th style="width: 135px;">Mulai</th>
                <th style="width: 135px;">Berakhir</th>
                <th style="width: 180px;">Status</th>
                </tr>
            </thead>

            <tbody>
                <tr
                v-for="row in bulkPreviewData"
                :key="row.row_number"
                :class="{ 'table-danger': row.status === 'invalid' }"
                >
                <td>{{ row.row_number }}</td>

                <td>
                    <input v-model="row.nama_file" class="form-control form-control-sm">
                </td>

                <td>
                    <input v-model="row.nama_dokumen" class="form-control form-control-sm">
                </td>

                <td>
                    <input v-model="row.nomor_dokumen" class="form-control form-control-sm">
                </td>

                <td>
                    <input v-model="row.kategori" class="form-control form-control-sm">
                </td>

                <td>
                    <select v-model="row.tipe_arsip" class="form-select form-select-sm">
                    <option value="tidak_berjangka">Tidak Berjangka</option>
                    <option value="berjangka">Berjangka</option>
                    </select>
                </td>

                <td>
                    <select v-model="row.is_dokumen_aktif" class="form-select form-select-sm">
                    <option :value="true">Aktif</option>
                    <option :value="false">Tidak Aktif</option>
                    </select>
                </td>

                <td>
                    <input v-model="row.tanggal_dokumen" type="date" class="form-control form-control-sm">
                </td>

                <td>
                    <input v-model="row.tanggal_mulai" type="date" class="form-control form-control-sm">
                </td>

                <td>
                    <input v-model="row.tanggal_berakhir" type="date" class="form-control form-control-sm">
                </td>

                <td>
                    <span
                    class="badge"
                    :class="row.status === 'valid' ? 'bg-success' : 'bg-danger'"
                    >
                    {{ row.status }}
                    </span>
                    <div class="bulk-message">
                    {{ row.message }}
                    </div>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>

        <div class="bulk-foot">
        <button type="button" class="btn btn-sm btn-light" @click="closeBulkPreview">
            Batal
        </button>

        <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="bulkSubmitting"
            @click="saveBulkUpload"
        >
            <i class="fas fa-save me-1"></i>
            Simpan ke Database
        </button>
        </div>
    </div>
    </div>

  <div v-if="previewModal" class="preview-layer">
  <div class="preview-card">
    <div class="preview-head">
      <div>
        <h5>{{ previewDocument?.nama_dokumen || 'Preview Dokumen' }}</h5>
        <p>
          {{ previewDocument?.file_original_name || previewDocument?.nomor_dokumen || '-' }}
        </p>
      </div>

      <div class="preview-actions">
        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="previewLoading"
          @click="downloadDocument(previewDocument)"
        >
          <i class="fas fa-download me-1"></i>
          Download
        </button>

        <button type="button" class="btn-close-preview" @click="closePreviewModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="preview-body">
      <div v-if="previewLoading" class="preview-state">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat preview dokumen...</span>
      </div>

      <iframe
        v-else-if="previewType === 'pdf' && previewUrl"
        :src="previewUrl"
        class="preview-frame"
      ></iframe>

      <div v-else-if="previewType === 'image' && previewUrl" class="preview-image-wrap">
        <img :src="previewUrl" alt="Preview Dokumen">
      </div>

      <div v-else class="preview-unsupported">
        <div class="unsupported-icon">
          <i class="fas fa-file-arrow-down"></i>
        </div>

        <h6>Preview tidak tersedia</h6>

        <p>
          Preview tidak dapat ditampilkan. Silakan klik tombol Download
          jika ingin mengunduh dokumen.
        </p>

        <button
          type="button"
          class="btn btn-sm btn-primary"
          @click="downloadDocument(previewDocument)"
        >
          <i class="fas fa-download me-1"></i>
          Download Dokumen
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import ArsipUnitWeb from './components/ArsipUnitWeb.vue'
import ArsipUnitPwa from './components/ArsipUnitPwa.vue'

const route = useRoute()
const { isPwa } = usePwaMode()

const loading = ref(false)
const submitting = ref(false)

const unit = ref(null)
const currentFolder = ref(null)
const currentFolderId = ref(null)
const breadcrumbs = ref([])
const folders = ref([])
const documents = ref([])
const folderTree = ref([])

const folderModal = ref(false)
const documentModal = ref(false)
const moveModal = ref(false)

const selectedFolder = ref(null)
const selectedDocument = ref(null)

const previewModal = ref(false)
const previewLoading = ref(false)
const previewDocument = ref(null)
const previewUrl = ref('')
const previewType = ref('unsupported')

const bulkModal = ref(false)
const bulkPreviewModal = ref(false)
const bulkSubmitting = ref(false)

const bulkForm = reactive({
  arsip_unit_id: null,
  arsip_folder_id: null,
  excel_file: null,
  files: []
})

const bulkPreviewData = ref([])

const bulkSummary = computed(() => {
  const total = bulkPreviewData.value.length
  const valid = bulkPreviewData.value.filter((row) => row.status === 'valid').length
  const invalid = bulkPreviewData.value.filter((row) => row.status === 'invalid').length

  return { total, valid, invalid }
})

const resetBulkUpload = () => {
  bulkForm.arsip_unit_id = unit.value?.id || null
  bulkForm.arsip_folder_id = currentFolderId.value || null
  bulkForm.excel_file = null
  bulkForm.files = []
  bulkPreviewData.value = []
}

const openBulkUpload = () => {
  resetBulkUpload()
  bulkModal.value = true
}

const closeBulkUpload = () => {
  bulkModal.value = false
  resetBulkUpload()
}

const onBulkExcelChange = (event) => {
  bulkForm.excel_file = event?.target?.files?.[0] || null
}

const onBulkFilesChange = (event) => {
  bulkForm.files = Array.from(event?.target?.files || [])
}

const downloadBulkTemplate = async () => {
  try {
    const response = await api.get('/arsip/documents/bulk-template', {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = window.document.createElement('a')

    link.href = url
    link.download = 'template_upload_massal_arsip.xlsx'
    window.document.body.appendChild(link)
    link.click()
    link.remove()

    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Template Excel gagal didownload.'
    })
  }
}

const previewBulkUpload = async () => {
  if (!bulkForm.excel_file) {
    Swal.fire('Perhatian', 'File template Excel wajib dipilih.', 'warning')
    return
  }

  if (!bulkForm.files.length) {
    Swal.fire('Perhatian', 'File dokumen wajib dipilih.', 'warning')
    return
  }

  bulkSubmitting.value = true

  try {
    const formData = new FormData()

    formData.append('arsip_unit_id', bulkForm.arsip_unit_id)
    formData.append('arsip_folder_id', bulkForm.arsip_folder_id || '')
    formData.append('excel_file', bulkForm.excel_file)

    bulkForm.files.forEach((file) => {
      formData.append('files[]', file)
    })

    const response = await api.post('/arsip/documents/bulk-preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    bulkPreviewData.value = response.data.data?.preview || []

    bulkModal.value = false
    bulkPreviewModal.value = true
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Preview',
      text: getErrorMessage(error, 'Gagal membuat preview upload massal.')
    })
  } finally {
    bulkSubmitting.value = false
  }
}

const closeBulkPreview = () => {
  bulkPreviewModal.value = false
}

const saveBulkUpload = async () => {
  bulkSubmitting.value = true

  try {
    const formData = new FormData()

    formData.append('arsip_unit_id', bulkForm.arsip_unit_id)
    formData.append('arsip_folder_id', bulkForm.arsip_folder_id || '')
    formData.append('preview_data', JSON.stringify(bulkPreviewData.value))

    bulkForm.files.forEach((file) => {
      formData.append('files[]', file)
    })

    const response = await api.post('/arsip/documents/bulk-store', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data.message || 'Dokumen massal berhasil disimpan.',
      timer: 1500,
      showConfirmButton: false
    })

    bulkPreviewModal.value = false
    resetBulkUpload()
    await loadContent(1)
  } catch (error) {
    const preview = error.response?.data?.data?.preview

    if (preview) {
      bulkPreviewData.value = preview
    }

    Swal.fire({
      icon: 'error',
      title: 'Belum Valid',
      text: error.response?.data?.message || 'Masih ada data preview yang belum valid.'
    })
  } finally {
    bulkSubmitting.value = false
  }
}

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

const filter = reactive({
  keyword: '',
  tipe_arsip: '',
  status_aktif: ''
})

const folderForm = reactive({
  id: null,
  arsip_unit_id: null,
  parent_id: null,
  nama_folder: '',
  deskripsi: ''
})

const documentForm = reactive({
  id: null,
  arsip_unit_id: null,
  arsip_folder_id: null,
  nomor_dokumen: '',
  nama_dokumen: '',
  kategori: '',
  tipe_arsip: 'tidak_berjangka',
  is_dokumen_aktif: false,
  tanggal_dokumen: '',
  tanggal_mulai: '',
  tanggal_berakhir: '',
  deskripsi: '',
  tag: '',
  file: null
})

const moveForm = reactive({
  document_id: null,
  arsip_folder_id: ''
})

const unitSlug = () => route.params.unitSlug

const cleanParams = (params) => {
  const result = {}

  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      result[key] = params[key]
    }
  })

  return result
}

const loadContent = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get(`/arsip/unit/${unitSlug()}/content`, {
      params: cleanParams({
        page,
        per_page: pagination.per_page,
        folder_id: currentFolderId.value,
        keyword: filter.keyword,
        tipe_arsip: filter.tipe_arsip,
        status_aktif: filter.status_aktif
      })
    })

    const data = response.data.data || {}

    unit.value = data.unit || null
    currentFolder.value = data.current_folder || null
    breadcrumbs.value = data.breadcrumbs || []
    folders.value = data.folders || []
    documents.value = data.documents || []

    Object.assign(pagination, data.pagination || {})
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memuat data arsip.'
    })
  } finally {
    loading.value = false
  }
}

const loadFolderTree = async () => {
  if (!unitSlug()) return

  try {
    const response = await api.get(`/arsip/unit/${unitSlug()}/folder-tree`)
    folderTree.value = response.data.data?.folders || []
  } catch {
    folderTree.value = []
  }
}

const openFolder = async (folder) => {
  currentFolderId.value = folder.id
  await loadContent(1)
}

const goRoot = async () => {
  currentFolderId.value = null
  await loadContent(1)
}

const goBreadcrumb = async (breadcrumb) => {
  currentFolderId.value = breadcrumb.id
  await loadContent(1)
}

const updateFilter = async () => {
  await loadContent(1)
}

const resetFilter = async () => {
  filter.keyword = ''
  filter.tipe_arsip = ''
  filter.status_aktif = ''
  await loadContent(1)
}

const resetFolderForm = () => {
  folderForm.id = null
  folderForm.arsip_unit_id = unit.value?.id || null
  folderForm.parent_id = currentFolderId.value || null
  folderForm.nama_folder = ''
  folderForm.deskripsi = ''
}

const openCreateFolder = () => {
  resetFolderForm()
  selectedFolder.value = null
  folderModal.value = true
}

const openEditFolder = (folder) => {
  selectedFolder.value = folder

  folderForm.id = folder.id
  folderForm.arsip_unit_id = folder.arsip_unit_id
  folderForm.parent_id = folder.parent_id
  folderForm.nama_folder = folder.nama_folder
  folderForm.deskripsi = folder.deskripsi || ''

  folderModal.value = true
}

const closeFolderModal = () => {
  folderModal.value = false
  selectedFolder.value = null
  resetFolderForm()
}

const submitFolder = async () => {
  submitting.value = true

  try {
    const payload = {
      arsip_unit_id: folderForm.arsip_unit_id,
      parent_id: folderForm.parent_id,
      nama_folder: folderForm.nama_folder,
      deskripsi: folderForm.deskripsi
    }

    if (folderForm.id) {
      await api.put(`/arsip/folders/${folderForm.id}`, payload)
    } else {
      await api.post('/arsip/folders', payload)
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: folderForm.id ? 'Folder berhasil diperbarui.' : 'Folder berhasil dibuat.',
      timer: 1300,
      showConfirmButton: false
    })

    closeFolderModal()
    await loadContent(pagination.current_page || 1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Folder gagal disimpan.')
    })
  } finally {
    submitting.value = false
  }
}

const deleteFolder = async (folder) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Folder?',
    text: `Folder "${folder.nama_folder}" akan dinonaktifkan.`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    await api.delete(`/arsip/folders/${folder.id}`)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Folder berhasil dihapus.',
      timer: 1300,
      showConfirmButton: false
    })

    await loadContent(pagination.current_page || 1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Folder gagal dihapus.')
    })
  }
}

const resetDocumentForm = () => {
  documentForm.id = null
  documentForm.arsip_unit_id = unit.value?.id || null
  documentForm.arsip_folder_id = currentFolderId.value || null
  documentForm.nomor_dokumen = ''
  documentForm.nama_dokumen = ''
  documentForm.kategori = ''
  documentForm.tipe_arsip = 'tidak_berjangka'
  documentForm.is_dokumen_aktif = false
  documentForm.tanggal_dokumen = ''
  documentForm.tanggal_mulai = ''
  documentForm.tanggal_berakhir = ''
  documentForm.deskripsi = ''
  documentForm.tag = ''
  documentForm.file = null
}

const openUploadDocument = () => {
  resetDocumentForm()
  selectedDocument.value = null
  documentModal.value = true
}

const openEditDocument = (document) => {
  selectedDocument.value = document

  documentForm.id = document.id
  documentForm.arsip_unit_id = document.arsip_unit_id || unit.value?.id
  documentForm.arsip_folder_id = document.arsip_folder_id || currentFolderId.value || null
  documentForm.nomor_dokumen = document.nomor_dokumen || ''
  documentForm.nama_dokumen = document.nama_dokumen || ''
  documentForm.kategori = document.kategori || ''
  documentForm.tipe_arsip = document.tipe_arsip || 'tidak_berjangka'
  documentForm.is_dokumen_aktif = !!document.is_dokumen_aktif
  documentForm.tanggal_dokumen = normalizeDate(document.tanggal_dokumen)
  documentForm.tanggal_mulai = normalizeDate(document.tanggal_mulai)
  documentForm.tanggal_berakhir = normalizeDate(document.tanggal_berakhir)
  documentForm.deskripsi = document.deskripsi || ''
  documentForm.tag = document.tag || ''
  documentForm.file = null

  documentModal.value = true
}

const closeDocumentModal = () => {
  documentModal.value = false
  selectedDocument.value = null
  resetDocumentForm()
}

const onFileChange = (event) => {
  const file = event?.target?.files?.[0] || null
  documentForm.file = file
}

const submitDocument = async () => {
  submitting.value = true

  try {
    const formData = new FormData()

    formData.append('arsip_unit_id', documentForm.arsip_unit_id)
    formData.append('arsip_folder_id', documentForm.arsip_folder_id || '')
    formData.append('nomor_dokumen', documentForm.nomor_dokumen || '')
    formData.append('nama_dokumen', documentForm.nama_dokumen)
    formData.append('kategori', documentForm.kategori || '')
    formData.append('tipe_arsip', documentForm.tipe_arsip)
    formData.append('is_dokumen_aktif', documentForm.is_dokumen_aktif ? 1 : 0)
    formData.append('tanggal_dokumen', documentForm.tanggal_dokumen || '')
    formData.append('tanggal_mulai', documentForm.tanggal_mulai || '')
    formData.append('tanggal_berakhir', documentForm.tanggal_berakhir || '')
    formData.append('deskripsi', documentForm.deskripsi || '')
    formData.append('tag', documentForm.tag || '')

    if (documentForm.file) {
      formData.append('file', documentForm.file)
    }

    if (documentForm.id) {
      formData.append('_method', 'PUT')

      await api.post(`/arsip/documents/${documentForm.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      await api.post('/arsip/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: documentForm.id ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil diupload.',
      timer: 1300,
      showConfirmButton: false
    })

    closeDocumentModal()
    await loadContent(pagination.current_page || 1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Dokumen gagal disimpan.')
    })
  } finally {
    submitting.value = false
  }
}

const openMoveDocument = async (document) => {
  selectedDocument.value = document
  moveForm.document_id = document.id
  moveForm.arsip_folder_id = document.arsip_folder_id || ''

  await loadFolderTree()

  moveModal.value = true
}

const closeMoveModal = () => {
  moveModal.value = false
  selectedDocument.value = null
  moveForm.document_id = null
  moveForm.arsip_folder_id = ''
}

const submitMoveDocument = async () => {
  submitting.value = true

  try {
    await api.post(`/arsip/documents/${moveForm.document_id}/move`, {
      arsip_folder_id: moveForm.arsip_folder_id || null
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Dokumen berhasil dipindahkan.',
      timer: 1300,
      showConfirmButton: false
    })

    closeMoveModal()
    await loadContent(pagination.current_page || 1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Dokumen gagal dipindahkan.')
    })
  } finally {
    submitting.value = false
  }
}

const deleteDocument = async (document) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Dokumen?',
    text: `Dokumen "${document.nama_dokumen}" akan dihapus dari arsip aktif.`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    await api.delete(`/arsip/documents/${document.id}`)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Dokumen berhasil dihapus.',
      timer: 1300,
      showConfirmButton: false
    })

    await loadContent(pagination.current_page || 1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: getErrorMessage(error, 'Dokumen gagal dihapus.')
    })
  }
}

const getFileExtension = (document) => {
  const fileName = String(
    document?.file_original_name ||
    document?.file_name ||
    document?.nama_dokumen ||
    ''
  ).toLowerCase()

  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop() : ''
}

const getPreviewType = (document) => {
  const extension = getFileExtension(document)

  if (extension === 'pdf') {
    return 'pdf'
  }

  if (['jpg', 'jpeg', 'png'].includes(extension)) {
    return 'image'
  }

  return 'unsupported'
}

const closePreviewModal = () => {
  previewModal.value = false
  previewLoading.value = false
  previewDocument.value = null
  previewType.value = 'unsupported'

  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = ''
}

const viewDocument = async (document) => {
  if (!document?.id) return

  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }

  previewDocument.value = document
  previewType.value = getPreviewType(document)
  previewModal.value = true
  previewLoading.value = false

  // Kalau bukan PDF/JPG/PNG, jangan request preview dan jangan download otomatis
  if (previewType.value === 'unsupported') {
    return
  }

  previewLoading.value = true

  try {
    const response = await api.get(`/arsip/documents/${document.id}/view`, {
      responseType: 'blob'
    })

    const contentType = response.headers['content-type'] || ''

    // Kalau backend mengirim JSON error, jangan download otomatis
    if (contentType.includes('application/json')) {
      previewType.value = 'unsupported'
      previewUrl.value = ''
      return
    }

    // Paksa tipe blob agar iframe tidak menganggap file sebagai download
    const blobType = previewType.value === 'pdf'
    ? 'application/pdf'
    : contentType || 'image/*'

    const blob = new Blob([response.data], {
    type: blobType
    })

    previewUrl.value = window.URL.createObjectURL(blob)
  } catch (error) {
    // Jangan tutup modal, jangan tampilkan Swal, dan jangan download otomatis
    previewType.value = 'unsupported'
    previewUrl.value = ''
  } finally {
    previewLoading.value = false
  }
}

const downloadDocument = async (document) => {
  if (!document?.id) return

  try {
    const response = await api.get(`/arsip/documents/${document.id}/download`, {
      responseType: 'blob'
    })

    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)

    const link = window.document.createElement('a')
    link.href = url
    link.download = document.file_original_name || document.file_name || `${document.nama_dokumen || 'dokumen-arsip'}`
    window.document.body.appendChild(link)
    link.click()
    link.remove()

    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Download',
      text: error.response?.data?.message || 'File dokumen gagal didownload.'
    })
  }
}

const normalizeDate = (value) => {
  if (!value) return ''

  return String(value).slice(0, 10)
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

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0)

  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const archiveTypeLabel = (type) => {
  return {
    berjangka: 'Berjangka',
    tidak_berjangka: 'Tidak Berjangka'
  }[type] || '-'
}

const statusDocumentClass = (document) => {
  if (document.tipe_arsip !== 'berjangka') return 'bg-secondary'

  const sisaHari = Number(document.sisa_hari ?? 0)

  if (sisaHari < 0) return 'bg-danger'
  if (sisaHari <= 30) return 'bg-warning text-dark'

  return 'bg-success'
}

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors

  if (errors) {
    const firstKey = Object.keys(errors)[0]
    return errors[firstKey]?.[0] || fallback
  }

  return error.response?.data?.message || fallback
}

watch(
  () => route.params.unitSlug,
  async () => {
    currentFolderId.value = null
    await loadContent(1)
  }
)

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
:global(.swal2-container) {
  z-index: 99999 !important;
}

.preview-layer {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.preview-card {
  width: min(1100px, 96vw);
  height: min(720px, 92vh);
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.34);
}

.preview-head {
  min-height: 62px;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.preview-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close-preview {
  width: 34px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.preview-body {
  flex: 1;
  min-height: 0;
  background: #f8fafc;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #ffffff;
}

.preview-image-wrap {
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-wrap img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.14);
}

.preview-state,
.preview-unsupported {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-state {
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
}

.preview-unsupported {
  flex-direction: column;
  text-align: center;
  padding: 24px;
}

.unsupported-icon {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 12px;
}

.preview-unsupported h6 {
  margin-bottom: 6px;
  color: #111827;
  font-size: 16px;
  font-weight: 950;
}

.preview-unsupported p {
  max-width: 420px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
}

@media (max-width: 768px) {
  .preview-layer {
    padding: 0;
    align-items: flex-end;
  }

  .preview-card {
    width: 100%;
    height: 92vh;
    border-radius: 22px 22px 0 0;
  }

  .preview-head {
    align-items: flex-start;
  }

  .preview-actions .btn-primary {
    padding: 5px 8px;
    font-size: 11px;
  }
}

.bulk-layer {
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

.bulk-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.34);
}

.bulk-card.small {
  width: min(560px, 96vw);
}

.bulk-card.preview {
  width: min(1180px, 97vw);
  height: min(720px, 92vh);
  display: flex;
  flex-direction: column;
}

.bulk-head {
  min-height: 62px;
  padding: 13px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.bulk-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.bulk-head button {
  width: 33px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.bulk-body {
  padding: 15px;
}

.bulk-body.preview-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.bulk-body label {
  display: block;
  margin: 11px 0 5px;
  color: #334155;
  font-size: 11px;
  font-weight: 900;
}

.template-box {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  border-radius: 14px;
  padding: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.template-box strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.template-box span,
.bulk-note {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.bulk-note {
  margin-top: 8px;
}

.bulk-foot {
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.bulk-table {
  font-size: 11.5px;
}

.bulk-table thead th {
  background: #f8fafc;
  color: #111827;
  font-weight: 900;
  white-space: nowrap;
}

.bulk-table input,
.bulk-table select {
  min-width: 120px;
  font-size: 11.5px;
}

.bulk-message {
  margin-top: 4px;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  min-width: 160px;
}
</style>