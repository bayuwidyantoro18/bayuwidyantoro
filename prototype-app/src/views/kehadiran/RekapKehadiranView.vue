<template>
    <RekapKehadiranPwa
    v-if="isPwa"
    :bulan="bulan" :rows="rows" :profile="profile" :loading="loading" :printing="printing" :summary="summary" :month-label="monthLabel" :profile-name="profileName" :profile-nip="profileNip" :format-date="formatDate" :format-time="formatTime" :location-label="locationLabel" :status-class="statusClass" :load-data="loadData" :print-pdf="printPdf" @update-bulan="bulan=$event;loadData()"
  />

  <template v-else-if="isWeb">
<div class="kehadiran-page">

    <!-- HEADER -->
    <div class="page-head">
      <div>
        <h3>Rekap Kehadiran</h3>
        <p>
          Rekap pribadi berdasarkan data kehadiran dan pengajuan yang sudah disetujui.
        </p>
      </div>

      <div class="head-actions">
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          :disabled="loading"
          @click="loadData"
        >
          <i class="fas fa-sync-alt me-1"></i>
          Refresh
        </button>

        <button
          type="button"
          class="btn btn-sm btn-danger"
          :disabled="printing"
          @click="printPdf"
        >
          <i class="fas fa-file-pdf me-1"></i>
          PDF
        </button>
      </div>
    </div>

    <!-- FILTER PERIODE -->
    <div class="toolbar-card">
      <div class="period-field">
        <label>Periode</label>

        <div class="period-input">
          <input
            v-model="bulan"
            type="month"
            class="form-control form-control-sm"
          >

          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="loading"
            @click="loadData"
          >
            <i class="fas fa-search me-1"></i>
            {{ loading ? 'Memuat...' : 'Tampilkan' }}
          </button>
        </div>
      </div>

      <div class="period-info">
        <span>Periode aktif</span>
        <strong>{{ monthLabel }}</strong>
      </div>
    </div>

    <!-- SUMMARY -->
    <div class="summary-grid">
      <div class="summary">
        <span>Hadir</span>
        <strong>{{ summary.hadir }}</strong>
      </div>

      <div class="summary">
        <span>Absen</span>
        <strong>{{ summary.absen }}</strong>
      </div>

      <div class="summary">
        <span>Izin</span>
        <strong>{{ summary.izin }}</strong>
      </div>

      <div class="summary">
        <span>Cuti</span>
        <strong>{{ summary.cuti }}</strong>
      </div>

      <div class="summary">
        <span>Hari Libur</span>
        <strong>{{ summary.libur }}</strong>
      </div>

      <div class="summary overtime">
        <span>Lembur Disetujui</span>
        <strong>
          {{ Number(summary.lembur_jam || 0).toFixed(2) }} jam
        </strong>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <div class="table-title">
        <div>
          <h6>{{ profileName }}</h6>
          <small>{{ profileNip }}</small>
        </div>

        <span>{{ monthLabel }}</span>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Masuk</th>
              <th>Lokasi Masuk</th>
              <th>Pulang</th>
              <th>Lokasi Pulang</th>
              <th>Lembur</th>
              <th>Izin/Cuti</th>
              <th>Keterangan</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in rows"
              :key="row.pegawai_id + '-' + row.tanggal"
            >
              <td class="date-cell">
                {{ formatDate(row.tanggal) }}
              </td>

              <td>
                <span
                  class="status"
                  :class="statusClass(displayStatus(row))"
                >
                  {{ displayStatus(row) }}
                </span>
              </td>

              <td>
                {{ formatTime(row.jam_masuk) }}
              </td>

              <td
                class="location"
                v-html="locationLabel(row.lokasi_masuk_detail || row.lokasi_masuk)"
              ></td>

              <td>
                {{ formatTime(row.jam_pulang) }}
              </td>

              <td
                class="location"
                v-html="locationLabel(row.lokasi_pulang_detail || row.lokasi_pulang)"
              ></td>

              <td>
                {{ Number(row.lembur_jam || row.lembur?.total_menit / 60 || 0) > 0
                  ? Number(row.lembur_jam || row.lembur?.total_menit / 60 || 0).toFixed(2) + ' jam'
                  : '-' }}
              </td>

              <td>
                {{ row.izin_cuti || ((displayStatus(row) === 'Izin' || displayStatus(row) === 'Cuti') ? (row.keterangan || displayStatus(row)) : '-') }}
              </td>

              <td>
                {{ keteranganGabungan(row) }}
              </td>
            </tr>

            <tr v-if="!rows.length">
              <td
                colspan="9"
                class="text-center text-muted py-4"
              >
                Data belum tersedia.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
  </template>

