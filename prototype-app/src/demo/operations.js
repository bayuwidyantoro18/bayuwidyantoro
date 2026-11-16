import { today, user, drivers, vehicles, now, location } from './state.js';
import { markFile, uploadedFile } from './uploads.js';
import { db, edit, need, lookup, ok, fail, filters, page, exportFile, documentFile, withoutFiles } from './records.js';

const agendaStates = ['antrian','dalam_perjalanan','sampai_tujuan','selesai','batal'];
const describeAgenda = row => ({
  ...row, nama: row.nama || user.name, username: user.username, user, petugas: user,
  can_start: row.status === 'antrian', can_arrived: row.status === 'dalam_perjalanan',
  can_finish: row.status === 'sampai_tujuan', can_cancel: !['selesai','batal'].includes(row.status),
  foto_count: row.photos?.length || 0, fotos_count: row.photos?.length || 0,
});
const totals = rows => Object.fromEntries(agendaStates.map(status => [status, rows.filter(row => row.status === status).length]));
export async function agenda(method, parts, fields, query, path) {
  const [, id, action, image] = parts;
  if (method === 'get') {
    if (id && /^\d+$/.test(id) && action === 'fotos') {
      const row = need(db.agenda,id);
      if (image) return await uploadedFile(row.photos?.[Number(image)-1]) || new Blob([], {type:'image/png'});
      return ok((row.photos || []).map((_,i) => ({ id: i+1, agenda_perjalanan_id: row.id, url: `/agenda-perjalanan/${id}/fotos/${i+1}`, file_url: `/agenda-perjalanan/${id}/fotos/${i+1}`, nama_file: `Foto Demo ${i+1}`, file_name: `Foto Demo ${i+1}` })));
    }
    const rows = filters(db.agenda,query,'tanggal',['status','status_perjalanan','user_id']).map(describeAgenda);
    const tally = { total: rows.length, ...totals(rows) };
    if (id === 'export') return exportFile(path,rows,'Laporan Agenda Harian',['tanggal','nama','tujuan','keperluan','status','started_at','arrived_at','finished_at']);
    if (id === 'rekap-kinerja') return ok(rows.length ? [{
      ...tally, user_id: user.id, nama: user.name, username: user.username,
      persentase_selesai: Math.round(tally.selesai * 100 / rows.length), rata_rata_menit: 90,
      tujuan_terbanyak: rows[0].tujuan, aktivitas_terakhir: today,
    }] : [], {summary: {...tally, total_petugas: rows.length ? 1 : 0}, users: [user] });
    return ok(rows,{summary: tally, users: [user]});
  }
  if (id === 'bulk') {
    const rows = (fields.items || []).map(row => edit(db.agenda,null,{
      ...row, user_id: user.id, tanggal: fields.tanggal, status: 'antrian', status_perjalanan: 'antrian',
    }));
    return ok(rows);
  }
  const row = need(db.agenda,id);
  const states = { mulai:'dalam_perjalanan', sampai:'sampai_tujuan', 'sampai-tujuan':'sampai_tujuan', selesai:'selesai', batal:'batal' };
  if (!states[action]) fail('Aksi agenda tidak tersedia.',404);
  Object.assign(row,withoutFiles(fields),{ status: states[action], status_perjalanan: states[action] });
  const times = { mulai: 'started_at', sampai: 'arrived_at', 'sampai-tujuan':'arrived_at', selesai:'finished_at', batal:'cancelled_at' };
  row[times[action]] = now();
  if (fields.latitude) {
    const stage = action.startsWith('sampai') ? 'sampai' : action;
    Object.assign(row,{
      last_latitude:fields.latitude,last_longitude:fields.longitude,lokasi_terkini:'Lokasi Demo',
      [stage+'_latitude']:fields.latitude,[stage+'_longitude']:fields.longitude,
    });
  }
  if (fields.foto_selesai) row.photos = fields.foto_selesai.map(markFile);
  return ok(describeAgenda(row));
}

