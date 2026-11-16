<template>
  <div class="arsip-riwayat-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-clock-rotate-left"></i>
      </div>

      <div>
        <h5>Riwayat Arsip</h5>
        <p>{{ pagination.total || 0 }} aktivitas</p>
      </div>

      <button type="button" @click="loadData(pagination.current_page || 1)">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="filter.keyword"
          type="text"
          placeholder="Cari riwayat..."
          @keyup.enter="updateFilter"
        >
      </div>

      <div class="filter-grid">
        <select v-model="filter.arsip_unit_id" class="form-select form-select-sm">
          <option value="">Semua Unit</option>
          <option
            v-for="unit in options.units"
            :key="unit.id"
            :value="unit.id"
          >
            {{ unit.nama_unit }}
          </option>
        </select>

        <select v-model="filter.aksi" class="form-select form-select-sm">
          <option value="">Semua Aksi</option>
          <option
            v-for="action in options.actions"
            :key="action.value"
            :value="action.value"
          >
            {{ action.label }}
          </option>
        </select>
      </div>

      <div class="filter-grid">
        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm">
      </div>

      <div class="filter-actions">
        <button type="button" @click="updateFilter">Terapkan</button>
        <button type="button" class="light" @click="resetFilter">Reset</button>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat riwayat...</span>
    </div>

    <div v-else-if="logs.length === 0" class="empty-card">
      <i class="fas fa-clock-rotate-left"></i>
      <strong>Belum ada riwayat</strong>
      <span>Aktivitas arsip akan tampil di sini.</span>
    </div>

    <div
      v-for="log in logs"
      v-else
      :key="log.id"
      class="log-card"
      @click="openDetail(log)"
    >
      <div class="log-top">
        <span class="action-pill" :class="log.aksi_class">
          {{ log.aksi_label }}
        </span>

        <small>{{ formatDateTime(log.created_at) }}</small>
      </div>

      <h6>{{ log.document?.nama_dokumen || log.folder?.nama_folder || '-' }}</h6>

      <p>{{ log.deskripsi || '-' }}</p>

      <div class="log-meta">
        <span>
          <i class="fas fa-user"></i>
          {{ log.nama_user || '-' }}
        </span>

        <span>
          <i class="fas fa-building"></i>
          {{ log.unit?.nama_unit || '-' }}
        </span>
      </div>
    </div>

    <div v-if="pagination.last_page > 1" class="pagination-row">
      <button
        type="button"
        :disabled="pagination.current_page <= 1"
        @click="loadData(pagination.current_page - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ pagination.current_page }} / {{ pagination.last_page }}</span>

      <button
        type="button"
        :disabled="pagination.current_page >= pagination.last_page"
        @click="loadData(pagination.current_page + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div v-if="detailModal" class="sheet-layer">
      <div class="bottom-sheet">
        <div class="sheet-head">
          <div>
            <h6>Detail Riwayat</h6>
            <p>{{ selectedLog?.aksi_label || '-' }}</p>
          </div>

          <button type="button" @click="closeDetail">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sheet-body">
          <div class="info-grid">
            <div>
              <span>Waktu</span>
              <strong>{{ formatDateTime(selectedLog?.created_at) }}</strong>
            </div>

            <div>
              <span>User</span>
              <strong>{{ selectedLog?.nama_user || '-' }}</strong>
            </div>

            <div>
              <span>Unit</span>
              <strong>{{ selectedLog?.unit?.nama_unit || '-' }}</strong>
            </div>

            <div>
              <span>Folder</span>
              <strong>{{ selectedLog?.folder?.nama_folder || '-' }}</strong>
            </div>
          </div>

          <div class="sheet-section">
            <h6>Deskripsi</h6>
            <p>{{ selectedLog?.deskripsi || '-' }}</p>
          </div>

          <div class="sheet-section">
            <h6>Dokumen</h6>
            <p>{{ selectedLog?.document?.nama_dokumen || '-' }}</p>
          </div>

          <div class="sheet-section">
            <h6>Perubahan</h6>

            <div v-if="selectedLog?.changes && Object.keys(selectedLog.changes).length">
              <div
                v-for="(change, key) in selectedLog.changes"
                :key="key"
                class="change-card"
              >
                <strong>{{ key }}</strong>
                <span>Sebelum: {{ formatJsonValue(change.before) }}</span>
                <span>Sesudah: {{ formatJsonValue(change.after) }}</span>
              </div>
            </div>

            <p v-else>Tidak ada perubahan detail.</p>
          </div>

          <div class="sheet-section">
            <h6>Teknis</h6>
            <p>
              IP: {{ selectedLog?.ip_address || '-' }}
              <br>
              Username: {{ selectedLog?.username_user || '-' }}
            </p>
          </div>
        </div>

        <div class="sheet-foot">
          <button type="button" @click="closeDetail">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  logs: { type: Array, default: () => [] },
  pagination: Object,
  filter: Object,
  options: Object,
  selectedLog: Object,
  detailModal: Boolean,
  formatDateTime: Function,
  formatJsonValue: Function,
  loadData: Function,
  updateFilter: Function,
  resetFilter: Function,
  openDetail: Function,
  closeDetail: Function
})
</script>

<style scoped>
.arsip-riwayat-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.log-card {
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

.search-box input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 750;
}

.search-box i {
  color: #94a3b8;
  font-size: 12px;
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

.filter-actions button.light {
  background: #f1f5f9;
  color: #475569;
}

.state-card,
.empty-card {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
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

.log-card {
  cursor: pointer;
}

.log-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.log-top small {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.action-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.3px;
  font-weight: 950;
}

.action-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.action-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.action-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-pill.info {
  background: #e0f2fe;
  color: #0369a1;
}

.action-pill.secondary {
  background: #e5e7eb;
  color: #475569;
}

.log-card h6 {
  margin: 0;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.log-card p {
  margin: 4px 0 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.log-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 750;
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

.pagination-row span {
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 2120;
  background: rgba(15, 23, 42, .55);
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  width: 100%;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sheet-head {
  min-height: 54px;
  padding: 13px 15px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-head h6 {
  margin: 0;
  color: #111827;
  font-size: 14px;
  font-weight: 950;
}

.sheet-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.sheet-head button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
}

.sheet-body {
  padding: 13px 15px;
  overflow-y: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-grid > div,
.sheet-section p,
.change-card {
  background: #f8fafc;
  border-radius: 13px;
  padding: 9px;
}

.info-grid span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.info-grid strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
}

.sheet-section {
  margin-top: 12px;
}

.sheet-section h6 {
  margin-bottom: 6px;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.sheet-section p {
  color: #334155;
  font-size: 11.5px;
  font-weight: 750;
  margin: 0;
}

.change-card {
  margin-bottom: 7px;
}

.change-card strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  margin-bottom: 5px;
}

.change-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 750;
}

.sheet-foot {
  padding: 11px 15px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}
</style>