<template>
    <LaporanKehadiranPwa
    v-if="isPwa"
    :filters="filters" :rows="rows" :days="days" :loading="loading" :exporting="exporting" :detail-open="detailOpen" :detail-loading="detailLoading" :selected-employee="selectedEmployee" :detail-data="detailData" :month-label="monthLabel" :cell-class="cellClass" :cell-title="cellTitle" :format-date="formatDate" :format-time="formatTime" :location-label="locationLabel" :load-data="loadData" :export-file="exportFile" :open-detail="openDetail" :close-detail="closeDetail"
  />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <h3>Laporan Kehadiran</h3>
        <p>
          Laporan kehadiran seluruh pegawai dalam periode satu bulan.
        </p>
      </div>

      <div class="head-actions">
        <button
          type="button"
          class="btn btn-sm btn-outline-success"
          :disabled="exporting"
          @click="exportFile('excel')"
        >
          <i class="fas fa-file-excel me-1"></i>
          XLSX
        </button>

        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          :disabled="exporting"
          @click="exportFile('pdf')"
        >
          <i class="fas fa-file-pdf me-1"></i>
          PDF
        </button>
      </div>
    </div>

    <div class="filter-card">
      <div class="period-field">
        <label>Bulan</label>
        <input
          v-model="filters.bulan"
          type="month"
          class="form-control form-control-sm"
        >
      </div>

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

    <div class="report-card">
      <div class="report-head">
        <div>
          <h6>{{ monthLabel }}</h6>
          <small>
            {{ rows.length }} pegawai
          </small>
        </div>

        <span class="legend-info">
          H Hadir · A Absen · I Izin · C Cuti · L Libur
        </span>
      </div>

      <div
        v-if="loading"
        class="state-box"
      >
        <i class="fas fa-spinner fa-spin"></i>
        Memuat laporan...
      </div>

      <div
        v-else-if="!rows.length"
        class="state-box"
      >
        Tidak ada pegawai aktif.
      </div>

      <div
        v-else
        class="table-responsive report-scroll"
      >
        <table class="attendance-report">
          <thead>
            <tr>
              <th class="sticky no-col">No</th>
              <th class="sticky nip-col">NIP</th>
              <th class="sticky employee-col">Pegawai</th>
              <th class="sticky jabatan-col">Jabatan</th>
              <th class="sticky divisi-col">Divisi</th>

              <th
                v-for="day in days"
                :key="day"
                class="day-col"
              >
                <span>{{ day }}</span>
                <small>{{ dayLabel(day) }}</small>
              </th>

              <th class="sticky detail-col">
                Detail
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="row.pegawai_id"
            >
              <td class="sticky no-col text-center">
                {{ index + 1 }}
              </td>

              <td class="sticky nip-col">
                {{ row.nip || '-' }}
              </td>

              <td class="sticky employee-col">
                <strong>{{ row.nama || '-' }}</strong>
              </td>

              <td class="sticky jabatan-col">
                {{ row.jabatan || '-' }}
              </td>

              <td class="sticky divisi-col">
                {{ row.divisi || '-' }}
              </td>

              <td
                v-for="day in days"
                :key="`${row.pegawai_id}-${day}`"
                class="day-col"
              >
                <button
                  type="button"
                  class="day-cell"
                  :class="cellClass(row.harian?.[day])"
                  :title="cellTitle(row.harian?.[day], day)"
                  @click="openDetail(row)"
                >
                  {{ row.harian?.[day]?.code || '-' }}
                </button>
              </td>

              <td class="sticky detail-col">
                <button
                  type="button"
                  class="detail-btn"
                  @click="openDetail(row)"
                >
                  <i class="fas fa-eye me-1"></i>
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="detailOpen"
      class="modal-backdrop-custom"
      @click.self="closeDetail"
    >
      <div class="detail-modal">
        <div class="modal-header-custom">
          <div>
            <div class="eyebrow">REKAP KEHADIRAN</div>
            <h5>
              {{ detailData?.pegawai?.nama || selectedEmployee?.nama || '-' }}
            </h5>
            <small>
              {{ detailData?.pegawai?.nip || selectedEmployee?.nip || '-' }}
            </small>
          </div>

          <button
            type="button"
            class="btn-close"
            @click="closeDetail"
          ></button>
        </div>

        <div
          v-if="detailLoading"
          class="state-box detail-loading"
        >
          <i class="fas fa-spinner fa-spin"></i>
          Memuat detail...
        </div>

        <div
          v-else
          class="detail-body"
        >
          <div class="detail-period">
            <span>Periode</span>
            <strong>{{ monthLabel }}</strong>
          </div>

          <div class="detail-panel">
            <h6>Data Kehadiran</h6>

            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Masuk</th>
                    <th>Lokasi Masuk</th>
                    <th>Pulang</th>
                    <th>Lokasi Pulang</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in detailData?.kehadiran || []"
                    :key="item.id"
                  >
                    <td>{{ formatDate(item.tanggal) }}</td>
                    <td>
                      <span
                        class="status"
                        :class="statusClass(item.status)"
                      >
                        {{ item.status || '-' }}
                      </span>
                    </td>
                    <td>{{ formatTime(item.jam_masuk) }}</td>
                    <td>{{ locationLabel(item.lokasi_masuk) }}</td>
                    <td>{{ formatTime(item.jam_pulang) }}</td>
                    <td>{{ locationLabel(item.lokasi_pulang) }}</td>
                  </tr>

                  <tr v-if="!detailData?.kehadiran?.length">
                    <td
                      colspan="6"
                      class="text-center text-muted py-3"
                    >
                      Belum ada data kehadiran.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="detail-panel">
            <h6>Pengajuan Izin / Cuti</h6>

            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Mulai</th>
                    <th>Selesai</th>
                    <th>Kategori</th>
                    <th>Jenis</th>
                    <th>Hari</th>
                    <th>Keperluan</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in detailData?.cuti_izin || []"
                    :key="item.id"
                  >
                    <td>{{ formatDate(item.tanggal_mulai) }}</td>
                    <td>{{ formatDate(item.tanggal_selesai) }}</td>
                    <td>{{ item.kategori || '-' }}</td>
                    <td>{{ item.jenis || '-' }}</td>
                    <td>{{ item.jumlah_hari || 0 }}</td>
                    <td>{{ item.keperluan || '-' }}</td>
                  </tr>

                  <tr v-if="!detailData?.cuti_izin?.length">
                    <td
                      colspan="6"
                      class="text-center text-muted py-3"
                    >
                      Tidak ada pengajuan yang disetujui.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="detail-panel">
            <h6>Lembur Disetujui</h6>

            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Mulai</th>
                    <th>Selesai</th>
                    <th>Total</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in detailData?.lembur || []"
                    :key="item.id"
                  >
                    <td>{{ formatDate(item.tanggal) }}</td>
                    <td>{{ formatTime(item.jam_mulai) }}</td>
                    <td>{{ formatTime(item.jam_selesai) }}</td>
                    <td>
                      {{
                        (Number(item.total_menit || 0) / 60).toFixed(2)
                      }}
                      jam
                    </td>
                    <td>{{ item.keterangan || '-' }}</td>
                  </tr>

                  <tr v-if="!detailData?.lembur?.length">
                    <td
                      colspan="5"
                      class="text-center text-muted py-3"
                    >
                      Tidak ada lembur yang disetujui.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer-custom">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="closeDetail"
          >
            Tutup
          </button>
        </div>
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
import LaporanKehadiranPwa from './components/LaporanKehadiranPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const now = new Date()

