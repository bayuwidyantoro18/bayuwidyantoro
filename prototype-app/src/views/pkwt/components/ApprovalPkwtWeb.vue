<template>
  <div class="container-fluid approval-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Approval PKWT</h3>
        <p class="page-subtitle">
          Kelola proses approval perpanjangan kontrak, penerbitan PKWT, upload PDF, dan status penyelesaian.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary action-btn"
        :disabled="loading || submitting"
        @click="loadApproval"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card warning">
        <span>Pending</span>
        <strong>{{ totalByStatus.pending }}</strong>
        <i class="fas fa-hourglass-half"></i>
      </div>

      <div class="summary-card success">
        <span>Perpanjang</span>
        <strong>{{ totalByStatus.perpanjang_kontrak }}</strong>
        <i class="fas fa-check-circle"></i>
      </div>

      <div class="summary-card info">
        <span>Penerbitan PKWT</span>
        <strong>{{ totalByStatus.penerbitan_pkwt }}</strong>
        <i class="fas fa-file-signature"></i>
      </div>

      <div class="summary-card danger">
        <span>Tidak Diperpanjang</span>
        <strong>{{ totalByStatus.tidak_diperpanjang }}</strong>
        <i class="fas fa-times-circle"></i>
      </div>

      <div class="summary-card primary">
        <span>Selesai</span>
        <strong>{{ totalByStatus.selesai }}</strong>
        <i class="fas fa-flag-checkered"></i>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            :value="searchApproval"
            type="text"
            placeholder="Cari NIP, nama, jabatan, unit kerja..."
            @input="setSearchApproval($event.target.value)"
            @keyup.enter="changeApprovalPage(1)"
          >
        </div>

        <select
          :value="filterStatusApproval"
          class="form-select form-select-sm"
          @change="setFilterStatusApproval($event.target.value)"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="perpanjang_kontrak">Perpanjang Kontrak</option>
          <option value="penerbitan_pkwt">Penerbitan PKWT</option>
          <option value="tidak_diperpanjang">Tidak Diperpanjang</option>
          <option value="selesai">Selesai</option>
        </select>

        <select
          :value="filterUnitKerjaApproval"
          class="form-select form-select-sm"
          @change="setFilterUnitKerjaApproval($event.target.value)"
        >
          <option value="">Semua Unit</option>
          <option
            v-for="unit in unitKerjaApprovalOptions"
            :key="unit"
            :value="unit"
          >
            {{ unit }}
          </option>
        </select>

        <input
          :value="filterTanggalDari"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal berakhir dari"
          @input="setFilterTanggalDari($event.target.value)"
        >

        <input
          :value="filterTanggalSampai"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal berakhir sampai"
          @input="setFilterTanggalSampai($event.target.value)"
        >

        <button type="button" class="btn btn-sm btn-light" @click="resetFilterApproval">
          Reset
        </button>
      </div>
    </div>

    <div class="card approval-card">
      <div class="card-head">
        <div>
          <h6>Daftar Approval PKWT</h6>
          <small>Menampilkan {{ filteredApprovals.length }} dari {{ approvals.length }} data approval</small>
        </div>

        <span>Halaman {{ approvalCurrentPage }} dari {{ approvalTotalPages || 1 }}</span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data approval...</span>
      </div>

      <div v-else-if="filteredApprovals.length === 0" class="empty-state">
        <i class="fas fa-clipboard-check"></i>
        <strong>Data approval tidak ditemukan</strong>
        <span>Data pengajuan perpanjangan PKWT akan tampil di sini.</span>
      </div>

      <div v-else class="table-responsive approval-table-wrapper">
        <table class="table table-sm table-hover align-middle mb-0 approval-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th style="width: 120px;">NIP</th>
              <th>Nama Pegawai</th>
              <th>Unit Kerja</th>
              <th style="width: 130px;">Tgl Berakhir</th>
              <th style="width: 155px;">Status</th>
              <th style="width: 105px;">Durasi</th>
              <th>Catatan</th>
              <th style="width: 110px;" class="text-end"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in paginatedApprovals"
              :key="item.id"
              :class="{ 'row-action-open': openApprovalActionId === item.id }"
            >
              <td>{{ (approvalCurrentPage - 1) * approvalPerPage + index + 1 }}</td>

              <td>
                <strong>{{ item.pegawai?.nip || '-' }}</strong>
              </td>

              <td>
                <strong>{{ item.pegawai?.nama || '-' }}</strong>
                <small>{{ item.pegawai?.jabatan || '-' }}</small>
              </td>

              <td>
                <strong>{{ item.unit_kerja || item.pegawai?.unit_kerja || '-' }}</strong>
              </td>

              <td>{{ formatTanggal(item.pkwt?.tanggal_berakhir) }}</td>

              <td>
                <span class="status-pill" :class="statusClass(item.status_proses)">
                  {{ statusLabel(item.status_proses) }}
                </span>
              </td>

              <td>
                {{ item.durasi_bulan ? item.durasi_bulan + ' bulan' : '-' }}
              </td>

              <td>
                <span class="note-text">{{ item.catatan_kadiv || '-' }}</span>
              </td>

              <td
                class="text-end action-cell"
                :class="{ 'is-open': openApprovalActionId === item.id }"
              >
                <div class="action-dropdown" @click.stop>
                  <button
                    type="button"
                    class="action-trigger"
                    @click="toggleApprovalAction(item.id)"
                  >
                    --Pilih--
                    <i class="fas fa-chevron-down"></i>
                  </button>

                  <div
                    v-if="openApprovalActionId === item.id"
                    class="action-menu"
                  >
                    <template v-if="item.status_proses === 'pending'">
                      <button type="button" @click="bukaModalSetujui(item)">
                        <i class="fas fa-check text-success"></i>
                        Setujui
                      </button>

                      <button type="button" class="danger" @click="tolak(item.id)">
                        <i class="fas fa-times"></i>
                        Tidak Diperpanjang
                      </button>
                    </template>

                    <template v-else-if="item.status_proses === 'perpanjang_kontrak'">
                      <button type="button" @click="prosesPkwt(item.id)">
                        <i class="fas fa-file-signature text-primary"></i>
                        Proses PKWT
                      </button>
                    </template>

                    <template v-else-if="item.status_proses === 'penerbitan_pkwt'">
                      <button type="button" @click="bukaModalUpload(item)">
                        <i class="fas fa-upload text-info"></i>
                        Upload PDF
                      </button>
                    </template>

                    <template v-else>
                      <button type="button" disabled>
                        <i class="fas fa-lock"></i>
                        Tidak Ada Aksi
                      </button>
                    </template>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="approvalTotalPages > 1" class="pagination-row">
        <button type="button" :disabled="approvalCurrentPage === 1" @click="changeApprovalPage(1)">
          <i class="fas fa-angles-left"></i>
        </button>

        <button type="button" :disabled="approvalCurrentPage === 1" @click="changeApprovalPage(approvalCurrentPage - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in approvalPaginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: approvalCurrentPage === page }"
          @click="page !== '...' && changeApprovalPage(page)"
        >
          {{ page }}
        </button>

        <button type="button" :disabled="approvalCurrentPage === approvalTotalPages" @click="changeApprovalPage(approvalCurrentPage + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>

        <button type="button" :disabled="approvalCurrentPage === approvalTotalPages" @click="changeApprovalPage(approvalTotalPages)">
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
  approvalPerPage: Number,
  approvalTotalPages: Number,
  approvalPaginationPages: { type: Array, default: () => [] },
  openApprovalActionId: [Number, String],
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
  toggleApprovalAction: Function,
  closeApprovalAction: Function,
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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

