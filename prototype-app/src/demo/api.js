import { navigation } from './navigation.js';
import { user } from './state.js';
import { bodyOf, fail, ok, output } from './records.js';
import { personnel } from './personnel.js';
import { attendance } from './attendance.js';
import { agenda, booking } from './operations.js';
import { archive, letters } from './documents.js';

const handlers = {
  dashboard:personnel, pegawai:personnel, pkwt:personnel, 'approval-pkwt':personnel, laporan:personnel,
  'demo-pkwt-file':personnel, kehadiran:attendance, 'agenda-perjalanan':agenda,
  'reservasi-driver':booking, arsip:archive, 'nomor-surat':letters,
};

async function respond(method, url, payload, options) {
  const target = new URL(url, location.origin);
  const path = target.pathname.replace(/^\/api(?=\/)/,'');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const query = { ...Object.fromEntries(target.searchParams), ...options?.params };
  const fields = bodyOf(payload);
  let result;
  if (path === '/me/navigation') result = ok({ role:'superadmin', modules:navigation });
  else if (path === '/me') result = ok(user,{user});
  else if (parts[0] === 'notifikasi') result = ok({items:[],data:[],unread_count:0},{unread_count:0});
  else {
    const handler = handlers[parts[0]];
    if (!handler) fail('Rute API tidak tersedia dalam demo.',404);
    result = await handler(method,parts,fields,query,path);
  }
  return output(result, method !== 'get');
}

export default {
  get:(url,options)=>respond('get',url,null,options),
  post:(url,payload,options)=>respond('post',url,payload,options),
  put:(url,payload,options)=>respond('put',url,payload,options),
  patch:(url,payload,options)=>respond('patch',url,payload,options),
  delete:(url,options)=>respond('delete',url,options?.data,options),
};
