<template>
  <div class="laporan-pkwt-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-chart-bar"></i>
      </div>

      <div>
        <h5>Laporan PKWT</h5>
        <p>{{ laporan.length }} data laporan</p>
      </div>

      <button type="button" :disabled="loading" @click="loadLaporan">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="export-grid">
      <button type="button" class="excel" :disabled="isExportingExcel" @click="exportExcel">
        <i class="fas fa-file-excel"></i>
        {{ isExportingExcel ? 'Exporting' : 'Excel' }}
      </button>

      <button type="button" class="pdf" :disabled="isExportingPdf" @click="exportPdf">
        <i class="fas fa-file-pdf"></i>
        {{ isExportingPdf ? 'Exporting' : 'PDF' }}
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ summary.total || 0 }}</strong>
      </div>

      <div class="summary-card success">
        <span>Aktif</span>
        <strong>{{ summary.aktif || 0 }}</strong>
      </div>

      <div class="summary-card info">
        <span>Diperpanjang</span>
        <strong>{{ summary.diperpanjang || 0 }}</strong>
      </div>

      <div class="summary-card danger">
        <span>Berakhir</span>
        <strong>{{ summary.berakhir || 0 }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <select
          :value="filter.unit_kerja"
          class="form-select form-select-sm"
          @change="setFilter('unit_kerja', $event.target.value)"
        >
          <option value="">Semua Unit</option>
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
      </div>

      <div class="filter-grid">
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
      </div>

      <div class="filter-actions">
        <button type="button" @click="loadLaporan">Tampilkan</button>
        <button type="button" class="light" @click="resetFilter">Reset</button>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat laporan PKWT...</span>
    </div>

    <div v-else-if="laporan.length === 0" class="empty-card">
      <i class="fas fa-file-circle-xmark"></i>
      <strong>Data laporan tidak ditemukan</strong>
      <span>Ubah filter untuk menampilkan data laporan.</span>
    </div>

    <template v-else>
      <div
        v-for="item in paginatedLaporan"
        :key="item.id"
        class="report-card"
      >
        <div class="report-top">
          <span>{{ item.pegawai?.nip || '-' }}</span>

          <strong :class="statusClass(item.status)">
            {{ item.status || '-' }}
          </strong>
        </div>

        <h6>{{ item.pegawai?.nama || '-' }}</h6>
        <p>{{ item.nomor_kontrak || '-' }}</p>

        <div class="report-meta">
          <span>
            <i class="fas fa-briefcase"></i>
            {{ item.pegawai?.jabatan || '-' }}
          </span>

          <span>
            <i class="fas fa-building"></i>
            {{ item.pegawai?.unit_kerja || '-' }}
          </span>

          <span>
            <i class="fas fa-calendar-check"></i>
            {{ formatDate(item.tanggal_mulai) }} s.d. {{ formatDate(item.tanggal_berakhir) }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="totalPages > 1" class="pagination-row">
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ currentPage }} / {{ totalPages }}</span>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
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
  totalPages: Number,
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
.laporan-pkwt-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.report-card {
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
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 950;
}

.export-grid button.excel {
  background: #16a34a;
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
  min-width: 112px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 10px;
}

.summary-card.success { border-left-color: #16a34a; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.danger { border-left-color: #dc2626; }

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

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-bottom: 8px;
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

.report-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.report-top span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.report-top strong {
  border-radius: 999px;
  padding: 3px 7px;
  font-size: 10.3px;
  font-weight: 950;
}

.report-top strong.success {
  background: #dcfce7;
  color: #15803d;
}

.report-top strong.info {
  background: #e0f2fe;
  color: #0369a1;
}

.report-top strong.danger {
  background: #fee2e2;
  color: #dc2626;
}

.report-top strong.secondary {
  background: #e5e7eb;
  color: #475569;
}

.report-card h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.report-card p {
  margin: 4px 0 9px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.report-meta {
  display: grid;
  gap: 4px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 750;
}

.report-meta i {
  width: 14px;
  color: #94a3b8;
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
