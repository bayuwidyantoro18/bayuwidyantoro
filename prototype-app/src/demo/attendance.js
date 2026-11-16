import { today, user, now, time } from './state.js';
import { db, edit, lookup, need, remove, ok, fail, filters, exportFile, documentFile, attach, withoutFiles, YES } from './records.js';

const approvalTypes = { koreksi:'corrections', 'cuti-izin':'leave', lembur:'overtime', 'koreksi-cuti':'leaveCorrections', 'koreksi-lembur':'overtimeCorrections' };
const typeLabels = { koreksi:'Koreksi Kehadiran', 'cuti-izin':'Cuti & Izin', lembur:'Lembur', 'koreksi-cuti':'Koreksi Cuti', 'koreksi-lembur':'Koreksi Lembur' };
const approvers = [{ id:3,user_id:3,nama:'Nadia Safitri',name:'Nadia Safitri',unit_kerja:'Keuangan',jabatan:'Kepala Divisi' }];
const leaveTypes = { Cuti:['Cuti Tahunan', 'Cuti Sakit'], Izin:['Izin Pribadi', 'Izin Dinas'] };
const person = id => lookup(db.people,id);
const cleanStatus = status => ({Disetujui:'approved',Ditolak:'rejected',Menunggu:'pending'}[status] || status);
const reportColumns = ['nip','nama','tanggal','status','jam_masuk','jam_pulang','jenis','jam_mulai','jam_selesai','total_jam','keterangan'];
const applicant = (row, type) => ({
  ...row, pegawai: person(row.pegawai_id), user,
  nama:person(row.pegawai_id)?.nama, type, type_label:typeLabels[type], status_approval:row.status,
  ...(type==='koreksi-cuti' ? {cuti:lookup(db.leave,row.cuti_id)} : {}),
  ...(type==='koreksi-lembur' ? {lembur:lookup(db.overtime,row.lembur_id)} : {}),
  nama_kadiv:approvers[0].nama, keperluan:row.keperluan || row.alasan || row.keterangan,
  dokumen_url:row.dokumen ? `/kehadiran/demo-dokumen/${type}/${row.id}` : null,
});
const checkins = query => filters(db.attendance,query,'tanggal').map(row=>({...row,pegawai:person(row.pegawai_id),nip:person(row.pegawai_id)?.nip,nama:person(row.pegawai_id)?.nama}));
const allRequests = type => db[approvalTypes[type]].map(row=>applicant(row,type));
const pending = type => allRequests(type).filter(row=>row.status==='pending');
const minutes = value => {
  const [h,m] = String(value || '00:00').split(':').map(Number);
  return h*60+m;
};
const forMonth = (rows,key,month) => rows.filter(row=>String(row[key] || '').startsWith(month));
function monthReport(month, overtime = false) {
  const [year,m] = month.split('-').map(Number);
  const count = new Date(year,m,0).getDate() || 31;
  const days = Array.from({length:count},(_,i)=>i+1);
  const rows = db.people.filter(person=>person.status==='Aktif').map(person=>{
    const dates = {};
    const attendance = forMonth(db.attendance.filter(row=>row.pegawai_id===person.id),'tanggal',month);
    const overtimeRows = forMonth(db.overtime.filter(row=>row.pegawai_id===person.id && row.status==='approved'),'tanggal',month);
    const leave = forMonth(db.leave.filter(row=>row.pegawai_id===person.id && row.status==='approved'),'tanggal_mulai',month);
    for (const item of attendance) dates[Number(item.tanggal.slice(-2))]={code:'H',status:'Hadir',...item};
    for (const item of leave) dates[Number(item.tanggal_mulai.slice(-2))]={code:item.kategori==='Cuti'?'C':'I',status:item.kategori,...item};
    const overtimeDays = Object.fromEntries(overtimeRows.map(row=>[Number(row.tanggal.slice(-2)),row.total_jam]));
    return { ...person, pegawai_id:person.id, divisi:person.unit_kerja, harian:overtime ? overtimeDays : dates, days:overtimeDays,
      total_jam:overtimeRows.reduce((total,row)=>total+Number(row.total_jam || 0),0) };
  });
  return { rows,days };
}
function existingRequest(type,id,status,fields) {
  if (!approvalTypes[type]) fail('Jenis pengajuan tidak ditemukan.');
  const row = need(db[approvalTypes[type]],id);
  const value = cleanStatus(status);
  if (!['approved','rejected'].includes(value)) fail('Pilih status persetujuan.');
  Object.assign(row,{status:value,status_approval:value,catatan:fields.catatan || fields.catatan_approval,approved_at:now()});
  if (value==='approved' && type==='koreksi') {
    const target = db.attendance.find(item=>item.pegawai_id===row.pegawai_id && item.tanggal===row.tanggal);
    const key = row.jenis_koreksi === 'pulang' ? 'jam_pulang' : 'jam_masuk';
    edit(db.attendance,target?.id,{pegawai_id:row.pegawai_id,tanggal:row.tanggal,status:'Hadir',[key]:row.jam_koreksi});
  }
  if (value==='approved' && type==='koreksi-cuti' && row.cuti_id) {
    const original = lookup(db.leave,row.cuti_id);
    if (original && row.jenis_tindakan === 'Batal') original.status = 'cancelled';
    else if (original) {
      Object.assign(original,{tanggal_mulai:row.tanggal_mulai_baru,tanggal_selesai:row.tanggal_selesai_baru});
      original.jumlah_hari=Math.round((Date.parse(original.tanggal_selesai)-Date.parse(original.tanggal_mulai))/86400000)+1;
    }
  }
  if (value==='approved' && type==='koreksi-lembur' && row.lembur_id) {
    const original = lookup(db.overtime,row.lembur_id);
    if (original && row.jenis_tindakan === 'Batal') original.status = 'cancelled';
    else if (original) {
      Object.assign(original,{jam_mulai:row.jam_mulai_baru,jam_selesai:row.jam_selesai_baru});
      original.total_menit=minutes(original.jam_selesai)-minutes(original.jam_mulai);
      original.total_jam=original.total_menit/60;
    }
  }
  return ok(row);
}
export async function attendance(method,parts,fields,query,path) {
  const [,section,id,action,detail] = parts;
  const month = query.bulan || today.slice(0,7);
  if (section==='dashboard') {
    const active=db.people.filter(row=>row.status==='Aktif');
    const present=checkins({tanggal:today}).filter(row=>row.jam_masuk);
    const leave=db.leave.filter(row=>row.status==='approved' && row.tanggal_mulai<=today && row.tanggal_selesai>=today).map(row=>applicant(row,'cuti-izin'));
    const groups = { hadir_hari_ini:present, cuti_hari_ini:leave.filter(row=>row.kategori==='Cuti'), izin_hari_ini:leave.filter(row=>row.kategori==='Izin'),
      belum_absen_hari_ini:active.filter(row=>!present.some(item=>item.pegawai_id===row.id)&&!leave.some(item=>item.pegawai_id===row.id)).map(row=>({...row,pegawai:row})) };
    return ok({tanggal:today,pegawai_wajib_absen:active.length,...Object.fromEntries(Object.entries(groups).flatMap(([key,data])=>[[key,data.length],[key+'_data',data]]))});
  }
  if (section==='geofence') return ok(db.geofence);
  if (section==='today') return ok({
    today: {
      tanggal:today, jam_masuk:null, jam_pulang:null, ...checkins({tanggal:today}).find(row=>row.pegawai_id===user.id),
      jadwal:{jam_masuk:db.settings.normal_jam_masuk,jam_pulang:db.settings.normal_jam_pulang,lembur_mulai:db.settings.normal_lembur_hari_kerja_mulai},
    },
    rekap_bulan_berjalan:checkins({bulan:month}).filter(row=>row.pegawai_id===user.id),
  });
  if (section==='masuk' || section==='pulang') {
    const current = db.attendance.find(row=>row.tanggal===today && row.pegawai_id===user.id);
    const key='jam_'+section;
    if (section==='masuk' && current?.[key]) fail('Presensi masuk sudah direkam.');
    if (section==='pulang' && !current?.jam_masuk) fail('Catat presensi masuk terlebih dahulu.');
    const name=db.geofence.location_name;
    return ok(edit(db.attendance,current?.id,{
      tanggal:today,pegawai_id:user.id,status:'Hadir',[key]:time(),['lokasi_'+section]:name,
      ['latitude_'+section]:fields.latitude,['longitude_'+section]:fields.longitude,
      ['lokasi_detail_'+section]:fields.lokasi_detail,
    }));
  }
  if (section==='persetujuan') {
    if (method!=='get') return existingRequest(id,action,fields.status,fields);
    const types=Object.keys(approvalTypes);
    const items=types.flatMap(pending);
    return ok({ items:query.type && query.type!=='all' ? items.filter(row=>row.type===query.type) : items,
      filters:{all:items.length,...Object.fromEntries(types.map(type=>[type,pending(type).length]))} });
  }
  if (section==='demo-dokumen') return documentFile(need(db[approvalTypes[id]],action),'Lampiran Kehadiran (Demo)');
  if (section==='rekap' || section==='self' || section==='laporan' || section==='laporan-lembur') {
    const history=checkins({bulan:month});
    if (id?.startsWith('export') || action?.startsWith('export')) {
      const type=section==='laporan-lembur';
      return exportFile(path,type ? forMonth(allRequests('lembur'),'tanggal',month) : history,'Laporan Kehadiran',reportColumns);
    }
    if (section==='rekap' || section==='self') {
      return ok({kehadiran:history.filter(row=>row.pegawai_id===user.id),cuti_izin:forMonth(allRequests('cuti-izin'),'tanggal_mulai',month),lembur:forMonth(allRequests('lembur'),'tanggal',month)});
    }
    if (action==='detail') return ok({
      pegawai:person(id), kehadiran:history.filter(row=>String(row.pegawai_id)===id),
      cuti_izin:forMonth(allRequests('cuti-izin').filter(row=>String(row.pegawai_id)===id),'tanggal_mulai',month),
      lembur:forMonth(allRequests('lembur').filter(row=>String(row.pegawai_id)===id),'tanggal',month),
    });
    return ok(monthReport(month,section==='laporan-lembur'));
  }
  if (section==='pengaturan') {
    if (id==='lokasi') {
      if (method!=='get') db.geofence={...db.geofence,...fields,enabled:YES(fields.enabled)};
      return ok(db.geofence);
    }
    if (id==='lembur') {
      if (method!=='get') db.overtimeSettings={...db.overtimeSettings,...fields};
      return ok(db.overtimeSettings);
    }
    const group={shift:'shifts','cuti-bersama':'collective','hari-libur':'holidays'}[id];
    if (group) {
      if (method==='get') return ok(db[group].filter(row=>!query.year || String(row.tanggal || row.mulai_berlaku).startsWith(query.year)));
      if (method==='delete') return remove(db[group],action);
      return ok(edit(db[group],action,fields));
    }
    if (id==='slip-gaji') {
      const data=(fields.slip_gaji || []).map(file=>{
        const employee=db.people.find(row=>file.name.toLowerCase().startsWith(row.nip.toLowerCase()));
        return {filename:file.name,nip:employee?.nip || '',pegawai:employee,valid:!!employee,
          status:employee ? 'valid' : 'invalid',message:employee ? 'NIP cocok dengan pegawai contoh.' : 'Gunakan nama file yang diawali NIP demo, misalnya DEMO-001.pdf.'};
      });
      if (action==='preview') return ok({rows:data});
      if (!data.length || data.some(row=>!row.valid)) fail('Semua slip perlu lolos pemeriksaan.');
      data.forEach((row,index)=>{
        const existing=db.slips.find(item=>item.nip===row.nip && item.periode_bulan===fields.periode_bulan);
        if (!existing || fields.aksi!=='simpan') edit(db.slips,existing?.id,{...row,periode_bulan:fields.periode_bulan,...attach({file:fields.slip_gaji[index]},'file')});
      });
      return ok(null);
    }
    if (method!=='get') db.settings={...db.settings,...fields};
    return ok({...db.settings,shifts:db.shifts,slip_gaji_count:db.slips.length});
  }
  if (approvalTypes[section]) {
    if (['approvers','kadiv'].includes(id)) return ok(approvers);
    const type=id==='koreksi' && section==='cuti-izin' ? 'koreksi-cuti' : id==='koreksi' && section==='lembur' ? 'koreksi-lembur' : section;
    if (method==='get') {
      const data=allRequests(type);
      if (type==='koreksi-cuti') return ok(data,{koreksi:data,cuti_izin:allRequests('cuti-izin'),cuti_approved:allRequests('cuti-izin').filter(row=>row.status==='approved')});
      if (type==='koreksi-lembur') return ok(data,{lembur_approved:allRequests('lembur').filter(row=>row.status==='approved')});
      return ok({data,approval_requests:pending(type),can_approve:true,settings:{jadwal_hari_ini:{lembur_mulai:db.settings.normal_lembur_hari_kerja_mulai}}},{
        balance:{
          hak_cuti_tahunan:Number(db.settings.hak_cuti_tahunan || 12),
          sisa_cuti:Math.max(0, Number(db.settings.hak_cuti_tahunan || 12) - db.leave.filter(row=>row.kategori==='Cuti' && row.status==='approved').reduce((sum,row)=>sum+Number(row.jumlah_hari||0),0)),
          cuti_rencana:pending('cuti-izin').filter(row=>row.kategori==='Cuti').reduce((sum,row)=>sum+Number(row.jumlah_hari||0),0),
          cuti_hangus:0,
        },jenis_options:leaveTypes,
      });
    }
    if (action==='approval') return existingRequest(type,id,fields.status,fields);
    const first=fields.tanggal_mulai || fields.tanggal;
    const end=fields.tanggal_selesai || first;
    if (first && end<first) fail('Tanggal selesai harus setelah tanggal mulai.');
    const total=(minutes(fields.jam_selesai)-minutes(fields.jam_mulai)) || 0;
    const adjusted={...withoutFiles(attach(fields,'dokumen')),pegawai_id:user.id,status:'pending',status_approval:'pending'};
    if (type==='cuti-izin') adjusted.jumlah_hari=Math.round((Date.parse(end)-Date.parse(first))/86400000)+1;
    if (type==='lembur') Object.assign(adjusted,{total_menit:total,total_jam:total/60});
    return ok(edit(db[approvalTypes[type]],null,adjusted));
  }
  fail('Rute kehadiran tidak tersedia.',404);
}
