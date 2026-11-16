<template>
  <div class="container-fluid perjalanan-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Perjalanan Driver</h3>
        <p class="page-subtitle">
          Kontrol perjalanan driver mulai dari mulai, sampai, standby, kembali, lanjut, hingga selesai.
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

        <button type="button" class="btn btn-sm btn-outline-secondary btn-compact" @click="resetFilter">
          Reset
        </button>
      </div>

      <div class="compact-card-body">
        <div class="row g-2 align-items-end">
          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Status Perjalanan</label>
            <select v-model="filter.status_perjalanan" class="form-select form-select-sm compact-input">
              <option value="">Semua</option>
              <option value="belum_mulai">Belum Mulai</option>
              <option value="menuju_lokasi">Menuju Lokasi</option>
              <option value="sampai_lokasi">Sampai Lokasi</option>
              <option value="standby_lokasi">Standby Lokasi</option>
              <option value="perjalanan_pulang">Perjalanan Pulang</option>
              <option value="lanjut_tujuan">Lanjut Tujuan</option>
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
          <i class="fas fa-route"></i>
          <span>Data Perjalanan Aktif</span>
        </div>

        <small>{{ pagination.total || 0 }} data</small>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data perjalanan...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          Belum ada perjalanan aktif.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="min-width: 165px;">Kode</th>
                <th style="width: 130px;">Tanggal/Jam</th>
                <th style="min-width: 145px;">Pemohon</th>
                <th>Tujuan Saat Ini</th>
                <th style="min-width: 145px;">Driver</th>
                <th style="width: 135px;">Status</th>
                <th style="min-width: 240px;">Kontrol</th>
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
                  <strong>{{ item.current_tujuan?.tujuan || item.tujuan_awal || '-' }}</strong>
                  <br>
                  <small class="text-muted">
                    Berikutnya: {{ item.next_tujuan?.tujuan || '-' }}
                  </small>
                </td>

                <td>
                  {{ item.driver?.nama_driver || '-' }}
                  <br>
                  <small class="text-muted">{{ item.kendaraan?.nomor_polisi || '-' }}</small>
                </td>

                <td>
                  <span class="badge status-badge mb-1" :class="statusReservasiClass(item.status_reservasi)">
                    {{ statusReservasiLabel(item.status_reservasi) }}
                  </span>
                  <br>
                  <span class="badge status-badge" :class="statusPerjalananClass(item.status_perjalanan)">
                    {{ statusPerjalananLabel(item.status_perjalanan) }}
                  </span>
                </td>

                <td>
                  <div class="control-actions">
                    <button class="btn btn-sm btn-outline-primary control-btn" @click="openDetail(item)">
                      Detail
                    </button>

                    <button
                      v-if="item.can_start"
                      class="btn btn-sm btn-primary control-btn"
                      :disabled="processingId === item.id"
                      @click="startTrip(item)"
                    >
                      Mulai
                    </button>

                    <button
                      v-if="item.can_arrived"
                      class="btn btn-sm btn-success control-btn"
                      :disabled="processingId === item.id"
                      @click="arrivedTrip(item)"
                    >
                      Sampai
                    </button>

                    <button
                      v-if="item.can_standby"
                      class="btn btn-sm btn-warning control-btn"
                      :disabled="processingId === item.id"
                      @click="standbyTrip(item)"
                    >
                      Standby
                    </button>

                    <button
                      v-if="item.can_return_office"
                      class="btn btn-sm btn-info control-btn"
                      :disabled="processingId === item.id"
                      @click="returnOffice(item)"
                    >
                      Kembali
                    </button>

                    <button
                      v-if="item.can_continue_trip"
                      class="btn btn-sm btn-indigo control-btn"
                      :disabled="processingId === item.id"
                      @click="continueTrip(item)"
                    >
                      Lanjut
                    </button>

                    <button
                      v-if="item.can_finish"
                      class="btn btn-sm btn-success control-btn"
                      :disabled="processingId === item.id"
                      @click="finishTrip(item)"
                    >
                      Selesai
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

    <div v-if="detailModal" class="modal-backdrop-custom">
      <div class="detail-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">Detail Perjalanan</h6>
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
            <div><span>Status</span><strong>{{ statusPerjalananLabel(selected?.status_perjalanan) }}</strong></div>
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
            <label class="compact-label">Daftar Tujuan</label>
            <div class="description-box">
              <ol class="mb-0 ps-3">
                <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id" class="mb-2">
                  <strong>{{ tujuan.tujuan }}</strong>
                  <br>
                  <small>{{ tujuan.alamat_tujuan || '-' }}</small>
                  <br>
                  <span class="badge bg-light text-dark border mt-1">{{ tujuan.status_tujuan }}</span>
                </li>
              </ol>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Waktu Perjalanan</label>
            <div class="detail-grid">
              <div><span>Mulai</span><strong>{{ formatDateTime(selected?.started_at) }}</strong></div>
              <div><span>Sampai</span><strong>{{ formatDateTime(selected?.arrived_at) }}</strong></div>
              <div><span>Kembali</span><strong>{{ formatDateTime(selected?.returned_at) }}</strong></div>
              <div><span>Selesai</span><strong>{{ formatDateTime(selected?.finished_at) }}</strong></div>
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
  processingId: { type: [Number, String, null], default: null },
  list: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  pagination: { type: Object, required: true },
  detailModal: Boolean,
  selected: { type: Object, default: null },
  statusReservasiLabel: { type: Function, required: true },
  statusReservasiClass: { type: Function, required: true },
  statusPerjalananLabel: { type: Function, required: true },
  statusPerjalananClass: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  loadData: { type: Function, required: true },
  resetFilter: { type: Function, required: true },
  openDetail: { type: Function, required: true },
  closeDetail: { type: Function, required: true },
  startTrip: { type: Function, required: true },
  arrivedTrip: { type: Function, required: true },
  standbyTrip: { type: Function, required: true },
  returnOffice: { type: Function, required: true },
  continueTrip: { type: Function, required: true },
  finishTrip: { type: Function, required: true }
})
</script>

<style scoped>
.perjalanan-page {
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

.text-truncate-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.control-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.control-btn {
  font-size: 11px;
  font-weight: 800;
  border-radius: 7px;
  padding: 3px 7px;
}

.btn-indigo {
  background: #6366f1;
  color: #ffffff;
  border-color: #6366f1;
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

.detail-modal {
  width: min(800px, 100%);
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
}

.modal-body-custom {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid div,
.description-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 8px;
}

.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

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