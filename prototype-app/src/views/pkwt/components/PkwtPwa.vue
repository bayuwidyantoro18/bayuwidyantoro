<template>
  <div class="pkwt-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-file-signature"></i>
      </div>

      <div>
        <h5>Data PKWT</h5>
        <p>{{ filteredPkwts.length }} dari {{ pkwts.length }} data</p>
      </div>

      <button type="button" :disabled="loading" @click="loadPkwt">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="quick-actions">
      <button type="button" class="primary" @click="tambahPkwt">
        <i class="fas fa-plus"></i>
        Tambah PKWT
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ pkwts.length }}</strong>
      </div>

      <div class="summary-card success">
        <span>Aktif</span>
        <strong>{{ totalAktif }}</strong>
      </div>

      <div class="summary-card warning">
        <span>Akan Berakhir</span>
        <strong>{{ totalAkanBerakhir }}</strong>
      </div>

      <div class="summary-card danger">
        <span>Berakhir</span>
        <strong>{{ totalBerakhir }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          :value="searchPkwt"
          type="text"
          placeholder="Cari PKWT..."
          @input="setSearchPkwt($event.target.value)"
        >
      </div>

      <div class="filter-grid">
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

        <button type="button" class="reset-btn inline" @click="resetFilterPkwt">
          Reset
        </button>
      </div>

      <div class="filter-grid">
        <input
          :value="filterBerakhirDari"
          type="date"
          class="form-control form-control-sm"
          @input="setFilterBerakhirDari($event.target.value)"
        >

        <input
          :value="filterBerakhirSampai"
          type="date"
          class="form-control form-control-sm"
          @input="setFilterBerakhirSampai($event.target.value)"
        >
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data PKWT...</span>
    </div>

    <div v-else-if="filteredPkwts.length === 0" class="empty-card">
      <i class="fas fa-file-circle-xmark"></i>
      <strong>Data tidak ditemukan</strong>
      <span>Ubah filter atau tambah data PKWT baru.</span>
    </div>

    <template v-else>
      <div v-for="pkwt in paginatedPkwts" :key="pkwt.id" class="contract-card">
        <div class="contract-top">
          <span>{{ pkwt.pegawai?.nip || '-' }}</span>

          <strong :class="statusClass(pkwt.status)">
            {{ pkwt.status || '-' }}
          </strong>
        </div>

        <h6>{{ pkwt.pegawai?.nama || '-' }}</h6>
        <p>{{ pkwt.nomor_kontrak || '-' }}</p>

        <div class="contract-meta">
          <span>
            <i class="fas fa-briefcase"></i>
            {{ pkwt.pegawai?.jabatan || '-' }}
          </span>

          <span>
            <i class="fas fa-building"></i>
            {{ pkwt.pegawai?.unit_kerja || '-' }}
          </span>

          <span>
            <i class="fas fa-calendar-day"></i>
            Mulai: {{ formatDate(pkwt.tanggal_mulai) }}
          </span>

          <span>
            <i class="fas fa-calendar-times"></i>
            Berakhir: {{ formatDate(pkwt.tanggal_berakhir) }}
          </span>
        </div>

        <div class="contract-footer">
          <span
            class="days-pill"
            :class="{
              danger: sisaHari(pkwt.tanggal_berakhir) !== null && sisaHari(pkwt.tanggal_berakhir) < 0,
              warning: sisaHari(pkwt.tanggal_berakhir) !== null && sisaHari(pkwt.tanggal_berakhir) >= 0 && sisaHari(pkwt.tanggal_berakhir) <= 30
            }"
          >
            {{ sisaHari(pkwt.tanggal_berakhir) === null ? '-' : sisaHari(pkwt.tanggal_berakhir) + ' hari' }}
          </span>

          <div class="contract-actions">
            <button type="button" class="primary" @click="lihatDetailPkwt(pkwt)">
              <i class="fas fa-eye"></i>
            </button>

            <button type="button" @click="editPkwt(pkwt)">
              <i class="fas fa-edit"></i>
            </button>

            <button type="button" class="danger" @click="hapusPkwt(pkwt.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-if="pkwtTotalPages > 1" class="pagination-row">
      <button type="button" :disabled="pkwtCurrentPage <= 1" @click="changePkwtPage(pkwtCurrentPage - 1)">
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ pkwtCurrentPage }} / {{ pkwtTotalPages }}</span>

      <button type="button" :disabled="pkwtCurrentPage >= pkwtTotalPages" @click="changePkwtPage(pkwtCurrentPage + 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
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
  pkwtTotalPages: Number,
  pkwtPaginationPages: { type: Array, default: () => [] },
  formatDate: Function,
  statusClass: Function,
  sisaHari: Function,
  setSearchPkwt: Function,
  setFilterStatusPkwt: Function,
  setFilterBerakhirDari: Function,
  setFilterBerakhirSampai: Function,
  resetFilterPkwt: Function,
  changePkwtPage: Function,
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
.pkwt-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.contract-card {
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

.quick-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
  margin-bottom: 10px;
}

.quick-actions button {
  min-height: 38px;
  border: 0;
  border-radius: 13px;
  font-size: 11.5px;
  font-weight: 950;
}

.quick-actions button.primary {
  background: #2563eb;
  color: #ffffff;
}

.summary-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.summary-card {
  min-width: 105px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 10px;
}

.summary-card.success { border-left-color: #16a34a; }
.summary-card.warning { border-left-color: #f59e0b; }
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

.reset-btn {
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 950;
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

.contract-top,
.contract-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.contract-top {
  margin-bottom: 7px;
}

.contract-top span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.contract-top strong {
  border-radius: 999px;
  padding: 3px 7px;
  font-size: 10.3px;
  font-weight: 950;
}

.contract-top strong.success {
  background: #dcfce7;
  color: #15803d;
}

.contract-top strong.primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.contract-top strong.danger {
  background: #fee2e2;
  color: #dc2626;
}

.contract-top strong.secondary {
  background: #e5e7eb;
  color: #475569;
}

.contract-card h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.contract-card p {
  margin: 4px 0 9px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.contract-meta {
  display: grid;
  gap: 4px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 750;
}

.contract-meta i {
  width: 14px;
  color: #94a3b8;
}

.contract-footer {
  margin-top: 10px;
}

.days-pill {
  border-radius: 999px;
  padding: 4px 8px;
  background: #e5e7eb;
  color: #475569;
  font-size: 10.3px;
  font-weight: 950;
}

.days-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.days-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.contract-actions {
  display: flex;
  gap: 6px;
}

.contract-actions button {
  width: 34px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.contract-actions button.primary {
  background: #2563eb;
  color: #ffffff;
}

.contract-actions button.danger {
  background: #fee2e2;
  color: #dc2626;
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
