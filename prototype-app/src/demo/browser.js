import { address, db, location } from './state.js';

export function demoPosition(success) {
  const coords = {
    ...location, latitude: Number(db.geofence.latitude ?? location.latitude),
    longitude: Number(db.geofence.longitude ?? location.longitude),
  };
  queueMicrotask(() => success({ coords, timestamp: Date.now() }));
}
export async function demoReverseGeocode() {
  return new Response(JSON.stringify({ address, display_name:'Kantor Demo, Jakarta' }), {
    headers: {'Content-Type':'application/json'},
  });
}