const filters = reactive({
  bulan: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
})

const rows = ref([])
const days = ref([])
const loading = ref(false)
const exporting = ref(false)

const detailOpen = ref(false)
const detailLoading = ref(false)
const selectedEmployee = ref(null)
const detailData = ref(null)

const monthLabel = computed(() => {
  if (!filters.bulan) return '-'

  const [year, month] = filters.bulan.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(year, month - 1, 1))
})

const dayLabel = (day) => {
  const [year, month] = filters.bulan.split('-').map(Number)
  const date = new Date(year, month - 1, Number(day))

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
  })
    .format(date)
    .replace('.', '')
    .slice(0, 2)
    .toUpperCase()
}

const cellClass = (cell) => ({
  hadir: cell?.code === 'H',
  absen: cell?.code === 'A',
  izin: cell?.code === 'I',
  cuti: cell?.code === 'C',
  libur: cell?.code === 'L',
  empty: !cell || cell.code === '-',
})

const cellTitle = (cell, day) => {
  return [
    `Tanggal ${day}`,
    cell?.label || 'Belum ada data',
    cell?.nama_kalender ? `Kalender: ${cell.nama_kalender}` : null,
    cell?.is_hari_libur && !cell?.nama_kalender ? 'Hari Libur' : null,
    cell?.jam_masuk ? `Masuk ${cell.jam_masuk}` : null,
    cell?.jam_pulang ? `Pulang ${cell.jam_pulang}` : null,
  ]
    .filter(Boolean)
    .join(' — ')
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

const formatTime = (value) => {
  if (!value) return '-'

  const text = String(value)

  return /^\d{2}:\d{2}:\d{2}$/.test(text)
    ? text.slice(0, 5)
    : text
}

const locationLabel = (value) => {
  if (!value) return '-'
  if (typeof value === 'string') return value

  return [
    value.tempat,
    value.jalan,
    value.daerah,
    value.kecamatan,
    value.kota,
  ]
    .filter(Boolean)
    .join(' | ') || value.display_name || '-'
}

const statusClass = (value) => ({
  Hadir: 'hadir',
  Absen: 'absen',
  Izin: 'izin',
  Cuti: 'cuti',
  Libur: 'libur',
}[value] || '')

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get(
      '/kehadiran/laporan',
      {
        params: {
          bulan: filters.bulan,
        },
      },
    )

    const data = response.data?.data || {}

    rows.value = data.rows || []
    days.value = data.days || []
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message ||
        'Gagal memuat laporan kehadiran.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

const exportFile = async (type) => {
  exporting.value = true

  try {
    const isExcel = type === 'excel'

    const response = await api.get(
      `/kehadiran/laporan/export-${type}`,
      {
        params: {
          bulan: filters.bulan,
        },
        responseType: 'blob',
      },
    )

    const contentType =
      response.headers?.['content-type'] || ''

    if (contentType.includes('application/json')) {
      const text = await response.data.text()
      let message = 'Export gagal diproses.'

      try {
        message = JSON.parse(text)?.message || message
      } catch {
        // Keep default message.
      }

      throw new Error(message)
    }

    const blob = new Blob(
      [response.data],
      {
        type: contentType || (
          isExcel
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        ),
      },
    )

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download =
      `laporan-kehadiran-${filters.bulan}.${isExcel ? 'xlsx' : 'pdf'}`

    document.body.appendChild(link)
    link.click()
    link.remove()

    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1500)
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.message ||
        error.response?.data?.message ||
        'Export laporan kehadiran gagal.',
      'error',
    )
  } finally {
    exporting.value = false
  }
}

