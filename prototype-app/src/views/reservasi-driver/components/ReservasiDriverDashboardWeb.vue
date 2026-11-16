<template>
  <div class="container-fluid reservasi-dashboard-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Dashboard Reservasi Driver</h3>
        <p class="page-subtitle">
          Monitoring posisi driver, daftar reservasi, dan rute perjalanan terbaru.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary btn-compact"
        :disabled="loading"
        @click="$emit('reload')"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat dashboard reservasi driver...</span>
    </div>

    <template v-else>
      <div class="summary-grid">
        <div v-for="card in summaryCards" :key="card.key" class="summary-card">
          <div class="summary-icon" :class="card.iconClass">
            <i :class="card.icon"></i>
          </div>

          <div>
            <span>{{ card.label }}</span>
            <strong>{{ summary[card.key] || 0 }}</strong>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card compact-card">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-id-card"></i>
              <span>Posisi Driver Terkini</span>
            </div>

            <small>{{ driverList.length }} driver</small>
          </div>

          <div class="driver-list">
            <div v-if="driverList.length === 0" class="empty-state small-empty">
              Belum ada data driver.
            </div>

            <template v-else>
              <div v-for="driver in driverList" :key="driver.id" class="driver-item">
                <div class="driver-main">
                <div class="driver-avatar">
                  <i class="fas fa-user-tie"></i>
                </div>

                <div class="driver-info">
                  <strong>{{ driver.nama_driver }}</strong>
                  <span>{{ driver.kendaraan || '-' }}</span>
                  <small>
                    Lokasi terkini:
                    <a
                      v-if="driver.lokasi_terkini && driver.lokasi_terkini !== '-'"
                      :href="driver.lokasi_terkini"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat Maps
                    </a>
                    <span v-else>-</span>
                  </small>
                </div>
              </div>

                <span class="badge status-badge" :class="statusDriverClass(driver.status_driver)">
                  {{ statusDriverLabel(driver.status_driver) }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <div class="card compact-card">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-calendar-check"></i>
              <span>Daftar Reservasi</span>
            </div>

            <small>7 hari ke depan</small>
          </div>

          <div class="card-body p-0">
            <div v-if="upcomingList.length === 0" class="empty-state">
              Belum ada jadwal reservasi 7 hari ke depan.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0 compact-table">
                <thead>
                  <tr>
                    <th style="width: 120px;">Jadwal</th>
                    <th style="min-width: 150px;">Pemohon</th>
                    <th>Tujuan</th>
                    <th style="min-width: 120px;">Driver</th>
                    <th style="width: 130px;">Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in upcomingList" :key="item.id">
                    <td>
                      <strong>{{ formatDate(item.tanggal_reservasi || item.jam_mulai) }}</strong>
                      <br>
                      <small class="text-muted">{{ formatJam(item.jam_mulai) }}</small>
                    </td>

                    <td>
                      <div class="fw-semibold">{{ item.pemohon || '-' }}</div>
                      <small class="text-muted">{{ item.kode_reservasi || '-' }}</small>
                    </td>

                    <td class="text-truncate-cell">
                      {{ item.tujuan || '-' }}
                    </td>

                    <td>{{ item.driver || '-' }}</td>

                    <td>
                      <span class="badge status-badge" :class="statusReservasiClass(item.status_reservasi)">
                        {{ statusReservasiLabel(item.status_reservasi) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="card compact-card mt-3">
        <div class="compact-card-header">
          <div class="header-title">
            <i class="fas fa-route"></i>
            <span>Mini Rute Perjalanan</span>
          </div>

          <small>Perjalanan terbaru</small>
        </div>

        <div class="route-timeline-list">
          <div v-if="routeList.length === 0" class="empty-state">
            Belum ada rute perjalanan.
          </div>

          <template v-else>
            <div v-for="route in routeList" :key="route.id" class="route-timeline-card">
              <div class="route-card-head">
                <div>
                  <div class="route-title-row">
                    <h6>{{ route.judul || route.kode_reservasi || '-' }}</h6>
                    <span class="badge route-status-badge" :class="routeStatusClass(route)">
                      {{ routeStatusLabel(route) }}
                    </span>
                  </div>

                  <div class="route-meta">
                    <span>
                      <i class="fas fa-user me-1"></i>
                      {{ route.pemohon || '-' }}
                    </span>

                    <span>
                      <strong>Keperluan:</strong>
                      {{ route.keperluan || '-' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="timeline-wrap">
                <div class="timeline-line">
                  <div class="timeline-line-progress" :class="routeLineClass(route)"></div>
                </div>

                <div class="timeline-steps">
                  <div v-for="step in normalizedSteps(route)" :key="step.key" class="timeline-step">
                    <a
                      v-if="step.maps_url"
                      :href="step.maps_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="timeline-point"
                      :class="routeStepClass(step)"
                    >
                      <i :class="routeIcon(step)"></i>
                    </a>

                    <span v-else class="timeline-point" :class="routeStepClass(step)">
                      <i :class="routeIcon(step)"></i>
                    </span>

                    <span class="timeline-label">{{ step.label }}</span>
                  </div>
                </div>
              </div>

              <div class="route-detail-grid">
                <div>
                  <span>Mulai</span>
                  <strong>{{ formatCompactDateTime(route.mulai_at) }}</strong>
                </div>

                <div>
                  <span>Sampai</span>
                  <strong>{{ formatCompactDateTime(route.sampai_at) }}</strong>
                </div>

                <div>
                  <span>Selesai</span>
                  <strong>{{ formatCompactDateTime(route.selesai_at) }}</strong>
                </div>

                <div>
                  <span>Lokasi Terbaru</span>
                  <strong>{{ route.lokasi_terbaru_label || '-' }}</strong>

                  <a
                    v-if="route.lokasi_terbaru_maps"
                    :href="route.lokasi_terbaru_maps"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Maps
                  </a>

                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  summary: {
    type: Object,
    default: () => ({})
  },
  driverList: {
    type: Array,
    default: () => []
  },
  upcomingList: {
    type: Array,
    default: () => []
  },
  routeList: {
    type: Array,
    default: () => []
  },
  statusDriverLabel: {
    type: Function,
    required: true
  },
  statusDriverClass: {
    type: Function,
    required: true
  },
  statusReservasiLabel: {
    type: Function,
    required: true
  },
  statusReservasiClass: {
    type: Function,
    required: true
  },
  formatDateTime: {
    type: Function,
    required: true
  }
})

defineEmits(['reload'])

const summaryCards = [
  { key: 'total_hari_ini', label: 'Reservasi Hari Ini', icon: 'fas fa-calendar-day', iconClass: 'icon-primary' },
  { key: 'menunggu_approval', label: 'Menunggu Approval', icon: 'fas fa-hourglass-half', iconClass: 'icon-warning' },
  { key: 'sedang_berjalan', label: 'Sedang Berjalan', icon: 'fas fa-route', iconClass: 'icon-info' },
  { key: 'selesai_hari_ini', label: 'Selesai Hari Ini', icon: 'fas fa-circle-check', iconClass: 'icon-success' },
  { key: 'driver_standby', label: 'Driver Standby', icon: 'fas fa-user-check', iconClass: 'icon-secondary' }
]

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatJam = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return String(value).slice(0, 5)
}

const formatCompactDateTime = (value) => {
  if (!value) return '-'
  return props.formatDateTime(value)
}

const routeStatusLabel = (route) => {
  if (route.status_reservasi === 'completed' || route.status_perjalanan === 'selesai') return 'Selesai'
  if (route.status_reservasi === 'on_progress') return 'Berjalan'
  if (route.status_reservasi === 'incomplete' || route.status_perjalanan === 'tidak_selesai') return 'Tidak Selesai'
  return 'Proses'
}

const routeStatusClass = (route) => {
  if (route.status_reservasi === 'completed' || route.status_perjalanan === 'selesai') return 'bg-success'
  if (route.status_reservasi === 'on_progress') return 'bg-primary'
  if (route.status_reservasi === 'incomplete' || route.status_perjalanan === 'tidak_selesai') return 'bg-danger'
  return 'bg-secondary'
}

const normalizedSteps = (route) => {
  const steps = route.route_steps || []

  if (steps.length >= 4) return steps.slice(0, 4)

  const defaults = [
    { key: 'mulai', label: 'Mulai', done: false },
    { key: 'perjalanan', label: 'Perjalanan', done: false },
    { key: 'sampai', label: 'Sampai', done: false },
    { key: 'selesai', label: 'Selesai', done: false }
  ]

  return defaults.map((fallback, index) => ({
    ...fallback,
    ...(steps[index] || {})
  }))
}

const routeIcon = (step) => {
  return {
    mulai: 'fas fa-play',
    perjalanan: 'fas fa-route',
    sampai: 'fas fa-location-dot',
    selesai: 'fas fa-check'
  }[step.key] || 'fas fa-circle'
}

const routeStepClass = (step) => {
  if (step.key === 'selesai' && step.done) return 'step-done-finish'
  if (step.done) return 'step-done'
  return 'step-pending'
}

const routeLineClass = (route) => {
  const steps = normalizedSteps(route)
  const doneCount = steps.filter((step) => step.done).length

  if (doneCount >= 4) return 'line-full'
  if (doneCount === 3) return 'line-75'
  if (doneCount === 2) return 'line-50'
  if (doneCount === 1) return 'line-25'
  return 'line-0'
}
</script>

<style scoped>
.reservasi-dashboard-page {
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

.btn-compact {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 7px;
  padding: 4px 9px;
}

.loading-card,
.empty-state {
  min-height: 80px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.small-empty {
  min-height: 56px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
}

.summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
  margin-bottom: 1px;
}

.summary-card strong {
  color: #111827;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}

.icon-primary { background: #dbeafe; color: #1d4ed8; }
.icon-warning { background: #fef3c7; color: #b45309; }
.icon-info { background: #cffafe; color: #0e7490; }
.icon-success { background: #dcfce7; color: #15803d; }
.icon-secondary { background: #f1f5f9; color: #475569; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.35fr;
  gap: 12px;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
}

.compact-card-header {
  min-height: 38px;
  padding: 8px 11px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 900;
}

.compact-card-header small {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.driver-list {
  padding: 6px 10px;
}

.driver-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.driver-item:last-child {
  border-bottom: none;
}

.driver-main {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.driver-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #eef2ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.driver-info {
  min-width: 0;
}

.driver-info strong {
  display: block;
  font-size: 12.5px;
  color: #111827;
}

.driver-info span,
.driver-info small {
  display: block;
  font-size: 10.8px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-info a {
  font-weight: 800;
  text-decoration: none;
}

.status-badge {
  font-size: 10.5px;
  border-radius: 999px;
  padding: 4px 7px;
  white-space: nowrap;
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

.text-truncate-cell {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-timeline-list {
  padding: 10px 11px;
  background: #f8fafc;
}

.route-timeline-card {
  background: #ffffff;
  border: 1.5px solid #0d6efd;
  border-radius: 11px;
  padding: 11px 13px;
  margin-bottom: 10px;
}

.route-timeline-card:last-child {
  margin-bottom: 0;
}

.route-card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.route-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 3px;
}

.route-title-row h6 {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 0;
}

.route-status-badge {
  font-size: 10px;
  border-radius: 999px;
  padding: 3px 8px;
}

.route-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #475569;
}

.route-meta span {
  display: inline-flex;
  align-items: center;
}

.timeline-wrap {
  position: relative;
  padding: 22px 88px 8px;
}

.timeline-line {
  position: absolute;
  top: 34px;
  left: 110px;
  right: 95px;
  height: 4px;
  background: #dbeafe;
  border-radius: 999px;
  overflow: hidden;
}

.timeline-line-progress {
  height: 100%;
  background: #0d6efd;
  border-radius: 999px;
  width: 0%;
}

.timeline-line-progress.line-0 { width: 0%; }
.timeline-line-progress.line-25 { width: 25%; }
.timeline-line-progress.line-50 { width: 50%; }
.timeline-line-progress.line-75 { width: 75%; }
.timeline-line-progress.line-full { width: 100%; }

.timeline-steps {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: start;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.timeline-point {
  width: 25px;
  height: 25px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  text-decoration: none;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(13, 110, 253, 0.25);
}

.timeline-point.step-done {
  background: #0d6efd;
  color: #ffffff;
}

.timeline-point.step-done-finish {
  background: #facc15;
  color: #111827;
  box-shadow: 0 0 0 1px rgba(202, 138, 4, 0.35);
}

.timeline-point.step-pending {
  background: #e5e7eb;
  color: #94a3b8;
}

.timeline-label {
  font-size: 9.5px;
  color: #94a3b8;
  font-weight: 800;
}

.route-detail-grid {
  border-top: 1px dashed #cbd5e1;
  padding-top: 9px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.route-detail-grid span {
  display: block;
  font-size: 10px;
  color: #111827;
  font-weight: 900;
  margin-bottom: 2px;
}

.route-detail-grid strong {
  display: block;
  font-size: 10.5px;
  color: #334155;
  font-weight: 500;
}

.route-detail-grid a {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 800;
  color: #0d6efd;
  margin-top: 1px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .timeline-wrap {
    padding-left: 30px;
    padding-right: 30px;
  }

  .timeline-line {
    left: 52px;
    right: 52px;
  }

  .route-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
