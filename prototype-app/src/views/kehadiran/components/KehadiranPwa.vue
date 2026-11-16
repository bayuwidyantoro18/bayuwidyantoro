<template>
  <main class="attendance-pwa">
    <PwaPageHeader
      icon="fas fa-fingerprint"
      title="Kehadiran"
      subtitle="Presensi masuk, pulang, dan riwayat Anda"
    />

    <section class="today-banner" aria-label="Tanggal hari ini">
      <div class="today-copy">
        <span class="eyebrow"><i class="fas fa-calendar-day"></i> PRESENSI HARI INI</span>
        <strong>{{ formatLongDate(today?.tanggal || todayDate) }}</strong>
        <span class="today-hint">Pastikan lokasi GPS aktif sebelum merekam presensi.</span>
      </div>
      <button type="button" class="icon-btn" :disabled="loading || saving" aria-label="Perbarui data kehadiran" @click="loadData">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
      </button>
    </section>

    <section v-if="today?.jadwal" class="schedule-card">
      <div class="section-heading">
        <span class="section-icon schedule-icon"><i class="fas fa-clock"></i></span>
        <div class="section-title"><h2>Jadwal Kerja</h2><p>{{ today.jadwal.is_event ? today.jadwal.event_name : 'Jam Kerja Normal' }}</p></div>
        <span class="day-chip" :class="today.jadwal.is_hari_libur ? 'holiday' : 'workday'">
          {{ today.jadwal.is_hari_libur ? 'Hari libur' : 'Hari kerja' }}
        </span>
      </div>
      <div class="schedule-grid">
        <div><span>Jam masuk</span><strong>{{ today.jadwal.jam_masuk || '—' }}</strong></div>
        <div><span>Jam pulang</span><strong>{{ today.jadwal.jam_pulang || '—' }}</strong></div>
        <div><span>Mulai lembur</span><strong>{{ today.jadwal.lembur_mulai || '—' }}</strong></div>
      </div>
    </section>

    <section v-if="geofence.enabled" class="geo-card">
      <span class="geo-icon"><i class="fas fa-location-dot"></i></span>
      <div class="geo-copy"><strong>{{ geofence.location_name || 'Lokasi kerja' }}</strong><span>GPS dan radius lokasi diperlukan untuk presensi.</span></div>
      <span class="radius-chip">{{ geofence.radius_meter }} m</span>
    </section>

    <section class="attendance-section">
      <div class="section-heading attendance-heading">
        <div><h2>Aktivitas Presensi</h2><p>Rekam waktu aktual Anda</p></div>
        <span class="secure-chip"><i class="fas fa-shield-alt"></i> Terlindungi</span>
      </div>
      <div class="attendance-actions">
        <article class="action-card check-in" :class="{ completed: !!today?.jam_masuk }">
          <div class="action-top"><span class="action-icon"><i class="fas fa-sign-in-alt"></i></span><span class="action-state" :class="today?.jam_masuk ? 'done' : 'pending'">{{ today?.jam_masuk ? 'Tercatat' : 'Belum absen' }}</span></div>
          <div class="action-info"><h3>{{ today?.jam_masuk ? 'Absen masuk' : 'Mulai hari kerja' }}</h3><p>{{ today?.jam_masuk ? 'Waktu masuk berhasil tercatat.' : 'Catat waktu kedatangan Anda.' }}</p><strong class="action-time">{{ formatTime(today?.jam_masuk) }}</strong></div>
          <button type="button" class="action-button" :disabled="saving || !!today?.jam_masuk" @click="rekam('masuk')">
            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-fingerprint'"></i>
            {{ saving ? 'Memproses…' : (today?.jam_masuk ? 'Sudah tercatat' : 'Absen masuk') }}
          </button>
        </article>

        <article class="action-card check-out" :class="{ completed: !!today?.jam_pulang }">
          <div class="action-top"><span class="action-icon"><i class="fas fa-sign-out-alt"></i></span><span class="action-state" :class="today?.jam_pulang ? 'done' : 'pending'">{{ today?.jam_pulang ? 'Tercatat' : 'Menunggu' }}</span></div>
          <div class="action-info"><h3>{{ today?.jam_pulang ? 'Absen pulang' : 'Akhiri hari kerja' }}</h3><p>{{ today?.jam_pulang ? 'Waktu pulang sudah tercatat. Anda dapat memperbaruinya bila diperlukan.' : (today?.jam_masuk ? 'Catat waktu kepulangan Anda.' : 'Absen masuk terlebih dahulu untuk mengaktifkan fitur ini.') }}</p><strong class="action-time">{{ formatTime(today?.jam_pulang) }}</strong></div>
          <button type="button" class="action-button" :disabled="saving || !today?.jam_masuk" @click="rekam('pulang')">
            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-door-open'"></i>
            {{ saving ? 'Memproses…' : (today?.jam_pulang ? 'Perbarui absen pulang' : 'Absen pulang') }}
          </button>
        </article>
      </div>
      <p class="action-note"><i class="fas fa-info-circle"></i> Jika layar menampilkan pesan error setelah presensi, status akan diperiksa ulang ke server sebelum Anda diminta mencoba kembali.</p>
    </section>

    <section class="history-card">
      <div class="section-heading history-heading">
        <span class="section-icon history-icon"><i class="fas fa-history"></i></span>
        <div class="section-title"><h2>Riwayat Kehadiran</h2><p>{{ selectedMonthLabel }}</p></div>
        <button type="button" class="pdf-btn" :disabled="printing" @click="printPdf"><i class="fas fa-file-pdf"></i><span>{{ printing ? 'Menyiapkan…' : 'Unduh PDF' }}</span></button>
      </div>
      <label class="month-label" for="attendance-month">Pilih periode</label>
      <select id="attendance-month" :value="bulan" class="form-select month-select" @change="$emit('update-bulan', $event.target.value)">
        <option v-for="option in monthOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <div v-if="loading && !rekap.length" class="state-card"><i class="fas fa-spinner fa-spin"></i><strong>Memuat riwayat…</strong></div>
      <div v-else-if="!rekap.length" class="state-card"><span class="empty-icon"><i class="fas fa-calendar-xmark"></i></span><strong>Belum ada riwayat</strong><span>Data kehadiran untuk periode ini akan tampil di sini.</span></div>
      <div v-else class="history-list">
        <article v-for="item in rekap" :key="item.id" class="history-item">
          <div class="history-date"><strong>{{ day(item.tanggal) }}</strong><span>{{ weekday(item.tanggal) }}</span></div>
          <div class="history-details">
            <div class="history-times"><div><span><i class="fas fa-sign-in-alt"></i> Masuk</span><strong>{{ formatTime(item.jam_masuk) }}</strong></div><div><span><i class="fas fa-sign-out-alt"></i> Pulang</span><strong>{{ formatTime(item.jam_pulang) }}</strong></div></div>
            <div class="history-bottom"><span class="status-pill">{{ item.status || '—' }}</span><span class="location-text" v-html="locationLabel(item, 'masuk')"></span></div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import PwaPageHeader from '../../../components/PwaPageHeader.vue'

