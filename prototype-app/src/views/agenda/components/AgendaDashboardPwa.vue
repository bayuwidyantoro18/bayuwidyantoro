<template>
  <div class="agenda-pwa-dashboard">
    <PwaPageHeader
        icon="fas fa-gauge-high"
        title="Dashboard Agenda"
        subtitle="Monitoring perjalanan dinas luar pegawai hari ini."
        />
        
    <div class="pwa-filter-card">
      <input
        type="date"
        :value="tanggal"
        class="form-control form-control-sm"
        @change="$emit('update-tanggal', $event.target.value)"
      >
        <button
        class="btn btn-sm btn-primary w-100"
        @click="$emit('refresh')"
        :disabled="loading"
        >
        <i class="fas fa-sync-alt me-1"></i>
        </button>
    </div>

    <div class="pwa-summary-grid">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="pwa-summary-card"
      >
        <div class="summary-icon" :class="card.class">
          <i :class="card.icon"></i>
        </div>

        <div>
          <div class="summary-label">{{ card.label }}</div>
          <div class="summary-value">{{ summary[card.key] || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="pwa-section-title">
      <span>Daftar Perjalanan</span>
      <small>{{ agendaList.length }} agenda</small>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat data...</div>
    </div>

    <div v-else-if="agendaList.length === 0" class="pwa-empty-card">
      <i class="fas fa-calendar-times"></i>
      <div>Belum ada agenda perjalanan.</div>
    </div>

    <div v-else class="pwa-agenda-list">
      <div
        v-for="(agenda, index) in agendaList"
        :key="agenda.id"
        class="pwa-agenda-card"
      >
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="agenda-number">#{{ index + 1 }}</span>

              <span
                class="badge agenda-status"
                :class="statusBadgeClass(agenda.status)"
              >
                {{ statusLabel(agenda.status) }}
              </span>
            </div>

            <h6 class="agenda-title mb-1">
              {{ agenda.tujuan }}
            </h6>

            <div class="agenda-meta">
              <i class="fas fa-user me-1"></i>
              {{ userName(agenda) }}
            </div>

            <div class="agenda-purpose">
              {{ agenda.keperluan }}
            </div>
          </div>

          <button
            v-if="agenda.foto_selesai"
            type="button"
            class="agenda-photo agenda-photo-button"
            @click="$emit('lihat-foto', agenda.id)"
          >
            <i class="fas fa-image me-1"></i>
            Lihat Bukti Foto
          </button>
        </div>

        <div
          v-if="agenda.status !== 'batal'"
          class="mini-progress mt-2"
        >
          <div
            class="mini-progress-bar"
            :style="{ width: progressPercent(agenda.status) + '%' }"
          ></div>
        </div>

        <div
          v-if="agenda.status === 'batal'"
          class="small text-danger mt-2"
        >
          <strong>Dibatalkan:</strong> {{ agenda.alasan_batal || '-' }}
        </div>

        <div class="agenda-info-grid mt-2">
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

          <div>
            <strong>Lokasi</strong>
            <a
              v-if="lokasiTerbaru(agenda).url"
              :href="lokasiTerbaru(agenda).url"
              target="_blank"
            >
              {{ lokasiTerbaru(agenda).label }}
            </a>
            <span v-else>-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  tanggal: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  summary: {
    type: Object,
    default: () => ({})
  },
  agendaList: {
    type: Array,
    default: () => []
  },
  summaryCards: {
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
  formatDateTime: {
    type: Function,
    required: true
  },
  progressPercent: {
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
  'update-tanggal',
  'refresh',
  'lihat-foto'
])
</script>

<style scoped>
.agenda-pwa-dashboard {
  padding: 2px;
}

.refresh-btn {
  width: 12px;
  height: 12px;
  border-radius: 12px;
}

.pwa-refresh-row {
  margin-bottom: 10px;
}

.pwa-filter-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}

.pwa-summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.pwa-summary-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 7px 4px;
  min-height: 58px;
  box-shadow: 0 0.2rem 0.55rem rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.summary-icon {
  width: 26px;
  height: 26px;
  border-radius: 9px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  margin-bottom: 3px;
}

.summary-label {
  font-size: 9.5px;
  color: #6c757d;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.summary-value {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  text-align: center;
}

.pwa-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 2px 8px;
  font-weight: 800;
  color: #111827;
}

.pwa-section-title small {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
}

.pwa-empty-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 12px;
  text-align: center;
  color: #6c757d;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
}

.pwa-empty-card i {
  font-size: 30px;
  margin-bottom: 8px;
}

.pwa-agenda-list {
  display: grid;
  gap: 10px;
}

.pwa-agenda-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  padding: 11px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.05);
}

.agenda-number {
  font-size: 11px;
  font-weight: 800;
  color: #6c757d;
}

.agenda-status {
  font-size: 10px;
}

.agenda-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
}

.agenda-meta {
  font-size: 11px;
  color: #6c757d;
}

.agenda-purpose {
  font-size: 12px;
  color: #374151;
  margin-top: 3px;
  line-height: 1.35;
}

.agenda-photo-button {
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.agenda-photo {
  width: 58px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  flex-shrink: 0;
}

.mini-progress {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.mini-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #ffc107);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.agenda-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
  padding-top: 8px;
  border-top: 1px dashed #dee2e6;
}

.agenda-info-grid div {
  font-size: 10.5px;
  color: #6c757d;
}

.agenda-info-grid strong {
  display: block;
  font-size: 10.5px;
  color: #212529;
}

.agenda-info-grid span,
.agenda-info-grid a {
  display: block;
  font-size: 10.5px;
  word-break: break-word;
}
</style>

<style scoped src="./agenda-unified.css"></style>
