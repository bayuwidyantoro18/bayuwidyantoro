<template>
  <div class="page">
    <div class="head">
      <div>
        <div class="eyebrow">PENGATURAN</div>
        <h3>Kehadiran</h3>
        <p>Atur koreksi kehadiran dan jam kerja normal perusahaan.</p>
      </div>
      <button class="btn btn-sm btn-outline-primary" @click="go('/pengaturan')">
        <i class="fas fa-arrow-left me-1"></i> Pengaturan
      </button>
    </div>

    <div v-if="loading" class="panel loading">Memuat pengaturan kehadiran...</div>

    <template v-else>
      <div class="panel">
        <div class="section-title">
          <div class="icon-box blue"><i class="fas fa-user-clock"></i></div>
          <div>
            <h5>Koreksi Kehadiran</h5>
            <small>Atur batas pengajuan koreksi jam masuk dan jam pulang per pegawai.</small>
          </div>
        </div>

        <div class="grid">
          <div>
            <label>Limit Koreksi Masuk</label>
            <input v-model.number="form.koreksi_limit_masuk" type="number" min="0" max="10" class="form-control form-control-sm">
            <small>0 berarti koreksi masuk tidak diperbolehkan.</small>
          </div>
          <div>
            <label>Limit Koreksi Pulang</label>
            <input v-model.number="form.koreksi_limit_pulang" type="number" min="0" max="10" class="form-control form-control-sm">
            <small>0 berarti koreksi pulang tidak diperbolehkan.</small>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="section-title">
          <div class="icon-box green"><i class="fas fa-business-time"></i></div>
          <div>
            <h5>Jam Kerja Normal</h5>
            <small>Digunakan ketika tanggal tersebut tidak memiliki event/shift khusus.</small>
          </div>
        </div>

        <div class="schedule-grid">
          <div class="schedule-box">
            <div class="box-head"><i class="fas fa-briefcase"></i><strong>Hari Kerja</strong></div>
            <label>Jam Masuk</label>
            <input v-model="form.normal_jam_masuk_hari_kerja" type="time" class="form-control form-control-sm">
            <label>Jam Pulang</label>
            <input v-model="form.normal_jam_pulang_hari_kerja" type="time" class="form-control form-control-sm">
            <label>Mulai Lembur</label>
            <input v-model="form.normal_lembur_hari_kerja_mulai" type="time" class="form-control form-control-sm">
          </div>

          <div class="schedule-box holiday">
            <div class="box-head"><i class="fas fa-calendar-day"></i><strong>Hari Libur</strong></div>
            <label>Jam Masuk</label>
            <input v-model="form.normal_jam_masuk_hari_libur" type="time" class="form-control form-control-sm">
            <label>Jam Pulang</label>
            <input v-model="form.normal_jam_pulang_hari_libur" type="time" class="form-control form-control-sm">
            <label>Mulai Lembur</label>
            <input v-model="form.normal_lembur_hari_libur_mulai" type="time" class="form-control form-control-sm">
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary btn-sm" :disabled="saving" @click="save">
          <i class="fas fa-save me-1"></i>{{ saving ? 'Menyimpan...' : 'Simpan Pengaturan Kehadiran' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '../../../services/api'

const router = useRouter()
const go = (path) => router.push(path)
const loading = ref(false)
const saving = ref(false)

const form = reactive({
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

const load = async () => {
  loading.value = true
  try {
    const r = await api.get('/kehadiran/pengaturan')
    Object.assign(form, r.data?.data || {})
  } catch (e) {
    await Swal.fire('Gagal', e.response?.data?.message || 'Gagal memuat pengaturan kehadiran.', 'error')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const r = await api.put('/kehadiran/pengaturan', form)
    await Swal.fire('Berhasil', r.data?.message || 'Pengaturan kehadiran berhasil disimpan.', 'success')
    await load()
  } catch (e) {
    const errors = e.response?.data?.errors
    const first = errors ? Object.values(errors)[0]?.[0] : null
    await Swal.fire('Gagal', first || e.response?.data?.message || 'Gagal menyimpan pengaturan kehadiran.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page{padding:14px;background:#f4f7fb;min-height:100vh}.head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}.eyebrow{font-size:10px;font-weight:900;letter-spacing:.13em;color:#2563eb}.head h3{margin:2px 0 0;font-weight:950;color:#0f172a}.head p{margin:2px 0 0;color:#64748b;font-size:12px}.panel{background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:15px;box-shadow:0 .25rem .8rem rgba(15,23,42,.05);margin-bottom:12px}.loading{text-align:center;color:#64748b}.section-title{display:flex;gap:10px;align-items:flex-start;margin-bottom:14px}.section-title h5{margin:0;font-weight:950;color:#0f172a}.section-title small{color:#64748b;font-size:11px}.icon-box{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.icon-box.blue{background:#eff6ff;color:#2563eb}.icon-box.green{background:#ecfdf5;color:#059669}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.grid label,.schedule-box label{display:block;font-size:12px;font-weight:800;color:#475569;margin:8px 0 5px}.grid small{display:block;margin-top:5px;color:#64748b;font-size:10px}.schedule-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.schedule-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:13px;padding:14px}.schedule-box.holiday{background:#fffaf0}.box-head{display:flex;gap:8px;align-items:center;margin-bottom:8px;font-size:14px}.box-head i{color:#2563eb}.actions{display:flex;justify-content:flex-end;padding-top:2px}@media(max-width:768px){.grid,.schedule-grid{grid-template-columns:1fr}.head{align-items:flex-start}}
</style>
