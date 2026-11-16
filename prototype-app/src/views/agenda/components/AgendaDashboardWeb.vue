<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Dashboard Agenda Harian</h2>
        <p class="text-muted mb-0">
          Monitoring perjalanan dinas luar pegawai hari ini.
        </p>
      </div>

      <div class="d-flex gap-2">
        <input
          type="date"
          :value="tanggal"
          class="form-control"
          @change="$emit('update-tanggal', $event.target.value)"
        >

        <button
          class="btn btn-primary"
          @click="$emit('refresh')"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <div class="row mb-4">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="col-md-2 col-sm-6 mb-3"
      >
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">{{ card.label }}</div>
            <h3 class="fw-bold mb-0">{{ summary[card.key] || 0 }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <h5 class="mb-0 fw-bold">
          List Antrian & Tracking Perjalanan
        </h5>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat data...</div>
        </div>

        <div v-else-if="agendaList.length === 0" class="text-center text-muted py-5">
          <i class="fas fa-calendar-times fa-3x mb-3"></i>
          <div>Belum ada agenda perjalanan pada tanggal ini.</div>
        </div>

        <div v-else>
          <div
            v-for="(agenda, index) in agendaList"
            :key="agenda.id"
            class="agenda-compact-card mb-2"
          >
            <div class="agenda-main-row">
              <div class="agenda-info">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h6 class="fw-bold mb-0 agenda-title">
                    {{ index + 1 }}. {{ agenda.tujuan }}
                  </h6>

                  <span
                    class="badge agenda-badge"
                    :class="statusBadgeClass(agenda.status)"
                  >
                    {{ statusLabel(agenda.status) }}
                  </span>
                </div>

                <div class="agenda-meta">
                  <span>
                    <i class="fas fa-user me-1"></i>
                    {{ userName(agenda) }}
                  </span>

                  <span class="mx-2">•</span>

                  <span>
                    <strong>Keperluan:</strong> {{ agenda.keperluan }}
                  </span>
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

            <div v-if="agenda.status !== 'batal'" class="compact-tracking">
              <div class="tracking-line">
                <div
                  class="tracking-line-progress"
                  :style="{ width: progressPercent(agenda.status) + '%' }"
                ></div>

                <div
                  v-if="agenda.status !== 'antrian'"
                  class="tracking-line-dot"
                  :style="{ left: progressPercent(agenda.status) + '%' }"
                ></div>
              </div>

              <div class="compact-steps">
                <div
                  v-for="(step, stepIndex) in steps"
                  :key="step.key"
                  class="compact-step"
                  :class="{
                    active: stepIndex <= currentStepIndex(agenda.status),
                    current: stepIndex === currentStepIndex(agenda.status)
                  }"
                >
                  <div class="compact-step-icon">
                    <i :class="step.icon"></i>
                  </div>

                  <div class="compact-step-label">
                    {{ step.label }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="agenda.status === 'batal'" class="alert alert-danger py-1 px-2 mt-2 mb-0 small">
              <strong>Dibatalkan:</strong> {{ agenda.alasan_batal || '-' }}
            </div>

            <div class="agenda-detail-row">
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
                <strong>Lokasi Terbaru</strong>

                <span>
                  {{ lokasiTerbaru(agenda).label }}
                </span>

                <a
                  v-if="lokasiTerbaru(agenda).url"
                  :href="lokasiTerbaru(agenda).url"
                  target="_blank"
                  class="small d-block"
                >
                  Lihat Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-muted small mt-3">
      Data dashboard otomatis diperbarui setiap 15 detik.
    </div>
  </div>
</template>

<script setup>
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
  steps: {
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
  currentStepIndex: {
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
.summary-card {
  border-radius: 12px;
}

.agenda-compact-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 12px 14px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.agenda-compact-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 0.35rem 0.9rem rgba(0, 0, 0, 0.08);
}

.agenda-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.agenda-info {
  flex: 1;
  min-width: 0;
}

.agenda-title {
  font-size: 15px;
  color: #111827;
}

.agenda-badge {
  font-size: 10px;
  white-space: nowrap;
}

.agenda-meta {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.agenda-photo-button {
  border: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.agenda-photo {
  width: 62px;
  height: 46px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  cursor: pointer;
  flex-shrink: 0;
}

.agenda-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compact-tracking {
  position: relative;
  margin-top: 12px;
  padding: 4px 4px 0;
}

.tracking-line {
  position: absolute;
  top: 19px;
  left: 9%;
  right: 9%;
  height: 3px;
  background-color: #dee2e6;
  border-radius: 20px;
  overflow: visible;
}

.tracking-line-progress {
  height: 3px;
  background-color: #0d6efd;
  border-radius: 20px;
  transition: width 0.6s ease;
}

.tracking-line-dot {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background-color: #0d6efd;
  border: 2px solid #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.18);
  animation: pulse-dot 1.4s infinite;
}

.compact-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.compact-step {
  width: 25%;
  text-align: center;
  color: #adb5bd;
}

.compact-step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #dee2e6;
  color: #6c757d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-bottom: 3px;
  transition: all 0.3s ease;
}

.compact-step.active .compact-step-icon {
  background-color: #0d6efd;
  color: #ffffff;
}

.compact-step.current .compact-step-icon {
  background-color: #ffc107;
  color: #000000;
  transform: scale(1.08);
}

.compact-step-label {
  font-size: 10px;
  font-weight: 600;
}

.agenda-detail-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #dee2e6;
}

.agenda-detail-row div {
  font-size: 11px;
  color: #6c757d;
}

.agenda-detail-row strong {
  display: block;
  color: #212529;
  font-size: 11px;
}

.agenda-detail-row span {
  display: block;
  word-break: break-word;
}

@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.35);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(13, 110, 253, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}
</style>

<style scoped src="./agenda-unified.css"></style>
