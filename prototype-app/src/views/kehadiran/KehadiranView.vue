<template>

    <KehadiranPwa

    v-if="isPwa"

    :loading="loading" :saving="saving" :printing="printing" :today="today" :rekap="rekap" :bulan="bulan" :today-date="todayDate" :geofence="geofence" :selected-month-label="selectedMonthLabel" :month-options="monthOptions" :format-long-date="formatLongDate" :format-time="formatTime" :location-label="locationLabel" :load-data="loadData" :rekam="rekam" :print-pdf="printPdf" @update-bulan="bulan=$event;loadData()"

  />

  <template v-else-if="isWeb">

<div class="kehadiran-page">

    <div class="page-head">

      <div>

        <h3>Kehadiran</h3>

        <p>Rekam masuk, pulang, dan lihat rekap bulan berjalan.</p>

      </div>

      <button class="btn btn-sm btn-outline-primary" :disabled="loading" @click="loadData">

        <i class="fas fa-sync-alt me-1"></i>

        Refresh

      </button>

    </div>

    <div class="record-card">

      <div class="record-head">

        <div class="today-title">

          <strong>Presensi Hari Ini</strong>

          <p>{{ formatLongDate(today?.tanggal || todayDate) }}</p>

        </div>

        <div v-if="today?.jadwal" class="schedule-summary">

          <span class="schedule-title">

            <i class="fas fa-clock me-1"></i>

            {{ today.jadwal.is_event ? today.jadwal.event_name : 'Jam Kerja Normal' }}

          </span>

          <span><b>Masuk</b> {{ today.jadwal.jam_masuk }}</span>

          <span><b>Pulang</b> {{ today.jadwal.jam_pulang }}</span>

          <span><b>Lembur</b> {{ today.jadwal.lembur_mulai }}</span>

        </div>

        <div v-if="geofence.enabled" class="geofence-summary">

          <span>

            <i class="fas fa-location-dot me-1"></i>

            {{ geofence.location_name }}

          </span>

          <span>

            Radius <b>{{ geofence.radius_meter }} m</b>

          </span>

        </div>

      </div>

      <div class="attendance-grid">

        <div class="attendance-panel">

          <div class="attendance-content">

            <div class="attendance-data">

              <div class="attendance-label">

                <i class="fas fa-sign-in-alt"></i>

                <span>Jam Masuk</span>

              </div>

              <div class="attendance-time">{{ formatTime(today?.jam_masuk) }}</div>

              <div class="attendance-location" v-html="locationLabel(today, 'masuk')"></div>

            </div>

            <button

              class="attendance-action action-in"

              :disabled="saving || !!today?.jam_masuk"

              @click="rekam('masuk')"

            >

              <i class="fas fa-sign-in-alt"></i>

              <span>Masuk</span>

              <small>{{ today?.jam_masuk ? 'Sudah tercatat' : 'Catat kehadiran' }}</small>

            </button>

          </div>

        </div>

        <div class="attendance-panel">

          <div class="attendance-content">

            <div class="attendance-data">

              <div class="attendance-label">

                <i class="fas fa-sign-out-alt"></i>

                <span>Jam Keluar</span>

              </div>

              <div class="attendance-time">{{ formatTime(today?.jam_pulang) }}</div>

              <div class="attendance-location" v-html="locationLabel(today, 'pulang')"></div>

            </div>

            <button

              class="attendance-action action-out"

              :disabled="saving || !today?.jam_masuk"

              @click="rekam('pulang')"

            >

              <i class="fas fa-sign-out-alt"></i>

              <span>{{ today?.jam_pulang ? 'Perbarui' : 'Keluar' }}</span>

              <small>{{ today?.jam_pulang ? 'Klik untuk memperbarui jam aktual' : (today?.jam_masuk ? 'Catat kepulangan' : 'Belum bisa digunakan') }}</small>

            </button>

          </div>

        </div>

      </div>

    </div>

    <div class="filter-card">

      <div class="filter-field">

        <label>Bulan Histori</label>

        <select v-model="bulan" class="form-select form-select-sm" @change="loadData">

          <option v-for="option in monthOptions" :key="option.value" :value="option.value">

            {{ option.label }}

          </option>

        </select>

      </div>

      <button class="btn btn-sm btn-outline-danger pdf-btn" :disabled="printing" @click="printPdf">

        <i class="fas fa-file-pdf me-1"></i>

        PDF

      </button>

    </div>

    <div class="table-card">

      <div class="table-head">

        <div>

          <h6>Rekap Kehadiran Saya</h6>

          <p>{{ selectedMonthLabel }}</p>

        </div>

      </div>

      <div class="table-responsive">

        <table class="table table-sm table-bordered align-middle">

          <thead>

            <tr>

              <th>Tanggal</th>

              <th>Masuk</th>

              <th>Lokasi Masuk</th>

              <th>Keluar</th>

              <th>Lokasi Keluar</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            <tr v-for="item in rekap" :key="item.id">

              <td>{{ formatLongDate(item.tanggal) }}</td>

              <td>{{ formatTime(item.jam_masuk) }}</td>

              <td v-html="locationLabel(item, 'masuk')"></td>

              <td>{{ formatTime(item.jam_pulang) }}</td>

              <td v-html="locationLabel(item, 'pulang')"></td>

              <td>

                <span class="status-badge">{{ item.status || '-' }}</span>

              </td>

            </tr>

            <tr v-if="rekap.length === 0">

              <td colspan="6" class="text-center text-muted">Data belum tersedia.</td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>

  </template>

