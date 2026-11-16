<template>
  <div>
    <PwaPageHeader
        icon="fas fa-route"
        title="Daftar Agenda"
        subtitle="Input dan proses agenda dinas luar pegawai."
        />

    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      {{ message }}
      <button type="button" class="btn-close" @click="$emit('clear-message')"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="$emit('clear-error')"></button>
    </div>

    <div class="card shadow-sm mb-3">
      <div class="card-header bg-white py-2 px-3">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold">
            Tambah Agenda
          </h6>

          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="$emit('toggle-form')"
          >
            <i
              class="fas me-1"
              :class="showFormAgenda ? 'fa-chevron-up' : 'fa-chevron-down'"
            ></i>
            {{ showFormAgenda ? 'Tutup' : 'Buka' }}
          </button>
        </div>
      </div>

      <transition name="slide-fade">
        <div
          v-if="showFormAgenda"
          class="card-body p-2"
        >
          <form @submit.prevent="$emit('simpan-agenda')" class="compact-agenda-form">
            <div class="compact-top-row">
              <div class="date-box">
                <label class="form-label compact-label">Tanggal</label>
                <input
                  type="date"
                  v-model="form.tanggal"
                  class="form-control form-control-sm"
                  required
                >
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-primary add-target-btn"
                @click="$emit('tambah-tujuan')"
              >
                <i class="fas fa-plus me-1"></i>
                Tujuan
              </button>
            </div>

            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="compact-tujuan-card"
            >
              <div class="compact-tujuan-header">
                <strong>Tujuan {{ index + 1 }}</strong>

                <button
                  v-if="form.items.length > 1"
                  type="button"
                  class="btn btn-xs btn-outline-danger"
                  @click="$emit('hapus-tujuan', index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <div class="compact-input-grid">
                <div>
                  <label class="form-label compact-label">Tujuan</label>
                  <input
                    type="text"
                    v-model="item.tujuan"
                    class="form-control form-control-sm"
                    placeholder="Contoh: Kantor Pusat"
                    required
                  >
                </div>

                <div>
                  <label class="form-label compact-label">Keperluan</label>
                  <input
                    type="text"
                    v-model="item.keperluan"
                    class="form-control form-control-sm"
                    placeholder="Contoh: Mengantar Invoice"
                    required
                  >
                </div>
              </div>
            </div>

            <div class="compact-action-row">
              <button
                type="button"
                class="btn btn-sm btn-warning"
                @click="$emit('reset-form')"
              >
                Reset
              </button>

              <button
                type="submit"
                class="btn btn-sm btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white py-2 px-3">
        <div class="pwa-filter-row">
          <div class="fw-bold small">
            Data Perjalanan
          </div>

          <div class="d-flex gap-1">
            <input
              type="date"
              v-model="filter.tanggal"
              class="form-control form-control-sm"
              @change="$emit('load-data')"
            >

            <select
              v-model="filter.status"
              class="form-select form-select-sm"
              @change="$emit('load-data')"
            >
              <option value="">Semua</option>
              <option value="antrian">Antrian</option>
              <option value="dalam_perjalanan">Jalan</option>
              <option value="sampai_tujuan">Sampai</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>

            <button
              class="btn btn-sm btn-primary"
              @click="$emit('load-data')"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat data...</div>
        </div>

        <div v-else-if="agendaList.length === 0" class="text-center text-muted py-5">
          Belum ada data perjalanan.
        </div>

        <div v-else class="pwa-agenda-list">
          <div
            v-for="(agenda, index) in agendaList"
            :key="agenda.id"
            class="pwa-agenda-card"
          >
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <div class="pwa-number">
                    #{{ index + 1 }}
                  </div>

                  <span
                    class="badge"
                    :class="statusBadgeClass(agenda.status)"
                  >
                    {{ statusLabel(agenda.status) }}
                  </span>
                </div>

                <h6 class="fw-bold mb-1">
                  {{ agenda.tujuan }}
                </h6>

                <div class="small text-muted mb-1">
                  <i class="fas fa-user me-1"></i>
                  {{ userName(agenda) }}
                </div>

                <div class="small">
                  <strong>Keperluan:</strong> {{ agenda.keperluan }}
                </div>
              </div>
            </div>

            <div class="pwa-info-grid mt-2">
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
                <strong>Lokasi</strong>
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

            <div v-if="agenda.status === 'selesai' && agenda.foto_selesai" class="mt-2">
              <button
                class="btn btn-sm btn-outline-primary w-100"
                @click="$emit('lihat-foto', agenda.id)"
              >
                <i class="fas fa-image me-1"></i>
                Lihat Bukti Foto
              </button>
            </div>

            <div class="pwa-action-row mt-2">
              <button
                v-if="agenda.status === 'antrian' && canActOnAgenda(agenda)"
                class="btn btn-success"
                @click="$emit('proses-aksi', agenda, 'mulai')"
                :disabled="actionLoading === `${agenda.id}-mulai`"
              >
                <i class="fas fa-play me-1"></i>
                Mulai
              </button>

              <button
                v-if="agenda.status === 'antrian' && canActOnAgenda(agenda)"
                class="btn btn-outline-danger"
                @click="$emit('batal-agenda', agenda)"
                :disabled="actionLoading === `${agenda.id}-batal`"
              >
                Batal
              </button>

              <button
                v-if="agenda.status === 'dalam_perjalanan' && canActOnAgenda(agenda)"
                class="btn btn-warning"
                @click="$emit('proses-aksi', agenda, 'sampai')"
                :disabled="actionLoading === `${agenda.id}-sampai`"
              >
                <i class="fas fa-map-marker-alt me-1"></i>
                Sampai
              </button>

              <button
                v-if="agenda.status === 'sampai_tujuan' && canActOnAgenda(agenda)"
                class="btn btn-primary"
                @click="$emit('proses-aksi', agenda, 'selesai')"
                :disabled="actionLoading === `${agenda.id}-selesai`"
              >
                <i class="fas fa-check me-1"></i>
                Selesai
              </button>

              <div
                v-if="['selesai', 'batal'].includes(agenda.status)"
                class="text-muted small text-center w-100"
              >
                Tidak ada aksi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Saat tombol Mulai, Sampai, atau Selesai diklik,
      browser akan meminta izin lokasi.
    </div>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

