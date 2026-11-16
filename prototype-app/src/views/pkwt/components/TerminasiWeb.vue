<template>
  <div class="container-fluid terminasi-web">
    <div class="page-head">
      <div>
        <div class="page-kicker">Kontrak Pegawai</div>
        <h3 class="page-title">Terminasi</h3>
        <p class="page-subtitle">
          Data pegawai yang sudah nonaktif, berakhir kontrak, resign, pensiun, atau selesai penugasan.
        </p>
      </div>

      <button type="button" class="btn btn-sm btn-outline-primary action-btn" :disabled="loading" @click="$emit('load-data')">
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card danger">
        <span>Total Terminasi</span>
        <strong>{{ summary.total }}</strong>
        <i class="fas fa-user-slash"></i>
      </div>

      <div class="summary-card primary">
        <span>Internal</span>
        <strong>{{ summary.internal }}</strong>
        <i class="fas fa-id-badge"></i>
      </div>

      <div class="summary-card info">
        <span>Penugasan</span>
        <strong>{{ summary.penugasan }}</strong>
        <i class="fas fa-briefcase"></i>
      </div>

      <div class="summary-card warning">
        <span>Berakhir Kontrak</span>
        <strong>{{ summary.berakhirKontrak }}</strong>
        <i class="fas fa-file-circle-xmark"></i>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            :value="filter.keyword"
            type="text"
            placeholder="Cari NIP, nama, jabatan, unit kerja, alasan..."
            @input="$emit('update-filter', { field: 'keyword', value: $event.target.value })"
          >
        </div>

        <select
          :value="filter.kategori_pegawai"
          class="form-select form-select-sm"
          @change="$emit('update-filter', { field: 'kategori_pegawai', value: $event.target.value })"
        >
          <option value="">Semua Kategori</option>
          <option value="Pegawai Internal">Pegawai Internal</option>
          <option value="Pegawai Penugasan">Pegawai Penugasan</option>
        </select>

        <select
          :value="filter.alasan_terminasi"
          class="form-select form-select-sm"
          @change="$emit('update-filter', { field: 'alasan_terminasi', value: $event.target.value })"
        >
          <option value="">Semua Alasan</option>
          <option value="Berakhir Kontrak">Berakhir Kontrak</option>
          <option value="Resign">Resign</option>
          <option value="Mengundurkan Diri">Mengundurkan Diri</option>
          <option value="Pensiun">Pensiun</option>
          <option value="Selesai Penugasan">Selesai Penugasan</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <input
          :value="filter.tanggal_dari"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal terminasi dari"
          @input="$emit('update-filter', { field: 'tanggal_dari', value: $event.target.value })"
        >

        <input
          :value="filter.tanggal_sampai"
          type="date"
          class="form-control form-control-sm"
          title="Tanggal terminasi sampai"
          @input="$emit('update-filter', { field: 'tanggal_sampai', value: $event.target.value })"
        >

        <button type="button" class="btn btn-sm btn-light" @click="$emit('reset-filter')">
          Reset
        </button>
      </div>
    </div>

    <div class="card terminasi-card">
      <div class="card-head">
        <div>
          <h6>Daftar Terminasi</h6>
          <small>Menampilkan {{ filteredPegawais.length }} dari {{ pegawais.length }} data terminasi</small>
        </div>

        <span>Halaman {{ currentPage }} dari {{ totalPages || 1 }}</span>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Memuat data terminasi...</span>
      </div>

      <div v-else-if="filteredPegawais.length === 0" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <strong>Data terminasi tidak ditemukan</strong>
        <span>Data pegawai nonaktif akan tampil di sini.</span>
      </div>

      <div v-else class="table-responsive terminasi-table-wrapper">
        <table class="table table-sm table-hover align-middle mb-0 terminasi-table">
          <thead>
            <tr>
              <th style="width: 55px;">No</th>
              <th style="width: 120px;">NIP</th>
              <th>Nama Pegawai</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Kategori</th>
              <th style="width: 130px;">Tanggal</th>
              <th style="width: 155px;">Alasan</th>
              <th>Keterangan</th>
              <th style="width: 92px;" class="text-end">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(pegawai, index) in paginatedPegawais" :key="pegawai.id">
              <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>

              <td>
                <strong>{{ pegawai.nip || '-' }}</strong>
                <small>{{ pegawai.nik || '-' }}</small>
              </td>

              <td>
                <strong>{{ pegawai.nama || '-' }}</strong>
                <small>{{ pegawai.jenis_kelamin || '-' }} · {{ pegawai.usia ? pegawai.usia + ' tahun' : '-' }}</small>
              </td>

              <td>{{ pegawai.jabatan || '-' }}</td>

              <td>
                <strong>{{ pegawai.unit_kerja || '-' }}</strong>
                <small>{{ pegawai.departemen || '-' }}</small>
              </td>

              <td>
                <span class="category-pill">{{ pegawai.kategori_pegawai || '-' }}</span>
              </td>

              <td>{{ formatDate(pegawai.tanggal_terminasi) }}</td>

              <td>
                <span class="reason-pill">{{ pegawai.alasan_terminasi || '-' }}</span>
              </td>

              <td>
                <span class="note-text">{{ pegawai.keterangan_terminasi || '-' }}</span>
              </td>

              <td class="text-end">
                <button type="button" class="detail-btn" @click="$emit('open-detail', pegawai)">
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination-row">
        <button type="button" :disabled="currentPage === 1" @click="$emit('change-page', 1)">
          <i class="fas fa-angles-left"></i>
        </button>

        <button type="button" :disabled="currentPage === 1" @click="$emit('change-page', currentPage - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in paginationPages"
          :key="page"
          type="button"
          :disabled="page === '...'"
          :class="{ active: currentPage === page }"
          @click="page !== '...' && $emit('change-page', page)"
        >
          {{ page }}
        </button>

        <button type="button" :disabled="currentPage === totalPages" @click="$emit('change-page', currentPage + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>

        <button type="button" :disabled="currentPage === totalPages" @click="$emit('change-page', totalPages)">
          <i class="fas fa-angles-right"></i>
        </button>
      </div>
    </div>

    <div v-if="detailModal" class="detail-layer">
      <div class="detail-modal">
        <div class="detail-head">
          <div>
            <h6>Detail Terminasi</h6>
            <small>{{ selectedPegawai?.nip || '-' }}</small>
          </div>

          <button type="button" @click="$emit('close-detail')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-grid">
            <div class="detail-mini">
              <span>Nama</span>
              <strong>{{ selectedPegawai?.nama || '-' }}</strong>
            </div>

            <div class="detail-mini">
              <span>Kategori</span>
              <strong>{{ selectedPegawai?.kategori_pegawai || '-' }}</strong>
            </div>

            <div class="detail-mini">
              <span>Jabatan</span>
              <strong>{{ selectedPegawai?.jabatan || '-' }}</strong>
            </div>

            <div class="detail-mini">
              <span>Unit Kerja</span>
              <strong>{{ selectedPegawai?.unit_kerja || '-' }}</strong>
            </div>

            <div class="detail-mini">
              <span>Tanggal Masuk</span>
              <strong>{{ formatDate(selectedPegawai?.tanggal_masuk) }}</strong>
            </div>

            <div class="detail-mini">
              <span>Tanggal Terminasi</span>
              <strong>{{ formatDate(selectedPegawai?.tanggal_terminasi) }}</strong>
            </div>

            <div class="detail-mini">
              <span>Alasan Terminasi</span>
              <strong>{{ selectedPegawai?.alasan_terminasi || '-' }}</strong>
            </div>

            <div class="detail-mini full">
              <span>Keterangan Terminasi</span>
              <strong>{{ selectedPegawai?.keterangan_terminasi || '-' }}</strong>
            </div>
          </div>
        </div>

        <div class="detail-foot">
          <button type="button" class="btn btn-sm btn-secondary" @click="$emit('close-detail')">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  pegawais: { type: Array, default: () => [] },
  filteredPegawais: { type: Array, default: () => [] },
  paginatedPegawais: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  currentPage: Number,
  perPage: Number,
  totalPages: Number,
  paginationPages: { type: Array, default: () => [] },
  selectedPegawai: { type: Object, default: null },
  detailModal: Boolean,
  summary: { type: Object, required: true },
  formatDate: { type: Function, required: true }
})

