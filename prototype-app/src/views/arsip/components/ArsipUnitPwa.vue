<template>
  <div class="arsip-unit-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-box-archive"></i>
      </div>

      <div>
        <h5>{{ unit?.nama_unit || 'Arsip Unit' }}</h5>
        <p>{{ currentFolder?.nama_folder || 'Root Folder' }}</p>
      </div>

      <button type="button" @click="loadContent(pagination.current_page || 1)">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="breadcrumb-scroll">
      <button type="button" @click="goRoot">
        <i class="fas fa-home"></i>
        Root
      </button>

      <button
        v-for="crumb in breadcrumbs"
        :key="crumb.id"
        type="button"
        @click="goBreadcrumb(crumb)"
      >
        {{ crumb.nama_folder }}
      </button>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="filter.keyword"
          type="text"
          placeholder="Cari dokumen..."
          @keyup.enter="updateFilter"
        >
      </div>

      <div class="filter-grid">
        <select v-model="filter.tipe_arsip" class="form-select form-select-sm">
          <option value="">Semua Tipe</option>
          <option value="berjangka">Berjangka</option>
          <option value="tidak_berjangka">Tidak Berjangka</option>
        </select>

        <select v-model="filter.status_aktif" class="form-select form-select-sm">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="tidak_aktif">Tidak Aktif</option>
        </select>
      </div>

      <div class="filter-actions">
        <button type="button" @click="updateFilter">Terapkan</button>
        <button type="button" class="light" @click="resetFilter">Reset</button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <div>
          <h6>Folder</h6>
          <small>{{ folders.length }} folder</small>
        </div>

        <button type="button" @click="openCreateFolder">
          <i class="fas fa-folder-plus"></i>
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat...</span>
      </div>

      <div v-else-if="folders.length === 0" class="empty-box">
        Belum ada folder.
      </div>

      <div v-else class="folder-scroll">
        <div
          v-for="folder in folders"
          :key="folder.id"
          class="folder-card"
        >
          <button type="button" class="folder-main" @click="openFolder(folder)">
            <i class="fas fa-folder"></i>
            <strong>{{ folder.nama_folder }}</strong>
            <span>{{ folder.deskripsi || 'Folder arsip' }}</span>
          </button>

          <div class="folder-actions">
            <button type="button" @click="openEditFolder(folder)">
              <i class="fas fa-pen"></i>
            </button>
            <button type="button" class="danger" @click="deleteFolder(folder)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="section-card documents-section">
      <div class="section-head">
        <div>
          <h6>Dokumen</h6>
          <small>{{ pagination.total || 0 }} dokumen</small>
        </div>

        <button type="button" @click="openUploadDocument">
          <i class="fas fa-cloud-upload-alt"></i>
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat dokumen...</span>
      </div>

      <div v-else-if="documents.length === 0" class="empty-box large">
        <i class="fas fa-file-circle-plus"></i>
        <strong>Belum ada dokumen</strong>
        <span>Upload dokumen pada folder ini.</span>
      </div>

      <div
        v-for="doc in documents"
        v-else
        :key="doc.id"
        class="doc-card"
      >
        <div class="doc-top">
          <div class="doc-icon">
            <i :class="fileIcon(doc)"></i>
          </div>

          <div class="doc-title">
            <h6>{{ doc.nama_dokumen }}</h6>
            <p>{{ doc.nomor_dokumen || '-' }}</p>
          </div>

          <span class="type-dot" :class="doc.tipe_arsip">
            {{ doc.tipe_arsip === 'berjangka' ? 'B' : 'TB' }}
          </span>
        </div>

        <div class="doc-meta">
          <span>
            <i class="fas fa-tag"></i>
            {{ doc.kategori || 'Tanpa kategori' }}
          </span>

          <span>
            <i class="fas fa-weight-hanging"></i>
            {{ formatFileSize(doc.file_size) }}
          </span>
        </div>

        <div v-if="doc.tipe_arsip === 'berjangka'" class="expire-box">
          <div>
            <span>Berakhir</span>
            <strong>{{ formatDate(doc.tanggal_berakhir) }}</strong>
          </div>

          <span class="badge" :class="statusDocumentClass(doc)">
            {{ documentStatusLabel(doc) }}
          </span>
        </div>

        <div class="doc-actions">
          <button type="button" class="primary" @click="viewDocument(doc)">
            <i class="fas fa-eye"></i>
            View
          </button>

          <button type="button" @click="openEditDocument(doc)">
            <i class="fas fa-pen"></i>
          </button>

          <button type="button" @click="openMoveDocument(doc)">
            <i class="fas fa-folder-tree"></i>
          </button>

          <button type="button" class="danger" @click="deleteDocument(doc)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-row">
        <button
          type="button"
          :disabled="pagination.current_page <= 1"
          @click="loadContent(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <span>{{ pagination.current_page }} / {{ pagination.last_page }}</span>

        <button
          type="button"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="loadContent(pagination.current_page + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal Folder -->
    <div v-if="folderModal" class="sheet-layer">
      <div class="bottom-sheet folder-sheet">
        <div class="sheet-head">
          <h6>{{ folderForm.id ? 'Edit Folder' : 'Tambah Folder' }}</h6>
          <button type="button" @click="closeFolderModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sheet-body">
          <label>Nama Folder</label>
          <input v-model="folderForm.nama_folder" type="text" class="form-control form-control-sm">

          <label>Deskripsi</label>
          <textarea v-model="folderForm.deskripsi" class="form-control form-control-sm" rows="3"></textarea>
        </div>

        <div class="sheet-foot">
          <button type="button" class="light" @click="closeFolderModal">Batal</button>
          <button type="button" :disabled="submitting" @click="submitFolder">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Dokumen -->
    <div v-if="documentModal" class="sheet-layer">
      <div class="bottom-sheet document-sheet">
        <div class="sheet-head">
          <h6>{{ documentForm.id ? 'Edit Dokumen' : 'Upload Dokumen' }}</h6>
          <button type="button" @click="closeDocumentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sheet-body">
          <label>Nama Dokumen</label>
          <input v-model="documentForm.nama_dokumen" type="text" class="form-control form-control-sm">

          <label>Nomor Dokumen</label>
          <input v-model="documentForm.nomor_dokumen" type="text" class="form-control form-control-sm">

          <label>Kategori</label>
          <input v-model="documentForm.kategori" type="text" class="form-control form-control-sm">

          <label>Tanggal Dokumen</label>
          <input v-model="documentForm.tanggal_dokumen" type="date" class="form-control form-control-sm">

          <label>Tipe Arsip</label>
          <select v-model="documentForm.tipe_arsip" class="form-select form-select-sm">
            <option value="tidak_berjangka">Tidak Berjangka</option>
            <option value="berjangka">Berjangka</option>
          </select>

          <template v-if="documentForm.tipe_arsip === 'berjangka'">
            <label>Tanggal Mulai</label>
            <input v-model="documentForm.tanggal_mulai" type="date" class="form-control form-control-sm">

            <label>Tanggal Berakhir</label>
            <input v-model="documentForm.tanggal_berakhir" type="date" class="form-control form-control-sm">

            <label class="check-row">
              <input v-model="documentForm.is_dokumen_aktif" type="checkbox">
              <span>Dokumen Aktif / Berjangka</span>
            </label>
          </template>

          <label>File {{ documentForm.id ? '(opsional)' : '' }}</label>
          <input
            type="file"
            class="form-control form-control-sm"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="onFileChange"
            >

          <label>Tag</label>
          <input v-model="documentForm.tag" type="text" class="form-control form-control-sm">

          <label>Deskripsi</label>
          <textarea v-model="documentForm.deskripsi" class="form-control form-control-sm" rows="3"></textarea>
        </div>

        <div class="sheet-foot">
          <button type="button" class="light" @click="closeDocumentModal">Batal</button>
          <button type="button" :disabled="submitting" @click="submitDocument">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Pindah -->
    <div v-if="moveModal" class="sheet-layer">
      <div class="bottom-sheet">
        <div class="sheet-head">
          <h6>Pindah Dokumen</h6>
          <button type="button" @click="closeMoveModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sheet-body">
          <p class="move-title">{{ selectedDocument?.nama_dokumen || '-' }}</p>

          <label>Tujuan Folder</label>
          <select v-model="moveForm.arsip_folder_id" class="form-select form-select-sm">
            <option value="">Root Folder</option>
            <option
              v-for="folder in flatFolders"
              :key="folder.id"
              :value="folder.id"
            >
              {{ folder.label }}
            </option>
          </select>
        </div>

        <div class="sheet-foot">
          <button type="button" class="light" @click="closeMoveModal">Batal</button>
          <button type="button" :disabled="submitting" @click="submitMoveDocument">
            Pindahkan
          </button>
        </div>
      </div>
    </div>

    <div class="floating-actions">
      <button type="button" @click="openCreateFolder">
        <i class="fas fa-folder-plus"></i>
      </button>

      <button type="button" class="upload" @click="openUploadDocument">
        <i class="fas fa-cloud-upload-alt"></i>
      </button>

      <button type="button" class="bulk" @click="openBulkUpload">
        <i class="fas fa-file-import"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  submitting: Boolean,
  unit: Object,
  currentFolder: Object,
  breadcrumbs: { type: Array, default: () => [] },
  folders: { type: Array, default: () => [] },
  documents: { type: Array, default: () => [] },
  pagination: Object,
  filter: Object,
  folderModal: Boolean,
  documentModal: Boolean,
  moveModal: Boolean,
  folderForm: Object,
  documentForm: Object,
  moveForm: Object,
  folderTree: { type: Array, default: () => [] },
  selectedFolder: Object,
  selectedDocument: Object,
  formatDate: Function,
  formatDateTime: Function,
  formatFileSize: Function,
  archiveTypeLabel: Function,
  statusDocumentClass: Function,
  loadContent: Function,
  openFolder: Function,
  goRoot: Function,
  goBreadcrumb: Function,
  updateFilter: Function,
  resetFilter: Function,
  openCreateFolder: Function,
  openEditFolder: Function,
  closeFolderModal: Function,
  submitFolder: Function,
  deleteFolder: Function,
  openUploadDocument: Function,
  openBulkUpload: Function,
  openEditDocument: Function,
  closeDocumentModal: Function,
  submitDocument: Function,
  deleteDocument: Function,
  openMoveDocument: Function,
  closeMoveModal: Function,
  submitMoveDocument: Function,
  viewDocument: Function,
  onFileChange: Function
})

