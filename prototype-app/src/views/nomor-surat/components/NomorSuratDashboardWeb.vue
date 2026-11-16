<template>
  <div class="container-fluid nomor-dashboard-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Dashboard Nomor Surat</h3>
        <p class="page-subtitle">
          Ringkasan pengambilan nomor surat perusahaan.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary btn-refresh"
        :disabled="loading"
        @click="$emit('reload')"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

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

          <div class="summary-content">
            <span>{{ card.label }}</span>
            <strong>{{ summary[card.key] || 0 }}</strong>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card compact-card">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-chart-bar"></i>
              <span>Jenis Surat Terbanyak</span>
            </div>

            <span class="small-muted">
              Top {{ topProsesList.length }}
            </span>
          </div>

          <div class="card-body p-0">
            <div v-if="topProsesList.length === 0" class="empty-state">
              Belum ada data jenis surat.
            </div>

            <div v-else class="top-list">
              <div
                v-for="(item, index) in topProsesList"
                :key="item.nama_proses || index"
                class="top-item"
              >
                <div class="top-row">
                  <div class="top-name">
                    <span class="rank-badge">#{{ index + 1 }}</span>
                    <strong>{{ item.nama_proses || '-' }}</strong>
                  </div>

                  <span class="top-total">
                    {{ item.total || 0 }}
                  </span>
                </div>

                <div class="progress compact-progress">
                  <div
                    class="progress-bar"
                    :style="{ width: progressWidth(item.total) }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card compact-card">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-clock-rotate-left"></i>
              <span>Nomor Surat Terbaru</span>
            </div>

            <span class="small-muted">
              5 terakhir
            </span>
          </div>

          <div class="card-body p-0">
            <div v-if="recentList.length === 0" class="empty-state">
              Belum ada nomor surat.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0 compact-table">
                <thead>
                  <tr>
                    <th>No Surat</th>
                    <th>Jenis</th>
                    <th>Perihal</th>
                    <th>Pemohon</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(item, index) in recentList"
                    :key="item.id || index"
                  >
                    <td>
                      <div class="nomor-text">{{ item.nomor_surat }}</div>
                      <small class="text-muted">
                        {{ formatDateTime(item.created_at || item.tanggal_ambil) }}
                      </small>
                    </td>

                    <td>{{ item.label_jenis_surat || item.jenis_surat || '-' }}</td>

                    <td class="text-truncate-cell">
                      {{ item.perihal || '-' }}
                    </td>

                    <td>{{ item.diambil_oleh || item.pemohon || '-' }}</td>

                    <td>
                      <span class="badge status-badge" :class="statusClass(item.status)">
                        {{ item.status || '-' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="info-strip">
        <i class="fas fa-info-circle"></i>
        <span>
          Dashboard menampilkan ringkasan nomor surat aktif, tidak aktif, total bulan berjalan, total tahun berjalan, jenis surat terbanyak, dan nomor surat terbaru.
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
    label: 'Nomor Aktif',
    icon: 'fas fa-file-circle-check',
    iconClass: 'icon-success'
  },
  {
    key: 'nomor_tidak_aktif',
    label: 'Tidak Aktif',
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
.nomor-dashboard-page {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-refresh {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 8px;
  padding: 5px 10px;
}

.loading-card {
  min-height: 90px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
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

.summary-content span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 1px;
}

.summary-content strong {
  display: block;
  color: #111827;
  font-size: 23px;
  font-weight: 900;
  line-height: 1.1;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.6fr;
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

.header-title i {
  font-size: 13px;
}

.small-muted {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.top-list {
  padding: 6px 11px;
}

.top-item {
  padding: 7px 0;
  border-bottom: 1px solid #f1f5f9;
}

.top-item:last-child {
  border-bottom: none;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.top-name {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.top-name strong {
  font-size: 12px;
  color: #111827;
}

.rank-badge {
  background: #eef2ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 7px;
}

.top-total {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
}

.compact-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
}

.compact-progress .progress-bar {
  border-radius: 999px;
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
  vertical-align: middle;
}

.nomor-text {
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
}

.text-truncate-cell {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: 10.5px;
  border-radius: 999px;
  padding: 4px 7px;
}

.empty-state {
  min-height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-size: 12px;
}

.info-strip {
  margin-top: 12px;
  background: #eef6ff;
  border: 1px solid #bfdbfe;
  color: #075985;
  border-radius: 10px;
  padding: 8px 11px;
  display: flex;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>