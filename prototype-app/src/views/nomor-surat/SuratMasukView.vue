<template>
  <div class="container-fluid surat-masuk-page" :class="{ 'pwa-page': isPwa }">
    <div class="page-head">
      <div>
        <h3>Surat Masuk</h3>
        <p>Catat surat masuk, scan dokumen, disposisi, dan riwayat tindak lanjut.</p>
      </div>

      <button type="button" class="btn btn-sm btn-outline-primary" @click="loadData(1)">
        <i class="fas fa-sync-alt me-1"></i>
        Refresh
      </button>
    </div>

    <div class="surat-form-card">
      <div class="surat-form-head">
        <div>
          <h5>
            <i class="fas fa-inbox"></i>
            Form Surat Masuk
          </h5>
          <p>Catat surat masuk, scan dokumen, tujuan surat, dan status kerahasiaan.</p>
        </div>

        <button type="button" class="btn-toggle-form" @click="showForm = !showForm">
          <i :class="showForm ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showForm ? 'Tutup Form' : 'Buka Form' }}
        </button>
      </div>

      <div v-if="showForm" class="surat-form-body">
        <div class="form-grid">
          <div class="form-item">
            <label>Tanggal Terima <span>*</span></label>
            <input
              v-model="form.tanggal_terima"
              type="date"
              class="form-control"
            />
          </div>

          <div class="form-item">
            <label>Nomor Surat pada Dokumen <span>*</span></label>
            <input
              v-model="form.nomor_surat_masuk"
              type="text"
              class="form-control"
              placeholder="Contoh: mPro/OP.9999/IX/2026"
            />
          </div>

          <div class="form-item">
            <label>Tanggal Dokumen <span>*</span></label>
            <input
              v-model="form.tanggal_dokumen"
              type="date"
              class="form-control"
            />
          </div>

          <div class="form-item">
            <label>Tujuan Surat <span>*</span></label>
            <select v-model="form.tujuan_surat" class="form-select form-select-sm">
              <option value="">-- Pilih Tujuan --</option>
              <option v-for="target in targetOptions" :key="`tujuan-${target}`" :value="target">{{ target }}</option>
            </select>
          </div>

          <div class="form-item">
            <label>PIC Penerima <span>*</span></label>
            <input
              v-model="form.pic_penerima"
              type="text"
              class="form-control"
              placeholder="Nama penerima"
            />
          </div>

          <div class="form-item">
            <label>PIC / Kurir Pengirim</label>
            <input
              v-model="form.pic_kurir_pengirim"
              type="text"
              class="form-control"
              placeholder="Nama kurir / pengirim"
            />
          </div>

          <div class="form-item">
            <label>Scan Dokumen <span>*</span></label>

            <input
              type="file"
              class="form-control"
              accept=".pdf,.jpg,.jpeg,.png"
              @change="form.scan_dokumen = $event.target.files[0] || null"
            />

            <small v-if="form.scan_dokumen" class="file-selected">
              <i class="fas fa-check-circle"></i>
              {{ form.scan_dokumen.name }}
            </small>
          </div>

          <div class="form-item secret-box">
            <div class="secret-check">
              <input
                id="isRahasia"
                v-model="form.is_rahasia"
                type="checkbox"
              />

              <label for="isRahasia">
                <strong>Surat Rahasia</strong>
                <small>Hanya penginput, penerima disposisi, dan CC/tembusan yang dapat melihat.</small>
              </label>
            </div>
          </div>

          <div class="form-item full">
            <label>Perihal <span>*</span></label>
            <textarea
              v-model="form.perihal"
              class="form-control"
              rows="2"
              placeholder="Tuliskan perihal surat secara singkat dan jelas"
            ></textarea>
          </div>
        </div>

        <div class="form-action-bar">
          <button type="button" class="btn-light-custom" @click="resetForm">
            Reset
          </button>

          <button type="button" class="btn-primary-custom" @click="submitForm" :disabled="saving">
            <i class="fas fa-save"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan Surat Masuk' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card compact-card mb-3">
      <div class="card-head">
        <strong>
          <i class="fas fa-filter me-1"></i>
          Filter Data
        </strong>
      </div>

      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-lg-2 col-md-6">
            <label class="form-label">Tanggal Mulai</label>
            <input v-model="filter.tanggal_mulai" type="date" class="form-control form-control-sm">
          </div>

          <div class="col-lg-2 col-md-6">
            <label class="form-label">Tanggal Selesai</label>
            <input v-model="filter.tanggal_selesai" type="date" class="form-control form-control-sm">
          </div>

          <div class="col-lg-3 col-md-6">
            <label class="form-label">Status Disposisi</label>
            <select v-model="filter.status_disposisi" class="form-select form-select-sm">
              <option value="">Semua</option>
              <option value="Belum Diproses">Belum Diproses</option>
              <option value="Tidak Perlu Disposisi">Tidak Perlu Disposisi</option>
              <option value="Proses Disposisi">Proses Disposisi</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6">
            <label class="form-label">Keyword</label>
            <input v-model="filter.keyword" type="text" class="form-control form-control-sm" placeholder="Cari nomor/perihal/PIC">
          </div>

          <div class="col-lg-2 col-md-12 d-flex gap-2">
            <button type="button" class="btn btn-sm btn-primary flex-fill" @click="loadData(1)">Filter</button>
            <button type="button" class="btn btn-sm btn-light flex-fill" @click="resetFilter">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card compact-card">
      <div class="card-head">
        <strong>Data Surat Masuk</strong>
        <small>{{ pagination.total }} data</small>
      </div>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead>
            <tr>
              <th style="width:48px">No</th>
              <th>Tanggal Terima</th>
              <th>Nomor Surat</th>
              <th>Tanggal Dokumen</th>
              <th>Perihal</th>
              <th>Tujuan</th>
              <th>PIC Penerima</th>
              <th>PIC/Kurir</th>
              <th>Status</th>
              <th style="width:48px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="text-center py-4">Memuat data...</td>
            </tr>

            <tr v-else-if="items.length === 0">
              <td colspan="10" class="text-center py-4">Data surat masuk belum tersedia.</td>
            </tr>

            <tr v-for="(item, index) in items" v-else :key="item.id">
              <td>{{ pagination.from + index }}</td>
              <td>{{ formatDate(item.tanggal_terima) }}</td>
              <td>
                <strong>{{ item.nomor_surat_masuk }}</strong>
                <span v-if="item.is_rahasia" class="badge bg-dark ms-1">
                  <i class="fas fa-lock me-1"></i>Rahasia
                </span>
                <div v-if="item.scan_dokumen_url" class="small">
                  <button type="button" class="link-button" @click="openScan(item)">Lihat scan</button>
                </div>
              </td>
              <td>{{ formatDate(item.tanggal_dokumen) }}</td>
              <td>{{ item.perihal }}</td>
              <td>{{ item.tujuan_surat || '-' }}</td>
              <td>{{ item.pic_penerima || '-' }}</td>
              <td>{{ item.pic_pengirim || '-' }}</td>
              <td>
                <span class="badge" :class="statusBadge(item.status_disposisi)">
                  {{ item.status_disposisi }}
                </span>
              </td>
              <td class="action-cell" :class="{ 'is-open': openActionId === item.id }">
                <div v-if="item.can_action_menu" class="action-dropdown">
                  <button
                    type="button"
                    class="action-icon-btn"
                    :title="item.can_act_disposisi ? 'Aksi disposisi' : 'Kelola data surat'"
                    :aria-label="item.can_act_disposisi ? 'Aksi disposisi' : 'Kelola data surat'"
                    @click.stop="toggleAction(item.id)"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>

                  <div v-if="openActionId === item.id" class="action-menu">
                    <button v-if="item.can_act_disposisi" type="button" class="primary-action" @click="openDisposisiFromAction(item)">
                      <i class="fas fa-share-nodes"></i>
                      Proses Disposisi
                    </button>
                    <button v-if="item.can_access" type="button" @click="openInfoFromAction(item)">
                      <i class="fas fa-circle-info"></i>
                      Detail & Riwayat
                    </button>
                    <button v-if="item.can_update" type="button" @click="openEditFromAction(item)">
                      <i class="fas fa-pen"></i>
                      Edit Data
                    </button>
                    <button v-if="item.can_delete" type="button" class="danger" @click="deleteItemFromAction(item)">
                      <i class="fas fa-trash"></i>
                      Hapus Data
                    </button>
                  </div>
                </div>
                <span v-else class="action-locked" title="Tidak ada aksi yang dapat dilakukan">
                  <i class="fas fa-lock"></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-row">
        <button type="button" class="btn btn-sm btn-light" :disabled="pagination.current_page <= 1" @click="loadData(pagination.current_page - 1)">
          Sebelumnya
        </button>

        <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>

        <button type="button" class="btn btn-sm btn-light" :disabled="pagination.current_page >= pagination.last_page" @click="loadData(pagination.current_page + 1)">
          Berikutnya
        </button>
      </div>
    </div>

    <div v-if="infoModal" class="modal-layer">
      <div class="modal-card modal-lg-card">
        <div class="modal-head">
          <strong>Informasi Surat Masuk</strong>
          <button type="button" @click="closeInfo">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="selectedItem" class="detail-grid">
            <div><span>Nomor Surat</span><strong>{{ selectedItem.nomor_surat_masuk }}</strong></div>
            <div><span>Tanggal Terima</span><strong>{{ formatDate(selectedItem.tanggal_terima) }}</strong></div>
            <div><span>Tanggal Dokumen</span><strong>{{ formatDate(selectedItem.tanggal_dokumen) }}</strong></div>
            <div><span>Status</span><strong>{{ selectedItem.status_disposisi }}</strong></div>
            <div><span>Kerahasiaan</span><strong>{{ selectedItem.is_rahasia ? 'Rahasia' : 'Bukan Rahasia' }}</strong></div>
            <div class="wide"><span>Perihal</span><strong>{{ selectedItem.perihal }}</strong></div>
            <div class="wide"><span>Keterangan Disposisi</span><strong>{{ selectedItem.keterangan_disposisi || '-' }}</strong></div>
            <div class="wide"><span>Keterangan Akhir</span><strong>{{ selectedItem.keterangan_akhir || '-' }}</strong></div>
          </div>

          <div class="history-head mt-4">
            <div>
              <h6><i class="fas fa-route me-1"></i> Riwayat Disposisi</h6>
              <small>Alur pengiriman, penerima, tindak lanjut, dan lampiran surat balasan.</small>
            </div>
            <span class="history-count">{{ detailDisposisis.length }} proses</span>
          </div>

          <div v-if="detailDisposisis.length === 0" class="empty-state">Belum ada proses disposisi.</div>

          <div v-for="(disposisi, historyIndex) in detailDisposisis" :key="disposisi.id" class="timeline-item" :class="{ 'timeline-active': disposisi.status === 'Dikirim' }">
            <div class="timeline-dot">{{ historyIndex + 1 }}</div>
            <div class="timeline-content">
              <div class="timeline-top">
                <div>
                  <span class="history-status" :class="historyStatusClass(disposisi.status)">{{ disposisi.status }}</span>
                  <span class="history-number">Disposisi #{{ historyIndex + 1 }}</span>
                </div>
                <small><i class="far fa-clock me-1"></i>{{ formatDateTime(disposisi.created_at) }}</small>
              </div>

              <div class="history-grid">
                <div>
                  <span class="history-label">Pengirim Disposisi</span>
                  <strong><i class="fas fa-user-pen me-1"></i>{{ disposisi.created_by_name || '-' }}</strong>
                </div>
                <div>
                  <span class="history-label">Tanggal Kirim</span>
                  <strong>{{ formatDateTime(disposisi.created_at) }}</strong>
                </div>
                <div class="wide">
                  <span class="history-label">Keterangan / Catatan</span>
                  <strong class="history-text">{{ disposisi.keterangan || '-' }}</strong>
                </div>
                <div>
                  <span class="history-label">Tujuan Penerima</span>
                  <strong>{{ disposisi.tujuan_disposisi?.length ? disposisi.tujuan_disposisi.join(', ') : '-' }}</strong>
                </div>
                <div>
                  <span class="history-label">Tembusan / CC</span>
                  <strong>{{ disposisi.cc_tembusan?.length ? disposisi.cc_tembusan.join(', ') : '-' }}</strong>
                </div>
              </div>

              <div v-if="disposisi.perlu_balasan" class="reply-history">
                <div class="reply-history-title"><i class="fas fa-reply me-1"></i> Balasan</div>
                <div class="reply-history-row">
                  <span>Status balasan</span>
                  <strong>{{ disposisi.dokumen_balasan_url ? 'Dokumen tersedia' : 'Belum ada lampiran' }}</strong>
                </div>
                <div v-if="disposisi.dokumen_balasan_url" class="reply-history-row attachment-row">
                  <span>Lampiran</span>
                  <span class="attachment-actions">
                    <button type="button" class="attachment-btn" @click="openBalasan(disposisi)"><i class="fas fa-eye"></i> Lihat</button>
                    <button type="button" class="attachment-btn" @click="downloadBalasan(disposisi)"><i class="fas fa-download"></i> Download</button>
                  </span>
                </div>
                <div v-if="disposisi.keterangan_balasan" class="reply-history-row">
                  <span>Catatan balasan</span>
                  <strong class="history-text">{{ disposisi.keterangan_balasan }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeInfo">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="editModal" class="modal-layer">
      <div class="modal-card modal-lg-card">
        <div class="modal-head">
          <strong>Edit Surat Masuk</strong>
          <button type="button" @click="closeEdit">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label">Tanggal Terima</label>
              <input v-model="editForm.tanggal_terima" type="date" class="form-control form-control-sm">
            </div>
            <div class="col-md-4">
              <label class="form-label">Nomor Surat</label>
              <input v-model="editForm.nomor_surat_masuk" type="text" class="form-control form-control-sm">
            </div>
            <div class="col-md-4">
              <label class="form-label">Tanggal Dokumen</label>
              <input v-model="editForm.tanggal_dokumen" type="date" class="form-control form-control-sm">
            </div>
            <div class="col-md-6">
              <label class="form-label">Tujuan Surat</label>
              <select v-model="editForm.tujuan_surat" class="form-select form-select-sm">
                <option value="">-- Pilih Tujuan --</option>
                <option v-for="target in targetOptions" :key="`edit-tujuan-${target}`" :value="target">{{ target }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">PIC Penerima</label>
              <input v-model="editForm.pic_penerima" type="text" class="form-control form-control-sm">
            </div>
            <div class="col-md-3">
              <label class="form-label">PIC/Kurir Pengirim</label>
              <input v-model="editForm.pic_pengirim" type="text" class="form-control form-control-sm">
            </div>
            <div class="col-12">
              <label class="secret-check">
                <input v-model="editForm.is_rahasia" type="checkbox">
                <span>Surat rahasia</span>
              </label>
            </div>
            <div class="col-12">
              <label class="form-label">Perihal</label>
              <textarea v-model="editForm.perihal" rows="2" class="form-control form-control-sm"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label">Ganti Scan Dokumen</label>
              <input type="file" class="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="onEditFileChange">
              <small class="text-muted">Kosongkan jika tidak ingin mengganti dokumen.</small>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeEdit">Batal</button>
          <button type="button" class="btn btn-sm btn-primary" :disabled="updating" @click="submitEdit">
            {{ updating ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="disposisiModal" class="modal-layer">
      <div class="modal-card modal-lg-card">
        <div class="modal-head">
          <strong>Proses Disposisi</strong>
          <button type="button" @click="closeDisposisi">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert alert-light border">
            <strong>{{ selectedItem?.nomor_surat_masuk }}</strong>
            <div>{{ selectedItem?.perihal }}</div>
          </div>

          <label class="form-label">Apakah surat perlu disposisi?</label>
          <select v-model="disposisiForm.perlu_disposisi" class="form-select form-select-sm mb-2">
            <option :value="true">Ya</option>
            <option :value="false">Tidak</option>
          </select>

          <template v-if="disposisiForm.perlu_disposisi">
            <label class="form-label">Tujuan Disposisi</label>
            <select v-model="disposisiForm.tujuan_disposisi" multiple class="form-select form-select-sm multi-select">
              <option v-for="target in targetOptions" :key="target" :value="target">{{ target }}</option>
            </select>

            <label class="form-label mt-2">CC / Tembusan</label>
            <select v-model="disposisiForm.cc_tembusan" multiple class="form-select form-select-sm multi-select">
              <option v-for="target in targetOptions" :key="`cc-${target}`" :value="target">{{ target }}</option>
            </select>

            <label class="form-label mt-2">Perlu Balasan?</label>
            <select v-model="disposisiForm.perlu_balasan" class="form-select form-select-sm mb-2">
              <option :value="false">Tidak</option>
              <option :value="true">Ya</option>
            </select>

            <div v-if="disposisiForm.perlu_balasan" class="reply-box">
              <div class="reply-box-head">
                <div>
                  <strong><i class="fas fa-reply me-1"></i> Balasan Surat</strong>
                  <small>Upload bersifat opsional. Anda tetap dapat menyimpan catatan tanpa lampiran.</small>
                </div>
                <span class="optional-badge">Opsional</span>
              </div>

              <label class="form-label mt-2">Lampiran Surat Balasan</label>
              <input type="file" class="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="onBalasanFileChange">
              <small v-if="dokumenBalasanFile" class="file-selected"><i class="fas fa-paperclip"></i> {{ dokumenBalasanFile.name }}</small>

              <label class="form-label mt-2">Catatan / Keterangan Balasan</label>
              <textarea v-model="disposisiForm.catatan_balasan" class="form-control form-control-sm" rows="3" placeholder="Tuliskan catatan balasan, termasuk alasan jika dokumen belum tersedia."></textarea>
            </div>
          </template>

          <label class="form-label mt-2">
            {{ disposisiForm.perlu_disposisi ? 'Keterangan Disposisi' : 'Keterangan / Informasi' }}
          </label>
          <textarea v-model="disposisiForm.keterangan" class="form-control form-control-sm" rows="4"></textarea>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-sm btn-light" @click="closeDisposisi">Batal</button>
          <button type="button" class="btn btn-sm btn-primary" :disabled="savingDisposisi" @click="submitDisposisi">
            {{ savingDisposisi ? 'Memproses...' : (disposisiForm.perlu_disposisi ? 'Kirim ke Penerima' : 'Selesaikan Disposisi') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { htmlText } from "../../demo/escape.js"
import { reactive, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

const { isPwa } = usePwaMode()

const today = new Date().toISOString().slice(0, 10)

const showForm = ref(true)
const loading = ref(false)
const saving = ref(false)
const updating = ref(false)
const savingDisposisi = ref(false)

const items = ref([])
const fileInputKey = ref(0)
const editScanFile = ref(null)
const dokumenBalasanFile = ref(null)
const openActionId = ref(null)

const infoModal = ref(false)
const editModal = ref(false)
const disposisiModal = ref(false)
const selectedItem = ref(null)
const detailDisposisis = ref([])


const targetOptions = ref([
  'Direktur Utama',
  'Direksi Bisnis & Marketing',
  'Direktur Keuangan & Operasional',
  'Kadiv SDM & Operasional',
  'Kadiv Bisnis Marketing',
  'Kadiv Bisnis Training & Project',
  'Kadiv Bisnis Outsource',
  'Kadiv Finance & Accounting',
  'Manager SDM & Operasional',
  'Manager Bisnis Marketing',
  'Manager Bisnis Training & Project',
  'Manager Bisnis Outsource',
  'Manager Finance & Accounting',
  'Staff SDM & Operasional',
  'Staff Bisnis Marketing',
  'Staff Bisnis Training & Project',
  'Staff Bisnis Outsource',
  'Staff Finance & Accounting',
  'All'
])

const form = reactive({
  tanggal_terima: today,
  nomor_surat_masuk: '',
  tanggal_dokumen: '',
  perihal: '',
  tujuan_surat: '',
  pic_penerima: '',
  pic_pengirim: '',
  is_rahasia: false,
  scan_dokumen: null,
})

const editForm = reactive({
  id: null,
  tanggal_terima: '',
  nomor_surat_masuk: '',
  tanggal_dokumen: '',
  perihal: '',
  tujuan_surat: '',
  pic_penerima: '',
  pic_pengirim: '',
  is_rahasia: false,
  scan_dokumen: null,
})

const filter = reactive({
  tanggal_mulai: '',
  tanggal_selesai: '',
  status_disposisi: '',
  keyword: ''
})

const disposisiForm = reactive({
  perlu_disposisi: true,
  tujuan_disposisi: [],
  cc_tembusan: [],
  keterangan: '',
  perlu_balasan: false,
  catatan_balasan: '',
  scan_dokumen: null,
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
})

const loadTargets = async () => {
  try {
    const response = await api.get('/nomor-surat/surat-masuk/targets')
    targetOptions.value = response.data?.data || targetOptions.value
  } catch (error) {
    console.warn('Target disposisi menggunakan data default.', error)
  }
}

const loadData = async (page = 1) => {
  loading.value = true

  try {
    const response = await api.get('/nomor-surat/surat-masuk', {
      params: {
        page,
        per_page: pagination.per_page,
        tanggal_mulai: filter.tanggal_mulai || undefined,
        tanggal_selesai: filter.tanggal_selesai || undefined,
        status_disposisi: filter.status_disposisi || undefined,
        keyword: filter.keyword || undefined
      }
    })

    items.value = response.data?.data || []

    const meta = response.data?.pagination || {}
    pagination.current_page = meta.current_page || 1
    pagination.last_page = meta.last_page || 1
    pagination.per_page = meta.per_page || 10
    pagination.total = meta.total || 0
    pagination.from = meta.from || 0
    pagination.to = meta.to || 0
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data surat masuk gagal dimuat.'
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.tanggal_terima = today
  form.nomor_surat_masuk = ''
  form.tanggal_dokumen = ''
  form.perihal = ''
  form.tujuan_surat = ''
  form.pic_penerima = ''
  form.pic_pengirim = ''
  form.is_rahasia = false
  form.scan_dokumen = null

  fileInputKey.value++
}

const resetFilter = async () => {
  filter.tanggal_mulai = ''
  filter.tanggal_selesai = ''
  filter.status_disposisi = ''
  filter.keyword = ''

  await loadData(1)
}

const onEditFileChange = (event) => {
  editScanFile.value = event.target.files?.[0] || null
}

const onBalasanFileChange = (event) => {
  dokumenBalasanFile.value = event.target.files?.[0] || null
}

const validateForm = () => {
  if (!form.tanggal_terima) return 'Tanggal terima wajib diisi.'
  if (!form.nomor_surat_masuk) return 'Nomor surat masuk wajib diisi.'
  if (!form.perihal) return 'Perihal wajib diisi.'
  if (!form.scan_dokumen) {
    return 'Scan dokumen wajib dilampirkan.'
  }

  return null
}

const submitForm = async () => {
  const errorMessage = validateForm()

  if (errorMessage) {
    Swal.fire({ icon: 'warning', title: 'Validasi', text: errorMessage })
    return
  }

  saving.value = true

  try {
    const payload = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, key === 'is_rahasia' ? (value ? '1' : '0') : (value || ''))
    })

    payload.append('scan_dokumen', form.scan_dokumen)

    const response = await api.post('/nomor-surat/surat-masuk', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data?.message || 'Surat masuk berhasil dicatat.',
      timer: 1400,
      showConfirmButton: false
    })

    resetForm()
    await loadData(1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Surat masuk gagal disimpan.'
    })
  } finally {
    saving.value = false
  }
}

const openEdit = (item) => {
  selectedItem.value = item
  editForm.id = item.id
  editForm.tanggal_terima = toInputDate(item.tanggal_terima)
  editForm.nomor_surat_masuk = item.nomor_surat_masuk || ''
  editForm.tanggal_dokumen = toInputDate(item.tanggal_dokumen)
  editForm.perihal = item.perihal || ''
  editForm.tujuan_surat = item.tujuan_surat || ''
  editForm.pic_penerima = item.pic_penerima || ''
  editForm.pic_pengirim = item.pic_pengirim || ''
  editForm.is_rahasia = Boolean(item.is_rahasia)
  editScanFile.value = null
  editModal.value = true
}

const closeEdit = () => {
  editModal.value = false
  selectedItem.value = null
}

const submitEdit = async () => {
  if (!editForm.perihal || !editForm.nomor_surat_masuk || !editForm.tanggal_terima) {
    Swal.fire({ icon: 'warning', title: 'Validasi', text: 'Tanggal terima, nomor surat, dan perihal wajib diisi.' })
    return
  }

  updating.value = true

  try {
    const payload = new FormData()

    Object.entries(editForm).forEach(([key, value]) => {
      if (key !== 'id') payload.append(key, key === 'is_rahasia' ? (value ? '1' : '0') : (value || ''))
    })

    if (editScanFile.value) {
      payload.append('scan_dokumen', editScanFile.value)
    }

    payload.append('_method', 'PUT')

    const response = await api.post(`/nomor-surat/surat-masuk/${editForm.id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data?.message || 'Data berhasil diperbarui.',
      timer: 1400,
      showConfirmButton: false
    })

    closeEdit()
    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data gagal diperbarui.'
    })
  } finally {
    updating.value = false
  }
}

const openScan = async (item) => {
  try {
    const response = await api.get(`/nomor-surat/surat-masuk/${item.id}/file`, {
      responseType: 'blob'
    })

    const mimeType = response.headers?.['content-type'] || 'application/pdf'
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
    window.open(blobUrl, '_blank', 'noopener')

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Scan dokumen gagal dibuka.'
    })
  }
}

const openBalasan = async (disposisi) => {
  try {
    const response = await api.get(`/nomor-surat/surat-masuk/${selectedItem.value.id}/disposisi/${disposisi.id}/balasan`, {
      responseType: 'blob'
    })

    const mimeType = response.headers?.['content-type'] || 'application/pdf'
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
    window.open(blobUrl, '_blank', 'noopener')

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60000)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Surat balasan gagal dibuka.'
    })
  }
}

const downloadBalasan = async (disposisi) => {
  try {
    const response = await api.get(`/nomor-surat/surat-masuk/${selectedItem.value.id}/disposisi/${disposisi.id}/balasan?download=1`, {
      responseType: 'blob'
    })

    const contentDisposition = response.headers?.['content-disposition'] || ''
    const match = contentDisposition.match(/filename="?([^";]+)"?/i)
    const fileName = match?.[1] || `balasan-${selectedItem.value.nomor_surat_masuk || 'surat'}`
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' }))
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000)
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Lampiran surat balasan gagal diunduh.' })
  }
}

const historyStatusClass = (status) => {
  if (status === 'Dikirim') return 'status-sent'
  if (status === 'Selesai') return 'status-done'
  if (status === 'Diteruskan') return 'status-forwarded'
  return 'status-info'
}

const toggleAction = (id) => {
  openActionId.value = openActionId.value === id ? null : id
}

const closeAction = () => {
  openActionId.value = null
}

const openDisposisiFromAction = (item) => {
  closeAction()
  openDisposisi(item)
}

const openInfoFromAction = (item) => {
  closeAction()
  openInfo(item)
}

const openEditFromAction = (item) => {
  closeAction()
  openEdit(item)
}

const deleteItemFromAction = (item) => {
  closeAction()
  deleteItem(item)
}

const deleteItem = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus surat masuk?',
    html: `<p>Data <strong>${htmlText(item.nomor_surat_masuk)}</strong> akan dihapus.</p>`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  try {
    const response = await api.delete(`/nomor-surat/surat-masuk/${item.id}`)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: response.data?.message || 'Data berhasil dihapus.',
      timer: 1400,
      showConfirmButton: false
    })

    await loadData(1)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Data gagal dihapus.'
    })
  }
}

const openInfo = async (item) => {
  selectedItem.value = item
  infoModal.value = true

  try {
    const response = await api.get(`/nomor-surat/surat-masuk/${item.id}`)
    selectedItem.value = response.data?.data || item
    detailDisposisis.value = selectedItem.value?.disposisis || []
  } catch (error) {
    detailDisposisis.value = []
  }
}

const closeInfo = () => {
  infoModal.value = false
  selectedItem.value = null
  detailDisposisis.value = []
}

const openDisposisi = (item) => {
  if (!item.can_act_disposisi) {
    Swal.fire({ icon: 'info', title: 'Aksi tidak tersedia', text: 'Disposisi ini sudah diproses atau Anda bukan penerima disposisi aktif.' })
    return
  }

  selectedItem.value = item

  disposisiForm.perlu_disposisi = true
  disposisiForm.tujuan_disposisi = []
  disposisiForm.cc_tembusan = []
  disposisiForm.keterangan = ''
  disposisiForm.perlu_balasan = false
  disposisiForm.catatan_balasan = ''
  dokumenBalasanFile.value = null
  disposisiModal.value = true
}

const closeDisposisi = () => {
  disposisiModal.value = false
  selectedItem.value = null
}

const submitDisposisi = async () => {
  if (!disposisiForm.keterangan) {
    Swal.fire({ icon: 'warning', title: 'Keterangan wajib diisi' })
    return
  }

  if (disposisiForm.perlu_disposisi && disposisiForm.tujuan_disposisi.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Tujuan disposisi wajib dipilih' })
    return
  }


  savingDisposisi.value = true

  try {
    const payload = new FormData()

    payload.append('perlu_disposisi', disposisiForm.perlu_disposisi ? '1' : '0')
    payload.append('keterangan', disposisiForm.keterangan || '')
    payload.append('perlu_balasan', disposisiForm.perlu_balasan ? '1' : '0')
    payload.append('keterangan_balasan', disposisiForm.catatan_balasan || '')

    if (disposisiForm.perlu_disposisi) {
      disposisiForm.tujuan_disposisi.forEach((target) => payload.append('tujuan_disposisi[]', target))
      disposisiForm.cc_tembusan.forEach((target) => payload.append('cc_tembusan[]', target))
    }

    if (dokumenBalasanFile.value) {
      payload.append('dokumen_balasan', dokumenBalasanFile.value)
    }

    await api.post(`/nomor-surat/surat-masuk/${selectedItem.value.id}/disposisi`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Proses disposisi berhasil disimpan.',
      timer: 1400,
      showConfirmButton: false
    })

    closeDisposisi()
    await loadData(pagination.current_page)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Disposisi gagal disimpan.'
    })
  } finally {
    savingDisposisi.value = false
  }
}

const toInputDate = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const formatDate = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusBadge = (status) => {
  if (status === 'Selesai') return 'bg-success'
  if (status === 'Proses Disposisi') return 'bg-primary'
  if (status === 'Tidak Perlu Disposisi') return 'bg-secondary'
  return 'bg-warning text-dark'
}

onMounted(async () => {
  await loadTargets()
  await loadData()
})
</script>

<style scoped>
.surat-masuk-page {
  min-height: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.page-head h3 {
  margin: 0;
  font-size: 23px;
  font-weight: 950;
  color: #0f172a;
}

.page-head p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
}

.surat-form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  margin-bottom: 14px;
}

.surat-form-head {
  min-height: 54px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.surat-form-head h5 {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
}

.surat-form-head p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
}

.btn-toggle-form {
  border: 1px solid #94a3b8;
  background: #ffffff;
  color: #334155;
  border-radius: 9px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.surat-form-body {
  padding: 14px 16px 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px 12px;
}

.form-item {
  min-width: 0;
}

.form-item.full {
  grid-column: 1 / -1;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #1e293b;
  font-size: 11.5px;
  font-weight: 900;
}

.form-item label span {
  color: #ef4444;
}

.form-control,
.form-select {
  min-height: 36px;
  border-radius: 8px;
  border-color: #dbe3ef;
  font-size: 12.5px;
  font-weight: 650;
}

textarea.form-control {
  min-height: 52px;
  resize: vertical;
}

.secret-box {
  display: flex;
  align-items: stretch;
}

.secret-check {
  width: 100%;
  min-height: 62px;
  padding: 9px 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.secret-check input {
  margin-top: 3px;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.secret-check label {
  margin: 0;
  cursor: pointer;
}

.secret-check strong {
  display: block;
  color: #0f172a;
  font-size: 12px;
  font-weight: 950;
}

.secret-check small {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.35;
  font-weight: 650;
}

.form-action-bar {
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-light-custom {
  border: 0;
  background: #f8fafc;
  color: #334155;
  border-radius: 9px;
  padding: 8px 13px;
  font-size: 12px;
  font-weight: 850;
}

.btn-primary-custom {
  border: 0;
  background: #2563eb;
  color: #ffffff;
  border-radius: 9px;
  padding: 8px 15px;
  font-size: 12px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.btn-primary-custom:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .surat-form-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .btn-toggle-form {
    width: 100%;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-action-bar {
    flex-direction: column-reverse;
  }

  .btn-light-custom,
  .btn-primary-custom {
    width: 100%;
    justify-content: center;
  }
}

.compact-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, .05);
  overflow: hidden;
}

.card-head {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-head strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.card-head small {
  color: #64748b;
  font-weight: 800;
}

.form-label {
  margin-bottom: 4px;
  color: #334155;
  font-size: 11.5px;
  font-weight: 850;
}

.table {
  margin-bottom: 0;
  font-size: 12px;
}

.table th {
  background: #f8fafc;
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 950;
  white-space: nowrap;
}

.link-button {
  border: 0;
  background: transparent;
  color: #2563eb;
  padding: 0;
  font-size: 11px;
  font-weight: 800;
  text-decoration: underline;
}

.action-cell {
  position: relative;
  overflow: visible !important;
  min-width: 105px;
}

.action-cell.is-open {
  z-index: 9999;
}

.action-dropdown {
  position: relative;
  display: inline-block;
}

.action-icon-btn {
  width: 36px;
  height: 32px;
  border: 1px solid #dbe3ef;
  border-radius: 9px;
  background: #ffffff;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: .15s ease;
}

.action-icon-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.action-locked {
  color: #cbd5e1;
  font-size: 11px;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 34px;
  width: 190px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, .18);
  z-index: 99999;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-menu button {
  width: 100%;
  min-height: 34px;
  border: 0;
  background: transparent;
  color: #334155;
  padding: 8px 9px;
  text-align: left;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 850;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-menu button:hover:not(:disabled) {
  background: #f8fafc;
}

.action-menu button.primary-action {
  color: #1d4ed8;
  background: #eff6ff;
}

.action-menu button:disabled {
  opacity: .45;
}

.action-menu button.danger {
  color: #dc2626;
}

.secret-check {
  min-height: 31px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 850;
  color: #334155;
}

.reply-box {
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 13px;
  background: linear-gradient(180deg, #f8fbff 0%, #f8fafc 100%);
  margin-top: 8px;
}

.reply-box-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.reply-box-head strong {
  display: block;
  color: #0f172a;
  font-size: 12px;
}

.reply-box-head small {
  display: block;
  color: #64748b;
  margin-top: 2px;
  font-size: 10.5px;
}

.optional-badge {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 850;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 9px;
}

.history-head h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 950;
}

.history-head small {
  color: #64748b;
  font-size: 10.5px;
}

.history-count {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 850;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 11px;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #cbd5e1;
  background: #ffffff;
  border-radius: 13px;
  padding: 11px 12px 12px 10px;
  margin-bottom: 9px;
  box-shadow: 0 5px 16px rgba(15, 23, 42, .04);
}

.timeline-item.timeline-active {
  border-left-color: #2563eb;
  background: #f8fbff;
}

.timeline-dot {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  border-radius: 50%;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 950;
}

.timeline-content {
  min-width: 0;
  flex: 1;
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 9px;
}

.timeline-top small {
  color: #64748b;
  font-size: 10.5px;
  white-space: nowrap;
}

.history-status {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}

.status-sent { background: #dbeafe; color: #1d4ed8; }
.status-done { background: #dcfce7; color: #166534; }
.status-forwarded { background: #fef3c7; color: #92400e; }
.status-info { background: #e2e8f0; color: #475569; }

.history-number {
  margin-left: 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 750;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.history-grid > div {
  padding: 8px 9px;
  border: 1px solid #eef2f7;
  border-radius: 9px;
  background: #f8fafc;
}

.history-grid .wide { grid-column: 1 / -1; }

.history-label {
  display: block;
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .02em;
  margin-bottom: 3px;
}

.history-grid strong {
  display: block;
  color: #1e293b;
  font-size: 11px;
  line-height: 1.45;
  word-break: break-word;
}

.history-text { white-space: pre-wrap; }

.reply-history {
  margin-top: 9px;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
}

.reply-history-title {
  color: #1e40af;
  font-size: 11px;
  font-weight: 950;
  margin-bottom: 6px;
}

.reply-history-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  border-top: 1px solid rgba(148, 163, 184, .18);
  color: #475569;
  font-size: 10.5px;
}

.reply-history-row strong {
  color: #1e293b;
  text-align: right;
}

.attachment-actions {
  display: inline-flex;
  gap: 5px;
}

.attachment-btn {
  border: 1px solid #bfdbfe;
  background: #ffffff;
  color: #1d4ed8;
  border-radius: 7px;
  padding: 4px 7px;
  font-size: 10px;
  font-weight: 850;
}

.attachment-btn:hover { background: #dbeafe; }

.pagination-row {
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(15, 23, 42, .56);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}

.modal-card {
  width: min(720px, 96vw);
  max-height: calc(100vh - 36px);
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 50px rgba(15, 23, 42, .24);
}

.modal-lg-card {
  width: min(880px, 96vw);
}

.modal-head {
  flex: 0 0 auto;
  padding: 13px 15px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head strong {
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.modal-head button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 15px;
}

.modal-foot {
  flex: 0 0 auto;
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-grid div {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
}

.detail-grid .wide {
  grid-column: 1 / -1;
}

.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.detail-grid strong {
  display: block;
  color: #0f172a;
  font-size: 12.5px;
  margin-top: 3px;
  word-break: break-word;
}

.timeline-item {
  border-left: 3px solid #2563eb;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.timeline-item strong,
.timeline-item small {
  display: block;
}

.timeline-item p {
  margin: 6px 0;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 12px;
}

.multi-select {
  min-height: 128px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 850;
}

.finish-box {
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.pwa-page .page-head {
  align-items: center;
}

.pwa-page .page-head h3 {
  font-size: 20px;
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
  }

  .secret-check {
  min-height: 31px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 850;
  color: #334155;
}

.reply-box {
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 13px;
  background: linear-gradient(180deg, #f8fbff 0%, #f8fafc 100%);
  margin-top: 8px;
}

.reply-box-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.reply-box-head strong {
  display: block;
  color: #0f172a;
  font-size: 12px;
}

.reply-box-head small {
  display: block;
  color: #64748b;
  margin-top: 2px;
  font-size: 10.5px;
}

.optional-badge {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 850;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 9px;
}

.history-head h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 950;
}

.history-head small {
  color: #64748b;
  font-size: 10.5px;
}

.history-count {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 850;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 11px;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #cbd5e1;
  background: #ffffff;
  border-radius: 13px;
  padding: 11px 12px 12px 10px;
  margin-bottom: 9px;
  box-shadow: 0 5px 16px rgba(15, 23, 42, .04);
}

.timeline-item.timeline-active {
  border-left-color: #2563eb;
  background: #f8fbff;
}

.timeline-dot {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  border-radius: 50%;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 950;
}

.timeline-content {
  min-width: 0;
  flex: 1;
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 9px;
}

.timeline-top small {
  color: #64748b;
  font-size: 10.5px;
  white-space: nowrap;
}

.history-status {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}

.status-sent { background: #dbeafe; color: #1d4ed8; }
.status-done { background: #dcfce7; color: #166534; }
.status-forwarded { background: #fef3c7; color: #92400e; }
.status-info { background: #e2e8f0; color: #475569; }

.history-number {
  margin-left: 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 750;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.history-grid > div {
  padding: 8px 9px;
  border: 1px solid #eef2f7;
  border-radius: 9px;
  background: #f8fafc;
}

.history-grid .wide { grid-column: 1 / -1; }

.history-label {
  display: block;
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .02em;
  margin-bottom: 3px;
}

.history-grid strong {
  display: block;
  color: #1e293b;
  font-size: 11px;
  line-height: 1.45;
  word-break: break-word;
}

.history-text { white-space: pre-wrap; }

.reply-history {
  margin-top: 9px;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
}

.reply-history-title {
  color: #1e40af;
  font-size: 11px;
  font-weight: 950;
  margin-bottom: 6px;
}

.reply-history-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  border-top: 1px solid rgba(148, 163, 184, .18);
  color: #475569;
  font-size: 10.5px;
}

.reply-history-row strong {
  color: #1e293b;
  text-align: right;
}

.attachment-actions {
  display: inline-flex;
  gap: 5px;
}

.attachment-btn {
  border: 1px solid #bfdbfe;
  background: #ffffff;
  color: #1d4ed8;
  border-radius: 7px;
  padding: 4px 7px;
  font-size: 10px;
  font-weight: 850;
}

.attachment-btn:hover { background: #dbeafe; }

.pagination-row {
    justify-content: center;
  }

  .detail-grid,
  .history-grid {
    grid-template-columns: 1fr;
  }

  .history-grid .wide {
    grid-column: auto;
  }

  .timeline-top {
    flex-direction: column;
  }

  .reply-history-row {
    flex-direction: column;
  }

  .reply-history-row strong {
    text-align: left;
  }

  .modal-layer {
    align-items: flex-end;
    padding: 0;
  }

  .modal-card {
    width: 100%;
    max-height: calc(100dvh - 12px);
    border-radius: 18px 18px 0 0;
  }
}
</style>