const openDetail = async (row) => {
  selectedEmployee.value = row
  detailOpen.value = true
  detailLoading.value = true
  detailData.value = null

  try {
    const response = await api.get(
      `/kehadiran/laporan/${row.pegawai_id}/detail`,
      {
        params: {
          bulan: filters.bulan,
        },
      },
    )

    detailData.value = response.data?.data || null
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message ||
        'Gagal memuat detail kehadiran.',
      'error',
    )

    closeDetail()
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  detailOpen.value = false
  detailLoading.value = false
  detailData.value = null
  selectedEmployee.value = null
}

onMounted(loadData)
</script>

<style scoped>
.kehadiran-page {
  min-height: 100vh;
  padding: 10px;
  background: #f4f7fb;
}

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

.filter-card,
.report-card {
  padding: 11px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 0.25rem 0.8rem rgba(15, 23, 42, 0.05);
}

.filter-card {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.period-field {
  width: 220px;
}

.period-field label {
  display: block;
  margin-bottom: 4px;
  color: #475569;
  font-size: 11px;
  font-weight: 900;
}

.filter-card .btn {
  height: 31px;
  min-width: 95px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
}

.report-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
}

.report-head h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 900;
}

.report-head small,
.legend-info {
  color: #64748b;
  font-size: 10px;
}

