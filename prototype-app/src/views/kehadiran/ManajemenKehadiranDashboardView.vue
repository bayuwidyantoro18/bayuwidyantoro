<template>
    <ManajemenKehadiranDashboardPwa
    v-if="isPwa"
    :loading="loading" :summary="summary" :format-date="formatDate" :format-time="formatTime" :location-label="locationLabel" :load-data="loadData"
  />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <h3>Dashboard Kehadiran</h3>
        <p>Ringkasan dan detail kehadiran pegawai hari ini.</p>
      </div>

      <button
        class="btn btn-sm btn-outline-primary"
        :disabled="loading"
        @click="loadData"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="note-card">
      <i class="fas fa-info-circle"></i>
      {{ summary.note || 'Pegawai Penugasan tidak wajib absen.' }}
    </div>

    <div class="summary-grid">
      <button
        type="button"
        class="summary-card primary"
        :class="{ active: activeTable === 'hadir' }"
        @click="activeTable = 'hadir'"
      >
        <span>Hadir Hari Ini</span>
        <strong>{{ summary.hadir_hari_ini }}</strong>
        <small>Lihat tabel hadir</small>
        <i class="fas fa-user-check"></i>
      </button>

      <button
        type="button"
        class="summary-card warning"
        :class="{ active: activeTable === 'cuti' }"
        @click="activeTable = 'cuti'"
      >
        <span>Cuti Hari Ini</span>
        <strong>{{ summary.cuti_hari_ini }}</strong>
        <small>Lihat tabel cuti</small>
        <i class="fas fa-calendar-check"></i>
      </button>

      <button
        type="button"
        class="summary-card info"
        :class="{ active: activeTable === 'izin' }"
        @click="activeTable = 'izin'"
      >
        <span>Izin Hari Ini</span>
        <strong>{{ summary.izin_hari_ini }}</strong>
        <small>Lihat tabel izin</small>
        <i class="fas fa-user-clock"></i>
      </button>

      <button
        type="button"
        class="summary-card danger"
        :class="{ active: activeTable === 'belum_absen' }"
        @click="activeTable = 'belum_absen'"
      >
        <span>Belum Absen</span>
        <strong>{{ summary.belum_absen_hari_ini }}</strong>
        <small>Lihat tabel belum absen</small>
        <i class="fas fa-user-times"></i>
      </button>
    </div>

    <div class="table-tab-card">
      <div class="table-tab-head">
        <div>
          <h5>Detail Data Dashboard</h5>
          <p>Tanggal: {{ formatDate(summary.tanggal) }}</p>
        </div>

        <div class="table-tabs">
          <button
            type="button"
            :class="{ active: activeTable === 'hadir' }"
            @click="activeTable = 'hadir'"
          >
            Hadir
          </button>
          <button
            type="button"
            :class="{ active: activeTable === 'cuti' }"
            @click="activeTable = 'cuti'"
          >
            Cuti
          </button>
          <button
            type="button"
            :class="{ active: activeTable === 'izin' }"
            @click="activeTable = 'izin'"
          >
            Izin
          </button>
          <button
            type="button"
            :class="{ active: activeTable === 'belum_absen' }"
            @click="activeTable = 'belum_absen'"
          >
            Belum Absen
          </button>
        </div>
      </div>

      <div v-if="activeTable === 'hadir'" class="table-section">
        <div class="section-title primary-text">
          <strong>Data Pegawai Hadir Hari Ini</strong>
          <span>{{ summary.hadir_hari_ini_data.length }} data</span>
        </div>

        <div class="table-responsive custom-table-wrap">
          <table class="table table-sm dashboard-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Lokasi Masuk</th>
                <th>Lokasi Pulang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="summary.hadir_hari_ini_data.length === 0">
                <td colspan="10" class="empty-cell">Belum ada pegawai yang tercatat hadir.</td>
              </tr>
              <tr
                v-for="(item, index) in summary.hadir_hari_ini_data"
                :key="item.id || index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nip }}</td>
                <td><strong>{{ item.nama }}</strong></td>
                <td>{{ item.jabatan }}</td>
                <td>{{ item.unit_kerja }}</td>
                <td class="text-center">{{ formatTime(item.jam_masuk) }}</td>
                <td class="text-center">{{ formatTime(item.jam_pulang) }}</td>
                <td class="location-cell"><span v-html="locationLabel(item, 'masuk')"></span></td>
                <td class="location-cell"><span v-html="locationLabel(item, 'pulang')"></span></td>
                <td><span class="status-badge success">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTable === 'cuti'" class="table-section">
        <div class="section-title warning-text">
          <strong>Data Pegawai Cuti Hari Ini</strong>
          <span>{{ summary.cuti_hari_ini_data.length }} data</span>
        </div>

        <div class="table-responsive custom-table-wrap">
          <table class="table table-sm dashboard-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Jenis Cuti</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Hari</th>
                <th>Keperluan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="summary.cuti_hari_ini_data.length === 0">
                <td colspan="11" class="empty-cell">Tidak ada pegawai cuti hari ini.</td>
              </tr>
              <tr
                v-for="(item, index) in summary.cuti_hari_ini_data"
                :key="item.id || index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nip }}</td>
                <td><strong>{{ item.nama }}</strong></td>
                <td>{{ item.jabatan }}</td>
                <td>{{ item.unit_kerja }}</td>
                <td>{{ item.jenis }}</td>
                <td class="text-center">{{ item.tanggal_mulai }}</td>
                <td class="text-center">{{ item.tanggal_selesai }}</td>
                <td class="text-center">{{ item.jumlah_hari }}</td>
                <td class="location-cell">{{ item.keperluan }}</td>
                <td><span class="status-badge warning-badge">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTable === 'izin'" class="table-section">
        <div class="section-title info-text">
          <strong>Data Pegawai Izin Hari Ini</strong>
          <span>{{ summary.izin_hari_ini_data.length }} data</span>
        </div>

        <div class="table-responsive custom-table-wrap">
          <table class="table table-sm dashboard-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Jenis Izin</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Hari</th>
                <th>Keperluan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="summary.izin_hari_ini_data.length === 0">
                <td colspan="11" class="empty-cell">Tidak ada pegawai izin hari ini.</td>
              </tr>
              <tr
                v-for="(item, index) in summary.izin_hari_ini_data"
                :key="item.id || index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nip }}</td>
                <td><strong>{{ item.nama }}</strong></td>
                <td>{{ item.jabatan }}</td>
                <td>{{ item.unit_kerja }}</td>
                <td>{{ item.jenis }}</td>
                <td class="text-center">{{ item.tanggal_mulai }}</td>
                <td class="text-center">{{ item.tanggal_selesai }}</td>
                <td class="text-center">{{ item.jumlah_hari }}</td>
                <td class="location-cell">{{ item.keperluan }}</td>
                <td><span class="status-badge info-badge">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTable === 'belum_absen'" class="table-section">
        <div class="section-title danger-text">
          <strong>Data Pegawai Belum Absen Hari Ini</strong>
          <span>{{ summary.belum_absen_hari_ini_data.length }} data</span>
        </div>

        <div class="table-responsive custom-table-wrap">
          <table class="table table-sm dashboard-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Departemen</th>
                <th>Lokasi Kerja</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="summary.belum_absen_hari_ini_data.length === 0">
                <td colspan="8" class="empty-cell">Semua pegawai wajib absen sudah memiliki status kehadiran.</td>
              </tr>
              <tr
                v-for="(item, index) in summary.belum_absen_hari_ini_data"
                :key="item.pegawai_id || index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nip }}</td>
                <td><strong>{{ item.nama }}</strong></td>
                <td>{{ item.jabatan }}</td>
                <td>{{ item.unit_kerja }}</td>
                <td>{{ item.departemen }}</td>
                <td>{{ item.lokasi_kerja }}</td>
                <td><span class="status-badge danger-badge">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  </template>

