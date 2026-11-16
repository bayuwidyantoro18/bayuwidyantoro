export function date(offset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(n => String(n).padStart(2, '0')).join('-');
}
export const today = date();
export const time = () => new Date().toLocaleTimeString('en-GB');
export const location = { latitude: -6.2255, longitude: 106.8072, accuracy: 12 };
export const address = { office: 'Kantor Demo', road: 'Jalan Contoh', city: 'Jakarta' };
export const user = { id: 1, name: 'Alya Putri (Demo)', username: 'alya-demo', role: 'superadmin', unit_kerja: 'Human Capital' };
const employee = (id, nama, unit_kerja, jabatan, status = 'Aktif') => ({
  id, nip: 'DEMO-' + String(id).padStart(3, '0'), nama, unit_kerja, jabatan, status,
  kategori_pegawai: id === 4 ? 'Pegawai Penugasan' : 'Pegawai Internal', jenis_kelamin: 'P',
  tanggal_masuk: date(-420), tanggal_keluar: status === 'Aktif' ? null : date(-15), tanggal_terminasi: status === 'Aktif' ? null : date(-15), alasan_terminasi: status === 'Aktif' ? null : 'Kontrak Selesai',
});
const people = [
  employee(1, 'Alya Putri', 'Human Capital', 'Staf Human Capital'),
  employee(2, 'Raka Pratama', 'Operasional', 'Staf Operasional'),
  employee(3, 'Nadia Safitri', 'Keuangan', 'Kepala Divisi'),
  employee(4, 'Dimas Arya', 'Operasional', 'Petugas Lapangan', 'Non Aktif'),
];
const contract = (id, pegawai_id, offset, status) => ({
  id, pegawai_id, nomor_kontrak: `PKWT/DEMO/00${id}`, tanggal_mulai: date(offset - 365), tanggal_berakhir: date(offset), status,
  file_pkwt: 'pkwt-demo.pdf', file_url: '/prototipe/contoh-dokumen.pdf',
});
const units = [
  { id: 1, nama_unit: 'Human Capital', slug: 'human-capital' },
  { id: 2, nama_unit: 'Operasional', slug: 'operasional' },
  { id: 3, nama_unit: 'Keuangan', slug: 'keuangan' },
];
export const drivers = [
  { id: 1, nama_driver: 'Ardi Demo', nama: 'Ardi Demo', name: 'Ardi Demo', status_driver: 'standby' },
  { id: 2, nama_driver: 'Bima Demo', nama: 'Bima Demo', name: 'Bima Demo', status_driver: 'standby' },
];
export const vehicles = [
  { id: 1, nama_kendaraan: 'MPV Demo 01', merk: 'MPV', nomor_polisi: 'DEMO 01', status: 'tersedia', status_kendaraan: 'tersedia' },
  { id: 2, nama_kendaraan: 'Sedan Demo 02', merk: 'Sedan', nomor_polisi: 'DEMO 02', status: 'tersedia', status_kendaraan: 'tersedia' },
];
const agenda = (id, tujuan, status, offset = 0) => ({
  id, user_id: 1, user, nama: user.name, tanggal: date(offset), tujuan, keperluan: 'Koordinasi operasional', status, status_perjalanan: status,
  started_at: status !== 'antrian' ? date(offset) + 'T08:30:00' : null,
  arrived_at: ['sampai_tujuan', 'selesai'].includes(status) ? date(offset) + 'T09:00:00' : null,
  finished_at: status === 'selesai' ? date(offset) + 'T10:00:00' : null,
  last_latitude: location.latitude, last_longitude: location.longitude, lokasi_terkini: 'Kantor Demo',
  ...(status === 'antrian' ? {} : { mulai_latitude: location.latitude, mulai_longitude: location.longitude }),
});
const booking = (id, tujuan_awal, status_reservasi, offset = 0) => ({
  id, kode_reservasi: `RSV-DEMO-00${id}`, nama_pemohon: user.name, user_id: 1, pemohon: user, unit_kerja: user.unit_kerja,
  tanggal_reservasi: date(offset), jam_mulai: '09:00', jam_selesai_estimasi: '11:30', lokasi_jemput: 'Kantor Demo',
  tujuan_awal, keperluan: 'Kunjungan operasional', status_reservasi, status_perjalanan: status_reservasi === 'completed' ? 'selesai' : 'belum_mulai', driver_id: 1, kendaraan_id: 1, tujuans: [],
});
const fileRecord = { file_name: 'contoh-dokumen.pdf', file_original_name: 'contoh-dokumen.pdf', file_size: 980, file_path: 'contoh-dokumen.pdf' };
export const letterKinds = [
  ['surat_keluar', 'Surat Keluar', 'SK'], ['bast', 'BAST', 'BAST'], ['memo', 'Memo', 'MEMO'],
  ['pks', 'PKS', 'PKS'], ['po', 'PO', 'PO'], ['spk', 'SPK', 'SPK'], ['skk', 'SKK', 'SKK'],
  ['spbk', 'SPBK', 'SPBK'], ['skpd', 'SKPD', 'SKPD'], ['surat_jalan', 'Surat Jalan', 'SJ'], ['pkwt', 'PKWT', 'PKWT'],
].map(([value, label, code]) => ({value, label, code}));
const letter = (id, jenis_surat, perihal, offset, status = 'Aktif') => ({
  id, jenis_surat, label_jenis_surat: letterKinds.find(item => item.value === jenis_surat)?.label,
  tanggal_surat: date(offset), tanggal_ambil: date(), nomor_surat: `00${id}/DEMO/${today.slice(0, 4)}`,
  perihal, nama_proses: perihal, tujuan: 'Unit Operasional', diambil_oleh: user.name, status,
});
const entry = (id, pegawai_id, overrides) => ({
  id, pegawai_id, pegawai: people.find(p => p.id === pegawai_id), nama: people.find(p => p.id === pegawai_id)?.nama, tanggal: today,
  status: 'pending', status_approval: 'pending', keterangan: 'Contoh pengajuan', alasan: 'Keperluan contoh', ...overrides,
});
const attendance = (id, pegawai_id, offset) => entry(id, pegawai_id, {
  tanggal: date(offset), jam_masuk: '08:00:00', jam_pulang: '17:00:00', status: 'Hadir', lokasi_masuk: 'Kantor Demo', lokasi_pulang: 'Kantor Demo',
});
const initial = {
  people, contracts: [contract(1, 1, 14, 'Aktif'), contract(2, 2, 9, 'Aktif'), contract(3, 3, -3, 'Berakhir')],
  approvals: [{ id: 1, pegawai_id: 2, pkwt_id: 2, status_proses: 'pending', durasi_bulan: 12 }],
  agenda: [agenda(1, 'Kantor Cabang Contoh', 'antrian'), agenda(2, 'Gudang Operasional', 'dalam_perjalanan'), agenda(3, 'Mitra Pelatihan', 'selesai', -2), agenda(4, 'Rapat Tim', 'sampai_tujuan')],
  bookings: [booking(1, 'Kantor Cabang Bekasi', 'pending', 1), booking(2, 'Pusat Pelatihan', 'approved'), booking(3, 'Gudang Operasional', 'completed', -2)],
  units, folders: [{ id: 1, nama_folder: 'Kebijakan', arsip_unit_id: 1, parent_id: null }, { id: 2, nama_folder: 'Laporan', arsip_unit_id: 2, parent_id: null }],
  documents: [
    { id: 1, nama_dokumen: 'SOP Orientasi Pegawai', nomor_dokumen: 'ARS-DEMO-01', arsip_unit_id: 1, arsip_folder_id: null, kategori: 'Kebijakan', tipe_arsip: 'tidak_berjangka', tanggal_dokumen: date(-5), is_dokumen_aktif: true, ...fileRecord },
    { id: 2, nama_dokumen: 'Perjanjian Layanan Demo', nomor_dokumen: 'ARS-DEMO-02', arsip_unit_id: 2, arsip_folder_id: null, kategori: 'Kontrak', tipe_arsip: 'berjangka', tanggal_dokumen: date(-75), tanggal_mulai: date(-75), tanggal_berakhir: date(7), is_dokumen_aktif: true, ...fileRecord },
    { id: 3, nama_dokumen: 'Laporan Administrasi', nomor_dokumen: 'ARS-DEMO-03', arsip_unit_id: 3, arsip_folder_id: null, kategori: 'Laporan', tipe_arsip: 'tidak_berjangka', tanggal_dokumen: date(-25), is_dokumen_aktif: true, ...fileRecord },
  ],
  logs: [{ id: 1, aksi: 'create', nama_user: user.name, deskripsi: 'Menambahkan SOP Orientasi Pegawai', arsip_unit_id: 1, created_at: today + 'T08:00:00' }],
  outgoing: [letter(1, 'bast', 'Serah terima inventaris', -2), letter(2, 'memo', 'Jadwal koordinasi tim', -1), letter(3, 'surat_keluar', 'Permintaan dokumen contoh', 0, 'Tidak Aktif')],
  incoming: [{ id: 1, nomor_surat_masuk: 'MITRA/DEMO/001', tanggal_terima: today, tanggal_dokumen: date(-2), perihal: 'Undangan koordinasi', tujuan_surat: 'All', pic_penerima: user.name, pic_pengirim: 'Mitra Demo', is_rahasia: false, status_disposisi: 'Belum Diproses', disposisi: [], disposisis: [], scan_dokumen: fileRecord.file_name }],
  attendance: [attendance(1, 1, -2), attendance(2, 2, 0)],
  leave: [entry(1, 1, { kategori: 'Cuti', jenis: 'Cuti Tahunan', jumlah_hari: 1, tanggal_mulai: date(2), tanggal_selesai: date(2) })],
  overtime: [entry(1, 1, { jam_mulai: '17:30', jam_selesai: '19:30', total_jam: 2, total_menit: 120 }), entry(2, 1, { tanggal: date(-2), jam_mulai: '17:30', jam_selesai: '19:30', total_jam: 2, total_menit: 120, status: 'approved', status_approval: 'approved' })],
  corrections: [entry(1, 1, { jenis_koreksi: 'pulang', jam_koreksi: '17:15' })],
  leaveCorrections: [], overtimeCorrections: [], shifts: [], holidays: [], collective: [], slips: [],
  settings: { normal_jam_masuk: '08:00', normal_jam_pulang: '17:00', normal_lembur_hari_kerja_mulai: '17:30', normal_lembur_hari_libur_mulai: '08:00', hak_cuti_tahunan: 12 },
  overtimeSettings: { min_jam: 1, max_jam: 6 },
  geofence: { enabled: true, location_name: 'Kantor Demo', latitude: location.latitude, longitude: location.longitude, radius_meter: 100, max_accuracy_meter: 50 },
};
const storageKey = 'bayu:demo-vue:1:' + document.body.dataset.demo;
function loadState() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || structuredClone(initial); }
  catch { return structuredClone(initial); }
}
export const db = loadState();
export function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(db)); }
  catch { /* The same session can still use its in-memory changes. */ }
}
export const now = () => new Date().toISOString();
export function add(list, fields) {
  const id = Math.max(0, ...list.map(row => Number(row.id))) + 1;
  const row = { ...fields, id, created_at: fields.created_at || now() };
  list.unshift(row);
  return row;
}
