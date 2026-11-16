<template>
  <div class="page-wrap">
    <div class="page-head">
      <div>
        <h3>Koreksi Cuti &amp; Izin</h3>
        <p>Ajukan perubahan jadwal atau pembatalan cuti/izin yang sudah disetujui. Perubahan hanya berlaku setelah approval.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" :disabled="loading" @click="load">
        {{ loading ? 'Memuat...' : 'Refresh' }}
      </button>
    </div>

    <div class="card form-card">
      <div class="row g-3">
        <div class="col-md-6">
          <label for="cuti-id">Cuti/Izin yang akan dikoreksi <span class="required">*</span></label>
          <select
            id="cuti-id"
            v-model="form.cuti_id"
            class="form-select form-select-sm"
            :disabled="!approvedLeaves.length || saving"
          >
            <option value="">Pilih Cuti/Izin</option>
            <option v-for="x in approvedLeaves" :key="x.id" :value="String(x.id)">
              {{ formatLeaveOption(x) }}
            </option>
          </select>
          <small v-if="!loading && !approvedLeaves.length" class="empty-note">
            Belum ada Cuti yang diajukan
          </small>
        </div>

        <div class="col-md-3">
          <label for="tindakan">Tindakan <span class="required">*</span></label>
          <select id="tindakan" v-model="form.jenis_tindakan" class="form-select form-select-sm" :disabled="saving">
            <option value="Ubah">Ubah</option>
            <option value="Batal">Batal</option>
          </select>
        </div>

        <div v-if="form.jenis_tindakan === 'Ubah'" class="col-md-3">
          <label for="mulai-baru">Tanggal Mulai Baru <span class="required">*</span></label>
          <input
            id="mulai-baru"
            v-model="form.tanggal_mulai_baru"
            type="date"
            class="form-control form-control-sm"
            :disabled="saving"
            @change="validateDateRange"
          >
        </div>

        <div v-if="form.jenis_tindakan === 'Ubah'" class="col-md-3">
          <label for="selesai-baru">Tanggal Selesai Baru <span class="required">*</span></label>
          <input
            id="selesai-baru"
            v-model="form.tanggal_selesai_baru"
            type="date"
            class="form-control form-control-sm"
            :min="form.tanggal_mulai_baru || undefined"
            :disabled="saving || !form.tanggal_mulai_baru"
            @change="validateDateRange"
          >
        </div>

        <div class="col-12">
          <label for="keterangan">Keterangan <span class="required">*</span></label>
          <textarea
            id="keterangan"
            v-model.trim="form.keterangan"
            rows="3"
            maxlength="2000"
            class="form-control form-control-sm"
            placeholder="Jelaskan alasan perubahan atau pembatalan cuti/izin..."
            :disabled="saving"
          ></textarea>
        </div>
      </div>

      <div class="notice mt-3">
        <strong>Alur:</strong> pengajuan akan masuk ke menu Persetujuan. Jadwal atau pembatalan cuti/izin baru diproses setelah disetujui. Jika ditolak, data pengajuan awal tidak berubah.
      </div>

      <button
        class="btn btn-primary btn-sm mt-3"
        :disabled="saving || loading || !approvedLeaves.length"
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
              <th>Tindakan</th>
              <th>Cuti/Izin Lama</th>
              <th>Cuti/Izin Baru</th>
              <th>Hari</th>
              <th>Keterangan</th>
              <th>Status</th>
              <th>Catatan Approval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in rows" :key="x.id">
              <td>{{ x.jenis_tindakan }}</td>
              <td>{{ formatRange(x.tanggal_mulai_lama, x.tanggal_selesai_lama) }}</td>
              <td>
                {{ x.jenis_tindakan === 'Batal'
                  ? '— (pembatalan)'
                  : formatRange(x.tanggal_mulai_baru, x.tanggal_selesai_baru) }}
              </td>
              <td>
                {{ x.jumlah_hari_lama }}
                <template v-if="x.jenis_tindakan === 'Ubah'">→ {{ x.jumlah_hari_baru }}</template>
              </td>
              <td>{{ x.keterangan }}</td>
              <td>
                <span :class="['status-pill', statusClass(x.status)]">{{ x.status }}</span>
              </td>
              <td>{{ x.catatan_approval || '-' }}</td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="7" class="text-center text-muted py-3">Belum ada pengajuan koreksi.</td>
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
const approvedLeaves = ref([])
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  cuti_id: '',
  jenis_tindakan: 'Ubah',
  tanggal_mulai_baru: '',
  tanggal_selesai_baru: '',
  keterangan: '',
})

