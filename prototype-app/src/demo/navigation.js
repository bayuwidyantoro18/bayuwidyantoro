const actions = ['view', 'create', 'update', 'delete', 'approve', 'reject', 'import', 'export', 'upload', 'download', 'print', 'process', 'cancel', 'manage'];
const permissions = Object.fromEntries(actions.map(action => ['can_' + action, true]));

const labels = {
  dashboard: ['Dashboard', 'chart-pie'], database_pegawai: ['Database Pegawai', 'users'],
  data_pkwt: ['Data PKWT', 'file-contract'], approval_pkwt: ['Approval PKWT', 'file-circle-check'],
  terminasi: ['Terminasi', 'user-slash'], laporan_pkwt: ['Laporan', 'chart-bar'],
  perjalanan: ['Perjalanan', 'route'], laporan: ['Laporan', 'chart-bar'],
  monitoring_lokasi: ['Monitoring Lokasi', 'map-location-dot'], riwayat_perjalanan: ['Riwayat Perjalanan', 'history'],
  kalender_agenda: ['Kalender Agenda', 'calendar-days'], rekap_kinerja: ['Rekap Kinerja', 'chart-line'],
  reservasi: ['Reservasi', 'car'], approval: ['Approval', 'circle-check'], riwayat: ['Riwayat', 'history'],
  surat_masuk: ['Surat Masuk', 'inbox'], surat_keluar: ['Surat Keluar', 'paper-plane'],
}

export let navigation = [];
export function registerNavigation(system, routes) {
  const mapped = routes.filter(route => route.meta?.menuKey).map(({path, meta}) => {
    const [label, icon] = labels[meta.menuKey] || [meta.title, 'circle-dot'];
    return {
      module: meta.module, menu_key: meta.menuKey, menu_name: label || meta.menuKey,
      route: '/' + path, icon: 'fas fa-' + icon, permissions,
    };
  });
  let menus = mapped.filter(menu => !menu.route.includes(':') && !menu.route.startsWith('/kehadiran/pengaturan/'));
  if (system.module === 'arsip') {
    const unitItems = [['human-capital', 'Human Capital'], ['operasional', 'Operasional'], ['keuangan', 'Keuangan']];
    menus.splice(1, 0, {
      menu_key: 'arsip_unit', menu_name: 'Unit Kerja', route: '#', icon: 'fas fa-folder', permissions,
      children: unitItems.map(([slug, name]) => ({
        menu_key: slug, menu_name: name, route: '/arsip/unit/' + slug, icon: 'fas fa-folder-open', permissions,
      })),
    });
  }
  if (system.module === 'kehadiran') {
    menus.push({ menu_key: 'pengaturan', menu_name: 'Pengaturan', route: '/kehadiran/pengaturan', icon: 'fas fa-cog', permissions });
  }
  navigation = [{ module_key: system.module, module_name: system.label, menus }];
  for (const key of new Set(mapped.map(menu => menu.module))) {
    if (key !== system.module) navigation.push({
      module_key: key, module_name: system.label, menus: mapped.filter(menu => menu.module === key),
    });
  }
}
