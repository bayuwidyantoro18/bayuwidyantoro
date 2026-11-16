<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Kalender Agenda</h2>
        <p class="text-muted mb-0">
          Tampilan kalender perjalanan dinas luar pegawai.
        </p>
      </div>

      <button
        class="btn btn-primary"
        @click="$emit('load-data')"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
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

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-end gap-3 flex-wrap">
          <div>
            <label class="form-label">Bulan</label>

            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" @click="$emit('prev-month')">
                <i class="fas fa-chevron-left"></i>
              </button>

              <div class="month-title-box">
                {{ calendarTitle }}
              </div>

              <button class="btn btn-outline-secondary" @click="$emit('next-month')">
                <i class="fas fa-chevron-right"></i>
              </button>

              <button class="btn btn-outline-primary" @click="$emit('today')">
                Hari Ini
              </button>
            </div>
          </div>

          <div>
            <label class="form-label">Status</label>
            <select
              :value="filter.status"
              class="form-select"
              @change="$emit('update-status', $event.target.value)"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-layout">
      <div class="card shadow-sm calendar-card">
        <div class="card-header bg-white">
          <h5 class="fw-bold mb-0">{{ calendarTitle }}</h5>
        </div>

        <div class="card-body">
          <div class="week-row">
            <div
              v-for="label in weekLabels"
              :key="label"
            >
              {{ label }}
            </div>
          </div>

          <div class="date-grid">
            <button
              v-for="day in calendarDays"
              :key="day.dateString"
              type="button"
              class="date-cell"
              :class="{
                muted: !day.currentMonth,
                today: day.isToday,
                selected: day.isSelected,
                hasAgenda: day.agendaCount > 0
              }"
              @click="$emit('select-date', day.dateString)"
            >
              <div class="d-flex justify-content-between">
                <strong>{{ day.dayNumber }}</strong>

                <span v-if="day.agendaCount > 0" class="agenda-count">
                  {{ day.agendaCount }}
                </span>
              </div>

              <div class="dot-row">
                <span
                  v-for="status in day.statuses"
                  :key="status"
                  class="status-dot"
                  :class="`dot-${status}`"
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="card shadow-sm detail-card">
        <div class="card-header bg-white">
          <h5 class="fw-bold mb-0">
            {{ formatDate(selectedDate) }}
          </h5>
          <small class="text-muted">{{ selectedDateAgendas.length }} agenda</small>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
            <div class="text-muted mt-2">Memuat kalender...</div>
          </div>

          <div v-else-if="selectedDateAgendas.length === 0" class="text-center text-muted py-5">
            Tidak ada agenda pada tanggal ini.
          </div>

          <div v-else class="agenda-list">
            <div
              v-for="(agenda, index) in selectedDateAgendas"
              :key="agenda.id"
              class="agenda-item"
            >
              <div class="d-flex justify-content-between gap-2">
                <div>
                  <div class="text-muted small">#{{ index + 1 }}</div>
                  <h6 class="fw-bold mb-1">{{ agenda.tujuan }}</h6>
                </div>

                <span
                  class="badge align-self-start"
                  :class="statusBadgeClass(agenda.status)"
                >
                  {{ statusLabel(agenda.status) }}
                </span>
              </div>

              <div class="small text-muted">
                <i class="fas fa-user me-1"></i>
                {{ userName(agenda) }}
              </div>

              <div class="small mt-1">
                <strong>Keperluan:</strong> {{ agenda.keperluan }}
              </div>

              <div class="small mt-2">
                <strong>Mulai:</strong> {{ formatDateTime(agenda.waktu_mulai) }}
              </div>

              <div class="small">
                <strong>Sampai:</strong> {{ formatDateTime(agenda.waktu_sampai) }}
              </div>

              <div class="small">
                <strong>Selesai:</strong> {{ formatDateTime(agenda.waktu_selesai) }}
              </div>

              <div class="small mt-2">
                <strong>{{ lokasiTerbaru(agenda).label }}</strong>
                <div class="text-muted">{{ lokasiTerbaru(agenda).koordinat }}</div>

                <a
                  v-if="lokasiTerbaru(agenda).url"
                  :href="lokasiTerbaru(agenda).url"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary mt-1"
                >
                  Maps
                </a>

                <button
                  v-if="agenda.foto_selesai_url"
                  class="btn btn-sm btn-outline-primary mt-1 ms-1"
                  @click="$emit('lihat-foto', agenda.foto_selesai_url)"
                >
                  Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Kalender agenda menampilkan jumlah perjalanan pada setiap tanggal.
      Klik tanggal untuk melihat detail agenda pada tanggal tersebut.
    </div>
  </div>
</template>

<script setup>
const summaryCards = [
  { key: 'total', label: 'Total' },
  { key: 'antrian', label: 'Antrian' },
  { key: 'dalam_perjalanan', label: 'Perjalanan' },
  { key: 'sampai_tujuan', label: 'Sampai' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'batal', label: 'Batal' }
]

defineProps({
  loading: Boolean,
  calendarTitle: String,
  calendarDays: {
    type: Array,
    default: () => []
  },
  weekLabels: {
    type: Array,
    default: () => []
  },
  selectedDate: String,
  selectedDateAgendas: {
    type: Array,
    default: () => []
  },
  summary: {
    type: Object,
    default: () => ({})
  },
  filter: {
    type: Object,
    required: true
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
  'prev-month',
  'next-month',
  'today',
  'select-date',
  'update-status',
  'load-data',
  'lihat-foto'
])
</script>

<style scoped>
.summary-card {
  border-radius: 12px;
}

.month-title-box {
  min-width: 180px;
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
  text-transform: capitalize;
  background: #ffffff;
}

.calendar-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
}

.week-row,
.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.week-row div {
  text-align: center;
  font-weight: 700;
  color: #6c757d;
  padding-bottom: 8px;
}

.date-cell {
  min-height: 92px;
  border: 1px solid #dee2e6;
  background: #ffffff;
  padding: 8px;
  text-align: left;
  transition: all 0.2s ease;
}

.date-cell:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
}

.date-cell.muted {
  opacity: 0.35;
}

.date-cell.today {
  border-color: #0d6efd;
  box-shadow: inset 0 0 0 1px #0d6efd;
}

.date-cell.selected {
  background: #eef4ff;
  border-color: #6f42c1;
  box-shadow: inset 0 0 0 1px #6f42c1;
}

.agenda-count {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #6f42c1;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dot-row {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #adb5bd;
}

.dot-antrian {
  background: #6c757d;
}

.dot-dalam_perjalanan {
  background: #0d6efd;
}

.dot-sampai_tujuan {
  background: #ffc107;
}

.dot-selesai {
  background: #198754;
}

.dot-batal {
  background: #dc3545;
}

.detail-card {
  align-self: start;
}

.agenda-list {
  display: grid;
  gap: 10px;
}

.agenda-item {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped src="./agenda-unified.css"></style>
