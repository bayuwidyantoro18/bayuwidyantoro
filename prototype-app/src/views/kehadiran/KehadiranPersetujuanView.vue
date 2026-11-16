<template>
    <KehadiranPersetujuanPwa
    v-if="isPwa"
    :loading="loading" :items="items" :counts="counts" :format-date="formatDate" :load-data="loadData" :process="process"
  />

  <template v-else-if="isWeb">
<div class="kehadiran-page">
    <div class="page-head">
      <div>
        <div class="eyebrow">MANAJEMEN KEHADIRAN</div>
        <h3>Persetujuan</h3>
        <p>Kelola seluruh pengajuan kehadiran yang menunggu persetujuan.</p>
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

    <div class="summary-grid">
      <div class="summary-card">
        <span>Total Menunggu</span>
        <strong>{{ counts.all }}</strong>
      </div>
      <div class="summary-card">
        <span>Cuti & Izin</span>
        <strong>{{ counts['cuti-izin'] }}</strong>
      </div>
      <div class="summary-card">
        <span>Koreksi</span>
        <strong>{{ counts.koreksi }}</strong>
      </div>
      <div class="summary-card">
        <span>Lembur</span>
        <strong>{{ counts.lembur }}</strong>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="filter-group">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="filter-btn"
          :class="{ active: activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >
          {{ tab.label }}
          <span>{{ counts[tab.key] || 0 }}</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-head">
        <div>
          <h6>Pengajuan Menunggu Persetujuan</h6>
          <small>
            Approval dilakukan oleh user yang memiliki kewenangan pada Role & Hak Akses.
          </small>
        </div>
        <span class="pending-count">{{ filteredItems.length }} pengajuan</span>
      </div>

      <div v-if="loading" class="empty-state">
        <i class="fas fa-spinner fa-spin"></i>
        Memuat pengajuan...
      </div>

      <div v-else-if="!filteredItems.length" class="empty-state">
        <i class="fas fa-circle-check"></i>
        Tidak ada pengajuan yang menunggu persetujuan.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th>No</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th>NIP</th>
              <th>Pegawai</th>
              <th>Detail</th>
              <th>Keperluan</th>
              <th>Dokumen</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in filteredItems" :key="`${item.type}-${item.id}`">
              <td>{{ index + 1 }}</td>

              <td>
                <span class="type-badge" :class="`type-${item.type}`">
                  {{ item.type_label }}
                </span>
              </td>

              <td class="text-nowrap">
                {{ formatDate(item.tanggal) }}
                <template v-if="item.tanggal_selesai">
                  <br>
                  <small class="text-muted">s.d {{ formatDate(item.tanggal_selesai) }}</small>
                </template>
              </td>

              <td>{{ item.pegawai?.nip || '-' }}</td>

              <td>
                <strong>{{ item.pegawai?.nama || '-' }}</strong>
                <small class="d-block text-muted">
                  {{ item.pegawai?.jabatan || '-' }}
                </small>
              </td>

              <td>
                <template v-if="item.type === 'cuti-izin'">
                  {{ item.kategori }} — {{ item.jenis }}
                  <small class="d-block text-muted">
                    {{ item.jumlah_hari || 0 }} hari
                  </small>
                </template>

                <template v-else-if="item.type === 'koreksi'">
                  {{ item.jenis_koreksi || '-' }}
                  <small v-if="item.jam_koreksi" class="d-block text-muted">
                    Jam {{ item.jam_koreksi }}
                  </small>
                </template>

                <template v-else>
                  {{ item.jam_mulai || '-' }} - {{ item.jam_selesai || '-' }}
                  <small class="d-block text-muted">
                    {{ formatTotalJam(item.total_jam) }}
                  </small>
                </template>
              </td>

              <td class="reason-cell">
                {{ item.keperluan || '-' }}
              </td>

              <td class="text-center attachment-cell">
                <button
                  v-if="item.dokumen_url"
                  type="button"
                  class="attachment-btn"
                  title="Lihat lampiran"
                  :disabled="documentLoadingKey === `${item.type}-${item.id}`"
                  @click="openDocument(item)"
                >
                  <i
                    class="fas"
                    :class="documentLoadingKey === `${item.type}-${item.id}`
                      ? 'fa-spinner fa-spin'
                      : 'fa-paperclip'"
                  ></i>
                  <span>{{ documentLoadingKey === `${item.type}-${item.id}` ? 'Membuka...' : 'Lihat' }}</span>
                </button>

                <span v-else class="no-attachment">
                  <i class="fas fa-minus"></i>
                </span>
              </td>

              <td class="text-center action-cell">
                  <div class="approval-actions">
                      <button
                          type="button"
                          class="approval-btn approval-btn-success"
                          title="Setujui pengajuan"
                          @click="process(item, 'approved')"
                      >
                          <i class="fas fa-check"></i>
                          <span>Setujui</span>
                      </button>

                      <button
                          type="button"
                          class="approval-btn approval-btn-danger"
                          title="Tolak pengajuan"
                          @click="process(item, 'rejected')"
                      >
                          <i class="fas fa-times"></i>
                          <span>Tolak</span>
                      </button>
                  </div>
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
import { htmlText } from "../../demo/escape.js"
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '../../services/api'