const props = defineProps({
  message: String,
  errorMessage: String,
  loading: Boolean,
  saving: Boolean,
  actionLoading: String,
  agendaList: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  showFormAgenda: Boolean,
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
  currentUserId: {
    type: [Number, String],
    default: null
  },
  currentUserRole: {
    type: String,
    default: null
  },
  lokasiTerbaru: {
    type: Function,
    required: true
  }
})

const canActOnAgenda = (agenda) => {
  const role = String(props.currentUserRole || '')
    .trim()
    .toLowerCase()

  return role === 'superadmin' || (
    props.currentUserId != null &&
    Number(agenda?.user_id) === Number(props.currentUserId)
  )
}

defineEmits([
  'clear-message',
  'clear-error',
  'toggle-form',
  'tambah-tujuan',
  'hapus-tujuan',
  'load-data',
  'simpan-agenda',
  'reset-form',
  'proses-aksi',
  'batal-agenda',
  'lihat-foto'
])

</script>

<style scoped>
.pwa-filter-row {
  display: grid;
  gap: 8px;
}

.pwa-agenda-list {
  padding: 10px;
}

.pwa-agenda-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.8rem rgba(0, 0, 0, 0.04);
}

.pwa-number {
  font-size: 11px;
  font-weight: 800;
  color: #6c757d;
}

.pwa-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
  padding-top: 8px;
  border-top: 1px dashed #dee2e6;
}

.pwa-info-grid div {
  font-size: 10.5px;
  color: #6c757d;
}

.pwa-info-grid strong {
  display: block;
  color: #212529;
  font-size: 10.5px;
}

.pwa-info-grid span,
.pwa-info-grid a {
  display: block;
  font-size: 10.5px;
  word-break: break-word;
}

.pwa-action-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
}

.pwa-action-row .btn {
  min-height: 40px;
  font-size: 12px;
  font-weight: 700;
}

.compact-agenda-form {
  font-size: 12px;
}

.compact-top-row {
  display: flex;
  align-items: end;
  gap: 8px;
  margin-bottom: 8px;
}

.date-box {
  flex: 1;
}

.add-target-btn {
  white-space: nowrap;
  height: 31px;
}

.compact-label {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 3px;
  color: #374151;
}

.compact-tujuan-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 8px;
}

.compact-tujuan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.compact-input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.compact-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.btn-xs {
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.2;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<style scoped src="./agenda-unified.css"></style>