</template>

<script setup>
import { demoPosition, demoReverseGeocode } from "../../demo/browser.js"

import { computed, onMounted, ref } from 'vue'

import Swal from 'sweetalert2'

import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'

import KehadiranPwa from './components/KehadiranPwa.vue'

const { isPwa, isWeb } = usePwaMode()

const loading = ref(false)

const saving = ref(false)

const printing = ref(false)

const today = ref(null)

const rekap = ref([])

const bulan = ref(getCurrentMonthValue())

const locationCache = ref({})

const geofence = ref({

  enabled: false,

  ready: false,

  location_name: 'Lokasi Kerja',

  latitude: null,

  longitude: null,

  radius_meter: 100,

  max_accuracy_meter: 50,

})

// Memuat konfigurasi geofence dari API backend.
const loadGeofence = async () => {
  // Default fail-closed: absensi tidak boleh melewati validasi saat config belum terbaca.
  geofence.value = { ...geofence.value, enabled: true, ready: false }

  const response = await api.get('/kehadiran/geofence')
  const config = response.data?.data
  if (!response.data?.success || !config) {
    throw new Error('Konfigurasi lokasi absensi tidak valid.')
  }

  const latitude = Number(config.latitude)
  const longitude = Number(config.longitude)
  const radius = Number(config.radius_meter)
  const maxAccuracy = Number(config.max_accuracy_meter)
  const coordinatesValid =
    config.latitude !== null && config.latitude !== '' &&
    config.longitude !== null && config.longitude !== '' &&
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
  const radiusValid = Number.isFinite(radius) && radius > 0
  const accuracyValid = Number.isFinite(maxAccuracy) && maxAccuracy > 0

  geofence.value = {
    enabled: Boolean(config.enabled),
    ready: coordinatesValid && radiusValid && accuracyValid,
    location_name: config.location_name || 'Lokasi Kerja',
    latitude: coordinatesValid ? latitude : null,
    longitude: coordinatesValid ? longitude : null,
    radius_meter: radiusValid ? radius : 100,
    max_accuracy_meter: accuracyValid ? maxAccuracy : 50,
  }

  if (geofence.value.enabled && !geofence.value.ready) {
    throw new Error('Validasi radius aktif, tetapi koordinat atau pengaturan lokasi belum lengkap.')
  }
}

const todayDate = computed(() => new Date().toISOString())

const selectedMonthLabel = computed(() => {

  return monthOptions.value.find((item) => item.value === bulan.value)?.label || bulan.value

})

const monthOptions = computed(() => {

  const options = []

  const now = new Date()

  const currentYear = now.getFullYear()

  for (let year = currentYear - 2; year <= currentYear + 1; year++) {

    for (let month = 0; month < 12; month++) {

      const value = `${year}-${String(month + 1).padStart(2, '0')}`

      const label = new Intl.DateTimeFormat('id-ID', {

        month: 'long',

        year: 'numeric',

        timeZone: 'Asia/Jakarta'

      }).format(new Date(year, month, 1))

      options.push({

        value,

        label: capitalizeWords(label)

      })

    }

  }

  return options.reverse()

})

