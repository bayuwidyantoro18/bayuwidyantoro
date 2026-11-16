<template>
  <div class="container-fluid laporan-pkwt-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Laporan PKWT</h3>
        <p class="page-subtitle">
          Rekap laporan kontrak pegawai berdasarkan unit kerja, status PKWT, dan periode tanggal berakhir.
        </p>
      </div>

      <div class="head-actions">
        <button
          type="button"
          class="btn btn-sm btn-outline-primary action-btn"
          :disabled="loading"
          @click="loadLaporan"
        >
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>

        <button
          type="button"
          class="btn btn-sm btn-success action-btn"
          :disabled="isExportingExcel"
          @click="exportExcel"
        >
          <i class="fas fa-file-excel me-1"></i>
          {{ isExportingExcel ? 'Exporting...' : 'Excel' }}
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger action-btn"
          :disabled="isExportingPdf"
          @click="exportPdf"
        >
          <i class="fas fa-file-pdf me-1"></i>
          {{ isExportingPdf ? 'Exporting...' : 'PDF' }}
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card primary">
        <span>Total Data</span>
        <strong>{{ summary.total || 0 }}</strong>
        <i class="fas fa-file-contract"></i>
      </div>

      <div class="summary-card success">
        <span>Aktif</span>
        <strong>{{ summary.aktif || 0 }}</strong>
        <i class="fas fa-check-circle"></i>
      </div>

      <div class="summary-card info">
        <span>Diperpanjang</span>
        <strong>{{ summary.diperpanjang || 0 }}</strong>
        <i class="fas fa-sync-alt"></i>
      </div>

      <div class="summary-card danger">
        <span>Berakhir</span>
        <strong>{{ summary.berakhir || 0 }}</strong>
        <i class="fas fa-times-circle"></i>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <select
          :value="filter.unit_kerja"
          class="form-select form-select-sm"
          @change="setFilter('unit_kerja', $event.target.value)"
        >
          <option value="">Semua Unit Kerja</option>
          <option
            v-for="unit in unitKerjaOptions"
            :key="unit"
            :value="unit"
          >
            {{ unit }}
          </option>
        </select>

        <select
          :value="filter.status"
          class="form-select form-select-sm"
          @change="setFilter('status', $event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Diperpanjang">Diperpanjang</option>
          <option value="Berakhir">Berakhir</option>
        </select>

        <input
          :value="filter.tanggal_dari"
          type="date"
          class="form-control form-control-sm"
          @input="setFilter('tanggal_dari', $event.target.value)"
        >

        <input
          :value="filter.tanggal_sampai"
          type="date"
          class="form-control form-control-sm"
          @input="setFilter('tanggal_sampai', $event.target.value)"
        >

        <button type="button" class="btn btn-sm btn-primary" @click="loadLaporan">
          Tampilkan
        </button>

        <button type="button" class="btn btn-sm btn-light" @click="resetFilter">
          Reset
        </button>
      </div>
    </div>

    <div class="card report-card">
      <div class="card-head">
        <div>
          <h6>Detail Laporan PKWT</h6>
          <small>Menampilkan {{ laporan.length }} data laporan PKWT</small>
        </div>

        <span>Halaman {{ currentPage }} dari {{ totalPages || 1 }}</span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat laporan PKWT...</span>
      </div>

      <div v-else-if="laporan.length === 0" class="empty-state">
        <i class="fas fa-file-circle-xmark"></i>
        <strong>Data laporan tidak ditemukan</strong>
        <span>Ubah filter untuk menampilkan data laporan PKWT.</span>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0 report-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th style="width: 120px;">NIP</th>
              <th>Nama Pegawai</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Nomor Kontrak</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Berakhir</th>
              <th style="width: 120px;">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in paginatedLaporan" :key="item.id">
              <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>
                <strong>{{ item.pegawai?.nip || '-' }}</strong>
              </td>
              <td>
                <strong>{{ item.pegawai?.nama || '-' }}</strong>
                <small>{{ item.pegawai?.nik || '-' }}</small>
              </td>
              <td>{{ item.pegawai?.jabatan || '-' }}</td>
              <td>
                <strong>{{ item.pegawai?.unit_kerja || '-' }}</strong>
                <small>{{ item.pegawai?.lokasi_kerja || '-' }}</small>
              </td>
              <td>{{ item.nomor_kontrak || '-' }}</td>
              <td>{{ formatDate(item.tanggal_mulai) }}</td>
              <td>{{ formatDate(item.tanggal_berakhir) }}</td>
              <td>
                <span class="status-pill" :class="statusClass(item.status)">
                  {{ item.status || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination-row">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="changePage(1)"
        >
          <i class="fas fa-angles-left"></i>
        </button>

        <button
          type="button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in paginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: currentPage === page }"
          @click="page !== '...' && changePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="changePage(totalPages)"
        >
          <i class="fas fa-angles-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  isExportingExcel: Boolean,
  isExportingPdf: Boolean,
  laporan: { type: Array, default: () => [] },
  paginatedLaporan: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({}) },
  filter: { type: Object, default: () => ({}) },
  unitKerjaOptions: { type: Array, default: () => [] },
  currentPage: Number,
  perPage: Number,
  totalPages: Number,
  paginationPages: { type: Array, default: () => [] },
  formatDate: Function,
  setFilter: Function,
  loadLaporan: Function,
  resetFilter: Function,
  changePage: Function,
  exportExcel: Function,
  exportPdf: Function
})

const statusClass = (status) => {
  return {
    Aktif: 'success',
    Diperpanjang: 'info',
    Berakhir: 'danger'
  }[status] || 'secondary'
}
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
  flex-wrap: wrap;
  gap: 7px;
  justify-content: flex-end;
}

.action-btn {
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  padding: 6px 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  position: relative;
  min-height: 88px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 12px;
  overflow: hidden;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.summary-card.success { border-left-color: #16a34a; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.danger { border-left-color: #dc2626; }

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
}

.summary-card strong {
  display: block;
  margin-top: 5px;
  color: #111827;
  font-size: 24px;
  font-weight: 950;
}

.summary-card i {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #e2e8f0;
  font-size: 31px;
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
  grid-template-columns: minmax(240px, 1fr) 170px 145px 145px 95px 74px;
  gap: 8px;
  align-items: center;
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
  min-height: 240px;
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

.status-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
}

.status-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.info {
  background: #e0f2fe;
  color: #0369a1;
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
  min-height: 42px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 12px;
}

.pagination-row button {
  min-width: 28px;
  height: 27px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  color: #475569;
  font-size: 11px;
  font-weight: 850;
}

.pagination-row button.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pagination-row button:disabled {
  opacity: .45;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