const options = { drivers, kendaraans: vehicles, defaults: { lokasi_jemput: 'Kantor Demo' }, user };
const dashboardBooking = row => ({
  ...row,
  pemohon:row.nama_pemohon,
  driver:row.driver?.nama_driver,
  tujuan:row.tujuan_awal,
  mulai_at:row.started_at,
  sampai_at:row.arrived_at,
  selesai_at:row.finished_at,
  lokasi_terbaru_label:row.lokasi_terkini,
  route_steps:[{ label:row.tujuan_awal,tujuan:row.tujuan_awal },...(row.tujuans || []).map(item=>({...item,label:item.tujuan}))],
});
const bookingView = row => {
  const state = row.status_reservasi;
  const step = row.status_perjalanan;
  return {
    status_perjalanan:'belum_mulai', ...row, driver: lookup(drivers,row.driver_id), kendaraan: lookup(vehicles,row.kendaraan_id),
    pemohon: user, nama_driver: lookup(drivers,row.driver_id)?.nama_driver,
    can_update: state === 'pending', can_cancel: ['pending','approved'].includes(state),
    can_approve: state === 'pending', can_reject: state === 'pending', can_start: state === 'approved',
    can_arrived: state === 'on_progress' && ['menuju_lokasi','lanjut_tujuan'].includes(step),
    can_standby: state === 'on_progress' && step === 'sampai_lokasi',
    can_continue_trip: state === 'on_progress' && ['sampai_lokasi','standby_lokasi'].includes(step) && !!row.next_tujuan,
    can_return_office: state === 'on_progress' && ['sampai_lokasi','standby_lokasi'].includes(step),
    can_finish: state === 'on_progress' && ['sampai_lokasi','standby_lokasi','perjalanan_pulang'].includes(step),
  };
};
export async function booking(method,parts,fields,query,path) {
  const [,section,id,action] = parts;
  if (section === 'options' || id === 'options') return ok(options);
  const all = db.bookings.map(bookingView);
  if (method === 'get') {
    if (section === 'dashboard') return ok({
      summary: {
        total_hari_ini: all.filter(row => row.tanggal_reservasi === today).length,
        menunggu_approval: all.filter(row => row.status_reservasi === 'pending').length,
        sedang_berjalan: all.filter(row => row.status_reservasi === 'on_progress').length,
        selesai_hari_ini: all.filter(row => row.status_reservasi === 'completed' && row.tanggal_reservasi === today).length,
        driver_standby: drivers.filter(driver => !all.some(row => row.driver_id === driver.id && row.status_reservasi === 'on_progress')).length,
      },
      driver_list: drivers.map(driver => {
        const active = all.find(row => row.driver_id === driver.id && row.status_reservasi === 'on_progress');
        return {...driver, status_driver: active?.status_perjalanan || 'standby', kendaraan: active?.kendaraan?.nama_kendaraan, lokasi_terkini: active?.tujuan_awal || 'Kantor Demo'};
      }),
      upcoming_list: all.filter(row => ['pending','approved'].includes(row.status_reservasi)).map(dashboardBooking),
      route_list: all.filter(row => row.status_reservasi === 'on_progress').map(dashboardBooking),
    });
    const scope = {
      approval: statuses => statuses === 'pending',
      perjalanan: statuses => ['approved','on_progress'].includes(statuses),
      riwayat: statuses => ['rejected','cancelled','completed','incomplete'].includes(statuses),
    }[section];
    const base = scope && !query.status_reservasi ? all.filter(row => scope(row.status_reservasi)) : all;
    const rows = filters(base,{...query,status_reservasi:query.status_reservasi || query.status},'tanggal_reservasi',['status_reservasi','status_perjalanan','driver_id','kendaraan_id','unit_kerja']);
    if (id?.startsWith('export-')) return exportFile(path,rows,'Laporan Reservasi Driver',['kode_reservasi','nama_pemohon','tanggal_reservasi','jam_mulai','tujuan_awal','nama_driver','status_reservasi']);
    return page(rows,query);
  }
  if (section === 'reservasi' && !action) {
    if (fields.jam_selesai_estimasi <= fields.jam_mulai) fail('Jam selesai harus setelah jam mulai.');
    const existing = id ? need(db.bookings,id) : null;
    const row = edit(db.bookings,id,{ pemohon: user, nama_pemohon: user.name, user_id: user.id, status_reservasi:'pending', ...fields });
    row.kode_reservasi = existing?.kode_reservasi || `RSV-DEMO-${String(row.id).padStart(3,'0')}`;
    return ok(bookingView(row));
  }
  const row = need(db.bookings,id);
  const outcomes = { approve:'approved', reject:'rejected', cancel:'cancelled', start:'on_progress', finish:'completed', incomplete:'incomplete' };
  const steps = { start:'menuju_lokasi', arrived:'sampai_lokasi', standby:'standby_lokasi', 'continue':'menuju_lokasi', 'continue-trip':'lanjut_tujuan', 'return-office':'perjalanan_pulang', finish:'selesai', incomplete:'tidak_selesai' };
  if (!outcomes[action] && !steps[action]) fail('Aksi reservasi tidak tersedia.',404);
  Object.assign(row,withoutFiles(fields));
  if (outcomes[action]) row.status_reservasi = outcomes[action];
  if (steps[action]) row.status_perjalanan = steps[action];
  if (action === 'start') {
    row.started_at = now();
    row.current_tujuan = { tujuan: row.tujuan_awal, lokasi: row.tujuan_awal };
    row.next_tujuan = row.tujuans?.[0] || null;
  }
  if (['continue','continue-trip'].includes(action) && row.next_tujuan) {
    row.current_tujuan = row.next_tujuan;
    row.next_tujuan = row.tujuans?.[row.tujuans.indexOf(row.current_tujuan)+1] || null;
  }
  if (action === 'arrived') row.arrived_at = now();
  if (action === 'finish') row.finished_at = now();
  if (fields.latitude) Object.assign(row,{ latitude: location.latitude, longitude: location.longitude, lokasi_terkini:'Lokasi Demo' });
  return ok(bookingView(row));
}
