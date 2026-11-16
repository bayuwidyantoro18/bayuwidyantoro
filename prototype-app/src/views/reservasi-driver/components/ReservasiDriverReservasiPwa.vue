<template>
  <div class="pwa-reservasi-page">
    <div class="pwa-header">
      <div class="header-icon">
        <i class="fas fa-calendar-plus"></i>
      </div>

      <div>
        <h5>Reservasi Driver</h5>
        <p>Kelola reservasi kendaraan operasional.</p>
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
        <option value="">Semua Status</option>
        <option value="pending">Menunggu Approval</option>
        <option value="approved">Disetujui</option>
        <option value="cancelled">Dibatalkan</option>
        <option value="completed">Selesai</option>
      </select>

      <div class="date-grid">
        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
      </div>

      <input
        v-model="filter.keyword"
        type="text"
        class="form-control form-control-sm compact-input"
        placeholder="Cari reservasi..."
        @keyup.enter="loadData(1)"
      >

      <button class="btn btn-sm btn-primary w-100 btn-action" @click="loadData(1)">
        Tampilkan Data
      </button>
    </div>

    <div class="toolbar-card">
      <div>
        <strong>Data Reservasi</strong>
        <small>Tambah reservasi baru atau kelola data reservasi.</small>
      </div>

      <button
        v-if="!formModal"
        type="button"
        class="btn btn-primary btn-sm"
        @click="openCreateModal"
      >
        <i class="fas fa-plus-circle me-1"></i>
        Tambah
      </button>

      <button
        v-else
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="closeFormModal"
      >
        <i class="fas fa-times me-1"></i>
        Tutup
      </button>
    </div>

    <transition name="slide-fade">
      <div v-if="formModal" class="form-collapse-card">
        <div class="form-head">
          <div>
            <h6>{{ isEdit ? 'Edit Reservasi' : 'Tambah Reservasi' }}</h6>
            <small>Lengkapi data reservasi driver.</small>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-light"
            @click="closeFormModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="form-body">
          <label class="compact-label">Tanggal Reservasi</label>
          <input
            v-model="form.tanggal_reservasi"
            type="date"
            class="form-control form-control-sm compact-input"
            :min="todayDate()"
          >

          <div class="time-grid">
            <div>
              <label class="compact-label">Jam Mulai</label>
              <input
                v-model="form.jam_mulai"
                type="time"
                class="form-control form-control-sm compact-input"
                :min="form.tanggal_reservasi === todayDate() ? currentTime() : null"
              >
            </div>

            <div>
              <label class="compact-label">Jam Selesai Estimasi</label>
              <input
                v-model="form.jam_selesai_estimasi"
                type="time"
                class="form-control form-control-sm compact-input"
              >
            </div>
          </div>

          <label class="compact-label">Unit Kerja</label>
          <input
            v-model="form.unit_kerja"
            type="text"
            class="form-control form-control-sm compact-input"
            readonly
          >

          <label class="compact-label">Lokasi Jemput</label>
          <input
            v-model="form.lokasi_jemput"
            type="text"
            class="form-control form-control-sm compact-input"
          >

          <label class="compact-label">Tujuan Awal</label>
          <input
            v-model="form.tujuan_awal"
            type="text"
            class="form-control form-control-sm compact-input"
          >

          <label class="compact-label">Keperluan</label>
          <textarea
            v-model="form.keperluan"
            rows="2"
            class="form-control form-control-sm compact-input"
          ></textarea>

          <label class="compact-label">Driver</label>
          <select
            v-model="form.driver_id"
            class="form-select form-select-sm compact-input"
          >
            <option value="">Belum dipilih</option>
            <option
              v-for="driver in driverOptions"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.nama_driver }}
            </option>
          </select>

          <label class="compact-label">Kendaraan</label>
          <select
            v-model="form.kendaraan_id"
            class="form-select form-select-sm compact-input"
          >
            <option value="">Belum dipilih</option>
            <option
              v-for="kendaraan in kendaraanOptions"
              :key="kendaraan.id"
              :value="kendaraan.id"
            >
              {{ kendaraan.nama_kendaraan }} - {{ kendaraan.nomor_polisi }}
            </option>
          </select>

          <div class="tujuan-section">
            <div class="tujuan-head">
              <strong>Tujuan Selanjutnya</strong>

              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="addTujuan"
              >
                <i class="fas fa-plus me-1"></i>
                Tambah
              </button>
            </div>

            <div
              v-for="(tujuan, index) in form.tujuans"
              :key="index"
              class="tujuan-item"
            >
              <input
                v-model="tujuan.tujuan"
                type="text"
                class="form-control form-control-sm compact-input"
                placeholder="Tujuan selanjutnya"
              >

              <input
                v-model="tujuan.alamat_tujuan"
                type="text"
                class="form-control form-control-sm compact-input"
                placeholder="Alamat tujuan"
              >

              <button
                type="button"
                class="btn btn-sm btn-outline-danger w-100"
                @click="removeTujuan(index)"
              >
                <i class="fas fa-trash me-1"></i>
                Hapus Tujuan
              </button>
            </div>
          </div>
        </div>

        <div class="form-action-row">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            :disabled="saving"
            @click="closeFormModal"
          >
            <i class="fas fa-times me-1"></i>
            Batal
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="saving"
            @click="submitForm"
          >
            <i class="fas fa-save me-1"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </transition>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat data...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Belum ada data reservasi.
    </div>

    <template v-else>
      <div
        v-for="item in list"
        :key="item.id"
        class="reservation-card"
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
        <span>Driver</span>
        <strong>{{ item.driver?.nama_driver || '-' }}</strong>
      </div>

      <div class="info-row">
        <span>Kendaraan</span>
        <strong>{{ item.kendaraan?.nomor_polisi || '-' }}</strong>
      </div>

      <div class="card-actions">
        <button class="btn btn-sm btn-outline-primary" @click="openDetail(item)">
          Detail
        </button>

        <button
          v-if="item.can_update"
          class="btn btn-sm btn-outline-warning"
          @click="openEditModal(item)"
        >
          Edit
        </button>

        <button
          v-if="item.can_cancel"
          class="btn btn-sm btn-outline-danger"
          @click="cancelReservasi(item)"
        >
          Batalkan
        </button>
      </div>
    </div>
    </template>

    <PaginationCompact
      :pagination="pagination"
      :loading="loading"
      @change-page="loadData"
    />

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
            <span>Driver</span>
            <strong>{{ selected?.driver?.nama_driver || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Kendaraan</span>
            <strong>{{ selected?.kendaraan?.nomor_polisi || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Keperluan</span>
            <strong>{{ selected?.keperluan || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Tujuan</span>
            <ol class="mb-0 ps-3">
              <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id">
                {{ tujuan.tujuan }}
              </li>
            </ol>
          </div>

          <div v-if="selected?.status_reservasi === 'cancelled'" class="info-box">
            <span>Pembatalan</span>
            <strong>{{ selected?.cancelled_by_name || '-' }}</strong>
            <p class="mb-0">{{ selected?.alasan_batal || '-' }}</p>
          </div>
        </div>

        <div class="sheet-foot">
          <button class="btn btn-sm btn-secondary" @click="closeDetail">
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
.pwa-reservasi-page {
  padding: 2px;
  padding-bottom: 18px;
}

.pwa-header,
.filter-card,
.reservation-card,
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
  background: #eef2ff;
  color: #1d4ed8;
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
.card-top,
.tujuan-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.filter-head strong,
.tujuan-head strong {
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

.btn-action,
.btn-add {
  font-size: 12px;
  font-weight: 800;
  border-radius: 10px;
}

.btn-add {
  margin-bottom: 10px;
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

.tujuan-section,
.info-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
}

.tujuan-item {
  border-top: 1px solid #f1f5f9;
  padding-top: 9px;
  margin-top: 9px;
}

.toolbar-card,
.form-collapse-card {
  background: #f8fafc;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
}

.toolbar-card > div {
  flex: 1;
  min-width: 0;
}

.toolbar-card .btn {
  flex-shrink: 0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}

.toolbar-card strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.toolbar-card small {
  display: block;
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
  line-height: 1.3;
}

.form-collapse-card {
  border-color: #dbeafe;
  background: #f8fafc;
}

.form-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.form-head h6 {
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 1px;
  color: #111827;
}

.form-head small {
  font-size: 11px;
  color: #64748b;
}

.form-body {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px;
}

.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.form-action-row .btn {
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 6px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.22s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

:global(.swal2-container) {
  z-index: 99999 !important;
}
</style>