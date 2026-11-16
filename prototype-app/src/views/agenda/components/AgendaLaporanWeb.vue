<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Laporan Perjalanan</h2>
        <p class="text-muted mb-0">
          Rekap perjalanan dinas luar pegawai.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button
          class="btn btn-success"
          @click="$emit('export-excel')"
          :disabled="exportingExcel"
        >
          <span v-if="exportingExcel" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-file-excel me-1"></i>
          Export Excel
        </button>

        <button
          class="btn btn-danger"
          @click="$emit('export-pdf')"
          :disabled="exportingPdf"
        >
          <span v-if="exportingPdf" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fas fa-file-pdf me-1"></i>
          Export PDF
        </button>
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
              <option value="">Semua Status</option>
              <option value="antrian">Antrian</option>
              <option value="dalam_perjalanan">Sedang Dalam Perjalanan</option>
              <option value="sampai_tujuan">Sampai di Tujuan</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
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
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <div class="text-muted mt-2">Memuat laporan...</div>
        </div>

        <div v-else-if="agendaList.length === 0" class="text-center text-muted py-5">
          Tidak ada data laporan.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Pegawai</th>
                <th>Tujuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Lokasi Terbaru</th>
                <th>Mulai</th>
                <th>Sampai Tujuan</th>
                <th>Selesai</th>
                <th>Bukti Foto</th>
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

                <td>
                  <div class="small">
                    <strong>{{ lokasiTerbaru(agenda).label }}</strong>
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
                    Lihat lokasi mulai
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
                    Lihat lokasi sampai
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
                    Lihat lokasi selesai
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
  exportingExcel: Boolean,
  exportingPdf: Boolean,
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
  'load-data',
  'export-excel',
  'export-pdf',
  'lihat-foto'
])
</script>

<style scoped src="./agenda-unified.css"></style>
