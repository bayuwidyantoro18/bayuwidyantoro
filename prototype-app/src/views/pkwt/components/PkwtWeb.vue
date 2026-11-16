<template>
  <div class="container-fluid pkwt-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Data PKWT</h3>
        <p class="page-subtitle">
          Kelola data kontrak pegawai, masa berlaku PKWT, file kontrak, dan status kontrak.
        </p>
      </div>

      <div class="head-actions">
        <button type="button" class="btn btn-sm btn-primary action-btn" @click="tambahPkwt">
          <i class="fas fa-plus me-1"></i>
          Tambah PKWT
        </button>

        <button type="button" class="btn btn-sm btn-outline-primary action-btn" :disabled="loading" @click="loadPkwt">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card primary">
        <span>Total PKWT</span>
        <strong>{{ pkwts.length }}</strong>
        <i class="fas fa-file-signature"></i>
      </div>

      <div class="summary-card success">
        <span>Aktif</span>
        <strong>{{ totalAktif }}</strong>
        <i class="fas fa-check-circle"></i>
      </div>

      <div class="summary-card warning">
        <span>Akan Berakhir</span>
        <strong>{{ totalAkanBerakhir }}</strong>
        <i class="fas fa-exclamation-triangle"></i>
      </div>

      <div class="summary-card danger">
        <span>Berakhir</span>
        <strong>{{ totalBerakhir }}</strong>
        <i class="fas fa-times-circle"></i>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            :value="searchPkwt"
            type="text"
            placeholder="Cari nama, NIP, atau nomor kontrak..."
            @input="setSearchPkwt($event.target.value)"
            @keyup.enter="changePkwtPage(1)"
          >
        </div>

        <select
          :value="filterStatusPkwt"
          class="form-select form-select-sm"
          @change="setFilterStatusPkwt($event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Diperpanjang">Diperpanjang</option>
          <option value="Berakhir">Berakhir</option>
        </select>

        <input
          :value="filterBerakhirDari"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal berakhir dari"
          @input="setFilterBerakhirDari($event.target.value)"
        >

        <input
          :value="filterBerakhirSampai"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal berakhir sampai"
          @input="setFilterBerakhirSampai($event.target.value)"
        >

        <button type="button" class="btn btn-sm btn-light" @click="resetFilterPkwt">
          Reset
        </button>
      </div>
    </div>

    <div class="card contract-card">
      <div class="card-head">
        <div>
          <h6>Daftar PKWT</h6>
          <small>Menampilkan {{ filteredPkwts.length }} dari {{ pkwts.length }} data PKWT</small>
        </div>

        <span>Halaman {{ pkwtCurrentPage }} dari {{ pkwtTotalPages || 1 }}</span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data PKWT...</span>
      </div>

      <div v-else-if="filteredPkwts.length === 0" class="empty-state">
        <i class="fas fa-file-circle-xmark"></i>
        <strong>Data PKWT tidak ditemukan</strong>
        <span>Ubah filter atau tambah data PKWT baru.</span>
      </div>

      <div v-else class="table-responsive contract-table-wrapper">
        <table class="table table-sm table-hover align-middle mb-0 contract-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th>Pegawai</th>
              <th>No. Kontrak</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Berakhir</th>
              <th>Sisa Hari</th>
              <th>Status</th>
              <th style="width: 110px;" class="text-end"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(pkwt, index) in paginatedPkwts"
              :key="pkwt.id"
              :class="{ 'row-action-open': openActionId === pkwt.id }"
            >
              <td>{{ (pkwtCurrentPage - 1) * pkwtPerPage + index + 1 }}</td>

              <td>
                <strong>{{ pkwt.pegawai?.nama || '-' }}</strong>
                <small>{{ pkwt.pegawai?.nip || '-' }} · {{ pkwt.pegawai?.unit_kerja || '-' }}</small>
              </td>

              <td>
                <strong>{{ pkwt.nomor_kontrak || '-' }}</strong>
                <small>{{ pkwt.pegawai?.jabatan || '-' }}</small>
              </td>

              <td>{{ formatDate(pkwt.tanggal_mulai) }}</td>

              <td>{{ formatDate(pkwt.tanggal_berakhir) }}</td>

              <td>
                <span
                  class="days-pill"
                  :class="{
                    danger: sisaHari(pkwt.tanggal_berakhir) !== null && sisaHari(pkwt.tanggal_berakhir) < 0,
                    warning: sisaHari(pkwt.tanggal_berakhir) !== null && sisaHari(pkwt.tanggal_berakhir) >= 0 && sisaHari(pkwt.tanggal_berakhir) <= 30
                  }"
                >
                  {{ sisaHari(pkwt.tanggal_berakhir) === null ? '-' : sisaHari(pkwt.tanggal_berakhir) + ' hari' }}
                </span>
              </td>

              <td>
                <span class="status-pill" :class="statusClass(pkwt.status)">
                  {{ pkwt.status || '-' }}
                </span>
              </td>

              <td
                class="text-end action-cell"
                :class="{ 'is-open': openActionId === pkwt.id }"
              >
                <div class="action-dropdown" @click.stop>
                  <button
                    type="button"
                    class="action-trigger"
                    @click="toggleAction(pkwt.id)"
                  >
                    --Pilih--
                    <i class="fas fa-chevron-down"></i>
                  </button>

                  <div v-if="openActionId === pkwt.id" class="action-menu">
                    <button type="button" @click="lihatDetailPkwt(pkwt); closeAction()">
                      <i class="fas fa-file-contract text-primary"></i>
                      Lihat Kontrak
                    </button>

                    <button type="button" @click="editPkwt(pkwt); closeAction()">
                      <i class="fas fa-edit text-warning"></i>
                      Edit PKWT
                    </button>

                    <div class="action-divider"></div>

                    <button type="button" class="danger" @click="hapusPkwt(pkwt.id); closeAction()">
                      <i class="fas fa-trash"></i>
                      Hapus PKWT
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pkwtTotalPages > 1" class="pagination-row">
        <button type="button" :disabled="pkwtCurrentPage === 1" @click="changePkwtPage(1)">
          <i class="fas fa-angles-left"></i>
        </button>

        <button type="button" :disabled="pkwtCurrentPage === 1" @click="changePkwtPage(pkwtCurrentPage - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in pkwtPaginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: pkwtCurrentPage === page }"
          @click="page !== '...' && changePkwtPage(page)"
        >
          {{ page }}
        </button>

        <button type="button" :disabled="pkwtCurrentPage === pkwtTotalPages" @click="changePkwtPage(pkwtCurrentPage + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>

        <button type="button" :disabled="pkwtCurrentPage === pkwtTotalPages" @click="changePkwtPage(pkwtTotalPages)">
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
  pkwts: { type: Array, default: () => [] },
  filteredPkwts: { type: Array, default: () => [] },
  paginatedPkwts: { type: Array, default: () => [] },
  searchPkwt: String,
  filterStatusPkwt: String,
  filterBerakhirDari: String,
  filterBerakhirSampai: String,
  pkwtCurrentPage: Number,
  pkwtPerPage: Number,
  pkwtTotalPages: Number,
  pkwtPaginationPages: { type: Array, default: () => [] },
  openActionId: [Number, String],
  formatDate: Function,
  statusClass: Function,
  sisaHari: Function,
  setSearchPkwt: Function,
  setFilterStatusPkwt: Function,
  setFilterBerakhirDari: Function,
  setFilterBerakhirSampai: Function,
  resetFilterPkwt: Function,
  changePkwtPage: Function,
  toggleAction: Function,
  closeAction: Function,
  loadPkwt: Function,
  tambahPkwt: Function,
  editPkwt: Function,
  lihatDetailPkwt: Function,
  hapusPkwt: Function
})

