<template>
  <PegawaiPwa
    v-if="isPwa"
    :loading="loading"
    :pegawais="pegawais"
    :filtered-pegawais="filteredPegawais"
    :paginated-pegawais="paginatedPegawais"
    :search-pegawai="searchPegawai"
    :filter-unit-kerja-pegawai="filterUnitKerjaPegawai"
    :filter-status-pegawai="filterStatusPegawai"
    :unit-kerja-options="unitKerjaOptions"
    :pegawai-current-page="pegawaiCurrentPage"
    :pegawai-total-pages="pegawaiTotalPages"
    :pegawai-pagination-pages="pegawaiPaginationPages"
    :format-tanggal="formatTanggal"
    :set-search-pegawai="setSearchPegawai"
    :set-filter-unit-kerja-pegawai="setFilterUnitKerjaPegawai"
    :set-filter-status-pegawai="setFilterStatusPegawai"
    :reset-filter-pegawai="resetFilterPegawai"
    :change-pegawai-page="changePegawaiPage"
    :load-pegawai="loadPegawai"
    :tambah-pegawai="tambahPegawai"
    :open-import-modal="openImportModal"
    :download-template-excel="downloadTemplateExcel"
    :export-pegawai-excel="exportPegawaiExcel"
    :lihat-detail-pegawai="lihatDetailPegawai"
    :lihat-riwayat="lihatRiwayat"
    :edit-pegawai="editPegawai"
    :hapus-pegawai="hapusPegawai"
  />

  <PegawaiWeb
    v-else
    :loading="loading"
    :pegawais="pegawais"
    :filtered-pegawais="filteredPegawais"
    :paginated-pegawais="paginatedPegawais"
    :search-pegawai="searchPegawai"
    :filter-unit-kerja-pegawai="filterUnitKerjaPegawai"
    :filter-status-pegawai="filterStatusPegawai"
    :unit-kerja-options="unitKerjaOptions"
    :pegawai-current-page="pegawaiCurrentPage"
    :pegawai-per-page="pegawaiPerPage"
    :pegawai-total-pages="pegawaiTotalPages"
    :pegawai-pagination-pages="pegawaiPaginationPages"
    :open-pegawai-action-id="openPegawaiActionId"
    :set-search-pegawai="setSearchPegawai"
    :set-filter-unit-kerja-pegawai="setFilterUnitKerjaPegawai"
    :set-filter-status-pegawai="setFilterStatusPegawai"
    :reset-filter-pegawai="resetFilterPegawai"
    :change-pegawai-page="changePegawaiPage"
    :toggle-pegawai-action="togglePegawaiAction"
    :close-pegawai-action="closePegawaiAction"
    :load-pegawai="loadPegawai"
    :tambah-pegawai="tambahPegawai"
    :open-import-modal="openImportModal"
    :download-template-excel="downloadTemplateExcel"
    :export-pegawai-excel="exportPegawaiExcel"
    :lihat-detail-pegawai="lihatDetailPegawai"
    :lihat-riwayat="lihatRiwayat"
    :edit-pegawai="editPegawai"
    :hapus-pegawai="hapusPegawai"
  />

  <!-- Modal Tambah/Edit Pegawai -->
  <div v-if="showModal" class="modal-backdrop-custom">
    <div class="modal-card-wide">
      <div class="modal-header-custom">
        <div>
          <h5 class="mb-0">
            {{ isEdit ? 'Edit Data Pegawai' : 'Tambah Data Pegawai' }}
          </h5>
          <small class="text-muted">
            Lengkapi data pegawai sesuai kebutuhan database PKWT.
          </small>
        </div>

        <button type="button" class="btn-close" @click="tutupModal"></button>
      </div>

      <div class="modal-body-scroll">
        <div class="section-title mb-3">
          Identitas Pegawai
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <label class="form-label">NIP</label>
            <input v-model="form.nip" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">Kategori Pegawai</label>
            <select v-model="form.kategori_pegawai" class="form-select form-select-sm">
              <option value="Pegawai Internal">Pegawai Internal</option>
              <option value="Pegawai Outsource">Pegawai Outsource</option>
              <option value="PKWT">PKWT</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Nama Pegawai</label>
            <input v-model="form.nama" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">NIK</label>
            <input v-model="form.nik" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">Jenis Kelamin</label>
            <select v-model="form.jenis_kelamin" class="form-select form-select-sm">
              <option value="">Pilih</option>
              <option v-for="item in jenisKelaminOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Tempat Lahir</label>
            <input v-model="form.tempat_lahir" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">Tanggal Lahir</label>
            <input v-model="form.tanggal_lahir" type="date" class="form-control form-control-sm">
            <small class="text-muted">Usia: {{ usiaPreview }}</small>
          </div>
        </div>

        <div class="section-title mb-3">
          Informasi Pekerjaan
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">Jabatan</label>
            <input v-model="form.jabatan" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Unit Kerja</label>
            <input v-model="form.unit_kerja" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Departemen</label>
            <input v-model="form.departemen" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Lokasi Kerja</label>
            <input v-model="form.lokasi_kerja" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Tanggal Masuk</label>
            <input v-model="form.tanggal_masuk" type="date" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Status</label>
            <select v-model="form.status" class="form-select form-select-sm">
              <option value="Aktif">Aktif</option>
              <option value="Non Aktif">Non Aktif</option>
            </select>
          </div>

          <div v-if="form.status === 'Non Aktif'" class="row mt-3">
            <div class="col-md-4 mb-3">
              <label class="form-label">Tanggal Terminasi</label>
              <input
                v-model="form.tanggal_terminasi"
                type="date"
                class="form-control form-control-sm"
                required
              >
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Alasan Terminasi</label>
              <select
                v-model="form.alasan_terminasi"
                class="form-select form-select-sm"
                required
              >
                <option value="">-- Pilih Alasan --</option>
                <option value="Berakhir Kontrak">Berakhir Kontrak</option>
                <option value="Resign">Resign</option>
                <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                <option value="Pensiun">Pensiun</option>
                <option value="Selesai Penugasan">Selesai Penugasan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label">Keterangan Terminasi</label>
              <textarea
                v-model="form.keterangan_terminasi"
                class="form-control form-control-sm"
                rows="2"
                placeholder="Keterangan tambahan"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="section-title mb-3">
          Kontak & Alamat
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">No. HP / WhatsApp</label>
            <input v-model="form.no_hp_whatsapp" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Email</label>
            <input v-model="form.alamat_email" type="email" class="form-control form-control-sm">
          </div>

          <div class="col-md-4">
            <label class="form-label">Status Pernikahan</label>
            <select v-model="form.status_pernikahan" class="form-select form-select-sm">
              <option value="">Pilih</option>
              <option v-for="item in statusPernikahanOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Alamat KTP</label>
            <textarea v-model="form.alamat_ktp" class="form-control form-control-sm" rows="3"></textarea>
          </div>

          <div class="col-md-6">
            <label class="form-label">Alamat Domisili</label>
            <textarea v-model="form.alamat_domisili" class="form-control form-control-sm" rows="3"></textarea>
            <small class="text-muted">Jika kosong, sistem memakai alamat KTP.</small>
          </div>
        </div>

        <div class="section-title mb-3">
          Data Keluarga
        </div>

        <div class="family-form-card mb-3">
          <div class="family-form-head">
            <div>
              <strong>Anggota Keluarga</strong>
              <small class="text-muted d-block">
                Tambahkan satu atau lebih anggota keluarga pegawai.
              </small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="tambahKeluarga">
              <i class="fas fa-plus me-1"></i>
              Tambah Keluarga
            </button>
          </div>

          <div v-if="form.keluarga.length === 0" class="family-empty">
            Belum ada data keluarga. Klik <strong>Tambah Keluarga</strong> untuk menambahkan.
          </div>

          <div
            v-for="(anggota, index) in form.keluarga"
            :key="anggota._key"
            class="family-item"
          >
            <div class="family-item-head">
              <strong>Anggota {{ index + 1 }}</strong>
              <button type="button" class="btn btn-sm btn-outline-danger" @click="hapusKeluarga(index)">
                <i class="fas fa-trash me-1"></i>
                Hapus
              </button>
            </div>

            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Pilih Keluarga</label>
                <select v-model="anggota.hubungan" class="form-select form-select-sm">
                  <option value="">Pilih</option>
                  <option v-for="item in hubunganKeluargaOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="col-md-5">
                <label class="form-label">Nama Lengkap</label>
                <input v-model="anggota.nama_lengkap" type="text" class="form-control form-control-sm" placeholder="Nama lengkap anggota keluarga">
              </div>

              <div class="col-md-4">
                <label class="form-label">No. Telp <span class="text-muted">(Opsional)</span></label>
                <input v-model="anggota.no_telp" type="text" class="form-control form-control-sm" placeholder="08xxxxxxxxxx">
              </div>

              <div class="col-12">
                <div class="form-check family-address-check">
                  <input
                    :id="`keluarga-sama-${anggota._key}`"
                    v-model="anggota.alamat_sama_dengan_pegawai"
                    class="form-check-input"
                    type="checkbox"
                  >
                  <label class="form-check-label" :for="`keluarga-sama-${anggota._key}`">
                    Alamat tempat tinggal sama dengan alamat pegawai
                  </label>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">Alamat Tempat Tinggal Saat Ini</label>
                <textarea
                  v-if="!anggota.alamat_sama_dengan_pegawai"
                  v-model="anggota.alamat"
                  class="form-control form-control-sm"
                  rows="2"
                  placeholder="Alamat tempat tinggal anggota keluarga saat ini"
                ></textarea>
                <div v-else class="family-same-address">
                  <i class="fas fa-location-dot me-1"></i>
                  {{ alamatPegawaiForm || 'Alamat pegawai belum diisi.' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-title mb-3">
          Pendidikan, BPJS, Pajak & Bank
        </div>

        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Agama</label>
            <select v-model="form.agama" class="form-select form-select-sm">
              <option value="">Pilih</option>
              <option v-for="item in agamaOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Pendidikan Terakhir</label>
            <select v-model="form.pendidikan_terakhir" class="form-select form-select-sm">
              <option value="">Pilih</option>
              <option v-for="item in pendidikanOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Program Studi</label>
            <input v-model="form.program_studi" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">Nama Sekolah</label>
            <input v-model="form.nama_sekolah" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">No. BPJS Kesehatan</label>
            <input v-model="form.no_bpjs_kesehatan" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">No. BPJS Ketenagakerjaan</label>
            <input v-model="form.no_bpjs_ketenagakerjaan" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">NPWP</label>
            <input v-model="form.npwp" type="text" class="form-control form-control-sm">
          </div>

          <div class="col-md-3">
            <label class="form-label">Nama Bank</label>
            <select v-model="form.nama_bank" class="form-select form-select-sm">
              <option value="">Pilih</option>
              <option v-for="item in bankOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">No. Rekening</label>
            <input v-model="form.no_rekening" type="text" class="form-control form-control-sm">
          </div>
        </div>
      </div>

      <div class="modal-footer-custom">
        <button type="button" class="btn btn-sm btn-light" @click="tutupModal">
          Batal
        </button>

        <button type="button" class="btn btn-sm btn-primary" @click="simpanPegawai">
          <i class="fas fa-save me-1"></i>
          Simpan
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Detail Pegawai -->
  <div v-if="showDetailModal" class="modal-backdrop-custom">
    <div class="modal-card-detail">
      <div class="modal-header-custom">
        <div>
          <h5 class="mb-0">Detail Pegawai</h5>
          <small class="text-muted">
            {{ detailPegawai?.nip || '-' }} - {{ detailPegawai?.nama || '-' }}
          </small>
        </div>

        <button type="button" class="btn-close" @click="tutupDetailModal"></button>
      </div>

      <div class="modal-body-scroll">
        <div class="detail-section">
          <h6>Identitas</h6>

          <div class="detail-row">
            <div class="detail-label">NIP</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.nip || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Nama</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.nama || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">NIK</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.nik || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">TTL</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">
              {{ detailPegawai?.tempat_lahir || '-' }},
              {{ formatTanggal(detailPegawai?.tanggal_lahir) }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Jenis Kelamin</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.jenis_kelamin || '-' }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h6>Pekerjaan</h6>

          <div class="detail-row">
            <div class="detail-label">Jabatan</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.jabatan || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Unit Kerja</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.unit_kerja || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Departemen</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.departemen || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Lokasi Kerja</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.lokasi_kerja || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Tanggal Masuk</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ formatTanggal(detailPegawai?.tanggal_masuk) }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Status</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.status || '-' }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h6>Kontak & Administrasi</h6>

          <div class="detail-row">
            <div class="detail-label">No. HP / WA</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.no_hp_whatsapp || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Email</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.alamat_email || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Alamat Domisili</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ tampilAlamatDomisili }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">BPJS Kesehatan</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.no_bpjs_kesehatan || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">BPJS TK</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.no_bpjs_ketenagakerjaan || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">NPWP</div>
            <div class="detail-separator">:</div>
            <div class="detail-value">{{ detailPegawai?.npwp || '-' }}</div>
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-section-heading">
            <div>
              <h6 class="mb-0">Data Keluarga</h6>
              <small class="text-muted">{{ (detailPegawai?.keluargas || []).length }} anggota keluarga</small>
            </div>
          </div>

          <div v-if="!detailPegawai?.keluargas?.length" class="family-empty">
            Belum ada data keluarga.
          </div>

          <div v-else class="family-detail-list">
            <div
              v-for="(anggota, index) in detailPegawai.keluargas"
              :key="anggota.id || index"
              class="family-detail-card"
            >
              <div class="family-detail-top">
                <span class="family-badge">{{ anggota.hubungan || '-' }}</span>
                <strong>{{ anggota.nama_lengkap || '-' }}</strong>
              </div>

              <div class="family-detail-grid">
                <div>
                  <small>No. Telp</small>
                  <span>{{ anggota.no_telp || '-' }}</span>
                </div>
                <div>
                  <small>Alamat</small>
                  <span>{{ alamatKeluargaDetail(anggota) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer-custom">
        <button type="button" class="btn btn-sm btn-light" @click="tutupDetailModal">
          Tutup
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Riwayat PKWT -->
  <div v-if="showRiwayatModal" class="modal-backdrop-custom">
    <div class="modal-card-wide">
      <div class="modal-header-custom">
        <div>
          <h5 class="mb-0">Riwayat PKWT</h5>
          <small class="text-muted">
            {{ selectedPegawai?.nip || '-' }} - {{ selectedPegawai?.nama || '-' }}
          </small>
        </div>

        <button type="button" class="btn-close" @click="showRiwayatModal = false"></button>
      </div>

      <div class="modal-body-scroll">
        <div v-if="riwayatPkwt.length === 0" class="text-center text-muted py-4">
          Belum ada riwayat PKWT.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>No</th>
                <th>Nomor PKWT</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Berakhir</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in riwayatPkwt" :key="item.id || index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.nomor_kontrak || item.nomor_pkwt || '-' }}</td>
                <td>{{ formatTanggal(item.tanggal_mulai) }}</td>
                <td>{{ formatTanggal(item.tanggal_berakhir) }}</td>
                <td>{{ item.status || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer-custom">
        <button type="button" class="btn btn-sm btn-light" @click="showRiwayatModal = false">
          Tutup
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Upload Excel -->
  <div class="modal fade" id="importExcelModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Excel Pegawai & PKWT</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="alert alert-info small">
            Download template terlebih dahulu, isi data, lalu upload file Excel untuk preview sebelum disimpan.
          </div>

          <div class="mb-3">
            <button type="button" class="btn btn-sm btn-outline-success" @click="downloadTemplateExcel">
              <i class="fas fa-download me-1"></i>
              Download Template Excel
            </button>
          </div>

          <label class="form-label">File Excel</label>
          <input
            ref="fileExcelInput"
            type="file"
            class="form-control"
            accept=".xlsx,.xls,.csv"
            @change="fileExcel = $event.target.files[0] || null"
          >
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">
            Batal
          </button>

          <button type="button" class="btn btn-primary" @click="previewImport">
            <i class="fas fa-eye me-1"></i>
            Preview
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Preview Import -->
  <div class="modal fade" id="previewImportModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h5 class="modal-title">Preview Import Data Pegawai & PKWT</h5>
            <small class="text-muted">
              Koreksi data sebelum disimpan ke database.
            </small>
          </div>

          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <div class="card border-0 bg-light">
                <div class="card-body py-2">
                  <small class="text-muted">Total Data</small>
                  <h5 class="mb-0">{{ previewData.length }}</h5>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card border-0 bg-success-subtle">
                <div class="card-body py-2">
                  <small class="text-muted">Data Valid</small>
                  <h5 class="mb-0 text-success">{{ validCount }}</h5>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card border-0 bg-danger-subtle">
                <div class="card-body py-2">
                  <small class="text-muted">Data Invalid</small>
                  <h5 class="mb-0 text-danger">{{ invalidCount }}</h5>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-bordered align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 60px;">No</th>
                  <th style="width: 130px;">NIP</th>
                  <th style="min-width: 220px;">Nama Pegawai</th>
                  <th style="min-width: 180px;">Jabatan</th>
                  <th style="min-width: 180px;">Unit Kerja</th>
                  <th style="width: 145px;">Tanggal Masuk</th>
                  <th style="width: 145px;">Mulai PKWT</th>
                  <th style="width: 145px;">Selesai PKWT</th>
                  <th style="min-width: 170px;">Nomor PKWT</th>
                  <th style="min-width: 220px;">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(row, index) in paginatedPreviewData"
                  :key="row.row_number || index"
                  :class="{ 'table-danger': row.errors && row.errors.length }"
                >
                  <td>{{ (previewCurrentPage - 1) * previewPerPage + index + 1 }}</td>

                  <td>
                    <input v-model="row.nip" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.nama" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.jabatan" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.unit_kerja" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.tanggal_masuk" type="date" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.tanggal_mulai" type="date" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.tanggal_berakhir" type="date" class="form-control form-control-sm">
                  </td>

                  <td>
                    <input v-model="row.nomor_kontrak" class="form-control form-control-sm">
                  </td>

                  <td>
                    <span
                      class="badge"
                      :class="row.errors && row.errors.length ? 'bg-danger' : 'bg-success'"
                    >
                      {{ row.errors && row.errors.length ? 'Invalid' : 'Valid' }}
                    </span>

                    <div
                      v-if="row.errors && row.errors.length"
                      class="small text-danger mt-1"
                    >
                      <div v-for="(error, errorIndex) in row.errors" :key="errorIndex">
                        {{ error }}
                      </div>
                    </div>

                    <div v-else class="small text-success mt-1">
                      Siap disimpan.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="previewTotalPages > 1" class="d-flex justify-content-end align-items-center gap-2 mt-3">
            <button
              type="button"
              class="btn btn-sm btn-light"
              :disabled="previewCurrentPage === 1"
              @click="changePreviewPage(previewCurrentPage - 1)"
            >
              Sebelumnya
            </button>

            <button
              v-for="page in previewPaginationPages"
              :key="page"
              type="button"
              class="btn btn-sm"
              :class="page === previewCurrentPage ? 'btn-primary' : 'btn-light'"
              :disabled="page === '...'"
              @click="page !== '...' && changePreviewPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="btn btn-sm btn-light"
              :disabled="previewCurrentPage === previewTotalPages"
              @click="changePreviewPage(previewCurrentPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">
            Batal
          </button>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="hasError || previewData.length === 0"
            @click="storeImport"
          >
            <i class="fas fa-save me-1"></i>
            Simpan ke Database
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as bootstrap from 'bootstrap'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'

import PegawaiWeb from './components/PegawaiWeb.vue'
import PegawaiPwa from './components/PegawaiPwa.vue'

const { isPwa } = usePwaMode()
const loading = ref(false)

const pegawais = ref([])

const searchPegawai = ref('')
const filterUnitKerjaPegawai = ref('')
const filterStatusPegawai = ref('')

const setSearchPegawai = (value) => {
  searchPegawai.value = value
}

const setFilterUnitKerjaPegawai = (value) => {
  filterUnitKerjaPegawai.value = value
}

const setFilterStatusPegawai = (value) => {
  filterStatusPegawai.value = value
}

const unitKerjaOptions = computed(() => {
  return [...new Set(
    pegawais.value
      .map(item => item.unit_kerja)
      .filter(Boolean)
  )].sort()
})

const filteredPegawais = computed(() => {
  const keyword = searchPegawai.value.toLowerCase().trim()

  return pegawais.value.filter(item => {
    const nip = String(item.nip ?? '').toLowerCase()
    const nama = String(item.nama ?? '').toLowerCase()
    const jabatan = String(item.jabatan ?? '').toLowerCase()
    const unitKerja = String(item.unit_kerja ?? '')
    const status = String(item.status ?? '')

    const cocokKeyword =
      !keyword ||
      nip.includes(keyword) ||
      nama.includes(keyword) ||
      jabatan.includes(keyword)

    const cocokUnit =
      !filterUnitKerjaPegawai.value ||
      unitKerja === filterUnitKerjaPegawai.value

    const cocokStatus =
      !filterStatusPegawai.value ||
      status === filterStatusPegawai.value

    return cocokKeyword && cocokUnit && cocokStatus
  })
})

const resetFilterPegawai = () => {
  searchPegawai.value = ''
  filterUnitKerjaPegawai.value = ''
  filterStatusPegawai.value = ''
  pegawaiCurrentPage.value = 1
}

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const showRiwayatModal = ref(false)
const selectedPegawai = ref(null)
const riwayatPkwt = ref([])

const openPegawaiActionId = ref(null)

const togglePegawaiAction = (id) => {
  openPegawaiActionId.value = openPegawaiActionId.value === id ? null : id
}

const closePegawaiAction = () => {
  openPegawaiActionId.value = null
}

const fileExcel = ref(null)
const previewData = ref([])

const form = ref({
  nip: '',
  kategori_pegawai: 'Pegawai Internal',
  nama: '',
  jabatan: '',
  unit_kerja: '',
  departemen: '',
  lokasi_kerja: '',
  nik: '',
  jenis_kelamin: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  no_hp_whatsapp: '',
  alamat_ktp: '',
  alamat_domisili: '',
  status_pernikahan: '',
  agama: '',
  pendidikan_terakhir: '',
  program_studi: '',
  nama_sekolah: '',
  no_bpjs_kesehatan: '',
  no_bpjs_ketenagakerjaan: '',
  npwp: '',
  no_rekening: '',
  nama_bank: '',
  alamat_email: '',
  tanggal_masuk: '',
  status: 'Aktif',
  tanggal_terminasi: '',
  alasan_terminasi: '',
  keterangan_terminasi: '',
  keluarga: [],
})

const resetForm = () => {
  form.value = {
    nip: '',
    kategori_pegawai: 'Pegawai Internal',
    nama: '',
    jabatan: '',
    unit_kerja: '',
    departemen: '',
    lokasi_kerja: '',
    nik: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    no_hp_whatsapp: '',
    alamat_ktp: '',
    alamat_domisili: '',
    status_pernikahan: '',
    agama: '',
    pendidikan_terakhir: '',
    program_studi: '',
    nama_sekolah: '',
    no_bpjs_kesehatan: '',
    no_bpjs_ketenagakerjaan: '',
    npwp: '',
    no_rekening: '',
    nama_bank: '',
    alamat_email: '',
    tanggal_masuk: '',
    status: 'Aktif',
    tanggal_terminasi: '',
    alasan_terminasi: '',
    keterangan_terminasi: '',
    keluarga: [],
  }

  isEdit.value = false
  editId.value = null
}

const loadPegawai = async () => {
  loading.value = true

  try {
    const response = await api.get('/pegawai')

    // Mendukung response array langsung dan response { data: [...] }
    pegawais.value = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []

    pegawaiCurrentPage.value = 1
  } catch (error) {
    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengambil data pegawai.'
    })
  } finally {
    loading.value = false
  }
}

