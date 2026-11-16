<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Monitoring Lokasi</h2>
        <p class="text-muted mb-0">
          Pantau titik lokasi terakhir perjalanan dinas luar pegawai.
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
      <div class="col-md-2 col-sm-6 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Total</div>
            <h3 class="fw-bold mb-0">{{ summary.total }}</h3>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-sm-6 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Ada Lokasi</div>
            <h3 class="fw-bold mb-0">{{ summary.ada_lokasi }}</h3>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-sm-6 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Perjalanan</div>
            <h3 class="fw-bold mb-0">{{ summary.dalam_perjalanan }}</h3>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-sm-6 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Sampai</div>
            <h3 class="fw-bold mb-0">{{ summary.sampai_tujuan }}</h3>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-sm-6 mb-3">
        <div class="card shadow-sm border-0 summary-card">
          <div class="card-body">
            <div class="text-muted small">Selesai</div>
            <h3 class="fw-bold mb-0">{{ summary.selesai }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-3">
            <label class="form-label">Tanggal</label>
            <input
              type="date"
              :value="filter.tanggal"
              class="form-control"
              @change="$emit('update-tanggal', $event.target.value)"
            >
          </div>

          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select
              :value="filter.status"
              class="form-select"
              @change="$emit('update-status', $event.target.value)"
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
            <button
              class="btn btn-primary"
              @click="$emit('load-data')"
              :disabled="loading"
            >
              <i class="fas fa-search me-1"></i>
              Tampilkan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <h5 class="fw-bold mb-0">
          Data Lokasi Perjalanan
        </h5>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat data lokasi...</div>
        </div>

        <div v-else-if="agendaList.length === 0" class="text-center text-muted py-5">
          Belum ada data lokasi.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px;">No</th>
                <th>Petugas</th>
                <th>Tujuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Lokasi Terbaru</th>
                <th>Mulai</th>
                <th>Sampai</th>
                <th>Selesai</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(agenda, index) in agendaList"
                :key="agenda.id"
              >
                <td>{{ index + 1 }}</td>

                <td>{{ userName(agenda) }}</td>

                <td>
                  <div class="fw-semibold">
                    {{ agenda.tujuan }}
                  </div>
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

                <td>
                  <div class="fw-semibold small">
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
                    <i class="fas fa-map-marker-alt me-1"></i>
                    Maps
                  </a>
                </td>

                <td>
                  <div>{{ formatDateTime(agenda.waktu_mulai) }}</div>
                  <div class="text-muted small">
                    {{ lokasiText(agenda.mulai_latitude, agenda.mulai_longitude) }}
                  </div>

                  <a
                    v-if="hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)"
                    :href="mapsUrl(agenda.mulai_latitude, agenda.mulai_longitude)"
                    target="_blank"
                    class="small"
                  >
                    Maps Mulai
                  </a>
                </td>

                <td>
                  <div>{{ formatDateTime(agenda.waktu_sampai) }}</div>
                  <div class="text-muted small">
                    {{ lokasiText(agenda.sampai_latitude, agenda.sampai_longitude) }}
                  </div>

                  <a
                    v-if="hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)"
                    :href="mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude)"
                    target="_blank"
                    class="small"
                  >
                    Maps Sampai
                  </a>
                </td>

                <td>
                  <div>{{ formatDateTime(agenda.waktu_selesai) }}</div>
                  <div class="text-muted small">
                    {{ lokasiText(agenda.selesai_latitude, agenda.selesai_longitude) }}
                  </div>

                  <a
                    v-if="hasLokasi(agenda.selesai_latitude, agenda.selesai_longitude)"
                    :href="mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude)"
                    target="_blank"
                    class="small"
                  >
                    Maps Selesai
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="alert alert-info mt-3 small">
      <strong>Catatan:</strong> Monitoring lokasi menampilkan titik terakhir berdasarkan status perjalanan.
      Sistem tidak melakukan pelacakan realtime terus-menerus, tetapi membaca titik lokasi saat tombol Mulai, Sampai, atau Selesai diproses.
    </div>
  </div>
</template>

<script setup>
defineProps({
  filter: {
    type: Object,
    required: true
  },
  loading: Boolean,
  agendaList: {
    type: Array,
    default: () => []
  },
  summary: {
    type: Object,
    default: () => ({})
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
  },
  hasLokasi: {
    type: Function,
    required: true
  },
  lokasiText: {
    type: Function,
    required: true
  },
  mapsUrl: {
    type: Function,
    required: true
  }
})

defineEmits([
  'update-tanggal',
  'update-status',
  'load-data'
])
</script>

<style scoped>
.summary-card {
  border-radius: 12px;
}
</style>

<style scoped src="./agenda-unified.css"></style>
