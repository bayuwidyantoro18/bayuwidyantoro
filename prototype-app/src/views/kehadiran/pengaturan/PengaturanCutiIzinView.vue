<template>

  <div class="page">

    <div class="head">

      <div>

        <div class="eyebrow">PENGATURAN</div>

        <h3>Cuti &amp; Izin</h3>

        <p>Atur hak cuti dan event/shift khusus yang berkaitan dengan kalender kerja.</p>

      </div>

      <button class="btn btn-sm btn-outline-primary" @click="go('/pengaturan')">

        <i class="fas fa-arrow-left me-1"></i> Pengaturan

      </button>

    </div>



    <div v-if="loading" class="panel loading">Memuat pengaturan cuti &amp; izin...</div>



    <template v-else>

      <div class="panel">

        <div class="section-title">

          <div class="icon-box green"><i class="fas fa-umbrella-beach"></i></div>

          <div>

            <h5>Hak Cuti Tahunan</h5>

            <small>Atur jatah cuti default dan masa berlaku sisa cuti tahun sebelumnya.</small>

          </div>

        </div>



        <div class="grid">

          <div>

            <label>Hak Cuti Tahunan</label>

            <input v-model.number="settings.hak_cuti_default" type="number" min="0" max="365" class="form-control form-control-sm">

            <small>Jumlah hari hak cuti default per tahun.</small>

          </div>

          <div>

            <label>Expired Sisa Cuti Tahun Lalu</label>

            <input v-model="settings.expired_sisa_cuti_default" type="date" class="form-control form-control-sm">

            <small>Sebelum/tanggal expired, sisa tahun lalu dipakai lebih dahulu.</small>

          </div>

        </div>



        <div class="info">

          <i class="fas fa-circle-info"></i>

          <span>Setelah tanggal expired, hanya hak cuti tahun berjalan yang berlaku.</span>

        </div>



        <div class="action">

          <button class="btn btn-primary btn-sm" :disabled="savingSettings" @click="saveSettings">

            <i class="fas fa-save me-1"></i>{{ savingSettings ? 'Menyimpan...' : 'Simpan Hak Cuti' }}

          </button>

        </div>

      </div>



      <div class="panel">

        <div class="event-head">

          <div class="section-title mb-0">

            <div class="icon-box orange"><i class="fas fa-calendar-days"></i></div>

            <div>

              <h5>Event / Shift Khusus</h5>

              <small>Berlaku hanya pada rentang tanggal yang ditentukan.</small>

            </div>

          </div>

          <button class="btn btn-primary btn-sm" @click="openNew">

            <i class="fas fa-plus me-1"></i>Tambah Event

          </button>

        </div>



        <div v-if="shiftLoading" class="loading-box">Memuat event/shift...</div>

        <template v-else>

          <div v-if="rows.length" class="table-responsive mt-2">

            <table class="table table-sm table-bordered align-middle">

              <thead>

                <tr>

                  <th>Event</th>

                  <th>Periode</th>

                  <th>Hari Kerja</th>

                  <th>Hari Libur</th>

                  <th>Keterangan</th>

                  <th>Status</th>

                  <th>Aksi</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="item in rows" :key="item.id">

                  <td><strong>{{ item.nama_shift }}</strong></td>

                  <td>{{ fmtDate(item.mulai_berlaku) }} s/d {{ fmtDate(item.akhir_berlaku) }}</td>

                  <td>{{ item.jam_masuk }} - {{ item.jam_pulang }}<br><small>Lembur {{ item.lembur_hari_kerja_mulai }}</small></td>

                  <td>{{ item.jam_masuk_hari_libur }} - {{ item.jam_pulang_hari_libur }}<br><small>Lembur {{ item.lembur_hari_libur_mulai }}</small></td>

                  <td>{{ item.keterangan || '-' }}</td>

                  <td><span class="badge" :class="item.is_active ? 'bg-success' : 'bg-secondary'">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>

                  <td class="text-nowrap">

                    <button class="btn btn-sm btn-outline-primary me-1" @click="edit(item)"><i class="fas fa-edit"></i></button>

                    <button class="btn btn-sm btn-outline-danger" @click="remove(item)"><i class="fas fa-trash"></i></button>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          <div v-else class="empty">Belum ada event/shift khusus. Sistem menggunakan jam kerja normal.</div>

        </template>

      </div>

    </template>





      <div class="panel calendar-panel">
  <div class="event-head">
    <div class="section-title mb-0">
      <div class="icon-box blue"><i class="fas fa-calendar-alt"></i></div>
      <div>
        <h5>Kalender Cuti Bersama &amp; Hari Libur</h5>
        <small>Weekend otomatis Holiday. Hari Libur dan Cuti Bersama dapat dijadwalkan untuk tahun sebelumnya, berjalan, atau berikutnya.</small>
      </div>
    </div>

    <div class="calendar-actions">
      <select
        v-model.number="selectedYear"
        class="form-select form-select-sm year-select"
        :disabled="calendarLoading"
      >
        <option
          v-for="year in yearOptions"
          :key="year"
          :value="year"
        >
          Tahun {{ year }}
        </option>
      </select>

      <button
        class="btn btn-primary btn-sm"
        @click="openCalendarNew('cuti_bersama')"
      >
        <i class="fas fa-umbrella-beach me-1"></i>
        Cuti Bersama
      </button>

      <button
        class="btn btn-outline-danger btn-sm"
        @click="openCalendarNew('hari_libur')"
      >
        <i class="fas fa-calendar-xmark me-1"></i>
        Hari Libur
      </button>
    </div>
  </div>

  <div v-if="calendarLoading" class="loading-box">
    Memuat kalender...
  </div>

  <template v-else>
    <div class="calendar-summary">
      <span class="summary-badge">
        <strong>{{ calendarRows.length }}</strong> Cuti Bersama
      </span>
      <span class="summary-badge holiday-summary">
        <strong>{{ holidayRows.length }}</strong> Hari Libur
      </span>
      <span class="summary-badge weekend-summary">
        <strong>{{ weekendCount }}</strong> Weekend
      </span>
      <span class="summary-note">
        Tahun {{ selectedYear }}
      </span>
    </div>

    <div class="calendar-legend">
      <span class="legend-item">
        <span class="legend-dot weekend-dot"></span>
        Holiday (Sabtu/Minggu)
      </span>
      <span class="legend-item">
        <span class="legend-dot holiday-dot"></span>
        Hari Libur
      </span>
      <span class="legend-item">
        <span class="legend-dot leave-dot"></span>
        Cuti Bersama
      </span>
    </div>

    <div class="calendar-list">
      <div
        class="calendar-month"
        v-for="month in calendarMonths"
        :key="month.number"
      >
        <div class="month-title">
          <strong>{{ month.label }}</strong>
          <span>{{ month.daysInMonth }} hari</span>
        </div>

        <div class="days-grid">
          <template
            v-for="day in month.days"
            :key="day.key"
          >
            <div
              v-if="!day.date"
              class="day-cell muted-day"
            ></div>

            <div
              v-else
              class="day-cell"
              :class="{
                'weekend': day.weekend,
                'manual-holiday': day.holiday,
                'collective-leave': day.leave && !day.weekend && !day.holiday,
                'today': day.today
              }"
              :title="day.weekend ? 'Holiday - Sabtu/Minggu' : day.holiday ? day.holiday.nama : day.leave ? day.leave.nama : ''"
            >
              <div class="day-number">{{ day.number }}</div>

              <div
                v-if="day.weekend"
                class="day-label weekend-label"
              >
                HOLIDAY
              </div>

              <div
                v-else-if="day.holiday"
                class="day-label holiday-label"
              >
                {{ day.holiday.nama }}
              </div>

              <div
                v-else-if="day.leave"
                class="day-label leave-label"
              >
                {{ day.leave.nama }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="calendar-table-wrap" v-if="calendarEntries.length">
      <table class="table table-sm table-bordered align-middle mt-3">
        <thead>
          <tr>
            <th style="width:55px">No</th>
            <th style="width:130px">Jenis</th>
            <th>Tanggal</th>
            <th>Nama</th>
            <th>Keterangan</th>
            <th>Status</th>
            <th style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in calendarEntries"
            :key="`${item.jenis}-${item.id}`"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <span
                class="type-badge"
                :class="item.jenis === 'hari_libur' ? 'type-holiday' : 'type-leave'"
              >
                <i
                  class="fas"
                  :class="item.jenis === 'hari_libur' ? 'fa-calendar-xmark' : 'fa-umbrella-beach'"
                ></i>
                {{ item.jenis === 'hari_libur' ? 'Hari Libur' : 'Cuti Bersama' }}
              </span>
            </td>
            <td>{{ fmtDate(item.tanggal) }}</td>
            <td><strong>{{ item.nama }}</strong></td>
            <td>{{ item.keterangan || '-' }}</td>
            <td>
              <span
                class="badge"
                :class="item.is_active ? 'bg-success' : 'bg-secondary'"
              >
                {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="text-nowrap">
              <button
                class="btn btn-sm btn-outline-primary me-1"
                @click="editCalendar(item)"
                title="Edit"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="removeCalendar(item)"
                title="Hapus"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty mt-2">
      Belum ada jadwal Cuti Bersama atau Hari Libur untuk tahun {{ selectedYear }}.
    </div>
  </template>
</div>

    <div v-if="showModal" class="modal-backdrop-custom" @click.self="showModal=false">

      <div class="modal-card">

        <div class="modal-head">

          <h5>{{ eventForm.id ? 'Edit Event / Shift' : 'Tambah Event / Shift' }}</h5>

          <button class="btn-close" @click="showModal=false"></button>

        </div>



        <div class="grid-modal">

          <div class="wide"><label>Nama Event</label><input v-model="eventForm.nama_shift" class="form-control form-control-sm"></div>

          <div><label>Mulai Berlaku</label><input v-model="eventForm.mulai_berlaku" type="date" class="form-control form-control-sm"></div>

          <div><label>Akhir Berlaku</label><input v-model="eventForm.akhir_berlaku" type="date" class="form-control form-control-sm"></div>

          <div><label>Masuk Hari Kerja</label><input v-model="eventForm.jam_masuk" type="time" class="form-control form-control-sm"></div>

          <div><label>Pulang Hari Kerja</label><input v-model="eventForm.jam_pulang" type="time" class="form-control form-control-sm"></div>

          <div><label>Mulai Lembur Hari Kerja</label><input v-model="eventForm.lembur_hari_kerja_mulai" type="time" class="form-control form-control-sm"></div>

          <div><label>Masuk Hari Libur</label><input v-model="eventForm.jam_masuk_hari_libur" type="time" class="form-control form-control-sm"></div>

          <div><label>Pulang Hari Libur</label><input v-model="eventForm.jam_pulang_hari_libur" type="time" class="form-control form-control-sm"></div>

          <div><label>Mulai Lembur Hari Libur</label><input v-model="eventForm.lembur_hari_libur_mulai" type="time" class="form-control form-control-sm"></div>

          <div class="wide"><label>Keterangan</label><textarea v-model="eventForm.keterangan" rows="2" class="form-control form-control-sm"></textarea></div>

          <div v-if="eventForm.id" class="wide form-check"><input id="eventActive" v-model="eventForm.is_active" type="checkbox" class="form-check-input"><label for="eventActive">Event aktif</label></div>

        </div>



        <div class="modal-actions">

          <button class="btn btn-outline-secondary btn-sm" @click="showModal=false">Batal</button>

          <button class="btn btn-primary btn-sm" :disabled="savingEvent" @click="saveEvent">

            <i class="fas fa-save me-1"></i>{{ savingEvent ? 'Menyimpan...' : 'Simpan Event' }}

          </button>

        </div>

      </div>

    </div>



<div
  v-if="showCalendarModal"
  class="modal-backdrop-custom"
  @click.self="showCalendarModal=false"
>
  <div class="modal-card calendar-modal">
    <div class="modal-head">
      <div>
        <h5>
          {{ calendarForm.id
            ? (calendarForm.jenis === 'hari_libur' ? 'Edit Hari Libur' : 'Edit Cuti Bersama')
            : (calendarForm.jenis === 'hari_libur' ? 'Tambah Hari Libur' : 'Tambah Cuti Bersama')
          }}
        </h5>
        <small class="text-muted">
          Tahun jadwal: {{ selectedYear }}
        </small>
      </div>
      <button class="btn-close" @click="showCalendarModal=false"></button>
    </div>

    <div class="calendar-type-notice" :class="calendarForm.jenis === 'hari_libur' ? 'holiday-notice' : 'leave-notice'">
      <i
        class="fas"
        :class="calendarForm.jenis === 'hari_libur' ? 'fa-calendar-xmark' : 'fa-umbrella-beach'"
      ></i>
      <span>
        {{ calendarForm.jenis === 'hari_libur'
          ? 'Hari Libur — digunakan untuk hari libur manual di luar Sabtu/Minggu.'
          : 'Cuti Bersama — digunakan untuk jadwal cuti bersama perusahaan.'
        }}
      </span>
    </div>

    <div class="grid-modal">
      <div>
        <label>Tanggal</label>
        <input
          v-model="calendarForm.tanggal"
          type="date"
          class="form-control form-control-sm"
          :min="`${selectedYear}-01-01`"
          :max="`${selectedYear}-12-31`"
        >
      </div>

      <div>
        <label>{{ calendarForm.jenis === 'hari_libur' ? 'Nama Hari Libur' : 'Nama Cuti Bersama' }}</label>
        <input
          v-model="calendarForm.nama"
          class="form-control form-control-sm"
          maxlength="150"
          :placeholder="calendarForm.jenis === 'hari_libur' ? 'Contoh: Hari Kemerdekaan' : 'Contoh: Cuti Bersama Idul Fitri'"
        >
      </div>

      <div class="wide">
        <label>Keterangan</label>
        <textarea
          v-model="calendarForm.keterangan"
          rows="3"
          class="form-control form-control-sm"
          maxlength="1000"
          placeholder="Keterangan tambahan (opsional)"
        ></textarea>
      </div>

      <div v-if="calendarForm.id" class="wide form-check">
        <input
          id="calendarActive"
          v-model="calendarForm.is_active"
          type="checkbox"
          class="form-check-input"
        >
        <label for="calendarActive">Jadwal aktif</label>
      </div>
    </div>

    <div class="modal-actions">
      <button
        class="btn btn-outline-secondary btn-sm"
        @click="showCalendarModal=false"
      >
        Batal
      </button>
      <button
        class="btn btn-primary btn-sm"
        :class="calendarForm.jenis === 'hari_libur' ? 'holiday-save-btn' : ''"
        :disabled="savingCalendar"
        @click="saveCalendar"
      >
        <i class="fas fa-save me-1"></i>
        {{ savingCalendar
          ? 'Menyimpan...'
          : (calendarForm.jenis === 'hari_libur' ? 'Simpan Hari Libur' : 'Simpan Cuti Bersama')
        }}
      </button>
    </div>
  </div>
</div>
  </div>
</template>



<script setup>

import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import Swal from 'sweetalert2'

import api from '../../../services/api'



const router = useRouter()

const go = (path) => router.push(path)

const loading = ref(false)

const shiftLoading = ref(false)

const savingSettings = ref(false)

const savingEvent = ref(false)

const showModal = ref(false)

const rows = ref([])

const calendarRows = ref([])
const holidayRows = ref([])
const calendarLoading = ref(false)
const savingCalendar = ref(false)
const showCalendarModal = ref(false)
const nowYear = new Date().getFullYear()
const selectedYear = ref(nowYear)
const yearOptions = [nowYear - 1, nowYear, nowYear + 1]

const blankCalendar = () => ({
  id: null,
  tanggal: `${selectedYear.value}-01-01`,
  nama: '',
  keterangan: '',
  jenis: 'cuti_bersama',
  is_active: true
})

const isWeekend = (date) => {
  const d = new Date(`${date}T00:00:00`)
  const day = d.getDay()
  return day === 0 || day === 6
}

const calendarForm = reactive(blankCalendar())

const settings = reactive({

  hak_cuti_default: 12,

  expired_sisa_cuti_default: '',

  koreksi_limit_masuk: 1,

  koreksi_limit_pulang: 1,

  petugas_approval_koreksi: '',

  normal_jam_masuk_hari_kerja: '08:00',

  normal_jam_pulang_hari_kerja: '17:00',

  normal_lembur_hari_kerja_mulai: '17:00',

  normal_jam_masuk_hari_libur: '08:00',

  normal_jam_pulang_hari_libur: '17:00',

  normal_lembur_hari_libur_mulai: '05:00'

})



const blankEvent = () => ({

  id: null,

  nama_shift: '',

  mulai_berlaku: '',

  akhir_berlaku: '',

  jam_masuk: '07:00',

  jam_pulang: '16:00',

  jam_masuk_hari_libur: '08:00',

  jam_pulang_hari_libur: '17:00',

  lembur_hari_kerja_mulai: '17:00',

  lembur_hari_libur_mulai: '05:00',

  keterangan: '',

  is_active: true

})



const eventForm = reactive(blankEvent())



const loadSettings = async () => {

  const r = await api.get('/kehadiran/pengaturan')

  Object.assign(settings, r.data?.data || {})

}



const loadEvents = async () => {

  shiftLoading.value = true

  try {

    const r = await api.get('/kehadiran/pengaturan')

    rows.value = Array.isArray(r.data?.data?.shifts) ? r.data.data.shifts : []

  } catch (e) {

    await Swal.fire('Gagal', e.response?.data?.message || 'Gagal memuat event/shift.', 'error')

  } finally {

    shiftLoading.value = false

  }

}



const load = async () => {

  loading.value = true

  try {

    const r = await api.get('/kehadiran/pengaturan')

    Object.assign(settings, r.data?.data || {})

    rows.value = Array.isArray(r.data?.data?.shifts) ? r.data.data.shifts : []

  } catch (e) {

    await Swal.fire('Gagal', e.response?.data?.message || 'Gagal memuat pengaturan cuti & izin.', 'error')

  } finally {

    loading.value = false

  }

}



const saveSettings = async () => {

  savingSettings.value = true

  try {

    const r = await api.put('/kehadiran/pengaturan', settings)

    await Swal.fire('Berhasil', r.data?.message || 'Hak cuti berhasil disimpan.', 'success')

    await loadSettings()

  } catch (e) {

    const errors = e.response?.data?.errors

    const first = errors ? Object.values(errors)[0]?.[0] : null

    await Swal.fire('Gagal', first || e.response?.data?.message || 'Gagal menyimpan hak cuti.', 'error')

  } finally {

    savingSettings.value = false

  }

}



const openNew = () => {

  Object.assign(eventForm, blankEvent())

  showModal.value = true

}



const edit = (item) => {

  Object.assign(eventForm, blankEvent(), item, { id: item.id, is_active: Boolean(item.is_active) })

  showModal.value = true

}



const saveEvent = async () => {

  savingEvent.value = true

  try {

    const payload = { ...eventForm }

    if (eventForm.id) {

      await api.put(`/kehadiran/pengaturan/shift/${eventForm.id}`, payload)

    } else {

      await api.post('/kehadiran/pengaturan/shift', payload)

    }

    await Swal.fire('Berhasil', 'Event/shift berhasil disimpan.', 'success')

    showModal.value = false

    await loadEvents()

  } catch (e) {

    const errors = e.response?.data?.errors

    const first = errors ? Object.values(errors)[0]?.[0] : null

    await Swal.fire('Gagal', first || e.response?.data?.message || 'Gagal menyimpan event/shift.', 'error')

  } finally {

    savingEvent.value = false

  }

}



const remove = async (item) => {

  const c = await Swal.fire({

    icon: 'warning',

    title: 'Hapus event?',

    text: item.nama_shift,

    showCancelButton: true,

    confirmButtonText: 'Hapus',

    cancelButtonText: 'Batal'

  })

  if (!c.isConfirmed) return



  try {

    await api.delete(`/kehadiran/pengaturan/shift/${item.id}`)

    await Swal.fire('Berhasil', 'Event berhasil dihapus.', 'success')

    await loadEvents()

  } catch (e) {

    await Swal.fire('Gagal', e.response?.data?.message || 'Gagal menghapus event.', 'error')

  }

}



const loadCalendar = async () => {
  calendarLoading.value = true

  try {
    const [cutiResponse, holidayResponse] = await Promise.all([
      api.get('/kehadiran/pengaturan/cuti-bersama', {
        params: { year: selectedYear.value }
      }),
      api.get('/kehadiran/pengaturan/hari-libur', {
        params: { year: selectedYear.value }
      })
    ])

    calendarRows.value = Array.isArray(cutiResponse.data?.data)
      ? cutiResponse.data.data
      : []

    holidayRows.value = Array.isArray(holidayResponse.data?.data)
      ? holidayResponse.data.data
      : []
  } catch (e) {
    calendarRows.value = []
    holidayRows.value = []

    await Swal.fire(
      'Gagal',
      e.response?.data?.message || 'Gagal memuat kalender cuti bersama dan hari libur.',
      'error'
    )
  } finally {
    calendarLoading.value = false
  }
}

const openCalendarNew = (jenis = 'cuti_bersama') => {
  Object.assign(calendarForm, {
    id: null,
    tanggal: `${selectedYear.value}-01-01`,
    nama: '',
    keterangan: '',
    jenis,
    is_active: true
  })

  showCalendarModal.value = true
}

const editCalendar = (item) => {
  Object.assign(calendarForm, {
    id: item.id,
    tanggal: item.tanggal?.slice(0, 10) || '',
    nama: item.nama || '',
    keterangan: item.keterangan || '',
    jenis: item.jenis || 'cuti_bersama',
    is_active: Boolean(item.is_active)
  })

  showCalendarModal.value = true
}

const saveCalendar = async () => {
  if (!calendarForm.tanggal || !calendarForm.nama.trim()) {
    await Swal.fire(
      'Data Belum Lengkap',
      `${calendarForm.jenis === 'hari_libur' ? 'Tanggal dan nama hari libur' : 'Tanggal dan nama cuti bersama'} wajib diisi.`,
      'warning'
    )
    return
  }

  if (calendarForm.tanggal.slice(0, 4) !== String(selectedYear.value)) {
    await Swal.fire(
      'Tanggal Tidak Sesuai',
      `Tanggal harus berada di tahun ${selectedYear.value}.`,
      'warning'
    )
    return
  }

  // Sabtu dan Minggu sudah otomatis menjadi Holiday.
  if (isWeekend(calendarForm.tanggal)) {
    await Swal.fire(
      'Tanggal Holiday',
      'Sabtu dan Minggu sudah otomatis ditetapkan sebagai Holiday. Pilih hari kerja untuk jadwal manual.',
      'info'
    )
    return
  }

  savingCalendar.value = true

  try {
    const isHoliday = calendarForm.jenis === 'hari_libur'
    const basePath = isHoliday
      ? '/kehadiran/pengaturan/hari-libur'
      : '/kehadiran/pengaturan/cuti-bersama'

    const payload = {
      tanggal: calendarForm.tanggal,
      nama: calendarForm.nama.trim(),
      keterangan: calendarForm.keterangan || null,
      is_active: Boolean(calendarForm.is_active)
    }

    if (calendarForm.id) {
      await api.put(`${basePath}/${calendarForm.id}`, payload)
    } else {
      await api.post(basePath, payload)
    }

    await Swal.fire(
      'Berhasil',
      isHoliday
        ? 'Hari libur berhasil disimpan.'
        : 'Jadwal cuti bersama berhasil disimpan.',
      'success'
    )

    showCalendarModal.value = false
    await loadCalendar()
  } catch (e) {
    const errors = e.response?.data?.errors
    const first = errors ? Object.values(errors)[0]?.[0] : null

    await Swal.fire(
      'Gagal',
      first || e.response?.data?.message || 'Gagal menyimpan jadwal kalender.',
      'error'
    )
  } finally {
    savingCalendar.value = false
  }
}

const removeCalendar = async (item) => {
  const isHoliday = item.jenis === 'hari_libur'
  const label = isHoliday ? 'hari libur' : 'cuti bersama'

  const c = await Swal.fire({
    icon: 'warning',
    title: `Hapus ${label}?`,
    text: `${fmtDate(item.tanggal)} — ${item.nama}`,
    showCancelButton: true,
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Batal'
  })

  if (!c.isConfirmed) return

  try {
    const basePath = isHoliday
      ? '/kehadiran/pengaturan/hari-libur'
      : '/kehadiran/pengaturan/cuti-bersama'

    await api.delete(`${basePath}/${item.id}`)

    await Swal.fire(
      'Berhasil',
      isHoliday ? 'Hari libur dihapus.' : 'Jadwal cuti bersama dihapus.',
      'success'
    )

    await loadCalendar()
  } catch (e) {
    await Swal.fire(
      'Gagal',
      e.response?.data?.message || `Gagal menghapus ${label}.`,
      'error'
    )
  }
}

const calendarEntries = computed(() => {
  const cuti = calendarRows.value.map(item => ({
    ...item,
    jenis: 'cuti_bersama'
  }))

  const holidays = holidayRows.value.map(item => ({
    ...item,
    jenis: 'hari_libur'
  }))

  return [...cuti, ...holidays].sort((a, b) => {
    const byDate = String(a.tanggal).localeCompare(String(b.tanggal))
    if (byDate !== 0) return byDate
    return String(a.jenis).localeCompare(String(b.jenis))
  })
})

const weekendCount = computed(() => {
  const year = selectedYear.value
  let count = 0

  for (let month = 0; month < 12; month++) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day)
      const dow = date.getDay()
      if (dow === 0 || dow === 6) count++
    }
  }

  return count
})

