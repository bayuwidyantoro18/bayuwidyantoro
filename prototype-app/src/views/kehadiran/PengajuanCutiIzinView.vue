<template>
    <PengajuanCutiIzinPwa
      v-if="isPwa"
      :rows="rows"
      :approval-rows="approvalRows"
      :jenis-options="jenisOptions"
      :balance="balance"
      :form="form"
      :saving="saving"
      :loading="loading"
      :can-approve="canApprove"
      :kadiv-options="kadivOptions"
      :loading-kadiv="loadingKadiv"
      :format-date="formatDate"
      :status-label="statusLabel"
      :status-class="statusClass"
      :submit="submit"
      :approve="approve"
      @file-change="file = $event"
    />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <h3>Pengajuan Cuti & Izin</h3>
        <p>Ajukan cuti/izin dan pantau status persetujuan.</p>
      </div>
      <button
        class="btn btn-sm btn-outline-primary"
        :disabled="loading"
        @click="loadData"
      >
        <i class="fas fa-sync-alt me-1"></i> Refresh
      </button>
    </div>

    <div class="summary-grid">
      <div class="mini"><span>Hak Cuti</span><strong>{{ balance.hak_cuti_tahunan || 0 }}</strong></div>
      <div class="mini"><span>Sisa Cuti</span><strong>{{ balance.sisa_cuti || 0 }}</strong></div>
      <div class="mini"><span>Rencana</span><strong>{{ balance.cuti_rencana || 0 }}</strong></div>
      <div class="mini"><span>Hangus</span><strong>{{ balance.cuti_hangus || 0 }}</strong></div>
    </div>

    <div class="form-card">
      <div class="grid">
        <div>
          <label>Kategori</label>
          <select v-model="form.kategori" class="form-select form-select-sm">
            <option value="Cuti">Cuti</option>
            <option value="Izin">Izin</option>
          </select>
        </div>

        <div>
          <label>Jenis</label>
          <select
            v-model="form.jenis"
            class="form-select form-select-sm"
          >
            <option value="">Pilih Jenis</option>

            <option
              v-for="jenis in (jenisOptions[form.kategori] || [])"
              :key="jenis"
              :value="jenis"
            >
              {{ jenis }}
            </option>
          </select>
        </div>

        <div>
          <label>Tanggal Mulai</label>
          <input v-model="form.tanggal_mulai" type="date" class="form-control form-control-sm">
        </div>

        <div>
          <label>Tanggal Selesai</label>
          <input v-model="form.tanggal_selesai" type="date" class="form-control form-control-sm">
        </div>

        <div class="wide">
          <label>Kepala Divisi Approval <span class="text-danger">*</span></label>

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
            Pilih Kepala Divisi yang akan menerima pengajuan Cuti/Izin.
          </small>

          <small
            v-if="!loadingKadiv && kadivOptions.length === 0"
            class="text-danger d-block"
          >
            Daftar Kadiv belum tersedia. Silakan refresh halaman.
          </small>
        </div>

        <div>
          <label>Dokumen</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            class="form-control form-control-sm"
            @change="file = $event.target.files[0] || null"
          >
        </div>

        <div class="wide">
          <label>Keperluan</label>
          <textarea
            v-model="form.keperluan"
            class="form-control form-control-sm"
            rows="2"
            placeholder="Keperluan"
          ></textarea>
        </div>
      </div>

      <button
        class="btn btn-primary btn-sm mt-2"
        :disabled="saving || loadingKadiv || kadivOptions.length === 0"
        @click="submit"
      >
        {{ saving ? 'Menyimpan...' : 'Simpan Pengajuan' }}
      </button>
    </div>

    <div class="table-card">
      <div class="table-head">
        <h6>Pengajuan Saya</h6>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Jenis</th>
              <th>Hari</th>
              <th>Status</th>
              <th>Keterangan Approval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id">
              <td>{{ formatDate(item.tanggal_mulai) }} s.d {{ formatDate(item.tanggal_selesai) }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.jenis }}</td>
              <td>{{ item.jumlah_hari }}</td>
              <td>
                <span class="status" :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td>{{ item.keterangan_approval || '-' }}</td>
            </tr>
            <tr v-if="!rows.length">
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
          <small>Semua request berstatus Menunggu Approval dapat diproses oleh role yang berwenang.</small>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>NIP</th>
              <th>Pegawai</th>
              <th>Kategori</th>
              <th>Jenis</th>
              <th>Keperluan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in approvalRows" :key="item.id">
              <td>{{ formatDate(item.tanggal_mulai) }}</td>
              <td>{{ item.pegawai?.nip || '-' }}</td>
              <td>{{ item.pegawai?.nama || '-' }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.jenis }}</td>
              <td>{{ item.keperluan }}</td>
              <td><span class="status pending">Menunggu Approval</span></td>
              <td class="text-nowrap">
                <button class="btn btn-sm btn-success me-1" @click="approve(item, 'approved')">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="approve(item, 'rejected')">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!approvalRows.length">
              <td colspan="8" class="text-center text-muted">
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
import { onMounted, reactive, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import PengajuanCutiIzinPwa from './components/PengajuanCutiIzinPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const rows = ref([])
const approvalRows = ref([])
const jenisOptions = ref([])
const balance = ref({})
const file = ref(null)
const saving = ref(false)
const loading = ref(false)
const canApprove = ref(false)
const kadivOptions = ref([])
const loadingKadiv = ref(false)

const form = reactive({
  kategori: 'Cuti',
  jenis: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  keperluan: '',
  kadiv_id: '',
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

const loadKadiv = async () => {
  loadingKadiv.value = true

  try {
    const response = await api.get('/kehadiran/cuti-izin/approvers')
    const data = response.data?.data || []

    kadivOptions.value = Array.isArray(data) ? data : []

    // Kosongkan pilihan lama jika tidak lagi tersedia.
    if (
      form.kadiv_id &&
      !kadivOptions.value.some(
        item => String(item.user_id) === String(form.kadiv_id)
      )
    ) {
      form.kadiv_id = ''
    }
  } catch (error) {
    kadivOptions.value = []

    await Swal.fire(
      'Gagal',
      error.response?.data?.message ||
        'Gagal memuat daftar Kepala Divisi.',
      'error'
    )
  } finally {
    loadingKadiv.value = false
  }
}

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/cuti-izin')
    const data = response.data?.data || {}

    rows.value = data.data || []
    approvalRows.value = data.approval_requests || []
    canApprove.value = Boolean(data.can_approve)
    balance.value = response.data?.balance || {}
    jenisOptions.value = response.data?.jenis_options || []
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat data cuti/izin.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (loadingKadiv.value) {
    await Swal.fire(
      'Perhatian',
      'Mohon tunggu sampai daftar Kepala Divisi selesai dimuat.',
      'warning'
    )
    return
  }

  if (!form.kadiv_id) {
    await Swal.fire(
      'Perhatian',
      'Silakan pilih Kepala Divisi yang akan melakukan approval.',
      'warning'
    )
    return
  }

  if (
    !kadivOptions.value.some(
      item => String(item.user_id) === String(form.kadiv_id)
    )
  ) {
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

    const response = await api.post('/kehadiran/cuti-izin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire(
      'Berhasil',
      response.data?.message || 'Pengajuan berhasil dibuat.',
      'success'
    )

  Object.assign(form, {
    kategori: 'Cuti',
    jenis: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    keperluan: '',
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
    title: status === 'approved'
      ? 'Setujui pengajuan?'
      : 'Tolak pengajuan?',
    text: 'Tindakan ini akan mengubah status pengajuan.',
    showCancelButton: true,
    confirmButtonText: status === 'approved' ? 'Setujui' : 'Tolak',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/kehadiran/cuti-izin/${item.id}/approval`, { status })

    await Swal.fire(
      'Berhasil',
      status === 'approved'
        ? 'Pengajuan berhasil disetujui.'
        : 'Pengajuan berhasil ditolak.',
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


watch(() => form.kategori, () => {
  form.jenis = ''
})

onMounted(() => {
  loadData()
  loadKadiv()
})
</script>

<style scoped>
.kehadiran-page{padding:10px;background:#f4f7fb;min-height:100vh}
.page-head,.table-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}
.page-head h3,.table-head h6{margin:0;font-weight:950}
.page-head p,.table-head small{margin:2px 0 0;color:#64748b;font-size:12px}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
.mini{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px}.mini span{display:block;font-size:11px;color:#64748b}.mini strong{font-size:20px}
.form-card,.table-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:11px;margin-bottom:10px;box-shadow:0 .25rem .8rem rgba(15,23,42,.05)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.wide{grid-column:span 2}
label{display:block;font-size:12px;font-weight:800;color:#475569;margin-bottom:4px}
.approval-info{margin-top:9px;padding:8px 10px;border-radius:8px;background:#eff6ff;color:#1e40af;font-size:11px}
.table{font-size:12px}.table th{white-space:nowrap;background:#f8fafc}
.status{display:inline-flex;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800;background:#e2e8f0}
.status.pending{background:#fef3c7;color:#92400e}.status.approved{background:#dcfce7;color:#166534}.status.rejected{background:#fee2e2;color:#991b1b}
@media(max-width:768px){.summary-grid{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.wide{grid-column:span 1}}
</style>