const flatFolders = computed(() => {
  const result = []

  const walk = (items = [], level = 0) => {
    items.forEach((folder) => {
      result.push({
        id: folder.id,
        label: `${'— '.repeat(level)}${folder.nama_folder}`
      })

      if (folder.children?.length) {
        walk(folder.children, level + 1)
      }
    })
  }

  walk(props.folderTree || [])
  return result
})

const fileIcon = (doc) => {
  const name = String(doc.file_original_name || doc.file_name || '').toLowerCase()

  if (name.endsWith('.pdf')) return 'fas fa-file-pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'fas fa-file-word'
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'fas fa-file-excel'
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'fas fa-file-powerpoint'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'fas fa-file-image'

  return 'fas fa-file-lines'
}

const documentStatusLabel = (doc) => {
  if (doc.tipe_arsip !== 'berjangka') return 'Tidak Berjangka'

  const sisa = Number(doc.sisa_hari ?? 0)

  if (sisa < 0) return `${Math.abs(sisa)} hari lewat`
  if (sisa <= 30) return `${sisa} hari lagi`

  return 'Aktif'
}
</script>

<style scoped>
.arsip-unit-pwa {
  padding: 2px;
  padding-bottom: 90px;
}

.pwa-head,
.filter-card,
.section-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 .25rem .75rem rgba(15, 23, 42, .055);
}

