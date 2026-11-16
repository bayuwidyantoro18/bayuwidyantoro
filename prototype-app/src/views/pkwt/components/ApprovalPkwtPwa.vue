<template>
  <div class="approval-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-clipboard-check"></i>
      </div>

      <div>
        <h5>Approval PKWT</h5>
        <p>{{ filteredApprovals.length }} dari {{ approvals.length }} data</p>
      </div>

      <button type="button" :disabled="loading || submitting" @click="loadApproval">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card warning">
        <span>Pending</span>
        <strong>{{ totalByStatus.pending }}</strong>
      </div>

      <div class="summary-card success">
        <span>Perpanjang</span>
        <strong>{{ totalByStatus.perpanjang_kontrak }}</strong>
      </div>

      <div class="summary-card info">
        <span>Penerbitan</span>
        <strong>{{ totalByStatus.penerbitan_pkwt }}</strong>
      </div>

      <div class="summary-card danger">
        <span>Ditolak</span>
        <strong>{{ totalByStatus.tidak_diperpanjang }}</strong>
      </div>

      <div class="summary-card primary">
        <span>Selesai</span>
        <strong>{{ totalByStatus.selesai }}</strong>
      </div>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          :value="searchApproval"
          type="text"
          placeholder="Cari approval..."
          @input="setSearchApproval($event.target.value)"
        >
      </div>

      <div class="filter-grid">
        <select
          :value="filterStatusApproval"
          class="form-select form-select-sm"
          @change="setFilterStatusApproval($event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="perpanjang_kontrak">Perpanjang</option>
          <option value="penerbitan_pkwt">Penerbitan</option>
          <option value="tidak_diperpanjang">Tidak Diperpanjang</option>
          <option value="selesai">Selesai</option>
        </select>

        <select
          :value="filterUnitKerjaApproval"
          class="form-select form-select-sm"
          @change="setFilterUnitKerjaApproval($event.target.value)"
        >
          <option value="">Semua Unit</option>
          <option v-for="unit in unitKerjaApprovalOptions" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </div>

      <div class="filter-grid">
        <input
          :value="filterTanggalDari"
          type="date"
          class="form-control form-control-sm"
          @input="setFilterTanggalDari($event.target.value)"
        >

        <input
          :value="filterTanggalSampai"
          type="date"
          class="form-control form-control-sm"
          @input="setFilterTanggalSampai($event.target.value)"
        >
      </div>

      <button type="button" class="reset-btn" @click="resetFilterApproval">
        Reset Filter
      </button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data approval...</span>
    </div>

    <div v-else-if="filteredApprovals.length === 0" class="empty-card">
      <i class="fas fa-clipboard-check"></i>
      <strong>Data approval tidak ditemukan</strong>
      <span>Pengajuan perpanjangan PKWT akan tampil di sini.</span>
    </div>

    <template v-else>
      <div
        v-for="item in paginatedApprovals"
        :key="item.id"
        class="approval-card"
      >
        <div class="approval-top">
          <span>{{ item.pegawai?.nip || '-' }}</span>
          <strong>{{ formatTanggal(item.pkwt?.tanggal_berakhir) }}</strong>
        </div>

        <h6>{{ item.pegawai?.nama || '-' }}</h6>

        <p>
          {{ item.pegawai?.jabatan || '-' }}
          <br>
          {{ item.unit_kerja || item.pegawai?.unit_kerja || '-' }}
        </p>

        <div class="status-row">
          <span class="status-pill" :class="statusClass(item.status_proses)">
            {{ statusLabel(item.status_proses) }}
          </span>

          <small>{{ item.durasi_bulan ? item.durasi_bulan + ' bulan' : 'Durasi belum diisi' }}</small>
        </div>

        <div v-if="item.catatan_kadiv" class="note-box">
          {{ item.catatan_kadiv }}
        </div>

        <div class="action-grid">
          <template v-if="item.status_proses === 'pending'">
            <button type="button" class="success" @click="bukaModalSetujui(item)">
              <i class="fas fa-check"></i>
              Setujui
            </button>

            <button type="button" class="danger" @click="tolak(item.id)">
              <i class="fas fa-times"></i>
              Tolak
            </button>
          </template>

          <template v-else-if="item.status_proses === 'perpanjang_kontrak'">
            <button type="button" class="primary full" @click="prosesPkwt(item.id)">
              <i class="fas fa-file-signature"></i>
              Proses PKWT
            </button>
          </template>

          <template v-else-if="item.status_proses === 'penerbitan_pkwt'">
            <button type="button" class="info full" @click="bukaModalUpload(item)">
              <i class="fas fa-upload"></i>
              Upload PDF
            </button>
          </template>

          <template v-else>
            <button type="button" class="disabled full" disabled>
              <i class="fas fa-lock"></i>
              Tidak Ada Aksi
            </button>
          </template>
        </div>
      </div>
    </template>

    <div v-if="approvalTotalPages > 1" class="pagination-row">
      <button
        type="button"
        :disabled="approvalCurrentPage <= 1"
        @click="changeApprovalPage(approvalCurrentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span>{{ approvalCurrentPage }} / {{ approvalTotalPages }}</span>

      <button
        type="button"
        :disabled="approvalCurrentPage >= approvalTotalPages"
        @click="changeApprovalPage(approvalCurrentPage + 1)"
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
  submitting: Boolean,
  approvals: { type: Array, default: () => [] },
  filteredApprovals: { type: Array, default: () => [] },
  paginatedApprovals: { type: Array, default: () => [] },
  searchApproval: String,
  filterStatusApproval: String,
  filterUnitKerjaApproval: String,
  filterTanggalDari: String,
  filterTanggalSampai: String,
  unitKerjaApprovalOptions: { type: Array, default: () => [] },
  approvalCurrentPage: Number,
  approvalTotalPages: Number,
  formatTanggal: Function,
  statusLabel: Function,
  statusClass: Function,
  setSearchApproval: Function,
  setFilterStatusApproval: Function,
  setFilterUnitKerjaApproval: Function,
  setFilterTanggalDari: Function,
  setFilterTanggalSampai: Function,
  resetFilterApproval: Function,
  changeApprovalPage: Function,
  loadApproval: Function,
  bukaModalSetujui: Function,
  tolak: Function,
  prosesPkwt: Function,
  bukaModalUpload: Function
})

