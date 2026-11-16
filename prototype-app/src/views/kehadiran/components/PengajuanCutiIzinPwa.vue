<template>
  <div class="attendance-pwa">
    <!-- Header -->
    <PwaPageHeader
      icon="fas fa-calendar-plus"
      title="Cuti & Izin"
      subtitle="Ajukan dan pantau persetujuan"
    />

    <!-- Ringkasan saldo cuti -->
    <section class="balance-grid">
      <div
        v-for="item in balances"
        :key="item.key"
        class="balance-card"
        :class="item.class"
      >
        <span>{{ item.label }}</span>
        <strong>{{ balance[item.key] || 0 }}</strong>
        <small>hari</small>
      </div>
    </section>

    <!-- Form pengajuan -->
    <section class="form-card">
      <div class="title-row">
        <div>
          <h6>Pengajuan Baru</h6>
          <span>Isi data permohonan</span>
        </div>

        <button
          type="button"
          class="icon-btn"
          :aria-expanded="open"
          aria-label="Tampilkan atau sembunyikan formulir"
          @click="open = !open"
        >
          <i
            :class="
              open
                ? 'fas fa-chevron-up'
                : 'fas fa-chevron-down'
            "
          ></i>
        </button>
      </div>

      <div v-if="open" class="form-grid">
        <!-- Kategori -->
        <div class="form-group">
          <label for="cuti-kategori">Kategori</label>

          <select
            id="cuti-kategori"
            v-model="form.kategori"
            class="form-select form-select-sm"
            :disabled="saving"
          >
            <option value="Cuti">Cuti</option>
            <option value="Izin">Izin</option>
          </select>
        </div>

        <!-- Jenis -->
        <div class="form-group">
          <label for="cuti-jenis">Jenis</label>

          <select
            id="cuti-jenis"
            v-model="form.jenis"
            class="form-select form-select-sm"
            :disabled="saving"
            required
          >
            <option value="">Pilih jenis</option>

            <option
              v-for="jenis in (jenisOptions[form.kategori] || [])"
              :key="jenis"
              :value="jenis"
            >
              {{ jenis }}
            </option>
          </select>
        </div>

        <!-- Kepala Divisi Approval -->
        <div class="form-group wide">
          <label for="cuti-kadiv">
            Kepala Divisi Approval
            <span class="required">*</span>
          </label>

          <select
            id="cuti-kadiv"
            v-model="form.kadiv_id"
            class="form-select form-select-sm"
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
            Daftar Kepala Divisi belum tersedia. Silakan refresh
            halaman atau hubungi administrator.
          </small>

          <small v-else class="field-help">
            Pilih Kepala Divisi yang akan menerima pengajuan Anda.
          </small>
        </div>

        <!-- Tanggal mulai -->
        <div class="form-group">
          <label for="cuti-mulai">
            Tanggal Mulai
            <span class="required">*</span>
          </label>

          <input
            id="cuti-mulai"
            v-model="form.tanggal_mulai"
            type="date"
            class="form-control form-control-sm"
            :disabled="saving"
            required
          />
        </div>

        <!-- Tanggal selesai -->
        <div class="form-group">
          <label for="cuti-selesai">
            Tanggal Selesai
            <span class="required">*</span>
          </label>

          <input
            id="cuti-selesai"
            v-model="form.tanggal_selesai"
            type="date"
            class="form-control form-control-sm"
            :disabled="saving"
            :min="form.tanggal_mulai || undefined"
            required
          />
        </div>

        <!-- Dokumen -->
        <div class="form-group wide">
          <label for="cuti-dokumen">
            Dokumen Pendukung
            <span class="required">*</span>
          </label>

          <input
            id="cuti-dokumen"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            class="form-control form-control-sm file-input"
            :disabled="saving"
            @change="handleFileChange"
            required
          />

          <small class="field-help">
            Format PDF, JPG, JPEG, PNG, atau WEBP. Maksimal 5 MB.
          </small>

          <small v-if="selectedFileName" class="selected-file">
            <i class="fas fa-paperclip"></i>
            {{ selectedFileName }}
          </small>
        </div>

        <!-- Keperluan -->
        <div class="form-group wide">
          <label for="cuti-keperluan">
            Keperluan
            <span class="required">*</span>
          </label>

          <textarea
            id="cuti-keperluan"
            v-model="form.keperluan"
            class="form-control form-control-sm"
            rows="3"
            placeholder="Jelaskan keperluan cuti atau izin..."
            :disabled="saving"
            required
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="wide">
          <button
            type="button"
            class="btn-submit"
            :disabled="
              saving ||
              loadingKadiv ||
              kadivOptions.length === 0
            "
            @click="submit"
          >
            <i
              :class="
                saving
                  ? 'fas fa-spinner fa-spin'
                  : 'fas fa-paper-plane'
              "
            ></i>

            {{
              saving
                ? 'Menyimpan Pengajuan...'
                : 'Simpan Pengajuan'
            }}
          </button>
        </div>
      </div>
    </section>

    <!-- Riwayat pengajuan -->
    <section class="list-card">
      <div class="title-row">
        <div>
          <h6>Pengajuan Saya</h6>
          <span>{{ rows.length }} pengajuan</span>
        </div>
      </div>

      <div v-if="loading && rows.length === 0" class="empty-card">
        <i class="fas fa-spinner fa-spin"></i>
        Memuat data pengajuan...
      </div>

      <div v-else-if="rows.length === 0" class="empty-card">
        <i class="fas fa-inbox"></i>
        <strong>Belum ada pengajuan</strong>
        <span>Riwayat pengajuan Anda akan muncul di sini.</span>
      </div>

      <div v-else class="list">
        <article
          v-for="item in rows"
          :key="item.id"
          class="item-card"
        >
          <div class="top">
            <div>
              <strong>{{ item.jenis || '-' }}</strong>
              <small>{{ item.kategori || '-' }}</small>
            </div>

            <span
              class="status"
              :class="statusClass(item.status)"
            >
              {{ statusLabel(item.status) }}
            </span>
          </div>

          <div class="mini">
            <span>Periode</span>
            <strong>
              {{ formatDate(item.tanggal_mulai) }}
              s.d.
              {{ formatDate(item.tanggal_selesai) }}
            </strong>
          </div>

          <div class="mini">
            <span>Jumlah Hari</span>
            <strong>{{ item.jumlah_hari || 0 }} hari</strong>
          </div>

          <div class="mini">
            <span>Keterangan Approval</span>
            <strong>{{ item.keterangan_approval || '-' }}</strong>
          </div>
        </article>
      </div>
    </section>

    <!-- Persetujuan pengajuan -->
    <section v-if="canApprove" class="list-card">
      <div class="title-row">
        <div>
          <h6>Menunggu Persetujuan</h6>
          <span>{{ approvalRows.length }} pengajuan</span>
        </div>
      </div>

      <div v-if="approvalRows.length === 0" class="empty-card">
        <i class="fas fa-check-circle"></i>
        <strong>Tidak ada pengajuan menunggu</strong>
        <span>Pengajuan yang perlu ditinjau akan muncul di sini.</span>
      </div>

      <div v-else class="list">
        <article
          v-for="item in approvalRows"
          :key="item.id"
          class="item-card approval-item"
        >
          <div class="top">
            <div>
              <strong>{{ item.pegawai?.nama || '-' }}</strong>
              <small>NIP: {{ item.pegawai?.nip || '-' }}</small>
            </div>

            <span class="status pending">Menunggu</span>
          </div>

          <div class="mini">
            <span>Kategori dan Jenis</span>
            <strong>
              {{ item.kategori || '-' }} · {{ item.jenis || '-' }}
            </strong>
          </div>

          <div class="mini">
            <span>Periode</span>
            <strong>
              {{ formatDate(item.tanggal_mulai) }}
              s.d.
              {{ formatDate(item.tanggal_selesai) }}
            </strong>
          </div>

          <div class="mini">
            <span>Keperluan</span>
            <strong>{{ item.keperluan || '-' }}</strong>
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
import { computed, ref } from 'vue'
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  approvalRows: {
    type: Array,
    default: () => [],
  },
  jenisOptions: {
    type: Object,
    default: () => ({}),
  },
  balance: {
    type: Object,
    default: () => ({}),
  },
  form: {
    type: Object,
    required: true,
  },
  kadivOptions: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingKadiv: {
    type: Boolean,
    default: false,
  },
  canApprove: {
    type: Boolean,
    default: false,
  },
  formatDate: {
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
})

