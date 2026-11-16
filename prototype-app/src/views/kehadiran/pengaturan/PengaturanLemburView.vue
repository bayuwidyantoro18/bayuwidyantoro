<template>
  <div class="page-wrap">
    <div class="page-head"><div><h3>Pengaturan Lembur</h3><p>Atur upah lembur, transport, serta batas minimal dan maksimal durasi lembur.</p></div><button class="btn btn-sm btn-outline-primary" :disabled="loading" @click="load">Refresh</button></div>
    <div class="settings-grid">
      <div class="card"><h6><i class="fas fa-briefcase me-2"></i>Hari Normal</h6><label>Upah Lembur / Jam</label><input v-model.number="form.upah_per_jam_hari_kerja" type="number" min="0" class="form-control form-control-sm"><label>Uang Transport</label><input v-model.number="form.transport_hari_kerja" type="number" min="0" class="form-control form-control-sm"><label>Transport Jika Lembur &gt; Jam</label><input v-model.number="form.transport_min_jam_hari_kerja" type="number" min="0" step="0.5" class="form-control form-control-sm"></div>
      <div class="card"><h6><i class="fas fa-calendar-day me-2"></i>Hari Libur</h6><label>Upah Lembur / Jam</label><input v-model.number="form.upah_per_jam_hari_libur" type="number" min="0" class="form-control form-control-sm"><label>Uang Transport</label><input v-model.number="form.transport_hari_libur" type="number" min="0" class="form-control form-control-sm"><label>Transport Jika Lembur &gt; Jam</label><input v-model.number="form.transport_min_jam_hari_libur" type="number" min="0" step="0.5" class="form-control form-control-sm"></div>
      <div class="card"><h6><i class="fas fa-clock me-2"></i>Batas Durasi</h6><label>Minimal Jam Lembur</label><input v-model.number="form.min_jam" type="number" min="0.5" step="0.5" class="form-control form-control-sm"><label>Maksimal Jam Lembur</label><input v-model.number="form.max_jam" type="number" min="0.5" step="0.5" class="form-control form-control-sm"><small class="text-muted">Perhitungan hari libur menggunakan tarif hari libur yang ditentukan di atas.</small></div>
    </div>
    <button class="btn btn-primary btn-sm mt-3" :disabled="saving" @click="save"><i class="fas fa-save me-1"></i>{{saving?'Menyimpan...':'Simpan Pengaturan'}}</button>
  </div>
</template>
<script setup>
import {onMounted,reactive,ref} from 'vue';import Swal from 'sweetalert2';import api from '../../../services/api'
const loading=ref(false),saving=ref(false);const form=reactive({upah_per_jam_hari_kerja:0,upah_per_jam_hari_libur:0,transport_hari_kerja:0,transport_hari_libur:0,min_jam:1,max_jam:8,transport_min_jam_hari_kerja:4,transport_min_jam_hari_libur:4})
async function load(){loading.value=true;try{const r=await api.get('/kehadiran/pengaturan/lembur');Object.assign(form,r.data?.data||{})}catch(e){Swal.fire('Gagal','Gagal memuat pengaturan lembur.','error')}finally{loading.value=false}}
async function save(){if(form.max_jam<form.min_jam)return Swal.fire('Perhatian','Maksimal jam tidak boleh lebih kecil dari minimal jam.','warning');saving.value=true;try{await api.put('/kehadiran/pengaturan/lembur',form);Swal.fire('Berhasil','Pengaturan lembur berhasil disimpan.','success')}catch(e){Swal.fire('Gagal',e.response?.data?.message||'Pengaturan gagal disimpan.','error')}finally{saving.value=false}}
onMounted(load)
</script>
<style scoped>.page-head{display:flex;justify-content:space-between;margin-bottom:12px}.page-head h3{margin:0;font-weight:800}.page-head p{margin:2px 0;color:#64748b;font-size:12px}.settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}.card h6{font-weight:800;margin-bottom:12px}label{display:block;font-size:11px;font-weight:700;margin:8px 0 4px}@media(max-width:900px){.settings-grid{grid-template-columns:1fr}}</style>