const openImportModal = () => {
  const modalElement = document.getElementById('importExcelModal')

  if (!modalElement) return

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement)
  modal.show()
}

onMounted(() => {
  loadPegawai()
})

const tambahPegawai = () => {
  resetForm()
  showModal.value = true
}

const simpanPegawai = async () => {
  try {
    const payload = {
      ...form.value,
      keluarga: form.value.keluarga.map(({ _key, ...item }) => ({
        ...item,
        alamat: item.alamat_sama_dengan_pegawai ? null : (item.alamat || null),
      }))
    }

    if (!payload.alamat_domisili || payload.alamat_domisili.trim() === '') {
      payload.alamat_domisili = payload.alamat_ktp
    }

    // Validasi khusus jika status pegawai menjadi Non Aktif / Terminasi
    if (payload.status === 'Non Aktif') {
      if (!payload.tanggal_terminasi) {
        alert('Tanggal terminasi wajib diisi.')
        return
      }

      if (!payload.alasan_terminasi) {
        alert('Alasan terminasi wajib dipilih.')
        return
      }
    }

    // Jika status kembali Aktif, kosongkan data terminasi
    if (payload.status === 'Aktif') {
      payload.tanggal_terminasi = null
      payload.alasan_terminasi = null
      payload.keterangan_terminasi = null
    }

    if (isEdit.value) {
      await api.put(`/pegawai/${editId.value}`, payload)
      alert('Data pegawai berhasil diperbarui.')
    } else {
      await api.post('/pegawai', payload)
      alert('Data pegawai berhasil ditambahkan.')
    }

    showModal.value = false
    resetForm()
    await loadPegawai()
  } catch (error) {
    console.error(error)

    if (error.response) {
      alert(JSON.stringify(error.response.data.errors ?? error.response.data, null, 2))
    } else {
      alert('Terjadi kesalahan saat menyimpan data pegawai.')
    }
  }
}