defineEmits([
  'load-data',
  'update-filter',
  'reset-filter',
  'change-page',
  'open-detail',
  'close-detail'
])
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.page-kicker {
  font-size: 10.5px;
  font-weight: 900;
  color: #dc2626;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.page-title {
  font-size: 22px;
  font-weight: 950;
  color: #111827;
  margin: 0 0 3px;
}

.page-subtitle {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  margin: 0;
}

.action-btn {
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  padding: 6px 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.summary-card {
  position: relative;
  min-height: 88px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #2563eb;
  border-radius: 15px;
  padding: 12px;
  overflow: hidden;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.summary-card.danger { border-left-color: #dc2626; }
.summary-card.primary { border-left-color: #2563eb; }
.summary-card.info { border-left-color: #0284c7; }
.summary-card.warning { border-left-color: #f59e0b; }

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 900;
}

.summary-card strong {
  display: block;
  margin-top: 5px;
  color: #111827;
  font-size: 24px;
  font-weight: 950;
}

.summary-card i {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #e2e8f0;
  font-size: 31px;
}

.filter-card,
.terminasi-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  box-shadow: 0 .22rem .7rem rgba(15, 23, 42, .045);
}

.filter-card {
  padding: 10px;
  margin-bottom: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 170px 190px 145px 145px 74px;
  gap: 8px;
  align-items: center;
}

.search-box {
  height: 32px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  border-radius: 9px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box i {
  color: #94a3b8;
  font-size: 12px;
}

.search-box input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.form-control-sm,
.form-select-sm {
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}

.terminasi-card {
  overflow: visible;
}

.card-head {
  min-height: 45px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-head h6 {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.card-head small,
.card-head span {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.state-box,
.empty-state {
  min-height: 240px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  flex-direction: column;
  text-align: center;
}

.empty-state i {
  font-size: 24px;
  color: #94a3b8;
}

.empty-state strong {
  color: #111827;
  font-size: 13px;
  font-weight: 950;
}

.terminasi-table-wrapper {
  min-height: 320px;
  padding-bottom: 90px;
  overflow-x: auto;
  overflow-y: visible;
}

.terminasi-table {
  min-width: 1220px;
  font-size: 12px;
}

.terminasi-table th,
.terminasi-table td {
  white-space: nowrap;
  vertical-align: middle;
}

.terminasi-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 950;
  border-bottom: 1px solid #d1d5db;
  padding: 8px;
}

.terminasi-table tbody td {
  padding: 8px;
}

.terminasi-table strong {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.terminasi-table small,
.note-text {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-pill,
.reason-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10.5px;
  font-weight: 900;
}

.category-pill {
  background: #eef2ff;
  color: #4f46e5;
}

.reason-pill {
  background: #fee2e2;
  color: #dc2626;
}

.detail-btn {
  border: 0;
  border-radius: 9px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
  padding: 7px 10px;
}

.pagination-row {
  min-height: 42px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px 12px;
}

.pagination-row button {
  min-width: 28px;
  height: 27px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  color: #475569;
  font-size: 11px;
  font-weight: 850;
}

.pagination-row button.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pagination-row button:disabled {
  opacity: .45;
}

.detail-layer {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(15, 23, 42, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.detail-modal {
  width: min(820px, 96vw);
  max-height: 90vh;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 56px rgba(15, 23, 42, .18);
}

.detail-head,
.detail-foot {
  padding: 13px 15px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-foot {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
  justify-content: flex-end;
}

.detail-head h6 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.detail-head small {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.detail-head button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 11px;
  background: #f1f5f9;
  color: #475569;
}

.detail-body {
  padding: 14px;
  background: #f8fafc;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.detail-mini {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 13px;
  padding: 10px;
}

.detail-mini.full {
  grid-column: 1 / -1;
}

.detail-mini span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 850;
  margin-bottom: 3px;
}

.detail-mini strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  font-weight: 900;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