function getCurrentMonthValue() {

  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

}

function capitalizeWords(value) {

  if (!value) return ''

  return value.replace(/\b\w/g, (char) => char.toUpperCase())

}

function normalizeDate(value) {

  if (!value) return null

  if (value instanceof Date) return value

  const text = String(value)

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {

    return new Date(`${text}T00:00:00+07:00`)

  }

  return new Date(text)

}

function formatLongDate(value) {

  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('id-ID', {

    day: '2-digit',

    month: 'long',

    year: 'numeric',

    timeZone: 'Asia/Jakarta'

  }).format(date)

}

function formatTime(value) {

  if (!value) return '-'

  const raw = String(value)

  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw

  if (/^\d{2}:\d{2}$/.test(raw)) return `${raw}:00`

  const date = new Date(value)

  if (!Number.isNaN(date.getTime())) {

    return new Intl.DateTimeFormat('id-ID', {

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      hour12: false,

      timeZone: 'Asia/Jakarta'

    }).format(date).replace('.', ':')

  }

  return raw

}

function isRawCoordinate(value) {
  return /^\s*Lat\s*-?\d+(\.\d+)?\s*,\s*Long\s*-?\d+(\.\d+)?\s*$/i.test(
    String(value || '')
  )
}

function coordinateKey(latitude, longitude) {

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) return null

  if (latitude === '' || longitude === '') return null

  return `${Number(latitude).toFixed(5)},${Number(longitude).toFixed(5)}`

}

function esc(value) {

  return String(value ?? '-')

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;')

}

function locationParts(address = {}) {

  const place =

    address.amenity ||

    address.building ||

    address.office ||

    address.shop ||

    address.tourism ||

    address.industrial ||

    address.house_name ||

    ''

  const area =

    address.suburb ||

    address.neighbourhood ||

    address.village ||

    address.hamlet ||

    address.town ||

    ''

  const district =

    address.city_district ||

    address.municipality ||

    address.district ||

    address.county ||

    ''

  const city =

    address.city ||

    address.town ||

    address.municipality ||

    address.county ||

    address.state_district ||

    ''

  return {

    place: place || address.display_name || '',

    area,

    district,

    city,

    road: address.road || address.pedestrian || '',

    houseNumber: address.house_number || ''

  }

}

function renderLocation(details = {}) {

  const place = details.tempat || details.place || details.nama_tempat || ''

  const road = details.jalan || details.road || ''

  const area = details.daerah || details.area || details.kelurahan || ''

  const district = details.kecamatan || details.district || ''

  const city = details.kota || details.city || ''

  const lines = [

    place ? `<strong>${esc(place)}</strong>` : '',

    road ? esc(road) : '',

    area ? `Daerah: ${esc(area)}` : '',

    district ? `Kecamatan: ${esc(district)}` : '',

    city ? `Kota: ${esc(city)}` : ''

  ].filter(Boolean)

  return lines.length ? lines.join('<br>') : ''

}

function locationLabel(item, type) {

  if (!item) return '-'

  const storedLocation = item[`lokasi\_${type}`]

  const latitude = item[`latitude\_${type}`]

  const longitude = item[`longitude\_${type}`]

  const key = coordinateKey(latitude, longitude)

  const detail =

    item[`lokasi\_${type}\_detail`] ||

    item[`location\_${type}`] ||

    item[`alamat\_${type}`]

  if (detail) {

    const html = renderLocation(detail)

    if (html) return html

  }

  if (key && locationCache.value[key]) {

    return locationCache.value[key]

  }

  if (storedLocation && !isRawCoordinate(storedLocation)) {

    return esc(storedLocation)

  }

  if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {

    return 'Lokasi sedang dibaca'

  }

  return '-'

}

function buildLocationName(address = {}) {

  const p = locationParts(address)

  const road = p.road ? p.road + (p.houseNumber ? ` No. ${p.houseNumber}` : '') : ''

  const parts = [p.place, road, p.area, p.district, p.city]

    .filter(Boolean)

    .filter((item, index, array) => array.indexOf(item) === index)

  return parts.slice(0, 5).join(' | ')

}