const editPegawai = (pegawai) => {
  isEdit.value = true
  editId.value = pegawai.id

  form.value = {
    nip: pegawai.nip ?? '',
    kategori_pegawai: pegawai.kategori_pegawai ?? 'Pegawai Internal',
    nama: pegawai.nama ?? '',
    jabatan: pegawai.jabatan ?? '',
    unit_kerja: pegawai.unit_kerja ?? '',
    departemen: pegawai.departemen ?? '',
    lokasi_kerja: pegawai.lokasi_kerja ?? '',
    nik: pegawai.nik ?? '',
    jenis_kelamin: pegawai.jenis_kelamin ?? '',
    tempat_lahir: pegawai.tempat_lahir ?? '',
    tanggal_lahir: pegawai.tanggal_lahir ?? '',
    no_hp_whatsapp: pegawai.no_hp_whatsapp ?? '',
    alamat_ktp: pegawai.alamat_ktp ?? '',
    alamat_domisili: pegawai.alamat_domisili ?? '',
    status_pernikahan: pegawai.status_pernikahan ?? '',
    agama: pegawai.agama ?? '',
    pendidikan_terakhir: pegawai.pendidikan_terakhir ?? '',
    program_studi: pegawai.program_studi ?? '',
    nama_sekolah: pegawai.nama_sekolah ?? '',
    no_bpjs_kesehatan: pegawai.no_bpjs_kesehatan ?? '',
    no_bpjs_ketenagakerjaan: pegawai.no_bpjs_ketenagakerjaan ?? '',
    npwp: pegawai.npwp ?? '',
    no_rekening: pegawai.no_rekening ?? '',
    nama_bank: pegawai.nama_bank ?? '',
    alamat_email: pegawai.alamat_email ?? '',
    tanggal_masuk: pegawai.tanggal_masuk ?? '',
    status: pegawai.status ?? 'Aktif',
    tanggal_terminasi: pegawai.tanggal_terminasi ?? '',
    alasan_terminasi: pegawai.alasan_terminasi ?? '',
    keterangan_terminasi: pegawai.keterangan_terminasi ?? '',
    keluarga: Array.isArray(pegawai.keluargas)
      ? pegawai.keluargas.map(item => buatKeluarga(item))
      : [],
  }

  showModal.value = true
}

