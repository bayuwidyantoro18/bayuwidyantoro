<template>
  <div class="container-fluid riwayat-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">Riwayat Reservasi & Perjalanan</h3>
        <p class="page-subtitle">
          Riwayat perubahan, approval, pembatalan, dan aktivitas perjalanan driver.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-outline-primary btn-compact"
        :disabled="loading"
        @click="loadData(pagination.current_page)"
      >
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="card compact-card mb-3">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-filter"></i>
          <span>Filter Data</span>
        </div>

        <button type="button" class="btn btn-sm btn-outline-secondary btn-compact" @click="resetFilter">
          Reset
        </button>
      </div>

      <div class="compact-card-body">
        <div class="row g-2 align-items-end">
          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Aksi</label>
            <select v-model="filter.aksi" class="form-select form-select-sm compact-input">
              <option v-for="option in actionOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Mulai</label>
            <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm compact-input">
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="compact-label">Tanggal Selesai</label>
            <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm compact-input">
          </div>

          <div class="col-lg-4 col-md-6">
            <label class="compact-label">Keyword</label>
            <input
              v-model="filter.keyword"
              type="text"
              class="form-control form-control-sm compact-input"
              placeholder="Kode, user, deskripsi..."
              @keyup.enter="loadData(1)"
            >
          </div>

          <div class="col-lg-2 col-md-12">
            <button class="btn btn-sm btn-primary w-100 btn-search" @click="loadData(1)">
              Tampilkan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="compact-card-header">
        <div class="header-title">
          <i class="fas fa-clock-rotate-left"></i>
          <span>Data Riwayat</span>
        </div>

        <small>{{ pagination.total || 0 }} data</small>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="compact-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>Memuat riwayat...</span>
        </div>

        <div v-else-if="list.length === 0" class="compact-empty">
          Belum ada data riwayat.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 compact-table">
            <thead>
              <tr>
                <th style="width: 135px;">Waktu</th>
                <th style="width: 105px;">Aksi</th>
                <th style="min-width: 165px;">Kode Reservasi</th>
                <th style="min-width: 210px;">Deskripsi</th>
                <th style="min-width: 140px;">User</th>
                <th style="min-width: 190px;">Perubahan</th>
                <th style="width: 80px;">Detail</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td>{{ formatDateTime(item.created_at) }}</td>

                <td>
                  <span class="badge status-badge" :class="actionClass(item.aksi)">
                    {{ actionLabel(item.aksi) }}
                  </span>
                </td>

                <td>
                  <strong>{{ item.kode_reservasi || '-' }}</strong>
                </td>

                <td class="text-truncate-cell">
                  {{ item.deskripsi || '-' }}
                </td>

                <td>
                  {{ item.nama_user || '-' }}
                  <br>
                  <small class="text-muted">{{ item.role_user || item.username_user || '-' }}</small>
                </td>

                <td class="text-truncate-cell">
                  {{ compactChanges(item.changes) }}
                </td>

                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary action-btn"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationCompact
          :pagination="pagination"
          :loading="loading"
          @change-page="loadData"
        />
      </div>
    </div>

    <div v-if="detailModal" class="modal-backdrop-custom">
      <div class="detail-modal">
        <div class="modal-head">
          <div>
            <h6 class="mb-0 fw-bold">Detail Riwayat</h6>
            <small class="text-muted">{{ selected?.kode_reservasi }}</small>
          </div>

          <button type="button" class="btn-close" @click="closeDetail"></button>
        </div>

        <div class="modal-body-custom">
          <div class="detail-grid">
            <div><span>Waktu</span><strong>{{ formatDateTime(selected?.created_at) }}</strong></div>
            <div><span>Aksi</span><strong>{{ actionLabel(selected?.aksi) }}</strong></div>
            <div><span>User</span><strong>{{ selected?.nama_user || '-' }}</strong></div>
            <div><span>Username</span><strong>{{ selected?.username_user || '-' }}</strong></div>
            <div><span>Role</span><strong>{{ selected?.role_user || '-' }}</strong></div>
            <div>
              <span>Lokasi</span>
              <strong>
                <a v-if="selected?.maps_url" :href="selected.maps_url" target="_blank">
                  Lihat Maps
                </a>
                <template v-else>-</template>
              </strong>
            </div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Deskripsi</label>
            <div class="description-box">{{ selected?.deskripsi || '-' }}</div>
          </div>

          <div class="mt-3">
            <label class="compact-label">Detail Perubahan</label>

            <div v-if="changeItems(selected?.changes).length === 0" class="description-box">
              Tidak ada perubahan detail.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm table-bordered change-table mb-0">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Sebelum</th>
                    <th>Sesudah</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="change in changeItems(selected?.changes)" :key="change.field">
                    <td>{{ change.label }}</td>
                    <td>{{ change.before }}</td>
                    <td>{{ change.after }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-secondary" @click="closeDetail">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PaginationCompact from '../../../components/PaginationCompact.vue'

defineProps({
  loading: Boolean,
  list: { type: Array, default: () => [] },
  filter: { type: Object, required: true },
  pagination: { type: Object, required: true },
  detailModal: Boolean,
  selected: { type: Object, default: null },
  actionOptions: { type: Array, default: () => [] },
  actionLabel: { type: Function, required: true },
  actionClass: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  compactChanges: { type: Function, required: true },
  changeItems: { type: Function, required: true },
  formatValue: { type: Function, required: true },
  loadData: { type: Function, required: true },
  resetFilter: { type: Function, required: true },
  openDetail: { type: Function, required: true },
  closeDetail: { type: Function, required: true }
})
</script>

<style scoped>
.riwayat-page {
  padding-top: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 2px;
}

.page-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 0;
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
}

.compact-card-header {
  min-height: 38px;
  padding: 7px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compact-card-body {
  padding: 10px 12px;
  background: #ffffff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 900;
}

.btn-compact,
.btn-search {
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 7px;
  padding: 4px 9px;
}

.compact-label {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 3px;
}

.compact-input {
  font-size: 12px;
  min-height: 29px;
  border-radius: 7px;
}

.compact-table {
  font-size: 12px;
}

.compact-table thead th {
  background: #f8fafc;
  color: #111827;
  font-size: 11.5px;
  font-weight: 900;
  border-bottom: 1px solid #d1d5db;
  padding: 7px 8px;
}

.compact-table tbody td {
  padding: 7px 8px;
}

.compact-loading,
.compact-empty {
  min-height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.status-badge {
  font-size: 10.5px;
  border-radius: 999px;
  padding: 4px 7px;
}

.action-btn {
  width: 28px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-truncate-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 2050;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}

.detail-modal {
  width: min(860px, 100%);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1rem 2.8rem rgba(0, 0, 0, 0.24);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-head,
.modal-foot {
  padding: 12px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-foot {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
  justify-content: flex-end;
}

.modal-body-custom {
  padding: 12px 14px;
  overflow-y: auto;
  background: #f8fafc;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid div,
.description-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 8px;
}

.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 800;
}

.detail-grid strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  word-break: break-word;
}

.description-box {
  font-size: 12px;
}

.change-table {
  font-size: 11.5px;
  background: #ffffff;
}

.raw-details {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  overflow: hidden;
}

.raw-details summary {
  cursor: pointer;
  padding: 8px 10px;
  font-size: 11.5px;
  font-weight: 900;
  color: #374151;
  background: #f8fafc;
}

.json-box {
  background: #111827;
  color: #f8fafc;
  padding: 10px;
  margin: 0;
  max-height: 220px;
  overflow: auto;
  font-size: 11px;
}
</style>