<template>
  <div class="pegawai-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-users"></i>
      </div>

      <div>
        <h5>Database Pegawai</h5>
        <p>{{ filteredPegawais.length }} dari {{ pegawais.length }} data</p>
      </div>

      <button type="button" :disabled="loading" @click="loadPegawai">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="quick-actions">
      <button type="button" class="primary" @click="tambahPegawai">
        <i class="fas fa-plus"></i>
        Tambah
      </button>

      <button type="button" class="success" @click="openImportModal">
        <i class="fas fa-file-excel"></i>
        Upload
      </button>

      <button type="button" @click="downloadTemplateExcel">
        <i class="fas fa-download"></i>
        Template
      </button>

      <button type="button" @click="exportPegawaiExcel">
        <i class="fas fa-file-export"></i>
        Export
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ pegawais.length }}</strong>
      </div>

      <div class="summary-card success">
        <span>Aktif</span>
        <strong>{{ totalAktif }}</strong>
      </div>

      <div class="summary-card danger">
        <span>Non Aktif</span>
        <strong>{{ totalNonAktif }}</strong>
      </div>

      <div class="summary-card info">
        <span>Unit</span>
        <strong>{{ unitKerjaOptions.length }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          :value="searchPegawai"
          type="text"
          placeholder="Cari pegawai..."
          @input="setSearchPegawai($event.target.value)"
        >
      </div>

      <div class="filter-grid">
        <select
          :value="filterUnitKerjaPegawai"
          class="form-select form-select-sm"
          @change="setFilterUnitKerjaPegawai($event.target.value)"
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
          :value="filterStatusPegawai"
          class="form-select form-select-sm"
          @change="setFilterStatusPegawai($event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Non Aktif">Non Aktif</option>
        </select>
      </div>

      <button type="button" class="reset-btn" @click="resetFilterPegawai">
        Reset Filter
      </button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data pegawai...</span>
    </div>

    <div v-else-if="filteredPegawais.length === 0" class="empty-card">
      <i class="fas fa-users-slash"></i>
      <strong>Data tidak ditemukan</strong>
      <span>Ubah filter atau tambah data pegawai baru.</span>
    </div>

    <template v-else>
      <div
        v-for="pegawai in paginatedPegawais"
        :key="pegawai.id"
        class="employee-card"
      >
        <div class="employee-top">
          <span>{{ pegawai.nip || '-' }}</span>

          <strong :class="pegawai.status === 'Aktif' ? 'active' : 'inactive'">
            {{ pegawai.status || '-' }}
          </strong>
        </div>

        <h6>{{ pegawai.nama || '-' }}</h6>

        <p>
          {{ pegawai.jabatan || '-' }}
          <br>
          {{ pegawai.unit_kerja || '-' }}
        </p>

        <div class="employee-meta">
          <span>
            <i class="fas fa-building"></i>
            {{ pegawai.departemen || '-' }}
          </span>

          <span>
            <i class="fas fa-location-dot"></i>
            {{ pegawai.lokasi_kerja || '-' }}
          </span>

          <span>
            <i class="fas fa-id-card"></i>
            {{ pegawai.kategori_pegawai || '-' }}
          </span>
        </div>

        <div class="employee-actions">
          <button type="button" class="primary" @click="lihatDetailPegawai(pegawai)">
            <i class="fas fa-eye"></i>
            Detail
          </button>

          <button type="button" @click="lihatRiwayat(pegawai)">
            <i class="fas fa-history"></i>
          </button>

          <button type="button" @click="editPegawai(pegawai)">
            <i class="fas fa-edit"></i>
          </button>

          <button type="button" class="danger" @click="hapusPegawai(pegawai.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </template>

    <div v-if="pegawaiTotalPages > 1" class="pagination-row">
      <button
        type="button"
        :disabled="pegawaiCurrentPage <= 1"
        @click="changePegawaiPage(pegawaiCurrentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ pegawaiCurrentPage }} / {{ pegawaiTotalPages }}</span>

      <button
        type="button"
        :disabled="pegawaiCurrentPage >= pegawaiTotalPages"
        @click="changePegawaiPage(pegawaiCurrentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
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
  pegawaiTotalPages: Number,
  pegawaiPaginationPages: { type: Array, default: () => [] },
  formatTanggal: Function,
  setSearchPegawai: Function,
  setFilterUnitKerjaPegawai: Function,
  setFilterStatusPegawai: Function,
  resetFilterPegawai: Function,
  changePegawaiPage: Function,
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
.pegawai-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.employee-card {
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
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-bottom: 10px;
}

.quick-actions button {
  min-height: 38px;
  border: 0;
  border-radius: 13px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 950;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.quick-actions button.primary {
  background: #2563eb;
  color: #ffffff;
}

.quick-actions button.success {
  background: #16a34a;
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
.summary-card.danger { border-left-color: #dc2626; }
.summary-card.info { border-left-color: #0284c7; }

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

.form-select-sm {
  font-size: 12px;
  font-weight: 750;
  border-radius: 10px;
}

.reset-btn {
  width: 100%;
  min-height: 34px;
  border: 0;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 950;
  margin-top: 8px;
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

.employee-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.employee-top span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.employee-top strong {
  border-radius: 999px;
  padding: 3px 7px;
  font-size: 10.3px;
  font-weight: 950;
}

.employee-top strong.active {
  background: #dcfce7;
  color: #15803d;
}

.employee-top strong.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.employee-card h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.employee-card p {
  margin: 4px 0 9px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.employee-meta {
  display: grid;
  gap: 4px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 750;
}

.employee-meta i {
  width: 14px;
  color: #94a3b8;
}

.employee-actions {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 36px 36px 36px;
  gap: 6px;
}

.employee-actions button {
  border: 0;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
  min-height: 34px;
  font-size: 11px;
  font-weight: 950;
}

.employee-actions button.primary {
  background: #2563eb;
  color: #ffffff;
}

.employee-actions button.danger {
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