const hapusPegawai = async (id) => {
  if (!confirm('Yakin ingin menghapus data pegawai ini?')) {
    return
  }

  try {
    await api.delete(`/pegawai/${id}`)
    alert('Data pegawai berhasil dihapus.')
    loadPegawai()
  } catch (error) {
    console.error(error)
    alert('Gagal menghapus data.')
  }
}

const lihatRiwayat = async (pegawai) => {
  selectedPegawai.value = pegawai

  try {
    const response = await api.get(`/pegawai/${pegawai.id}/riwayat-pkwt`)
    riwayatPkwt.value = response.data
    showRiwayatModal.value = true
  } catch (error) {
    console.error(error)
    alert('Gagal mengambil riwayat PKWT.')
  }
}

/* Pagination Data Pegawai */
const pegawaiCurrentPage = ref(1)
const pegawaiPerPage = ref(10)

const pegawaiTotalPages = computed(() => {
  return Math.ceil(filteredPegawais.value.length / pegawaiPerPage.value)
})

const paginatedPegawais = computed(() => {
  const start = (pegawaiCurrentPage.value - 1) * pegawaiPerPage.value
  return filteredPegawais.value.slice(start, start + pegawaiPerPage.value)
})

const changePegawaiPage = (page) => {
  if (page < 1 || page > pegawaiTotalPages.value) {
    return
  }

  pegawaiCurrentPage.value = page
}