const totalByStatus = computed(() => {
  const result = {
    pending: 0,
    perpanjang_kontrak: 0,
    penerbitan_pkwt: 0,
    tidak_diperpanjang: 0,
    selesai: 0
  }

  props.approvals.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(result, item.status_proses)) {
      result[item.status_proses]++
    }
  })

  return result
})
</script>

<style scoped>
.approval-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
.filter-card,
.state-card,
.empty-card,
.approval-card {
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

.summary-card.warning { border-left-color: #f59e0b; }
.summary-card.success { border-left-color: #16a34a; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.danger { border-left-color: #dc2626; }
.summary-card.primary { border-left-color: #2563eb; }

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

.approval-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.approval-top span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.approval-top strong {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
}

.approval-card h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.approval-card p {
  margin: 4px 0 9px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.status-row small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.status-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.3px;
  font-weight: 950;
}

.status-pill.warning { background: #fef3c7; color: #b45309; }
.status-pill.success { background: #dcfce7; color: #15803d; }
.status-pill.info { background: #e0f2fe; color: #0369a1; }
.status-pill.danger { background: #fee2e2; color: #dc2626; }
.status-pill.primary { background: #dbeafe; color: #1d4ed8; }
.status-pill.secondary { background: #e5e7eb; color: #475569; }

.note-box {
  margin-top: 9px;
  padding: 8px 9px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 10.8px;
  font-weight: 750;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 10px;
}

.action-grid button {
  border: 0;
  border-radius: 11px;
  min-height: 34px;
  font-size: 11px;
  font-weight: 950;
  background: #f1f5f9;
  color: #475569;
}

.action-grid button.full {
  grid-column: 1 / -1;
}

.action-grid button.success {
  background: #16a34a;
  color: #ffffff;
}

.action-grid button.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-grid button.primary {
  background: #2563eb;
  color: #ffffff;
}

.action-grid button.info {
  background: #0284c7;
  color: #ffffff;
}

.action-grid button.disabled {
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
