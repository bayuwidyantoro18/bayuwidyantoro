<template>
  <div class="laporan-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-chart-pie"></i>
      </div>

      <div>
        <h5>Laporan Arsip</h5>
        <p>{{ pagination.total || 0 }} dokumen</p>
      </div>

      <button type="button" @click="loadData(pagination.current_page || 1)">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="export-grid">
      <button type="button" :disabled="exporting" @click="exportExcel">
        <i class="fas fa-file-excel"></i>
        Export Excel
      </button>

      <button type="button" class="pdf" :disabled="exporting" @click="exportPdf">
        <i class="fas fa-file-pdf"></i>
        Export PDF
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ summary.total_dokumen || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Berjangka</span>
        <strong>{{ summary.dokumen_berjangka || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Tidak Berjangka</span>
        <strong>{{ summary.dokumen_tidak_berjangka || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Aktif</span>
        <strong>{{ summary.dokumen_aktif || 0 }}</strong>
      </div>

      <div class="summary-card warning">
        <span>Akan Berakhir</span>
        <strong>{{ summary.akan_berakhir || 0 }}</strong>
      </div>

      <div class="summary-card danger">
        <span>Expired</span>
        <strong>{{ summary.sudah_berakhir || 0 }}</strong>
      </div>
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
        <select v-model="filter.arsip_unit_id" class="form-select form-select-sm">
          <option value="">Semua Unit</option>
          <option v-for="unit in options.units" :key="unit.id" :value="unit.id">
            {{ unit.nama_unit }}
          </option>
        </select>

        <select v-model="filter.arsip_folder_id" class="form-select form-select-sm">
          <option value="">Semua Folder</option>
          <option v-for="folder in options.folders" :key="folder.id" :value="folder.id">
            {{ folder.nama_folder }}
          </option>
        </select>
      </div>

      <div class="filter-grid">
        <select v-model="filter.tipe_arsip" class="form-select form-select-sm">
          <option value="">Semua Tipe</option>
          <option v-for="item in options.tipe_arsip" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>

        <select v-model="filter.status_dokumen" class="form-select form-select-sm">
          <option value="">Semua Status</option>
          <option v-for="item in options.status_dokumen" :key="item.value" :value="item.value">
            {{ item.label }}
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
      <span>Memuat laporan...</span>
    </div>

    <div v-else-if="documents.length === 0" class="empty-card">
      <i class="fas fa-file-circle-xmark"></i>
      <strong>Tidak ada data</strong>
      <span>Ubah filter untuk menampilkan laporan.</span>
    </div>

    <template v-else>
      <div v-for="doc in documents" :key="doc.id" class="doc-card">
        <div class="doc-top">
          <span class="status-pill" :class="doc.status_class">
            {{ doc.status_label }}
          </span>

          <small>{{ formatDate(doc.tanggal_dokumen) }}</small>
        </div>

        <h6>{{ doc.nama_dokumen }}</h6>
        <p>{{ doc.nomor_dokumen || '-' }}</p>

        <div class="doc-meta">
          <span>
            <i class="fas fa-building"></i>
            {{ doc.unit?.nama_unit || '-' }}
          </span>

          <span>
            <i class="fas fa-folder"></i>
            {{ doc.folder?.nama_folder || 'Root' }}
          </span>

          <span>
            <i class="fas fa-file"></i>
            {{ doc.file_original_name || '-' }}
          </span>

          <span>
            <i class="fas fa-database"></i>
            {{ formatFileSize(doc.file_size) }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="pagination.last_page > 1" class="pagination-row">
      <button
        :disabled="pagination.current_page <= 1"
        @click="loadData(pagination.current_page - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ pagination.current_page }} / {{ pagination.last_page }}</span>

      <button
        :disabled="pagination.current_page >= pagination.last_page"
        @click="loadData(pagination.current_page + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  exporting: Boolean,
  summary: Object,
  documents: { type: Array, default: () => [] },
  pagination: Object,
  filter: Object,
  options: Object,
  formatDate: Function,
  formatFileSize: Function,
  loadData: Function,
  updateFilter: Function,
  resetFilter: Function,
  exportExcel: Function,
  exportPdf: Function
})
</script>

<style scoped>
.laporan-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.doc-card {
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

.export-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.export-grid button {
  min-height: 38px;
  border: 0;
  border-radius: 13px;
  background: #16a34a;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 950;
}

.export-grid button.pdf {
  background: #dc2626;
}

.summary-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.summary-card {
  min-width: 118px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 10px;
}

.summary-card.warning {
  border-left-color: #f59e0b;
}

.summary-card.danger {
  border-left-color: #dc2626;
}

.summary-card span {
  color: #64748b;
  font-size: 10.3px;
  font-weight: 900;
}

.summary-card strong {
  display: block;
  color: #111827;
  font-size: 20px;
  font-weight: 950;
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

.filter-actions button {
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

.doc-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.doc-top small {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.status-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.3px;
  font-weight: 950;
}

.status-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.status-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.status-pill.secondary {
  background: #e5e7eb;
  color: #475569;
}

.doc-card h6 {
  margin: 0;
  color: #111827;
  font-size: 12.5px;
  font-weight: 950;
}

.doc-card p {
  margin: 4px 0 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.doc-meta {
  display: grid;
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
</style>