(function () {
  'use strict';

  const modules = window.demoModules;
  const slug = document.body.dataset.module;
  const config = modules[slug];
  const app = document.getElementById('app');
  const prefix = 'bw-portfolio-demo-v1:';
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4m-3-12a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-12 5 2 2 4-4"/>',
    car: '<path d="m5 9 2-5h10l2 5M3 18v2m18-2v2M2 13a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5H2zm4 1h2m8 0h2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M10 3h4l.6 2.4 2 .9 2.2-1.1 2 3.5-1.7 1.7v2.4l1.7 1.7-2 3.5-2.2-1.1-2 .9L14 21h-4l-.6-2.4-2-.9-2.2 1.1-2-3.5 1.7-1.7v-2.4L3.2 9.5l2-3.5 2.2 1.1 2-.9L10 3Z"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    reset: '<path d="M3 11a9 9 0 1 1 2 7m-2-7V5m0 6h6"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    activity: '<path d="M3 12h4l3-6 4 12 3-6h4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  function icon(name, size = 20) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  }

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, char =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function read(key, fallback) {
    try {
      const stored = localStorage.getItem(prefix + key);
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return structuredClone(fallback);
  }

  function save(key, data) {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(data));
    } catch {
      notify('Penyimpanan browser tidak tersedia. Perubahan berlaku selama halaman terbuka.');
      return false;
    }
    return true;
  }

  const seedAnnouncements = [
    { id: 'ANN-001', title: 'Pembaruan panduan layanan internal', date: '2026-11-16', note: 'Panduan contoh mencakup pengajuan cuti, reservasi kendaraan, dan pengarsipan dokumen.', published: true },
    { id: 'ANN-002', title: 'Jadwal pengecekan inventaris', date: '2026-11-13', note: 'Unit operasional akan melakukan pengecekan inventaris pada pekan ini.', published: true },
  ];
  const roleNames = ['Admin', 'Supervisor', 'Pegawai'];
  const permissionNames = ['Lihat', 'Tambah', 'Ubah', 'Setujui'];
  const permissionModules = Object.entries(modules).filter(([, data]) => data.rows && data.name !== 'Pengaturan');
  const seedPermissions = Object.fromEntries(roleNames.map(role => [role, Object.fromEntries(
    permissionModules.map(([key]) => [key, role === 'Admin' ? permissionNames : role === 'Supervisor' ? ['Lihat', 'Setujui'] : ['Lihat']])
  )]));
  const seedProfile = { name: 'Alya Putri', email: 'alya@example.invalid', phone: '0800 0000 0000' };
  const documents = {
    pkwt: { title: 'PKWT tahun 2026', type: 'Perjanjian kerja', date: '2026-01-02', body: 'Contoh ringkasan PKWT\nPegawai: Alya Putri (fiktif)\nUnit: Human Capital\nPeriode: Januari–Desember 2026' },
    slip: { title: 'Slip gaji Oktober 2026', type: 'Slip gaji', date: '2026-10-31', body: 'Contoh ringkasan slip gaji\nPegawai: Alya Putri (fiktif)\nPeriode: Oktober 2026\nNilai contoh: Rp5.000.000' },
  };
  let rows = read(slug, config.rows || []);
  let announcements = read('announcements', seedAnnouncements);
  let permissions = read('permissions', seedPermissions);
  let profile = read('profile', seedProfile);
  let tab = 0;
  let role = roleNames[0];
  let selectedStatus = '';
  let query = '';
  let currentDialog;
  let toastTimer;

  function today() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  const localDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const localTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatDate = date => date ? localDate.format(new Date(date + 'T00:00:00Z')) : '—';
  const status = key => config.statuses.find(state => state.key === key);
  const pill = state => `<span class="pill tone-${state.tone}"><i></i>${esc(state.label)}</span>`;
  const button = (label, action, type = '', symbol = '') =>
    `<button class="button ${type}" type="button" data-action="${action}">${symbol ? icon(symbol, 17) : ''}${esc(label)}</button>`;

  function header() {
    const links = Object.entries(modules).map(([key, data]) => `
      <a href="/prototipe/${key}/" ${key === slug ? 'aria-current="page"' : ''}>
        ${icon(data.icon, 19)}<span>${esc(data.name)}</span>${key === slug ? '<i></i>' : ''}
      </a>`).join('');
    return `<div class="shell">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="/prototipe/portal/"><span class="brand-logo">m<span>IS</span></span><span><strong>mPro Internal System</strong><small>Demo portofolio</small></span></a>
        <nav aria-label="Navigasi prototipe">${links}</nav>
        <div class="sidebar-footer">
          <a href="/#portfolio">${icon('back', 17)} Kembali ke portofolio</a>
          ${button('Setel ulang demo', 'reset', 'reset-link', 'reset')}
        </div>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <div class="trail">
            <button type="button" class="icon-button nav-toggle" data-action="menu" aria-controls="sidebar" aria-expanded="false" aria-label="Buka navigasi">${icon('menu')}</button>
            <a href="/prototipe/portal/">Prototipe</a><span aria-hidden="true">/</span><strong>${esc(config.name)}</strong>
          </div>
          <div class="top-end"><span class="demo-badge"><i></i> Data simulasi</span><a href="/prototipe/profil-saya/" class="avatar" aria-label="Profil Saya">${icon('profile', 17)}</a></div>
        </header>
        <main id="content" tabindex="-1">
          <div class="intro">
            <div><p class="area">${icon(config.icon, 18)} ${esc(config.area)}</p><h1>${esc(config.name)}</h1><p>${esc(config.description)}</p></div>
            ${config.create ? button(config.create, 'create', 'primary intro-create', 'plus') : ''}
          </div>
          <div id="screen"></div>
        </main>
        <footer class="foot"><span>Prototipe portofolio Bayu Widyantoro</span><span>Data dan aktivitas contoh tersimpan di browser ini.</span></footer>
      </div>
    </div>
    <dialog class="dialog" id="dialog" aria-labelledby="dialog-title"></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  }

  function guide() {
    return `<div class="guide">${icon('info', 18)}<p><strong>Coba alur ini</strong><span>${esc(config.journey)}</span></p></div>`;
  }

  function renderPortal() {
    const items = Object.entries(modules).filter(([key]) => key !== 'portal').map(([key, data]) => `
      <a class="module-card accent-${data.accent}" href="/prototipe/${key}/">
        <span class="module-icon">${icon(data.icon, 22)}</span><h3>${esc(data.name)}</h3>
        <p>${esc(data.description)}</p><span class="module-action">Buka demo ${icon('arrow', 16)}</span>
      </a>`).join('');
    const published = announcements.filter(item => item.published);
    document.getElementById('screen').innerHTML = `<div class="portal">
      <section><h2>Modul</h2><div class="module-grid">${items}</div></section>
      <section class="panel notice-panel"><div class="panel-title"><h2>Pengumuman</h2></div>
        <div class="notice-list">${published.length ? published.map(item => `<button class="notice" type="button" data-notice="${esc(item.id)}"><span class="notice-icon">${icon('info', 18)}</span><span><small>${formatDate(item.date)}</small><strong>${esc(item.title)}</strong></span>${icon('external', 16)}</button>`).join('') : '<p class="empty">Belum ada pengumuman terbit.</p>'}</div>
      </section>
    </div>`;
  }

  function renderProfile() {
    document.getElementById('screen').innerHTML = `
      <div class="profile-grid">
        <section class="panel"><div class="panel-title"><h2>Data pegawai</h2>${button('Ubah kontak', 'edit-profile', 'secondary')}</div>
          <div class="profile-summary"><span class="module-icon">${icon('profile', 28)}</span><div><h3>${esc(profile.name)}</h3><p>Staf Human Capital</p></div></div>
          <dl class="facts padded"><div><dt>ID pegawai</dt><dd>DEMO-001</dd></div><div><dt>Unit kerja</dt><dd>Human Capital</dd></div><div><dt>Email</dt><dd>${esc(profile.email)}</dd></div><div><dt>Telepon</dt><dd>${esc(profile.phone)}</dd></div></dl>
        </section>
        <section class="panel"><div class="panel-title"><h2>Dokumen saya</h2></div><div class="notice-list">
          ${Object.entries(documents).map(([key, doc]) => `<button type="button" class="notice" data-document="${key}"><span class="notice-icon">${icon('folder', 18)}</span><span><strong>${esc(doc.title)}</strong><small>${formatDate(doc.date)}</small></span>${icon('external', 16)}</button>`).join('')}
        </div></section>
      </div>${guide()}`;
  }

  function renderStats() {
    const stats = [{ label: 'Total ' + config.noun, value: rows.length, tone: 'blue', icon: config.icon },
      ...config.statuses.filter(state => !['rejected', 'void', 'arrived'].includes(state.key)).slice(0, 3).map(state => ({
        label: state.label, value: rows.filter(row => row.status === state.key).length, tone: state.tone,
        icon: state.tone === 'green' ? 'check' : 'activity',
      }))];
    return `<div class="stats" style="--stats-count:${stats.length}">${stats.map(stat => `
      <div class="stat"><span class="stat-icon tone-${stat.tone}">${icon(stat.icon, 19)}</span><span><strong>${new Intl.NumberFormat('id-ID', { minimumIntegerDigits: 2 }).format(stat.value)}</strong><small>${esc(stat.label)}</small></span></div>`).join('')}</div>`;
  }

  function renderWorkspace() {
    const active = config.tabs[tab][1];
    const settingsForm = active === 'permissions' || active === 'announcements';
    const filters = `<div class="table-tools">
      <label class="search">${icon('search', 17)}<input type="search" id="search" aria-label="Cari ${config.noun}" placeholder="Cari ${config.noun}…" value="${esc(query)}"></label>
      <label class="select-wrap"><span class="sr-only">Filter status</span><select id="status-filter"><option value="">Semua status</option>${config.statuses.map(state => `<option value="${state.key}" ${state.key === selectedStatus ? 'selected' : ''}>${esc(state.label)}</option>`).join('')}</select>${icon('down', 16)}</label>
      ${button('Ekspor CSV', 'export', 'secondary export', 'download')}
    </div>`;
    document.getElementById('screen').innerHTML = `${renderStats()}
      <section class="panel work-panel">
        <div class="panel-title"><h2>${esc(settingsForm ? config.tabs[tab][0] : config.list)}</h2></div>
        <div class="tabs" role="group" aria-label="Tampilan data">${config.tabs.map(([label], index) => `<button type="button" data-tab="${index}" aria-pressed="${index === tab}">${esc(label)}</button>`).join('')}</div>
        ${settingsForm ? (active === 'permissions' ? renderPermissions() : renderAnnouncements()) : `${filters}<div id="results"></div><div class="result-footer" role="status" id="count"></div>`}
      </section>${guide()}`;
    document.querySelector('.intro-create').hidden = settingsForm;
    if (!settingsForm) drawRows();
  }

  function visibleRows() {
    const [, ...filters] = config.tabs[tab];
    const match = query.trim().toLocaleLowerCase('id-ID');
    return rows.filter(row => {
      const matchesTab = !filters.length || filters.some(filter =>
        typeof filter === 'string' ? row.status === filter : Object.entries(filter).every(([key, value]) => row[key] === value));
      const text = [row.id, row.title, row.category, row.number, row.driver, row.party, row.docType].filter(Boolean).join(' ').toLocaleLowerCase('id-ID');
      return matchesTab && (!selectedStatus || row.status === selectedStatus) && text.includes(match);
    });
  }

  function drawRows() {
    const items = visibleRows();
    const dateHeader = config.numbering ? 'Arah surat' : config.date;
    document.getElementById('results').innerHTML = items.length ? `
      <div class="table-scroll"><table class="records"><thead><tr>
        <th scope="col">${esc(config.title)}</th><th scope="col">${esc(config.category)}</th><th scope="col">${esc(dateHeader)}</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Aksi</span></th>
      </tr></thead><tbody>${items.map(row => `<tr>
        <td data-label="${esc(config.title)}"><strong>${esc(row.title)}</strong><small>${esc(row.number || row.id)}</small></td>
        <td data-label="${esc(config.category)}">${esc(row.category)}${config.numbering ? `<small>${formatDate(row.date)}</small>` : row.docType ? `<small>${esc(row.docType)}</small>` : ''}</td>
        <td data-label="${esc(dateHeader)}">${config.numbering ? esc(row.direction) : formatDate(row.date)}${row.time ? `<small>${esc(row.time)}</small>` : ''}</td>
        <td data-label="Status">${pill(status(row.status))}</td>
        <td><button type="button" class="detail" data-row="${esc(row.id)}" aria-label="Detail ${esc(row.title)}">Detail ${icon('external', 15)}</button></td>
      </tr>`).join('')}</tbody></table></div>` : `<div class="empty">${icon('search', 24)}<strong>Tidak ada ${config.noun} yang cocok</strong><span>Coba kata kunci atau filter lain.</span>${button('Bersihkan filter', 'clear', 'secondary')}</div>`;
    document.getElementById('count').textContent = `${items.length} dari ${rows.length} ${config.noun}`;
  }

  function renderPermissions() {
    return `<form id="permissions" class="permissions"><div class="permission-top">
      <label>Role <select id="role">${roleNames.map(name => `<option ${name === role ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
      <button class="button primary" type="submit">${icon('check', 17)}Simpan hak akses</button></div>
      <div class="table-scroll"><table><thead><tr><th scope="col">Modul</th>${permissionNames.map(name => `<th scope="col">${name}</th>`).join('')}</tr></thead>
      <tbody>${permissionModules.map(([key, data]) => `<tr><th scope="row">${esc(data.name)}</th>${permissionNames.map(name => `<td><input type="checkbox" name="${key}" value="${name}" aria-label="${name} ${esc(data.name)}" ${permissions[role][key].includes(name) ? 'checked' : ''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>
    </form>`;
  }

  function renderAnnouncements() {
    return `<div class="table-tools">${button('Buat pengumuman', 'create-announcement', 'primary', 'plus')}</div><div class="notice-list">${announcements.map(item =>
      `<button class="notice" type="button" data-notice="${esc(item.id)}"><span class="notice-icon">${icon('info', 18)}</span><span><strong>${esc(item.title)}</strong><small>${formatDate(item.date)} · ${item.published ? 'Terbit' : 'Draf'}</small></span>${icon('external', 16)}</button>`).join('')}</div>`;
  }

  function render() {
    if (slug === 'portal') renderPortal();
    else if (slug === 'profil-saya') renderProfile();
    else renderWorkspace();
  }

  function showDialog(title, body, handler) {
    const dialog = document.getElementById('dialog');
    currentDialog = handler;
    dialog.innerHTML = `<div class="dialog-interior"><header><h2 id="dialog-title">${esc(title)}</h2><button type="button" class="icon-button" data-action="close" aria-label="Tutup">${icon('x', 22)}</button></header>${body}</div>`;
    if (!dialog.open) dialog.showModal();
    else dialog.querySelector('[data-action="close"]').focus();
    return dialog;
  }

  function field(data, value = '') {
    const input = data.type === 'select'
      ? `<select name="${data.key}" required><option value="">Pilih ${esc(data.label.toLowerCase())}</option>${data.options.map(option => `<option ${value === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select>`
      : data.type === 'textarea'
        ? `<textarea name="${data.key}" rows="3" maxlength="500">${esc(value)}</textarea>`
        : `<input name="${data.key}" type="${data.type}" value="${esc(value)}" maxlength="150" required>`;
    return `<label class="field" data-field="${data.key}"><span>${esc(data.label)}</span>${input}</label>`;
  }

  function dialogForm(title, fields, values, submitLabel, handler) {
    const form = `<form class="dialog-form" id="dialog-form">${fields.map(item => field(item, values[item.key] || '')).join('')}
      <p class="form-error" role="alert" hidden></p><div class="dialog-actions">${button('Batal', 'close', 'secondary')}<button class="button primary" type="submit">${icon('check', 17)}${esc(submitLabel)}</button></div></form>`;
    return showDialog(title, form, handler);
  }

  function createRecord() {
    const dialog = dialogForm(config.create, config.fields, { date: today(), direction: 'Surat Keluar' }, config.numbering ? 'Simpan surat' : 'Simpan', (values) => {
      if (config.dateOrder) {
        const [first, second] = config.dateOrder;
        if (values[second] <= values[first]) return 'Tanggal akhir perpanjangan harus setelah akhir kontrak saat ini.';
      }
      const nextId = Math.max(0, ...rows.map(row => Number(row.id.split('-').at(-1)))) + 1;
      const id = `${config.prefix}-${String(nextId).padStart(3, '0')}`;
      const state = config.initialByCategory?.[values.category] || config.initial;
      const item = { id, ...values, status: state };
      if (state === 'in') item.checkIn = localTime.format(new Date());
      if (config.numbering) {
        item.number = createLetterNumber(values);
        if (values.direction === 'Surat Masuk' && rows.some(row =>
          row.direction === 'Surat Masuk' && row.status !== 'void' && row.number.toLowerCase() === item.number.toLowerCase())) {
          return 'Nomor surat masuk sudah tercatat.';
        }
        delete item.senderNo;
      }
      rows = [item, ...rows];
      tab = 0;
      selectedStatus = '';
      query = '';
      const saved = save(slug, rows);
      render();
      return { message: saved && (item.number ? `Surat tercatat · ${item.number}` : 'Catatan demo berhasil ditambahkan.') };
    });
    if (config.numbering) {
      const direction = dialog.querySelector('[name="direction"]');
      const senderNo = dialog.querySelector('[name="senderNo"]');
      function update() {
        const incoming = direction.value === 'Surat Masuk';
        senderNo.closest('label').hidden = !incoming;
        senderNo.disabled = !incoming;
      }
      direction.addEventListener('change', update);
      update();
    }
  }

  function createLetterNumber(values) {
    if (values.direction === 'Surat Masuk') return values.senderNo;
    const [year, month] = values.date.split('-');
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const type = { BAST: 'BAST', 'Surat Undangan': 'UND', 'Surat Keterangan': 'KET', Memo: 'MEMO' }[values.category];
    const counter = Math.max(0, ...rows.filter(row =>
      row.direction === 'Surat Keluar' && row.date.slice(0, 4) === year
    ).map(row => Number(row.number.split('/')[0]))) + 1;
    return `${String(counter).padStart(3, '0')}/${type}/DEMO/${roman[Number(month) - 1]}/${year}`;
  }

  function facts(entries) {
    return `<dl class="facts">${entries.filter(([, value]) => value).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  }

  function rowDetails(id) {
    const item = rows.find(row => row.id === id);
    if (!item) return;
    const actions = config.actions[item.status] || [];
    const details = [[config.numbering ? 'Nomor surat' : 'Kode', item.number || item.id], [config.category, item.category],
      [config.date, formatDate(item.date)], ...config.fields.filter(field =>
        !['title', 'category', 'date', 'note', 'senderNo'].includes(field.key)
      ).map(field => [field.label, field.type === 'date' && item[field.key] ? formatDate(item[field.key]) : item[field.key]]),
      ['Driver', item.driver], ['Jam masuk', item.checkIn], ['Jam pulang', item.checkOut]];
    showDialog(item.title, `<div class="dialog-body">
      ${pill(status(item.status))}${facts(details)}
      ${item.note ? `<p class="record-note">${esc(item.note)}</p>` : ''}
      ${config.preview ? `<div class="document-preview"><strong>Pratinjau dokumen simulasi</strong><p>${esc(item.title)}</p><p>${esc(item.docType)} · ${esc(item.category)}</p>${button('Unduh ringkasan', 'download-archive', 'secondary', 'download')}</div>` : ''}
      <div class="dialog-actions">${actions.map(action => `<button class="button ${action.tone === 'danger' ? 'danger' : 'primary'}" type="button" data-transition="${action.next}" data-id="${esc(id)}">${esc(action.label)}</button>`).join('')}</div>
    </div>`).dataset.record = id;
  }

  function updateStatus(id, next) {
    const item = rows.find(row => row.id === id);
    if (!item || !config.actions[item.status]?.some(action => action.next === next)) return;
    const apply = values => {
      Object.assign(item, values, { status: next });
      if (next === 'out') item.checkOut = localTime.format(new Date());
      const saved = save(slug, rows);
      render();
      return { message: saved && `Status diperbarui menjadi ${status(next).label.toLowerCase()}.` };
    };
    if (config.approvalField && next === 'approved') {
      dialogForm('Tetapkan driver', [config.approvalField], {}, 'Setujui reservasi', apply);
    } else {
      const result = apply({});
      rowDetails(id);
      if (result.message) notify(result.message);
    }
  }

  function showNotice(id) {
    const notice = announcements.find(item => item.id === id);
    if (!notice) return;
    showDialog(notice.title, `<div class="dialog-body">${facts([['Tanggal', formatDate(notice.date)]])}<p class="record-note">${esc(notice.note)}</p>
      ${slug === 'pengaturan' ? `<div class="dialog-actions"><button class="button primary" type="button" data-publish="${esc(id)}">${notice.published ? 'Pindahkan ke draf' : 'Terbitkan pengumuman'}</button></div>` : ''}</div>`);
  }

  function saveAnnouncement() {
    dialogForm('Buat pengumuman', [
      { key: 'title', label: 'Judul', type: 'text' }, { key: 'date', label: 'Tanggal', type: 'date' },
      { key: 'note', label: 'Isi pengumuman', type: 'textarea' },
    ], { date: today() }, 'Simpan sebagai draf', values => {
      if (!values.note) return 'Isi pengumuman wajib diisi.';
      announcements = [{ ...values, id: `ANN-${String(announcements.length + 1).padStart(3, '0')}`, published: false }, ...announcements];
      const saved = save('announcements', announcements);
      render();
      return { message: saved && 'Draf pengumuman disimpan.' };
    });
  }

  function editProfile() {
    dialogForm('Ubah kontak', [
      { key: 'email', label: 'Email contoh', type: 'email' }, { key: 'phone', label: 'Telepon contoh', type: 'tel' },
    ], profile, 'Simpan kontak', values => {
      profile = { ...profile, ...values };
      const saved = save('profile', profile);
      render();
      return { message: saved && 'Kontak demo diperbarui.' };
    });
  }

  function showDocument(key) {
    const doc = documents[key];
    if (!doc) return;
    showDialog(doc.title, `<div class="dialog-body">${facts([['Jenis', doc.type], ['Tanggal', formatDate(doc.date)]])}
      <div class="document-preview"><strong>Pratinjau dokumen simulasi</strong><pre>${esc(doc.body)}</pre></div>
      <div class="dialog-actions"><button class="button primary" type="button" data-file="${key}">${icon('download', 17)} Unduh contoh TXT</button></div></div>`);
  }

  function download(name, data, type) {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(value) {
    const raw = String(value ?? '');
    const safe = /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replaceAll('"', '""') + '"';
  }

  function exportRows() {
    const data = visibleRows();
    if (!data.length) return notify('Tidak ada data yang cocok untuk diekspor.');
    const records = [['Kode / nomor', config.title, config.category, config.date, 'Status'], ...data.map(row =>
      [row.number || row.id, row.title, row.category, row.date, status(row.status).label])];
    download(`demo-${slug}.csv`, '\uFEFF' + records.map(row => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
    notify('CSV demo diunduh.');
  }

  function notify(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
  }

  function reset() {
    showDialog('Setel ulang demo?', `<div class="dialog-body"><p>Perubahan lokal pada ${esc(config.name)} akan dikembalikan ke data contoh awal.</p><div class="dialog-actions">${button('Batal', 'close', 'secondary')}${button('Setel ulang', 'confirm-reset', 'danger')}</div></div>`);
  }

  function confirmReset() {
    let keys = [slug];
    if (slug === 'pengaturan') keys = [slug, 'announcements', 'permissions'];
    if (slug === 'portal') keys = ['announcements'];
    if (slug === 'profil-saya') keys = ['profile'];
    try {
      keys.forEach(key => localStorage.removeItem(prefix + key));
      location.reload();
    } catch {
      notify('Penyimpanan browser tidak tersedia.');
    }
  }

  app.innerHTML = header();
  document.body.classList.add('accent-' + config.accent);
  render();
  const dialog = document.getElementById('dialog');

  function toggleNav() {
    const button = document.querySelector('.nav-toggle');
    const open = document.body.classList.toggle('nav-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi');
    if (open) document.querySelector('.sidebar nav a[aria-current]').focus();
    else button.focus();
  }

  const commands = {
    create: createRecord, export: exportRows, menu: toggleNav, close: () => dialog.close(),
    reset, 'confirm-reset': confirmReset, 'create-announcement': saveAnnouncement, 'edit-profile': editProfile,
    clear: () => { query = ''; selectedStatus = ''; render(); document.getElementById('search').focus(); },
    'download-archive': () => {
      const row = rows.find(row => row.id === dialog.dataset.record);
      if (row) download(row.id + '-simulasi.txt', [row.title, row.docType, row.category, row.date, row.note].filter(Boolean).join('\n'), 'text/plain;charset=utf-8');
    },
  };
  app.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (event.target === dialog) return dialog.close();
    if (!target) return;
    const data = target.dataset;
    if (data.action) commands[data.action]?.();
    if (data.tab !== undefined) {
      tab = Number(data.tab);
      selectedStatus = '';
      query = '';
      render();
      document.querySelector(`[data-tab="${tab}"]`).focus();
    }
    if (data.row) rowDetails(data.row);
    if (data.transition) updateStatus(data.id, data.transition);
    if (data.notice) showNotice(data.notice);
    if (data.document) showDocument(data.document);
    if (data.file) download(data.file + '-simulasi.txt', documents[data.file].body, 'text/plain;charset=utf-8');
    if (data.publish) {
      const notice = announcements.find(item => item.id === data.publish);
      notice.published = !notice.published;
      const saved = save('announcements', announcements);
      dialog.close();
      render();
      if (saved) notify(notice.published ? 'Pengumuman terbit di Portal Internal.' : 'Pengumuman dipindahkan ke draf.');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dialog.open && document.body.classList.contains('nav-open')) {
      event.preventDefault();
      toggleNav();
    }
  });
  document.querySelector('.workspace').addEventListener('focusin', event => {
    if (!event.target.matches('.nav-toggle, .nav-toggle *') && document.body.classList.contains('nav-open')) {
      toggleNav();
    }
  });
  app.addEventListener('input', event => {
    if (event.target.id === 'search') {
      query = event.target.value;
      drawRows();
    }
  });
  app.addEventListener('change', event => {
    if (event.target.id === 'status-filter') {
      selectedStatus = event.target.value;
      drawRows();
    }
    if (event.target.id === 'role') {
      role = event.target.value;
      render();
      document.getElementById('role').focus();
    }
  });
  app.addEventListener('submit', event => {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    if (form.id === 'permissions') {
      permissions[role] = Object.fromEntries(permissionModules.map(([key]) => [key, data.getAll(key)]));
      if (save('permissions', permissions)) notify(`Hak akses ${role} tersimpan.`);
    }
    if (form.id === 'dialog-form') {
      const values = Object.fromEntries(Array.from(data, ([key, value]) => [key, value.trim()]));
      const missing = [...form.querySelectorAll('[required]')].some(input => !input.disabled && !values[input.name]);
      const result = missing ? 'Lengkapi kolom yang wajib diisi.' : currentDialog(values);
      if (typeof result === 'string') {
        const error = form.querySelector('.form-error');
        error.hidden = false;
        error.textContent = result;
      } else {
        dialog.close();
        if (result.message) notify(result.message);
      }
    }
  });
})();