const emit = defineEmits(['file-change'])

const open = ref(true)
const selectedFileName = ref('')

const balances = [
  {
    key: 'hak_cuti_tahunan',
    label: 'Hak Cuti',
    class: 'blue',
  },
  {
    key: 'sisa_cuti',
    label: 'Sisa Cuti',
    class: 'green',
  },
  {
    key: 'cuti_rencana',
    label: 'Rencana',
    class: 'orange',
  },
  {
    key: 'cuti_hangus',
    label: 'Hangus',
    class: 'red',
  },
]

const isKadivAvailable = computed(() => {
  return props.kadivOptions.length > 0
})

function handleFileChange(event) {
  const file = event.target.files?.[0] || null

  selectedFileName.value = file?.name || ''
  emit('file-change', file)
}
</script>

<style scoped>
.attendance-pwa {
  padding: 2px 0 84px;
  color: #1e293b;
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 8px;
}

.balance-card {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.balance-card span {
  display: block;
  color: #64748b;
  font-size: 9.38px;
  font-weight: 800;
}

.balance-card strong {
  display: block;
  margin-top: 3px;
  color: #111827;
  font-size: 21.25px;
}

.balance-card small {
  color: #94a3b8;
  font-size: 8.75px;
}

.balance-card.blue {
  border-top: 3px solid #2563eb;
}

.balance-card.green {
  border-top: 3px solid #16a34a;
}

.balance-card.orange {
  border-top: 3px solid #f59e0b;
}

.balance-card.red {
  border-top: 3px solid #dc2626;
}

.form-card,
.list-card {
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 0.2rem 0.6rem rgba(15, 23, 42, 0.05);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
}

.title-row h6 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
}

