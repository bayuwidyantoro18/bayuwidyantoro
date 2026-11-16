import { db, add, persist } from './state.js';
import { readSheet, excel, pdf } from './files.js';
import { markFile, uploadedFile } from './uploads.js';

export const ok = (data, extra = {}) => ({ data, ...extra, success: true, message: 'Data demo berhasil diproses.' });
export function fail(message, status = 422) {
  throw Object.assign(new Error(message), { response: { status, data: { message } } });
}
export function need(list, id) {
  const row = list.find(item => Number(item.id) === Number(id));
  if (!row) fail('Data demo tidak ditemukan.', 404);
  return row;
}
export const lookup = (list, id) => list.find(item => Number(item.id) === Number(id));
export const matches = (a,b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
export const YES = value => [true, 1, '1', 'true'].includes(value);
export function filters(rows, query, dateKey, allow = []) {
  const { keyword, search, tanggal, tanggal_mulai, tanggal_selesai, tanggal_dari, tanggal_sampai, start_date, end_date, bulan } = query;
  return rows.filter(row => {
    const key = String(row[dateKey] || '').slice(0, 10);
    const start = tanggal_mulai || tanggal_dari || start_date;
    const end = tanggal_selesai || tanggal_sampai || end_date;
    const match = keyword || search;
    return (!match || JSON.stringify(row).toLowerCase().includes(String(match).trim().toLowerCase()))
      && (!dateKey || ((!tanggal || key === tanggal) && (!start || key >= start) && (!end || key <= end) && (!bulan || key.startsWith(bulan))))
      && allow.every(name => !query[name] || query[name] === 'all' || matches(row[name], query[name]));
  });
}
export function page(rows, query) {
  const per_page = Math.min(100, Math.max(1, Number(query.per_page) || 10));
  const total = rows.length, last_page = Math.ceil(total / per_page) || 1;
  const current_page = Math.min(last_page, Math.max(1, Number(query.page) || 1));
  const index = (current_page - 1) * per_page;
  return { data: rows.slice(index, index + per_page), pagination: {
    from: total ? index + 1 : 0, to: Math.min(index + per_page, total), current_page, per_page, total, last_page,
  } };
}
export function edit(list, id, fields = {}) {
  if (!id) return add(list, fields);
  const row = need(list, id);
  Object.assign(row, fields, { id: row.id });
  return row;
}
export function remove(list, id) {
  list.splice(list.indexOf(need(list,id)),1);
  return ok(null);
}
function snapshot(value) {
  if (!value || typeof value !== 'object' || value instanceof Blob || value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(snapshot);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item)]));
}
export function bodyOf(payload) {
  if (!(payload instanceof FormData)) return snapshot(payload) || {};
  const fields = {};
  for (const [key, value] of payload) {
    if (key.endsWith('[]')) (fields[key.slice(0, -2)] ??= []).push(value);
    else fields[key] = value;
  }
  return fields;
}
export function attach(fields, ...keys) {
  for (const key of keys) {
    if (fields[key] instanceof Blob) {
      const file = fields[key];
      fields[key] = markFile(file);
      fields.file_name = file.name;
      fields.file_original_name = file.name;
      fields.file_size = file.size;
    }
  }
  return fields;
}
export async function documentFile(row = {}, title = 'Dokumen contoh') {
  const key = row.file || row.file_pkwt || row.scan_dokumen || row.dokumen || row.file_path;
  return await uploadedFile(key) || pdf([row], title);
}
export async function exportFile(path, rows, title, keys) {
  return path.includes('pdf') ? pdf(rows, title) : excel(rows, keys);
}
export async function previewRows(file, required, prepare = item => item) {
  let rows;
  try { rows = await readSheet(file); }
  catch { fail('Gunakan file XLSX yang valid, sesuai template demo.'); }
  if (!rows.length) fail('File Excel tidak memuat baris data.');
  return rows.map(raw => {
    const row = prepare(raw);
    const errors = required.filter(key => !row[key]).map(key => `${key} wajib diisi.`);
    return { ...row, errors, is_valid: !errors.length, valid: !errors.length };
  });
}
export function output(response, mutation) {
  if (mutation) persist();
  if (response instanceof Blob) return { data: response, status: 200, headers: { 'content-type': response.type } };
  return { data: structuredClone(response), status: 200, headers: { 'content-type': 'application/json' } };
}
export const withoutFiles = fields => Object.fromEntries(Object.entries(fields).filter(([key, value]) =>
  key !== '_method' && !(value instanceof Blob) && !(Array.isArray(value) && value.some(item => item instanceof Blob))
));
export { db, add };
