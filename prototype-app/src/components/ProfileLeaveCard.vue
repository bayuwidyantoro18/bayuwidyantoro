<template>
  <section class="leave-profile-card">
    <div class="leave-head">
      <div>
        <span class="eyebrow">KEHADIRAN</span>
        <h5><i class="fas fa-calendar-check me-1"></i> Hak Cuti & Riwayat Izin/Cuti</h5>
        <small>Ringkasan hak cuti tahunan dan pengajuan terakhir Anda.</small>
      </div>
      <div class="leave-tools">
        <select v-model="year" @change="loadAll" class="form-select form-select-sm">
          <option value="">Semua Riwayat</option>
          <option :value="currentYear">{{ currentYear }}</option>
          <option :value="currentYear - 1">{{ currentYear - 1 }}</option>
        </select>
        <button class="btn btn-sm btn-outline-primary" @click="loadAll" :disabled="loading">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <div class="balance-grid">
      <div class="balance-item blue"><span>Hak Tahun Ini</span><strong>{{ balance.hak_cuti_tahunan || 0 }}</strong><small>hari</small></div>
      <div class="balance-item green"><span>Sisa Hak Cuti</span><strong>{{ balance.sisa_cuti || 0 }}</strong><small>hari</small></div>
      <div class="balance-item orange"><span>Dalam Rencana</span><strong>{{ balance.cuti_rencana || 0 }}</strong><small>hari</small></div>
      <div class="balance-item red"><span>Hangus</span><strong>{{ balance.cuti_hangus || 0 }}</strong><small>hari</small></div>
    </div>

    <div class="leave-meta">
      <span><i class="fas fa-history"></i> Carry over: <strong>{{ balance.sisa_tahun_lalu_tersedia || 0 }}</strong> hari tersedia</span>
      <span v-if="balance.expired_sisa_cuti"><i class="fas fa-calendar-xmark"></i> Expired: <strong>{{ formatDate(balance.expired_sisa_cuti) }}</strong></span>
      <span>{{ balance.status_penggunaan || '' }}</span>
    </div>

    <div class="history-head">
      <div>
        <h6>Riwayat Izin & Cuti Saya</h6>
        <small>Termasuk Cuti, Block Leave, dan Izin Potong Cuti.</small>
      </div>
      <span>{{ rows.length }} data</span>
    </div>

    <div v-if="loading" class="history-empty"><span class="spinner-border spinner-border-sm me-2"></span>Memuat riwayat...</div>
    <div v-else-if="!rows.length" class="history-empty"><i class="far fa-calendar-xmark"></i> Belum ada riwayat.</div>
    <div v-else class="history-list">
      <div v-for="item in rows" :key="item.id" class="history-row">
        <div class="history-main">
          <div class="history-title">
            <strong>{{ item.jenis }}</strong>
            <span :class="['status', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
          </div>
          <small>{{ item.kategori }} · {{ formatDate(item.tanggal_mulai) }} s.d. {{ formatDate(item.tanggal_selesai) }} · {{ item.jumlah_hari }} hari</small>
          <p>{{ item.keperluan || '-' }}</p>
          <em v-if="item.keterangan_approval">Approval: {{ item.keterangan_approval }}</em>
        </div>
      </div>
    </div>

    <div v-if="pagination.last_page > 1" class="history-pagination">
      <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page<=1" @click="loadHistory(pagination.current_page-1)">Sebelumnya</button>
      <span>Halaman {{ pagination.current_page }} / {{ pagination.last_page }}</span>
      <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page>=pagination.last_page" @click="loadHistory(pagination.current_page+1)">Berikutnya</button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const currentYear=new Date().getFullYear()
const year=ref(String(currentYear))
const balance=ref({})
const rows=ref([])
const loading=ref(false)
const pagination=ref({current_page:1,last_page:1})

const formatDate=(v)=>{
  if(!v)return '-'
  return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(v))
}
const statusLabel=(v)=>({Diajukan:'Menunggu Approval',Disetujui:'Disetujui',Ditolak:'Ditolak'}[v]||v||'-')
const statusClass=(v)=>({Diajukan:'pending',Disetujui:'approved',Ditolak:'rejected'}[v]||'')

const loadBalance=async()=>{
  const params=year.value?{tahun:year.value}:{}
  const r=await api.get('/profil-saya/cuti',{params})
  balance.value=r.data?.balance||{}
}
const loadHistory=async(page=1)=>{
  const params={per_page:10,page}
  if(year.value)params.tahun=year.value
  const r=await api.get('/profil-saya/riwayat-izin-cuti',{params})
  const d=r.data?.data||{}
  rows.value=d.data||[]
  pagination.value=d||pagination.value
}
const loadAll=async()=>{
  loading.value=true
  try{await Promise.all([loadBalance(),loadHistory(1)])}catch(e){console.warn('Gagal memuat cuti/izin profil',e)}finally{loading.value=false}
}
onMounted(loadAll)
</script>

<style scoped>
.leave-profile-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:15px;margin-bottom:18px;box-shadow:0 .25rem .8rem rgba(15,23,42,.05)}
.leave-head,.history-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.eyebrow{display:block;font-size:9px;letter-spacing:.12em;font-weight:900;color:#2563eb}
.leave-head h5{margin:2px 0;color:#0f172a;font-weight:950}.leave-head small,.history-head small{color:#64748b;font-size:10px}.leave-tools{display:flex;gap:6px;align-items:center}.leave-tools select{min-width:135px}
.balance-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.balance-item{border:1px solid #e5e7eb;border-radius:11px;padding:9px;background:#f8fafc}.balance-item span{display:block;color:#64748b;font-size:10px}.balance-item strong{display:block;color:#0f172a;font-size:20px;margin-top:2px}.balance-item small{color:#94a3b8;font-size:9px}.balance-item.blue{border-top:3px solid #2563eb}.balance-item.green{border-top:3px solid #16a34a}.balance-item.orange{border-top:3px solid #f59e0b}.balance-item.red{border-top:3px solid #dc2626}
.leave-meta{display:flex;gap:10px;flex-wrap:wrap;padding:8px 10px;border-radius:9px;background:#f8fafc;color:#64748b;font-size:10px;margin-bottom:13px}.leave-meta strong{color:#334155}
.history-head{padding-top:11px;border-top:1px solid #eef2f7}.history-head h6{margin:0;font-weight:900}.history-head>span{font-size:10px;color:#64748b}.history-list{margin-top:8px}.history-row{padding:9px 0;border-bottom:1px solid #eef2f7}.history-title{display:flex;justify-content:space-between;gap:8px;align-items:center}.history-title strong{font-size:11px;color:#111827}.history-row small{display:block;color:#64748b;font-size:9.5px;margin-top:2px}.history-row p{margin:4px 0 0;font-size:10px;color:#475569}.history-row em{font-style:normal;color:#64748b;font-size:9px}.status{padding:3px 7px;border-radius:999px;font-size:9px;font-weight:800}.status.pending{background:#fef3c7;color:#92400e}.status.approved{background:#dcfce7;color:#166534}.status.rejected{background:#fee2e2;color:#991b1b}.history-empty{text-align:center;padding:20px;color:#64748b;font-size:11px}.history-pagination{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:10px;color:#64748b}
@media(max-width:768px){.leave-head{flex-direction:column}.leave-tools{width:100%}.leave-tools select{flex:1}.balance-grid{grid-template-columns:repeat(2,1fr)}.history-pagination{gap:8px;flex-wrap:wrap}}
</style>