async function reverseGeocode(latitude, longitude) {

  const key = coordinateKey(latitude, longitude)

  if (!key) return null

  if (locationCache.value[key]) {

    return locationCache.value[key]

  }

  try {

    const url = new URL('https\://nominatim.openstreetmap.org/reverse')

    url.searchParams.set('format', 'jsonv2')

    url.searchParams.set('lat', latitude)

    url.searchParams.set('lon', longitude)

    url.searchParams.set('zoom', '16')

    url.searchParams.set('addressdetails', '1')

    url.searchParams.set('accept-language', 'id')

    const response = await demoReverseGeocode()

    if (!response.ok) {

      throw new Error('Reverse geocode gagal')

    }

    const data = await response.json()

    const locationName = buildLocationName(data.address || {}) || data.display_name || null

    if (locationName) {

      locationCache.value[key] = locationName

      return locationName

    }

  } catch (error) {

    console.warn('Gagal membaca nama lokasi:', error)

  }

  locationCache.value[key] = 'Lokasi tidak terbaca'

  return locationCache.value[key]

}

async function hydrateLocationNames() {

  const records = [today.value, ...rekap.value].filter(Boolean)

  for (const item of records) {

    for (const type of ['masuk', 'pulang']) {

      const storedLocation = item[`lokasi\_${type}`]

      const latitude = item[`latitude\_${type}`]

      const longitude = item[`longitude\_${type}`]

      if (latitude && longitude && (!storedLocation || isRawCoordinate(storedLocation))) {

        const locationName = await reverseGeocode(latitude, longitude)

        if (locationName) {

          item[`lokasi\_${type}`] = locationName

        }

      }

    }

  }

}

