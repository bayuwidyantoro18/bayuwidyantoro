<template>
  <div class="pwa-riwayat-page">
    <PwaPageHeader
      icon="fas fa-clock-rotate-left"
      title="Riwayat"
      subtitle="Log aktivitas nomor surat."
    />

    <div class="filter-card">
      <div class="filter-grid">
        <div>
          <label class="compact-label">Aksi</label>
          <select
            class="form-select form-select-sm"
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
          placeholder="Nomor, pemohon, deskripsi..."
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

        <button
          type="button"
          class="btn btn-sm btn-success"
          :disabled="exporting"
          @click="$emit('export-excel')"
        >
          Excel
        </button>
      </div>
    </div>

    <div class="section-title">
      <span>Daftar Riwayat</span>
      <small>{{ pagination.total || 0 }} data</small>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat riwayat...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Belum ada data riwayat.
    </div>

    <div
      v-else
      class="riwayat-list"
    >
      <div
        v-for="item in list"
        :key="item.id"
        class="riwayat-card"
      >
        <div class="card-top">
          <div>
            <h6>{{ item.nomor_surat || '-' }}</h6>
            <small>{{ item.label_jenis_surat || '-' }}</small>
          </div>

          <span class="badge" :class="actionClass(item.aksi)">
            {{ actionLabel(item.aksi) }}
          </span>
        </div>

        <div class="mini-info">
          <span>Deskripsi</span>
          <strong>{{ item.deskripsi || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Pemohon</span>
          <strong>{{ item.nama_user || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Waktu</span>
          <strong>{{ formatDateTime(item.created_at) }}</strong>
        </div>

        <div class="mini-info">
          <span>Perubahan</span>
          <strong>{{ compactChanges(item.changes) }}</strong>
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
            <h6>Detail Riwayat</h6>
            <small>{{ selectedLog?.nomor_surat || '-' }}</small>
          </div>

          <button
            type="button"
            class="btn-close"
            @click="$emit('close-detail')"
          ></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-mini">
            <span>Aksi</span>
            <strong>{{ actionLabel(selectedLog?.aksi) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Pemohon</span>
            <strong>{{ selectedLog?.nama_user || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Username</span>
            <strong>{{ selectedLog?.username_user || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Role</span>
            <strong>{{ selectedLog?.role_user || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Waktu</span>
            <strong>{{ formatDateTime(selectedLog?.created_at) }}</strong>
          </div>

          <div class="change-box">
            <strong>Detail Perubahan</strong>

            <div
              v-if="changeItems(selectedLog?.changes).length === 0"
              class="text-muted small mt-2"
            >
              Tidak ada detail perubahan.
            </div>

            <div
              v-for="change in changeItems(selectedLog?.changes)"
              :key="change.field"
              class="change-item"
            >
              <span>{{ change.label }}</span>
              <small>Sebelum: {{ change.before }}</small>
              <small>Sesudah: {{ change.after }}</small>
            </div>
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
.pwa-riwayat-page {
  padding: 2px;
  padding-bottom: 78px;
}

.filter-card,
.riwayat-card,
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
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-grid {
  grid-template-columns: 0.8fr 1fr 0.8fr;
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

.detail-mini,
.change-box {
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
}

.change-box > strong {
  font-size: 13px;
  color: #111827;
  font-weight: 950;
}

.change-item {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
  margin-top: 8px;
}

.change-item span {
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: #111827;
}

.change-item small {
  display: block;
  color: #64748b;
  font-size: 11px;
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