</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import ManajemenKehadiranDashboardPwa from './components/ManajemenKehadiranDashboardPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const loading = ref(false)
const activeTable = ref('hadir')

const summary = reactive({
  tanggal: '',
  note: '',
  pegawai_wajib_absen: 0,
  hadir_hari_ini: 0,
  cuti_hari_ini: 0,
  izin_hari_ini: 0,
  belum_absen_hari_ini: 0,
  hadir_hari_ini_data: [],
  cuti_hari_ini_data: [],
  izin_hari_ini_data: [],
  belum_absen_hari_ini_data: [],
})

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
  }).format(date)
}

const formatTime = (value) => {
  if (!value) return '-'
  const raw = String(value)
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw
  if (/^\d{2}:\d{2}$/.test(raw)) return `${raw}:00`
  return raw
}

const esc = (value) => String(value ?? '-')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const locationLabel = (item, type) => {
  const detail = item?.[`lokasi_${type}_detail`] || item?.[`location_${type}`]
  if (detail) {
    const place = detail.tempat || detail.place || detail.nama_tempat || ''
    const road = detail.jalan || detail.road || ''
    const area = detail.daerah || detail.area || detail.kelurahan || ''
    const district = detail.kecamatan || detail.district || ''
    const city = detail.kota || detail.city || ''
    return [
      place ? `<strong>${esc(place)}</strong>` : '',
      road ? esc(road) : '',
      area ? `Daerah: ${esc(area)}` : '',
      district ? `Kecamatan: ${esc(district)}` : '',
      city ? `Kota: ${esc(city)}` : ''
    ].filter(Boolean).join('<br>') || '-'
  }

  const stored = item?.[`lokasi_${type}`]
  if (stored && !/^Lat\s/i.test(String(stored))) return esc(stored)
  const lat = item?.[`latitude_${type}`]
  const lon = item?.[`longitude_${type}`]
  return lat && lon ? `Lat ${lat}, Long ${lon}` : '-'
}

