<template>
  <div class="container-fluid arsip-dashboard-web">
    <div class="page-head">
      <div>
        <h3 class="page-title">Dashboard Arsip Perusahaan</h3>
        <p class="page-subtitle">
          Monitoring jumlah dokumen, folder, dokumen berjangka aktif, dokumen akan berakhir, dan dokumen yang sudah berakhir.
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

    <div class="access-box">
      <div>
        <span>Akses Arsip</span>
        <strong>
          {{ userAccess?.is_superadmin ? 'Semua Unit Kerja' : userAccess?.unit_kerja || 'Unit kerja belum terdeteksi' }}
        </strong>
      </div>

      <div class="access-badge" :class="userAccess?.is_superadmin ? 'superadmin' : 'unit'">
        {{ userAccess?.is_superadmin ? 'Superadmin' : 'User Unit' }}
      </div>
    </div>

    <div class="summary-grid">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="summary-card"
      >
        <div class="summary-icon" :class="card.class">
          <i :class="card.icon"></i>
        </div>

        <div>
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.caption }}</small>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-xl-5">
        <div class="card compact-card h-100">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-chart-pie"></i>
              <span>Total Dokumen Per Unit</span>
            </div>

            <small>{{ totalPerUnit.length }} unit</small>
          </div>

          <div class="card-body p-0">
            <div v-if="loading" class="compact-loading">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span>Memuat data...</span>
            </div>

            <div v-else-if="totalPerUnit.length === 0" class="compact-empty">
              Belum ada data unit kerja.
            </div>

            <div v-else class="unit-list">
              <button
                v-for="unit in totalPerUnit"
                :key="unit.id"
                type="button"
                class="unit-item"
                @click="goUnit(unit)"
              >
                <div class="unit-main">
                  <div class="unit-icon">
                    <i class="fas fa-building"></i>
                  </div>

                  <div>
                    <strong>{{ unit.nama_unit }}</strong>
                    <span>{{ unit.total_folder }} folder</span>
                  </div>
                </div>

                <div class="unit-stats">
                  <strong>{{ unit.total_dokumen }}</strong>
                  <span>Dokumen</span>
                </div>

                <div class="unit-progress">
                  <div
                    class="unit-progress-bar"
                    :style="{ width: unitProgress(unit.total_dokumen) + '%' }"
                  ></div>
                </div>

                <div class="unit-meta">
                  <span>Berjangka: {{ unit.total_berjangka }}</span>
                  <span>Tidak Berjangka: {{ unit.total_tidak_berjangka }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-7">
        <div class="card compact-card h-100">
          <div class="compact-card-header">
            <div class="header-title">
              <i class="fas fa-hourglass-half"></i>
              <span>Dokumen Aktif Akan Berakhir</span>
            </div>

            <small>{{ akanBerakhir.length }} data</small>
          </div>

          <div class="card-body p-0">
            <div v-if="loading" class="compact-loading">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span>Memuat dokumen...</span>
            </div>

            <div v-else-if="akanBerakhir.length === 0" class="compact-empty">
              Tidak ada dokumen aktif yang akan berakhir dalam 30 hari.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0 compact-table">
                <thead>
                  <tr>
                    <th>Dokumen</th>
                    <th>Unit / Folder</th>
                    <th style="width: 120px;">Berakhir</th>
                    <th style="width: 105px;">Sisa</th>
                    <th style="width: 70px;">View</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="doc in akanBerakhir" :key="doc.id">
                    <td>
                      <strong>{{ doc.nama_dokumen }}</strong>
                      <br>
                      <small>{{ doc.nomor_dokumen || '-' }}</small>
                    </td>

                    <td>
                      {{ doc.unit?.nama_unit || '-' }}
                      <br>
                      <small>{{ doc.folder?.nama_folder || 'Root Folder' }}</small>
                    </td>

                    <td>{{ formatDate(doc.tanggal_berakhir) }}</td>

                    <td>
                      <span class="badge status-badge" :class="statusExpiredClass(doc)">
                        {{ doc.sisa_hari }} hari
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary action-btn"
                        @click="openDocument(doc)"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card mt-3">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-triangle-exclamation"></i>
          <span>Dokumen Aktif Sudah Berakhir</span>
        </div>

        <small>{{ sudahBerakhir.length }} data</small>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat dokumen...</span>
        </div>

        <div v-else-if="sudahBerakhir.length === 0" class="compact-empty">
          Tidak ada dokumen aktif yang sudah berakhir.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="width: 210px;">Dokumen</th>
                <th>Unit Kerja</th>
                <th>Folder</th>
                <th>Kategori</th>
                <th style="width: 130px;">Tanggal Berakhir</th>
                <th style="width: 110px;">Status</th>
                <th style="width: 90px;">View</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="doc in sudahBerakhir" :key="doc.id">
                <td>
                  <strong>{{ doc.nama_dokumen }}</strong>
                  <br>
                  <small>{{ doc.nomor_dokumen || '-' }}</small>
                </td>

                <td>{{ doc.unit?.nama_unit || '-' }}</td>
                <td>{{ doc.folder?.nama_folder || 'Root Folder' }}</td>
                <td>{{ doc.kategori || '-' }}</td>
                <td>{{ formatDate(doc.tanggal_berakhir) }}</td>

                <td>
                  <span class="badge bg-danger status-badge">
                    {{ Math.abs(doc.sisa_hari) }} hari lewat
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary action-btn"
                    @click="openDocument(doc)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  summary: {
    type: Object,
    required: true
  },
  totalPerUnit: {
    type: Array,
    default: () => []
  },
  akanBerakhir: {
    type: Array,
    default: () => []
  },
  sudahBerakhir: {
    type: Array,
    default: () => []
  },
  userAccess: {
    type: Object,
    default: () => ({})
  },
  formatDate: {
    type: Function,
    required: true
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  statusExpiredClass: {
    type: Function,
    required: true
  },
  openDocument: {
    type: Function,
    required: true
  },
  goUnit: {
    type: Function,
    required: true
  }
})

