<template>
  <div class="pwa-laporan-page">
    <PwaPageHeader
      icon="fas fa-file-export"
      title="Laporan"
      subtitle="Laporan pencatatan nomor surat."
    />

    <div class="filter-card">
      <div class="filter-grid">
        <div>
          <label class="compact-label">Status</label>
          <select
            class="form-select form-select-sm"
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

        <div>
          <label class="compact-label">Jenis</label>
          <select
            class="form-select form-select-sm"
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
      </div>

      <div class="filter-grid mt-2">
        <div>
          <label class="compact-label">Mulai</label>
          <input
            type="date"
            class="form-control form-control-sm"
            :value="filter.tanggal_mulai"
            @change="$emit('update-filter', { field: 'tanggal_mulai', value: $event.target.value })"
          >
        </div>

        <div>
          <label class="compact-label">Selesai</label>
          <input
            type="date"
            class="form-control form-control-sm"
            :value="filter.tanggal_selesai"
            @change="$emit('update-filter', { field: 'tanggal_selesai', value: $event.target.value })"
          >
        </div>
      </div>

      <div class="mt-2">
        <label class="compact-label">Keyword</label>
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Nomor, perihal, tujuan, pemohon..."
          :value="filter.keyword"
          @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
          @keyup.enter="$emit('load-data')"
        >
      </div>

      <div class="action-grid mt-2">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="$emit('reset-filter')"
        >
          Reset
        </button>

        <button
          type="button"
          class="btn btn-sm btn-primary"
          @click="$emit('load-data')"
        >
          Tampilkan
        </button>
      </div>

      <div class="export-grid mt-2">
        <button
          type="button"
          class="btn btn-sm btn-success"
          :disabled="exportingExcel"
          @click="$emit('export-excel')"
        >
          <i class="fas fa-file-excel me-1"></i>
          {{ exportingExcel ? 'Excel...' : 'Excel' }}
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger"
          :disabled="exportingPdf"
          @click="$emit('export-pdf')"
        >
          <i class="fas fa-file-pdf me-1"></i>
          {{ exportingPdf ? 'PDF...' : 'PDF' }}
        </button>
      </div>
    </div>

    <div class="section-title">
      <span>Daftar Laporan</span>
      <small>{{ pagination.total || 0 }} data</small>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat laporan...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Belum ada data laporan.
    </div>

    <div v-else>
      <div
        v-for="item in list"
        :key="item.id"
        class="laporan-card"
      >
        <div class="card-top">
          <div>
            <h6>{{ item.nomor_surat || '-' }}</h6>
            <small>{{ item.label_jenis_surat || '-' }}</small>
          </div>

          <span class="badge" :class="statusClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </div>

        <div class="mini-info">
          <span>Tanggal Surat</span>
          <strong>{{ formatDate(item.tanggal_surat) }}</strong>
        </div>

        <div class="mini-info">
          <span>Perihal</span>
          <strong>{{ item.perihal || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Tujuan</span>
          <strong>{{ item.tujuan || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Pemohon</span>
          <strong>{{ item.diambil_oleh || '-' }}</strong>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary w-100 mt-2"
          @click="$emit('open-detail', item)"
        >
          <i class="fas fa-eye me-1"></i>
          Lihat Detail
        </button>
      </div>
    </div>

    <PaginationCompact
      :pagination="pagination"
      :loading="loading"
      @change-page="$emit('change-page', $event)"
    />

    <div
      v-if="detailModal"
      class="pwa-modal-backdrop"
    >
      <div class="pwa-detail-modal">
        <div class="modal-head">
          <div>
            <h6>Detail Nomor Surat</h6>
            <small>{{ selectedData?.nomor_surat || '-' }}</small>
          </div>

          <button
            type="button"
            class="btn-close"
            @click="$emit('close-detail')"
          ></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-mini">
            <span>Tanggal Surat</span>
            <strong>{{ formatDate(selectedData?.tanggal_surat) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Jenis Surat</span>
            <strong>{{ selectedData?.label_jenis_surat || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Status</span>
            <strong>{{ statusLabel(selectedData?.status) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Pemohon</span>
            <strong>{{ selectedData?.diambil_oleh || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Waktu Input</span>
            <strong>{{ formatDateTime(selectedData?.created_at) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Perihal</span>
            <strong>{{ selectedData?.perihal || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Tujuan</span>
            <strong>{{ selectedData?.tujuan || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Keterangan</span>
            <strong>{{ selectedData?.keterangan || '-' }}</strong>
          </div>

          <div
            v-if="selectedData?.status !== 'Aktif'"
            class="detail-mini"
          >
            <span>Informasi Nonaktif</span>
            <strong>
              {{ formatDateTime(selectedData?.dibatalkan_at) }}
              <br>
              {{ selectedData?.alasan_batal || '-' }}
            </strong>
          </div>
        </div>

        <div class="modal-foot">
          <button
            type="button"
            class="btn btn-sm btn-secondary w-100"
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
import PwaPageHeader from '../../../components/PwaPageHeader.vue'
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
.pwa-laporan-page {
  padding: 2px;
  padding-bottom: 78px;
}

.filter-card,
.laporan-card,
.loading-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.filter-grid,
.action-grid,
.export-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compact-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 2px 8px;
}

.section-title span {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.section-title small {
  font-size: 11px;
  color: #64748b;
  font-weight: 800;
}

.loading-card,
.empty-card {
  min-height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.card-top h6 {
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 1px;
  color: #111827;
}

.card-top small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.mini-info {
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
}

.mini-info:last-child {
  border-bottom: none;
}

.mini-info span {
  display: block;
  font-size: 10px;
  color: #64748b;
  font-weight: 800;
}

.mini-info strong {
  display: block;
  font-size: 12px;
  color: #111827;
  word-break: break-word;
}

.pwa-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999 !important;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.pwa-detail-modal {
  width: 100%;
  height: calc(100dvh - 18px);
  max-height: calc(100dvh - 18px);
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -18px 42px rgba(15, 23, 42, 0.22);
}

.modal-head {
  flex: 0 0 auto;
  min-height: 62px;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head h6 {
  margin-bottom: 2px;
  font-size: 15px;
  font-weight: 950;
  color: #111827;
}

.modal-head small {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.modal-head .btn-close {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background-color: #f1f5f9;
  opacity: 1;
  flex-shrink: 0;
}

.modal-body-custom {
  flex: 1 1 auto;
  min-height: 0;
  padding: 14px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f8fafc;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.modal-foot {
  flex: 0 0 auto;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #e5e7eb;
  border-bottom: none;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.08);
}

.modal-foot .btn {
  min-height: 44px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 900;
}

.detail-mini {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.detail-mini span {
  display: block;
  font-size: 11px;
  color: #64748b;
  font-weight: 850;
  margin-bottom: 4px;
}

.detail-mini strong {
  display: block;
  font-size: 13px;
  color: #111827;
  font-weight: 900;
  word-break: break-word;
  line-height: 1.4;
}

@media (max-height: 720px) {
  .pwa-detail-modal {
    height: calc(100dvh - 8px);
    max-height: calc(100dvh - 8px);
    border-radius: 18px 18px 0 0;
  }

  .modal-head {
    min-height: 54px;
    padding: 10px 14px;
  }

  .modal-head .btn-close {
    width: 38px;
    height: 38px;
  }

  .modal-body-custom {
    padding: 11px 14px;
  }

  .modal-foot {
    padding: 10px 14px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}
</style>