const totalAktif = computed(() => props.pkwts.filter((item) => item.status === 'Aktif').length)
const totalBerakhir = computed(() => props.pkwts.filter((item) => item.status === 'Berakhir').length)
const totalAkanBerakhir = computed(() => props.pkwts.filter((item) => {
  const days = props.sisaHari?.(item.tanggal_berakhir)
  return item.status === 'Aktif' && days !== null && days >= 0 && days <= 30
}).length)
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
.summary-card.warning { border-left-color: #f59e0b; }
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
.contract-card {
  overflow: visible;
}

.contract-table-wrapper {
  min-height: 320px;
  padding-bottom: 120px;
  overflow-x: auto;
  overflow-y: visible;
}

.contract-table {
  min-width: 1120px;
}

.contract-table th,
.contract-table td {
  white-space: nowrap;
  vertical-align: middle;
}

.contract-table tbody tr {
  position: relative;
  z-index: 1;
}

.contract-table tbody tr.row-action-open {
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

.filter-card {
  padding: 10px;
  margin-bottom: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 170px 145px 145px 74px;
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

.form-control-sm,
.form-select-sm {
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}

.contract-card {
  overflow: visible;
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

.contract-table {
  font-size: 12px;
}

.contract-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.contract-table tbody td {
  padding: 8px;
}

.contract-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.contract-table small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.status-pill,
.days-pill {
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

.status-pill.primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-pill.danger,
.days-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.status-pill.secondary,
.days-pill {
  background: #e5e7eb;
  color: #475569;
}

.days-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.action-dropdown {
  position: relative;
  display: inline-block;
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
