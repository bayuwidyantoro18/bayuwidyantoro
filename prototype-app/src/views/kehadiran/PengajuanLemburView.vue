<template>
    <PengajuanLemburPwa
      v-if="isPwa"
      :rows="rows"
      :approval-rows="approvalRows"
      :can-approve="canApprove"
      :loading="loading"
      :saving="saving"
      :schedule="schedule"
      :form="form"
      :kadiv-options="kadivOptions"
      :loading-kadiv="loadingKadiv"
      :format-date="formatDate"
      :format-time="formatTime"
      :format-hours="formatHours"
      :status-label="statusLabel"
      :status-class="statusClass"
      :submit="submit"
      :approve="approve"
      @file-change="file=$event"
    />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <h3>Pengajuan Lembur</h3>
        <p>Ajukan lembur dan pantau status persetujuan.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" :disabled="loading" @click="loadData">
        <i class="fas fa-sync-alt me-1"></i> Refresh
      </button>
    </div>

    <div class="form-card">
      <div class="grid">
        <div>
          <label>Tanggal</label>
          <input v-model="form.tanggal" type="date" class="form-control form-control-sm">
        </div>

        <div>
          <label>Jam Mulai</label>
          <input v-model="form.jam_mulai" type="time" step="60" class="form-control form-control-sm">
          <small v-if="schedule" class="text-muted">
            Minimal {{ formatTime(schedule.lembur_mulai) }}
            {{ schedule.is_event ? ` • ${schedule.event_name}` : ' • Normal' }}
          </small>
        </div>

        <div>
          <label>Jam Selesai</label>
          <input v-model="form.jam_selesai" type="time" step="60" class="form-control form-control-sm">
        </div>

        <div class="wide">
          <label>Kepala Divisi Approval</label>
          <select
            v-model="form.kadiv_id"
            class="form-select form-select-sm"
            :disabled="loadingKadiv || saving"
            required
          >
            <option value="">
              {{ loadingKadiv ? 'Memuat daftar Kadiv...' : '-- Pilih Kepala Divisi --' }}
            </option>
            <option
              v-for="kadiv in kadivOptions"
              :key="kadiv.user_id"
              :value="String(kadiv.user_id)"
            >
              {{ kadiv.nama }} — {{ kadiv.jabatan }}
              {{ kadiv.departemen ? `(${kadiv.departemen})` : '' }}
            </option>
          </select>
          <small class="text-muted">
            Pilih Kepala Divisi yang akan menerima pengajuan lembur Anda.
          </small>
          <small v-if="!loadingKadiv && kadivOptions.length === 0" class="text-danger d-block">
            Daftar Kadiv belum tersedia. Silakan refresh halaman.
          </small>
        </div>

        <div>
          <label>Dokumen Pendukung</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="form-control form-control-sm" @change="file=$event.target.files[0] || null">
        </div>

        <div class="wide">
          <label>Keterangan</label>
          <textarea v-model="form.keterangan" class="form-control form-control-sm" rows="2"></textarea>
        </div>
      </div>

      <button class="btn btn-primary btn-sm mt-2" :disabled="saving" @click="submit">
        {{ saving ? 'Menyimpan...' : 'Ajukan Lembur' }}
      </button>
    </div>

    <div class="table-card">
      <div class="table-head">
        <div>
          <h6>Pengajuan Saya</h6>
          <small class="text-muted">Pegawai hanya melihat status pengajuannya.</small>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th><th>Mulai</th><th>Selesai</th><th>Total Jam</th><th>Status</th><th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id">
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ formatTime(item.jam_mulai) }}</td>
              <td>{{ formatTime(item.jam_selesai) }}</td>
              <td>{{ formatHours(item.total_jam) }}</td>
              <td><span class="status-badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></td>
              <td>{{ item.keterangan || '-' }}</td>
            </tr>
            <tr v-if="rows.length===0">
              <td colspan="6" class="text-center text-muted">Belum ada pengajuan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="canApprove" class="table-card">
      <div class="table-head">
        <div>
          <h6>Pengajuan Menunggu Persetujuan</h6>
          <small class="text-muted">Semua request Diajukan dapat diproses oleh role yang berwenang.</small>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th><th>NIP</th><th>Nama</th><th>Divisi</th>
              <th>Mulai</th><th>Selesai</th><th>Total</th><th>Keterangan</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in approvalRows" :key="item.id">
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ item.pegawai?.nip || '-' }}</td>
              <td>{{ item.pegawai?.nama || '-' }}</td>
              <td>{{ item.pegawai?.departemen || item.pegawai?.unit_kerja || '-' }}</td>
              <td>{{ formatTime(item.jam_mulai) }}</td>
              <td>{{ formatTime(item.jam_selesai) }}</td>
              <td>{{ formatHours(item.total_jam) }}</td>
              <td>{{ item.keterangan || '-' }}</td>
              <td><span class="status-badge pending">Menunggu Approval</span></td>
              <td class="text-nowrap">
                <button class="btn btn-sm btn-success me-1" @click="approve(item,'approved')">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="approve(item,'rejected')">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
            <tr v-if="approvalRows.length===0">
              <td colspan="10" class="text-center text-muted">
                Tidak ada pengajuan yang menunggu persetujuan.
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
import { reactive, ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import PengajuanLemburPwa from './components/PengajuanLemburPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const rows = ref([])
const approvalRows = ref([])
const canApprove = ref(false)
const loading = ref(false)
const saving = ref(false)
const file = ref(null)
const schedule = ref(null)
const kadivOptions = ref([])
const loadingKadiv = ref(false)

const form = reactive({
  tanggal: '',
  jam_mulai: '17:00',
  jam_selesai: '',
  keterangan: '',
  kadiv_id: ''
})

const formatDate = (value) => {
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

const formatTime = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  const raw = String(value).trim()
  // Format tampilan jam menjadi HH:mm, tanpa detik.
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)

  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`
  }

  return raw
}

const formatHours = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toFixed(2)} jam` : String(value)
}

