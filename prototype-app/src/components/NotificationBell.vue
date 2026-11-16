<template>
  <div class="notification-wrap" @click.stop>
    <button type="button" class="notification-button" @click="toggle" :aria-label="`Notifikasi ${unread}`">
      <i class="fas fa-bell"></i>
      <span v-if="unread > 0" class="notification-count">{{ unread > 99 ? '99+' : unread }}</span>
    </button>

    <div v-if="open" class="notification-panel">
      <div class="notification-head">
        <div><strong>Notifikasi</strong><small>{{ unread }} belum dibaca</small></div>
        <button v-if="unread" type="button" @click="readAll">Tandai semua dibaca</button>
      </div>

      <div v-if="items.length" class="notification-list">
        <button v-for="item in items" :key="item.id" type="button"
          class="notification-item" :class="{ unread: !item.read_at }" @click="openItem(item)">
          <span class="notification-icon"><i :class="iconClass(item.type)"></i></span>
          <span class="notification-copy">
            <strong>{{ item.title }}</strong>
            <span>{{ item.message }}</span>
            <small>{{ formatDate(item.created_at) }}</small>
          </span>
        </button>
      </div>
      <div v-else class="notification-empty">
        <i class="far fa-bell-slash"></i><span>Belum ada notifikasi.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router=useRouter()
const open=ref(false)
const items=ref([])
const unread=ref(0)
let timer=null

const load=async()=>{
  try{
    const r=await api.get('/notifikasi')
    const d=r.data?.data||{}
    items.value=Array.isArray(d.items)?d.items:[]
    unread.value=Number(d.total_unread ?? d.unread_count ?? 0)
  }catch(e){console.warn('Gagal memuat notifikasi',e)}
}

const toggle=()=>{open.value=!open.value;if(open.value)load()}

const readAll=async()=>{
  try{await api.post('/notifikasi/read-all');await load()}catch(e){console.warn(e)}
}

const openItem=async(item)=>{
  try{
    if(!item.read_at){
      await api.post('/notifikasi/read',{source:item.source,id:item.source_id})
    }
  }catch(e){console.warn(e)}
  finally{
    open.value=false
    await load()
    if(item.url)router.push(item.url)
  }
}

const formatDate=(v)=>v
  ? new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Jakarta'}).format(new Date(v))
  : '-'

const closeOnOutside=()=>{open.value=false}

const iconClass=(type)=>{
  if(type==='approval')return 'fas fa-file-signature'
  if(type==='approval_result')return 'fas fa-circle-check'
  if(type==='presensi')return 'fas fa-clock'
  if(type==='surat_masuk')return 'fas fa-envelope-open-text'
  return 'fas fa-info-circle'
}

onMounted(()=>{load();timer=setInterval(load,30000);document.addEventListener('click',closeOnOutside)})
onBeforeUnmount(()=>{if(timer)clearInterval(timer);document.removeEventListener('click',closeOnOutside)})
</script>

<style scoped>
.notification-wrap{position:relative}.notification-button{position:relative;width:34px;height:34px;border:1px solid #e5e7eb;background:#fff;border-radius:10px;color:#334155;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.notification-button:hover{background:#f8fafc;color:#1d4ed8}.notification-count{position:absolute;right:-5px;top:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:#dc2626;color:#fff;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid #fff}.notification-panel{position:absolute;right:0;top:42px;width:370px;max-width:calc(100vw - 20px);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 1rem 2rem rgba(15,23,42,.16);z-index:999999;overflow:hidden}.notification-head{display:flex;justify-content:space-between;gap:10px;padding:12px;border-bottom:1px solid #eef2f7}.notification-head strong{display:block;font-size:13px}.notification-head small{display:block;color:#64748b;font-size:10px;margin-top:2px}.notification-head button{border:0;background:transparent;color:#2563eb;font-size:10px;font-weight:800}.notification-list{max-height:390px;overflow:auto}.notification-item{width:100%;display:flex;gap:9px;padding:10px 12px;border:0;border-bottom:1px solid #f1f5f9;background:#fff;text-align:left}.notification-item:hover,.notification-item.unread{background:#f8fbff}.notification-icon{width:28px;height:28px;flex:0 0 28px;border-radius:9px;background:#eef2ff;color:#4338ca;display:flex;align-items:center;justify-content:center}.notification-copy{min-width:0}.notification-copy strong,.notification-copy span,.notification-copy small{display:block}.notification-copy strong{font-size:11px;color:#111827}.notification-copy span{font-size:10.5px;color:#475569;line-height:1.4;margin-top:2px}.notification-copy small{font-size:9px;color:#94a3b8;margin-top:3px}.notification-empty{padding:35px 15px;text-align:center;color:#94a3b8;font-size:11px}.notification-empty i{display:block;font-size:24px;margin-bottom:8px}
</style>
