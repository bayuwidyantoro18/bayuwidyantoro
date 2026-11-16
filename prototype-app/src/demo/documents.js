import { date, today, user, letterKinds } from './state.js';
import { db, edit, lookup, need, remove, ok, fail, filters, page, exportFile, documentFile, previewRows, attach, withoutFiles, YES } from './records.js';

const unitFor = id => lookup(db.units,id);
const folderFor = id => lookup(db.folders,id);
const fileHeaders = ['nama_dokumen','nomor_dokumen','kategori','tipe_arsip','tanggal_dokumen','tanggal_mulai','tanggal_berakhir','is_dokumen_aktif','nama_file','deskripsi'];
const archiveRow = row => {
  const days = row.tanggal_berakhir ? Math.round((Date.parse(row.tanggal_berakhir) - Date.parse(today)) / 86400000) : null;
  const status = days !== null && days < 0 ? 'Sudah Berakhir' : row.is_dokumen_aktif ? 'Aktif' : 'Tidak Aktif';
  return {
    ...row, unit: unitFor(row.arsip_unit_id), folder: folderFor(row.arsip_folder_id),
    sisa_hari: days, status_label: status, status_class: status === 'Aktif' ? 'bg-success' : 'bg-secondary',
  };
};
function archiveLog(action,row) {
  edit(db.logs,null,{aksi:action,nama_user:user.name,deskripsi:row.nama_dokumen || row.nama_folder,arsip_unit_id:row.arsip_unit_id});
}
const docSummary = (docs, folders) => ({
  total_dokumen:docs.length,total_folder:folders.length,total_berjangka:docs.filter(row=>row.tipe_arsip==='berjangka').length,
  total_tidak_berjangka:docs.filter(row=>row.tipe_arsip!=='berjangka').length,
  dokumen_berjangka_aktif:docs.filter(row=>row.tipe_arsip==='berjangka' && row.is_dokumen_aktif).length,
  dokumen_akan_berakhir:docs.filter(row=>row.sisa_hari!==null && row.sisa_hari>=0 && row.sisa_hari<=30).length,
  dokumen_sudah_berakhir:docs.filter(row=>row.sisa_hari!==null && row.sisa_hari<0).length,
});
function folderTrail(id, seen = new Set()) {
  const folder = folderFor(id);
  if (!folder || seen.has(folder.id)) return [];
  seen.add(folder.id);
  return [...folderTrail(folder.parent_id,seen),folder];
}
export async function archive(method,parts,fields,query,path) {
  const [, section, id, action] = parts;
  const documents = db.documents.map(archiveRow);
  const summary = docSummary(documents,db.folders);
  if (section === 'dashboard') return ok({
    summary, user_access: { is_superadmin:true, unit_kerja:user.unit_kerja, allowed_unit_ids:db.units.map(unit=>unit.id) },
    total_per_unit:db.units.map(unit=>({...unit,...docSummary(documents.filter(doc=>doc.unit?.id===unit.id),db.folders.filter(folder=>Number(folder.arsip_unit_id)===unit.id))})),
    akan_berakhir:documents.filter(row=>row.sisa_hari!==null && row.sisa_hari>=0 && row.sisa_hari<=30),
    sudah_berakhir:documents.filter(row=>row.sisa_hari!==null && row.sisa_hari<0),
  });
  if (section === 'riwayat' || section === 'laporan') {
    if (id === 'options') return ok({
      units:db.units, folders:db.folders, aksi:['create','update','delete','move'].map(value=>({value,label:value})),
      tipe_arsip:[{value:'berjangka',label:'Berjangka'},{value:'tidak_berjangka',label:'Tidak Berjangka'}],
      status_dokumen:[{value:'Aktif',label:'Aktif'},{value:'Tidak Aktif',label:'Tidak Aktif'},{value:'Sudah Berakhir',label:'Sudah Berakhir'}],
    });
    if (section === 'riwayat') {
      const result = page(filters(db.logs,query,'created_at',['arsip_unit_id','aksi']).map(log=>({...log,unit:unitFor(log.arsip_unit_id)})),query);
      return ok({ logs:result.data, pagination:result.pagination });
    }
    const rows = filters(documents,query,'tanggal_dokumen',['arsip_unit_id','arsip_folder_id','tipe_arsip'])
      .filter(doc=>!(query.status_dokumen || query.status_aktif) || String(doc.status_label).toLowerCase() === String(query.status_dokumen || query.status_aktif).toLowerCase());
    if (id?.startsWith('export')) return exportFile(path,rows,'Laporan Arsip Perusahaan',fileHeaders);
    const result = page(rows,query);
    return ok({ summary:docSummary(rows,db.folders), documents:result.data, pagination:result.pagination });
  }
  if (section === 'unit') {
    const unit = db.units.find(unit=>unit.slug===id);
    if (!unit) fail('Unit kerja demo tidak ditemukan.',404);
    const inUnit = db.folders.filter(folder=>Number(folder.arsip_unit_id)===unit.id);
    if (action === 'folder-tree') return ok({ folders:inUnit.map(folder=>({...folder, label:folderTrail(folder.id).map(item=>item.nama_folder).join(' / '), full_path:folderTrail(folder.id).map(item=>item.nama_folder).join(' / ')})) });
    const fid = Number(query.folder_id) || 0;
    const rows = filters(documents,query,'tanggal_dokumen',['tipe_arsip']).filter(row=>row.unit?.id===unit.id && (Number(row.arsip_folder_id)||0)===fid && (!query.status_aktif || row.is_dokumen_aktif===YES(query.status_aktif)));
    const result = page(rows,query);
    return ok({ unit,current_folder:folderFor(fid),breadcrumbs:folderTrail(fid),folders:inUnit.filter(folder=>(Number(folder.parent_id)||0)===fid),
      documents:result.data,pagination:result.pagination });
  }
  if (section === 'folders') {
    if (method === 'delete') {
      const folder = need(db.folders,id);
      if (db.documents.some(doc=>Number(doc.arsip_folder_id)===folder.id) || db.folders.some(item=>Number(item.parent_id)===folder.id)) fail('Folder masih berisi data demo.');
      archiveLog('delete',folder);
      return remove(db.folders,id);
    }
    const folder = edit(db.folders,id,fields);
    archiveLog(id?'update':'create',folder);
    return ok(folder);
  }
  if (section === 'documents') {
    if (id === 'bulk-template') return exportFile(path,[{ nama_dokumen:'Dokumen Contoh',nomor_dokumen:'ARS-DEMO-09',kategori:'Administrasi',tipe_arsip:'tidak_berjangka',tanggal_dokumen:today,is_dokumen_aktif:'1',nama_file:'contoh-dokumen.pdf' }],'Template Arsip',fileHeaders);
    if (id === 'bulk-preview') {
      const data = await previewRows(fields.excel_file,['nama_dokumen']);
      return ok({preview:data.map(item=>({...item,file_name:item.nama_file || item.file_name,matched_file:(fields.files || []).some(file=>file.name===(item.nama_file || item.file_name))}))});
    }
    if (id === 'bulk-store') {
      const rows = JSON.parse(fields.preview_data || '[]');
      for (const raw of rows.filter(item=>item.is_valid && item.nama_dokumen)) {
        const filename = raw.nama_file || raw.file_name;
        const file = (fields.files || []).find(file=>file.name===filename);
        const item = edit(db.documents,null,withoutFiles(attach({ ...raw, file, file_name:filename, arsip_unit_id:fields.arsip_unit_id,arsip_folder_id:fields.arsip_folder_id, is_dokumen_aktif:YES(raw.is_dokumen_aktif) },'file')));
        archiveLog('create',item);
      }
      return ok(null);
    }
    if (action === 'view' || action === 'download') return documentFile(need(db.documents,id),'Arsip Perusahaan (Demo)');
    if (action === 'move') {
      const row = need(db.documents,id);
      row.arsip_folder_id = fields.arsip_folder_id || fields.target_folder_id || fields.folder_id || null;
      if (fields.arsip_unit_id) row.arsip_unit_id = fields.arsip_unit_id;
      archiveLog('move',row);
      return ok(archiveRow(row));
    }
    if (method === 'delete') {
      archiveLog('delete',need(db.documents,id));
      return remove(db.documents,id);
    }
    const row = edit(db.documents,id,{...withoutFiles(attach(fields,'file')),is_dokumen_aktif:YES(fields.is_dokumen_aktif)});
    archiveLog(id?'update':'create',row);
    return ok(archiveRow(row));
  }
  fail('Rute arsip tidak tersedia.',404);
}

