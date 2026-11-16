<template>
  <div class="pkwt-dashboard-pwa">
    <div class="pwa-head">
      <div class="head-icon">
        <i class="fas fa-file-signature"></i>
      </div>

      <div>
        <h5>Dashboard PKWT</h5>
        <p>Kontrak Pegawai</p>
      </div>

      <button type="button" :disabled="loading" @click="loadDashboard">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="summary-scroll">
      <div class="summary-card">
        <span>Pegawai Aktif</span>
        <strong>{{ jumlahPegawaiAktif }}</strong>
        <small>Total aktif</small>
      </div>

      <div class="summary-card danger">
        <span>Terminasi</span>
        <strong>{{ jumlahTerminasi }}</strong>
        <small>Non aktif</small>
      </div>

      <div class="summary-card success">
        <span>Internal</span>
        <strong>{{ pegawaiInternalAktif }}</strong>
        <small>Aktif</small>
      </div>

      <div class="summary-card info">
        <span>Penugasan</span>
        <strong>{{ pegawaiPenugasanAktif }}</strong>
        <small>Aktif</small>
      </div>

      <div class="summary-card success">
        <span>Kontrak</span>
        <strong>{{ kontrakAktif }}</strong>
        <small>Aktif</small>
      </div>

      <div class="summary-card warning">
        <span>Approval</span>
        <strong>{{ pendingApproval }}</strong>
        <small>Pending</small>
      </div>

      <div class="summary-card secondary">
        <span>TTD</span>
        <strong>{{ statusKontrak }}</strong>
        <small>Proses</small>
      </div>

      <div class="summary-card warning">
        <span>Akan Berakhir</span>
        <strong>{{ akanBerakhir }}</strong>
        <small>30 hari</small>
      </div>

      <div class="summary-card danger">
        <span>Expired</span>
        <strong>{{ sudahBerakhir }}</strong>
        <small>Berakhir</small>
      </div>
    </div>

    <div class="section-title">
      <div>
        <h6>Kontrak Akan Berakhir</h6>
        <span>Dalam 30 hari</span>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat dashboard...</span>
    </div>

    <div v-else-if="kontrakAkanBerakhir.length === 0" class="empty-card">
      <i class="fas fa-circle-check"></i>
      <strong>Tidak ada kontrak mendekati akhir</strong>
      <span>Semua kontrak masih dalam kondisi aman.</span>
    </div>

    <template v-else>
      <div
        v-for="item in paginatedData"
        :key="item.id"
        class="contract-card"
      >
        <div class="contract-top">
          <span>{{ item.pegawai?.nip || '-' }}</span>

          <strong>{{ item.tanggal_berakhir || '-' }}</strong>
        </div>

        <h6>{{ item.pegawai?.nama || '-' }}</h6>

        <p>
          {{ item.pegawai?.jabatan || '-' }}
          <br>
          {{ item.pegawai?.unit_kerja || '-' }}
        </p>

        <div class="contract-foot">
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

          <button
            v-if="!item.approval"
            type="button"
            @click="ajukanPerpanjangan(item.id)"
          >
            Ajukan
          </button>

          <small v-else>Sudah diajukan</small>
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
.pkwt-dashboard-pwa {
  padding: 2px;
  padding-bottom: 88px;
}

.pwa-head,
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

.summary-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.summary-card {
  min-width: 118px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 10px;
}

.summary-card.success { border-left-color: #16a34a; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.secondary { border-left-color: #64748b; }
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

.summary-card small {
  display: block;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 9.6px;
  font-weight: 850;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin: 7px 2px 8px;
}

.section-title h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.section-title span {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
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

.contract-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.contract-top span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 950;
}

.contract-top strong {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
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

.contract-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.status-pill {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.3px;
  font-weight: 950;
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

.contract-foot button {
  border: 0;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 950;
}

.contract-foot small {
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 800;
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