const loadData = async () => {
  loading.value = true
  try {
    await loadGeofence()
    const res = await api.get('/kehadiran/today', {
      params: { bulan: bulan.value }
    })
    today.value = res.data?.data?.today || null
    rekap.value = res.data?.data?.rekap_bulan_berjalan || []
    await hydrateLocationNames()
  } catch (error) {
    geofence.value = { ...geofence.value, enabled: true, ready: false }
    console.error('Gagal memuat data kehadiran/geofence:', error)
    Swal.fire(
      'Gagal',
      error.response?.data?.message || error.message ||
        'Gagal memuat data kehadiran atau konfigurasi lokasi. Absensi belum dapat dilakukan.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const getLocation = () => new Promise((resolve) => {

  if (!demoPosition) {

    resolve({})

    return

  }

  demoPosition(

    async (position) => {

      const latitude = position.coords.latitude

      const longitude = position.coords.longitude

      const akurasi = position.coords.accuracy

      const lokasi = await reverseGeocode(latitude, longitude)

      let lokasiDetail = null

      try {

        const url = new URL('https\://nominatim.openstreetmap.org/reverse')

        url.searchParams.set('format', 'jsonv2')

        url.searchParams.set('lat', latitude)

        url.searchParams.set('lon', longitude)

        url.searchParams.set('zoom', '18')

        url.searchParams.set('addressdetails', '1')

        url.searchParams.set('accept-language', 'id')

        const response = await demoReverseGeocode()

        if (response.ok) {

          const data = await response.json()

          const address = data.address || {}

          lokasiDetail = {

            tempat: address.amenity ||

              address.building ||

              address.office ||

              address.shop ||

              address.tourism ||

              address.industrial ||

              address.house_name ||

              '',

            jalan: address.road || address.pedestrian || '',

            nomor: address.house_number || '',

            daerah: address.suburb ||

              address.neighbourhood ||

              address.village ||

              address.hamlet ||

              '',

            kecamatan: address.city_district ||

              address.municipality ||

              address.district ||

              address.county ||

              '',

            kota: address.city ||

              address.town ||

              address.municipality ||

              address.county ||

              address.state_district ||

              '',

            display_name: data.display_name || lokasi || ''

          }

        }

      } catch (error) {

        console.warn('Detail lokasi tidak dapat dibaca:', error)

      }

      resolve({

        latitude,

        longitude,

        akurasi,

        lokasi: lokasi || 'Lokasi tidak terbaca',

        lokasi_detail: lokasiDetail

      })

    },

    () => resolve({}),

    {

      enableHighAccuracy: true,

      timeout: 12000,

      maximumAge: 0

    }

  )

})

const calculateDistanceMeters = (latitude, longitude, targetLatitude, targetLongitude) => {

  const earthRadius = 6371000

  const lat1 = Number(latitude) * Math.PI / 180

  const lat2 = Number(targetLatitude) * Math.PI / 180

  const deltaLat = (Number(targetLatitude) - Number(latitude)) * Math.PI / 180

  const deltaLon = (Number(targetLongitude) - Number(longitude)) * Math.PI / 180

  const a =

    Math.sin(deltaLat / 2) ** 2 +

    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2

  return 2 * earthRadius * Math.atan2(

    Math.sqrt(a),

    Math.sqrt(1 - a),

  )

}

const validateClientGeofence = (location) => {

  if (!geofence.value.enabled) return

  if (!geofence.value.ready) {

    throw new Error(

      'Validasi radius aktif, tetapi lokasi kerja belum dikonfigurasi.'

    )

  }

  if (

    location?.latitude === undefined ||

    location?.longitude === undefined ||

    location?.akurasi === undefined

  ) {

    throw new Error(

      'Lokasi GPS wajib diperoleh sebelum melakukan absensi.'

    )

  }

  if (

    Number(location.akurasi) >

    Number(geofence.value.max_accuracy_meter)

  ) {

    throw new Error(

      `Akurasi GPS ${Math.round(Number(location.akurasi))} meter melebihi batas ` +

      `${geofence.value.max_accuracy_meter} meter. Aktifkan lokasi presisi tinggi lalu coba kembali.`

    )

  }

  const distance = calculateDistanceMeters(

    location.latitude,

    location.longitude,

    geofence.value.latitude,

    geofence.value.longitude,

  )

  if (distance > Number(geofence.value.radius_meter)) {

    throw new Error(

      `Anda berada sekitar ${Math.round(distance)} meter dari ` +

      `${geofence.value.location_name}. Radius yang diizinkan ` +

      `${geofence.value.radius_meter} meter.`

    )

  }

}

const rekam = async (type) => {

  if (saving.value) return

  saving.value = true

  try {

    const loc = await getLocation()

    // Validasi radius dan akurasi GPS sebelum mengirim absensi.

    validateClientGeofence(loc)

    const res = await api.post(`/kehadiran/${type}`, loc)

    // Muat ulang data terlebih dahulu agar tampilan mengikuti kondisi server.

    await loadData()

    await Swal.fire(

      'Berhasil',

      res.data?.message || `Absensi ${type === 'masuk' ? 'masuk' : 'pulang'} berhasil direkam.`,

      'success'

    )

  } catch (error) {

    // Beberapa server/proxy dapat mengirim respons error setelah transaksi tersimpan.

    // Verifikasi melalui endpoint status sebelum menyatakan absensi gagal atau mencoba ulang.

    let confirmedSaved = false

    try {

      const snapshot = await api.get('/kehadiran/today', { params: { bulan: bulan.value } })

      const data = snapshot.data?.data || {}

      const refreshedToday = data.today || null

      const refreshedRekap = data.rekap_bulan_berjalan || []

      const recordedAt = type === 'masuk'

        ? refreshedToday?.jam_masuk

        : refreshedToday?.jam_pulang

      today.value = refreshedToday

      rekap.value = refreshedRekap

      confirmedSaved = Boolean(recordedAt)

    } catch (verifyError) {

      console.warn('Tidak dapat memverifikasi status absensi setelah respons error:', verifyError)

    }

    if (confirmedSaved) {

      await Swal.fire({

        icon: 'success',

        title: 'Absensi tersimpan',

        text: `Data absensi ${type === 'masuk' ? 'masuk' : 'pulang'} sudah tercatat di server. Tampilan telah disinkronkan.`,

      })

    } else {

      const status = error.response?.status

      const message = error.response?.data?.message

        || (status >= 500

          ? 'Server mengembalikan error dan status penyimpanan belum dapat dikonfirmasi. Jangan langsung mengulang; refresh data dan periksa status absensi terlebih dahulu.'

          : 'Gagal merekam kehadiran. Periksa koneksi, lakukan absensi di area kantor, lalu coba kembali.')

      await Swal.fire('Gagal', message, 'error')

    }

  } finally {

    saving.value = false

  }

}

const printPdf = async () => {

  printing.value = true

  try {

    const response = await api.get('/kehadiran/self/export-pdf', {

      params: {

        bulan: bulan.value

      },

      responseType: 'blob'

    })

    const blob = new Blob([response.data], {

      type: 'application/pdf'

    })

    const url = window.URL.createObjectURL(blob)

    window.open(url, '\_blank')

    setTimeout(() => {

      window.URL.revokeObjectURL(url)

    }, 30000)

  } catch (error) {

    Swal.fire('Gagal', 'Gagal mencetak PDF kehadiran.', 'error')

  } finally {

    printing.value = false

  }

}

onMounted(loadData)

</script>

<style scoped>

.kehadiran-page {

  padding: 10px;

  background: #f4f7fb;

  min-height: 100vh;

}

.page-head {

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 12px;

  margin-bottom: 10px;

}

.page-head h3 {

  margin: 0;

  font-weight: 950;

  color: #0f172a;

}

.page-head p {

  margin: 2px 0 0;

  color: #64748b;

  font-size: 12px;

}

.record-card,

.table-card,

.filter-card {

  background: #fff;

  border: 1px solid #e5e7eb;

  border-radius: 16px;

  padding: 12px;

  margin-bottom: 10px;

  box-shadow: 0 0.25rem 0.8rem rgba(15, 23, 42, 0.05);

}

.record-card {

  padding: 14px;

}

.record-head {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 14px;

  margin-bottom: 12px;

  padding: 2px 2px 0;

}

.today-title strong {

  color: #111827;

  font-size: 15px;

  font-weight: 950;

}

.today-title p {

  margin: 3px 0 0;

  color: #475569;

  font-size: 13px;

  font-weight: 750;

}

.geofence-summary {

  display: flex;

  flex-wrap: wrap;

  justify-content: flex-end;

  align-items: center;

  gap: 6px;

  margin-top: 6px;

}

.geofence-summary span {

  padding: 5px 9px;

  color: #075985;

  background: #e0f2fe;

  border: 1px solid #bae6fd;

  border-radius: 999px;

  font-size: 10px;

  font-weight: 800;

  white-space: nowrap;

}

.geofence-summary b {

  font-weight: 950;

}

.schedule-summary {

  display: flex;

  flex-wrap: wrap;

  justify-content: flex-end;

  align-items: center;

  gap: 6px;

  color: #3730a3;

  font-size: 11px;

  font-weight: 800;

}

.schedule-summary span {

  background: #eef2ff;

  border: 1px solid #e0e7ff;

  border-radius: 999px;

  padding: 5px 9px;

  white-space: nowrap;

}

.schedule-summary .schedule-title {

  background: #e0e7ff;

  color: #312e81;

}

.attendance-grid {

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

}

.attendance-panel {

  min-width: 0;

  background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);

  border: 1px solid #dbe3ef;

  border-radius: 13px;

  padding: 10px;

}

