<template>
  <div class="container-fluid nomor-compact-page">
    <div class="card compact-card mb-3">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-plus-circle"></i>
          <span>Form Nomor Surat Keluar</span>
        </div>

        <div class="header-actions">
            <button
                type="button"
                class="btn btn-sm btn-outline-success btn-compact"
                :disabled="downloadingTemplate"
                @click="$emit('download-template')"
            >
                <i class="fas fa-file-excel me-1"></i>
                {{ downloadingTemplate ? 'Mengunduh...' : 'Template' }}
            </button>

            <button
                type="button"
                class="btn btn-sm btn-outline-primary btn-compact"
                @click="$emit('open-upload-modal')"
            >
                <i class="fas fa-upload me-1"></i>
                Upload Massal
            </button>

            <button
                type="button"
                class="btn btn-sm btn-outline-secondary btn-compact"
                @click="$emit('toggle-form')"
            >
                <i
                class="fas me-1"
                :class="showForm ? 'fa-chevron-up' : 'fa-chevron-down'"
                ></i>
                {{ showForm ? 'Tutup Form' : 'Buka Form' }}
            </button>
        </div>
      </div>

      <div v-if="showForm" class="compact-card-body">
        <div class="row g-2 align-items-end">
          <div class="col-xl-3 col-lg-4 col-md-6">
            <label class="compact-label">Jenis Surat</label>
            <select
              class="form-select form-select-sm compact-input"
              :value="form.jenis_surat"
              @change="$emit('update-form', { field: 'jenis_surat', value: $event.target.value })"
            >
              <option
                v-for="item in jenisOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="col-xl-2 col-lg-3 col-md-6">
            <label class="compact-label">Tanggal Surat</label>
            <input
              type="date"
              class="form-control form-control-sm compact-input"
              :value="form.tanggal_surat"
              @change="$emit('update-form', { field: 'tanggal_surat', value: $event.target.value })"
            >
          </div>

          <div class="col-xl-3 col-lg-5 col-md-6">
            <label class="compact-label">Perihal</label>
            <input
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Contoh: Permohonan data pegawai"
              :value="form.perihal"
              @input="$emit('update-form', { field: 'perihal', value: $event.target.value })"
            >
          </div>

          <div class="col-xl-3 col-lg-8 col-md-6">
            <label class="compact-label">Tujuan / Kepada</label>
            <input
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Contoh: Divisi Human Capital"
              :value="form.tujuan"
              @input="$emit('update-form', { field: 'tujuan', value: $event.target.value })"
            >
          </div>

          <div class="col-xl-1 col-lg-4 col-md-12">
            <button
              type="button"
              class="btn btn-sm btn-primary w-100 btn-submit-compact"
              :disabled="saving || loading"
              @click="$emit('submit')"
            >
              <i class="fas fa-save me-1"></i>
              {{ saving ? '...' : 'Ambil' }}
            </button>
          </div>

          <div class="col-12">
            <label class="compact-label">Keterangan</label>
            <textarea
              rows="2"
              class="form-control form-control-sm compact-input compact-textarea"
              placeholder="Keterangan tambahan jika diperlukan"
              :value="form.keterangan"
              @input="$emit('update-form', { field: 'keterangan', value: $event.target.value })"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="compact-card-header table-header">
        <div class="header-title">
          <i class="fas fa-table"></i>
          <span>Data Nomor Surat Terbaru</span>
        </div>

        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary btn-compact"
            @click="$emit('toggle-filter')"
          >
            <i class="fas fa-filter me-1"></i>
            Filter
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-primary btn-compact"
            :disabled="loading"
            @click="$emit('reload')"
          >
            <i class="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="showFilter" class="filter-panel">
          <div class="row g-2 align-items-end">
            <div class="col-lg-3 col-md-6">
              <label class="compact-label">Jenis Surat</label>
              <select
                class="form-select form-select-sm compact-input"
                :value="filter.jenis_surat"
                @change="$emit('update-filter', { field: 'jenis_surat', value: $event.target.value })"
              >
                <option value="">Semua Jenis</option>
                <option
                  v-for="item in jenisOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6">
              <label class="compact-label">Tanggal Mulai</label>
              <input
                type="date"
                class="form-control form-control-sm compact-input"
                :value="filter.tanggal_mulai"
                @change="$emit('update-filter', { field: 'tanggal_mulai', value: $event.target.value })"
              >
            </div>

            <div class="col-lg-2 col-md-6">
              <label class="compact-label">Tanggal Selesai</label>
              <input
                type="date"
                class="form-control form-control-sm compact-input"
                :value="filter.tanggal_selesai"
                @change="$emit('update-filter', { field: 'tanggal_selesai', value: $event.target.value })"
              >
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="compact-label">Keyword</label>
              <input
                type="text"
                class="form-control form-control-sm compact-input"
                placeholder="No surat, perihal, tujuan, pemohon..."
                :value="filter.keyword"
                @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
                @keyup.enter="$emit('reload')"
              >
            </div>

            <div class="col-lg-2 col-md-12">
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-primary w-100"
                  @click="$emit('reload')"
                >
                  Tampilkan
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="$emit('reset-filter')"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data nomor surat...</span>
        </div>

        <div v-else-if="recentList.length === 0" class="compact-empty">
          <i class="fas fa-inbox me-1"></i>
          Belum ada nomor surat yang diambil.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="width: 48px;">#No</th>
                <th style="min-width: 210px;">No Surat</th>
                <th style="min-width: 130px;">Jenis Surat</th>
                <th>Perihal</th>
                <th>Tujuan</th>
                <th style="min-width: 150px;">Pemohon</th>
                <th style="width: 90px;">Status</th>
                <th style="width: 110px;">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in recentList"
                :key="item.id || index"
              >
                <td class="text-muted">{{ index + 1 }}</td>

                <td>
                  <div class="nomor-text">{{ item.nomor_surat }}</div>
                  <small class="text-muted">
                    {{ formatDateTime(item.created_at) }}
                  </small>
                </td>

                <td>
                  <div class="fw-semibold">
                    {{ item.label_jenis_surat || item.jenis_surat }}
                  </div>
                  <small class="text-muted">
                    {{ formatDate(item.tanggal_surat_normalized || item.tanggal_surat) }}
                  </small>
                </td>
                <td>{{ item.perihal || '-' }}</td>
                <td>{{ item.tujuan || '-' }}</td>
                <td>{{ item.diambil_oleh || '-' }}</td>

                <td>
                  <span class="badge status-badge" :class="statusClass(item.status)">
                    {{ item.status || '-' }}
                  </span>
                </td>
                <td>
                  <div v-if="item.can_update || item.can_delete" class="d-flex gap-1">
                    <button
                      v-if="item.can_update"
                      type="button"
                      class="btn btn-sm btn-outline-warning action-btn"
                      title="Edit"
                      @click="$emit('open-edit-modal', item)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      v-if="item.can_delete"
                      type="button"
                      class="btn btn-sm btn-outline-danger action-btn"
                      title="Nonaktifkan"
                      @click="$emit('nonaktif-nomor-surat', item)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>

                  <span v-else class="text-muted small">
                    -
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="pagination.total > 0"
          class="pagination-footer"
        >
          <div class="pagination-info">
            Menampilkan
            <strong>{{ pagination.from || 0 }}</strong>
            -
            <strong>{{ pagination.to || 0 }}</strong>
            dari
            <strong>{{ pagination.total || 0 }}</strong>
            data
          </div>

          <div class="pagination-actions">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary page-btn"
              :disabled="pagination.current_page <= 1 || loading"
              @click="$emit('change-page', 1)"
            >
              <i class="fas fa-angles-left"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary page-btn"
              :disabled="pagination.current_page <= 1 || loading"
              @click="$emit('change-page', pagination.current_page - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <button
              v-for="page in pageNumbers"
              :key="page"
              type="button"
              class="btn btn-sm page-number-btn"
              :class="page === pagination.current_page ? 'btn-primary' : 'btn-outline-secondary'"
              :disabled="loading"
              @click="$emit('change-page', page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary page-btn"
              :disabled="pagination.current_page >= pagination.last_page || loading"
              @click="$emit('change-page', pagination.current_page + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary page-btn"
              :disabled="pagination.current_page >= pagination.last_page || loading"
              @click="$emit('change-page', pagination.last_page)"
            >
              <i class="fas fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="compact-note">
        <i class="fas fa-info-circle me-1"></i>
        Data terbaru tampil paling atas. Fitur filter, upload massal, dan preview upload akan ditambahkan pada tahap berikutnya.
      </div>
    </div>

    <div
      v-if="showUploadModal"
      class="upload-modal-backdrop"
    >
      <div class="upload-modal">
        <div class="upload-modal-header">
          <div>
            <h6 class="mb-0 fw-bold">
              <i class="fas fa-file-upload me-2"></i>
              Upload Massal Nomor Surat
            </h6>
            <small class="text-muted">
              Upload file Excel, preview data, lalu simpan jika seluruh data sudah benar.
            </small>
          </div>

          <button
            type="button"
            class="btn-close"
            @click="$emit('close-upload-modal')"
          ></button>
        </div>

        <div class="upload-modal-body">
          <div class="upload-box">
            <div class="row g-2 align-items-end">
              <div class="col-lg-7">
                <label class="compact-label">Pilih Dokumen Excel</label>
                <input
                  :key="uploadInputKey"
                  type="file"
                  class="form-control form-control-sm compact-input"
                  accept=".xlsx,.xls,.csv"
                  @change="$emit('file-change', $event)"
                >

                <small v-if="uploadFileName" class="text-muted">
                  File terpilih: <strong>{{ uploadFileName }}</strong>
                </small>
              </div>

              <div class="col-lg-5">
                <div class="d-flex justify-content-end gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="previewing"
                    @click="$emit('preview-import')"
                  >
                    <i class="fas fa-eye me-1"></i>
                    {{ previewing ? 'Memproses...' : 'Preview' }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="previewing || importing"
                    @click="$emit('cancel-import')"
                  >
                    <i class="fas fa-times me-1"></i>
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="previewData.length" class="preview-box mt-3">
            <div class="preview-summary">
              <span class="badge bg-light text-dark border">
                Total: {{ previewSummary.total }}
              </span>

              <span class="badge bg-success">
                Valid: {{ previewSummary.valid }}
              </span>

              <span class="badge bg-danger">
                Invalid: {{ previewSummary.invalid }}
              </span>
            </div>

            <div class="table-responsive preview-table-wrapper">
              <table class="table table-sm table-hover align-middle mb-0 compact-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">No.</th>
                    <th>Jenis Surat</th>
                    <th>Tanggal Surat</th>
                    <th>Perihal</th>
                    <th>Tujuan</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in previewData"
                    :key="item.row_number"
                  >
                    <td>{{ item.row_number-1 }}</td>
                    <td>{{ item.jenis_surat || '-' }}</td>
                    <td>{{ item.tanggal_surat_normalized || item.tanggal_surat || '-' }}</td>
                    <td>{{ item.perihal || '-' }}</td>
                    <td>{{ item.tujuan || '-' }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="item.is_valid ? 'bg-success' : 'bg-danger'"
                      >
                        {{ item.is_valid ? 'Valid' : 'Invalid' }}
                      </span>
                    </td>
                    <td>
                      <small class="text-danger">
                        {{ item.errors?.length ? item.errors.join(', ') : '-' }}
                      </small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="previewSummary.invalid > 0"
              class="alert alert-warning py-2 px-3 mt-2 mb-0 small"
            >
              <strong>Perhatian:</strong>
              Masih terdapat {{ previewSummary.invalid }} baris invalid.
              Perbaiki file Excel dan lakukan preview ulang sebelum menyimpan.
            </div>
          </div>

          <div v-else class="empty-preview">
            <i class="fas fa-file-excel"></i>
            <div>Belum ada data preview.</div>
            <small>Pilih file Excel lalu klik tombol Preview.</small>
          </div>
        </div>

        <div class="upload-modal-footer">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            :disabled="previewing || importing"
            @click="$emit('cancel-import')"
          >
            <i class="fas fa-times me-1"></i>
            Batal
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="importing ||!previewData.length ||previewSummary.invalid > 0"
            @click="$emit('store-import')"
          >
            <i class="fas fa-save me-1"></i>
            {{ importing ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showEditModal" class="upload-modal-backdrop">
    <div class="edit-modal">
      <div class="upload-modal-header">
        <div>
          <h6 class="mb-0 fw-bold">
            <i class="fas fa-edit me-2"></i>
            Edit Nomor Surat
          </h6>
          <small class="text-muted">
            Nomor surat tidak dapat diubah. Hanya perihal, tujuan, dan keterangan yang dapat diedit.
          </small>
        </div>

        <button
          type="button"
          class="btn-close"
          @click="$emit('close-edit-modal')"
        ></button>
      </div>

      <div class="upload-modal-body">
        <div class="mb-2">
          <label class="compact-label">Nomor Surat</label>
          <input
            type="text"
            class="form-control form-control-sm compact-input"
            :value="editForm.nomor_surat"
            readonly
          >
        </div>

        <div class="mb-2">
          <label class="compact-label">Perihal</label>
          <input
            type="text"
            class="form-control form-control-sm compact-input"
            :value="editForm.perihal"
            @input="$emit('update-edit-form', { field: 'perihal', value: $event.target.value })"
          >
        </div>

        <div class="mb-2">
          <label class="compact-label">Tujuan</label>
          <input
            type="text"
            class="form-control form-control-sm compact-input"
            :value="editForm.tujuan"
            @input="$emit('update-edit-form', { field: 'tujuan', value: $event.target.value })"
          >
        </div>

        <div>
          <label class="compact-label">Keterangan</label>
          <textarea
            rows="3"
            class="form-control form-control-sm compact-input"
            :value="editForm.keterangan"
            @input="$emit('update-edit-form', { field: 'keterangan', value: $event.target.value })"
          ></textarea>
        </div>
      </div>

      <div class="upload-modal-footer">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="updating"
          @click="$emit('close-edit-modal')"
        >
          Batal
        </button>

        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="updating"
          @click="$emit('submit-edit')"
        >
          <i class="fas fa-save me-1"></i>
          {{ updating ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  filter: {
    type: Object,
    required: true
  },
  editForm: {
    type: Object,
    required: true
  },
  jenisOptions: {
    type: Array,
    default: () => []
  },
  recentList: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0
    })
  },
  loading: Boolean,
  saving: Boolean,
  updating: Boolean,
  showForm: {
    type: Boolean,
    default: true
  },
  showFilter: {
    type: Boolean,
    default: false
  },
  showEditModal: {
    type: Boolean,
    default: false
  },
  showUploadModal: {
    type: Boolean,
    default: false
  },
  previewing: Boolean,
  importing: Boolean,
  downloadingTemplate: Boolean,
  uploadFileName: {
    type: String,
    default: ''
  },
  uploadInputKey: {
    type: Number,
    default: 0
  },
  previewData: {
    type: Array,
    default: () => []
  },
  previewSummary: {
    type: Object,
    default: () => ({
      total: 0,
      valid: 0,
      invalid: 0
    })
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  statusClass: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-form',
  'update-filter',
  'update-edit-form',
  'submit',
  'submit-edit',
  'open-edit-modal',
  'close-edit-modal',
  'nonaktif-nomor-surat',
  'reload',
  'change-page',
  'reset-filter',
  'toggle-form',
  'toggle-filter',
  'open-upload-modal',
  'close-upload-modal',
  'download-template',
  'file-change',
  'preview-import',
  'store-import',
  'cancel-import'
])

const pageNumbers = computed(() => {
  const current = props.pagination.current_page || 1
  const last = props.pagination.last_page || 1
  const pages = []

  let start = current - 2
  let end = current + 2

  if (start < 1) {
    start = 1
    end = Math.min(5, last)
  }

  if (end > last) {
    end = last
    start = Math.max(1, last - 4)
  }

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
})
</script>

<style scoped>
.nomor-compact-page {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.page-title {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 2px;
  color: #111827;
}

.page-subtitle {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 0;
}

.module-badge {
  background: #e7f1ff;
  color: #0d6efd;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 0.18rem 0.45rem rgba(0, 0, 0, 0.035);
  overflow: hidden;
}

.compact-card-header {
  min-height: 38px;
  padding: 7px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.header-title i {
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-state {
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 4px 8px;
}

.btn-compact {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 7px;
}

.filter-panel {
  padding: 9px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.compact-card-body {
  padding: 10px 12px 8px;
  background: #ffffff;
}

.compact-label {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.compact-input {
  font-size: 12px;
  min-height: 29px;
  border-radius: 7px;
}

.compact-textarea {
  min-height: 44px;
  resize: vertical;
}

.btn-submit-compact {
  font-size: 12px;
  font-weight: 800;
  min-height: 29px;
  border-radius: 7px;
}

.action-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-header {
  background: #ffffff;
}

.compact-table {
  font-size: 12px;
}

.compact-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
  border-bottom: 1px solid #d1d5db;
  padding: 7px 8px;
}

.compact-table tbody td {
  padding: 7px 8px;
  vertical-align: middle;
}

.nomor-text {
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
}

.status-badge {
  font-size: 10.5px;
  padding: 4px 7px;
  border-radius: 999px;
}

.compact-note {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  color: #475569;
  font-size: 11.5px;
  padding: 7px 12px;
}

.compact-loading,
.compact-empty {
  min-height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 12px;
}

@media (max-width: 768px) {
  .page-head {
    align-items: flex-start;
  }

  .page-title {
    font-size: 20px;
  }

  .module-badge {
    display: none;
  }
}

.upload-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.upload-modal {
  width: min(980px, 100%);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.24);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.upload-modal-header {
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  background: #ffffff;
}

.upload-modal-body {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.upload-modal-footer {
  padding: 10px 14px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.upload-box,
.preview-box,
.empty-preview {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  padding: 12px;
}

.preview-summary {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.preview-table-wrapper {
  max-height: 340px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.empty-preview {
  text-align: center;
  color: #6b7280;
  padding: 30px 12px;
}

.empty-preview i {
  font-size: 34px;
  color: #198754;
  margin-bottom: 8px;
}

.empty-preview div {
  font-weight: 800;
  color: #374151;
}

:global(.swal2-container) {
  z-index: 99999 !important;
}

@media (max-width: 768px) {
  .upload-modal-backdrop {
    align-items: flex-end;
    padding: 8px;
  }

  .upload-modal {
    max-height: 94vh;
    border-radius: 14px 14px 10px 10px;
  }

  .edit-modal {
    width: min(620px, 100%);
    max-height: 92vh;
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.24);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.pagination-footer {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  font-size: 11.5px;
  color: #64748b;
}

.pagination-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.page-btn,
.page-number-btn {
  min-width: 30px;
  height: 28px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 7px;
}

@media (max-width: 768px) {
  .pagination-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>