const statusLabel = (value) => ({
  Diajukan: 'Menunggu Approval',
  Disetujui: 'Disetujui',
  Ditolak: 'Ditolak'
}[value] || value || '-')

const statusClass = (value) => ({
  Diajukan: 'pending',
  Disetujui: 'approved',
  Ditolak: 'rejected'
}[value] || '')

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/lembur')
    const data = response.data?.data || {}

    rows.value = data.data || []
    approvalRows.value = data.approval_requests || []
    canApprove.value = Boolean(data.can_approve)
    schedule.value = data.settings?.jadwal_hari_ini || null
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat data lembur.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const loadScheduleForDate = async (date) => {
  if (!date) {
    schedule.value = null
    return
  }

  try {
    const response = await api.get('/kehadiran/pengaturan')
    const data = response.data?.data || {}
    const shifts = Array.isArray(data.shifts) ? data.shifts : []

    const hit = shifts.find((item) => {
      return String(item.mulai_berlaku) <= date
        && String(item.akhir_berlaku) >= date
        && Boolean(item.is_active)
    })

    const day = new Date(`${date}T00:00:00+07:00`).getDay()
    const holiday = day === 0 || day === 6

    schedule.value = hit
      ? {
          is_event: true,
          event_name: hit.nama_shift,
          lembur_mulai: holiday
            ? (hit.lembur_hari_libur_mulai || data.normal_lembur_hari_libur_mulai)
            : (hit.lembur_hari_kerja_mulai || data.normal_lembur_hari_kerja_mulai)
        }
      : {
          is_event: false,
          event_name: null,
          lembur_mulai: holiday
            ? data.normal_lembur_hari_libur_mulai
            : data.normal_lembur_hari_kerja_mulai
        }

    if (schedule.value?.lembur_mulai) {
      form.jam_mulai = schedule.value.lembur_mulai
    }
  } catch (error) {
    // Biarkan jadwal default dari API index tetap digunakan.
  }
}

