<template>
  <div class="pwa-history-page">
    <PwaPageHeader
        icon="fas fa-clock-rotate-left"
        title="Riwayat Perjalanan"
        subtitle="Cari dan lihat histori perjalanan pegawai."
        />

    <div class="filter-card">
      <div class="date-grid">
        <div>
          <label class="compact-label">Mulai</label>
          <input
            type="date"
            :value="filter.tanggal_mulai"
            class="form-control form-control-sm"
            @change="$emit('update-filter', { field: 'tanggal_mulai', value: $event.target.value })"
          >
        </div>

        <div>
          <label class="compact-label">Sampai</label>
          <input
            type="date"
            :value="filter.tanggal_selesai"
            class="form-control form-control-sm"
            @change="$emit('update-filter', { field: 'tanggal_selesai', value: $event.target.value })"
          >
        </div>
      </div>

      <div class="mt-2">
        <label class="compact-label">Cari</label>
        <input
          type="text"
          :value="filter.keyword"
          class="form-control form-control-sm"
          placeholder="Cari tujuan, keperluan, pegawai..."
          @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
          @keyup.enter="$emit('load-data')"
        >
      </div>

      <div class="status-chip-row">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="status-chip"
          :class="{ active: filter.status === option.value }"
          @click="$emit('update-filter', { field: 'status', value: option.value })"
        >
          {{ option.shortLabel }}
        </button>
      </div>

      <div class="action-grid">
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="$emit('reset-filter')"
        >
          Reset
        </button>

        <button
          class="btn btn-sm btn-primary"
          @click="$emit('load-data')"
          :disabled="loading"
        >
          <i class="fas fa-search me-1"></i>
          Cari
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ summary.total || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Selesai</span>
        <strong>{{ summary.selesai || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Batal</span>
        <strong>{{ summary.batal || 0 }}</strong>
      </div>
    </div>

    <div class="section-title">
      <span>Data Riwayat</span>
      <small>{{ agendaList.length }} data</small>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat riwayat...</div>
    </div>

    <div v-else-if="agendaList.length === 0" class="empty-card">
      <i class="fas fa-folder-open"></i>
      <div>Tidak ada riwayat perjalanan.</div>
    </div>

    <div v-else class="history-list">
      <div
        v-for="(agenda, index) in agendaList"
        :key="agenda.id"
        class="history-card"
      >
        <div class="card-top">
          <div>
            <div class="history-number">
              #{{ index + 1 }} · {{ formatDate(agenda.tanggal) }}
            </div>

            <h6>{{ agenda.tujuan }}</h6>
          </div>

          <span
            class="badge status-badge"
            :class="statusBadgeClass(agenda.status)"
          >
            {{ statusLabel(agenda.status) }}
          </span>
        </div>

        <div class="meta-line">
          <i class="fas fa-user me-1"></i>
          {{ userName(agenda) }}
        </div>

        <div class="purpose-text">
          {{ agenda.keperluan }}
        </div>

        <div class="time-grid">
          <div>
            <strong>Mulai</strong>
            <span>{{ formatDateTime(agenda.waktu_mulai) }}</span>
          </div>

          <div>
            <strong>Sampai</strong>
            <span>{{ formatDateTime(agenda.waktu_sampai) }}</span>
          </div>

          <div>
            <strong>Selesai</strong>
            <span>{{ formatDateTime(agenda.waktu_selesai) }}</span>
          </div>
        </div>

        <div class="latest-location">
          <div>
            <strong>{{ lokasiTerbaru(agenda).label }}</strong>
            <span>{{ lokasiTerbaru(agenda).koordinat }}</span>
          </div>

          <a
            v-if="lokasiTerbaru(agenda).url"
            :href="lokasiTerbaru(agenda).url"
            target="_blank"
            class="btn btn-sm btn-outline-primary"
          >
            Maps
          </a>
        </div>

        <div class="card-action-row">
          <button
            v-if="agenda.foto_selesai_url"
            class="btn btn-sm btn-outline-primary"
            @click="$emit('lihat-foto', agenda.id)"
          >
            <i class="fas fa-image me-1"></i>
            Foto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  filter: {
    type: Object,
    required: true
  },
  loading: Boolean,
  summary: {
    type: Object,
    default: () => ({})
  },
  agendaList: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  statusLabel: {
    type: Function,
    required: true
  },
  statusBadgeClass: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  userName: {
    type: Function,
    required: true
  },
  lokasiTerbaru: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-filter',
  'load-data',
  'reset-filter',
  'lihat-foto'
])
</script>

<style scoped>
.pwa-history-page {
  padding: 2px;
}

.filter-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compact-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.status-chip-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-top: 9px;
  padding-bottom: 2px;
}

.status-chip {
  border: 1px solid #dee2e6;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
}

.status-chip.active {
  border-color: #ff8c00;
  background: #ff8c00;
  color: #ffffff;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 9px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.summary-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 9px;
  text-align: center;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
}

.summary-card span {
  display: block;
  font-size: 10px;
  color: #6c757d;
  font-weight: 700;
}

.summary-card strong {
  font-size: 19px;
  color: #111827;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin: 12px 2px 8px;
  font-weight: 900;
}

.section-title small {
  font-size: 11px;
  color: #6c757d;
}

.empty-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px 12px;
  text-align: center;
  color: #6c757d;
}

.empty-card i {
  display: block;
  font-size: 30px;
  margin-bottom: 8px;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.history-number {
  font-size: 11px;
  font-weight: 900;
  color: #6c757d;
}

.history-card h6 {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 0;
}

.status-badge {
  font-size: 10px;
  white-space: nowrap;
}

.meta-line {
  margin-top: 5px;
  font-size: 11px;
  color: #6c757d;
}

.purpose-text {
  margin-top: 3px;
  font-size: 12px;
  color: #374151;
  line-height: 1.35;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin-top: 8px;
}

.time-grid div {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 7px;
}

.time-grid strong {
  display: block;
  font-size: 10px;
  color: #212529;
}

.time-grid span {
  font-size: 10px;
  color: #6c757d;
}

.latest-location {
  margin-top: 8px;
  padding: 9px;
  border-radius: 13px;
  background: #fff8e1;
  border: 1px dashed #ffd56b;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.latest-location strong {
  display: block;
  font-size: 11px;
}

.latest-location span {
  display: block;
  font-size: 10.5px;
  color: #6c757d;
  word-break: break-word;
}

.card-action-row {
  margin-top: 8px;
}

.card-action-row .btn {
  width: 100%;
  font-weight: 700;
}
</style>

<style scoped src="./agenda-unified.css"></style>
