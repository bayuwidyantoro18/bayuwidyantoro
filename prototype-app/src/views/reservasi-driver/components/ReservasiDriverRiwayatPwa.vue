<template>
  <div class="pwa-riwayat-page">
    <div class="pwa-header">
      <div class="header-icon">
        <i class="fas fa-clock-rotate-left"></i>
      </div>

      <div>
        <h5>Riwayat Reservasi</h5>
        <p>Log perubahan dan aktivitas perjalanan driver.</p>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-head">
        <strong>Filter Data</strong>

        <button class="btn btn-sm btn-outline-secondary" @click="resetFilter">
          Reset
        </button>
      </div>

      <select v-model="filter.aksi" class="form-select form-select-sm compact-input">
        <option v-for="option in actionOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <div class="date-grid">
        <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
        <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
      </div>

      <input
        v-model="filter.keyword"
        type="text"
        class="form-control form-control-sm compact-input"
        placeholder="Cari riwayat..."
        @keyup.enter="loadData(1)"
      >

      <button class="btn btn-sm btn-primary w-100 btn-action" @click="loadData(1)">
        Tampilkan Data
      </button>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat riwayat...</span>
    </div>

    <div v-else-if="list.length === 0" class="empty-card">
      Belum ada data riwayat.
    </div>

    <template v-else>
      <div v-for="item in list" :key="item.id" class="history-card">
        <div class="card-top">
          <div>
            <h6>{{ item.kode_reservasi || '-' }}</h6>
            <small>{{ formatDateTime(item.created_at) }}</small>
          </div>

          <span class="badge" :class="actionClass(item.aksi)">
            {{ actionLabel(item.aksi) }}
          </span>
        </div>

        <div class="info-row">
          <span>Deskripsi</span>
          <strong>{{ item.deskripsi || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>User</span>
          <strong>{{ item.nama_user || '-' }}</strong>
        </div>

        <div class="info-row">
          <span>Perubahan</span>
          <strong>{{ compactChanges(item.changes) }}</strong>
        </div>

        <button class="btn btn-sm btn-outline-primary w-100 mt-2" @click="openDetail(item)">
          Detail
        </button>
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
            <h6>Detail Riwayat</h6>
            <small>{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeDetail"></button>
        </div>

        <div class="sheet-body">
          <div class="info-box">
            <span>Waktu</span>
            <strong>{{ formatDateTime(selected?.created_at) }}</strong>
          </div>

          <div class="info-box">
            <span>Aksi</span>
            <strong>{{ actionLabel(selected?.aksi) }}</strong>
          </div>

          <div class="info-box">
            <span>User</span>
            <strong>{{ selected?.nama_user || '-' }}</strong>
          </div>

          <div class="info-box">
            <span>Deskripsi</span>
            <strong>{{ selected?.deskripsi || '-' }}</strong>
          </div>

          <div v-if="selected?.maps_url" class="info-box">
            <span>Lokasi</span>
            <a :href="selected.maps_url" target="_blank">Lihat Maps</a>
          </div>

          <div class="info-box">
            <span>Detail Perubahan</span>

            <div v-if="changeItems(selected?.changes).length === 0">
              -
            </div>

            <div v-for="change in changeItems(selected?.changes)" :key="change.field" class="change-item">
              <strong>{{ change.label }}</strong>
              <small>Sebelum: {{ change.before }}</small>
              <small>Sesudah: {{ change.after }}</small>
            </div>
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
  list: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  pagination: { type: Object, required: true },
  detailModal: Boolean,
  selected: { type: Object, default: null },
  actionOptions: { type: Array, default: () => [] },
  actionLabel: { type: Function, required: true },
  actionClass: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  compactChanges: { type: Function, required: true },
  changeItems: { type: Function, required: true },
  formatValue: { type: Function, required: true },
  loadData: { type: Function, required: true },
  resetFilter: { type: Function, required: true },
  openDetail: { type: Function, required: true },
  closeDetail: { type: Function, required: true }
})
</script>

<style scoped>
.pwa-riwayat-page {
  padding: 2px;
  padding-bottom: 82px;
}

.pwa-header,
.filter-card,
.history-card,
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

.change-item {
  border-top: 1px dashed #cbd5e1;
  padding-top: 7px;
  margin-top: 7px;
}

.change-item small {
  display: block;
  font-size: 10.5px;
  color: #475569;
}
</style>