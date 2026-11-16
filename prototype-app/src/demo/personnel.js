import { date, today } from './state.js';
import { db, edit, need, lookup, remove, ok, fail, exportFile, documentFile, previewRows, filters, attach, withoutFiles } from './records.js';

const employeeKeys = ['nip', 'nama', 'unit_kerja', 'jabatan', 'kategori_pegawai', 'status', 'tanggal_masuk'];
const importKeys = [...employeeKeys, 'nomor_kontrak', 'tanggal_mulai', 'tanggal_berakhir'];
export const contractView = row => ({
  ...row,
  pegawai: lookup(db.people,row.pegawai_id) || {},
  file_url: row.file_pkwt && `/demo-pkwt-file/${row.id}`,
});
const previewEmployee = file => previewRows(file, ['nip','nama'], row => ({ ...row, nama: row.nama || row.nama_pegawai }));
const activeContracts = () => db.contracts.filter(row => row.tanggal_berakhir >= today);
const approvalView = item => ({ ...item, pegawai: lookup(db.people,item.pegawai_id), pkwt: lookup(db.contracts,item.pkwt_id) });
const isActive = row => row.status === 'Aktif';

export async function personnel(method, parts, fields, query, path) {
  const [name, id, action] = parts;
  if (name === 'dashboard') {
    const current = activeContracts(), expiring = current.filter(row => row.tanggal_berakhir <= date(30));
    return ok({
      jumlah_pegawai_aktif: db.people.filter(isActive).length, jumlah_terminasi: db.people.filter(row => !isActive(row)).length,
      pegawai_internal_aktif: db.people.filter(row => isActive(row) && row.kategori_pegawai === 'Pegawai Internal').length,
      pegawai_penugasan_aktif: db.people.filter(row => isActive(row) && row.kategori_pegawai === 'Pegawai Penugasan').length,
      terminasi_internal: db.people.filter(row => !isActive(row) && row.kategori_pegawai === 'Pegawai Internal').length,
      terminasi_penugasan: db.people.filter(row => !isActive(row) && row.kategori_pegawai === 'Pegawai Penugasan').length,
      kontrak_aktif: current.length, akan_berakhir: expiring.length, sudah_berakhir: db.contracts.length - current.length,
      status_kontrak: db.approvals.filter(row => row.status_proses === 'penerbitan_pkwt').length,
      pending_approval: db.approvals.filter(row => row.status_proses === 'pending').length,
      data_kontrak_akan_berakhir: expiring.map(contractView).map(row => ({
        ...row.pegawai, ...row, pkwt_id: row.id,
        approval: db.approvals.find(approval => approval.pkwt_id === row.id),
        sisa_hari: Math.ceil((Date.parse(row.tanggal_berakhir) - Date.parse(today)) / 86400000),
      })),
    });
  }
  if (name === 'pegawai') {
    if (id === 'export-excel') return exportFile(path, filters(db.people,query,undefined,['status','unit_kerja','kategori_pegawai']), 'Data Pegawai', employeeKeys);
    if (action === 'riwayat-pkwt') return db.contracts.filter(row => Number(row.pegawai_id) === Number(id)).map(contractView);
    if (method === 'get') return ok(filters(db.people,query,undefined,['status','unit_kerja','kategori_pegawai']));
    if (method === 'delete') return remove(db.people,id);
    if (!fields.nip?.trim() || !fields.nama?.trim()) fail('NIP dan nama pegawai wajib diisi.');
    if (db.people.some(row => Number(row.id) !== Number(id) && fields.nip && row.nip === fields.nip)) fail('NIP sudah digunakan dalam data demo.');
    return ok(edit(db.people,id,fields));
  }
  if (name === 'pkwt') {
    if (id === 'import') {
      if (action === 'template') return exportFile(path,[{ nip: 'DEMO-099', nama: 'Nama Contoh', unit_kerja: 'Human Capital', jabatan: 'Staf', kategori_pegawai: 'Pegawai Internal', status: 'Aktif', tanggal_masuk: today, nomor_kontrak: 'PKWT/DEMO/099', tanggal_mulai: today, tanggal_berakhir: date(120) }], 'Template PKWT', importKeys);
      if (action === 'preview') return ok(await previewEmployee(fields.file_excel));
      if (action === 'store') {
        for (const row of (fields.data || []).filter(row => row.is_valid && row.nip)) {
          const found = db.people.find(person => person.nip === row.nip);
          const data = Object.fromEntries(employeeKeys.filter(key => row[key] !== undefined).map(key => [key,row[key]]));
          const person = edit(db.people, found?.id, { status: 'Aktif', kategori_pegawai: 'Pegawai Internal', ...data });
          if (row.nomor_kontrak && row.tanggal_mulai && row.tanggal_berakhir) {
            const contract = db.contracts.find(item => item.nomor_kontrak === row.nomor_kontrak);
            edit(db.contracts, contract?.id, { pegawai_id: person.id, nomor_kontrak: row.nomor_kontrak, tanggal_mulai: row.tanggal_mulai, tanggal_berakhir: row.tanggal_berakhir, status: 'Aktif' });
          }
        }
        return ok(null);
      }
    }
    if (method === 'get') return ok(db.contracts.map(contractView));
    if (method === 'delete') return remove(db.contracts,id);
    if (fields.tanggal_mulai && fields.tanggal_berakhir < fields.tanggal_mulai) fail('Tanggal berakhir harus sesudah tanggal mulai.');
    return ok(edit(db.contracts,id,withoutFiles(attach(fields,'file_pkwt'))));
  }
  if (name === 'approval-pkwt') {
    if (method === 'get') return ok(db.approvals.map(approvalView));
    if (action === 'ajukan') {
      const contract = lookup(db.contracts,id) || db.contracts.find(row => Number(row.pegawai_id) === Number(id));
      if (!contract) fail('Kontrak demo tidak ditemukan.',404);
      const existing = db.approvals.find(item => item.pkwt_id === contract.id && !['tidak_diperpanjang','selesai'].includes(item.status_proses));
      if (existing) fail('Kontrak sudah diajukan.');
      return ok(edit(db.approvals,null,{ pegawai_id: contract.pegawai_id, pkwt_id: contract.id, status_proses: 'pending' }));
    }
    const approval = need(db.approvals,id);
    const statuses = { setujui: 'perpanjang_kontrak', tolak: 'tidak_diperpanjang', 'proses-pkwt': 'penerbitan_pkwt', 'upload-pkwt': 'selesai' };
    const status = statuses[action];
    if (!status) fail('Aksi PKWT tidak tersedia.',404);
    Object.assign(approval,withoutFiles(attach(fields,'file_pkwt')),{status_proses: status});
    if (status === 'selesai') {
      const previous = need(db.contracts,approval.pkwt_id);
      const first = new Date(previous.tanggal_berakhir+'T00:00:00Z');
      first.setUTCDate(first.getUTCDate()+1);
      const end = new Date(first);
      end.setUTCMonth(end.getUTCMonth() + Number(approval.durasi_bulan || 12));
      end.setUTCDate(end.getUTCDate()-1);
      previous.status = 'Diperpanjang';
      edit(db.contracts,null,{ pegawai_id: previous.pegawai_id, nomor_kontrak: fields.nomor_kontrak, tanggal_mulai: first.toISOString().slice(0,10), tanggal_berakhir: end.toISOString().slice(0,10), status: 'Aktif', file_pkwt: fields.file_pkwt });
    }
    return ok(approvalView(approval));
  }
  if (name === 'laporan' && id === 'pkwt') {
    const rows = filters(db.contracts.map(contractView).map(row => ({ ...row.pegawai, ...row, nama_pegawai: row.pegawai.nama })),query,'tanggal_berakhir',['pegawai_id','unit_kerja','status']);
    if (action) return exportFile(path,rows,'Laporan PKWT', ['nip','nama_pegawai','unit_kerja','nomor_kontrak','tanggal_mulai','tanggal_berakhir','status']);
    return ok(rows,{ summary: { total: rows.length, aktif: rows.filter(isActive).length, diperpanjang: rows.filter(row => row.status === 'Diperpanjang').length, berakhir: rows.filter(row => row.tanggal_berakhir < today).length } });
  }
  if (name === 'demo-pkwt-file') return documentFile(need(db.contracts,id),'Perjanjian Kerja (Demo)');
  fail('Rute kepegawaian tidak tersedia.',404);
}
