<template>
  <div class="pwa-approval-page">
    <div class="pwa-header">
      <div class="header-icon">
        <i class="fas fa-clipboard-check"></i>
      </div>

      <div>
        <h5>Approval Driver</h5>
        <p>Proses persetujuan reservasi kendaraan.</p>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-head">
        <strong>Filter Data</strong>

        <button class="btn btn-sm btn-outline-secondary" @click="resetFilter">
          Reset
        </button>
      </div>

      <select v-model="filter.status" class="form-select form-select-sm compact-input">
        <option value="pending">Menunggu Approval</option>
        <option value="approved">Disetujui</option>
        <option value="rejected">Ditolak</option>
        <option value="cancelled">Dibatalkan</option>
        <option value="">Semua</option>
      </select>

      <div class="date-grid">
        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
      </div>

      <input
        v-model="filter.keyword"
        type="text"
        class="form-control form-control-sm compact-input"
        placeholder="Cari approval..."
        @keyup.enter="loadData(1)"
      >

      <button class="btn btn-sm btn-primary w-100 btn-action" @click="loadData(1)">
        Tampilkan Data
      </button>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Tidak ada reservasi yang perlu diproses.
    </div>

    <template v-else>
      <div
        v-for="item in list"
        :key="item.id"
        class="approval-card"
      >
        <div class="card-top">
          <div>
            <h6>{{ item.kode_reservasi }}</h6>
            <small>{{ formatDate(item.tanggal_reservasi) }} • {{ item.jam_mulai }}</small>
          </div>

          <span class="badge" :class="statusClass(item.status_reservasi)">
            {{ statusLabel(item.status_reservasi) }}
          </span>
        </div>

        <div class="info-row">
          <span>Pemohon</span>
          <strong>{{ item.nama_pemohon || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Tujuan</span>
          <strong>{{ item.tujuan_awal || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Keperluan</span>
          <strong>{{ item.keperluan || '-' }}</strong>
        </div>

        <div class="card-actions">
          <button class="btn btn-sm btn-outline-primary" @click="openDetail(item)">
            Detail
          </button>

          <button
            v-if="item.can_approve"
            class="btn btn-sm btn-outline-success"
            @click="openApproveModal(item)"
          >
            Approve
          </button>

          <button
            v-if="item.can_reject"
            class="btn btn-sm btn-outline-danger"
            @click="rejectReservasi(item)"
          >
            Tolak
          </button>
        </div>
      </div>
    </template>

    <PaginationCompact
      :pagination="pagination"
      :loading="loading"
      @change-page="loadData"
    />

    <div v-if="approveModal" class="pwa-modal-backdrop">
      <div class="pwa-bottom-sheet">
        <div class="sheet-head">
          <div>
            <h6>Approve Reservasi</h6>
            <small>{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeApproveModal"></button>
        </div>

        <div class="sheet-body">
          <div class="info-box">
            <span>Pemohon</span>
            <strong>{{ selected?.nama_pemohon || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Tujuan</span>
            <strong>{{ selected?.tujuan_awal || '-' }}</strong>
          </div>

          <label class="compact-label">Driver</label>
          <select v-model="approveForm.driver_id" class="form-select form-select-sm compact-input">
            <option value="">Pilih Driver</option>
            <option v-for="driver in driverOptions" :key="driver.id" :value="driver.id">
              {{ driver.nama_driver }} - {{ driver.status_driver }}
            </option>
          </select>

          <label class="compact-label">Kendaraan</label>
          <select v-model="approveForm.kendaraan_id" class="form-select form-select-sm compact-input">
            <option value="">Pilih Kendaraan</option>
            <option v-for="kendaraan in kendaraanOptions" :key="kendaraan.id" :value="kendaraan.id">
              {{ kendaraan.nama_kendaraan }} - {{ kendaraan.nomor_polisi }} - {{ kendaraan.status_kendaraan }}
            </option>
          </select>
        </div>

        <div class="sheet-foot">
          <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="saving" @click="closeApproveModal">
            Batal
          </button>

          <button type="button" class="btn btn-sm btn-success" :disabled="saving" @click="submitApprove">
            {{ saving ? 'Memproses...' : 'Approve' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="detailModal" class="pwa-modal-backdrop">
      <div class="pwa-bottom-sheet">
        <div class="sheet-head">
          <div>
            <h6>Detail Reservasi</h6>
            <small>{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeDetail"></button>
        </div>

        <div class="sheet-body">
          <div class="info-box">
            <span>Pemohon</span>
            <strong>{{ selected?.nama_pemohon || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Tanggal / Jam</span>
            <strong>{{ formatDate(selected?.tanggal_reservasi) }} • {{ selected?.jam_mulai }}</strong>
          </div>

          <div class="info-box">
            <span>Lokasi Jemput</span>
            <strong>{{ selected?.lokasi_jemput || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Tujuan</span>
            <ol class="mb-0 ps-3">
              <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id">
                {{ tujuan.tujuan }}
              </li>
            </ol>
          </div>

          <div class="info-box">
            <span>Keperluan</span>
            <strong>{{ selected?.keperluan || '-' }}</strong>
          </div>

          <div v-if="selected?.status_reservasi === 'rejected' || selected?.status_reservasi === 'cancelled'" class="info-box">
            <span>Penolakan / Pembatalan</span>
            <strong>{{ selected?.cancelled_by_name || '-' }}</strong>
            <p class="mb-0">{{ selected?.alasan_batal || '-' }}</p>
          </div>
        </div>

        <div class="sheet-foot">
          <button type="button" class="btn btn-sm btn-secondary" @click="closeDetail">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PaginationCompact from '../../../components/PaginationCompact.vue'

defineProps({
  loading: Boolean,
  saving: Boolean,
  list: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  pagination: { type: Object, required: true },
  approveModal: Boolean,
  detailModal: Boolean,
  selected: { type: Object, default: null },
  approveForm: { type: Object, required: true },
  driverOptions: { type: Array, default: () => [] },
  kendaraanOptions: { type: Array, default: () => [] },
  statusLabel: { type: Function, required: true },
  statusClass: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  loadData: { type: Function, required: true },
  resetFilter: { type: Function, required: true },
  openApproveModal: { type: Function, required: true },
  closeApproveModal: { type: Function, required: true },
  submitApprove: { type: Function, required: true },
  rejectReservasi: { type: Function, required: true },
  openDetail: { type: Function, required: true },
  closeDetail: { type: Function, required: true }
})
</script>

<style scoped>
.pwa-approval-page {
  padding: 2px;
  padding-bottom: 82px;
}

.pwa-header,
.filter-card,
.approval-card,
.loading-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.pwa-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #ecfdf5;
  color: #15803d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pwa-header h5 {
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 2px;
  color: #111827;
}

.pwa-header p {
  font-size: 11.5px;
  margin-bottom: 0;
  color: #64748b;
}

.filter-head,
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.filter-head strong {
  font-size: 12.5px;
  color: #111827;
}

.compact-input {
  font-size: 12px;
  min-height: 31px;
  border-radius: 9px;
  margin-bottom: 8px;
}

.compact-label {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-action {
  font-size: 12px;
  font-weight: 800;
  border-radius: 10px;
}

.loading-card,
.empty-card {
  min-height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-size: 12px;
  gap: 8px;
}

.card-top h6 {
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 1px;
  color: #111827;
}

.card-top small {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 700;
}

.info-row,
.info-box {
  border-top: 1px solid #f1f5f9;
  padding: 7px 0;
}

.info-row span,
.info-box span {
  display: block;
  font-size: 10px;
  color: #64748b;
  font-weight: 800;
}

.info-row strong,
.info-box strong {
  display: block;
  font-size: 12px;
  color: #111827;
  word-break: break-word;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin-top: 9px;
}

.card-actions .btn {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 9px;
}

.pwa-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-end;
}

.pwa-bottom-sheet {
  width: 100%;
  max-height: 92vh;
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sheet-head,
.sheet-foot {
  padding: 12px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-head h6 {
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 1px;
}

.sheet-head small {
  font-size: 11px;
  color: #64748b;
}

.sheet-body {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.sheet-foot {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
  justify-content: flex-end;
  gap: 8px;
}

.info-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
}

:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>