.attendance-content {

  display: grid;

  grid-template-columns: minmax(0, 1fr) 112px;

  align-items: stretch;

  gap: 10px;

  min-height: 142px;

}

.attendance-data {

  display: flex;

  flex-direction: column;

  justify-content: center;

  min-width: 0;

  padding: 3px 2px 3px 5px;

}

.attendance-label {

  display: flex;

  align-items: center;

  gap: 7px;

  color: #334155;

  font-size: 12px;

  font-weight: 900;

}

.attendance-label i {

  width: 25px;

  height: 25px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  background: #eaf2ff;

  color: #2563eb;

}

.attendance-time {

  margin: 5px 0 7px;

  color: #0f172a;

  font-size: 23px;

  line-height: 1;

  font-weight: 950;

  letter-spacing: .2px;

}

.attendance-location {

  color: #475569;

  font-size: 11px;

  line-height: 1.5;

  word-break: break-word;

}

.attendance-location :deep(strong) {

  color: #1e293b;

  font-weight: 900;

}

.attendance-action {

  width: 100%;

  min-height: 122px;

  border: 1px solid;

  border-radius: 11px;

  background: #fff;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 5px;

  transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;

}

.attendance-action:not(:disabled):hover {

  transform: translateY(-1px);

  box-shadow: 0 7px 18px rgba(15, 23, 42, .10);

}