defineProps({
  loading: Boolean,
  saving: Boolean,
  printing: Boolean,
  today: { type: Object, default: null },
  rekap: { type: Array, default: () => [] },
  bulan: { type: String, default: '' },
  todayDate: { type: String, default: '' },
  geofence: { type: Object, default: () => ({ enabled: false }) },
  selectedMonthLabel: { type: String, default: '' },
  monthOptions: { type: Array, default: () => [] },
  formatLongDate: { type: Function, required: true },
  formatTime: { type: Function, required: true },
  locationLabel: { type: Function, required: true },
  loadData: { type: Function, required: true },
  rekam: { type: Function, required: true },
  printPdf: { type: Function, required: true },
})

defineEmits(['update-bulan'])

const day = value => value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '—'
const weekday = value => value ? new Intl.DateTimeFormat('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '—'
</script>

<style scoped>
.attendance-pwa{--ink:#12213b;--muted:#64748b;--line:#e3eaf3;--blue:#2459d3;--green:#11845b;padding:4px 0 96px;color:var(--ink);font-size:1.25em}
.today-banner,.schedule-card,.geo-card,.attendance-section,.history-card{margin:0 0 14px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(21,43,83,.055)}
.today-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px;background:linear-gradient(120deg,#102653 0%,#2459d3 72%,#3979e8 100%);color:#fff;border:0;overflow:hidden;position:relative}
.today-banner:after{content:"";position:absolute;width:150px;height:150px;border:24px solid rgba(255,255,255,.08);border-radius:50%;right:-44px;top:-65px;pointer-events:none}
.today-copy{min-width:0;position:relative;z-index:1}.eyebrow{display:block;font-size:10px;letter-spacing:1.2px;font-weight:900;color:#cfe0ff}.eyebrow i{margin-right:6px}.today-copy>strong{display:block;margin:8px 0 5px;font-size:17px;line-height:1.35;font-weight:900}.today-hint{display:block;max-width:290px;color:#e0eaff;font-size:11px;line-height:1.5}
.icon-btn{flex:0 0 42px;width:42px;height:42px;border:1px solid rgba(255,255,255,.3);border-radius:14px;background:rgba(255,255,255,.12);color:#fff;font-size:16px;position:relative;z-index:1}.icon-btn:disabled{opacity:.6}
.schedule-card,.attendance-section,.history-card{padding:16px}.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:14px}.section-icon{display:flex;align-items:center;justify-content:center;flex:0 0 42px;width:42px;height:42px;border-radius:14px;font-size:17px}.schedule-icon{background:#e8efff;color:#2459d3}.history-icon{background:#e5f7ef;color:#11845b}.section-title{min-width:0;flex:1}.section-title h2,.attendance-heading h2{margin:0;color:var(--ink);font-size:15px;font-weight:900}.section-title p,.attendance-heading p{margin:3px 0 0;color:var(--muted);font-size:11px;line-height:1.45}.day-chip,.secure-chip,.radius-chip{padding:6px 9px;border-radius:999px;font-size:10px;font-weight:850;white-space:nowrap}.day-chip.workday{background:#e4f8ee;color:#08764d}.day-chip.holiday{background:#fff0db;color:#9a5200}
.schedule-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.schedule-grid>div{padding:12px 10px;border:1px solid #edf1f7;border-radius:13px;background:#f8faff;min-width:0}.schedule-grid span{display:block;color:var(--muted);font-size:10px;font-weight:750}.schedule-grid strong{display:block;margin-top:5px;color:var(--ink);font-size:14px;font-weight:900;overflow-wrap:anywhere}
.geo-card{display:flex;align-items:center;gap:11px;padding:13px;background:#f0f7ff;border-color:#d7e9ff}.geo-icon{display:flex;align-items:center;justify-content:center;flex:0 0 40px;width:40px;height:40px;border-radius:13px;background:#dcecff;color:#2459d3;font-size:17px}.geo-copy{flex:1;min-width:0}.geo-copy strong,.geo-copy span{display:block}.geo-copy strong{font-size:13px;font-weight:900;color:#17376b}.geo-copy span{font-size:10px;line-height:1.45;color:#536c91;margin-top:3px}.radius-chip{background:#fff;color:#2459d3;border:1px solid #d7e6fb}
.attendance-heading{justify-content:space-between}.attendance-heading>div{flex:1}.secure-chip{background:#edf8f2;color:#08764d}.secure-chip i{margin-right:4px}.attendance-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.action-card{display:flex;flex-direction:column;min-width:0;padding:14px;border:1px solid var(--line);border-radius:17px;background:#fbfcff}.action-card.check-in{border-top:4px solid #159568}.action-card.check-out{border-top:4px solid #2c63d8}.action-card.completed{background:linear-gradient(160deg,#f4fbf7,#fff 68%)}.action-top{display:flex;align-items:center;justify-content:space-between;gap:6px}.action-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;font-size:18px}.check-in .action-icon{background:#dcf8eb;color:#11845b}.check-out .action-icon{background:#e1ebff;color:#2459d3}.action-state{padding:5px 7px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.action-state.done{background:#dff8e9;color:#08764d}.action-state.pending{background:#f0f3f8;color:#61718a}.action-info{flex:1;padding:12px 0}.action-info h3{margin:0;font-size:14px;font-weight:900;color:var(--ink)}.action-info p{min-height:44px;margin:5px 0 10px;color:var(--muted);font-size:10.5px;line-height:1.5}.action-time{display:block;font-size:25px;line-height:1.1;font-weight:950;letter-spacing:.3px;color:var(--ink)}.action-button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;width:100%;padding:10px 8px;border:0;border-radius:12px;background:#11845b;color:#fff;font-size:11px;font-weight:900;line-height:1.3;box-shadow:0 4px 10px rgba(17,132,91,.15)}.check-out .action-button{background:#2459d3;box-shadow:0 4px 10px rgba(36,89,211,.15)}.action-button:disabled{background:#e8edf4;color:#8491a5;box-shadow:none;cursor:not-allowed}.action-note{display:flex;gap:8px;align-items:flex-start;margin:11px 2px 0;color:var(--muted);font-size:10px;line-height:1.5}.action-note i{color:#2459d3;margin-top:2px}
.history-heading{margin-bottom:12px}.pdf-btn{display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #ffd4d4;border-radius:12px;background:#fff5f5;color:#bf2d35;font-size:10px;font-weight:900;white-space:nowrap}.pdf-btn:disabled{opacity:.6}.month-label{display:block;margin-bottom:6px;color:#53627a;font-size:11px;font-weight:850}.month-select{min-height:44px;margin-bottom:13px;border-radius:12px;border-color:#dce4ef;font-size:12px;padding:9px 12px}.history-list{display:flex;flex-direction:column;gap:9px}.history-item{display:grid;grid-template-columns:55px minmax(0,1fr);gap:12px;padding:12px;border:1px solid #e9eef5;border-radius:15px;background:#fff}.history-date{display:flex;flex-direction:column;align-items:center;justify-content:center;align-self:stretch;border-right:1px solid #e8edf4;padding-right:10px}.history-date strong{font-size:21px;line-height:1;font-weight:950;color:var(--ink)}.history-date span{margin-top:5px;font-size:10px;color:var(--muted);font-weight:800}.history-details{min-width:0}.history-times{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.history-times>div span,.history-times>div strong{display:block}.history-times>div span{font-size:10px;color:var(--muted);font-weight:750}.history-times>div span i{margin-right:4px;color:#2459d3}.history-times>div strong{margin-top:4px;font-size:14px;color:var(--ink);font-weight:900}.history-bottom{display:flex;align-items:flex-start;gap:8px;margin-top:9px;padding-top:9px;border-top:1px solid #eef2f7}.status-pill{flex:0 0 auto;padding:5px 8px;border-radius:999px;background:#e8f7ee;color:#08764d;font-size:9px;font-weight:900}.location-text{min-width:0;color:#64748b;font-size:10px;line-height:1.45;overflow-wrap:anywhere}.location-text :deep(strong){color:#334155}.state-card{min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px;color:#64748b;text-align:center}.state-card>i{font-size:20px;color:#2459d3}.state-card strong{font-size:13px;color:var(--ink)}.state-card>span:last-child{font-size:11px;line-height:1.5}.empty-icon{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:16px;background:#f0f4fa;color:#8b9ab1;font-size:20px}
@media(max-width:520px){.attendance-pwa{padding-bottom:100px}.today-banner,.schedule-card,.geo-card,.attendance-section,.history-card{border-radius:17px;margin-bottom:12px}.today-banner{padding:15px}.today-copy>strong{font-size:16px}.schedule-card,.attendance-section,.history-card{padding:13px}.schedule-grid{gap:6px}.schedule-grid>div{padding:10px 8px}.schedule-grid strong{font-size:13px}.attendance-actions{grid-template-columns:1fr}.action-card{padding:13px}.action-info p{min-height:0}.action-info{padding:10px 0}.action-button{min-height:48px;font-size:12px}.section-icon{width:38px;height:38px;flex-basis:38px}.section-title h2,.attendance-heading h2{font-size:15px}.pdf-btn{padding:9px}.pdf-btn span{display:none}.history-item{grid-template-columns:48px minmax(0,1fr);gap:9px;padding:10px}.history-date{padding-right:8px}.history-date strong{font-size:19px}}
@media(max-width:360px){.eyebrow{font-size:9px}.today-hint{font-size:10px}.day-chip{font-size:9px;padding:5px 6px}.schedule-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.geo-card{align-items:flex-start}.radius-chip{font-size:9px}.history-times>div strong{font-size:13px}}
@media(prefers-reduced-motion:reduce){.attendance-pwa *{scroll-behavior:auto!important;transition:none!important}}
</style>
