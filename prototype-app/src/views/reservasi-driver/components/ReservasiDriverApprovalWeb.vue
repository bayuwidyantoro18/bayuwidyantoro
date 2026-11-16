<template>
  <div class="container-fluid approval-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Approval Reservasi Driver</h3>
        <p class="page-subtitle">
          Persetujuan reservasi kendaraan operasional oleh driver / admin.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary btn-compact"
        :disabled="loading"
        @click="loadData(pagination.current_page)"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="card compact-card mb-3">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-filter"></i>
          <span>Filter Data</span>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-secondary btn-compact"
          @click="resetFilter"
        >
          Reset
        </button>
      </div>

      <div class="compact-card-body">
        <div class="row g-2 align-items-end">
          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Status</label>
            <select v-model="filter.status" class="form-select form-select-sm compact-input">
              <option value="pending">Menunggu Approval</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="">Semua</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Mulai</label>
            <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Selesai</label>
            <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
          </div>

          <div class="col-lg-4 col-md-6">
            <label class="compact-label">Keyword</label>
            <input
              v-model="filter.keyword"
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Kode, pemohon, tujuan, keperluan..."
              @keyup.enter="loadData(1)"
            >
          </div>

          <div class="col-lg-2 col-md-12">
            <button class="btn btn-sm btn-primary w-100 btn-search" @click="loadData(1)">
              Tampilkan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-clipboard-check"></i>
          <span>Daftar Approval</span>
        </div>

        <small>{{ pagination.total || 0 }} data</small>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data approval...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          Tidak ada reservasi yang perlu diproses.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="min-width: 170px;">Kode</th>
                <th style="width: 130px;">Tanggal/Jam</th>
                <th style="min-width: 150px;">Pemohon</th>
                <th>Tujuan</th>
                <th style="min-width: 140px;">Driver</th>
                <th style="width: 120px;">Status</th>
                <th style="width: 125px;">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td>
                  <div class="fw-bold">{{ item.kode_reservasi }}</div>
                  <small class="text-muted">{{ item.unit_kerja || '-' }}</small>
                </td>

                <td>
                  {{ formatDate(item.tanggal_reservasi) }}
                  <br>
                  <small class="text-muted">{{ item.jam_mulai }} - {{ item.jam_selesai_estimasi || '-' }}</small>
                </td>

                <td>{{ item.nama_pemohon || '-' }}</td>

                <td class="text-truncate-cell">
                  <strong>{{ item.tujuan_awal || '-' }}</strong>
                  <br>
                  <small class="text-muted">{{ item.keperluan || '-' }}</small>
                </td>

                <td>
                  {{ item.driver?.nama_driver || '-' }}
                  <br>
                  <small class="text-muted">{{ item.kendaraan?.nomor_polisi || '-' }}</small>
                </td>

                <td>
                  <span class="badge status-badge" :class="statusClass(item.status_reservasi)">
                    {{ statusLabel(item.status_reservasi) }}
                  </span>
                </td>

                <td>
                  <div class="d-flex gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary action-btn"
                      title="Detail"
                      @click="openDetail(item)"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <button
                      v-if="item.can_approve"
                      class="btn btn-sm btn-outline-success action-btn"
                      title="Approve"
                      @click="openApproveModal(item)"
                    >
                      <i class="fas fa-check"></i>
                    </button>

                    <button
                      v-if="item.can_reject"
                      class="btn btn-sm btn-outline-danger action-btn"
                      title="Tolak"
                      @click="rejectReservasi(item)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationCompact
          :pagination="pagination"
          :loading="loading"
          @change-page="loadData"
        />
      </div>
    </div>

    <div v-if="approveModal" class="modal-backdrop-custom">
      <div class="approval-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">Approve Reservasi</h6>
            <small class="text-muted">{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeApproveModal"></button>
        </div>

        <div class="modal-body-custom">
          <div class="approval-info">
            <div>
              <span>Pemohon</span>
              <strong>{{ selected?.nama_pemohon || '-' }}</strong>
            </div>
            <div>
              <span>Tujuan</span>
              <strong>{{ selected?.tujuan_awal || '-' }}</strong>
            </div>
            <div>
              <span>Jadwal</span>
              <strong>{{ formatDate(selected?.tanggal_reservasi) }} • {{ selected?.jam_mulai }}</strong>
            </div>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label class="compact-label">Driver</label>
              <select v-model="approveForm.driver_id" class="form-select form-select-sm compact-input">
                <option value="">Pilih Driver</option>
                <option v-for="driver in driverOptions" :key="driver.id" :value="driver.id">
                  {{ driver.nama_driver }} - {{ driver.status_driver }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="compact-label">Kendaraan</label>
              <select v-model="approveForm.kendaraan_id" class="form-select form-select-sm compact-input">
                <option value="">Pilih Kendaraan</option>
                <option v-for="kendaraan in kendaraanOptions" :key="kendaraan.id" :value="kendaraan.id">
                  {{ kendaraan.nama_kendaraan }} - {{ kendaraan.nomor_polisi }} - {{ kendaraan.status_kendaraan }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="saving" @click="closeApproveModal">
            Batal
          </button>

          <button type="button" class="btn btn-sm btn-success" :disabled="saving" @click="submitApprove">
            <i class="fas fa-check me-1"></i>
            {{ saving ? 'Memproses...' : 'Approve' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="detailModal" class="modal-backdrop-custom">
      <div class="detail-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">Detail Reservasi</h6>
            <small class="text-muted">{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeDetail"></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-grid">
            <div><span>Pemohon</span><strong>{{ selected?.nama_pemohon || '-' }}</strong></div>
            <div><span>Tanggal</span><strong>{{ formatDate(selected?.tanggal_reservasi) }}</strong></div>
            <div><span>Jam</span><strong>{{ selected?.jam_mulai }} - {{ selected?.jam_selesai_estimasi || '-' }}</strong></div>
            <div><span>Driver</span><strong>{{ selected?.driver?.nama_driver || '-' }}</strong></div>
            <div><span>Kendaraan</span><strong>{{ selected?.kendaraan?.nomor_polisi || '-' }}</strong></div>
            <div><span>Status</span><strong>{{ statusLabel(selected?.status_reservasi) }}</strong></div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Lokasi Jemput</label>
            <div class="description-box">{{ selected?.lokasi_jemput || '-' }}</div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Keperluan</label>
            <div class="description-box">{{ selected?.keperluan || '-' }}</div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Tujuan</label>
            <div class="description-box">
              <ol class="mb-0 ps-3">
                <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id">
                  {{ tujuan.tujuan }}
                  <small class="text-muted d-block">{{ tujuan.alamat_tujuan || '-' }}</small>
                </li>
              </ol>
            </div>
          </div>

          <div v-if="selected?.status_reservasi === 'rejected' || selected?.status_reservasi === 'cancelled'" class="mt-3">
            <label class="compact-label">Informasi Penolakan / Pembatalan</label>
            <div class="description-box">
              <strong>{{ selected?.cancelled_by_name || '-' }}</strong>
              <br>
              {{ selected?.alasan_batal || '-' }}
            </div>
          </div>
        </div>

        <div class="modal-foot">
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
.approval-page {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 2px;
}

.page-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 0;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
}

.compact-card-header {
  min-height: 38px;
  padding: 7px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compact-card-body {
  padding: 10px 12px;
  background: #ffffff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 900;
}

.btn-compact,
.btn-search {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 7px;
  padding: 4px 9px;
}

.compact-label {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.compact-input {
  font-size: 12px;
  min-height: 29px;
  border-radius: 7px;
}

.compact-table {
  font-size: 12px;
}

.compact-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  border-bottom: 1px solid #d1d5db;
  padding: 7px 8px;
}

.compact-table tbody td {
  padding: 7px 8px;
}

.compact-loading,
.compact-empty {
  min-height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.status-badge {
  font-size: 10.5px;
  border-radius: 999px;
  padding: 4px 7px;
}

.action-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-truncate-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}

.approval-modal,
.detail-modal {
  width: min(760px, 100%);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.24);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-head,
.modal-foot {
  padding: 12px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-foot {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
  justify-content: flex-end;
  gap: 8px;
}

.modal-body-custom {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.approval-info,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.approval-info div,
.detail-grid div,
.description-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 8px;
}

.approval-info span,
.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.approval-info strong,
.detail-grid strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  word-break: break-word;
}

.description-box {
  font-size: 12px;
}

:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>