<template>
  <div class="container-fluid riwayat-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Riwayat Nomor Surat</h3>
        <p class="page-subtitle">
          Log aktivitas penambahan, perubahan, upload massal, dan penonaktifan nomor surat.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-success btn-compact"
        :disabled="exporting"
        @click="$emit('export-excel')"
      >
        <i class="fas fa-file-excel me-1"></i>
        {{ exporting ? 'Mengekspor...' : 'Ekspor Excel' }}
      </button>
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
            <label class="compact-label">Aksi</label>
            <select
              class="form-select form-select-sm compact-input"
              :value="filter.aksi"
              @change="$emit('update-filter', { field: 'aksi', value: $event.target.value })"
            >
              <option
                v-for="item in actionOptions"
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
              placeholder="Nomor surat, pemohon, deskripsi..."
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
          <i class="fas fa-clock-rotate-left"></i>
          <span>Tabel Riwayat</span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary btn-compact"
          :disabled="loading"
          @click="$emit('change-page', pagination.current_page || 1)"
        >
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data riwayat...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          <i class="fas fa-inbox me-1"></i>
          Belum ada data riwayat.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="width: 130px;">Waktu</th>
                <th style="width: 95px;">Aksi</th>
                <th style="min-width: 210px;">No Surat</th>
                <th style="min-width: 130px;">Jenis</th>
                <th>Deskripsi</th>
                <th style="min-width: 150px;">Pemohon</th>
                <th style="min-width: 130px;">Perubahan</th>
                <th style="width: 72px;">Detail</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in list"
                :key="item.id"
              >
                <td>{{ formatDateTime(item.created_at) }}</td>

                <td>
                  <span class="badge action-badge" :class="actionClass(item.aksi)">
                    {{ actionLabel(item.aksi) }}
                  </span>
                </td>

                <td>
                  <div class="nomor-text">{{ item.nomor_surat || '-' }}</div>
                  <small class="text-muted">ID Log: {{ item.id }}</small>
                </td>

                <td>{{ item.label_jenis_surat || '-' }}</td>

                <td class="text-truncate-cell">
                  {{ item.deskripsi || '-' }}
                </td>

                <td>
                  <div class="fw-semibold">{{ item.nama_user || '-' }}</div>
                  <small class="text-muted">{{ item.username_user || '-' }}</small>
                </td>

                <td class="text-truncate-cell">
                  {{ compactChanges(item.changes) }}
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
        Riwayat menampilkan aktivitas create, update, upload massal, dan nonaktif nomor surat beserta user dan waktu kejadian.
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
              <i class="fas fa-clock-rotate-left me-2"></i>
              Detail Riwayat
            </h6>
            <small class="text-muted">
              {{ selectedLog?.nomor_surat || '-' }}
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
              <span>Aksi</span>
              <strong>{{ actionLabel(selectedLog?.aksi) }}</strong>
            </div>

            <div>
              <span>Jenis Surat</span>
              <strong>{{ selectedLog?.label_jenis_surat || '-' }}</strong>
            </div>

            <div>
              <span>Pemohon</span>
              <strong>{{ selectedLog?.nama_user || '-' }}</strong>
            </div>

            <div>
              <span>Username</span>
              <strong>{{ selectedLog?.username_user || '-' }}</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>{{ selectedLog?.role_user || '-' }}</strong>
            </div>

            <div>
              <span>Waktu</span>
              <strong>{{ formatDateTime(selectedLog?.created_at) }}</strong>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Deskripsi</label>
            <div class="description-box">
              {{ selectedLog?.deskripsi || '-' }}
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Detail Perubahan</label>

            <div
              v-if="changeItems(selectedLog?.changes).length === 0"
              class="description-box text-muted"
            >
              Tidak ada detail perubahan.
            </div>

            <div
              v-else
              class="table-responsive"
            >
              <table class="table table-sm table-bordered detail-table mb-0">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Sebelum</th>
                    <th>Sesudah</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="change in changeItems(selectedLog?.changes)"
                    :key="change.field"
                  >
                    <td class="fw-semibold">{{ change.label }}</td>
                    <td>{{ change.before }}</td>
                    <td>{{ change.after }}</td>
                  </tr>
                </tbody>
              </table>
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
  exporting: Boolean,
  filter: {
    type: Object,
    required: true
  },
  jenisOptions: {
    type: Array,
    default: () => []
  },
  actionOptions: {
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
  selectedLog: {
    type: Object,
    default: null
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  actionClass: {
    type: Function,
    required: true
  },
  actionLabel: {
    type: Function,
    required: true
  },
  compactChanges: {
    type: Function,
    required: true
  },
  changeItems: {
    type: Function,
    required: true
  },
  formatValue: {
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
  'open-detail',
  'close-detail'
])
</script>

<style scoped>
.riwayat-page {
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

.action-badge {
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
  width: min(850px, 100%);
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

.detail-table {
  font-size: 12px;
  background: #ffffff;
}

.json-box {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 9px;
  padding: 10px;
  font-size: 11px;
  max-height: 220px;
  overflow: auto;
  margin-bottom: 0;
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