<template>
  <div class="pwa-monitor-page">
    <PwaPageHeader
        icon="fas fa-location-dot"
        title="Monitoring Lokasi"
        subtitle="Pantau titik lokasi terakhir perjalanan."
        />

    <div class="pwa-filter-card">
      <div class="filter-top">
        <div>
          <label class="compact-label">Tanggal</label>
          <input
            type="date"
            :value="filter.tanggal"
            class="form-control form-control-sm"
            @change="$emit('update-tanggal', $event.target.value)"
          >
        </div>

        <button
          class="btn btn-sm btn-primary refresh-btn"
          @click="$emit('load-data')"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>

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
      <div class="summary-card">
        <span>Total</span>
        <strong>{{ summary.total }}</strong>
      </div>

      <div class="summary-card">
        <span>Ada Lokasi</span>
        <strong>{{ summary.ada_lokasi }}</strong>
      </div>

      <div class="summary-card">
        <span>Jalan</span>
        <strong>{{ summary.dalam_perjalanan }}</strong>
      </div>
    </div>

    <div class="section-title">
      <span>Daftar Lokasi</span>
      <small>{{ agendaList.length }} data</small>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat data lokasi...</div>
    </div>

    <div v-else-if="agendaList.length === 0" class="empty-card">
      <i class="fas fa-map-location-dot"></i>
      <div>Belum ada data lokasi.</div>
    </div>

    <div v-else class="location-list">
      <div
        v-for="(agenda, index) in agendaList"
        :key="agenda.id"
        class="location-card"
      >
        <div class="card-top">
          <div>
            <div class="number-row">
              <span>#{{ index + 1 }}</span>

              <span
                class="badge"
                :class="statusBadgeClass(agenda.status)"
              >
                {{ statusLabel(agenda.status) }}
              </span>
            </div>

            <h6>{{ agenda.tujuan }}</h6>
          </div>

          <div
            class="location-bubble"
            :class="{ active: lokasiTerbaru(agenda).url }"
          >
            <i :class="lokasiTerbaru(agenda).icon"></i>
          </div>
        </div>

        <div class="meta-row">
          <i class="fas fa-user me-1"></i>
          {{ userName(agenda) }}
        </div>

        <div class="purpose-text">
          {{ agenda.keperluan }}
        </div>

        <div class="latest-location-box">
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

        <div class="detail-location-row">
          <a
            v-if="hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)"
            :href="mapsUrl(agenda.mulai_latitude, agenda.mulai_longitude)"
            target="_blank"
          >
            Mulai
          </a>

          <a
            v-if="hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)"
            :href="mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude)"
            target="_blank"
          >
            Sampai
          </a>

          <a
            v-if="hasLokasi(agenda.selesai_latitude, agenda.selesai_longitude)"
            :href="mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude)"
            target="_blank"
          >
            Selesai
          </a>
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
  agendaList: {
    type: Array,
    default: () => []
  },
  summary: {
    type: Object,
    default: () => ({})
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
  },
  hasLokasi: {
    type: Function,
    required: true
  },
  lokasiText: {
    type: Function,
    required: true
  },
  mapsUrl: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-tanggal',
  'update-status',
  'load-data'
])
</script>

<style scoped>
.pwa-monitor-page {
  padding: 2px;
}

.pwa-filter-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}

.filter-top {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: end;
}

.compact-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.refresh-btn {
  height: 31px;
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
  border-color: #0d6efd;
  background: #0d6efd;
  color: #ffffff;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
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
  display: block;
  font-size: 19px;
  line-height: 1.1;
  color: #111827;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 2px 8px;
  font-weight: 900;
  color: #111827;
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

.location-list {
  display: grid;
  gap: 10px;
}

.location-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.number-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 3px;
}

.number-row span:first-child {
  font-size: 11px;
  font-weight: 900;
  color: #6c757d;
}

.location-card h6 {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 0;
}

.location-bubble {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: #f1f3f5;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-bubble.active {
  background: #e7f1ff;
  color: #0d6efd;
}

.meta-row {
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

.latest-location-box {
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

.latest-location-box strong {
  display: block;
  font-size: 11px;
  color: #212529;
}

.latest-location-box span {
  display: block;
  font-size: 10.5px;
  color: #6c757d;
  word-break: break-word;
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
  display: block;
  font-size: 10px;
  color: #6c757d;
  word-break: break-word;
}

.detail-location-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.detail-location-row a {
  flex: 1;
  text-align: center;
  text-decoration: none;
  border: 1px solid #0d6efd;
  color: #0d6efd;
  border-radius: 999px;
  padding: 5px 7px;
  font-size: 10.5px;
  font-weight: 800;
}
</style>

<style scoped src="./agenda-unified.css"></style>
