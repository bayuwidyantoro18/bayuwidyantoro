<template>
  <div class="pwa-surat-dashboard">
    <PwaPageHeader
      icon="fas fa-hashtag"
      title="Nomor Surat"
      subtitle="Ringkasan pengambilan nomor surat."
    />

    <div v-if="loading" class="loading-card">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Memuat dashboard...</span>
    </div>

    <template v-else>
      <div class="summary-grid">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="summary-card"
        >
          <div class="summary-icon" :class="card.iconClass">
            <i :class="card.icon"></i>
          </div>

          <span>{{ card.label }}</span>
          <strong>{{ summary[card.key] || 0 }}</strong>
        </div>
      </div>

      <div class="pwa-card">
        <div class="section-title">
          <strong>Jenis Terbanyak</strong>
          <small>Top {{ topProsesList.length }}</small>
        </div>

        <div v-if="topProsesList.length === 0" class="empty-state">
          Belum ada data jenis surat.
        </div>

        <div
          v-else
          v-for="(item, index) in topProsesList"
          :key="item.nama_proses || index"
          class="top-item"
        >
          <div class="top-row">
            <div>
              <span class="rank-chip">#{{ index + 1 }}</span>
              <strong>{{ item.nama_proses || '-' }}</strong>
            </div>

            <span>{{ item.total || 0 }}</span>
          </div>

          <div class="progress compact-progress">
            <div
              class="progress-bar"
              :style="{ width: progressWidth(item.total) }"
            ></div>
          </div>
        </div>
      </div>

      <div class="section-header">
        <span>Nomor Surat Terbaru</span>

        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          :disabled="loading"
          @click="$emit('reload')"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>

      <div v-if="recentList.length === 0" class="empty-state-card">
        Belum ada nomor surat.
      </div>

      <div
        v-else
        v-for="(item, index) in recentList"
        :key="item.id || index"
        class="recent-card"
      >
        <div class="recent-top">
          <div>
            <h6>{{ item.nomor_surat }}</h6>
            <small>{{ item.label_jenis_surat || item.jenis_surat || '-' }}</small>
          </div>

          <span class="badge" :class="statusClass(item.status)">
            {{ item.status || '-' }}
          </span>
        </div>

        <div class="mini-info">
          <span>Perihal</span>
          <strong>{{ item.perihal || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Pemohon</span>
          <strong>{{ item.diambil_oleh || item.pemohon || '-' }}</strong>
        </div>

        <div class="mini-info">
          <span>Waktu</span>
          <strong>{{ formatDateTime(item.created_at || item.tanggal_ambil) }}</strong>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

const props = defineProps({
  loading: Boolean,
  summary: {
    type: Object,
    default: () => ({})
  },
  topProsesList: {
    type: Array,
    default: () => []
  },
  recentList: {
    type: Array,
    default: () => []
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  statusClass: {
    type: Function,
    required: true
  }
})

defineEmits([
  'reload'
])

const summaryCards = [
  {
    key: 'nomor_aktif',
    label: 'Aktif',
    icon: 'fas fa-file-circle-check',
    iconClass: 'icon-success'
  },
  {
    key: 'nomor_tidak_aktif',
    label: 'Nonaktif',
    icon: 'fas fa-file-circle-xmark',
    iconClass: 'icon-danger'
  },
  {
    key: 'total_bulan_ini',
    label: 'Bulan Ini',
    icon: 'fas fa-calendar-day',
    iconClass: 'icon-primary'
  },
  {
    key: 'total_tahun_ini',
    label: 'Tahun Ini',
    icon: 'fas fa-calendar-check',
    iconClass: 'icon-warning'
  }
]

const maxTopTotal = computed(() => {
  const totals = props.topProsesList.map((item) => Number(item.total || 0))
  return Math.max(...totals, 1)
})

const progressWidth = (total) => {
  const value = Number(total || 0)
  return `${Math.round((value / maxTopTotal.value) * 100)}%`
}
</script>

<style scoped>
.pwa-surat-dashboard {
  padding: 2px;
  padding-bottom: 78px;
}

.loading-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 24px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
  color: #64748b;
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 10px;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 17px;
  padding: 11px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.icon-success {
  background: #dcfce7;
  color: #15803d;
}

.icon-danger {
  background: #fee2e2;
  color: #b91c1c;
}

.icon-primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.icon-warning {
  background: #fef3c7;
  color: #b45309;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.summary-card strong {
  color: #111827;
  font-size: 22px;
  font-weight: 900;
}

.pwa-card,
.recent-card,
.empty-state-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.section-title,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title strong,
.section-header span {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.section-title small {
  font-size: 11px;
  color: #64748b;
  font-weight: 800;
}

.top-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.top-item:last-child {
  border-bottom: none;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.top-row strong {
  font-size: 12px;
}

.top-row span:last-child {
  font-size: 12px;
  font-weight: 900;
}

.rank-chip {
  background: #eef2ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 7px;
  margin-right: 5px;
}

.compact-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
}

.compact-progress .progress-bar {
  border-radius: 999px;
}

.recent-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.recent-top h6 {
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 1px;
  color: #111827;
}

.recent-top small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.mini-info {
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
}

.mini-info:last-child {
  border-bottom: none;
}

.mini-info span {
  display: block;
  font-size: 10px;
  color: #64748b;
  font-weight: 800;
}

.mini-info strong {
  display: block;
  font-size: 12px;
  color: #111827;
  word-break: break-word;
}

.empty-state,
.empty-state-card {
  color: #64748b;
  font-size: 12px;
  text-align: center;
  padding: 20px 10px;
}
</style>