const calendarMonths = computed(() => [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
].map((label, index) => {
  const year = selectedYear.value
  const first = new Date(year, index, 1)
  const last = new Date(year, index + 1, 0)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const days = []

  for (let i = 0; i < startOffset; i++) {
    days.push({
      key: `${year}-${index}-blank-${i}`,
      date: null
    })
  }

  for (let day = 1; day <= last.getDate(); day++) {
    const dateObj = new Date(year, index, day)
    const iso = `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const weekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

    const leave = calendarRows.value.find(
      item => item.tanggal?.slice(0, 10) === iso && item.is_active
    ) || null

    const holiday = holidayRows.value.find(
      item => item.tanggal?.slice(0, 10) === iso && item.is_active
    ) || null

    const today =
      nowYear === year &&
      new Date().getMonth() === index &&
      new Date().getDate() === day

    days.push({
      key: iso,
      date: iso,
      number: day,
      weekend,
      leave,
      holiday,
      today
    })
  }

  return {
    number: index + 1,
    label,
    days,
    daysInMonth: last.getDate()
  }
}))

const fmtDate = (v) => v

  ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(v))

  : '-'



onMounted(async () => {

  await load()

  await loadCalendar()

})



watch(selectedYear, async () => {

  await loadCalendar()

})

</script>



<style scoped>
/* =========================================================
   BASE
========================================================= */
.page {
  padding: 14px;
  background: #f4f7fb;
  min-height: 100vh;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .13em;
  color: #2563eb;
}

.head h3 {
  margin: 2px 0 0;
  font-weight: 950;
  color: #0f172a;
}

.head p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

/* =========================================================
   PANEL
========================================================= */
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  padding: 14px;
  box-shadow: 0 .25rem .8rem rgba(15, 23, 42, .05);
  margin-bottom: 12px;
}

.loading,
.loading-box {
  text-align: center;
  color: #64748b;
  padding: 18px;
}

/* =========================================================
   SECTION HEADER
========================================================= */
.section-title {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.section-title h5 {
  margin: 0;
  font-weight: 950;
  color: #0f172a;
}

.section-title small {
  color: #64748b;
  font-size: 11px;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.icon-box.green {
  background: #ecfdf5;
  color: #059669;
}

.icon-box.orange {
  background: #fff7ed;
  color: #ea580c;
}

.icon-box.blue {
  background: #eff6ff;
  color: #2563eb;
}

/* =========================================================
   FORM
========================================================= */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.grid label,
.grid-modal label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 5px;
}

.grid small {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 10px;
}

.info {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 11px;
  line-height: 1.5;
}

.action {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #eef2f7;
}

/* =========================================================
   EVENT / SHIFT
========================================================= */
.event-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.table {
  font-size: 12px;
}

.table th {
  white-space: nowrap;
  background: #f8fafc;
  color: #475569;
  font-weight: 800;
}

.table td {
  vertical-align: middle;
}

.empty {
  text-align: center;
  padding: 22px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 10px;
}

/* =========================================================
   CALENDAR HEADER
========================================================= */
.calendar-panel {
  border-left: 4px solid #2563eb;
}

.calendar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.year-select {
  width: 120px;
}

/* =========================================================
   CALENDAR SUMMARY
========================================================= */
.calendar-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.summary-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
}

.summary-badge.holiday-summary {
  background: #fff1f2;
  color: #be123c;
}

.summary-badge.weekend-summary {
  background: #f1f5f9;
  color: #475569;
}

.summary-note {
  font-size: 11px;
  color: #64748b;
}

/* =========================================================
   CALENDAR LEGEND
========================================================= */
.calendar-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-size: 10px;
  color: #64748b;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  border: 1px solid transparent;
}

.weekend-dot {
  background: #fff0f3;
  border-color: #fda4af;
}

.holiday-dot {
  background: #ffe4e6;
  border-color: #fb7185;
}

.leave-dot {
  background: #dcfce7;
  border-color: #86efac;
}

/* =========================================================
   CALENDAR GRID
========================================================= */
.calendar-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.calendar-month {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 9px;
  background: #fafcff;
  overflow: hidden;
}

.month-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
  font-size: 12px;
}

.month-title strong {
  color: #0f172a;
  font-weight: 900;
}

.month-title span {
  font-size: 10px;
  color: #94a3b8;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
}

/* =========================================================
   DAY CELL
========================================================= */
.day-cell {
  min-height: 46px;
  border: 1px solid #eef2f7;
  border-radius: 7px;
  padding: 4px;
  background: #fff;
  position: relative;
  transition: .15s ease;
}

.day-cell:hover {
  border-color: #cbd5e1;
}

.day-number {
  font-size: 10px;
  font-weight: 900;
  color: #475569;
}

.muted-day {
  border: 0;
  background: transparent;
  pointer-events: none;
}

/* =========================================================
   WEEKEND / AUTOMATIC HOLIDAY
========================================================= */
.day-cell.weekend {
  background: #fff0f3;
  border-color: #fda4af;
}

.day-cell.weekend .day-number {
  color: #be123c;
}

.weekend-label {
  color: #e11d48 !important;
  font-weight: 900;
  font-size: 8px;
  letter-spacing: .05em;
}

/* =========================================================
   MANUAL HOLIDAY
========================================================= */
.day-cell.manual-holiday {
  background: #ffe4e6;
  border-color: #fb7185;
}

.day-cell.manual-holiday .day-number {
  color: #be123c;
}

.holiday-label {
  color: #be123c !important;
  font-weight: 900;
}

/* =========================================================
   CUTI BERSAMA
========================================================= */
.day-cell.collective-leave {
  background: #dcfce7;
  border-color: #86efac;
}

.day-cell.collective-leave .day-number {
  color: #166534;
}

.leave-label {
  color: #166534 !important;
  font-weight: 800;
}

/* =========================================================
   TODAY
========================================================= */
.day-cell.today {
  box-shadow: inset 0 0 0 1px #2563eb;
}

.day-cell.today .day-number {
  color: #2563eb;
}

/* =========================================================
   DAY LABEL
========================================================= */
.day-label {
  font-size: 8px;
  line-height: 1.1;
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* =========================================================
   CALENDAR TABLE
========================================================= */
.calendar-table-wrap {
  overflow-x: auto;
  margin-top: 4px;
}

.calendar-table-wrap .table {
  min-width: 900px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.type-leave {
  background: #dcfce7;
  color: #166534;
}

.type-holiday {
  background: #ffe4e6;
  color: #be123c;
}

/* =========================================================
   CALENDAR MODAL
========================================================= */
.calendar-type-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 11px;
  line-height: 1.5;
}

.leave-notice {
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.holiday-notice {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.holiday-save-btn {
  background: #e11d48;
  border-color: #e11d48;
}

.holiday-save-btn:hover,
.holiday-save-btn:focus {
  background: #be123c;
  border-color: #be123c;
}

/* =========================================================
   MODAL
========================================================= */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 15px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, .2);
}

.calendar-modal {
  width: min(620px, 100%);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.modal-head h5 {
  margin: 0;
  font-weight: 950;
  color: #0f172a;
}

.modal-head small {
  font-size: 11px;
  color: #64748b;
}

.grid-modal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.grid-modal .wide {
  grid-column: span 2;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #eef2f7;
}

.badge {
  font-size: 10px;
  padding: 5px 7px;
  border-radius: 6px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .calendar-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page {
    padding: 10px;
  }

  .head {
    align-items: flex-start;
    flex-direction: column;
  }

  .head .btn {
    align-self: flex-start;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .event-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .event-head > .btn {
    width: 100%;
  }

  .calendar-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .year-select,
  .calendar-actions .btn {
    width: 100%;
  }

  .calendar-list {
    grid-template-columns: 1fr;
  }

  .calendar-panel .table {
    font-size: 11px;
  }

  .calendar-panel .table th,
  .calendar-panel .table td {
    padding: 6px;
  }

  .grid-modal {
    grid-template-columns: 1fr;
  }

  .grid-modal .wide {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .panel {
    padding: 11px;
    border-radius: 12px;
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 9px;
  }

  .section-title {
    gap: 8px;
  }

  .section-title h5 {
    font-size: 14px;
  }

  .section-title small {
    font-size: 10px;
  }

  .calendar-month {
    padding: 7px;
  }

  .calendar-legend {
    gap: 8px;
  }

  .day-cell {
    min-height: 44px;
    padding: 3px;
  }

  .day-number {
    font-size: 9px;
  }

  .day-label,
  .weekend-label {
    font-size: 7px;
  }
}
</style>