const loadData = async () => {
  loading.value = true

  try {
    const res = await api.get('/kehadiran/dashboard')
    const data = res.data?.data || {}

    Object.assign(summary, {
      tanggal: data.tanggal || '',
      note: data.note || 'Pegawai Penugasan tidak wajib absen.',
      pegawai_wajib_absen: data.pegawai_wajib_absen ?? 0,
      hadir_hari_ini: data.hadir_hari_ini ?? 0,
      cuti_hari_ini: data.cuti_hari_ini ?? 0,
      izin_hari_ini: data.izin_hari_ini ?? 0,
      belum_absen_hari_ini: data.belum_absen_hari_ini ?? 0,
      hadir_hari_ini_data: data.hadir_hari_ini_data || [],
      cuti_hari_ini_data: data.cuti_hari_ini_data || [],
      izin_hari_ini_data: data.izin_hari_ini_data || [],
      belum_absen_hari_ini_data: data.belum_absen_hari_ini_data || [],
    })
  } catch (error) {
    Swal.fire('Gagal', error.response?.data?.message || 'Gagal memuat dashboard kehadiran.', 'error')
  } finally {
    loading.value = false
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
  gap: 12px;
  align-items: center;
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

.note-card {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  padding: 14px 16px;
  position: relative;
  box-shadow: 0 .25rem .8rem rgba(15,23,42,.05);
  overflow: hidden;
  text-align: left;
  min-height: 90px;
  cursor: pointer;
}

.summary-card.active {
  box-shadow: 0 .45rem 1.25rem rgba(15,23,42,.12);
  transform: translateY(-1px);
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
}

.summary-card strong {
  display: block;
  font-size: 30px;
  color: #0f172a;
  font-weight: 950;
  line-height: 1.1;
  margin-top: 4px;
}

.summary-card small {
  display: block;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 800;
  margin-top: 5px;
}

.summary-card i {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 34px;
  opacity: .15;
}

.primary { border-top: 4px solid #0d6efd; }
.warning { border-top: 4px solid #f59e0b; }
.info { border-top: 4px solid #06b6d4; }
.danger { border-top: 4px solid #dc2626; }

.table-tab-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 .25rem .8rem rgba(15,23,42,.05);
}

.table-tab-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.table-tab-head h5 {
  margin: 0;
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.table-tab-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.table-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.table-tabs button {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #475569;
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 11.5px;
  font-weight: 900;
}

.table-tabs button.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}

.table-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.section-title strong {
  font-size: 13px;
  font-weight: 950;
}

.section-title span {
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #475569;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 900;
}

.primary-text { color: #0d6efd; }
.warning-text { color: #b45309; }
.info-text { color: #0891b2; }
.danger-text { color: #dc2626; }

.custom-table-wrap {
  max-height: 420px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.dashboard-table {
  margin: 0;
  min-width: 1040px;
  font-size: 11.5px;
}

.dashboard-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8fafc;
  color: #334155;
  font-size: 11px;
  font-weight: 950;
  white-space: nowrap;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-table td {
  vertical-align: middle;
  white-space: nowrap;
}

.location-cell {
  max-width: 260px;
  white-space: normal !important;
  line-height: 1.35;
}

.empty-cell {
  text-align: center;
  color: #64748b;
  font-weight: 800;
  padding: 28px 10px !important;
}

.status-badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 950;
}

.status-badge.success {
  background: #dcfce7;
  color: #15803d;
}

.warning-badge {
  background: #fef3c7;
  color: #b45309;
}

.info-badge {
  background: #cffafe;
  color: #0e7490;
}

.danger-badge {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 992px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .table-tab-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .table-tabs {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .kehadiran-page {
    padding: 6px;
  }

  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .page-head {
    align-items: flex-start;
  }

  .summary-card {
    padding: 12px;
    min-height: 82px;
  }

  .summary-card strong {
    font-size: 24px;
  }

  .summary-card small {
    display: none;
  }

  .custom-table-wrap {
    max-height: 520px;
  }
}
</style>
