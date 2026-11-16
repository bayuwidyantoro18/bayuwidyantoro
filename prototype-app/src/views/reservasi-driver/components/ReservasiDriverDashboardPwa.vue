<template>
  <div class="pwa-reservasi-dashboard">
    <PwaPageHeader
      icon="fas fa-car"
      title="Reservasi Driver"
      subtitle="Monitoring driver, reservasi, dan rute perjalanan."
    />

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat dashboard...</span>
    </div>

    <template v-else>
      <div class="summary-grid">
        <div v-for="card in summaryCards" :key="card.key" class="summary-card">
          <div class="summary-icon" :class="card.iconClass">
            <i :class="card.icon"></i>
          </div>
          <span>{{ card.label }}</span>
          <strong>{{ summary[card.key] || 0 }}</strong>
        </div>
      </div>

      <div class="section-title">
        <span>Posisi Driver Terkini</span>
        <small>{{ driverList.length }} driver</small>
      </div>

      <div v-if="driverList.length === 0" class="empty-card">Belum ada data driver.</div>
      <template v-else>
        <div v-for="driver in driverList" :key="driver.id" class="driver-card">
          <div class="card-top">
            <div>
              <h6>{{ driver.nama_driver }}</h6>
              <small>{{ driver.kendaraan || '-' }}</small>
            </div>
            <span class="badge" :class="statusDriverClass(driver.status_driver)">
              {{ statusDriverLabel(driver.status_driver) }}
            </span>
          </div>

          <div class="mini-info">
            <span>Lokasi terkini</span>
            <a
              v-if="driver.lokasi_terkini && driver.lokasi_terkini !== '-'"
              :href="driver.lokasi_terkini"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat Maps
            </a>
            <strong v-else>-</strong>
          </div>
        </div>
      </template>

      <div class="section-title">
        <span>Daftar Reservasi</span>
        <button type="button" class="btn btn-sm btn-outline-primary" :disabled="loading" @click="$emit('reload')">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>

      <div v-if="upcomingList.length === 0" class="empty-card">Belum ada jadwal reservasi 7 hari ke depan.</div>
      <template v-else>
        <div v-for="item in upcomingList" :key="item.id" class="reservation-card">
          <div class="card-top">
            <div>
              <h6>{{ item.kode_reservasi }}</h6>
              <small>{{ formatDateTime(item.jam_mulai) }}</small>
            </div>
            <span class="badge" :class="statusReservasiClass(item.status_reservasi)">
              {{ statusReservasiLabel(item.status_reservasi) }}
            </span>
          </div>

          <div class="mini-info">
            <span>Pemohon</span>
            <strong>{{ item.pemohon || '-' }}</strong>
          </div>
          <div class="mini-info">
            <span>Tujuan</span>
            <strong>{{ item.tujuan || '-' }}</strong>
          </div>
          <div class="mini-info">
            <span>Driver</span>
            <strong>{{ item.driver || '-' }}</strong>
          </div>
        </div>
      </template>

      <div class="section-title">
        <span>Mini Rute Perjalanan</span>
        <small>Terbaru</small>
      </div>

      <div v-if="routeList.length === 0" class="empty-card">Belum ada rute perjalanan.</div>
      <template v-else>
        <div v-for="route in routeList" :key="route.id" class="route-card">
          <div class="route-head">
            <div>
              <h6>{{ route.judul || route.kode_reservasi || '-' }}</h6>
              <small>{{ route.pemohon || '-' }}</small>
            </div>
            <span class="badge" :class="routeStatusClass(route)">
              {{ routeStatusLabel(route) }}
            </span>
          </div>

          <div class="route-meta">
            <strong>Keperluan:</strong> {{ route.keperluan || '-' }}
          </div>

          <div class="mobile-timeline">
            <template v-for="(step, index) in normalizedSteps(route)" :key="step.key">
              <a
                v-if="step.maps_url"
                :href="step.maps_url"
                target="_blank"
                rel="noopener noreferrer"
                class="mobile-step"
                :class="routeStepClass(step)"
              >
                <i :class="routeIcon(step)"></i>
                <span>{{ step.label }}</span>
              </a>

              <span v-else class="mobile-step" :class="routeStepClass(step)">
                <i :class="routeIcon(step)"></i>
                <span>{{ step.label }}</span>
              </span>

              <span v-if="index < normalizedSteps(route).length - 1" class="mobile-arrow">→</span>
            </template>
          </div>

          <div class="mini-info">
            <span>Mulai</span>
            <strong>{{ formatDateTime(route.mulai_at) }}</strong>
          </div>
          <div class="mini-info">
            <span>Sampai</span>
            <strong>{{ formatDateTime(route.sampai_at) }}</strong>
          </div>
          <div class="mini-info">
            <span>Selesai</span>
            <strong>{{ formatDateTime(route.selesai_at) }}</strong>
          </div>
          <div class="mini-info">
            <span>Lokasi Terbaru</span>
            <a
              v-if="route.lokasi_terbaru_maps"
              :href="route.lokasi_terbaru_maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ route.lokasi_terbaru_label || 'Lihat Maps' }}
            </a>
            <strong v-else>{{ route.lokasi_terbaru_label || '-' }}</strong>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  loading: Boolean,
  summary: { type: Object, default: () => ({}) },
  driverList: { type: Array, default: () => [] },
  upcomingList: { type: Array, default: () => [] },
  routeList: { type: Array, default: () => [] },
  statusDriverLabel: { type: Function, required: true },
  statusDriverClass: { type: Function, required: true },
  statusReservasiLabel: { type: Function, required: true },
  statusReservasiClass: { type: Function, required: true },
  formatDateTime: { type: Function, required: true }
})