.summary-card.warning { border-left-color: #f59e0b; }
.summary-card.success { border-left-color: #16a34a; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.danger { border-left-color: #dc2626; }
.summary-card.primary { border-left-color: #2563eb; }

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
.approval-card {
  overflow: visible;
}

.approval-table-wrapper {
  min-height: 320px;
  padding-bottom: 120px;
  overflow-x: auto;
  overflow-y: visible;
}

.approval-table {
  min-width: 1120px;
}

.approval-table th,
.approval-table td {
  white-space: nowrap;
  vertical-align: middle;
}

.approval-table tbody tr {
  position: relative;
  z-index: 1;
}

.approval-table tbody tr.row-action-open {
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
  grid-template-columns: minmax(260px, 1fr) 170px 190px 135px 135px 74px;
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

.approval-card {
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

.approval-table {
  font-size: 12px;
}

.approval-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.approval-table tbody td {
  padding: 8px;
}

.approval-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.approval-table small,
.note-text {
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

.status-pill.warning { background: #fef3c7; color: #b45309; }
.status-pill.success { background: #dcfce7; color: #15803d; }
.status-pill.info { background: #e0f2fe; color: #0369a1; }
.status-pill.danger { background: #fee2e2; color: #dc2626; }
.status-pill.primary { background: #dbeafe; color: #1d4ed8; }
.status-pill.secondary { background: #e5e7eb; color: #475569; }

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
  width: 210px;
  min-width: 210px;
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

.action-menu button:hover:not(:disabled) {
  background: #f8fafc;
}

.action-menu button.danger {
  color: #dc2626;
}

.action-menu button:disabled {
  color: #94a3b8;
  cursor: not-allowed;
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
    grid-template-columns: repeat(3, 1fr);
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
