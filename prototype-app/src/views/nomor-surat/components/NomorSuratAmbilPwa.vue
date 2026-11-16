<template>
  <div class="pwa-nomor-page">
    <PwaPageHeader
      icon="fas fa-plus-circle"
      title="Nomor Surat Keluar"
      subtitle="Pembuatan nomor surat keluar perusahaan."
    />

    <div class="toolbar-card">
      <div>
        <strong>Nomor Surat</strong>
        <small>Buat nomor surat keluar atau lihat riwayat terbaru.</small>
      </div>

      <button
        v-if="!showForm"
        type="button"
        class="btn btn-primary btn-sm"
        @click="openForm"
      >
        <i class="fas fa-plus me-1"></i>
        Tambah
      </button>

      <button
        v-else
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="closeForm"
      >
        <i class="fas fa-times me-1"></i>
        Tutup
      </button>
    </div>

    <transition name="slide-fade">
      <div v-if="showForm" class="pwa-card">
        <div class="card-title-row">
          <strong>Form Nomor Surat Keluar</strong>
          <i class="fas fa-file-signature"></i>
        </div>

        <div class="field-block">
          <label class="compact-label">Jenis Surat</label>
          <select
            class="form-select form-select-sm"
            :value="form.jenis_surat"
            @change="$emit('update-form', { field: 'jenis_surat', value: $event.target.value })"
          >
            <option
              v-for="item in jenisOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="field-block">
          <label class="compact-label">Tanggal Surat</label>
          <input
            type="date"
            class="form-control form-control-sm"
            :value="form.tanggal_surat"
            @change="$emit('update-form', { field: 'tanggal_surat', value: $event.target.value })"
          >
        </div>

        <div class="field-block">
          <label class="compact-label">Perihal</label>
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Perihal surat"
            :value="form.perihal"
            @input="$emit('update-form', { field: 'perihal', value: $event.target.value })"
          >
        </div>

        <div class="field-block">
          <label class="compact-label">Tujuan / Kepada</label>
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Tujuan surat"
            :value="form.tujuan"
            @input="$emit('update-form', { field: 'tujuan', value: $event.target.value })"
          >
        </div>

        <div class="field-block">
          <label class="compact-label">Keterangan</label>
          <textarea
            rows="3"
            class="form-control form-control-sm"
            placeholder="Keterangan tambahan"
            :value="form.keterangan"
            @input="$emit('update-form', { field: 'keterangan', value: $event.target.value })"
          ></textarea>
        </div>

        <div class="form-action-row">
          <button
            type="button"
            class="btn btn-light btn-sm"
            :disabled="saving"
            @click="handleCancel"
          >
            <i class="fas fa-times me-1"></i>
            Batal
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            :disabled="saving"
            @click="$emit('reset-form')"
          >
            <i class="fas fa-rotate-left me-1"></i>
            Reset
          </button>

          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="saving || loading"
            @click="$emit('submit')"
          >
            <i class="fas fa-save me-1"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </transition>

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

    <div v-if="loading" class="loading-card">
      <div class="spinner-border text-primary"></div>
      <div class="mt-2 text-muted">Memuat data...</div>
    </div>

    <div v-else-if="recentList.length === 0" class="empty-card">
      <i class="fas fa-inbox"></i>
      <div>Belum ada nomor surat yang diambil.</div>
    </div>

    <div
      v-else
      v-for="(item, index) in recentList"
      :key="item.id || index"
      class="recent-card"
    >
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="mb-1">{{ item.nomor_surat }}</h6>
          <div class="text-muted small fw-semibold">
            {{ item.label_jenis_surat || item.jenis_surat }}
          </div>
          <div class="text-muted small">
            {{ formatDate(item.tanggal_surat_normalized || item.tanggal_surat) }}
          </div>
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
        <span>Tujuan</span>
        <strong>{{ item.tujuan || '-' }}</strong>
      </div>

      <div class="mini-info">
        <span>Pemohon</span>
        <strong>{{ item.diambil_oleh || '-' }}</strong>
      </div>

      <div class="mini-info">
        <span>Waktu Input</span>
        <strong>{{ formatDateTime(item.created_at) }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  form: {
    type: Object,
    required: true
  },
  jenisOptions: {
    type: Array,
    default: () => []
  },
  recentList: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  saving: Boolean,
  formatDateTime: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  statusClass: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'update-form',
  'submit',
  'reload',
  'reset-form'
])

const showForm = ref(false)

const openForm = () => {
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

const handleCancel = () => {
  emit('reset-form')
  closeForm()
}
</script>

<style scoped>
.pwa-nomor-page {
  padding: 2px;
  padding-bottom: 18px;
}

.toolbar-card,
.pwa-card,
.recent-card,
.loading-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.055);
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
}

.toolbar-card strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.toolbar-card small {
  display: block;
  font-size: 10.5px;
  color: #6c757d;
  font-weight: 600;
  line-height: 1.3;
}

.loading-card,
.empty-card {
  text-align: center;
  padding: 28px 12px;
  color: #6c757d;
}

.empty-card i {
  font-size: 28px;
  margin-bottom: 8px;
}

.card-title-row,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #111827;
}

.card-title-row strong,
.section-header span {
  font-size: 13px;
  font-weight: 900;
}

.field-block {
  margin-bottom: 9px;
}

.compact-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.form-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 8px;
  margin-top: 12px;
}

.form-action-row .btn {
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 800;
  padding: 8px 6px;
}

.mini-info {
  padding: 7px 0;
  border-bottom: 1px solid #f1f3f5;
}

.mini-info:last-child {
  border-bottom: none;
}

.mini-info span {
  display: block;
  font-size: 10.5px;
  color: #6c757d;
  font-weight: 700;
}

.mini-info strong {
  display: block;
  font-size: 12.5px;
  color: #111827;
  word-break: break-word;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.22s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>