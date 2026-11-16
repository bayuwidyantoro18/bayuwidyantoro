<template>
  <div class="container-fluid pkwt-dashboard-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Dashboard PKWT</h3>
        <p class="page-subtitle">
          Ringkasan data pegawai, kontrak aktif, approval, dan kontrak yang akan berakhir.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary action-btn"
        :disabled="loading"
        @click="loadDashboard"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="info-card">
      <div class="info-icon">
        <i class="fas fa-file-signature"></i>
      </div>

      <div>
        <h6>Sistem Informasi Kontrak Pegawai Internal</h6>
        <p>
          Gunakan dashboard ini untuk memantau status PKWT, pengajuan perpanjangan,
          proses persetujuan, dan masa berlaku kontrak pegawai.
        </p>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card primary">
        <span>Pegawai Aktif</span>
        <strong>{{ jumlahPegawaiAktif }}</strong>
        <small>Internal & penugasan</small>
        <i class="fas fa-users"></i>
      </div>

      <div class="summary-card danger">
        <span>Terminasi</span>
        <strong>{{ jumlahTerminasi }}</strong>
        <small>Non aktif / resign / selesai</small>
        <i class="fas fa-user-slash"></i>
      </div>

      <div class="summary-card success">
        <span>Internal Aktif</span>
        <strong>{{ pegawaiInternalAktif }}</strong>
        <small>Pegawai internal</small>
        <i class="fas fa-id-badge"></i>
      </div>

      <div class="summary-card info">
        <span>Penugasan Aktif</span>
        <strong>{{ pegawaiPenugasanAktif }}</strong>
        <small>Pegawai penugasan</small>
        <i class="fas fa-people-carry-box"></i>
      </div>

      <div class="summary-card success">
        <span>Kontrak Aktif</span>
        <strong>{{ kontrakAktif }}</strong>
        <small>PKWT pegawai aktif</small>
        <i class="fas fa-check-square"></i>
      </div>

      <div class="summary-card warning">
        <span>Pending Approval</span>
        <strong>{{ pendingApproval }}</strong>
        <small>Menunggu proses</small>
        <i class="fas fa-clock"></i>
      </div>

      <div class="summary-card secondary">
        <span>Proses TTD PKWT</span>
        <strong>{{ statusKontrak }}</strong>
        <small>Penerbitan PKWT</small>
        <i class="fas fa-file-signature"></i>
      </div>

      <div class="summary-card warning">
        <span>Akan Berakhir</span>
        <strong>{{ akanBerakhir }}</strong>
        <small>Dalam 30 hari</small>
        <i class="fas fa-exclamation-triangle"></i>
      </div>

      <div class="summary-card danger">
        <span>Sudah Berakhir</span>
        <strong>{{ sudahBerakhir }}</strong>
        <small>Kontrak melewati tanggal</small>
        <i class="fas fa-window-close"></i>
      </div>
    </div>

    <div class="card contract-card">
      <div class="card-head">
        <div>
          <h6>Kontrak Akan Berakhir Dalam 30 Hari</h6>
          <small>{{ kontrakAkanBerakhir.length }} data ditemukan</small>
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat dashboard...</span>
      </div>

      <div v-else-if="kontrakAkanBerakhir.length === 0" class="empty-state">
        <i class="fas fa-circle-check"></i>
        <strong>Tidak ada kontrak yang akan berakhir</strong>
        <span>Data kontrak yang mendekati masa akhir akan tampil di sini.</span>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0 dashboard-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th>NIP</th>
              <th>Nama Pegawai</th>
              <th>Unit Kerja</th>
              <th>Tanggal Berakhir</th>
              <th>Status</th>
              <th style="width: 180px;" class="text-end">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="item.id">
              <td>{{ (currentPage - 1) * 5 + index + 1 }}</td>
              <td>
                <strong>{{ item.pegawai?.nip || '-' }}</strong>
              </td>
              <td>
                <strong>{{ item.pegawai?.nama || '-' }}</strong>
                <small>{{ item.pegawai?.jabatan || '-' }}</small>
              </td>
              <td>{{ item.pegawai?.unit_kerja || '-' }}</td>
              <td>{{ item.tanggal_berakhir || '-' }}</td>
              <td>
                <span
                  v-if="item.approval?.status === 'pending'"
                  class="status-pill info"
                >
                  Dalam Proses
                </span>

                <span
                  v-else-if="item.approval?.status === 'approved'"
                  class="status-pill success"
                >
                  Disetujui
                </span>

                <span
                  v-else-if="item.approval?.status === 'rejected'"
                  class="status-pill danger"
                >
                  Tidak Diperpanjang
                </span>

                <span
                  v-else
                  class="status-pill warning"
                >
                  Akan Berakhir
                </span>
              </td>
              <td class="text-end">
                <button
                  v-if="!item.approval"
                  type="button"
                  class="btn btn-sm btn-primary action-btn"
                  @click="ajukanPerpanjangan(item.id)"
                >
                  Ajukan
                </button>

                <span v-else class="text-muted small fw-bold">
                  Sudah diajukan
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination-row">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in paginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: page === currentPage }"
          @click="page !== '...' && changePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
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
  totalPegawai: Number,
  jumlahPegawaiAktif: Number,
  jumlahTerminasi: Number,
  pegawaiInternalAktif: Number,
  pegawaiPenugasanAktif: Number,
  terminasiInternal: Number,
  terminasiPenugasan: Number,
  kontrakAktif: Number,
  pendingApproval: Number,
  statusKontrak: Number,
  akanBerakhir: Number,
  sudahBerakhir: Number,
  kontrakAkanBerakhir: {
    type: Array,
    default: () => []
  },
  paginatedData: {
    type: Array,
    default: () => []
  },
  currentPage: Number,
  totalPages: Number,
  paginationPages: {
    type: Array,
    default: () => []
  },
  changePage: Function,
  loadDashboard: Function,
  ajukanPerpanjangan: Function
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

.info-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
  margin-bottom: 12px;
}

.info-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.info-card h6 {
  margin: 0;
  color: #111827;
  font-size: 14px;
  font-weight: 950;
}

.info-card p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  position: relative;
  min-height: 96px;
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
.summary-card.secondary { border-left-color: #64748b; }
.summary-card.warning { border-left-color: #f59e0b; }
.summary-card.danger { border-left-color: #dc2626; }

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
}

.summary-card small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.25;
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

.contract-card {
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.card-head {
  min-height: 45px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-bottom: 1px solid #e5e7eb;
}

.card-head h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.card-head small {
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

.dashboard-table {
  font-size: 12px;
}

.dashboard-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.dashboard-table tbody td {
  padding: 8px;
}

.dashboard-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.dashboard-table small {
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

.status-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.status-pill.danger {
  background: #fee2e2;
  color: #dc2626;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>