<template>
  <div class="container-fluid pegawai-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Database Pegawai</h3>
        <p class="page-subtitle">
          Kelola data pegawai, identitas, unit kerja, status pegawai, import, dan export database pegawai.
        </p>
      </div>

      <div class="head-actions">
        <button type="button" class="btn btn-sm btn-primary action-btn" @click="tambahPegawai">
          <i class="fas fa-plus me-1"></i>
          Tambah
        </button>

        <button type="button" class="btn btn-sm btn-success action-btn" @click="openImportModal">
          <i class="fas fa-file-excel me-1"></i>
          Upload Excel
        </button>

        <button type="button" class="btn btn-sm btn-outline-success action-btn" @click="downloadTemplateExcel">
          <i class="fas fa-download me-1"></i>
          Template
        </button>

        <button type="button" class="btn btn-sm btn-outline-success action-btn" @click="exportPegawaiExcel">
          <i class="fas fa-file-export me-1"></i>
          Export
        </button>

        <button type="button" class="btn btn-sm btn-outline-primary action-btn" :disabled="loading" @click="loadPegawai">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card primary">
        <span>Total Pegawai</span>
        <strong>{{ pegawais.length }}</strong>
        <i class="fas fa-users"></i>
      </div>

      <div class="summary-card success">
        <span>Pegawai Aktif</span>
        <strong>{{ totalAktif }}</strong>
        <i class="fas fa-user-check"></i>
      </div>

      <div class="summary-card danger">
        <span>Non Aktif</span>
        <strong>{{ totalNonAktif }}</strong>
        <i class="fas fa-user-times"></i>
      </div>

      <div class="summary-card info">
        <span>Unit Kerja</span>
        <strong>{{ unitKerjaOptions.length }}</strong>
        <i class="fas fa-building"></i>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            :value="searchPegawai"
            type="text"
            placeholder="Cari NIP, nama, atau jabatan..."
            @input="setSearchPegawai($event.target.value)"
            @keyup.enter="changePegawaiPage(1)"
          >
        </div>

        <select
          :value="filterUnitKerjaPegawai"
          class="form-select form-select-sm"
          @change="setFilterUnitKerjaPegawai($event.target.value)"
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
          :value="filterStatusPegawai"
          class="form-select form-select-sm"
          @change="setFilterStatusPegawai($event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Non Aktif">Non Aktif</option>
        </select>

        <button type="button" class="btn btn-sm btn-light" @click="resetFilterPegawai">
          Reset
        </button>
      </div>
    </div>

    <div class="card employee-card">
      <div class="card-head">
        <div>
          <h6>Daftar Pegawai</h6>
          <small>Menampilkan {{ filteredPegawais.length }} dari {{ pegawais.length }} data pegawai</small>
        </div>

        <span>
          Halaman {{ pegawaiCurrentPage }} dari {{ pegawaiTotalPages || 1 }}
        </span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data pegawai...</span>
      </div>

      <div v-else-if="filteredPegawais.length === 0" class="empty-state">
        <i class="fas fa-users-slash"></i>
        <strong>Data pegawai tidak ditemukan</strong>
        <span>Ubah filter atau tambah data pegawai baru.</span>
      </div>

      <div v-else class="table-responsive employee-table-wrapper">
        <table class="table table-sm table-hover align-middle mb-0 employee-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th style="width: 120px;">NIP</th>
              <th>Nama Pegawai</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Departemen</th>
              <th>Kategori</th>
              <th style="width: 100px;">Status</th>
              <th style="width: 105px;" class="text-end"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(pegawai, index) in paginatedPegawais"
              :key="pegawai.id"
              :class="{ 'row-action-open': openPegawaiActionId === pegawai.id }"
            >
              <td>{{ (pegawaiCurrentPage - 1) * pegawaiPerPage + index + 1 }}</td>

              <td>
                <strong>{{ pegawai.nip || '-' }}</strong>
                <small>{{ pegawai.nik || '-' }}</small>
              </td>

              <td>
                <strong>{{ pegawai.nama || '-' }}</strong>
                <small>{{ pegawai.jenis_kelamin || '-' }} · {{ pegawai.usia ? pegawai.usia + ' tahun' : '-' }}</small>
              </td>

              <td>{{ pegawai.jabatan || '-' }}</td>

              <td>
                <strong>{{ pegawai.unit_kerja || '-' }}</strong>
                <small>{{ pegawai.lokasi_kerja || '-' }}</small>
              </td>

              <td>{{ pegawai.departemen || '-' }}</td>

              <td>
                <span class="category-pill">
                  {{ pegawai.kategori_pegawai || '-' }}
                </span>
              </td>

              <td>
                <span class="status-pill" :class="pegawai.status === 'Aktif' ? 'success' : 'danger'">
                  {{ pegawai.status || '-' }}
                </span>
              </td>

              <td
                class="text-end action-cell"
                :class="{ 'is-open': openPegawaiActionId === pegawai.id }"
              >
                <div class="action-dropdown" @click.stop>
                  <button
                    type="button"
                    class="action-trigger"
                    @click="togglePegawaiAction(pegawai.id)"
                  >
                    --Pilih--
                    <i class="fas fa-chevron-down"></i>
                  </button>

                  <div
                    v-if="openPegawaiActionId === pegawai.id"
                    class="action-menu"
                  >
                    <button type="button" @click="lihatDetailPegawai(pegawai); closePegawaiAction()">
                      <i class="fas fa-eye text-info"></i>
                      Lihat Detail
                    </button>

                    <button type="button" @click="lihatRiwayat(pegawai); closePegawaiAction()">
                      <i class="fas fa-history text-primary"></i>
                      Riwayat PKWT
                    </button>

                    <button type="button" @click="editPegawai(pegawai); closePegawaiAction()">
                      <i class="fas fa-edit text-warning"></i>
                      Edit Data
                    </button>

                    <div class="action-divider"></div>

                    <button type="button" class="danger" @click="hapusPegawai(pegawai.id); closePegawaiAction()">
                      <i class="fas fa-trash"></i>
                      Hapus Data
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pegawaiTotalPages > 1" class="pagination-row">
        <button
          type="button"
          :disabled="pegawaiCurrentPage === 1"
          @click="changePegawaiPage(1)"
        >
          <i class="fas fa-angles-left"></i>
        </button>

        <button
          type="button"
          :disabled="pegawaiCurrentPage === 1"
          @click="changePegawaiPage(pegawaiCurrentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in pegawaiPaginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: pegawaiCurrentPage === page }"
          @click="page !== '...' && changePegawaiPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="pegawaiCurrentPage === pegawaiTotalPages"
          @click="changePegawaiPage(pegawaiCurrentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <button
          type="button"
          :disabled="pegawaiCurrentPage === pegawaiTotalPages"
          @click="changePegawaiPage(pegawaiTotalPages)"
        >
          <i class="fas fa-angles-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  pegawais: { type: Array, default: () => [] },
  filteredPegawais: { type: Array, default: () => [] },
  paginatedPegawais: { type: Array, default: () => [] },
  searchPegawai: String,
  filterUnitKerjaPegawai: String,
  filterStatusPegawai: String,
  unitKerjaOptions: { type: Array, default: () => [] },
  pegawaiCurrentPage: Number,
  pegawaiPerPage: Number,
  pegawaiTotalPages: Number,
  pegawaiPaginationPages: { type: Array, default: () => [] },
  openPegawaiActionId: [Number, String, null],
  setSearchPegawai: Function,
  setFilterUnitKerjaPegawai: Function,
  setFilterStatusPegawai: Function,
  resetFilterPegawai: Function,
  changePegawaiPage: Function,
  togglePegawaiAction: Function,
  closePegawaiAction: Function,
  loadPegawai: Function,
  tambahPegawai: Function,
  openImportModal: Function,
  downloadTemplateExcel: Function,
  exportPegawaiExcel: Function,
  lihatDetailPegawai: Function,
  lihatRiwayat: Function,
  editPegawai: Function,
  hapusPegawai: Function
})