const pegawaiPaginationPages = computed(() => {
  const total = pegawaiTotalPages.value
  const current = pegawaiCurrentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

watch(
  [searchPegawai, filterUnitKerjaPegawai, filterStatusPegawai],
  () => {
    pegawaiCurrentPage.value = 1
  }
)

/* Import Excel Preview */
const validCount = computed(() => {
  return previewData.value.filter(item => !item.errors || item.errors.length === 0).length
})

const invalidCount = computed(() => {
  return previewData.value.filter(item => item.errors && item.errors.length > 0).length
})

const hasError = computed(() => {
  return invalidCount.value > 0
})

const previewCurrentPage = ref(1)
const previewPerPage = ref(15)

const previewTotalPages = computed(() => {
  return Math.ceil(previewData.value.length / previewPerPage.value)
})

const paginatedPreviewData = computed(() => {
  const start = (previewCurrentPage.value - 1) * previewPerPage.value
  return previewData.value.slice(start, start + previewPerPage.value)
})

const changePreviewPage = (page) => {
  if (page < 1 || page > previewTotalPages.value) {
    return
  }

  previewCurrentPage.value = page
}

const previewPaginationPages = computed(() => {
  const total = previewTotalPages.value
  const current = previewCurrentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const previewImport = async () => {
  if (!fileExcel.value) {
    alert('Pilih file terlebih dahulu')
    return
  }

  try {
    previewData.value = []
    previewCurrentPage.value = 1

    const formData = new FormData()
    formData.append('file_excel', fileExcel.value)

    const result = await api.post('/pkwt/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('HASIL PREVIEW IMPORT:', result.data)

    const rows = result.data?.data ?? []

    if (!Array.isArray(rows) || rows.length === 0) {
      alert(result.data?.message ?? 'Data preview kosong. Pastikan file Excel berisi data.')
      return
    }

    previewData.value = rows.map(item => ({
      ...item,
      errors: item.errors || []
    }))

    previewCurrentPage.value = 1

    const uploadModalElement = document.getElementById('importExcelModal')
    const uploadModal = bootstrap.Modal.getOrCreateInstance(uploadModalElement)
    uploadModal.hide()

    setTimeout(() => {
      cleanupModalBackdrop()

      const previewModalElement = document.getElementById('previewImportModal')
      const previewModal = bootstrap.Modal.getOrCreateInstance(previewModalElement)
      previewModal.show()
    }, 300)
  } catch (error) {
    console.error(error)

    if (error.response) {
      alert(error.response.data?.message ?? JSON.stringify(error.response.data, null, 2))
    } else {
      alert('Gagal preview import Excel')
    }
  }
}

const storeImport = async () => {
  try {
    const response = await api.post('/pkwt/import/store', {
      data: previewData.value
    })

    alert(response.data.message)

    const previewModalElement = document.getElementById('previewImportModal')
    const previewModal = bootstrap.Modal.getOrCreateInstance(previewModalElement)
    previewModal.hide()

    setTimeout(() => {
      cleanupModalBackdrop()
    }, 300)

    previewData.value = []
    fileExcel.value = null
    previewCurrentPage.value = 1
    pegawaiCurrentPage.value = 1

    await loadPegawai()

  } catch (error) {
    console.error(error)

    if (error.response) {
      alert(JSON.stringify(error.response.data, null, 2))
    } else {
      alert('Gagal menyimpan data import')
    }
  }
}

const fileExcelInput = ref(null)

const usiaPreview = computed(() => {
  if (!form.value.tanggal_lahir) {
    return '-'
  }

  const today = new Date()
  const birthDate = new Date(form.value.tanggal_lahir)

  let usia = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    usia--
  }

  return `${usia} tahun`
})

const jenisKelaminOptions = [
  'Laki-laki',
  'Perempuan'
]

const statusPernikahanOptions = [
  'Lajang',
  'Menikah',
  'Cerai'
]

const agamaOptions = [
  'Islam',
  'Kristen Protestan',
  'Kristen Katolik',
  'Hindu',
  'Buddha',
  'Konghucu'
]

const pendidikanOptions = [
  'SD/Sederajat',
  'SMP/Sederajat',
  'SMA/Sederajat',
  'Diploma 1 (D1)',
  'Diploma 2 (D2)',
  'Diploma 3 (D3)',
  'Diploma 4 (D4)',
  'Sarjana (S1)',
  'Magister (S2)',
  'Doktor (S3)',
  'Profesi Khusus'
]

const bankOptions = [
  'Bank Mandiri',
  'BCA',
  'BRI',
  'BNI',
  'BSI',
  'BTN',
  'Bank Lainnya'
]

const hubunganKeluargaOptions = [
  'Ayah',
  'Ibu',
  'Kakak',
  'Adik',
  'Suami',
  'Istri',
  'Anak',
  'Keluarga Lainnya'
]

const buatKeluarga = (data = {}) => ({
  _key: data.id ? `existing-${data.id}` : `new-${Date.now()}-${Math.random()}`,
  id: data.id ?? null,
  hubungan: data.hubungan ?? '',
  nama_lengkap: data.nama_lengkap ?? '',
  no_telp: data.no_telp ?? '',
  alamat: data.alamat ?? '',
  alamat_sama_dengan_pegawai: Boolean(data.alamat_sama_dengan_pegawai ?? false),
})

const tambahKeluarga = () => {
  form.value.keluarga.push(buatKeluarga())
}

const hapusKeluarga = (index) => {
  form.value.keluarga.splice(index, 1)
}

const alamatPegawaiForm = computed(() => {
  return form.value.alamat_domisili || form.value.alamat_ktp || ''
})

const alamatKeluargaDetail = (anggota) => {
  if (anggota?.alamat_sama_dengan_pegawai) {
    return detailPegawai.value?.alamat_domisili || detailPegawai.value?.alamat_ktp || '-'
  }
  return anggota?.alamat || '-'
}

const cleanupModalBackdrop = () => {
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.remove()
  })

  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
}

const tutupModal = () => {
  showModal.value = false
  resetForm()

  setTimeout(() => {
    cleanupModalBackdrop()
  }, 100)
}

const showDetailModal = ref(false)
const detailPegawai = ref(null)

const lihatDetailPegawai = (pegawai) => {
  detailPegawai.value = pegawai
  showDetailModal.value = true
}

const tutupDetailModal = () => {
  showDetailModal.value = false
  detailPegawai.value = null

  setTimeout(() => {
    cleanupModalBackdrop()
  }, 100)
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'

  const date = new Date(tanggal)

  if (isNaN(date.getTime())) {
    return tanggal
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const tampilAlamatDomisili = computed(() => {
  if (!detailPegawai.value) return '-'

  return detailPegawai.value.alamat_domisili ||
    detailPegawai.value.alamat_ktp ||
    '-'
})

const downloadTemplateExcel = async () => {
  try {
    const response = await api.get('/pkwt/import/template', {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', 'template-import-pegawai-pkwt.xlsx')

    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert('Gagal download template Excel.')
  }
}

const exportPegawaiExcel = async () => {
  try {
    const response = await api.get('/pegawai/export-excel', {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    const tahun = new Date().getFullYear()

    link.href = url
    link.setAttribute('download', `database-pegawai-${tahun}.xlsx`)

    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert('Gagal export data pegawai.')
  }
}

</script>

<style scoped>
.modal-backdrop-custom2 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.modal-card {
  background: white;
  width: 800px;
  max-width: 90%;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,.2);
}

.modal-wide {
  width: 800px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 15px;
  overflow-y: auto;
}

.modal-card-wide {
  width: 1100px;
  max-width: 100%;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header-custom {
  padding: 18px 22px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.modal-body-scroll {
  padding: 22px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer-custom {
  padding: 16px 22px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}

.section-title {
  font-weight: 700;
  color: #0d6efd;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 6px;
  margin-bottom: 4px;
}

.form-label {
  font-weight: 600;
  margin-bottom: 5px;
}

.small-box {
  border-radius: 12px;
  color: white;
  position: relative;
  overflow: hidden;
  padding: 20px;
  min-height: 80px;
  transition: all 0.2s ease;
}

.small-box:hover {
  transform: translateY(-3px);
}

.small-box .inner h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.small-box .inner p {
  margin: 30px 0 0;
  font-size: 15px;
  font-weight: 550;
}

.small-box .icon {
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 60px;
  opacity: 0.2;
}

.action-dropdown {
  position: relative;
  display: inline-block;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 180px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  z-index: 999999;
  padding: 6px 0;
  text-align: left;
}

.action-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 8px 14px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.action-item:hover {
  background: #f8f9fa;
}

.action-divider {
  height: 1px;
  background: #dee2e6;
  margin: 6px 0;
}

.modal-card-detail {
  width: 850px;
  max-width: 100%;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fff;
}

.detail-section h6 {
  font-weight: 700;
  color: #0d6efd;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 220px 15px 1fr;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px dashed #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #343a40;
}

.detail-separator {
  color: #6c757d;
}

.detail-value {
  color: #212529;
  word-break: break-word;
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .detail-separator {
    display: none;
  }
}

.family-form-card {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f8fafc;
  padding: 14px;
}

.family-form-head,
.family-item-head,
.detail-section-heading,
.family-detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.family-form-head {
  margin-bottom: 12px;
}

.family-form-head strong,
.family-item-head strong {
  color: #1f2937;
}

.family-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 13px;
  margin-top: 10px;
}

.family-item-head {
  padding-bottom: 9px;
  margin-bottom: 10px;
  border-bottom: 1px dashed #e5e7eb;
}

.family-address-check {
  padding: 9px 11px;
  border-radius: 9px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.family-same-address {
  min-height: 64px;
  padding: 10px 12px;
  border: 1px dashed #93c5fd;
  border-radius: 9px;
  background: #eff6ff;
  color: #1e40af;
  white-space: pre-line;
  font-size: 13px;
}

.family-empty {
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.family-detail-list {
  display: grid;
  gap: 10px;
}

.family-detail-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #f8fafc;
}

.family-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e0ecff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.family-detail-top strong {
  flex: 1;
  color: #1f2937;
  font-size: 14px;
}

.family-detail-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  margin-top: 10px;
}

.family-detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.family-detail-grid small {
  color: #64748b;
  font-weight: 700;
}

.family-detail-grid span {
  color: #1f2937;
  white-space: pre-line;
  word-break: break-word;
}

.small-box {
  border-radius: 12px;
  color: white;
  position: relative;
  overflow: hidden;
  padding: 20px;
  min-height: 80px;
  transition: all 0.2s ease;
}

.small-box:hover {
  transform: translateY(-3px);
}

.small-box .inner h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.small-box .inner p {
  margin: 30px 0 0;
  font-size: 15px;
  font-weight: 550;
}

.small-box .icon {
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 60px;
  opacity: 0.2;
}

.action-dropdown {
  position: relative;
  display: inline-block;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 180px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  z-index: 999999;
  padding: 6px 0;
  text-align: left;
}

.action-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 8px 14px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.action-item:hover {
  background: #f8f9fa;
}

.action-divider {
  height: 1px;
  background: #dee2e6;
  margin: 6px 0;
}

.modal-card-detail {
  width: 850px;
  max-width: 100%;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fff;
}

.detail-section h6 {
  font-weight: 700;
  color: #0d6efd;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 220px 15px 1fr;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px dashed #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #343a40;
}

.detail-separator {
  color: #6c757d;
}

.detail-value {
  color: #212529;
  word-break: break-word;
}

@media (max-width: 768px) {
  .family-form-head,
  .family-item-head,
  .family-detail-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .family-form-head .btn,
  .family-item-head .btn {
    width: 100%;
  }

  .family-detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .detail-separator {
    display: none;
  }
}

</style>