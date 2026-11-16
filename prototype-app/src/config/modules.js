export const appModules = [
  {
    name: 'Kepegawaian',
    code: 'pkwt',
    description: 'Pengelolaan data pegawai, PKWT, approval perpanjangan kontrak, laporan, import dan export data.',
    icon: 'fas fa-file-signature',
    route: '/pkwt/dashboard',
    color: 'primary',
    status: 'Aktif'
  },
  {
    name: 'Manajemen Kehadiran',
    code: 'kehadiran',
    description: 'Pengelolaan data kehadiran pegawai, pengajuan cuti, lembur, dan laporan kehadiran.',
    icon: 'fas fa-clock',
    route: '/kehadiran/dashboard',
    color: 'info',
    status: 'Aktif'
  },
  {
    name: 'Agenda Harian',
    code: 'agenda',
    description: 'Pencatatan agenda harian pegawai, driver, pramubakti, dan monitoring aktivitas harian.',
    icon: 'fas fa-calendar-check',
    route: '/agenda',
    color: 'success',
    status: 'Aktif'
  },
  {
    name: 'Reservasi Driver',
    code: 'reservasi-driver',
    description: 'Reservasi kendaraan operasional, approval driver, monitoring perjalanan dan laporan perjalanan driver.',
    icon: 'fas fa-car',
    route: '/reservasi-driver/dashboard',
    color: 'warning',
    status: 'Aktif'
  },
  {
    name: 'Arsip Perusahaan',
    code: 'arsip',
    description: 'Pengelolaan arsip dokumen perusahaan berdasarkan divisi, kategori, tahun dokumen, dan pencarian arsip.',
    icon: 'fas fa-box-archive',
    route: '/arsip/dashboard',
    color: 'secondary',
    status: 'Aktif'
  },
  {
    name: 'Nomor Surat',
    code: 'nomor-surat',
    description: 'Pengambilan nomor surat, riwayat nomor surat, dashboard, dan laporan nomor surat.',
    icon: 'fas fa-hashtag',
    route: '/nomor-surat/dashboard',
    color: 'info',
    status: 'Aktif'
  },
  {
    name: 'Pengaturan',
    code: 'pengaturan',
    description: 'Pengaturan akun, user, akses, data master, kendaraan, dan sistem aplikasi.',
    icon: 'fas fa-cog',
    route: '/pengaturan',
    color: 'secondary',
    status: 'Aktif'
  }
]