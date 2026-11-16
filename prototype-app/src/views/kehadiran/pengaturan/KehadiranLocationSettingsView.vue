<template>
  <div class="location-settings-page">
    <div class="page-head">
      <div>
        <h3>Lokasi Kantor &amp; Cabang</h3>
        <p>Atur lokasi kantor/cabang, radius presensi, dan batas akurasi GPS.</p>
      </div>
      <span
        class="status-badge"
        :class="form.enabled ? 'status-active' : 'status-inactive'"
      >
        {{ form.enabled ? 'Radius Aktif' : 'Radius Nonaktif' }}
      </span>
    </div>

    <div v-if="loading" class="card-panel loading-panel">
      Memuat pengaturan lokasi...
    </div>

    <template v-else>
      <div class="card-panel">
        <div class="section-head">
          <div>
            <h6>Validasi Radius</h6>
            <p>Presensi dapat dibatasi berdasarkan jarak dari titik lokasi kerja.</p>
          </div>
          <div class="form-check form-switch m-0">
            <input
              id="locationEnabled"
              v-model="form.enabled"
              class="form-check-input"
              type="checkbox"
            >
            <label class="form-check-label fw-semibold" for="locationEnabled">
              Aktifkan
            </label>
          </div>
        </div>

        <div class="notice" :class="form.enabled ? 'notice-warning' : 'notice-muted'">
          <i class="fas fa-info-circle me-2"></i>
          <span v-if="form.enabled">
            Ketika aktif, server akan menolak presensi apabila GPS berada di luar radius atau
            akurasinya melebihi batas yang ditentukan.
          </span>
          <span v-else>
            Radius belum diberlakukan. Presensi tetap berjalan seperti biasa.
          </span>
        </div>
      </div>

      <div class="card-panel">
        <div class="section-head mb-3">
          <div>
            <h6>Lokasi Referensi</h6>
            <p>Titik ini menjadi pusat perhitungan radius presensi.</p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            :disabled="gettingLocation"
            @click="useCurrentLocation"
          >
            <i class="fas fa-location-crosshairs me-1"></i>
            {{ gettingLocation ? 'Mengambil Lokasi...' : 'Gunakan Lokasi Saya' }}
          </button>
        </div>

        <div class="grid-form">
          <div class="wide">
            <label class="form-label">Nama Lokasi</label>
            <input
              v-model.trim="form.location_name"
              type="text"
              class="form-control form-control-sm"
              maxlength="150"
              placeholder="Contoh: Kantor mPro"
            >
          </div>

          <div>
            <label class="form-label">Latitude</label>
            <input
              v-model.number="form.latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              class="form-control form-control-sm"
              placeholder="-6.xxxxxxxx"
            >
          </div>

          <div>
            <label class="form-label">Longitude</label>
            <input
              v-model.number="form.longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              class="form-control form-control-sm"
              placeholder="106.xxxxxxxx"
            >
          </div>
        </div>

        <div class="coordinate-status" :class="ready ? 'ready' : 'not-ready'">
          <i :class="ready ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          <span>
            {{ ready ? 'Koordinat lokasi sudah tersedia.' : 'Koordinat lokasi belum lengkap.' }}
          </span>
        </div>
      </div>

      <div class="card-panel">
        <div class="section-head mb-3">
          <div>
            <h6>Parameter Radius</h6>
            <p>Nilai radius menggunakan satuan meter.</p>
          </div>
        </div>

        <div class="grid-form">
          <div>
            <label class="form-label">Radius Presensi</label>
            <select v-model.number="form.radius_meter" class="form-select form-select-sm">
              <option v-for="value in radiusOptions" :key="value" :value="value">
                {{ value }} meter
              </option>
            </select>
            <small class="text-muted">Pilihan tersedia dari 50 sampai 5.000 meter.</small>
          </div>

          <div>
            <label class="form-label">Maksimum Akurasi GPS</label>
            <div class="input-group input-group-sm">
              <input
                v-model.number="form.max_accuracy_meter"
                type="number"
                min="10"
                max="500"
                class="form-control"
              >
              <span class="input-group-text">meter</span>
            </div>
            <small class="text-muted">Semakin kecil nilainya, semakin ketat kualitas GPS.</small>
          </div>
        </div>
      </div>

      <div class="card-panel summary-panel">
        <div class="summary-icon">
          <i class="fas fa-location-dot"></i>
        </div>
        <div class="summary-content">
          <strong>{{ form.location_name || 'Lokasi Kerja' }}</strong>
          <div>
            Radius <b>{{ form.radius_meter }} m</b>
            · Maks. akurasi <b>{{ form.max_accuracy_meter }} m</b>
          </div>
          <div v-if="ready">
            Koordinat: {{ Number(form.latitude).toFixed(7) }}, {{ Number(form.longitude).toFixed(7) }}
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="saving"
          @click="save"
        >
          <i class="fas fa-save me-1"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { demoPosition } from "../../../demo/browser.js"
