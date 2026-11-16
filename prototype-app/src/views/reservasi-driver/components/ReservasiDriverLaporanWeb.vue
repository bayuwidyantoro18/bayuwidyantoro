<template>
  <div class="container-fluid laporan-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Laporan Reservasi Driver</h3>
        <p class="page-subtitle">
          Laporan lengkap reservasi, approval, perjalanan, pembatalan, dan status driver.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm btn-success btn-compact"
          :disabled="exportingExcel"
          @click="exportExcel"
        >
          <i class="fas fa-file-excel me-1"></i>
          {{ exportingExcel ? 'Exporting...' : 'Excel' }}
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger btn-compact"
          :disabled="exportingPdf"
          @click="exportPdf"
        >
          <i class="fas fa-file-pdf me-1"></i>
          {{ exportingPdf ? 'Exporting...' : 'PDF' }}
        </button>

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
            <label class="compact-label">Status Reservasi</label>
            <select v-model="filter.status_reservasi" class="form-select form-select-sm compact-input">
              <option
                v-for="option in statusReservasiOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Status Perjalanan</label>
            <select v-model="filter.status_perjalanan" class="form-select form-select-sm compact-input">
              <option
                v-for="option in statusPerjalananOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Driver</label>
            <select v-model="filter.driver_id" class="form-select form-select-sm compact-input">
              <option value="">Semua Driver</option>
              <option
                v-for="driver in driverOptions"
                :key="driver.id"
                :value="driver.id"
              >
                {{ driver.nama_driver }}
              </option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Kendaraan</label>
            <select v-model="filter.kendaraan_id" class="form-select form-select-sm compact-input">
              <option value="">Semua Kendaraan</option>
              <option
                v-for="kendaraan in kendaraanOptions"
                :key="kendaraan.id"
                :value="kendaraan.id"
              >
                {{ kendaraan.nama_kendaraan }} - {{ kendaraan.nomor_polisi }}
              </option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Mulai</label>
            <input
              v-model="filter.tanggal_mulai"
              type="date"
              class="form-control form-control-sm compact-input"
            >
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Selesai</label>
            <input
              v-model="filter.tanggal_selesai"
              type="date"
              class="form-control form-control-sm compact-input"
            >
          </div>

          <div class="col-lg-10 col-md-8">
            <label class="compact-label">Keyword</label>
            <input
              v-model="filter.keyword"
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Kode reservasi, pemohon, unit kerja, tujuan, keperluan, alasan batal..."
              @keyup.enter="loadData(1)"
            >
          </div>

          <div class="col-lg-2 col-md-4">
            <button
              type="button"
              class="btn btn-sm btn-primary w-100 btn-search"
              @click="loadData(1)"
            >
              Tampilkan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-file-lines"></i>
          <span>Data Laporan</span>
        </div>

        <small>{{ pagination.total || 0 }} data</small>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat laporan...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          Tidak ada data laporan.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="min-width: 165px;">Kode</th>
                <th style="width: 130px;">Tanggal/Jam</th>
                <th style="min-width: 155px;">Pemohon</th>
                <th style="min-width: 190px;">Tujuan</th>
                <th style="min-width: 180px;">Driver/Kendaraan</th>
                <th style="width: 145px;">Status</th>
                <th style="width: 130px;">Waktu</th>
                <th style="width: 80px;">Detail</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td>
                  <strong>{{ item.kode_reservasi }}</strong>
                  <br>
                  <small class="text-muted">{{ item.unit_kerja || '-' }}</small>
                </td>

                <td>
                  {{ formatDate(item.tanggal_reservasi) }}
                  <br>
                  <small class="text-muted">
                    {{ item.jam_mulai }} - {{ item.jam_selesai_estimasi || '-' }}
                  </small>
                </td>

                <td>
                  {{ item.nama_pemohon || '-' }}
                  <br>
                  <small class="text-muted">{{ item.lokasi_jemput || '-' }}</small>
                </td>

                <td class="text-truncate-cell">
                  <strong>{{ item.tujuan_awal || '-' }}</strong>
                  <br>
                  <small class="text-muted">{{ item.keperluan || '-' }}</small>
                </td>

                <td>
                  {{ item.driver?.nama_driver || '-' }}
                  <br>
                  <small class="text-muted">
                    {{ item.kendaraan?.nama_kendaraan || '-' }}
                    {{ item.kendaraan?.nomor_polisi ? ' - ' + item.kendaraan.nomor_polisi : '' }}
                  </small>
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
                  <small>
                    Mulai: {{ formatShortDateTime(item.started_at) }}<br>
                    Selesai: {{ formatShortDateTime(item.finished_at) }}
                  </small>
                </td>

                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary action-btn"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
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
            <h6 class="mb-0 fw-bold">Detail Laporan Reservasi</h6>
            <small class="text-muted">{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeDetail"></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-grid">
            <div>
              <span>Kode Reservasi</span>
              <strong>{{ selected?.kode_reservasi || '-' }}</strong>
            </div>

            <div>
              <span>Tanggal Reservasi</span>
              <strong>{{ formatDate(selected?.tanggal_reservasi) }}</strong>
            </div>

            <div>
              <span>Jam</span>
              <strong>{{ selected?.jam_mulai || '-' }} - {{ selected?.jam_selesai_estimasi || '-' }}</strong>
            </div>

            <div>
              <span>Pemohon</span>
              <strong>{{ selected?.nama_pemohon || '-' }}</strong>
            </div>

            <div>
              <span>Unit Kerja</span>
              <strong>{{ selected?.unit_kerja || '-' }}</strong>
            </div>

            <div>
              <span>Lokasi Jemput</span>
              <strong>{{ selected?.lokasi_jemput || '-' }}</strong>
            </div>

            <div>
              <span>Driver</span>
              <strong>{{ selected?.driver?.nama_driver || '-' }}</strong>
            </div>

            <div>
              <span>Kendaraan</span>
              <strong>
                {{ selected?.kendaraan?.nama_kendaraan || '-' }}
                {{ selected?.kendaraan?.nomor_polisi ? ' - ' + selected.kendaraan.nomor_polisi : '' }}
              </strong>
            </div>

            <div>
              <span>Status Reservasi</span>
              <strong>{{ statusReservasiLabel(selected?.status_reservasi) }}</strong>
            </div>

            <div>
              <span>Status Perjalanan</span>
              <strong>{{ statusPerjalananLabel(selected?.status_perjalanan) }}</strong>
            </div>

            <div>
              <span>Waktu Input</span>
              <strong>{{ formatDateTime(selected?.created_at) }}</strong>
            </div>

            <div>
              <span>Waktu Update</span>
              <strong>{{ formatDateTime(selected?.updated_at) }}</strong>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Tujuan Awal</label>
            <div class="description-box">{{ selected?.tujuan_awal || '-' }}</div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Tujuan Selanjutnya</label>
            <div class="description-box">
              <template v-if="nextTujuans(selected).length">
                <ol class="mb-0 ps-3">
                  <li v-for="tujuan in nextTujuans(selected)" :key="tujuan.id">
                    <strong>{{ tujuan.tujuan }}</strong>
                    <small class="d-block text-muted">{{ tujuan.alamat_tujuan || '-' }}</small>
                  </li>
                </ol>
              </template>

              <template v-else>
                -
              </template>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Keperluan</label>
            <div class="description-box">{{ selected?.keperluan || '-' }}</div>
          </div>

          <div v-if="selected?.alasan_batal" class="mt-3">
            <label class="compact-label">Alasan Batal / Tidak Selesai</label>
            <div class="description-box">{{ selected?.alasan_batal }}</div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Waktu Perjalanan</label>

            <div class="detail-grid">
              <div>
                <span>Mulai</span>
                <strong>{{ formatDateTime(selected?.started_at) }}</strong>
              </div>

              <div>
                <span>Sampai</span>
                <strong>{{ formatDateTime(selected?.arrived_at) }}</strong>
              </div>

              <div>
                <span>Kembali</span>
                <strong>{{ formatDateTime(selected?.returned_at) }}</strong>
              </div>

              <div>
                <span>Selesai</span>
                <strong>{{ formatDateTime(selected?.finished_at) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="closeDetail"
          >
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
  exportingExcel: Boolean,
  exportingPdf: Boolean,
  list: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  pagination: { type: Object, required: true },
  detailModal: Boolean,
  selected: { type: Object, default: null },
  driverOptions: { type: Array, default: () => [] },
  kendaraanOptions: { type: Array, default: () => [] },
  statusReservasiOptions: { type: Array, default: () => [] },
  statusPerjalananOptions: { type: Array, default: () => [] },
  statusReservasiLabel: { type: Function, required: true },
  statusReservasiClass: { type: Function, required: true },
  statusPerjalananLabel: { type: Function, required: true },
  statusPerjalananClass: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  loadData: { type: Function, required: true },
  resetFilter: { type: Function, required: true },
  exportExcel: { type: Function, required: true },
  exportPdf: { type: Function, required: true },
  openDetail: { type: Function, required: true },
  closeDetail: { type: Function, required: true }
})

const formatShortDateTime = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const nextTujuans = (item) => {
  return (item?.tujuans || []).filter((tujuan) => Number(tujuan.urutan) > 1)
}
</script>

<style scoped>
.laporan-page {
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

.detail-modal {
  width: min(900px, 100%);
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

@media (max-width: 992px) {
  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>