.pwa-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.head-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pwa-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.pwa-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.pwa-head button {
  margin-left: auto;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: #2563eb;
}

.breadcrumb-scroll {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 2px 9px;
  margin-bottom: 2px;
}

.breadcrumb-scroll button {
  flex: 0 0 auto;
  border: 0;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 10.5px;
  font-weight: 900;
}

.search-box {
  height: 36px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box i {
  color: #94a3b8;
  font-size: 12px;
}

.search-box input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 750;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 8px;
}

.form-control-sm,
.form-select-sm {
  font-size: 12px;
  font-weight: 750;
  border-radius: 10px;
}

.filter-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 8px;
}

.filter-actions button,
.sheet-foot button {
  border: 0;
  border-radius: 11px;
  background: #2563eb;
  color: #fff;
  min-height: 34px;
  font-size: 11.5px;
  font-weight: 950;
}

.filter-actions button.light,
.sheet-foot button.light {
  background: #f1f5f9;
  color: #475569;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
}

.section-head h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.section-head small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 750;
}

.section-head button {
  width: 34px;
  height: 32px;
  border: 0;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
}

.state-box,
.empty-box {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
}

.empty-box.large {
  min-height: 120px;
  flex-direction: column;
  text-align: center;
}

.empty-box.large i {
  font-size: 24px;
  color: #94a3b8;
}

.empty-box.large strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.empty-box.large span {
  color: #94a3b8;
  font-size: 11px;
}

.folder-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.folder-card {
  min-width: 170px;
  border: 1px solid #edf2f7;
  border-radius: 15px;
  padding: 10px;
  background: #ffffff;
}

.folder-main {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 0;
}

.folder-main i {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #fff7ed;
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 7px;
}

.folder-main strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-main span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 8px;
}

.folder-actions button,
.doc-actions button {
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
}

.folder-actions button {
  width: 28px;
  height: 26px;
}

.folder-actions button.danger,
.doc-actions button.danger {
  background: #fee2e2;
  color: #dc2626;
}

