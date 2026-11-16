<template>
  <div class="pwa-performance-page">
    <PwaPageHeader
        icon="fas fa-chart-line"
        title="Rekap Kinerja"
        subtitle="Ringkasan performa petugas agenda."
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
        <label class="compact-label">Cari Petugas / Tujuan</label>
        <input
          type="text"
          :value="filter.keyword"
          class="form-control form-control-sm"
          placeholder="Nama petugas, tujuan, keperluan..."
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
          Tampilkan
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <span>Petugas</span>
        <strong>{{ summary.total_petugas || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Agenda</span>
        <strong>{{ summary.total_agenda || 0 }}</strong>
      </div>

      <div class="summary-card">
        <span>Selesai</span>
        <strong>{{ summary.total_selesai || 0 }}</strong>
      </div>
    </div>

    <div class="top-performer-card">
      <span>Petugas Teraktif</span>
      <strong>{{ summary.petugas_teraktif || '-' }}</strong>
    </div>

    <div class="section-title">
      <span>Daftar Kinerja</span>
      <small>{{ rekapList.length }} petugas</small>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat rekap...</div>
    </div>

    <div v-else-if="rekapList.length === 0" class="empty-card">
      <i class="fas fa-chart-simple"></i>
      <div>Belum ada data kinerja.</div>
    </div>

    <div v-else class="performance-list">
      <div
        v-for="(item, index) in rekapList"
        :key="item.user_id || index"
        class="performance-card"
      >
        <div class="card-top">
          <div class="rank-badge">
            #{{ index + 1 }}
          </div>

          <div class="flex-grow-1">
            <h6>{{ item.nama }}</h6>
            <div class="username">
              @{{ item.username }}
            </div>
          </div>

          <div class="score-circle">
            {{ item.persentase_selesai || 0 }}%
          </div>
        </div>

        <div class="progress performance-progress">
          <div
            class="progress-bar"
            :style="{ width: (item.persentase_selesai || 0) + '%' }"
          ></div>
        </div>

        <div class="stat-grid">
          <div>
            <span>Total</span>
            <strong>{{ item.total }}</strong>
          </div>

          <div>
            <span>Selesai</span>
            <strong>{{ item.selesai }}</strong>
          </div>

          <div>
            <span>Batal</span>
            <strong>{{ item.batal }}</strong>
          </div>

          <div>
            <span>Lokasi</span>
            <strong>{{ item.ada_lokasi }}</strong>
          </div>
        </div>

        <div class="info-box">
          <div>
            <strong>Rata-rata Durasi</strong>
            <span>{{ formatDuration(item.rata_rata_menit) }}</span>
          </div>

          <div>
            <strong>Tujuan Terbanyak</strong>
            <span>{{ item.tujuan_terbanyak || '-' }}</span>
          </div>

          <div>
            <strong>Aktivitas Terakhir</strong>
            <span>{{ formatDateTime(item.aktivitas_terakhir) }}</span>
          </div>
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
  rekapList: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  formatDuration: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-filter',
  'load-data',
  'reset-filter'
])
</script>

<style scoped>
.pwa-performance-page {
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
  border-color: #198754;
  background: #198754;
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

.top-performer-card {
  margin-top: 9px;
  background: #ecfdf3;
  border: 1px solid #b7e4c7;
  border-radius: 14px;
  padding: 10px;
}

.top-performer-card span {
  display: block;
  font-size: 10.5px;
  color: #198754;
  font-weight: 800;
}

.top-performer-card strong {
  display: block;
  font-size: 14px;
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

.performance-list {
  display: grid;
  gap: 10px;
}

.performance-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-badge {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #ecfdf3;
  color: #198754;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 12px;
  flex-shrink: 0;
}

.performance-card h6 {
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 1px;
  color: #111827;
}

.username {
  font-size: 11px;
  color: #6c757d;
}

.score-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #198754, #20c997);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
}

.performance-progress {
  height: 7px;
  margin-top: 10px;
  border-radius: 999px;
  overflow: hidden;
}

.performance-progress .progress-bar {
  background: linear-gradient(90deg, #198754, #20c997);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-top: 9px;
}

.stat-grid div {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 7px;
  text-align: center;
}

.stat-grid span {
  display: block;
  font-size: 10px;
  color: #6c757d;
  font-weight: 700;
}

.stat-grid strong {
  font-size: 16px;
  color: #111827;
}

.info-box {
  margin-top: 9px;
  padding: 9px;
  border-radius: 13px;
  background: #f8fafc;
  border: 1px dashed #d0d7de;
  display: grid;
  gap: 6px;
}

.info-box strong {
  display: block;
  font-size: 10.5px;
  color: #212529;
}

.info-box span {
  display: block;
  font-size: 11px;
  color: #6c757d;
  word-break: break-word;
}
</style>

<style scoped src="./agenda-unified.css"></style>