function resetForm() {
  Object.assign(form, {
    cuti_id: '',
    jenis_tindakan: 'Ubah',
    tanggal_mulai_baru: '',
    tanggal_selesai_baru: '',
    keterangan: '',
  })
}

/**
 * Format tampilan tanggal menjadi dd-mm-yyyy.
 * Untuk tanggal YYYY-MM-DD, hindari parsing Date agar tidak bergeser zona waktu.
 * Untuk timestamp ISO, gunakan tanggal lokal Indonesia (Asia/Jakarta).
 */
function formatDateDMY(value) {
  if (!value) return '-'

  const raw = String(value).trim()
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (dateOnly) {
    return `${dateOnly[3]}-${dateOnly[2]}-${dateOnly[1]}`
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date)

  const getPart = (type) => parts.find((part) => part.type === type)?.value || ''
  return `${getPart('day')}-${getPart('month')}-${getPart('year')}`
}

function formatLeaveOption(item) {
  const start = formatDateDMY(item.tanggal_mulai)
  const end = formatDateDMY(item.tanggal_selesai)
  const dateLabel = start === end ? start : `${start} s/d ${end}`
  const category = String(item.kategori || 'Cuti').trim()
  const type = String(item.jenis || '').trim()
  const days = item.jumlah_hari ?? item.total_hari ?? ''
  const daysLabel = days !== '' && days !== null ? ` (${days}Hari)` : ''
  return `${dateLabel} - ${category} : ${type}${daysLabel}`
}

function validateDateRange() {
  if (
    form.tanggal_mulai_baru &&
    form.tanggal_selesai_baru &&
    form.tanggal_selesai_baru < form.tanggal_mulai_baru
  ) {
    form.tanggal_selesai_baru = ''
  }
}

function formatRange(start, end) {
  return start && end
    ? `${formatDateDMY(start)} s/d ${formatDateDMY(end)}`
    : '-'
}

function statusClass(status) {
  if (status === 'Disetujui') return 'success'
  if (status === 'Ditolak') return 'danger'
  return 'pending'
}

async function load() {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/cuti-izin/koreksi')

    // Mendukung respons API standar maupun respons yang telah dibuka interceptor.
    const body = response?.data ?? response
    const candidates = [
      body,
      body?.data,
      body?.data?.data,
      response,
      response?.data,
      response?.data?.data,
    ].filter(Boolean)

    const findArray = (key) => {
      for (const candidate of candidates) {
        if (Array.isArray(candidate?.[key])) return candidate[key]
      }
      return []
    }

    const items = findArray('items')
    rows.value = items.length ? items : findArray('data')
    approvedLeaves.value = findArray('cuti_approved')
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat daftar cuti/izin dan koreksi.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!form.cuti_id) {
    return Swal.fire('Perhatian', 'Pilih cuti/izin yang sudah disetujui.', 'warning')
  }

  if (form.jenis_tindakan === 'Ubah') {
    if (!form.tanggal_mulai_baru || !form.tanggal_selesai_baru) {
      return Swal.fire('Perhatian', 'Tanggal mulai dan tanggal selesai baru wajib diisi.', 'warning')
    }

    if (form.tanggal_selesai_baru < form.tanggal_mulai_baru) {
      return Swal.fire('Perhatian', 'Tanggal selesai tidak boleh sebelum tanggal mulai.', 'warning')
    }
  }

  if (!form.keterangan.trim()) {
    return Swal.fire('Perhatian', 'Keterangan wajib diisi.', 'warning')
  }

  const confirmation = await Swal.fire({
    title: 'Ajukan koreksi cuti/izin?',
    text: 'Perubahan baru akan dijalankan setelah disetujui approver.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, ajukan',
    cancelButtonText: 'Periksa lagi',
  })

  if (!confirmation.isConfirmed) return

  saving.value = true

  try {
    await api.post('/kehadiran/cuti-izin/koreksi', { ...form })
    await Swal.fire('Berhasil', 'Pengajuan koreksi dikirim dan menunggu approval.', 'success')
    resetForm()
    await load()
  } catch (error) {
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors).flat()[0] : null

    await Swal.fire(
      'Gagal',
      firstError || error.response?.data?.message || 'Koreksi gagal diajukan.',
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