import { computed, onMounted, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '../../../services/api'

const loading = ref(false)
const saving = ref(false)
const gettingLocation = ref(false)

const radiusOptions = Array.from({ length: 100 }, (_, index) => (index + 1) * 50)

const form = reactive({
  enabled: false,
  location_name: 'Lokasi Kerja',
  latitude: null,
  longitude: null,
  radius_meter: 100,
  max_accuracy_meter: 50
})

const ready = computed(() => {
  const latitude = form.latitude
  const longitude = form.longitude

  if (latitude === null || latitude === '' || latitude === undefined) return false
  if (longitude === null || longitude === '' || longitude === undefined) return false

  return Number.isFinite(Number(latitude))
    && Number.isFinite(Number(longitude))
    && Number(latitude) >= -90
    && Number(latitude) <= 90
    && Number(longitude) >= -180
    && Number(longitude) <= 180
})

const load = async () => {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/pengaturan/lokasi')
    const data = response.data?.data || {}

    Object.assign(form, {
      enabled: Boolean(data.enabled),
      location_name: data.location_name || 'Lokasi Kerja',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      radius_meter: Number(data.radius_meter || 100),
      max_accuracy_meter: Number(data.max_accuracy_meter || 50)
    })
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat pengaturan lokasi.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const useCurrentLocation = () => {
  if (!demoPosition) {
    Swal.fire('Tidak Didukung', 'Browser ini tidak menyediakan GPS.', 'warning')
    return
  }

  gettingLocation.value = true

  demoPosition(
    (position) => {
      form.latitude = Number(position.coords.latitude.toFixed(8))
      form.longitude = Number(position.coords.longitude.toFixed(8))
      gettingLocation.value = false

      Swal.fire({
        icon: 'success',
        title: 'Lokasi Diperoleh',
        text: `Akurasi GPS sekitar ${Math.round(position.coords.accuracy)} meter.`,
        timer: 1800,
        showConfirmButton: false
      })
    },
    (error) => {
      gettingLocation.value = false

      const messageMap = {
        1: 'Izin lokasi ditolak. Aktifkan izin lokasi pada browser/perangkat.',
        2: 'Lokasi tidak dapat diperoleh. Pastikan GPS aktif.',
        3: 'Pengambilan lokasi melebihi batas waktu. Silakan coba lagi.'
      }

      Swal.fire(
        'Gagal Mengambil Lokasi',
        messageMap[error.code] || 'Lokasi tidak dapat diperoleh.',
        'error'
      )
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  )
}

const save = async () => {
  if (!form.location_name) {
    await Swal.fire('Validasi', 'Nama lokasi wajib diisi.', 'warning')
    return
  }

  if (form.enabled && !ready.value) {
    await Swal.fire(
      'Validasi',
      'Latitude dan longitude wajib diisi ketika radius diaktifkan.',
      'warning'
    )
    return
  }

  const radius = Number(form.radius_meter)
  const accuracy = Number(form.max_accuracy_meter)

  if (!Number.isInteger(radius) || radius < 50 || radius > 5000 || radius % 50 !== 0) {
    await Swal.fire('Validasi', 'Radius harus kelipatan 50 meter dari 50 sampai 5.000 meter.', 'warning')
    return
  }

  if (!Number.isInteger(accuracy) || accuracy < 10 || accuracy > 500) {
    await Swal.fire('Validasi', 'Maksimum akurasi GPS harus antara 10 sampai 500 meter.', 'warning')
    return
  }

  saving.value = true

  try {
    const response = await api.put('/kehadiran/pengaturan/lokasi', {
      enabled: Boolean(form.enabled),
      location_name: form.location_name,
      latitude: ready.value ? Number(form.latitude) : null,
      longitude: ready.value ? Number(form.longitude) : null,
      radius_meter: radius,
      max_accuracy_meter: accuracy
    })

    const data = response.data?.data
    if (data) {
      Object.assign(form, {
        enabled: Boolean(data.enabled),
        location_name: data.location_name || 'Lokasi Kerja',
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        radius_meter: Number(data.radius_meter || radius),
        max_accuracy_meter: Number(data.max_accuracy_meter || accuracy)
      })
    }

    await Swal.fire('Berhasil', response.data?.message || 'Pengaturan lokasi berhasil disimpan.', 'success')
  } catch (error) {
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors)[0]?.[0] : null

    await Swal.fire(
      'Gagal',
      firstError || error.response?.data?.message || 'Gagal menyimpan pengaturan lokasi.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.location-settings-page {
  padding: 10px;
  background: #f4f7fb;
  min-height: 100vh;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.page-head h3 {
  margin: 0;
  font-weight: 900;
  color: #0f172a;
}

.page-head p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
}

.card-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 0.25rem 0.8rem rgba(15, 23, 42, 0.05);
}

.loading-panel {
  color: #64748b;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-head h6 {
  margin: 0;
  font-weight: 850;
  color: #0f172a;
}

.section-head p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
}

.notice {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.55;
}

.notice-warning {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
}

.notice-muted {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.grid-form .wide {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 5px;
}

.coordinate-status {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.coordinate-status.ready {
  background: #ecfdf5;
  color: #047857;
}

.coordinate-status.not-ready {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #e2e8f0;
  color: #475569;
}

.summary-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
}

.summary-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e0e7ff;
  color: #3730a3;
  flex: 0 0 40px;
}

.summary-content strong {
  display: block;
  color: #0f172a;
  margin-bottom: 2px;
}

.summary-content div {
  color: #64748b;
  font-size: 12px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .page-head,
  .section-head {
    flex-direction: column;
    align-items: stretch;
  }

  .grid-form {
    grid-template-columns: 1fr;
  }

  .grid-form .wide {
    grid-column: auto;
  }

  .action-bar {
    justify-content: stretch;
  }

  .action-bar .btn {
    width: 100%;
  }
}
</style>
