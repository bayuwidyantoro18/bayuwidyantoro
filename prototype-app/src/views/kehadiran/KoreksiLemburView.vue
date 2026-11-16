<template>
  <div class="page-wrap">
    <div class="page-head">
      <div>
        <h3>Koreksi Lembur</h3>
        <p>Ajukan perubahan jam atau pembatalan lembur yang sudah disetujui pada bulan berjalan. Perubahan berlaku setelah approval.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" :disabled="loading || saving" @click="load">
        {{ loading ? 'Memuat...' : 'Refresh' }}
      </button>
    </div>

    <div class="card form-card">
      <div class="row g-3">
        <div class="col-md-6">
          <label for="lembur-id">Lembur yang akan dikoreksi <span class="required">*</span></label>
          <select
            id="lembur-id"
            v-model="form.lembur_id"
            class="form-select form-select-sm"
            :disabled="loading || saving || !approved.length"
            @change="clearTimeFields"
          >
            <option value="">Pilih Lembur</option>
            <option v-for="x in approved" :key="x.id" :value="String(x.id)">
              {{ formatOvertimeOption(x) }}
            </option>
          </select>
          <small v-if="!loading && !approved.length" class="empty-note">
            Tidak ada pengajuan lembur yang disetujui pada bulan berjalan.
          </small>
        </div>

        <div class="col-md-3">
          <label for="jenis-tindakan">Tindakan <span class="required">*</span></label>
          <select
            id="jenis-tindakan"
            v-model="form.jenis_tindakan"
            class="form-select form-select-sm"
            :disabled="saving"
            @change="clearTimeFields"
          >
            <option value="Ubah">Ubah</option>
            <option value="Batal">Batal</option>
          </select>
        </div>

        <div v-if="form.jenis_tindakan === 'Ubah'" class="col-md-3">
          <label for="jam-mulai-baru">Jam Mulai Aktual <span class="required">*</span></label>
          <input
            id="jam-mulai-baru"
            v-model="form.jam_mulai_baru"
            type="time"
            step="60"
            class="form-control form-control-sm"
            :disabled="saving || !form.lembur_id"
            required
          >
        </div>

        <div v-if="form.jenis_tindakan === 'Ubah'" class="col-md-3">
          <label for="jam-selesai-baru">Jam Selesai Aktual <span class="required">*</span></label>
          <input
            id="jam-selesai-baru"
            v-model="form.jam_selesai_baru"
            type="time"
            step="60"
            class="form-control form-control-sm"
            :disabled="saving || !form.lembur_id"
            required
          >
        </div>

        <div class="col-12">
          <label for="alasan-koreksi">Alasan <span class="required">*</span></label>
          <textarea
            id="alasan-koreksi"
            v-model.trim="form.alasan"
            rows="3"
            maxlength="2000"
            class="form-control form-control-sm"
            placeholder="Jelaskan alasan perubahan atau pembatalan lembur..."
            :disabled="saving"
          ></textarea>
        </div>
      </div>

      <div class="notice mt-3">
        <strong>Ketentuan:</strong> hanya lembur berstatus Disetujui pada bulan berjalan yang dapat dikoreksi. Koreksi masuk ke menu Persetujuan. Data lembur awal tidak berubah jika koreksi ditolak.
      </div>

      <button
        class="btn btn-primary btn-sm mt-3"
        :disabled="saving || loading || !approved.length"
        @click="submit"
      >
        {{ saving ? 'Mengirim...' : 'Ajukan Koreksi' }}
      </button>
    </div>

    <div class="card mt-3">
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead>
            <tr>
              <th>Tanggal Lembur</th>
              <th>Tindakan</th>
              <th>Jam Lama</th>
              <th>Jam Baru</th>
              <th>Total Lama</th>
              <th>Total Baru</th>
              <th>Alasan</th>
              <th>Status</th>
              <th>Catatan Approval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in rows" :key="x.id">
              <td>{{ formatDateDMY(x.lembur?.tanggal || x.tanggal) }}</td>
              <td>{{ x.jenis_tindakan || '-' }}</td>
              <td>{{ formatTime(x.jam_mulai_lama) }} - {{ formatTime(x.jam_selesai_lama) }}</td>
              <td>
                {{ x.jenis_tindakan === 'Batal'
                  ? '— (pembatalan)'
                  : `${formatTime(x.jam_mulai_baru)} - ${formatTime(x.jam_selesai_baru)}` }}
              </td>
              <td>{{ formatDuration(x.total_menit_lama) }}</td>
              <td>{{ x.jenis_tindakan === 'Batal' ? '-' : formatDuration(x.total_menit_baru) }}</td>
              <td>{{ x.alasan || '-' }}</td>
              <td>
                <span :class="['status-pill', statusClass(x.status)]">{{ x.status || '-' }}</span>
              </td>
              <td>{{ x.catatan_approval || '-' }}</td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="9" class="text-center text-muted py-3">Belum ada pengajuan koreksi lembur.</td>
            </tr>
            <tr v-if="loading">
              <td colspan="9" class="text-center text-muted py-3">Memuat data...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

const rows = ref([])
const approved = ref([])
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  lembur_id: '',
  jenis_tindakan: 'Ubah',
  jam_mulai_baru: '',
  jam_selesai_baru: '',
  alasan: '',
})

function resetForm() {
  Object.assign(form, {
    lembur_id: '',
    jenis_tindakan: 'Ubah',
    jam_mulai_baru: '',
    jam_selesai_baru: '',
    alasan: '',
  })
}

function clearTimeFields() {
  form.jam_mulai_baru = ''
  form.jam_selesai_baru = ''
}

function formatTime(value) {
  if (value === null || value === undefined || value === '') return '-'
  const raw = String(value).trim()
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : raw
}