import { usePwaMode } from '../../composables/usePwaMode'
import KehadiranPersetujuanPwa from './components/KehadiranPersetujuanPwa.vue'
const { isPwa, isWeb } = usePwaMode()

const loading = ref(false)
const items = ref([])
const counts = ref({
  all: 0,
  'cuti-izin': 0,
  koreksi: 0,
  lembur: 0,
})
const activeFilter = ref('all')
const processingKey = ref('')
const documentLoadingKey = ref('')

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'cuti-izin', label: 'Cuti & Izin' },
  { key: 'koreksi', label: 'Koreksi' },
  { key: 'lembur', label: 'Lembur' },
]

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return items.value
  return items.value.filter((item) => item.type === activeFilter.value)
})

const formatDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

const formatTotalJam = (value) => {
  const hours = Number(value || 0)
  return `${hours.toFixed(2)} jam`
}

const actionKey = (item, status) => `${item.type}-${item.id}-${status}`

const openDocument = async (item) => {
  if (!item?.dokumen_url) return

  const key = `${item.type}-${item.id}`
  documentLoadingKey.value = key

  // Buka tab/window terlebih dahulu agar browser tidak memblokir
  // navigasi setelah request Axios selesai.
  const previewWindow = window.open('', '_blank')

  if (!previewWindow) {
    documentLoadingKey.value = ''
    await Swal.fire(
      'Preview Tidak Dapat Dibuka',
      'Izinkan pop-up pada browser untuk membuka dokumen.',
      'warning',
    )
    return
  }

  previewWindow.document.write(`
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Memuat Dokumen...</title>
        <style>
          html,body{margin:0;width:100%;height:100%;background:#f8fafc;font-family:Arial,sans-serif}
          .loading{height:100%;display:flex;align-items:center;justify-content:center;color:#475569;font-size:14px}
        </style>
      </head>
      <body><div class="loading">Memuat dokumen...</div></body>
    </html>
  `)
  previewWindow.document.close()

  try {
    const response = await api.get(item.dokumen_url, {
      responseType: 'blob',
    })

    const contentType = response.headers?.['content-type'] || 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })

    if (!blob.size) {
      throw new Error('Dokumen kosong atau tidak tersedia.')
    }

    const blobUrl = URL.createObjectURL(blob)
    previewWindow.location.href = blobUrl

    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 60 * 1000)
  } catch (error) {
    console.error('Gagal membuka dokumen persetujuan:', error)
    previewWindow.close()

    await Swal.fire(
      'Gagal Membuka Dokumen',
      error.response?.data?.message ||
        error.message ||
        'Dokumen tidak dapat dibuka.',
      'error',
    )
  } finally {
    documentLoadingKey.value = ''
  }
}

