<template>
  <div class="container-fluid laporan-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Arsip Perusahaan</div>
        <h3 class="page-title">Laporan Arsip</h3>
        <p class="page-subtitle">
          Rekap dokumen arsip berdasarkan unit, folder, tipe arsip, dan masa berlaku.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn btn-sm btn-outline-primary action-btn" :disabled="loading" @click="loadData(pagination.current_page || 1)">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>

        <button class="btn btn-sm btn-success action-btn" :disabled="exporting" @click="exportExcel">
          <i class="fas fa-file-excel me-1"></i>
          Excel
        </button>

        <button class="btn btn-sm btn-danger action-btn" :disabled="exporting" @click="exportPdf">
          <i class="fas fa-file-pdf me-1"></i>
          PDF
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <span>Total Dokumen</span>
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
        <span>Sudah Berakhir</span>
        <strong>{{ summary.sudah_berakhir || 0 }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="filter.keyword"
            type="text"
            placeholder="Cari nomor, nama dokumen, kategori, tag..."
            @keyup.enter="updateFilter"
          >
        </div>

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

        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm">

        <button class="btn btn-sm btn-primary" @click="updateFilter">
          Filter
        </button>

        <button class="btn btn-sm btn-light" @click="resetFilter">
          Reset
        </button>
      </div>
    </div>

    <div class="card report-card">
      <div class="card-head">
        <div>
          <h6>Detail Dokumen Arsip</h6>
          <small>{{ pagination.total || 0 }} dokumen ditemukan</small>
        </div>

        <span>{{ pagination.from || 0 }} - {{ pagination.to || 0 }}</span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat laporan...</span>
      </div>

      <div v-else-if="documents.length === 0" class="empty-state">
        <i class="fas fa-file-circle-xmark"></i>
        <strong>Tidak ada data</strong>
        <span>Ubah filter untuk menampilkan dokumen arsip.</span>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0 report-table">
          <thead>
            <tr>
              <th>Dokumen</th>
              <th>Unit / Folder</th>
              <th>Kategori</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th>Masa Berlaku</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td>
                <strong>{{ doc.nama_dokumen }}</strong>
                <small>{{ doc.nomor_dokumen || '-' }}</small>
              </td>

              <td>
                <strong>{{ doc.unit?.nama_unit || '-' }}</strong>
                <small>{{ doc.folder?.nama_folder || 'Root' }}</small>
              </td>

              <td>{{ doc.kategori || '-' }}</td>

              <td>
                <span class="type-pill">
                  {{ doc.tipe_arsip === 'berjangka' ? 'Berjangka' : 'Tidak Berjangka' }}
                </span>
              </td>

              <td>
                <strong>{{ formatDate(doc.tanggal_dokumen) }}</strong>
                <small>Upload: {{ formatDate(doc.created_at) }}</small>
              </td>

              <td>
                <strong>{{ formatDate(doc.tanggal_mulai) }}</strong>
                <small>s.d. {{ formatDate(doc.tanggal_berakhir) }}</small>
              </td>

              <td>
                <span class="status-pill" :class="doc.status_class">
                  {{ doc.status_label }}
                </span>
                <small v-if="doc.sisa_hari !== null && doc.sisa_hari !== undefined">
                  {{ doc.sisa_hari }} hari
                </small>
              </td>

              <td>
                <strong>{{ doc.file_original_name || '-' }}</strong>
                <small>{{ formatFileSize(doc.file_size) }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-row">
        <button
          :disabled="pagination.current_page <= 1"
          @click="loadData(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>

        <button
          :disabled="pagination.current_page >= pagination.last_page"
          @click="loadData(pagination.current_page + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
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

.head-actions {
  display: flex;
  gap: 7px;
  align-items: flex-start;
}

.action-btn {
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  padding: 6px 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.summary-card.warning {
  border-left-color: #f59e0b;
}

.summary-card.danger {
  border-left-color: #dc2626;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
}

.summary-card strong {
  display: block;
  margin-top: 4px;
  color: #111827;
  font-size: 22px;
  font-weight: 950;
}

.filter-card,
.report-card {
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
  grid-template-columns: minmax(240px, 1fr) 160px 160px 145px 145px 135px 135px 72px 72px;
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

.report-card {
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
  font-size: 24px;
  color: #94a3b8;
}

.empty-state strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.report-table {
  font-size: 12px;
}

.report-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.report-table tbody td {
  padding: 8px;
}

.report-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.report-table small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.type-pill,
.status-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
}

.type-pill {
  background: #eef2ff;
  color: #4f46e5;
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
</style>