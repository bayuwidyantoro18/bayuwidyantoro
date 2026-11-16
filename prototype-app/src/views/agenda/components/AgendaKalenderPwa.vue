<template>
  <div class="pwa-calendar-page">
    <PwaPageHeader
        icon="fas fa-calendar-days"
        title="Kalender Agenda"
        subtitle="Lihat jadwal perjalanan dalam tampilan kalender."
        />

    <div class="calendar-control-card">
      <div class="month-row">
        <button class="nav-btn" @click="$emit('prev-month')">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="month-title">
          {{ calendarTitle }}
        </div>

        <button class="nav-btn" @click="$emit('next-month')">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <button class="btn btn-sm btn-outline-primary w-100 mt-2" @click="$emit('today')">
        Hari Ini
      </button>

      <div class="status-chip-row">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="status-chip"
          :class="{ active: filter.status === option.value }"
          @click="$emit('update-status', option.value)"
        >
          <i :class="option.icon"></i>
          <span>{{ option.shortLabel }}</span>
        </button>
      </div>
    </div>

    <div class="summary-row">
      <div>
        <span>Total</span>
        <strong>{{ summary.total || 0 }}</strong>
      </div>

      <div>
        <span>Jalan</span>
        <strong>{{ summary.dalam_perjalanan || 0 }}</strong>
      </div>

      <div>
        <span>Selesai</span>
        <strong>{{ summary.selesai || 0 }}</strong>
      </div>
    </div>

    <div class="calendar-card">
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
          <span class="day-number">{{ day.dayNumber }}</span>

          <span v-if="day.agendaCount > 0" class="agenda-count">
            {{ day.agendaCount }}
          </span>

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

    <div class="selected-title">
      <div>
        <strong>{{ formatDate(selectedDate) }}</strong>
        <small>{{ selectedDateAgendas.length }} agenda</small>
      </div>

      <button
        class="btn btn-sm btn-primary"
        @click="$emit('load-data')"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat kalender...</div>
    </div>

    <div v-else-if="selectedDateAgendas.length === 0" class="empty-card">
      <i class="fas fa-calendar-times"></i>
      <div>Tidak ada agenda pada tanggal ini.</div>
    </div>

    <div v-else class="agenda-list">
      <div
        v-for="(agenda, index) in selectedDateAgendas"
        :key="agenda.id"
        class="agenda-card"
      >
        <div class="agenda-top">
          <div>
            <div class="agenda-number">#{{ index + 1 }}</div>
            <h6>{{ agenda.tujuan }}</h6>
          </div>

          <span
            class="badge"
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

        <div class="location-box">
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

        <button
          v-if="agenda.foto_selesai_url"
          class="btn btn-sm btn-outline-primary w-100 mt-2"
          @click="$emit('lihat-foto', agenda.foto_selesai_url)"
        >
          <i class="fas fa-image me-1"></i>
          Lihat Foto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

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
.pwa-calendar-page {
  padding: 2px;
}

.calendar-control-card,
.calendar-card,
.empty-card,
.agenda-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
}

.calendar-control-card {
  padding: 10px;
  margin-bottom: 10px;
}

.month-row {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  border: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 12px;
  height: 36px;
  color: #374151;
}

.month-title {
  text-align: center;
  font-weight: 900;
  color: #111827;
  text-transform: capitalize;
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
  padding: 6px 9px;
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-chip.active {
  border-color: #6f42c1;
  background: #6f42c1;
  color: #ffffff;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.summary-row div {
  background: #ffffff;
  border-radius: 14px;
  padding: 9px;
  text-align: center;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
}

.summary-row span {
  display: block;
  font-size: 10px;
  color: #6c757d;
  font-weight: 700;
}

.summary-row strong {
  font-size: 19px;
  color: #111827;
}

.calendar-card {
  padding: 10px;
}

.week-row,
.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.week-row div {
  text-align: center;
  font-size: 10px;
  font-weight: 900;
  color: #6c757d;
  padding-bottom: 6px;
}

.date-cell {
  position: relative;
  min-height: 48px;
  border: 1px solid #f1f3f5;
  background: #ffffff;
  padding: 4px;
  text-align: left;
  border-radius: 10px;
}

.date-cell.muted {
  opacity: 0.35;
}

.date-cell.today {
  border-color: #0d6efd;
}

.date-cell.selected {
  background: #eef4ff;
  border-color: #6f42c1;
}

.day-number {
  font-size: 11px;
  font-weight: 900;
  color: #111827;
}

.agenda-count {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #6f42c1;
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-row {
  display: flex;
  gap: 2px;
  position: absolute;
  left: 5px;
  bottom: 5px;
}

.status-dot {
  width: 5px;
  height: 5px;
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

.selected-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 2px 8px;
}

.selected-title strong {
  display: block;
  font-size: 14px;
}

.selected-title small {
  font-size: 11px;
  color: #6c757d;
}

.empty-card {
  padding: 30px 12px;
  text-align: center;
  color: #6c757d;
}

.empty-card i {
  font-size: 30px;
  margin-bottom: 8px;
}

.agenda-list {
  display: grid;
  gap: 10px;
}

.agenda-card {
  border: 1px solid #e9ecef;
  padding: 12px;
}

.agenda-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.agenda-number {
  font-size: 11px;
  font-weight: 900;
  color: #6c757d;
}

.agenda-card h6 {
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 0;
  color: #111827;
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
}

.time-grid span {
  font-size: 10px;
  color: #6c757d;
}

.location-box {
  margin-top: 8px;
  padding: 9px;
  border-radius: 13px;
  background: #f8fafc;
  border: 1px dashed #d0d7de;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.location-box strong {
  display: block;
  font-size: 11px;
}

.location-box span {
  display: block;
  font-size: 10.5px;
  color: #6c757d;
  word-break: break-word;
}
</style>

<style scoped src="./agenda-unified.css"></style>
