<template>
  <div class="page-wrap">
    <div class="page-head">
      <div>
        <h3>Persetujuan</h3>
        <p>Kelola seluruh pengajuan kehadiran yang menunggu persetujuan.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" @click="load">Refresh</button>
    </div>

    <div class="tabs">
      <button
        v-for="x in filters"
        :key="x.key"
        :class="['tab', filter === x.key ? 'active' : '']"
        @click="filter = x.key; load()"
      >
        {{ x.label }} <span>{{ counts[x.key] || 0 }}</span>
      </button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Pegawai</th>
              <th>Detail</th>
              <th>Dokumen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in items" :key="x.type + '-' + x.id">
              <td>{{ formatTanggal(x.tanggal) }}</td>
              <td>{{ x.type_label }}</td>
              <td>
                <b>{{ x.pegawai?.nama || '-' }}</b>
                <small class="d-block text-muted">{{ x.pegawai?.nip || '-' }}</small>
              </td>
              <td>{{ detail(x) }}</td>
              <td>
                <button
                  v-if="x.dokumen_url"
                  class="btn btn-sm btn-outline-secondary"
                  @click="openDocument(x)"
                >
                  Buka
                </button>
                <span v-else>-</span>
              </td>
              <td>
                <button class="btn btn-sm btn-success me-1" @click="action(x, 'approved')">
                  Setujui
                </button>
                <button class="btn btn-sm btn-danger" @click="action(x, 'rejected')">
                  Tolak
                </button>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="6" class="text-center text-muted">
                Tidak ada pengajuan menunggu persetujuan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

const filter = ref('all')
const items = ref([])
const counts = ref({})

const filters = [
  { key: 'all', label: 'Semua' },
  { key: 'cuti-izin', label: 'Cuti & Izin' },
  { key: 'koreksi', label: 'Koreksi Kehadiran' },
  { key: 'lembur', label: 'Lembur' },
  { key: 'cuti-koreksi', label: 'Koreksi Cuti' },
  { key: 'lembur-koreksi', label: 'Koreksi Lembur' },
]

/**
 * Memformat tanggal untuk tampilan dd-mm-yyyy.
 * Tanggal YYYY-MM-DD diproses tanpa konversi zona waktu.
 * Timestamp ISO/UTC dikonversi ke zona waktu Asia/Jakarta.
 */
function formatTanggal(value) {
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

function detail(x) {
  if (x.type === 'cuti-izin') {
    return `${x.kategori} — ${x.jenis} (${x.jumlah_hari} hari)`
  }

  if (x.type === 'koreksi') {
    return `${x.jenis_koreksi || '-'} — ${x.jam_koreksi || '-'}`
  }

  if (x.type === 'lembur') {
    return `${x.jam_mulai || '-'} - ${x.jam_selesai || '-'} (${x.total_jam || 0} jam) | Keterangan: ${x.keterangan || '-'}`
  }

  if (x.type === 'cuti-koreksi') {
    const lama = `${formatTanggal(x.tanggal_mulai_lama)} s/d ${formatTanggal(x.tanggal_selesai_lama)}`
    const baru = x.jenis_tindakan === 'Batal'
      ? 'Pembatalan'
      : `${formatTanggal(x.tanggal_mulai_baru)} s/d ${formatTanggal(x.tanggal_selesai_baru)}`

    return `${x.jenis_tindakan || '-'} | Lama: ${lama} | Baru: ${baru} | ${x.keterangan || '-'}`
  }

  if (x.type === 'lembur-koreksi') {
    return `${x.jenis_tindakan || '-'}: ${x.jam_mulai_lama || '-'}-${x.jam_selesai_lama || '-'} → ${x.jam_mulai_baru || '-'}-${x.jam_selesai_baru || '-'}`
  }

  return '-'
}

async function load() {
  try {
    const response = await api.get('/kehadiran/persetujuan', {
      params: { type: filter.value },
    })

    items.value = response.data?.data?.items || []
    counts.value = response.data?.data?.filters || {}
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat persetujuan.',
      'error',
    )
  }
}

async function action(x, status) {
  const result = await Swal.fire({
    title: status === 'approved' ? 'Setujui pengajuan?' : 'Tolak pengajuan?',
    input: 'textarea',
    inputLabel: 'Catatan (opsional)',
    showCancelButton: true,
    confirmButtonText: status === 'approved' ? 'Setujui' : 'Tolak',
  })

  if (!result.isConfirmed) return

  try {
    await api.post(`/kehadiran/persetujuan/${x.type}/${x.id}`, {
      status,
      catatan_approval: result.value || null,
    })

    await Swal.fire(
      'Berhasil',
      status === 'approved' ? 'Pengajuan disetujui.' : 'Pengajuan ditolak.',
      'success',
    )

    await load()
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Proses approval gagal.',
      'error',
    )
  }
}

async function openDocument(x) {
  try {
    const response = await api.get(x.dokumen_url, { responseType: 'blob' })
    const url = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      }),
    )

    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (error) {
    await Swal.fire(
      'Gagal Membuka Dokumen',
      error.response?.data?.message || error.message,
      'error',
    )
  }
}

onMounted(load)
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-head h3 {
  margin: 0;
  font-weight: 800;
}

.page-head p {
  margin: 2px 0;
  color: #64748b;
  font-size: 12px;
}

.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tab {
  border: 1px solid #dbe2ea;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
}

.tab.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.tab span {
  margin-left: 4px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

small {
  font-size: 10px;
}
</style>
