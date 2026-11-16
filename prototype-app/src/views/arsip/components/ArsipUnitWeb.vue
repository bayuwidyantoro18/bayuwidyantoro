<template>
  <div class="container-fluid arsip-unit-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Arsip Perusahaan</div>
        <h3 class="page-title">{{ unit?.nama_unit || 'Unit Kerja' }}</h3>

        <div class="breadcrumb-row">
          <button type="button" @click="goRoot">
            <i class="fas fa-home"></i>
            Root
          </button>

          <template v-for="crumb in breadcrumbs" :key="crumb.id">
            <i class="fas fa-chevron-right separator"></i>
            <button type="button" @click="goBreadcrumb(crumb)">
              {{ crumb.nama_folder }}
            </button>
          </template>
        </div>
      </div>

      <div class="head-actions">
        <button
          type="button"
          class="btn btn-sm btn-light action-light"
          :disabled="loading"
          @click="loadContent(pagination.current_page || 1)"
        >
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary action-btn"
          @click="openCreateFolder"
        >
          <i class="fas fa-folder-plus me-1"></i>
          Folder
        </button>

        <button
          type="button"
          class="btn btn-sm btn-primary action-btn"
          @click="openUploadDocument"
        >
          <i class="fas fa-cloud-upload-alt me-1"></i>
          Upload
        </button>

        <button
            type="button"
            class="btn btn-sm btn-success action-btn"
            @click="openBulkUpload"
            >
            <i class="fas fa-file-import me-1"></i>
            Upload Massal
        </button>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-main">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="filter.keyword"
            type="text"
            placeholder="Cari nama dokumen, nomor, kategori, tag..."
            @keyup.enter="updateFilter"
          >
        </div>

        <select v-model="filter.tipe_arsip" class="form-select form-select-sm">
          <option value="">Semua Tipe</option>
          <option value="berjangka">Berjangka</option>
          <option value="tidak_berjangka">Tidak Berjangka</option>
        </select>

        <select v-model="filter.status_aktif" class="form-select form-select-sm">
          <option value="">Semua Status</option>
          <option value="aktif">Dokumen Aktif</option>
          <option value="tidak_aktif">Tidak Aktif</option>
        </select>

        <button type="button" class="btn btn-sm btn-primary" @click="updateFilter">
          Filter
        </button>

        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetFilter">
          Reset
        </button>
      </div>
    </div>

    <div class="content-grid">
      <div class="folder-panel">
        <div class="panel-head">
          <div>
            <h6>Folder</h6>
            <small>{{ currentFolder?.nama_folder || 'Root Folder' }}</small>
          </div>
          <span>{{ folders.length }}</span>
        </div>

        <div v-if="loading" class="state-box">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat folder...</span>
        </div>

        <div v-else-if="folders.length === 0" class="empty-state">
          <i class="fas fa-folder-open"></i>
          <strong>Belum ada folder</strong>
          <span>Buat folder untuk mengelompokkan dokumen.</span>
        </div>

        <div v-else class="folder-list">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-card"
          >
            <button type="button" class="folder-open" @click="openFolder(folder)">
              <div class="folder-icon">
                <i class="fas fa-folder"></i>
              </div>

              <div>
                <strong>{{ folder.nama_folder }}</strong>
                <span>{{ folder.deskripsi || 'Tidak ada deskripsi' }}</span>
              </div>
            </button>

            <div class="folder-actions">
              <button type="button" title="Edit folder" @click="openEditFolder(folder)">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" title="Hapus folder" class="danger" @click="deleteFolder(folder)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="document-panel">
        <div class="panel-head">
          <div>
            <h6>Dokumen Arsip</h6>
            <small>{{ pagination.total || 0 }} dokumen ditemukan</small>
          </div>
          <span>{{ documents.length }}</span>
        </div>

        <div v-if="loading" class="state-box large">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat dokumen...</span>
        </div>

        <div v-else-if="documents.length === 0" class="empty-state large">
          <i class="fas fa-file-circle-plus"></i>
          <strong>Belum ada dokumen</strong>
          <span>Upload dokumen baru pada folder ini.</span>
        </div>

        <div v-else class="table-responsive document-table-wrap">
          <table class="table table-sm table-hover align-middle mb-0 document-table">
            <thead>
              <tr>
                <th>Dokumen</th>
                <th style="width: 145px;">Tipe</th>
                <th style="width: 145px;">Masa Berlaku</th>
                <th style="width: 115px;">Ukuran</th>
                <th style="width: 165px;">Diupdate</th>
                <th style="width: 150px;" class="text-end">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="doc in documents" :key="doc.id">
                <td>
                  <div class="doc-name-cell">
                    <div class="doc-icon">
                      <i :class="fileIcon(doc)"></i>
                    </div>

                    <div>
                      <strong>{{ doc.nama_dokumen }}</strong>
                      <span>{{ doc.nomor_dokumen || '-' }}</span>
                      <small>{{ doc.kategori || 'Tanpa kategori' }}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="type-pill" :class="doc.tipe_arsip">
                    {{ archiveTypeLabel(doc.tipe_arsip) }}
                  </span>
                </td>

                <td>
                  <template v-if="doc.tipe_arsip === 'berjangka'">
                    <div class="date-range">
                      <strong>{{ formatDate(doc.tanggal_berakhir) }}</strong>
                      <span class="badge" :class="statusDocumentClass(doc)">
                        {{ documentStatusLabel(doc) }}
                      </span>
                    </div>
                  </template>

                  <span v-else class="muted-text">Tidak berjangka</span>
                </td>

                <td>
                  <span class="file-size">{{ formatFileSize(doc.file_size) }}</span>
                </td>

                <td>
                  <span class="muted-text">{{ formatDateTime(doc.updated_at) }}</span>
                </td>

                <td class="text-end">
                  <div class="row-actions">
                    <button type="button" class="view" title="View" @click="viewDocument(doc)">
                      <i class="fas fa-eye"></i>
                    </button>

                    <button type="button" title="Edit" @click="openEditDocument(doc)">
                      <i class="fas fa-pen"></i>
                    </button>

                    <button type="button" title="Pindah" @click="openMoveDocument(doc)">
                      <i class="fas fa-folder-tree"></i>
                    </button>

                    <button type="button" class="danger" title="Hapus" @click="deleteDocument(doc)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.last_page > 1" class="pagination-row">
          <button
            type="button"
            :disabled="pagination.current_page <= 1"
            @click="loadContent(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <span>
            Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
          </span>

          <button
            type="button"
            :disabled="pagination.current_page >= pagination.last_page"
            @click="loadContent(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Folder -->
    <div v-if="folderModal" class="modal-layer">
      <div class="modal-card small-modal">
        <div class="modal-head">
          <div>
            <h5>{{ folderForm.id ? 'Edit Folder' : 'Tambah Folder' }}</h5>
            <p>{{ currentFolder?.nama_folder || 'Root Folder' }}</p>
          </div>

          <button type="button" @click="closeFolderModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-custom">
          <label>Nama Folder</label>
          <input
            v-model="folderForm.nama_folder"
            type="text"
            class="form-control form-control-sm"
            placeholder="Contoh: PKS, Invoice, Legal, Tahun 2026"
          >

          <label>Deskripsi</label>
          <textarea
            v-model="folderForm.deskripsi"
            class="form-control form-control-sm"
            rows="3"
            placeholder="Keterangan folder"
          ></textarea>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeFolderModal">
            Batal
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="submitting"
            @click="submitFolder"
          >
            <i class="fas fa-save me-1"></i>
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Dokumen -->
    <div v-if="documentModal" class="modal-layer">
      <div class="modal-card document-modal">
        <div class="modal-head">
          <div>
            <h5>{{ documentForm.id ? 'Edit Dokumen' : 'Upload Dokumen' }}</h5>
            <p>{{ currentFolder?.nama_folder || 'Root Folder' }}</p>
          </div>

          <button type="button" @click="closeDocumentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-custom">
          <div class="form-grid">
            <div>
              <label>Nama Dokumen <span>*</span></label>
              <input v-model="documentForm.nama_dokumen" type="text" class="form-control form-control-sm">
            </div>

            <div>
              <label>Nomor Dokumen</label>
              <input v-model="documentForm.nomor_dokumen" type="text" class="form-control form-control-sm">
            </div>

            <div>
              <label>Kategori</label>
              <input v-model="documentForm.kategori" type="text" class="form-control form-control-sm">
            </div>

            <div>
              <label>Tanggal Dokumen</label>
              <input v-model="documentForm.tanggal_dokumen" type="date" class="form-control form-control-sm">
            </div>

            <div>
              <label>Tipe Arsip</label>
              <select v-model="documentForm.tipe_arsip" class="form-select form-select-sm">
                <option value="tidak_berjangka">Tidak Berjangka</option>
                <option value="berjangka">Berjangka</option>
              </select>
            </div>

            <div>
              <label>File {{ documentForm.id ? '(kosongkan jika tidak diganti)' : '*' }}</label>
              <input
                type="file"
                class="form-control form-control-sm"
                accept=".pdf,.jpg,.jpeg,.png"
                @change="onFileChange"
                >
            </div>

            <template v-if="documentForm.tipe_arsip === 'berjangka'">
              <div>
                <label>Tanggal Mulai <span>*</span></label>
                <input v-model="documentForm.tanggal_mulai" type="date" class="form-control form-control-sm">
              </div>

              <div>
                <label>Tanggal Berakhir <span>*</span></label>
                <input v-model="documentForm.tanggal_berakhir" type="date" class="form-control form-control-sm">
              </div>

              <div class="switch-box">
                <label class="switch-label">Status Dokumen</label>
                <label class="toggle-row">
                  <input v-model="documentForm.is_dokumen_aktif" type="checkbox">
                  <span></span>
                  <strong>{{ documentForm.is_dokumen_aktif ? 'Aktif / Berjangka' : 'Tidak Aktif' }}</strong>
                </label>
              </div>
            </template>

            <div class="full">
              <label>Tag</label>
              <input v-model="documentForm.tag" type="text" class="form-control form-control-sm" placeholder="Contoh: pks,vendor,2026">
            </div>

            <div class="full">
              <label>Deskripsi</label>
              <textarea v-model="documentForm.deskripsi" class="form-control form-control-sm" rows="3"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeDocumentModal">
            Batal
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="submitting"
            @click="submitDocument"
          >
            <i class="fas fa-save me-1"></i>
            Simpan Dokumen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Pindah -->
    <div v-if="moveModal" class="modal-layer">
      <div class="modal-card small-modal">
        <div class="modal-head">
          <div>
            <h5>Pindah Dokumen</h5>
            <p>{{ selectedDocument?.nama_dokumen || '-' }}</p>
          </div>

          <button type="button" @click="closeMoveModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-custom">
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

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeMoveModal">
            Batal
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="submitting"
            @click="submitMoveDocument"
          >
            <i class="fas fa-folder-tree me-1"></i>
            Pindahkan
          </button>
        </div>
      </div>
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
.arsip-unit-web {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.page-kicker {
  font-size: 10.5px;
  font-weight: 900;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.page-title {
  font-size: 22px;
  font-weight: 950;
  color: #111827;
  margin: 0 0 4px;
}

.breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: #94a3b8;
}

.breadcrumb-row button {
  border: 0;
  background: #f8fafc;
  color: #475569;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 800;
}

.separator {
  font-size: 9px;
}

.head-actions {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-btn,
.action-light {
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  padding: 6px 10px;
}

.filter-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.filter-main {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) 170px 170px 74px 74px;
  gap: 8px;
  align-items: center;
}

.search-box {
  height: 32px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  border-radius: 9px;
  padding: 0 10px;
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
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.form-select-sm,
.form-control-sm {
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}

.content-grid {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  gap: 12px;
}

.folder-panel,
.document-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.panel-head {
  min-height: 45px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-head h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.panel-head small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 750;
}

.panel-head > span {
  min-width: 28px;
  height: 24px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-box,
.empty-state {
  min-height: 150px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.state-box.large,
.empty-state.large {
  min-height: 280px;
}

.empty-state {
  flex-direction: column;
  text-align: center;
}

.empty-state i {
  width: 44px;
  height: 44px;
  border-radius: 15px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.empty-state strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.empty-state span {
  color: #94a3b8;
  font-size: 11.5px;
}

.folder-list {
  padding: 9px;
}

.folder-card {
  border: 1px solid #eef2f7;
  background: #ffffff;
  border-radius: 13px;
  padding: 8px;
  margin-bottom: 8px;
  transition: all .16s ease;
}

.folder-card:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
  transform: translateY(-1px);
}

.folder-open {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  text-align: left;
}

.folder-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fff7ed;
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.folder-open strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.folder-open span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  max-width: 245px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-actions,
.row-actions {
  display: flex;
  gap: 5px;
  justify-content: flex-end;
}

.folder-actions {
  margin-top: 6px;
}

.folder-actions button,
.row-actions button {
  width: 28px;
  height: 26px;
  border: 0;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
}

.folder-actions button:hover,
.row-actions button:hover {
  background: #e0edff;
  color: #2563eb;
}

.folder-actions button.danger:hover,
.row-actions button.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.row-actions button.view {
  background: #eff6ff;
  color: #2563eb;
}

.document-table-wrap {
  max-height: calc(100vh - 290px);
}

.document-table {
  font-size: 12px;
}

.document-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.3px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.document-table tbody td {
  padding: 8px;
}

.doc-name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 240px;
}

.doc-icon {
  width: 35px;
  height: 35px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-name-cell strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.doc-name-cell span,
.doc-name-cell small,
.muted-text {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.type-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.3px;
  font-weight: 900;
}

.type-pill.berjangka {
  background: #dcfce7;
  color: #15803d;
}

.type-pill.tidak_berjangka {
  background: #e5e7eb;
  color: #475569;
}

.date-range strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  margin-bottom: 3px;
}

.file-size {
  color: #334155;
  font-size: 11px;
  font-weight: 850;
}

.pagination-row {
  height: 42px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 12px;
}

.pagination-row button {
  width: 28px;
  height: 26px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  color: #475569;
}

.pagination-row button:disabled {
  opacity: .45;
}

.pagination-row span {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, .52);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.modal-card {
  width: min(760px, 96vw);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(15, 23, 42, .28);
}

.small-modal {
  width: min(460px, 94vw);
}

.document-modal {
  width: min(820px, 96vw);
}

.modal-head {
  min-height: 58px;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.modal-body-custom {
  padding: 14px;
  max-height: calc(100vh - 190px);
  overflow-y: auto;
}

.modal-body-custom label {
  color: #334155;
  font-size: 11px;
  font-weight: 900;
  margin: 8px 0 4px;
}

.modal-body-custom label span {
  color: #dc2626;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px 10px;
}

.form-grid .full {
  grid-column: 1 / -1;
}

.switch-box {
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.switch-label {
  margin-top: 0 !important;
}

.toggle-row {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-row input {
  display: none;
}

.toggle-row span {
  width: 38px;
  height: 21px;
  border-radius: 999px;
  background: #cbd5e1;
  position: relative;
}

.toggle-row span::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  transition: all .18s ease;
}

.toggle-row input:checked + span {
  background: #22c55e;
}

.toggle-row input:checked + span::after {
  left: 20px;
}

.toggle-row strong {
  color: #334155;
  font-size: 11px;
  font-weight: 850;
}

.modal-foot {
  padding: 11px 14px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .filter-main {
    grid-template-columns: 1fr 150px 150px 70px 70px;
  }
}
</style>