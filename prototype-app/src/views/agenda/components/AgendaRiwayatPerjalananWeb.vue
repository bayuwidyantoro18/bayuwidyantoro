<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Riwayat Perjalanan</h2>
        <p class="text-muted mb-0">
          Pencarian histori perjalanan dinas luar pegawai.
        </p>
      </div>

      <button
        class="btn btn-primary"
        @click="$emit('load-data')"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="row mb-4">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="col-md-2 col-sm-6 mb-3"
      >
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">{{ card.label }}</div>
            <h3 class="fw-bold mb-0">{{ summary[card.key] || 0 }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-2">
            <label class="form-label">Tanggal Mulai</label>
            <input
              type="date"
              :value="filter.tanggal_mulai"
              class="form-control"
              @change="$emit('update-filter', { field: 'tanggal_mulai', value: $event.target.value })"
            >
          </div>

          <div class="col-md-2">
            <label class="form-label">Tanggal Selesai</label>
            <input
              type="date"
              :value="filter.tanggal_selesai"
              class="form-control"
              @change="$emit('update-filter', { field: 'tanggal_selesai', value: $event.target.value })"
            >
          </div>

          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select
              :value="filter.status"
              class="form-select"
              @change="$emit('update-filter', { field: 'status', value: $event.target.value })"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Keyword</label>
            <input
              type="text"
              :value="filter.keyword"
              class="form-control"
              placeholder="Tujuan, keperluan, pegawai..."
              @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
              @keyup.enter="$emit('load-data')"
            >
          </div>

          <div class="col-md-3 d-flex gap-2">
            <button
              class="btn btn-primary"
              @click="$emit('load-data')"
              :disabled="loading"
            >
              <i class="fas fa-search me-1"></i>
              Cari
            </button>

            <button
              class="btn btn-outline-secondary"
              @click="$emit('reset-filter')"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">
          Data Riwayat Perjalanan
        </h5>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat riwayat...</div>
        </div>

        <div v-else-if="agendaList.length === 0" class="text-center text-muted py-5">
          Tidak ada data riwayat perjalanan.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px;">No</th>
                <th>Tanggal</th>
                <th>Petugas</th>
                <th>Tujuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Mulai</th>
                <th>Sampai</th>
                <th>Selesai</th>
                <th>Lokasi Terbaru</th>
                <th>Foto</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(agenda, index) in agendaList"
                :key="agenda.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ formatDate(agenda.tanggal) }}</td>
                <td>{{ userName(agenda) }}</td>
                <td>{{ agenda.tujuan }}</td>
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
                  <div class="small fw-semibold">
                    {{ lokasiTerbaru(agenda).label }}
                  </div>

                  <div class="text-muted small">
                    {{ lokasiTerbaru(agenda).koordinat }}
                  </div>

                  <a
                    v-if="lokasiTerbaru(agenda).url"
                    :href="lokasiTerbaru(agenda).url"
                    target="_blank"
                    class="btn btn-sm btn-outline-primary mt-1"
                  >
                    Maps
                  </a>
                </td>

                <td>
                  <button
                    v-if="agenda.foto_selesai_url"
                    class="btn btn-sm btn-outline-primary"
                    @click="$emit('lihat-foto', agenda.id)"
                  >
                    <i class="fas fa-image me-1"></i>
                    Lihat
                  </button>

                  <span v-else class="text-muted small">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Riwayat perjalanan digunakan untuk pencarian histori.
      Untuk kebutuhan cetak atau unduh file, gunakan menu Laporan Perjalanan.
    </div>
  </div>
</template>

<script setup>
const summaryCards = [
  { key: 'total', label: 'Total' },
  { key: 'antrian', label: 'Antrian' },
  { key: 'dalam_perjalanan', label: 'Perjalanan' },
  { key: 'sampai_tujuan', label: 'Sampai' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'batal', label: 'Batal' }
]

defineProps({
  filter: {
    type: Object,
    required: true
  },
  loading: Boolean,
  summary: {
    type: Object,
    default: () => ({})
  },
  agendaList: {
    type: Array,
    default: () => []
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
  'update-filter',
  'load-data',
  'reset-filter',
  'lihat-foto'
])
</script>

<style scoped>
.summary-card {
  border-radius: 12px;
}
</style>

<style scoped src="./agenda-unified.css"></style>