.attendance-action i {

  font-size: 25px;

}

.attendance-action span {

  font-size: 16px;

  font-weight: 950;

}

.attendance-action small {

  font-size: 9px;

  font-weight: 700;

  opacity: .72;

  text-align: center;

}

.action-in {

  border-color: #2563eb;

  color: #2563eb;

}

.action-out {

  border-color: #059669;

  color: #047857;

}

.attendance-action:disabled {

  cursor: not-allowed;

  opacity: .52;

  background: #f8fafc;

}

.filter-card {

  display: grid;

  grid-template-columns: minmax(220px, 1fr) auto;

  align-items: end;

  gap: 8px;

}

.filter-field label {

  display: block;

  font-size: 12px;

  font-weight: 900;

  color: #475569;

  margin-bottom: 4px;

}

.pdf-btn {

  min-width: 74px;

  border-radius: 9px;

  font-weight: 900;

}

.table-head {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

  margin-bottom: 8px;

}

.table-head h6 {

  margin: 0;

  color: #111827;

  font-weight: 950;

}

.table-head p {

  margin: 2px 0 0;

  color: #64748b;

  font-size: 12px;

  font-weight: 800;

}

.table th {

  color: #111827;

  font-size: 12px;

  white-space: nowrap;

}

.table td {

  font-size: 12px;

  vertical-align: middle;

}

.status-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  border-radius: 999px;

  background: #dcfce7;

  color: #15803d;

  padding: 4px 9px;

  font-size: 11px;

  font-weight: 900;

}

@media (max-width: 900px) {

  .record-head {

    align-items: flex-start;

    flex-direction: column;

  }

  .schedule-summary {

    justify-content: flex-start;

  }

}

@media (max-width: 700px) {

  .page-head,

  .record-head {

    flex-direction: column;

    align-items: stretch;

  }

  .page-head .btn {

    align-self: flex-start;

  }

  .schedule-summary {

    justify-content: flex-start;

  }

  .attendance-grid {

    grid-template-columns: 1fr;

  }

  .attendance-content {

    grid-template-columns: minmax(0, 1fr) 105px;

  }

  .filter-card {

    grid-template-columns: 1fr;

  }

  .pdf-btn {

    width: 100%;

  }

}

@media (max-width: 430px) {

  .kehadiran-page {

    padding: 7px;

  }

  .attendance-content {

    grid-template-columns: 1fr;

  }

  .attendance-action {

    min-height: 70px;

    flex-direction: row;

  }

  .attendance-action small {

    display: none;

  }

}

/* Responsive refinements for desktop, tablet and mobile web. */

.kehadiran-page {

  width: 100%;

  max-width: 1600px;

  margin-inline: auto;

  box-sizing: border-box;

}

.record-card, .table-card, .filter-card {

  box-shadow: 0 8px 24px rgba(21, 43, 83, .055);

}

.attendance-panel {

  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;

}

.attendance-panel:focus-within {

  border-color: #93b4f7;

  box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);

}

.attendance-action {

  min-height: 124px;

  padding: 12px 8px;

}

.attendance-action:focus-visible, .icon-btn:focus-visible, .pdf-btn:focus-visible {

  outline: 3px solid rgba(37, 99, 235, .4);

  outline-offset: 2px;

}

.table-responsive {

  border-radius: 10px;

}

@media (min-width: 1200px) {

  .kehadiran-page { padding: 18px; }

  .record-card { padding: 20px; }

  .attendance-grid { gap: 16px; }

}

@media (max-width: 700px) {

  .page-head h3 { font-size: 1.5rem; }

  .page-head p { font-size: 13px; line-height: 1.5; }

  .record-card, .table-card, .filter-card { border-radius: 14px; padding: 12px; }

  .attendance-time { font-size: 27px; }

  .filter-field label { font-size: 13px; }

  .table th, .table td { font-size: 12px; }

}

@media (prefers-reduced-motion: reduce) {

  .attendance-panel, .attendance-action { transition: none !important; }

}

</style>