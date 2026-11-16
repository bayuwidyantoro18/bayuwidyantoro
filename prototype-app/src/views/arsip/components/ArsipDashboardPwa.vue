<template>
  <div class="arsip-dashboard-pwa">
    <div class="pwa-header">
      <div class="header-icon">
        <i class="fas fa-box-archive"></i>
      </div>

      <div>
        <h5>Dashboard Arsip</h5>
        <p>Monitoring dokumen perusahaan.</p>
      </div>

      <button
        type="button"
        class="refresh-btn"
        :disabled="loading"
        @click="$emit('reload')"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="access-card">
      <span>Akses Arsip</span>
      <strong>
        {{ userAccess?.is_superadmin ? 'Semua Unit Kerja' : userAccess?.unit_kerja || 'Unit belum terdeteksi' }}
      </strong>
    </div>

    <div class="summary-scroll">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="summary-card"
      >
        <div class="summary-icon" :class="card.class">
          <i :class="card.icon"></i>
        </div>

        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <div>
          <h6>Total Dokumen Per Unit</h6>
          <small>{{ totalPerUnit.length }} unit kerja</small>
        </div>
      </div>

      <div v-if="loading" class="loading-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data...</span>
      </div>

      <div v-else-if="totalPerUnit.length === 0" class="empty-box">
        Belum ada data unit kerja.
      </div>

      <div v-else>
        <button
          v-for="unit in totalPerUnit"
          :key="unit.id"
          type="button"
          class="unit-card"
          @click="goUnit(unit)"
        >
          <div>
            <strong>{{ unit.nama_unit }}</strong>
            <span>{{ unit.total_folder }} folder</span>
          </div>

          <div class="unit-count">
            {{ unit.total_dokumen }}
          </div>
        </button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <div>
          <h6>Akan Berakhir</h6>
          <small>Dokumen aktif berjangka</small>
        </div>

        <span class="count-pill warning">{{ akanBerakhir.length }}</span>
      </div>

      <div v-if="loading" class="loading-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data...</span>
      </div>

      <div v-else-if="akanBerakhir.length === 0" class="empty-box">
        Tidak ada dokumen yang akan berakhir.
      </div>

      <div
        v-for="doc in akanBerakhir"
        v-else
        :key="doc.id"
        class="doc-card"
      >
        <div class="doc-top">
          <div>
            <h6>{{ doc.nama_dokumen }}</h6>
            <p>{{ doc.nomor_dokumen || '-' }}</p>
          </div>

          <span class="badge" :class="statusExpiredClass(doc)">
            {{ doc.sisa_hari }} hari
          </span>
        </div>

        <div class="doc-info">
          <span>{{ doc.unit?.nama_unit || '-' }}</span>
          <span>{{ doc.folder?.nama_folder || 'Root Folder' }}</span>
        </div>

        <div class="doc-bottom">
          <span>Berakhir: {{ formatDate(doc.tanggal_berakhir) }}</span>

          <button type="button" @click="openDocument(doc)">
            <i class="fas fa-eye"></i>
            View
          </button>
        </div>
      </div>
    </div>

    <div class="section-card danger-section">
      <div class="section-head">
        <div>
          <h6>Sudah Berakhir</h6>
          <small>Dokumen aktif yang melewati masa berlaku</small>
        </div>

        <span class="count-pill danger">{{ sudahBerakhir.length }}</span>
      </div>

      <div v-if="loading" class="loading-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data...</span>
      </div>

      <div v-else-if="sudahBerakhir.length === 0" class="empty-box">
        Tidak ada dokumen yang sudah berakhir.
      </div>

      <div
        v-for="doc in sudahBerakhir"
        v-else
        :key="doc.id"
        class="doc-card"
      >
        <div class="doc-top">
          <div>
            <h6>{{ doc.nama_dokumen }}</h6>
            <p>{{ doc.nomor_dokumen || '-' }}</p>
          </div>

          <span class="badge bg-danger">
            {{ Math.abs(doc.sisa_hari) }} hari lewat
          </span>
        </div>

        <div class="doc-info">
          <span>{{ doc.unit?.nama_unit || '-' }}</span>
          <span>{{ doc.folder?.nama_folder || 'Root Folder' }}</span>
        </div>

        <div class="doc-bottom">
          <span>Berakhir: {{ formatDate(doc.tanggal_berakhir) }}</span>

          <button type="button" @click="openDocument(doc)">
            <i class="fas fa-eye"></i>
            View
          </button>
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
    label: 'Dokumen',
    value: props.summary.total_dokumen || 0,
    icon: 'fas fa-file-lines',
    class: 'primary'
  },
  {
    label: 'Folder',
    value: props.summary.total_folder || 0,
    icon: 'fas fa-folder-tree',
    class: 'info'
  },
  {
    label: 'Berjangka',
    value: props.summary.dokumen_berjangka_aktif || 0,
    icon: 'fas fa-toggle-on',
    class: 'success'
  },
  {
    label: 'Akan Habis',
    value: props.summary.dokumen_akan_berakhir || 0,
    icon: 'fas fa-hourglass-half',
    class: 'warning'
  },
  {
    label: 'Expired',
    value: props.summary.dokumen_sudah_berakhir || 0,
    icon: 'fas fa-triangle-exclamation',
    class: 'danger'
  }
])
</script>

<style scoped>
.arsip-dashboard-pwa {
  padding: 2px;
  padding-bottom: 82px;
}

.pwa-header,
.access-card,
.section-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.pwa-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pwa-header h5 {
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 2px;
  color: #111827;
}

.pwa-header p {
  font-size: 11.5px;
  margin-bottom: 0;
  color: #64748b;
}

.refresh-btn {
  margin-left: auto;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: #2563eb;
}

.access-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.access-card strong {
  display: block;
  color: #111827;
  font-size: 13px;
  font-weight: 900;
}

.summary-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 4px;
}

.summary-card {
  min-width: 118px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 17px;
  padding: 11px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.045);
}

.summary-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
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
  font-size: 10px;
  font-weight: 800;
}

.summary-card strong {
  display: block;
  color: #111827;
  font-size: 22px;
  font-weight: 950;
  line-height: 1;
  margin-top: 2px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.section-head h6 {
  margin-bottom: 1px;
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.section-head small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.count-pill {
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 10.5px;
  font-weight: 900;
}

.count-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.count-pill.danger {
  background: #fee2e2;
  color: #dc2626;
}

.loading-box,
.empty-box {
  min-height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.unit-card {
  width: 100%;
  border: 1px solid #edf2f7;
  background: #ffffff;
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.unit-card strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 900;
}

.unit-card span {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.unit-count {
  min-width: 38px;
  height: 34px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 17px;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-card {
  border: 1px solid #edf2f7;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 8px;
  background: #ffffff;
}

.doc-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.doc-top h6 {
  margin-bottom: 2px;
  font-size: 12.5px;
  font-weight: 900;
  color: #111827;
}

.doc-top p {
  margin-bottom: 0;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.doc-info {
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
}

.doc-bottom {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 10.5px;
  font-weight: 800;
}

.doc-bottom button {
  border: 0;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10.5px;
  font-weight: 900;
}
</style>