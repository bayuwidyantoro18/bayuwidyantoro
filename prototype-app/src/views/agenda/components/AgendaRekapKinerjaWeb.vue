<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Rekap Kinerja Petugas</h2>
        <p class="text-muted mb-0">
          Ringkasan performa petugas berdasarkan aktivitas perjalanan.
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

      <div class="col-md-4 col-sm-12 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Petugas Teraktif</div>
            <h5 class="fw-bold mb-0">{{ summary.petugas_teraktif || '-' }}</h5>
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
              placeholder="Petugas, tujuan, keperluan..."
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
              Tampilkan
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
          Data Kinerja Petugas
        </h5>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat rekap...</div>
        </div>

        <div v-else-if="rekapList.length === 0" class="text-center text-muted py-5">
          Belum ada data kinerja petugas.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px;">Rank</th>
                <th>Petugas</th>
                <th>Total</th>
                <th>Antrian</th>
                <th>Berjalan</th>
                <th>Sampai</th>
                <th>Selesai</th>
                <th>Batal</th>
                <th>Kinerja</th>
                <th>Rata-rata Durasi</th>
                <th>Tujuan Terbanyak</th>
                <th>Aktivitas Terakhir</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in rekapList"
                :key="item.user_id || index"
              >
                <td>
                  <strong>#{{ index + 1 }}</strong>
                </td>

                <td>
                  <div class="fw-bold">{{ item.nama }}</div>
                  <div class="text-muted small">@{{ item.username }}</div>
                </td>

                <td>{{ item.total }}</td>
                <td>{{ item.antrian }}</td>
                <td>{{ item.dalam_perjalanan }}</td>
                <td>{{ item.sampai_tujuan }}</td>
                <td>{{ item.selesai }}</td>
                <td>{{ item.batal }}</td>

                <td style="min-width: 150px;">
                  <div class="d-flex justify-content-between small mb-1">
                    <span>Selesai</span>
                    <strong>{{ item.persentase_selesai || 0 }}%</strong>
                  </div>

                  <div class="progress" style="height: 7px;">
                    <div
                      class="progress-bar bg-success"
                      :style="{ width: (item.persentase_selesai || 0) + '%' }"
                    ></div>
                  </div>
                </td>

                <td>{{ formatDuration(item.rata_rata_menit) }}</td>
                <td>{{ item.tujuan_terbanyak || '-' }}</td>
                <td>{{ formatDateTime(item.aktivitas_terakhir) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Persentase kinerja dihitung dari jumlah agenda selesai dibandingkan total agenda petugas pada periode yang dipilih.
    </div>
  </div>
</template>

<script setup>
const summaryCards = [
  { key: 'total_petugas', label: 'Petugas' },
  { key: 'total_agenda', label: 'Agenda' },
  { key: 'total_selesai', label: 'Selesai' },
  { key: 'total_batal', label: 'Batal' },
  { key: 'total_berjalan', label: 'Berjalan' }
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
  rekapList: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  formatDuration: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-filter',
  'load-data',
  'reset-filter'
])
</script>

<style scoped>
.summary-card {
  border-radius: 12px;
}
</style>

<style scoped src="./agenda-unified.css"></style>