const loadData = async () => {
  loading.value = true

  try {
    const response = await api.get('/kehadiran/persetujuan')
    const data = response.data?.data || {}

    items.value = Array.isArray(data.items) ? data.items : []
    counts.value = {
      all: Number(data.filters?.all || 0),
      'cuti-izin': Number(data.filters?.['cuti-izin'] || 0),
      koreksi: Number(data.filters?.koreksi || 0),
      lembur: Number(data.filters?.lembur || 0),
    }
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memuat pengajuan persetujuan.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

const process = async (item, status) => {
  const approved = status === 'approved'

  const confirmation = await Swal.fire({
    icon: approved ? 'question' : 'warning',
    title: approved ? 'Setujui pengajuan?' : 'Tolak pengajuan?',
    html: `
      <div style="font-size:13px;text-align:left">
        <strong>${item.type_label}</strong><br>
        ${htmlText(item.pegawai?.nama || '-')}<br>
        ${htmlText(item.keperluan || '-')}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: approved ? 'Setujui' : 'Tolak',
    cancelButtonText: 'Batal',
    input: 'textarea',
    inputPlaceholder: approved
      ? 'Catatan approval (opsional)'
      : 'Alasan penolakan (opsional)',
  })

  if (!confirmation.isConfirmed) return

  processingKey.value = actionKey(item, status)

  try {
    await api.post(
      `/kehadiran/persetujuan/${item.type}/${item.id}`,
      {
        status,
        catatan_approval: confirmation.value || '',
      },
    )

    await Swal.fire(
      'Berhasil',
      approved
        ? 'Pengajuan berhasil disetujui.'
        : 'Pengajuan berhasil ditolak.',
      'success',
    )

    await loadData()
  } catch (error) {
    await Swal.fire(
      'Gagal',
      error.response?.data?.message || 'Gagal memproses persetujuan.',
      'error',
    )
  } finally {
    processingKey.value = ''
  }
}

onMounted(loadData)
</script>

<style scoped>
.action-cell {
    width: 160px;
    min-width: 160px;
    position: sticky;
    right: 0;
    background: #fff;
    z-index: 2;
}

.table thead th:last-child {
    position: sticky;
    right: 0;
    z-index: 3;
    background: #f8fafc;
}

.approval-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.approval-btn {
    height: 34px;
    min-width: 76px;
    padding: 0 10px;
    border-radius: 7px;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
    transition:
        background-color .15s ease,
        border-color .15s ease,
        transform .15s ease,
        box-shadow .15s ease;
}

.approval-btn i {
    font-size: 11px;
}

.approval-btn:hover {
    transform: translateY(-1px);
}

.approval-btn:active {
    transform: translateY(0);
}

.approval-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
    transform: none;
}

/* Setujui */
.approval-btn-success {
    background: #198754;
    border-color: #198754;
    color: #fff;
}

.approval-btn-success:hover {
    background: #157347;
    border-color: #146c43;
    box-shadow: 0 3px 8px rgba(25, 135, 84, .18);
}

/* Tolak */
.approval-btn-danger {
    background: #fff;
    border-color: #dc3545;
    color: #dc3545;
}

.approval-btn-danger:hover {
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;
    box-shadow: 0 3px 8px rgba(220, 53, 69, .15);
}

.attachment-cell {
    width: 78px;
    min-width: 78px;
    text-align: center;
    vertical-align: middle;
}

.attachment-btn {
    height: 34px;
    min-width: 68px;
    padding: 0 9px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    background: #fff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 800;
    text-decoration: none;
    transition:
        background-color .15s ease,
        border-color .15s ease,
        color .15s ease,
        transform .15s ease,
        box-shadow .15s ease;
}

.attachment-btn i {
    font-size: 12px;
}

.attachment-btn:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(15, 23, 42, .08);
}

.no-attachment {
    color: #94a3b8;
    font-size: 12px;
}

.kehadiran-page {
  padding: 12px;
  background: #f4f7fb;
  min-height: 100vh;
}

.page-head,
.table-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 900;
  color: #64748b;
  letter-spacing: .08em;
}

.page-head h3,
.table-head h6 {
  margin: 0;
  font-weight: 950;
}

.page-head p,
.table-head small {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.summary-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
}

.summary-card span {
  font-size: 10px;
  color: #64748b;
}

.summary-card strong {
  display: block;
  margin-top: 2px;
  font-size: 22px;
}

.toolbar-card,
.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 11px;
  margin-bottom: 10px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  border: 1px solid #dbe3ef;
  background: #fff;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
}

.filter-btn span {
  margin-left: 4px;
  opacity: .7;
}

.filter-btn.active {
  background: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.pending-count {
  font-size: 11px;
  color: #64748b;
}

.table {
  font-size: 11px;
}

.table th {
  white-space: nowrap;
  background: #f8fafc;
}

.reason-cell {
  min-width: 220px;
  max-width: 320px;
  white-space: normal;
}

.type-badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 900;
  white-space: nowrap;
}

.type-cuti-izin {
  background: #fff7ed;
  color: #9a3412;
}

.type-koreksi {
  background: #eff6ff;
  color: #1d4ed8;
}

.type-lembur {
  background: #ecfdf5;
  color: #047857;
}

.empty-state {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-direction: column;
  color: #64748b;
  font-size: 12px;
}

@media (max-width: 768px) {
    .action-cell {
        width: 86px;
        min-width: 86px;
    }

    .approval-btn {
        min-width: 34px;
        width: 34px;
        padding: 0;
    }

    .approval-btn span {
        display: none;
    }

    .approval-actions {
        gap: 4px;
    }
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-head,
  .table-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
    .attachment-cell {
        width: 42px;
        min-width: 42px;
    }

    .attachment-btn {
        width: 34px;
        min-width: 34px;
        padding: 0;
    }

    .attachment-btn span {
        display: none;
    }
}
</style>
