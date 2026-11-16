<template>
  <div class="container-fluid laporan-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Laporan Nomor Surat</h3>
        <p class="page-subtitle">
          Laporan pencatatan nomor surat berdasarkan jenis, tanggal, status, pemohon, perihal, dan tujuan.
        </p>
      </div>

      <div class="page-actions">
        <button
          type="button"
          class="btn btn-sm btn-success btn-compact"
          :disabled="exportingExcel"
          @click="$emit('export-excel')"
        >
          <i class="fas fa-file-excel me-1"></i>
          {{ exportingExcel ? 'Excel...' : 'Excel' }}
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger btn-compact"
          :disabled="exportingPdf"
          @click="$emit('export-pdf')"
        >
          <i class="fas fa-file-pdf me-1"></i>
          {{ exportingPdf ? 'PDF...' : 'PDF' }}
        </button>
      </div>
    </div>

    <div class="card compact-card mb-3">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-filter"></i>
          <span>Filter Data</span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-secondary btn-compact"
          @click="$emit('reset-filter')"
        >
          Reset
        </button>
      </div>

      <div class="compact-card-body">
        <div class="row g-2 align-items-end">
          <div class="col-xl-2 col-lg-3 col-md-6">
            <label class="compact-label">Status</label>
            <select
              class="form-select form-select-sm compact-input"
              :value="filter.status"
              @change="$emit('update-filter', { field: 'status', value: $event.target.value })"
            >
              <option
                v-for="item in statusOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="col-xl-2 col-lg-3 col-md-6">
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

          <div class="col-xl-2 col-lg-3 col-md-6">
            <label class="compact-label">Tanggal Mulai</label>
            <input
              type="date"
              class="form-control form-control-sm compact-input"
              :value="filter.tanggal_mulai"
              @change="$emit('update-filter', { field: 'tanggal_mulai', value: $event.target.value })"
            >
          </div>

          <div class="col-xl-2 col-lg-3 col-md-6">
            <label class="compact-label">Tanggal Selesai</label>
            <input
              type="date"
              class="form-control form-control-sm compact-input"
              :value="filter.tanggal_selesai"
              @change="$emit('update-filter', { field: 'tanggal_selesai', value: $event.target.value })"
            >
          </div>

          <div class="col-xl-3 col-lg-9 col-md-9">
            <label class="compact-label">Keyword</label>
            <input
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Nomor surat, perihal, tujuan, pemohon..."
              :value="filter.keyword"
              @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
              @keyup.enter="$emit('load-data')"
            >
          </div>

          <div class="col-xl-1 col-lg-3 col-md-3">
            <button
              type="button"
              class="btn btn-sm btn-primary w-100 btn-search"
              @click="$emit('load-data')"
            >
              Cari
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-file-lines"></i>
          <span>Tabel Laporan</span>
        </div>

        <div class="small-muted">
          Total {{ pagination.total || 0 }} data
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data laporan...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          <i class="fas fa-inbox me-1"></i>
          Belum ada data laporan.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="width: 105px;">Tanggal</th>
                <th style="min-width: 215px;">Nomor Surat</th>
                <th style="min-width: 130px;">Jenis</th>
                <th>Perihal</th>
                <th style="min-width: 150px;">Tujuan</th>
                <th style="min-width: 150px;">Pemohon</th>
                <th style="width: 95px;">Status</th>
                <th style="width: 72px;">Detail</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in list"
                :key="item.id"
              >
                <td>{{ formatDate(item.tanggal_surat) }}</td>

                <td>
                  <div class="nomor-text">{{ item.nomor_surat || '-' }}</div>
                  <small class="text-muted">
                    Input: {{ formatDateTime(item.created_at) }}
                  </small>
                </td>

                <td>{{ item.label_jenis_surat || '-' }}</td>

                <td class="text-truncate-cell">
                  {{ item.perihal || '-' }}
                </td>

                <td class="text-truncate-cell">
                  {{ item.tujuan || '-' }}
                </td>

                <td>
                  <div class="fw-semibold">{{ item.diambil_oleh || '-' }}</div>
                  <small class="text-muted">
                    User ID: {{ item.user_id || '-' }}
                  </small>
                </td>

                <td>
                  <span class="badge status-badge" :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary action-btn"
                    @click="$emit('open-detail', item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationCompact
          :pagination="pagination"
          :loading="loading"
          @change-page="$emit('change-page', $event)"
        />
      </div>

      <div class="compact-note">
        <i class="fas fa-info-circle me-1"></i>
        Laporan dapat difilter berdasarkan status, jenis surat, rentang tanggal surat, dan keyword. Ekspor mengikuti filter yang sedang digunakan.
      </div>
    </div>

    <div
      v-if="detailModal"
      class="modal-backdrop-custom"
    >
      <div class="detail-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">
              <i class="fas fa-file-lines me-2"></i>
              Detail Nomor Surat
            </h6>
            <small class="text-muted">
              {{ selectedData?.nomor_surat || '-' }}
            </small>
          </div>

          <button
            type="button"
            class="btn-close"
            @click="$emit('close-detail')"
          ></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-grid">
            <div>
              <span>Tanggal Surat</span>
              <strong>{{ formatDate(selectedData?.tanggal_surat) }}</strong>
            </div>

            <div>
              <span>Jenis Surat</span>
              <strong>{{ selectedData?.label_jenis_surat || '-' }}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{{ statusLabel(selectedData?.status) }}</strong>
            </div>

            <div>
              <span>Pemohon</span>
              <strong>{{ selectedData?.diambil_oleh || '-' }}</strong>
            </div>

            <div>
              <span>Waktu Input</span>
              <strong>{{ formatDateTime(selectedData?.created_at) }}</strong>
            </div>

            <div>
              <span>Waktu Update</span>
              <strong>{{ formatDateTime(selectedData?.updated_at) }}</strong>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Nomor Surat</label>
            <div class="description-box fw-bold">
              {{ selectedData?.nomor_surat || '-' }}
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Perihal</label>
            <div class="description-box">
              {{ selectedData?.perihal || '-' }}
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Tujuan</label>
            <div class="description-box">
              {{ selectedData?.tujuan || '-' }}
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Keterangan</label>
            <div class="description-box">
              {{ selectedData?.keterangan || '-' }}
            </div>
          </div>

          <div
            v-if="selectedData?.status !== 'Aktif'"
            class="mt-3"
          >
            <label class="compact-label">Informasi Nonaktif</label>
            <div class="description-box">
              <div><strong>Waktu:</strong> {{ formatDateTime(selectedData?.dibatalkan_at) }}</div>
              <div><strong>Alasan:</strong> {{ selectedData?.alasan_batal || '-' }}</div>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="$emit('close-detail')"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PaginationCompact from '../../../components/PaginationCompact.vue'

