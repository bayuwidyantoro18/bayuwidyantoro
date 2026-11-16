<template>
    <KoreksiKehadiranPwa
    v-if="isPwa"
    :rows="rows" :approval-rows="approvalRows" :can-approve="canApprove" :loading="loading" :saving="saving" :form="form" :format-date="formatDate" :format-time="formatTime" :status-label="statusLabel" :status-class="statusClass" :submit="submit" :approve="approve" @file-change="file=$event"
  />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <h3>Koreksi Kehadiran</h3>
        <p>Ajukan koreksi dan pantau status persetujuan.</p>
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
          <label>Jenis Koreksi</label>
          <select v-model="form.jenis_koreksi" class="form-select form-select-sm">
            <option value="Masuk">Masuk</option>
            <option value="Pulang">Pulang</option>
            <option value="Cuti">Cuti</option>
            <option value="Izin">Izin</option>
          </select>
        </div>

        <div>
          <label>Jam Koreksi</label>
          <input v-model="form.jam_koreksi" type="time" step="60" class="form-control form-control-sm">
        </div>

        <div>
          <label>Jenis Cuti/Izin</label>
          <input v-model="form.jenis_cuti_izin" class="form-control form-control-sm" placeholder="Jika diperlukan">
        </div>

        <div class="wide">
          <label>Alasan</label>
          <textarea v-model="form.alasan" class="form-control form-control-sm" rows="2" placeholder="Alasan koreksi"></textarea>
        </div>

        <div class="wide">
          <label>Dokumen Pendukung</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="form-control form-control-sm" @change="file=$event.target.files[0] || null">
        </div>
      </div>

      <button class="btn btn-primary btn-sm mt-2" :disabled="saving" @click="submit">
        {{ saving ? 'Menyimpan...' : 'Ajukan Koreksi' }}
      </button>
    </div>

    <div class="table-card">
      <div class="table-head">
        <div>
          <h6>Pengajuan Saya</h6>
          <small class="text-muted">Pegawai hanya dapat melihat status pengajuan sendiri.</small>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th><th>Jenis</th><th>Jam</th><th>Status</th><th>Alasan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id">
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ item.jenis_koreksi || '-' }}</td>
              <td>{{ formatTime(item.jam_koreksi) }}</td>
              <td><span class="status-badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></td>
              <td>{{ item.alasan || '-' }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="5" class="text-center text-muted">Belum ada pengajuan.</td>
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
              <th>Tanggal</th><th>NIP</th><th>Nama</th><th>Jabatan</th><th>Divisi</th>
              <th>Jenis</th><th>Jam</th><th>Alasan</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in approvalRows" :key="item.id">
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ item.pegawai?.nip || '-' }}</td>
              <td>{{ item.pegawai?.nama || '-' }}</td>
              <td>{{ item.pegawai?.jabatan || '-' }}</td>
              <td>{{ item.pegawai?.departemen || item.pegawai?.unit_kerja || '-' }}</td>
              <td>{{ item.jenis_koreksi || '-' }}</td>
              <td>{{ formatTime(item.jam_koreksi) }}</td>
              <td>{{ item.alasan || '-' }}</td>
              <td><span class="status-badge pending">Menunggu Approval</span></td>
              <td class="text-nowrap">
                <button class="btn btn-sm btn-success me-1" @click="approve(item, 'approved')">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="approve(item, 'rejected')">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
            <tr v-if="approvalRows.length === 0">
              <td colspan="10" class="text-center text-muted">Tidak ada pengajuan yang menunggu persetujuan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </template>

</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import KoreksiKehadiranPwa from './components/KoreksiKehadiranPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const rows = ref([])
const approvalRows = ref([])
const canApprove = ref(false)
const loading = ref(false)
const saving = ref(false)
const file = ref(null)

const form = reactive({
  tanggal: '',
  jenis_koreksi: 'Masuk',
  jam_koreksi: '',
  jenis_cuti_izin: '',
  alasan: ''
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
  if (!value) return '-'

  const raw = String(value).trim()
  // Format tampilan jam menjadi HH:mm, tanpa detik.
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`

  return raw
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
    const response = await api.get('/kehadiran/koreksi')
    const data = response.data?.data || {}

    rows.value = data.data || []
    approvalRows.value = data.approval_requests || []
    canApprove.value = Boolean(data.can_approve)
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat data koreksi.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  saving.value = true

  try {
    const formData = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value || '')
    })

    if (file.value) {
      formData.append('dokumen', file.value)
    }

    const response = await api.post('/kehadiran/koreksi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire(
      'Berhasil',
      response.data?.message || 'Pengajuan koreksi berhasil dibuat.',
      'success'
    )

    Object.assign(form, {
      tanggal: '',
      jenis_koreksi: 'Masuk',
      jam_koreksi: '',
      jenis_cuti_izin: '',
      alasan: ''
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
    title: status === 'approved' ? 'Setujui koreksi?' : 'Tolak koreksi?',
    text: 'Tindakan ini akan mengubah status pengajuan.',
    showCancelButton: true,
    confirmButtonText: status === 'approved' ? 'Setujui' : 'Tolak',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/kehadiran/koreksi/${item.id}/approval`, { status })

    await Swal.fire(
      'Berhasil',
      status === 'approved'
        ? 'Koreksi berhasil disetujui.'
        : 'Koreksi berhasil ditolak.',
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

onMounted(loadData)
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
