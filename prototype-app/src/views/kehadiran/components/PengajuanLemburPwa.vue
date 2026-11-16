
<template>
  <div class="attendance-pwa">
    <!-- Header -->
    <PwaPageHeader
      icon="fas fa-business-time"
      title="Pengajuan Lembur"
      subtitle="Ajukan lembur dan pantau approval"
    />

    <!-- Informasi jadwal -->
    <section v-if="schedule" class="schedule">
      <div class="schedule-icon">
        <i class="fas fa-clock"></i>
      </div>

      <div class="schedule-content">
        <strong>{{ schedule.nama_shift || 'Normal' }}</strong>
        <span>
          Lembur mulai minimal pukul
          {{ schedule.lembur_mulai || '-' }}
        </span>
      </div>
    </section>

    <!-- Form pengajuan -->
    <section class="card form-card">
      <div class="section-heading">
        <div class="heading-icon">
          <i class="fas fa-file-signature"></i>
        </div>

        <div>
          <h6>Pengajuan Baru</h6>
          <p>Lengkapi data lembur Anda.</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- Tanggal -->
        <div class="form-group">
          <label for="lembur-tanggal">
            Tanggal Lembur <span class="required">*</span>
          </label>

          <input
            id="lembur-tanggal"
            v-model="form.tanggal"
            type="date"
            class="form-control"
            :disabled="saving"
            required
          />
        </div>

        <!-- Jam mulai -->
        <div class="form-group">
          <label for="lembur-mulai">
            Jam Mulai <span class="required">*</span>
          </label>

          <input
            id="lembur-mulai"
            v-model="form.jam_mulai"
            type="time"
            class="form-control"
            :disabled="saving"
            required
          />
        </div>

        <!-- Jam selesai -->
        <div class="form-group">
          <label for="lembur-selesai">
            Jam Selesai <span class="required">*</span>
          </label>

          <input
            id="lembur-selesai"
            v-model="form.jam_selesai"
            type="time"
            class="form-control"
            :disabled="saving"
            required
          />
        </div>

        <!-- Kepala Divisi -->
        <div class="form-group full-width">
          <label for="lembur-kadiv">
            Kepala Divisi Approval
            <span class="required">*</span>
          </label>

          <select
            id="lembur-kadiv"
            v-model="form.kadiv_id"
            class="form-control"
            :disabled="loadingKadiv || saving"
            required
          >
            <option value="">
              {{
                loadingKadiv
                  ? 'Memuat daftar Kepala Divisi...'
                  : '-- Pilih Kepala Divisi --'
              }}
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

          <small v-if="loadingKadiv" class="field-help">
            <i class="fas fa-spinner fa-spin"></i>
            Memuat daftar Kepala Divisi...
          </small>

          <small
            v-else-if="kadivOptions.length === 0"
            class="field-error"
          >
            <i class="fas fa-exclamation-circle"></i>
            Daftar Kepala Divisi belum tersedia. Silakan refresh halaman
            atau hubungi administrator.
          </small>

          <small v-else class="field-help">
            Pilih Kepala Divisi yang akan menerima pengajuan lembur Anda.
          </small>
        </div>

        <!-- Dokumen -->
        <div class="form-group full-width">
          <label for="lembur-dokumen">
            Dokumen Pendukung <span class="required">*</span>
          </label>

          <input
            id="lembur-dokumen"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            class="form-control file-input"
            :disabled="saving"
            @change="handleFileChange"
            required
          />

          <small class="field-help">
            Format PDF, JPG, JPEG, PNG, atau WEBP. Maksimal 5 MB.
          </small>
        </div>

        <!-- Keterangan -->
        <div class="form-group full-width">
          <label for="lembur-keterangan">
            Keterangan <span class="required">*</span>
          </label>

          <textarea
            id="lembur-keterangan"
            v-model="form.keterangan"
            class="form-control"
            rows="3"
            maxlength="2000"
            placeholder="Jelaskan alasan dan pekerjaan lembur..."
            :disabled="saving"
            required
          ></textarea>

          <small class="field-help character-count">
            {{ (form.keterangan || '').length }}/2000 karakter
          </small>
        </div>

        <!-- Tombol submit -->
        <div class="full-width">
          <button
            type="button"
            class="btn-submit"
            :disabled="saving || loadingKadiv || kadivOptions.length === 0"
            @click="submit"
          >
            <i
              :class="saving
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-paper-plane'"
            ></i>

            {{ saving ? 'Menyimpan Pengajuan...' : 'Ajukan Lembur' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Daftar pengajuan milik pegawai -->
    <section class="card">
      <div class="section-heading">
        <div class="heading-icon blue">
          <i class="fas fa-history"></i>
        </div>

        <div class="heading-title">
          <h6>Pengajuan Saya</h6>
          <p>Riwayat pengajuan lembur Anda.</p>
        </div>

        <span class="count-badge">{{ rows.length }}</span>
      </div>

      <div v-if="loading && rows.length === 0" class="empty-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Memuat data pengajuan...</span>
      </div>

      <div v-else-if="rows.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <strong>Belum ada pengajuan</strong>
        <span>Pengajuan lembur Anda akan muncul di sini.</span>
      </div>

      <div v-else class="request-list">
        <article
          v-for="item in rows"
          :key="item.id"
          class="request-item"
        >
          <div class="request-top">
            <div class="request-date">
              <strong>{{ formatDate(item.tanggal) }}</strong>

              <span>
                <i class="far fa-clock"></i>
                {{ formatTime(item.jam_mulai) }}
                –
                {{ formatTime(item.jam_selesai) }}
              </span>
            </div>

            <span
              class="status-badge"
              :class="statusClass(item.status)"
            >
              {{ statusLabel(item.status) }}
            </span>
          </div>

          <div class="request-details">
            <span class="duration">
              <i class="fas fa-hourglass-half"></i>
              {{ formatHours(item.total_jam) }}
            </span>

            <p>{{ item.keterangan || '-' }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Daftar pengajuan yang menunggu approval -->
    <section v-if="canApprove" class="card">
      <div class="section-heading">
        <div class="heading-icon orange">
          <i class="fas fa-user-check"></i>
        </div>

        <div class="heading-title">
          <h6>Menunggu Persetujuan</h6>
          <p>Pengajuan yang perlu Anda tinjau.</p>
        </div>

        <span class="count-badge pending-count">
          {{ approvalRows.length }}
        </span>
      </div>

      <div v-if="approvalRows.length === 0" class="empty-state">
        <i class="fas fa-check-circle"></i>
        <strong>Tidak ada pengajuan menunggu</strong>
        <span>Semua pengajuan sudah ditangani.</span>
      </div>

      <div v-else class="request-list">
        <article
          v-for="item in approvalRows"
          :key="item.id"
          class="request-item approval-item"
        >
          <div class="employee-info">
            <div class="employee-avatar">
              <i class="fas fa-user"></i>
            </div>

            <div class="employee-details">
              <strong>{{ item.pegawai?.nama || '-' }}</strong>
              <span>NIP: {{ item.pegawai?.nip || '-' }}</span>
            </div>

            <span class="status-badge pending">
              Menunggu
            </span>
          </div>

          <div class="approval-info">
            <strong>{{ formatDate(item.tanggal) }}</strong>

            <span>
              {{ formatTime(item.jam_mulai) }}
              –
              {{ formatTime(item.jam_selesai) }}
              ·
              {{ formatHours(item.total_jam) }}
            </span>

            <p>{{ item.keterangan || '-' }}</p>
          </div>

          <div class="approval-actions">
            <button
              type="button"
              class="btn-approve"
              @click="approve(item, 'approved')"
            >
              <i class="fas fa-check"></i>
              Setujui
            </button>

            <button
              type="button"
              class="btn-reject"
              @click="approve(item, 'rejected')"
            >
              <i class="fas fa-times"></i>
              Tolak
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue';

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  approvalRows: {
    type: Array,
    default: () => [],
  },
  canApprove: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  loadingKadiv: {
    type: Boolean,
    default: false,
  },
  kadivOptions: {
    type: Array,
    default: () => [],
  },
  schedule: {
    type: Object,
    default: null,
  },
  form: {
    type: Object,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
  formatTime: {
    type: Function,
    required: true,
  },
  formatHours: {
    type: Function,
    required: true,
  },
  statusLabel: {
    type: Function,
    required: true,
  },
  statusClass: {
    type: Function,
    required: true,
  },
  submit: {
    type: Function,
    required: true,
  },
  approve: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['file-change']);

function handleFileChange(event) {
  const selectedFile = event.target.files?.[0] || null;

  emit('file-change', selectedFile);
}
</script>

<style scoped>
.attendance-pwa {
  padding: 2px 0 90px;
  color: #1e293b;
}

.schedule,
.card {
  margin-bottom: 14px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.045);
}

.schedule {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f3ff;
  border-color: #e4ddff;
}

.schedule-icon,
.heading-icon {
  display: flex;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 16px;
}

.schedule-content {
  min-width: 0;
}

.schedule-content strong,
.schedule-content span {
  display: block;
}

.schedule-content strong {
  color: #5b21b6;
  font-size: 13px;
  font-weight: 800;
}

.schedule-content span {
  margin-top: 4px;
  color: #6b7280;
  font-size: 11px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 16px;
}

.heading-icon {
  flex-basis: 38px;
  width: 38px;
  height: 38px;
  background: #eef2ff;
  color: #4338ca;
}

.heading-icon.blue {
  background: #e0f2fe;
  color: #0369a1;
}

.heading-icon.orange {
  background: #ffedd5;
  color: #c2410c;
}

.section-heading h6 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 800;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 11px;
}

.heading-title {
  flex: 1;
  min-width: 0;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 20px;
  background: #e0f2fe;
  color: #075985;
  font-size: 12px;
  font-weight: 800;
}

.pending-count {
  background: #ffedd5;
  color: #9a3412;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.form-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #334155;
  font-size: 12px;
  font-weight: 750;
}

.required {
  color: #dc2626;
}

.form-group .form-control {
  display: block;
  width: 100%;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background-color: #ffffff;
  color: #1e293b;
  font-family: inherit;
  font-size: 12px;
  box-shadow: none;
}

.form-group .form-control:focus {
  border-color: #6366f1;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.form-group .form-control:disabled {
  background: #f1f5f9;
  opacity: 0.8;
}

.form-group textarea.form-control {
  min-height: 90px;
  resize: vertical;
}

.form-group .file-input {
  height: auto;
  min-height: 42px;
  padding: 7px;
}

.field-help,
.field-error {
  display: block;
  margin-top: 6px;
  font-size: 10.5px;
  line-height: 1.5;
}

.field-help {
  color: #64748b;
}

.field-error {
  color: #dc2626;
}

.character-count {
  text-align: right;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 46px;
  padding: 12px 16px;
  border: none;
  border-radius: 11px;
  background: #3730a3;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(55, 48, 163, 0.16);
  transition: background 0.2s ease, transform 0.2s ease;
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-submit:hover:not(:disabled) {
  background: #312e81;
}

.btn-submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.request-item {
  min-width: 0;
  padding: 13px;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  background: #ffffff;
}

.request-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.request-date {
  min-width: 0;
}

.request-date strong,
.request-date span {
  display: block;
}

.request-date strong {
  color: #111827;
  font-size: 12.5px;
  font-weight: 800;
}

.request-date span {
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}

.status-badge.approved {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.request-details {
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.duration {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4338ca;
  font-size: 11px;
  font-weight: 750;
}

.request-details p,
.approval-info p {
  margin: 7px 0 0;
  color: #475569;
  font-size: 11.5px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.approval-item {
  border-left: 3px solid #f59e0b;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  display: flex;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff7ed;
  color: #c2410c;
  font-size: 14px;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.employee-details strong,
.employee-details span {
  display: block;
  overflow-wrap: anywhere;
}

.employee-details strong {
  color: #111827;
  font-size: 12px;
  font-weight: 800;
}

.employee-details span {
  margin-top: 4px;
  color: #64748b;
  font-size: 10.5px;
}

.approval-info {
  margin-top: 12px;
  padding: 10px;
  border-radius: 9px;
  background: #f8fafc;
}

.approval-info > strong,
.approval-info > span {
  display: block;
}

.approval-info > strong {
  color: #334155;
  font-size: 11.5px;
}

.approval-info > span {
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
}

.approval-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.approval-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 8px;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
}

.btn-approve {
  background: #dcfce7;
  color: #166534;
}

.btn-reject {
  background: #fee2e2;
  color: #991b1b;
}

.approval-actions button:active {
  transform: scale(0.98);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 26px 12px;
  color: #94a3b8;
  text-align: center;
}

.empty-state > i {
  margin-bottom: 3px;
  font-size: 25px;
}

.empty-state strong {
  color: #475569;
  font-size: 12px;
}

.empty-state span {
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 360px) {
  .schedule,
  .card {
    padding: 12px;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .full-width {
    grid-column: 1;
  }

  .request-top {
    flex-direction: column;
  }

  .employee-info {
    flex-wrap: wrap;
  }
}
</style>