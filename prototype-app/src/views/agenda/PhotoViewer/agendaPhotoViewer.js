/*
 * Pola helper Photo Viewer.
 *
 * photos = [
 *   { id: 1, url: '/api/agenda-perjalanan/10/fotos/21', urutan: 1 },
 *   { id: 2, url: '/api/agenda-perjalanan/10/fotos/22', urutan: 2 }
 * ]
 *
 * Viewer harus menyimpan currentPhotoIndex dan menyediakan:
 * nextPhoto()
 * prevPhoto()
 * closePhoto()
 *
 * Ambil daftar:
 *
 * const response = await api.get(`/agenda-perjalanan/${agendaId}/fotos`)
 * photoList.value = response.data.data || []
 *
 * Jangan lagi menggunakan hanya `foto_selesai_url` sebagai sumber gallery.
 */
