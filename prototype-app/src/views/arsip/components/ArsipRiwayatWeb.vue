<template>
  <div class="container-fluid arsip-riwayat-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Arsip Perusahaan</div>
        <h3 class="page-title">Riwayat Aktivitas Arsip</h3>
        <p class="page-subtitle">
          Monitoring seluruh proses yang dilakukan user pada folder dan dokumen arsip.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary action-btn"
        :disabled="loading"
        @click="loadData(pagination.current_page || 1)"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="filter.keyword"
            type="text"
            placeholder="Cari user, dokumen, folder, deskripsi..."
            @keyup.enter="updateFilter"
          >
        </div>

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

        <input
          v-model="filter.tanggal_mulai"
          type="date"
          class="form-control form-control-sm"
        >

        <input
          v-model="filter.tanggal_selesai"
          type="date"
          class="form-control form-control-sm"
        >

        <button type="button" class="btn btn-sm btn-primary" @click="updateFilter">
          Filter
        </button>

        <button type="button" class="btn btn-sm btn-light" @click="resetFilter">
          Reset
        </button>
      </div>
    </div>

    <div class="card riwayat-card">
      <div class="card-head">
        <div>
          <h6>Daftar Riwayat</h6>
          <small>{{ pagination.total || 0 }} aktivitas ditemukan</small>
        </div>

        <span>
          {{ pagination.from || 0 }} - {{ pagination.to || 0 }}
        </span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat riwayat...</span>
      </div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <i class="fas fa-clock-rotate-left"></i>
        <strong>Belum ada riwayat</strong>
        <span>Aktivitas arsip akan tampil di halaman ini.</span>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0 riwayat-table">
          <thead>
            <tr>
              <th style="width: 145px;">Waktu</th>
              <th style="width: 145px;">User</th>
              <th style="width: 150px;">Aksi</th>
              <th>Objek</th>
              <th>Unit / Folder</th>
              <th style="width: 110px;" class="text-end">Detail</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>
                <strong>{{ formatDateTime(log.created_at) }}</strong>
                <small>{{ log.ip_address || '-' }}</small>
              </td>

              <td>
                <strong>{{ log.nama_user || '-' }}</strong>
                <small>{{ log.role_user || log.username_user || '-' }}</small>
              </td>

              <td>
                <span class="action-pill" :class="log.aksi_class">
                  {{ log.aksi_label }}
                </span>
                <small>{{ log.aksi }}</small>
              </td>

              <td>
                <strong>{{ log.document?.nama_dokumen || log.folder?.nama_folder || '-' }}</strong>
                <small>{{ log.deskripsi || '-' }}</small>
              </td>

              <td>
                <strong>{{ log.unit?.nama_unit || '-' }}</strong>
                <small>{{ log.folder?.nama_folder || 'Root / Tidak ada folder' }}</small>
              </td>

              <td class="text-end">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary detail-btn"
                  @click="openDetail(log)"
                >
                  <i class="fas fa-eye me-1"></i>
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-row">
        <button
          type="button"
          :disabled="pagination.current_page <= 1"
          @click="loadData(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <span>
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        </span>

        <button
          type="button"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="loadData(pagination.current_page + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div v-if="detailModal" class="detail-layer">
      <div class="detail-card">
        <div class="detail-head">
          <div>
            <h5>Detail Riwayat</h5>
            <p>{{ selectedLog?.aksi_label || '-' }} - {{ formatDateTime(selectedLog?.created_at) }}</p>
          </div>

          <button type="button" @click="closeDetail">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-summary">
            <div>
              <span>User</span>
              <strong>{{ selectedLog?.nama_user || '-' }}</strong>
            </div>

            <div>
              <span>Aksi</span>
              <strong>{{ selectedLog?.aksi_label || '-' }}</strong>
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

          <div class="detail-section">
            <h6>Deskripsi</h6>
            <p>{{ selectedLog?.deskripsi || '-' }}</p>
          </div>

          <div class="detail-section">
            <h6>Dokumen</h6>
            <p>
              {{ selectedLog?.document?.nama_dokumen || '-' }}
              <br>
              <small>{{ selectedLog?.document?.nomor_dokumen || selectedLog?.document?.file_original_name || '-' }}</small>
            </p>
          </div>

          <div class="detail-section">
            <h6>Perubahan Data</h6>

            <div v-if="selectedLog?.changes && Object.keys(selectedLog.changes).length" class="changes-list">
              <div
                v-for="(change, key) in selectedLog.changes"
                :key="key"
                class="change-item"
              >
                <strong>{{ key }}</strong>
                <div>
                  <span>Sebelum: {{ formatJsonValue(change.before) }}</span>
                  <span>Sesudah: {{ formatJsonValue(change.after) }}</span>
                </div>
              </div>
            </div>

            <p v-else class="muted">Tidak ada perubahan detail.</p>
          </div>

          <div class="detail-section">
            <h6>Informasi Teknis</h6>
            <div class="technical-box">
              <div>
                <span>IP Address</span>
                <strong>{{ selectedLog?.ip_address || '-' }}</strong>
              </div>
              <div>
                <span>Username</span>
                <strong>{{ selectedLog?.username_user || '-' }}</strong>
              </div>
              <div class="full">
                <span>User Agent</span>
                <strong>{{ selectedLog?.user_agent || '-' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeDetail">
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
.arsip-riwayat-web {
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
  margin: 0 0 3px;
}

.page-subtitle {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  margin: 0;
}

.action-btn {
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  padding: 6px 10px;
}

.filter-card,
.riwayat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.filter-card {
  padding: 10px;
  margin-bottom: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(230px, 1fr) 180px 170px 135px 135px 72px 72px;
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

.riwayat-card {
  overflow: hidden;
}

.card-head {
  min-height: 45px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-head h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.card-head small,
.card-head span {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.state-box,
.empty-state {
  min-height: 280px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  flex-direction: column;
  text-align: center;
}

.empty-state i {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.empty-state strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.riwayat-table {
  font-size: 12px;
}

.riwayat-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.riwayat-table tbody td {
  padding: 8px;
}

.riwayat-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.riwayat-table small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.action-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
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

.detail-btn {
  border-radius: 8px;
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

.detail-layer {
  position: fixed;
  inset: 0;
  z-index: 2120;
  background: rgba(15, 23, 42, .58);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.detail-card {
  width: min(780px, 96vw);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(15, 23, 42, .34);
  display: flex;
  flex-direction: column;
}

.detail-head {
  min-height: 62px;
  padding: 13px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-head h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.detail-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.detail-head button {
  width: 33px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.detail-body {
  padding: 14px;
  overflow-y: auto;
}

.detail-summary,
.technical-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.detail-summary > div,
.technical-box > div {
  background: #f8fafc;
  border-radius: 12px;
  padding: 9px;
}

.detail-summary span,
.technical-box span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.detail-summary strong,
.technical-box strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  word-break: break-word;
}

.detail-section {
  margin-top: 13px;
}

.detail-section h6 {
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
  margin-bottom: 6px;
}

.detail-section p {
  background: #f8fafc;
  border-radius: 12px;
  padding: 9px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  margin: 0;
}

.changes-list {
  display: grid;
  gap: 7px;
}

.change-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 9px;
}

.change-item strong {
  display: block;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  margin-bottom: 5px;
}

.change-item span {
  display: block;
  color: #64748b;
  font-size: 10.8px;
  font-weight: 750;
  word-break: break-word;
}

.technical-box {
  grid-template-columns: repeat(2, 1fr);
}

.technical-box .full {
  grid-column: 1 / -1;
}

.muted {
  color: #94a3b8 !important;
}

.detail-foot {
  padding: 11px 15px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}
</style>