.report-scroll {
  max-height: calc(100vh - 235px);
  overflow: auto;
}

.attendance-report {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 10px;
}

.attendance-report th,
.attendance-report td {
  padding: 5px 6px;
  background: #fff;
  border-right: 1px solid #dbe3ec;
  border-bottom: 1px solid #dbe3ec;
}

.attendance-report thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  color: #334155;
  background: #f8fafc;
  text-align: center;
  white-space: nowrap;
  font-weight: 900;
}

.attendance-report th:first-child,
.attendance-report td:first-child {
  border-left: 1px solid #dbe3ec;
}

.sticky {
  position: sticky;
  z-index: 3;
}

.attendance-report thead .sticky {
  z-index: 7;
}

.no-col {
  left: 0;
  width: 38px;
  min-width: 38px;
}

.nip-col {
  left: 38px;
  width: 100px;
  min-width: 100px;
}

.employee-col {
  left: 138px;
  width: 170px;
  min-width: 170px;
}

.jabatan-col {
  left: 308px;
  width: 145px;
  min-width: 145px;
}

.divisi-col {
  left: 453px;
  width: 130px;
  min-width: 130px;
}

.day-col {
  width: 34px;
  min-width: 34px;
  text-align: center;
}

.day-col span,
.day-col small {
  display: block;
}

.day-col small {
  color: #64748b;
  font-size: 8px;
}

.detail-col {
  right: 0;
  width: 86px;
  min-width: 86px;
  text-align: center;
  box-shadow: -3px 0 6px rgba(15, 23, 42, 0.05);
}

.day-cell {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #64748b;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
}

.day-cell.hadir {
  color: #166534;
  background: #dcfce7;
  border-color: #bbf7d0;
}

.day-cell.absen {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}

.day-cell.izin {
  color: #92400e;
  background: #fef3c7;
  border-color: #fde68a;
}

.day-cell.cuti {
  color: #6d28d9;
  background: #ede9fe;
  border-color: #ddd6fe;
}

.day-cell.libur {
  color: #475569;
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.day-cell.empty {
  color: #94a3b8;
  background: #fff;
}

.detail-btn {
  height: 30px;
  min-width: 70px;
  padding: 0 8px;
  border: 1px solid #0d6efd;
  border-radius: 7px;
  background: #0d6efd;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.state-box {
  min-height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-direction: column;
  color: #64748b;
  font-size: 12px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
}

.detail-modal {
  width: min(1280px, 100%);
  max-height: 92vh;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.25);
}

.modal-header-custom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header-custom h5 {
  margin: 2px 0 0;
  color: #0f172a;
  font-weight: 950;
}

.modal-header-custom small,
.detail-period span {
  color: #64748b;
  font-size: 10px;
}

.detail-body {
  max-height: calc(92vh - 125px);
  overflow: auto;
  padding: 14px 16px;
}

.detail-period {
  margin-bottom: 10px;
}

.detail-period strong {
  display: block;
  color: #1e293b;
  font-size: 13px;
}

.detail-panel {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.detail-panel h6 {
  margin: 0 0 8px;
  color: #0f172a;
  font-weight: 900;
}

.detail-panel .table {
  margin-bottom: 0;
  font-size: 10px;
}

.detail-panel .table th {
  white-space: nowrap;
  background: #f8fafc;
}

.status {
  display: inline-flex;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 900;
}

.status.hadir { color: #166534; background: #dcfce7; }
.status.absen { color: #991b1b; background: #fee2e2; }
.status.izin { color: #92400e; background: #fef3c7; }
.status.cuti { color: #6d28d9; background: #ede9fe; }
.status.libur { color: #475569; background: #e2e8f0; }

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  padding: 10px 16px;
  border-top: 1px solid #e5e7eb;
}

.eyebrow {
  color: #64748b;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

@media (max-width: 768px) {
  .page-head,
  .filter-card {
    align-items: stretch;
    flex-direction: column;
  }

  .period-field {
    width: 100%;
  }

  .filter-card .btn {
    width: 100%;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions .btn {
    flex: 1;
  }

  .legend-info {
    display: none;
  }

  .modal-backdrop-custom {
    padding: 8px;
  }
}
</style>