function formatDateDMY(value) {
  if (!value) return '-'
  const raw = String(value).trim()
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnly) return `${dateOnly[3]}-${dateOnly[2]}-${dateOnly[1]}`

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date)
  const part = (type) => parts.find((x) => x.type === type)?.value || ''
  return `${part('day')}-${part('month')}-${part('year')}`
}

function currentMonthKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((x) => x.type === 'year')?.value
  const month = parts.find((x) => x.type === 'month')?.value
  return `${year}-${month}`
}

function isCurrentMonth(value) {
  if (!value) return false
  const match = String(value).match(/^(\d{4})-(\d{2})/)
  return Boolean(match && `${match[1]}-${match[2]}` === currentMonthKey())
}

function formatOvertimeOption(item) {
  const date = formatDateDMY(item.tanggal)
  const start = formatTime(item.jam_mulai)
  const end = formatTime(item.jam_selesai)
  const duration = item.total_jam ?? (
    Number.isFinite(Number(item.total_menit)) ? (Number(item.total_menit) / 60).toFixed(2) : ''
  )
  const durationLabel = duration !== '' && duration !== null ? ` (${duration} jam)` : ''
  return `${date} — ${start} s/d ${end}${durationLabel}`
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes === '') return '-'
  const value = Number(minutes)
  if (!Number.isFinite(value)) return '-'
  const hours = Math.floor(value / 60)
  const remainder = value % 60
  return remainder ? `${hours} jam ${remainder} menit` : `${hours} jam`
}

function statusClass(status) {
  if (status === 'Disetujui' || status === 'Approved') return 'success'
  if (status === 'Ditolak' || status === 'Rejected') return 'danger'
  return 'pending'
}

function unwrapBody(response) {
  let body = response?.data ?? response
  // Axios interceptor pada aplikasi ini dapat mengembalikan body API langsung.
  for (let i = 0; i < 3; i += 1) {
    if (body && !Array.isArray(body) && body.data && !Array.isArray(body.data)
      && !('lembur_approved' in body) && !('current_page' in body)) {
      body = body.data
    } else {
      break
    }
  }
  return body || {}
}

async function load() {
  loading.value = true
  try {
    const response = await api.get('/kehadiran/lembur/koreksi')
    const body = unwrapBody(response)

    const pagination = body?.data
    const correctionRows = Array.isArray(pagination)
      ? pagination
      : Array.isArray(pagination?.data)
        ? pagination.data
        : Array.isArray(body?.items)
          ? body.items
          : []

    rows.value = correctionRows

    const approvedList = Array.isArray(body?.lembur_approved)
      ? body.lembur_approved
      : Array.isArray(response?.data?.lembur_approved)
        ? response.data.lembur_approved
        : []

    // Filter UI sebagai lapisan tambahan; backend tetap wajib memvalidasi bulan berjalan.
    approved.value = approvedList.filter((item) =>
      ['Disetujui', 'Approved'].includes(item.status) && isCurrentMonth(item.tanggal),
    )
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat data koreksi lembur.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!form.lembur_id) {
    return Swal.fire('Perhatian', 'Pilih pengajuan lembur yang sudah disetujui pada bulan berjalan.', 'warning')
  }

  if (form.jenis_tindakan === 'Ubah') {
    if (!form.jam_mulai_baru || !form.jam_selesai_baru) {
      return Swal.fire('Perhatian', 'Jam mulai dan jam selesai aktual wajib diisi.', 'warning')
    }
    if (form.jam_selesai_baru <= form.jam_mulai_baru) {
      return Swal.fire('Perhatian', 'Jam selesai harus setelah jam mulai.', 'warning')
    }
  }

  if (!form.alasan.trim()) {
    return Swal.fire('Perhatian', 'Alasan koreksi wajib diisi.', 'warning')
  }

  const confirmation = await Swal.fire({
    title: 'Ajukan koreksi lembur?',
    text: 'Perubahan atau pembatalan hanya dijalankan setelah disetujui approver.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, ajukan',
    cancelButtonText: 'Periksa lagi',
  })
  if (!confirmation.isConfirmed) return

  saving.value = true
  try {
    await api.post('/kehadiran/lembur/koreksi', {
      lembur_id: Number(form.lembur_id),
      jenis_tindakan: form.jenis_tindakan,
      jam_mulai_baru: form.jenis_tindakan === 'Ubah' ? form.jam_mulai_baru : null,
      jam_selesai_baru: form.jenis_tindakan === 'Ubah' ? form.jam_selesai_baru : null,
      alasan: form.alasan.trim(),
    })
    await Swal.fire('Berhasil', 'Pengajuan koreksi lembur dikirim dan menunggu approval.', 'success')
    resetForm()
    await load()
  } catch (error) {
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors).flat()[0] : null
    await Swal.fire(
      'Gagal',
      firstError || error.response?.data?.message || 'Koreksi lembur gagal diajukan.',
      'error',
    )
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-wrap { padding: 0; }
.page-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.page-head h3 { margin: 0; font-weight: 800; }
.page-head p { margin: 2px 0; color: #64748b; font-size: 12px; }
label { display: block; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
.required { color: #dc2626; }
.form-card { padding: 14px; }
.empty-note { display: block; color: #b45309; font-weight: 700; margin-top: 5px; }
.notice { padding: 9px 11px; border-radius: 8px; background: #eff6ff; color: #1e40af; font-size: 12px; }
.status-pill { display: inline-block; border-radius: 20px; padding: 3px 8px; font-size: 10px; font-weight: 700; }
.status-pill.success { background: #dcfce7; color: #166534; }
.status-pill.danger { background: #fee2e2; color: #991b1b; }
.status-pill.pending { background: #fef3c7; color: #92400e; }
</style>