watch(() => form.tanggal, (value) => {
  loadScheduleForDate(value)
})

const loadKadiv = async () => {
  loadingKadiv.value = true

  try {
    const response = await api.get('/kehadiran/lembur/kadiv')
    const data = response.data?.data || []

    kadivOptions.value = Array.isArray(data) ? data : []
  } catch (error) {
    kadivOptions.value = []

    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat daftar Kepala Divisi.',
      'error'
    )
  } finally {
    loadingKadiv.value = false
  }
}

const submit = async () => {
  if (!form.kadiv_id) {
    await Swal.fire(
      'Perhatian',
      'Silakan pilih Kepala Divisi yang akan melakukan approval.',
      'warning'
    )
    return
  }

  if (!kadivOptions.value.some(item => String(item.user_id) === String(form.kadiv_id))) {
    await Swal.fire(
      'Perhatian',
      'Pilihan Kepala Divisi tidak valid. Silakan refresh daftar Kadiv.',
      'warning'
    )
    return
  }

  if (!file.value) {
    await Swal.fire(
      'Perhatian',
      'Silakan pilih dokumen pendukung terlebih dahulu.',
      'warning'
    )
    return
  }

  saving.value = true

  try {
    const formData = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value || '')
    })

    if (file.value) {
      formData.append('dokumen', file.value)
    }

    const response = await api.post('/kehadiran/lembur', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire(
      'Berhasil',
      response.data?.message || 'Pengajuan lembur berhasil dibuat.',
      'success'
    )

    Object.assign(form, {
      tanggal: '',
      jam_mulai: '17:00',
      jam_selesai: '',
      keterangan: '',
      kadiv_id: ''
    })

    file.value = null
    await loadData()
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal menyimpan pengajuan.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const approve = async (item, status) => {
  const result = await Swal.fire({
    icon: status === 'approved' ? 'question' : 'warning',
    title: status === 'approved' ? 'Setujui lembur?' : 'Tolak lembur?',
    text: 'Tindakan ini akan mengubah status pengajuan.',
    showCancelButton: true,
    confirmButtonText: status === 'approved' ? 'Setujui' : 'Tolak',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/kehadiran/lembur/${item.id}/approval`, { status })

    await Swal.fire(
      'Berhasil',
      status === 'approved'
        ? 'Pengajuan lembur berhasil disetujui.'
        : 'Pengajuan lembur berhasil ditolak.',
      'success'
    )

    await loadData()
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memproses approval.',
      'error'
    )
  }
}

onMounted(async () => {
  await Promise.all([
    loadData(),
    loadKadiv()
  ])
})
</script>

<style scoped>
.kehadiran-page{padding:10px;background:#f4f7fb;min-height:100vh}
.page-head,.table-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px}
.page-head h3,.table-head h6{margin:0;font-weight:950}.page-head p{margin:0;color:#64748b;font-size:12px}
.form-card,.table-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:11px;margin-bottom:10px;box-shadow:0 .25rem .8rem rgba(15,23,42,.05)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.wide{grid-column:span 2}
label{display:block;font-size:12px;font-weight:800;color:#475569;margin-bottom:4px}
.approval-info{margin-top:9px;padding:8px 10px;border-radius:8px;background:#eff6ff;color:#1e40af;font-size:11px}
.table{font-size:12px}.table th{white-space:nowrap;background:#f8fafc}
.status-badge{display:inline-flex;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800;background:#e2e8f0}
.status-badge.pending{background:#fef3c7;color:#92400e}.status-badge.approved{background:#dcfce7;color:#166534}.status-badge.rejected{background:#fee2e2;color:#991b1b}
@media(max-width:768px){.grid{grid-template-columns:1fr}.wide{grid-column:span 1}}
</style>