defineEmits(['reload'])

const summaryCards = computed(() => [
  {
    label: 'Total Dokumen',
    value: props.summary.total_dokumen || 0,
    caption: 'Seluruh dokumen arsip',
    icon: 'fas fa-file-lines',
    class: 'primary'
  },
  {
    label: 'Total Folder',
    value: props.summary.total_folder || 0,
    caption: 'Folder aktif',
    icon: 'fas fa-folder-tree',
    class: 'info'
  },
  {
    label: 'Berjangka Aktif',
    value: props.summary.dokumen_berjangka_aktif || 0,
    caption: 'Dokumen aktif berjangka',
    icon: 'fas fa-toggle-on',
    class: 'success'
  },
  {
    label: 'Akan Berakhir',
    value: props.summary.dokumen_akan_berakhir || 0,
    caption: 'Dalam 30 hari',
    icon: 'fas fa-hourglass-half',
    class: 'warning'
  },
  {
    label: 'Sudah Berakhir',
    value: props.summary.dokumen_sudah_berakhir || 0,
    caption: 'Perlu tindak lanjut',
    icon: 'fas fa-triangle-exclamation',
    class: 'danger'
  }
])

const maxUnitTotal = computed(() => {
  const totals = props.totalPerUnit.map((unit) => Number(unit.total_dokumen || 0))
  return Math.max(...totals, 1)
})

const unitProgress = (value) => {
  return Math.round((Number(value || 0) / maxUnitTotal.value) * 100)
}
</script>

<style scoped>
.arsip-dashboard-web {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
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
  border-radius: 8px;
  padding: 5px 10px;
}

.access-box {
  min-height: 42px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.access-box span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.access-box strong {
  display: block;
  color: #111827;
  font-size: 13px;
  font-weight: 900;
}

.access-badge {
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 10.5px;
  font-weight: 900;
}

.access-badge.superadmin {
  background: #dcfce7;
  color: #15803d;
}

.access-badge.unit {
  background: #eef2ff;
  color: #4338ca;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.summary-card {
  min-height: 86px;
  padding: 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 0.28rem 0.8rem rgba(15, 23, 42, 0.055);
  display: flex;
  align-items: center;
  gap: 11px;
}

.summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.summary-icon.primary {
  background: #eef2ff;
  color: #2563eb;
}

.summary-icon.info {
  background: #ecfeff;
  color: #0891b2;
}

.summary-icon.success {
  background: #dcfce7;
  color: #15803d;
}

.summary-icon.warning {
  background: #fef3c7;
  color: #b45309;
}

.summary-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.summary-card strong {
  display: block;
  color: #111827;
  font-size: 23px;
  line-height: 1.1;
  font-weight: 950;
  margin: 2px 0;
}

.summary-card small {
  display: block;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 700;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 13px;
  overflow: hidden;
  box-shadow: 0 0.22rem 0.7rem rgba(15, 23, 42, 0.045);
}

.compact-card-header {
  min-height: 39px;
  padding: 8px 12px;
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
  font-size: 13px;
  font-weight: 900;
}

.compact-card-header small {
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 800;
}

.compact-loading,
.compact-empty {
  min-height: 82px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
}

.unit-list {
  padding: 8px;
}

.unit-item {
  width: 100%;
  border: 1px solid #edf2f7;
  background: #ffffff;
  border-radius: 12px;
  padding: 9px 10px;
  margin-bottom: 7px;
  text-align: left;
  transition: all 0.16s ease;
}

.unit-item:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
  transform: translateY(-1px);
}

.unit-main {
  display: flex;
  align-items: center;
  gap: 9px;
}

.unit-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit-main strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 900;
}

.unit-main span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.unit-stats {
  position: absolute;
  right: 12px;
  margin-top: -35px;
  text-align: right;
}

.unit-stats strong {
  display: block;
  color: #111827;
  font-size: 18px;
  line-height: 1;
  font-weight: 950;
}

.unit-stats span {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
}

.unit-progress {
  height: 5px;
  margin-top: 9px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.unit-progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.unit-meta {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
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

.compact-table strong {
  color: #111827;
  font-weight: 900;
}

.compact-table small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.status-badge {
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 900;
  padding: 4px 8px;
}

.action-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-head {
    flex-direction: column;
  }
}
</style>