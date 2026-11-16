<template>
  <div class="terminasi-pwa-page">
    <PwaPageHeader
      icon="fas fa-user-slash"
      title="Terminasi"
      subtitle="Data pegawai nonaktif dan keterangan terminasi."
    />

    <div class="summary-grid-pwa">
      <div class="summary-mini danger">
        <span>Total</span>
        <strong>{{ summary.total }}</strong>
      </div>
      <div class="summary-mini primary">
        <span>Internal</span>
        <strong>{{ summary.internal }}</strong>
      </div>
      <div class="summary-mini info">
        <span>Penugasan</span>
        <strong>{{ summary.penugasan }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          :value="filter.keyword"
          type="text"
          placeholder="Cari pegawai terminasi..."
          @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
        >
      </div>

      <div class="filter-grid mt-2">
        <select
          :value="filter.kategori_pegawai"
          class="form-select form-select-sm"
          @change="$emit('update-filter', { field: 'kategori_pegawai', value: $event.target.value })"
        >
          <option value="">Semua Kategori</option>
          <option value="Pegawai Internal">Internal</option>
          <option value="Pegawai Penugasan">Penugasan</option>
        </select>

        <select
          :value="filter.alasan_terminasi"
          class="form-select form-select-sm"
          @change="$emit('update-filter', { field: 'alasan_terminasi', value: $event.target.value })"
        >
          <option value="">Semua Alasan</option>
          <option value="Berakhir Kontrak">Berakhir Kontrak</option>
          <option value="Resign">Resign</option>
          <option value="Mengundurkan Diri">Mengundurkan Diri</option>
          <option value="Pensiun">Pensiun</option>
          <option value="Selesai Penugasan">Selesai Penugasan</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div class="filter-grid mt-2">
        <input
          :value="filter.tanggal_dari"
          type="date"
          class="form-control form-control-sm"
          @input="$emit('update-filter', { field: 'tanggal_dari', value: $event.target.value })"
        >

        <input
          :value="filter.tanggal_sampai"
          type="date"
          class="form-control form-control-sm"
          @input="$emit('update-filter', { field: 'tanggal_sampai', value: $event.target.value })"
        >
      </div>

      <div class="action-grid mt-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-filter')">
          Reset
        </button>

        <button type="button" class="btn btn-sm btn-primary" :disabled="loading" @click="$emit('load-data')">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <div class="section-title">
      <span>Daftar Terminasi</span>
      <small>{{ filteredPegawais.length }} data</small>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data...</span>
    </div>

    <div v-else-if="filteredPegawais.length === 0" class="empty-card">
      <i class="fas fa-user-slash"></i>
      <strong>Belum ada data terminasi</strong>
      <span>Pegawai nonaktif akan tampil di sini.</span>
    </div>

    <div v-else>
      <div
        v-for="pegawai in paginatedPegawais"
        :key="pegawai.id"
        class="terminasi-card"
      >
        <div class="card-top">
          <div>
            <h6>{{ pegawai.nama || '-' }}</h6>
            <small>{{ pegawai.nip || '-' }} · {{ pegawai.kategori_pegawai || '-' }}</small>
          </div>

          <span class="status-pill">Non Aktif</span>
        </div>

        <div class="mini-info">
          <span>Jabatan</span>
          <strong>{{ pegawai.jabatan || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Unit Kerja</span>
          <strong>{{ pegawai.unit_kerja || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Tanggal Terminasi</span>
          <strong>{{ formatDate(pegawai.tanggal_terminasi) }}</strong>
        </div>

        <div class="mini-info">
          <span>Alasan</span>
          <strong>{{ pegawai.alasan_terminasi || '-' }}</strong>
        </div>

        <button type="button" class="btn btn-sm btn-outline-primary w-100 mt-2" @click="$emit('open-detail', pegawai)">
          <i class="fas fa-eye me-1"></i>
          Lihat Detail
        </button>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination-row">
      <button type="button" :disabled="currentPage === 1" @click="$emit('change-page', currentPage - 1)">
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ currentPage }} / {{ totalPages }}</span>

      <button type="button" :disabled="currentPage === totalPages" @click="$emit('change-page', currentPage + 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div v-if="detailModal" class="pwa-modal-backdrop">
      <div class="pwa-detail-modal">
        <div class="modal-head">
          <div>
            <h6>Detail Terminasi</h6>
            <small>{{ selectedPegawai?.nip || '-' }}</small>
          </div>

          <button type="button" @click="$emit('close-detail')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-mini">
            <span>Nama</span>
            <strong>{{ selectedPegawai?.nama || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Kategori</span>
            <strong>{{ selectedPegawai?.kategori_pegawai || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Jabatan</span>
            <strong>{{ selectedPegawai?.jabatan || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Unit Kerja</span>
            <strong>{{ selectedPegawai?.unit_kerja || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Departemen</span>
            <strong>{{ selectedPegawai?.departemen || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Tanggal Masuk</span>
            <strong>{{ formatDate(selectedPegawai?.tanggal_masuk) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Tanggal Terminasi</span>
            <strong>{{ formatDate(selectedPegawai?.tanggal_terminasi) }}</strong>
          </div>

          <div class="detail-mini">
            <span>Alasan Terminasi</span>
            <strong>{{ selectedPegawai?.alasan_terminasi || '-' }}</strong>
          </div>

          <div class="detail-mini">
            <span>Keterangan</span>
            <strong>{{ selectedPegawai?.keterangan_terminasi || '-' }}</strong>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-secondary w-100" @click="$emit('close-detail')">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  loading: Boolean,
  pegawais: { type: Array, default: () => [] },
  filteredPegawais: { type: Array, default: () => [] },
  paginatedPegawais: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  currentPage: Number,
  perPage: Number,
  totalPages: Number,
  paginationPages: { type: Array, default: () => [] },
  selectedPegawai: { type: Object, default: null },
  detailModal: Boolean,
  summary: { type: Object, required: true },
  formatDate: { type: Function, required: true }
})

defineEmits([
  'load-data',
  'update-filter',
  'reset-filter',
  'change-page',
  'open-detail',
  'close-detail'
])
</script>

<style scoped>
.terminasi-pwa-page {
  padding: 2px;
  padding-bottom: 92px;
}

.summary-grid-pwa {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.summary-mini,
.filter-card,
.terminasi-card,
.loading-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.summary-mini {
  min-height: 64px;
  margin-bottom: 0;
  border-left: 4px solid #2563eb;
}

.summary-mini.danger { border-left-color: #dc2626; }
.summary-mini.primary { border-left-color: #2563eb; }
.summary-mini.info { border-left-color: #0284c7; }

.summary-mini span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
}

.summary-mini strong {
  display: block;
  color: #111827;
  font-size: 22px;
  font-weight: 950;
  margin-top: 3px;
}

.search-box {
  height: 38px;
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

.filter-grid,
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-control-sm,
.form-select-sm {
  font-size: 12px;
  font-weight: 750;
  border-radius: 10px;
  min-height: 34px;
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
  min-height: 74px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.empty-card {
  flex-direction: column;
  text-align: center;
}

.empty-card i {
  font-size: 24px;
  color: #94a3b8;
}

.empty-card strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.empty-card span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
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

.status-pill {
  align-self: flex-start;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 950;
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

.modal-head button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: #f1f5f9;
  color: #475569;
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
</style>