defineProps({
  loading: Boolean,
  exportingExcel: Boolean,
  exportingPdf: Boolean,
  filter: {
    type: Object,
    required: true
  },
  jenisOptions: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  list: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    required: true
  },
  detailModal: Boolean,
  selectedData: {
    type: Object,
    default: null
  },
  formatDate: {
    type: Function,
    required: true
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  statusClass: {
    type: Function,
    required: true
  },
  statusLabel: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-filter',
  'load-data',
  'change-page',
  'reset-filter',
  'export-excel',
  'export-pdf',
  'open-detail',
  'close-detail'
])
</script>

<style scoped>
.laporan-page {
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
  font-size: 22px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 2px;
}

.page-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
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

.compact-card-body {
  padding: 10px 12px;
  background: #ffffff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 900;
}

.header-title i {
  font-size: 13px;
}

.small-muted {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.btn-compact,
.btn-search {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 7px;
  padding: 4px 9px;
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

.compact-table {
  font-size: 12px;
}

.compact-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
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
  border-radius: 999px;
  padding: 4px 7px;
}

.action-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-truncate-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-loading,
.compact-empty {
  min-height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.compact-note {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  color: #475569;
  font-size: 11.5px;
  padding: 7px 12px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}

.detail-modal {
  width: min(820px, 100%);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.24);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-head,
.modal-foot {
  padding: 12px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-foot {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
  justify-content: flex-end;
}

.modal-body-custom {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid div,
.description-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 8px;
}

.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.detail-grid strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  word-break: break-word;
}

.description-box {
  font-size: 12px;
}

@media (max-width: 768px) {
  .page-head {
    align-items: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>