const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const letterCols = ['nomor_surat','jenis_surat','tanggal_surat','perihal','tujuan','keterangan','status'];
const importLetters = ['jenis_surat','tanggal_surat','perihal','tujuan','keterangan'];
const numberFor = (kind, chosenDate, id) => {
  const [year, month] = chosenDate.split('-');
  const suffix = [roman[Number(month)-1],year].join('/');
  const sequence = String(id).padStart(4,'0');
  return kind.value === 'pkwt' ? `${sequence}/DEMO/PKWT/${suffix}` : `DEMO/${kind.code}.${sequence}/${suffix}`;
};
function writeLetter(fields) {
  const type = letterKinds.find(item=>item.value===fields.jenis_surat);
  if (!type || !/^\d{4}-\d\d-\d\d$/.test(fields.tanggal_surat || '')) fail('Pilih jenis dan tanggal surat yang valid.');
  const row = edit(db.outgoing,null,{status:'Aktif',...fields,tanggal_ambil:today,diambil_oleh:user.name,label_jenis_surat:type.label});
  row.nomor_surat = numberFor(type,row.tanggal_surat,row.id);
  return row;
}
const showIncoming = row => ({
  ...row, is_rahasia:YES(row.is_rahasia), scan_dokumen_url:row.scan_dokumen ? `/nomor-surat/surat-masuk/${row.id}/file` : null,
  disposisis:row.disposisi.map(disposition=>({
    ...disposition, perlu_balasan:YES(disposition.perlu_balasan), perlu_disposisi:YES(disposition.perlu_disposisi),
    dokumen_balasan_url:disposition.dokumen_balasan ? 'demo-attachment' : null,
  })),
});
const targets = ['Direksi','Kadiv SDM & Operasional','Kadiv Finance & Accounting','Staff SDM & Operasional','All'];
export async function letters(method,parts,fields,query,path) {
  const [,section,id,action,dispositionId,reply] = parts;
  if (section === 'surat-masuk') {
    if (id === 'targets') return ok(targets);
    if (id) {
      const row = need(db.incoming,id);
      if (action === 'file') return documentFile(row,'Surat Masuk (Demo)');
      if (action === 'disposisi' && dispositionId && reply === 'balasan') return documentFile({ file:need(row.disposisi,dispositionId).dokumen_balasan },'Balasan Surat (Demo)');
      if (action === 'disposisi') {
        const data = withoutFiles(attach(fields,'dokumen_balasan'));
        const item = edit(row.disposisi,null,data);
        row.disposisis = row.disposisi;
        row.status_disposisi = !YES(fields.perlu_disposisi) ? 'Tidak Perlu Disposisi' : YES(fields.perlu_balasan) && !fields.dokumen_balasan ? 'Proses Disposisi' : 'Selesai';
        return ok(item);
      }
      if (method === 'get') return ok(showIncoming(row));
      if (method === 'delete') return remove(db.incoming,id);
      return ok(edit(db.incoming,id,withoutFiles(attach(fields,'scan_dokumen'))));
    }
    if (method === 'get') return page(filters(db.incoming,query,'tanggal_terima',['status_disposisi']).map(showIncoming),query);
    return ok(edit(db.incoming,null,{status_disposisi:'Belum Diproses',disposisi:[],disposisis:[],...withoutFiles(attach(fields,'scan_dokumen'))}));
  }
  if (section === 'jenis') return ok(letterKinds.map(item=>({...item,contoh_format:numberFor(item,today,1)})));
  if (section === 'template') return exportFile(path,[{jenis_surat:'bast',tanggal_surat:today,perihal:'Serah terima contoh',tujuan:'Operasional'}],'Template Nomor Surat',importLetters);
  if (section === 'import') {
    if (id === 'preview') {
      const rows = await previewRows(fields.file_excel,['jenis_surat','tanggal_surat','perihal'], row=>({
        ...row, jenis_surat: String(row.jenis_surat || '').toLowerCase().replaceAll(' ','_'),tanggal_surat_normalized:row.tanggal_surat,
      }));
      const checked = rows.map(row=>{
        const errors = [...row.errors];
        if (!letterKinds.some(item=>item.value===row.jenis_surat)) errors.push('Jenis surat tidak terdaftar.');
        if (!/^\d{4}-\d\d-\d\d$/.test(row.tanggal_surat)) errors.push('Tanggal surat harus berformat YYYY-MM-DD.');
        return {...row,errors,is_valid:!errors.length};
      });
      const valid = checked.filter(row=>row.is_valid).length;
      return ok(checked,{summary:{total:checked.length,valid,invalid:checked.length-valid}});
    }
    if (id === 'store') {
      for (const row of (fields.data || []).filter(row=>row.is_valid)) writeLetter(row);
      return ok(null);
    }
  }
  if (section === 'dashboard') {
    const rows = db.outgoing;
    return ok(null,{ summary:{
      nomor_aktif:rows.filter(row=>row.status==='Aktif').length,
      nomor_tidak_aktif:rows.filter(row=>row.status!=='Aktif').length,
      total_bulan_ini:rows.filter(row=>row.tanggal_surat?.startsWith(today.slice(0,7))).length,
      total_tahun_ini:rows.filter(row=>row.tanggal_surat?.startsWith(today.slice(0,4))).length,
    }, top_proses:letterKinds.map(kind=>({nama_proses:kind.label,total:rows.filter(row=>row.jenis_surat===kind.value).length})).filter(item=>item.total), recent:rows.slice(0,10) });
  }
  if (method === 'get') {
    const rows = filters(db.outgoing,query,'tanggal_surat',['jenis_surat','status']);
    if (id?.startsWith('export')) return exportFile(path,rows,'Laporan Nomor Surat',letterCols);
    return page(rows,query);
  }
  if (method === 'delete') return ok(edit(db.outgoing,section,{status:'Tidak Aktif',alasan:fields.alasan}));
  if (section) return ok(edit(db.outgoing,section,fields));
  return ok(writeLetter(fields));
}
