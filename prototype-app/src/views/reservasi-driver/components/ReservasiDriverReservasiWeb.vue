<template>
  <div class="container-fluid reservasi-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Reservasi Driver</h3>
        <p class="page-subtitle">
          Kelola data reservasi kendaraan operasional.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-primary btn-compact"
        @click="openCreateModal"
      >
        <i class="fas fa-plus-circle me-1"></i>
        Tambah Reservasi
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
              <option value="">Semua</option>
              <option value="pending">Menunggu Approval</option>
              <option value="approved">Disetujui</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="completed">Selesai</option>
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
          <i class="fas fa-calendar-plus"></i>
          <span>Data Reservasi</span>
        </div>

        <button class="btn btn-sm btn-outline-primary btn-compact" :disabled="loading" @click="loadData(pagination.current_page)">
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat data reservasi...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          Belum ada data reservasi.
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
                <th style="width: 92px;">Action</th>
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
                      v-if="item.can_update"
                      class="btn btn-sm btn-outline-warning action-btn"
                      title="Edit"
                      @click="openEditModal(item)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      v-if="item.can_cancel"
                      class="btn btn-sm btn-outline-danger action-btn"
                      title="Batalkan"
                      @click="cancelReservasi(item)"
                    >
                      <i class="fas fa-ban"></i>
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

    <div v-if="formModal" class="modal-backdrop-custom">
      <div class="form-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">{{ isEdit ? 'Edit Reservasi' : 'Tambah Reservasi' }}</h6>
            <small class="text-muted">Lengkapi data reservasi driver.</small>
          </div>

          <button type="button" class="btn-close" @click="closeFormModal"></button>
        </div>

        <div class="modal-body-custom">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="compact-label">Tanggal Reservasi</label>
                <input
                v-model="form.tanggal_reservasi"
                type="date"
                class="form-control form-control-sm compact-input"
                :min="todayDate()"
                >
            </div>

            <div class="col-md-4">
              <label class="compact-label">Jam Mulai</label>
                <input
                v-model="form.jam_mulai"
                type="time"
                class="form-control form-control-sm compact-input"
                :min="form.tanggal_reservasi === todayDate() ? currentTime() : null"
                >
            </div>

            <div class="col-md-4">
              <label class="compact-label">Jam Selesai Estimasi</label>
              <input v-model="form.jam_selesai_estimasi" type="time" class="form-control form-control-sm compact-input">
            </div>

            <div class="col-md-6">
              <label class="compact-label">Unit Kerja</label>
                <input
                v-model="form.unit_kerja"
                type="text"
                class="form-control form-control-sm compact-input"
                readonly
                >
            </div>

            <div class="col-md-6">
              <label class="compact-label">Lokasi Jemput</label>
              <input v-model="form.lokasi_jemput" type="text" class="form-control form-control-sm compact-input">
            </div>

            <div class="col-md-12">
              <label class="compact-label">Tujuan Awal</label>
              <input v-model="form.tujuan_awal" type="text" class="form-control form-control-sm compact-input">
            </div>

            <div class="col-md-12">
              <label class="compact-label">Keperluan</label>
              <textarea v-model="form.keperluan" rows="2" class="form-control form-control-sm compact-input"></textarea>
            </div>

            <div class="col-md-6">
              <label class="compact-label">Driver</label>
              <select v-model="form.driver_id" class="form-select form-select-sm compact-input">
                <option value="">Belum dipilih</option>
                <option v-for="driver in driverOptions" :key="driver.id" :value="driver.id">
                  {{ driver.nama_driver }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="compact-label">Kendaraan</label>
              <select v-model="form.kendaraan_id" class="form-select form-select-sm compact-input">
                <option value="">Belum dipilih</option>
                <option v-for="kendaraan in kendaraanOptions" :key="kendaraan.id" :value="kendaraan.id">
                  {{ kendaraan.nama_kendaraan }} - {{ kendaraan.nomor_polisi }}
                </option>
              </select>
            </div>
          </div>

          <div class="tujuan-box mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="compact-label mb-0">Tujuan Selanjutnya</label>

              <button type="button" class="btn btn-sm btn-outline-primary btn-compact" @click="addTujuan">
                <i class="fas fa-plus me-1"></i>
                Tambah Tujuan
              </button>
            </div>

            <div
              v-for="(tujuan, index) in form.tujuans"
              :key="index"
              class="tujuan-item"
            >
              <div class="row g-2">
                <div class="col-md-5">
                  <input v-model="tujuan.tujuan" type="text" class="form-control form-control-sm compact-input" placeholder="Tujuan Selanjutnya">
                </div>

                <div class="col-md-5">
                  <input v-model="tujuan.alamat_tujuan" type="text" class="form-control form-control-sm compact-input" placeholder="Alamat / detail tujuan">
                </div>

                <div class="col-md-2">
                  <button type="button" class="btn btn-sm btn-outline-danger w-100" @click="removeTujuan(index)">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="saving" @click="closeFormModal">
            Batal
            </button>

          <button class="btn btn-sm btn-primary" :disabled="saving" @click="submitForm">
            <i class="fas fa-save me-1"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
                <label class="compact-label">Keperluan</label>
                <div class="description-box">{{ selected?.keperluan || '-' }}</div>
            </div>

            <div class="mt-3">
                <label class="compact-label">Tujuan Selanjutnya</label>
                <div class="description-box">
                <ol class="mb-0 ps-3">
                    <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id">
                    {{ tujuan.tujuan }}
                    <small class="text-muted d-block">{{ tujuan.alamat_tujuan || '-' }}</small>
                    </li>
                </ol>
                </div>
            </div>

            <div v-if="selected?.status_reservasi === 'cancelled'" class="mt-3">
                <label class="compact-label">Informasi Pembatalan</label>
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
  list: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  formModal: Boolean,
  detailModal: Boolean,
  isEdit: Boolean,
  selected: {
    type: Object,
    default: null
  },
  driverOptions: {
    type: Array,
    default: () => []
  },
  kendaraanOptions: {
    type: Array,
    default: () => []
  },
  statusLabel: {
    type: Function,
    required: true
  },
  statusClass: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  loadData: {
    type: Function,
    required: true
  },
  resetFilter: {
    type: Function,
    required: true
  },
  openCreateModal: {
    type: Function,
    required: true
  },
  openEditModal: {
    type: Function,
    required: true
  },
  closeFormModal: {
    type: Function,
    required: true
  },
  submitForm: {
    type: Function,
    required: true
  },
  cancelReservasi: {
    type: Function,
    required: true
  },
  openDetail: {
    type: Function,
    required: true
  },
  closeDetail: {
    type: Function,
    required: true
  },
  addTujuan: {
    type: Function,
    required: true
  },
  removeTujuan: {
    type: Function,
    required: true
  },
  todayDate: {
    type: Function, 
    required: true
  },
  currentTime: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.reservasi-page {
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

.form-modal,
.detail-modal {
  width: min(850px, 100%);
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

.tujuan-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 10px;
}

.tujuan-item {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
  margin-top: 8px;
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