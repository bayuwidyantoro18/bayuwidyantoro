<template>
  <div class="pwa-laporan-page">
    <PwaPageHeader
        icon="fas fa-file-alt"
        title="Laporan Agenda"
        subtitle="Rekap perjalanan dinas luar pegawai."
        />

    <div class="pwa-filter-card">
      <div class="filter-grid">
        <div>
          <label class="form-label compact-label">Tanggal</label>
          <input
            type="date"
            :value="filter.tanggal"
            class="form-control form-control-sm"
            @change="$emit('update-tanggal', $event.target.value)"
          >
        </div>

        <div>
          <label class="form-label compact-label">Status</label>
          <select
            :value="filter.status"
            class="form-select form-select-sm"
            @change="$emit('update-status', $event.target.value)"
          >
            <option value="">Semua</option>
            <option value="antrian">Antrian</option>
            <option value="dalam_perjalanan">Jalan</option>
            <option value="sampai_tujuan">Sampai</option>
            <option value="selesai">Selesai</option>
            <option value="batal">Batal</option>
          </select>
        </div>
      </div>

      <button
        class="btn btn-sm btn-primary w-100 mt-2"
        @click="$emit('load-data')"
        :disabled="loading"
      >
        <i class="fas fa-search me-1"></i>
        Tampilkan
      </button>
    </div>

    <div class="pwa-export-row">
      <button
        class="btn btn-sm btn-success"
        @click="$emit('export-excel')"
        :disabled="exportingExcel"
      >
        <span v-if="exportingExcel" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="fas fa-file-excel me-1"></i>
        Excel
      </button>

      <button
        class="btn btn-sm btn-danger"
        @click="$emit('export-pdf')"
        :disabled="exportingPdf"
      >
        <span v-if="exportingPdf" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="fas fa-file-pdf me-1"></i>
        PDF
      </button>
    </div>

    <div class="pwa-section-title">
      <span>Data Laporan</span>
      <small>{{ agendaList.length }} data</small>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
      <div class="text-muted mt-2">Memuat laporan...</div>
    </div>

    <div v-else-if="agendaList.length === 0" class="pwa-empty-card">
      <i class="fas fa-file-alt"></i>
      <div>Tidak ada data laporan.</div>
    </div>

    <div v-else class="pwa-report-list">
      <div
        v-for="(agenda, index) in agendaList"
        :key="agenda.id"
        class="pwa-report-card"
      >
        <div class="report-top">
          <div>
            <div class="report-number">
              #{{ index + 1 }} · {{ formatDate(agenda.tanggal) }}
            </div>

            <h6 class="report-title">
              {{ agenda.tujuan }}
            </h6>
          </div>

          <span
            class="badge report-status"
            :class="statusBadgeClass(agenda.status)"
          >
            {{ statusLabel(agenda.status) }}
          </span>
        </div>

        <div class="report-meta">
          <span>
            <i class="fas fa-user me-1"></i>
            {{ userName(agenda) }}
          </span>
        </div>

        <div class="report-purpose">
          {{ agenda.keperluan }}
        </div>

        <div class="report-info-grid">
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
            <a
              v-if="lokasiTerbaru(agenda).url"
              :href="lokasiTerbaru(agenda).url"
              target="_blank"
            >
              {{ lokasiTerbaru(agenda).label }}
            </a>
            <span v-else>-</span>
          </div>
        </div>

        <div class="report-action-row">
          <a
            v-if="lokasiTerbaru(agenda).url"
            :href="lokasiTerbaru(agenda).url"
            target="_blank"
            class="btn btn-sm btn-outline-primary"
          >
            <i class="fas fa-map-marker-alt me-1"></i>
            Maps
          </a>

          <button
            v-if="agenda.foto_selesai_url"
            class="btn btn-sm btn-outline-primary"
            @click="$emit('lihat-foto', agenda.id)"
          >
            <i class="fas fa-image me-1"></i>
            Foto
          </button>
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
  loading: {
    type: Boolean,
    default: false
  },
  agendaList: {
    type: Array,
    default: () => []
  },
  exportingExcel: {
    type: Boolean,
    default: false
  },
  exportingPdf: {
    type: Boolean,
    default: false
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
  'update-tanggal',
  'update-status',
  'load-data',
  'export-excel',
  'export-pdf',
  'lihat-foto'
])
</script>

<style scoped>
.pwa-laporan-page {
  padding: 2px;
}

.pwa-filter-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compact-label {
  font-size: 10.5px;
  font-weight: 700;
  margin-bottom: 3px;
  color: #374151;
}

.pwa-export-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.pwa-export-row .btn {
  font-weight: 700;
  min-height: 36px;
}

.pwa-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 2px 8px;
  font-weight: 800;
  color: #111827;
}

.pwa-section-title small {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
}

.pwa-empty-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 12px;
  text-align: center;
  color: #6c757d;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.06);
}

.pwa-empty-card i {
  font-size: 28px;
  margin-bottom: 8px;
}

.pwa-report-list {
  display: grid;
  gap: 10px;
}

.pwa-report-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  padding: 11px;
  box-shadow: 0 0.25rem 0.7rem rgba(0, 0, 0, 0.05);
}

.report-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.report-number {
  font-size: 11px;
  font-weight: 800;
  color: #6c757d;
}

.report-title {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
}

.report-status {
  font-size: 10px;
  white-space: nowrap;
}

.report-meta {
  margin-top: 4px;
  font-size: 11px;
  color: #6c757d;
}

.report-purpose {
  margin-top: 4px;
  font-size: 12px;
  color: #374151;
  line-height: 1.35;
}

.report-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dee2e6;
}

.report-info-grid div {
  font-size: 10.5px;
  color: #6c757d;
}

.report-info-grid strong {
  display: block;
  color: #212529;
  font-size: 10.5px;
}

.report-info-grid span,
.report-info-grid a {
  display: block;
  font-size: 10.5px;
  word-break: break-word;
}

.report-action-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
  margin-top: 9px;
}

.report-action-row .btn {
  font-size: 12px;
  font-weight: 700;
}
</style>

<style scoped src="./agenda-unified.css"></style>