.doc-card {
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 11px;
  margin-bottom: 9px;
  background: #ffffff;
}

.doc-top {
  display: flex;
  align-items: center;
  gap: 9px;
}

.doc-icon {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  background: #f8fafc;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-title {
  min-width: 0;
  flex: 1;
}

.doc-title h6 {
  margin: 0;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-title p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 750;
}

.type-dot {
  min-width: 32px;
  height: 24px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-dot.berjangka {
  background: #dcfce7;
  color: #15803d;
}

.type-dot.tidak_berjangka {
  background: #e5e7eb;
  color: #475569;
}

.doc-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 750;
}

.doc-meta span {
  background: #f8fafc;
  border-radius: 999px;
  padding: 4px 8px;
}

.expire-box {
  margin-top: 9px;
  padding: 8px;
  border-radius: 13px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expire-box span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.expire-box strong {
  color: #111827;
  font-size: 12px;
  font-weight: 950;
}

.doc-actions {
  margin-top: 9px;
  display: grid;
  grid-template-columns: 1fr 36px 36px 36px;
  gap: 6px;
}

.doc-actions button {
  min-height: 32px;
}

.doc-actions button.primary {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 950;
}

.pagination-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
}

.pagination-row button {
  width: 34px;
  height: 30px;
  border: 0;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
}

.pagination-row button:disabled {
  opacity: .45;
}

.pagination-row span {
  font-size: 11px;
  color: #64748b;
  font-weight: 900;
}

.floating-actions {
  position: fixed;
  right: 16px;
  bottom: 76px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.floating-actions button {
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 16px;
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .18);
}

.floating-actions button.upload {
  background: #2563eb;
  color: #ffffff;
}

.floating-actions button.bulk {
  background: #16a34a;
  color: #ffffff;
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 999999 !important;
  background: rgba(15, 23, 42, .58);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.bottom-sheet {
  width: 100%;
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  overflow: hidden;
  animation: sheetUp .18s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -18px 42px rgba(15, 23, 42, .22);
}

.folder-sheet {
  max-height: min(70dvh, 560px);
}

.document-sheet {
  height: calc(100dvh - 18px);
  max-height: calc(100dvh - 18px);
}

@keyframes sheetUp {
  from {
    transform: translateY(28px);
    opacity: .5;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sheet-head {
  flex: 0 0 auto;
  min-height: 58px;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-head h6 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.sheet-head button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: #f1f5f9;
  color: #475569;
  flex-shrink: 0;
  font-size: 17px;
}

.sheet-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 14px 16px 18px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.sheet-body label {
  display: block;
  margin: 10px 0 5px;
  color: #334155;
  font-size: 12px;
  font-weight: 900;
}

.sheet-body label:first-child {
  margin-top: 0;
}

.sheet-body .form-control,
.sheet-body .form-select {
  min-height: 44px;
  margin-bottom: 8px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 750;
}

.sheet-body textarea.form-control {
  min-height: 96px;
  resize: vertical;
}

.sheet-body input[type="file"] {
  min-height: 46px;
  padding-top: 9px;
}

.sheet-foot {
  flex: 0 0 auto;
  position: relative;
  z-index: 5;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  box-shadow: 0 -8px 20px rgba(15, 23, 42, .08);
}

.sheet-foot button {
  border: 0;
  border-radius: 13px;
  background: #2563eb;
  color: #ffffff;
  min-height: 44px;
  font-size: 13px;
  font-weight: 950;
}

.sheet-foot button.light {
  background: #f1f5f9;
  color: #475569;
}

.sheet-foot button:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.check-row {
  display: flex !important;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  padding: 10px 11px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 13px;
}

.check-row input {
  width: 16px;
  height: 16px;
  margin: 0;
  flex-shrink: 0;
}

.check-row span {
  font-size: 12px;
  color: #334155;
  font-weight: 850;
}

@media (max-height: 720px) {
  .folder-sheet {
    max-height: calc(100dvh - 80px);
  }

  .document-sheet {
    height: calc(100dvh - 8px);
    max-height: calc(100dvh - 8px);
  }

  .sheet-head {
    min-height: 52px;
    padding: 10px 14px;
  }

  .sheet-head button {
    width: 38px;
    height: 38px;
  }

  .sheet-body {
    padding: 11px 14px 14px;
  }

  .sheet-foot {
    padding: 10px 14px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }

  .sheet-foot button {
    min-height: 42px;
  }
}

.check-row input {
  width: 16px;
  height: 16px;
  margin: 0;
  flex-shrink: 0;
}

.check-row span {
  font-size: 12px;
  color: #334155;
  font-weight: 850;
}
</style>