defineEmits(['reload'])

const summaryCards = [
  { key: 'total_hari_ini', label: 'Hari Ini', icon: 'fas fa-calendar-day', iconClass: 'icon-primary' },
  { key: 'menunggu_approval', label: 'Approval', icon: 'fas fa-hourglass-half', iconClass: 'icon-warning' },
  { key: 'sedang_berjalan', label: 'Berjalan', icon: 'fas fa-route', iconClass: 'icon-info' },
  { key: 'selesai_hari_ini', label: 'Selesai', icon: 'fas fa-circle-check', iconClass: 'icon-success' }
]

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

  return defaults.map((fallback, index) => ({ ...fallback, ...(steps[index] || {}) }))
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
</script>

<style scoped>
.pwa-reservasi-dashboard { padding: 2px; padding-bottom: 78px; }
.loading-card,
.summary-card,
.driver-card,
.reservation-card,
.route-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}
.loading-card,
.empty-card {
  min-height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}
.summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 10px; }
.summary-icon { width: 36px; height: 36px; border-radius: 13px; display: flex; justify-content: center; align-items: center; margin-bottom: 8px; }
.summary-card span { display: block; color: #64748b; font-size: 10.5px; font-weight: 800; }
.summary-card strong { color: #111827; font-size: 22px; font-weight: 900; }
.icon-primary { background: #dbeafe; color: #1d4ed8; }
.icon-warning { background: #fef3c7; color: #b45309; }
.icon-info { background: #cffafe; color: #0e7490; }
.icon-success { background: #dcfce7; color: #15803d; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin: 10px 2px 8px; }
.section-title span { font-size: 13px; font-weight: 900; color: #111827; }
.section-title small { font-size: 11px; color: #64748b; font-weight: 800; }
.card-top,
.route-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.card-top h6,
.route-head h6 { font-size: 13px; font-weight: 900; margin-bottom: 1px; color: #111827; }
.card-top small,
.route-head small { color: #64748b; font-size: 10.5px; font-weight: 700; }
.mini-info { padding: 6px 0; border-top: 1px solid #f1f5f9; }
.mini-info span { display: block; font-size: 10px; color: #64748b; font-weight: 800; }
.mini-info strong,
.mini-info a { display: block; font-size: 12px; color: #111827; word-break: break-word; }
.mini-info a { color: #0d6efd; font-weight: 900; text-decoration: none; }
.route-meta { font-size: 11px; color: #475569; margin-bottom: 9px; }
.mobile-timeline { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 8px 0 10px; }
.mobile-step { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; padding: 5px 8px; font-size: 10.5px; font-weight: 900; text-decoration: none; }
.mobile-step.step-done { background: #dbeafe; color: #1d4ed8; }
.mobile-step.step-done-finish { background: #facc15; color: #111827; }
.mobile-step.step-pending { background: #e5e7eb; color: #94a3b8; }
.mobile-arrow { color: #94a3b8; font-weight: 900; }
</style>