</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import Swal from 'sweetalert2'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import RekapKehadiranPwa from './components/RekapKehadiranPwa.vue'
const { isPwa, isWeb } = usePwaMode()

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const now = new Date()

const bulan = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
)

const rows = ref([])

const profile = ref({})

const loading = ref(false)
const printing = ref(false)

const summary = reactive({
  hadir: 0,
  absen: 0,
  izin: 0,
  cuti: 0,
  libur: 0,
  lembur_jam: 0,
})

/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/

const monthLabel = computed(() => {
  if (!bulan.value) {
    return '-'
  }

  const [year, month] = bulan.value
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(year, month - 1, 1))
})

const profileName = computed(() => {
  return profile.value.nama || '-'
})

const profileNip = computed(() => {
  return profile.value.nip || '-'
})

/*
|--------------------------------------------------------------------------
| Formatter
|--------------------------------------------------------------------------
*/

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

const formatTime = (value) => {
  if (!value) return '-'

  const text = String(value).trim()

  // Timestamp API, misalnya 2026-10-13T07:30:00.000000Z:
  // tampilkan bagian jam saja tanpa tanggal, detik, atau konversi zona waktu.
  const timestampMatch = text.match(/[T ](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/)
  if (timestampMatch) return timestampMatch[1]

  // Nilai waktu biasa HH:mm:ss atau HH:mm.
  const timeMatch = text.match(/^(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  if (timeMatch) return timeMatch[1]

  return text
}

/*
|--------------------------------------------------------------------------
| Location
|--------------------------------------------------------------------------
*/

const esc = (value) => {
  return String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const locationLabel = (value) => {
  if (!value) {
    return '-'
  }

  if (typeof value === 'string') {
    return esc(value)
  }

  const parts = [
    value.tempat,
    value.jalan,
    value.daerah
      ? `Daerah: ${value.daerah}`
      : '',
    value.kecamatan
      ? `Kecamatan: ${value.kecamatan}`
      : '',
    value.kota
      ? `Kota: ${value.kota}`
      : '',
  ].filter(Boolean)

  if (!parts.length) {
    return '-'
  }

  return parts
    .map((item, index) => {
      return index === 0
        ? `<strong>${esc(item)}</strong>`
        : esc(item)
    })
    .join('<br>')
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const displayStatus = (row) => {
  const raw = String(row?.status || row?.keterangan_absensi || '').trim()
  const normalized = raw.toLowerCase()

  if (row?.is_hari_libur || row?.is_cuti_bersama || row?.is_hari_libur_manual) {
    return 'Libur'
  }

  if (normalized === 'alfa' || normalized === 'absen' || normalized === 'tidak hadir') {
    return 'Absen'
  }
  if (normalized === 'hadir') return 'Hadir'
  if (normalized === 'izin') return 'Izin'
  if (normalized === 'cuti') return 'Cuti'
  if (normalized === 'lembur') return 'Lembur'
  if (normalized === 'belum') return 'Belum'
  if (normalized === 'koreksi') return 'Koreksi'

  return raw || '-'
}

const statusClass = (value) => {
  return {
    Hadir: 'hadir',
    Absen: 'absen',
    Alfa: 'absen',
    Cuti: 'cuti',
    Izin: 'izin',
    Libur: 'libur',
    'Tidak Hadir': 'libur',
    Lembur: 'lembur',
    Belum: 'belum',
    Koreksi: 'izin',
  }[value] || ''
}

// Gabungkan seluruh kondisi pada tanggal yang sama agar informasi tidak saling menimpa.
const keteranganGabungan = (row) => {
  const labels = []
  const add = (value) => {
    const label = String(value || '').trim()
    if (!label || label === '-' || labels.some((item) => item.toLowerCase() === label.toLowerCase())) return
    labels.push(label)
  }

  const status = displayStatus(row)
  if (['Hadir', 'Absen', 'Izin', 'Cuti', 'Libur'].includes(status)) add(status)

  const overtimeHours = Number(row?.lembur_jam || row?.lembur?.total_jam || 0)
  const overtimeMinutes = Number(row?.lembur?.total_menit || 0)
  if (overtimeHours > 0 || overtimeMinutes > 0) add('Lembur')

  // Gabungkan keterangan terpisah tanpa membiarkan satu field menimpa field lain.
  const sources = [
    row?.keterangan,
    row?.keterangan_absensi,
    row?.jenis_koreksi,
    row?.koreksi?.jenis_koreksi,
    row?.koreksi?.jenis,
  ].filter(Boolean).map((value) => String(value).trim())

  sources.forEach((source) => {
    const normalized = source.toLowerCase()
    if (normalized.includes('koreksi') && normalized.includes('pulang')) add('Koreksi Pulang')
    else if (normalized.includes('koreksi') && normalized.includes('masuk')) add('Koreksi Masuk')
    else if (normalized === 'lembur') add('Lembur')
    else if (!['hadir', 'absen', 'alfa', 'tidak hadir', 'izin', 'cuti', 'libur'].includes(normalized) && !normalized.includes('koreksi')) {
      add(source)
    }
  })

  // Sumber koreksi kadang ditandai pada record; gunakan jenis jika tersedia.
  const source = String(row?.source || '').toLowerCase()
  const correctionType = String(row?.jenis_koreksi || row?.koreksi?.jenis_koreksi || '').toLowerCase()
  if (source.includes('koreksi') && correctionType.includes('pulang')) add('Koreksi Pulang')
  else if (source.includes('koreksi') && correctionType.includes('masuk')) add('Koreksi Masuk')

  return labels.join(', ') || '-'
}

const dateKey = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const isApproved = (item) => {
  const status = String(item?.status || '').toLowerCase()
  return status === 'disetujui' || status === 'approved'
}

const buildSummary = (attendanceRows, overtimeRows, apiSummary = {}) => {
  const result = {
    hadir: 0,
    absen: 0,
    izin: 0,
    cuti: 0,
    libur: 0,
    lembur_jam: 0,
  }

  attendanceRows.forEach((row) => {
    const status = displayStatus(row)
    if (status === 'Hadir') result.hadir += 1
    else if (status === 'Absen') result.absen += 1
    else if (status === 'Izin') result.izin += 1
    else if (status === 'Cuti') result.cuti += 1
    else if (status === 'Libur') result.libur += 1
  })

  const approvedOvertime = overtimeRows.filter(isApproved)
  if (approvedOvertime.length) {
    result.lembur_jam = approvedOvertime.reduce((total, item) => {
      const hours = Number(item?.total_jam)
      const minutes = Number(item?.total_menit)
      return total + (Number.isFinite(hours) ? hours : (Number.isFinite(minutes) ? minutes / 60 : 0))
    }, 0)
  } else {
    result.lembur_jam = attendanceRows.reduce((total, row) => {
      const minutes = Number(row?.lembur?.total_menit || 0)
      return total + (Number.isFinite(minutes) ? minutes / 60 : 0)
    }, 0)
  }

  // Prioritaskan ringkasan yang disediakan backend jika benar-benar tersedia.
  for (const key of Object.keys(result)) {
    const value = apiSummary?.[key]
    if (value !== undefined && value !== null && Number.isFinite(Number(value))) {
      result[key] = Number(value)
    }
  }

  return result
}

/*
|--------------------------------------------------------------------------
| Load Data
|--------------------------------------------------------------------------
*/

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/rekap/self', {
      params: {
        bulan: bulan.value,
      },
    })

    const data = response.data?.data || {}
    const attendanceRows = Array.isArray(data.kehadiran)
      ? data.kehadiran
      : (Array.isArray(data.rows) ? data.rows : [])
    const leaveRows = Array.isArray(data.cuti_izin) ? data.cuti_izin : []
    const overtimeRows = Array.isArray(data.lembur) ? data.lembur : []

    // Gabungkan lembur yang disetujui ke baris tanggal yang sesuai.
    const overtimeByDate = new Map()
    overtimeRows.filter(isApproved).forEach((item) => {
      const key = dateKey(item.tanggal)
      if (!key) return
      const hours = Number(item.total_jam)
      const minutes = Number(item.total_menit)
      const value = Number.isFinite(hours) ? hours : (Number.isFinite(minutes) ? minutes / 60 : 0)
      overtimeByDate.set(key, (overtimeByDate.get(key) || 0) + value)
    })

    // Baris bulanan dari AttendanceMonthlyService sudah berisi satu baris per tanggal.
    rows.value = attendanceRows.map((row) => {
      const key = dateKey(row.tanggal)
      const approvedHours = overtimeByDate.get(key)
      const embeddedMinutes = Number(row?.lembur?.total_menit || 0)
      const leave = leaveRows.find((item) => {
        if (!isApproved(item) || !key) return false
        const start = dateKey(item.tanggal_mulai)
        const end = dateKey(item.tanggal_selesai || item.tanggal_mulai)
        return start && end && key >= start && key <= end
      })

      return {
        ...row,
        status: row.status || row.keterangan_absensi || null,
        lembur_jam: approvedHours !== undefined
          ? approvedHours
          : (embeddedMinutes > 0 ? embeddedMinutes / 60 : 0),
        izin_cuti: row.izin_cuti || (leave
          ? (leave.jenis || leave.kategori || leave.keterangan || leave.kategori_cuti || 'Disetujui')
          : null),
      }
    })

    profile.value = data.pegawai || data.profile || {}
    Object.assign(summary, buildSummary(rows.value, overtimeRows, data.ringkasan || {}))
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message ||
        'Gagal memuat rekap kehadiran.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Export PDF
|--------------------------------------------------------------------------
*/

const printPdf = async () => {
  printing.value = true

  try {
    const response = await api.get(
      '/kehadiran/rekap/export-pdf',
      {
        params: {
          bulan: bulan.value,
        },
        responseType: 'blob',
      },
    )

    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf',
      },
    )

    const url = URL.createObjectURL(blob)

    window.open(url, '_blank')

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 30000)
  } catch (error) {
    Swal.fire(
      'Gagal',
      error.response?.data?.message ||
        'Gagal membuat PDF.',
      'error',
    )
  } finally {
    printing.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

.kehadiran-page {
  min-height: 100vh;
  padding: 10px;
  background: #f4f7fb;
}

/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.page-head h3 {
  margin: 0;
  color: #0f172a;
  font-weight: 950;
}

.page-head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.head-actions {
  display: flex;
  gap: 6px;
}

/*
|--------------------------------------------------------------------------
| Toolbar
|--------------------------------------------------------------------------
*/

.toolbar-card {
  display: flex;
  align-items: flex-end;
  gap: 22px;
  padding: 11px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 0.25rem 0.8rem rgba(15, 23, 42, 0.05);
}

.period-field label {
  display: block;
  margin-bottom: 4px;
  color: #475569;
  font-size: 11px;
  font-weight: 900;
}

.period-input {
  display: flex;
  align-items: center;
  gap: 7px;
}

.period-input input {
  width: 190px;
}

.period-input .btn {
  height: 32px;
  min-width: 92px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.period-info {
  padding-bottom: 2px;
}

.period-info span,
.period-info strong {
  display: block;
}

.period-info span {
  color: #94a3b8;
  font-size: 10px;
}

.period-info strong {
  color: #1e293b;
  font-size: 13px;
}

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.summary {
  padding: 9px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.summary span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.summary strong {
  display: block;
  margin-top: 3px;
  color: #0f172a;
  font-size: 19px;
}

.summary.overtime strong {
  font-size: 15px;
}

/*
|--------------------------------------------------------------------------
| Table
|--------------------------------------------------------------------------
*/

.table-card {
  padding: 11px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 0.25rem 0.8rem rgba(15, 23, 42, 0.05);
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.table-title h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 900;
}

.table-title small,
.table-title > span {
  color: #64748b;
  font-size: 10px;
}

.table {
  margin-bottom: 0;
  font-size: 11px;
}

.table th {
  color: #334155;
  background: #f8fafc;
  font-size: 10px;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.date-cell {
  white-space: nowrap;
}

/*
|--------------------------------------------------------------------------
| Location
|--------------------------------------------------------------------------
*/

.location {
  min-width: 170px;
  line-height: 1.4;
}

.location :deep(strong) {
  color: #1e293b;
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

.status {
  display: inline-flex;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 900;
}

.status.hadir {
  color: #166534;
  background: #dcfce7;
}

.status.absen {
  color: #991b1b;
  background: #fee2e2;
}

.status.cuti {
  color: #6d28d9;
  background: #ede9fe;
}

.status.izin {
  color: #92400e;
  background: #fef3c7;
}

.status.libur {
  color: #475569;
  background: #e2e8f0;
}

/*
|--------------------------------------------------------------------------
| Responsive
|--------------------------------------------------------------------------
*/

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 650px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .period-input {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  .period-input input {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .head-actions {
    justify-content: flex-start;
  }
}
</style>