const totalAktif = computed(() => {
  return props.pegawais.filter((item) => item.status === 'Aktif').length
})

const totalNonAktif = computed(() => {
  return props.pegawais.filter((item) => item.status === 'Non Aktif').length
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
.summary-card.danger { border-left-color: #dc2626; }
.summary-card.info { border-left-color: #0284c7; }

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
.employee-card {
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
  grid-template-columns: minmax(260px, 1fr) 220px 160px 74px;
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

.form-select-sm {
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}

.employee-card {
  overflow: visible;
}

.employee-table-wrapper {
  min-height: 320px;
  padding-bottom: 120px;
  overflow-x: auto;
  overflow-y: auto;
}

.employee-table {
  min-width: 1120px;
}

.employee-table th,
.employee-table td {
  white-space: nowrap;
  vertical-align: middle;
}

.employee-table tbody tr {
  position: relative;
  z-index: 1;
}

.employee-table tbody tr.row-action-open {
  position: relative;
  z-index: 1000;
}

.action-cell {
  position: relative;
  min-width: 120px;
  overflow: visible !important;
  z-index: 1;
}

.action-cell.is-open {
  z-index: 9999;
}

.action-dropdown {
  position: relative;
  display: inline-block;
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

.employee-table {
  font-size: 12px;
}

.employee-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.employee-table tbody td {
  padding: 8px;
}

.employee-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.employee-table small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.category-pill,
.status-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
}

.category-pill {
  background: #eef2ff;
  color: #4f46e5;
}

.status-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-trigger {
  height: 28px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  color: #475569;
  border-radius: 8px;
  padding: 0 9px;
  font-size: 11px;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 34px;
  width: 190px;
  min-width: 190px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, .18);
  z-index: 99999;
  padding: 6px;
  text-align: left;

  display: flex;
  flex-direction: column;
  gap: 2px;

  white-space: normal;
}

.action-menu button {
  width: 100%;
  min-height: 34px;
  border: 0;
  background: transparent;
  color: #334155;
  padding: 8px 9px;
  text-align: left;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  white-space: nowrap;
}

.action-menu button:hover {
  background: #f8fafc;
}

.action-menu button.danger {
  color: #dc2626;
}

.action-divider {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
  margin: 5px 0;
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