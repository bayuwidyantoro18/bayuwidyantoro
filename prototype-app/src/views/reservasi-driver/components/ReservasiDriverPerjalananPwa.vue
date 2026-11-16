<template>
  <div class="pwa-perjalanan-page">
    <div class="pwa-header">
      <div class="header-icon">
        <i class="fas fa-route"></i>
      </div>

      <div>
        <h5>Perjalanan Driver</h5>
        <p>Kontrol perjalanan driver secara realtime.</p>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-head">
        <strong>Filter Data</strong>

        <button class="btn btn-sm btn-outline-secondary" @click="resetFilter">
          Reset
        </button>
      </div>

      <select v-model="filter.status_perjalanan" class="form-select form-select-sm compact-input">
        <option value="">Semua Status</option>
        <option value="belum_mulai">Belum Mulai</option>
        <option value="menuju_lokasi">Menuju Lokasi</option>
        <option value="sampai_lokasi">Sampai Lokasi</option>
        <option value="standby_lokasi">Standby Lokasi</option>
        <option value="perjalanan_pulang">Perjalanan Pulang</option>
        <option value="lanjut_tujuan">Lanjut Tujuan</option>
      </select>

      <div class="date-grid">
        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
      </div>

      <input
        v-model="filter.keyword"
        type="text"
        class="form-control form-control-sm compact-input"
        placeholder="Cari perjalanan..."
        @keyup.enter="loadData(1)"
      >

      <button class="btn btn-sm btn-primary w-100 btn-action" @click="loadData(1)">
        Tampilkan Data
      </button>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat perjalanan...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Belum ada perjalanan aktif.
    </div>

    <template v-else>
      <div
        v-for="item in list"
        :key="item.id"
        class="trip-card"
      >
        <div class="card-top">
          <div>
            <h6>{{ item.kode_reservasi }}</h6>
            <small>{{ formatDate(item.tanggal_reservasi) }} • {{ item.jam_mulai }}</small>
          </div>

          <span class="badge" :class="statusPerjalananClass(item.status_perjalanan)">
            {{ statusPerjalananLabel(item.status_perjalanan) }}
          </span>
        </div>

        <div class="info-row">
          <span>Pemohon</span>
          <strong>{{ item.nama_pemohon || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Driver</span>
          <strong>{{ item.driver?.nama_driver || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Kendaraan</span>
          <strong>{{ item.kendaraan?.nomor_polisi || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Tujuan Saat Ini</span>
          <strong>{{ item.current_tujuan?.tujuan || item.tujuan_awal || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Tujuan Berikutnya</span>
          <strong>{{ item.next_tujuan?.tujuan || '-' }}</strong>
        </div>

        <div class="card-actions">
          <button class="btn btn-sm btn-outline-primary" @click="openDetail(item)">
            Detail
          </button>

          <button
            v-if="item.can_start"
            class="btn btn-sm btn-primary"
            :disabled="processingId === item.id"
            @click="startTrip(item)"
          >
            Mulai
          </button>

          <button
            v-if="item.can_arrived"
            class="btn btn-sm btn-success"
            :disabled="processingId === item.id"
            @click="arrivedTrip(item)"
          >
            Sampai
          </button>

          <button
            v-if="item.can_standby"
            class="btn btn-sm btn-warning"
            :disabled="processingId === item.id"
            @click="standbyTrip(item)"
          >
            Standby
          </button>

          <button
            v-if="item.can_return_office"
            class="btn btn-sm btn-info"
            :disabled="processingId === item.id"
            @click="returnOffice(item)"
          >
            Kembali
          </button>

          <button
            v-if="item.can_continue_trip"
            class="btn btn-sm btn-indigo"
            :disabled="processingId === item.id"
            @click="continueTrip(item)"
          >
            Lanjut
          </button>

          <button
            v-if="item.can_finish"
            class="btn btn-sm btn-success"
            :disabled="processingId === item.id"
            @click="finishTrip(item)"
          >
            Selesai
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
            <h6>Detail Perjalanan</h6>
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
            <span>Driver</span>
            <strong>{{ selected?.driver?.nama_driver || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Kendaraan</span>
            <strong>{{ selected?.kendaraan?.nomor_polisi || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Status</span>
            <strong>{{ statusPerjalananLabel(selected?.status_perjalanan) }}</strong>
          </div>

          <div class="info-box">
            <span>Lokasi Jemput</span>
            <strong>{{ selected?.lokasi_jemput || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Keperluan</span>
            <strong>{{ selected?.keperluan || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Daftar Tujuan</span>
            <ol class="mb-0 ps-3">
              <li v-for="tujuan in selected?.tujuans || []" :key="tujuan.id">
                <strong>{{ tujuan.tujuan }}</strong>
                <br>
                <small>{{ tujuan.status_tujuan }}</small>
              </li>
            </ol>
          </div>

          <div class="info-box">
            <span>Waktu Perjalanan</span>
            <small>Mulai: {{ formatDateTime(selected?.started_at) }}</small><br>
            <small>Sampai: {{ formatDateTime(selected?.arrived_at) }}</small><br>
            <small>Kembali: {{ formatDateTime(selected?.returned_at) }}</small><br>
            <small>Selesai: {{ formatDateTime(selected?.finished_at) }}</small>
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
.pwa-perjalanan-page {
  padding: 2px;
  padding-bottom: 82px;
}

.pwa-header,
.filter-card,
.trip-card,
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
  color: #4f46e5;
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

.btn-indigo {
  background: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
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