.title-row span {
  color: #64748b;
  font-size: 10.62px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #f8fafc;
  color: #334155;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.form-group {
  min-width: 0;
}

.form-grid .wide {
  grid-column: 1 / -1;
}

.form-grid label {
  display: block;
  margin-bottom: 4px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 900;
}

.required {
  color: #dc2626;
}

.form-grid .form-control,
.form-grid .form-select {
  width: 100%;
  min-height: 38px;
  font-size: 11.25px;
}

.form-grid textarea.form-control {
  min-height: 74px;
  resize: vertical;
}

.form-grid .file-input {
  height: auto;
  padding: 7px;
}

.field-help,
.field-error,
.selected-file {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.field-help {
  color: #64748b;
}

.field-error {
  color: #dc2626;
}

.selected-file {
  color: #334155;
  font-weight: 700;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: #3730a3;
  color: #fff;
  font-size: 11.25px;
  font-weight: 900;
}

.btn-submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 9px;
}

.item-card {
  min-width: 0;
  padding: 9px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fff;
}

.approval-item {
  border-left: 3px solid #f59e0b;
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 7px;
}

.top > div {
  min-width: 0;
}

.top strong {
  display: block;
  color: #111827;
  font-size: 12.5px;
  overflow-wrap: anywhere;
}

.top small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 9.38px;
  overflow-wrap: anywhere;
}

.status {
  flex-shrink: 0;
  padding: 3px 6px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 8.75px;
  font-weight: 900;
  white-space: nowrap;
}

.status.approved {
  background: #dcfce7;
  color: #166534;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.mini {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
}

.mini span {
  display: block;
  color: #94a3b8;
  font-size: 8.75px;
  font-weight: 800;
}

.mini strong {
  display: block;
  margin-top: 2px;
  color: #334155;
  font-size: 10.62px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.approval-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 9px;
}

.approval-actions button {
  min-height: 32px;
  border: none;
  border-radius: 8px;
  font-size: 10.62px;
  font-weight: 900;
}

.btn-approve {
  background: #dcfce7;
  color: #166534;
}

.btn-reject {
  background: #fee2e2;
  color: #991b1b;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px;
  color: #64748b;
  font-size: 11.25px;
  text-align: center;
}

.empty-card > i {
  font-size: 21px;
}

.empty-card strong {
  color: #475569;
}

@media (max-width: 410px) {
  .balance-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-grid .wide {
    grid-column: 1;
  }
}
</style>