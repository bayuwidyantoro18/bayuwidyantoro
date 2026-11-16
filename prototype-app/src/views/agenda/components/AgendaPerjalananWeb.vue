<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Daftar Agenda</h2>
        <p class="text-muted mb-0">
          Input dan proses agenda dinas luar pegawai.
        </p>
      </div>
    </div>

    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      {{ message }}
      <button type="button" class="btn-close" @click="$emit('clear-message')"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="$emit('clear-error')"></button>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-header bg-white py-2 px-3">
        <h5 class="mb-0 fw-bold">
          Tambah Agenda
        </h5>
      </div>

      <div class="card-body p-2">
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
              Tambah Tujuan
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
                  placeholder="Contoh: Kantor Pusat Menara Mandiri"
                  required
                >
              </div>

              <div>
                <label class="form-label compact-label">Keperluan</label>
                <input
                  type="text"
                  v-model="item.keperluan"
                  class="form-control form-control-sm"
                  placeholder="Contoh: Mengantar Invoice ke PT A"
                  required
                >
              </div>
            </div>
          </div>

          <div class="compact-action-row">
            <button
              type="button"
              class="btn btn-warning me-2"
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
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">
            Data Perjalanan
          </h5>

          <div class="d-flex gap-2">
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
              <option value="">Semua Status</option>
              <option value="antrian">Antrian</option>
              <option value="dalam_perjalanan">Sedang Dalam Perjalanan</option>
              <option value="sampai_tujuan">Sampai di Tujuan</option>
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

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px;">No</th>
                <th>Petugas</th>
                <th>Tujuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Waktu Mulai</th>
                <th>Waktu Sampai</th>
                <th>Waktu Selesai</th>
                <th>Bukti Foto</th>
                <th style="width: 260px;">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(agenda, index) in agendaList"
                :key="agenda.id"
              >
                <td>{{ index + 1 }}</td>

                <td>
                  <div class="fw-semibold">{{ userName(agenda) }}</div>
                </td>

                <td>
                  <div class="fw-semibold">{{ agenda.tujuan }}</div>
                </td>

                <td>{{ agenda.keperluan }}</td>

                <td>
                  <span
                    class="badge"
                    :class="statusBadgeClass(agenda.status)"
                  >
                    {{ statusLabel(agenda.status) }}
                  </span>
                </td>

                <td>{{ formatDateTime(agenda.waktu_mulai) }}</td>
                <td>{{ formatDateTime(agenda.waktu_sampai) }}</td>
                <td>{{ formatDateTime(agenda.waktu_selesai) }}</td>

                <td>
                  <button
                    v-if="agenda.status === 'selesai'"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="$emit('lihat-foto', agenda.id)"
                  >
                    <i class="bi bi-images me-1"></i>
                    Lihat
                  </button>

                  <span v-else class="text-muted small">-</span>
                </td>

                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <button
                      v-if="agenda.status === 'antrian' && canActOnAgenda(agenda)"
                      class="btn btn-sm btn-success"
                      @click="$emit('proses-aksi', agenda, 'mulai')"
                      :disabled="actionLoading === `${agenda.id}-mulai`"
                    >
                      <span v-if="actionLoading === `${agenda.id}-mulai`" class="spinner-border spinner-border-sm"></span>
                      <span v-else>Mulai</span>
                    </button>

                    <button
                      v-if="agenda.status === 'antrian' && canActOnAgenda(agenda)"
                      class="btn btn-sm btn-outline-danger"
                      @click="$emit('batal-agenda', agenda)"
                      :disabled="actionLoading === `${agenda.id}-batal`"
                    >
                      Batal
                    </button>

                    <button
                      v-if="agenda.status === 'dalam_perjalanan' && canActOnAgenda(agenda)"
                      class="btn btn-sm btn-warning"
                      @click="$emit('proses-aksi', agenda, 'sampai')"
                      :disabled="actionLoading === `${agenda.id}-sampai`"
                    >
                      Sampai
                    </button>

                    <button
                      v-if="agenda.status === 'sampai_tujuan' && canActOnAgenda(agenda)"
                      class="btn btn-sm btn-primary"
                      @click="$emit('proses-aksi', agenda, 'selesai')"
                      :disabled="actionLoading === `${agenda.id}-selesai`"
                    >
                      Selesai
                    </button>

                    <span
                      v-if="['selesai', 'batal'].includes(agenda.status)"
                      class="text-muted small"
                    >
                      Agenda Selesai
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Saat tombol Mulai, Sampai, atau Selesai diklik,
      browser akan meminta izin lokasi. Lokasi wajib diizinkan agar sistem dapat
      menyimpan titik perjalanan.
    </div>
  </div>

</template>

<script setup>
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
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compact-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

.btn-xs {
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.2;
}
</style>

<style scoped src="./agenda-unified.css"></style>
