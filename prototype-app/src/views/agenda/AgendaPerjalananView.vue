<template>
  <AgendaPerjalananPwa
    v-if="isPwa"
    :message="message"
    :error-message="errorMessage"
    :loading="loading"
    :saving="saving"
    :action-loading="actionLoading"
    :agenda-list="agendaList"
    :filter="filter"
    :form="form"
    :show-form-agenda="showFormAgenda"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :current-user-id="currentUserId"
    :current-user-role="currentUserRole"
    :lokasi-terbaru="lokasiTerbaru"
    @clear-message="message = ''"
    @clear-error="errorMessage = ''"
    @toggle-form="toggleFormAgenda"
    @tambah-tujuan="tambahTujuan"
    @hapus-tujuan="hapusTujuan"
    @load-data="loadData"
    @simpan-agenda="simpanAgenda"
    @reset-form="resetDanTutupForm"
    @proses-aksi="prosesAksi"
    @batal-agenda="batalAgenda"
    @lihat-foto="lihatFoto"
  />

  <AgendaPerjalananWeb
    v-else
    :message="message"
    :error-message="errorMessage"
    :loading="loading"
    :saving="saving"
    :action-loading="actionLoading"
    :agenda-list="agendaList"
    :filter="filter"
    :form="form"
    :status-label="statusLabel"
    :status-badge-class="statusBadgeClass"
    :format-date-time="formatDateTime"
    :user-name="userName"
    :current-user-id="currentUserId"
    :current-user-role="currentUserRole"
    @clear-message="message = ''"
    @clear-error="errorMessage = ''"
    @tambah-tujuan="tambahTujuan"
    @hapus-tujuan="hapusTujuan"
    @load-data="loadData"
    @simpan-agenda="simpanAgenda"
    @reset-form="resetForm"
    @proses-aksi="prosesAksi"
    @batal-agenda="batalAgenda"
    @lihat-foto="lihatFoto"
  />


  <!-- Multi Photo Viewer -->
  <div
    v-if="showPhotoViewer"
    class="agenda-photo-modal"
    @click.self="tutupPhotoViewer"
  >
    <div class="agenda-photo-modal__content">
      <button
        type="button"
        class="btn btn-light btn-sm agenda-photo-modal__close"
        @click="tutupPhotoViewer"
        aria-label="Tutup"
      >
        <i class="fas fa-times"></i>
      </button>

      <div v-if="photoViewerPhotos.length" class="w-100 text-center">
        <img
          :src="photoViewerPhotos[photoViewerIndex]?.url"
          class="agenda-photo-modal__image"
          alt="Bukti foto perjalanan"
        >

        <div class="agenda-photo-modal__toolbar justify-content-center">
          <button
            v-if="photoViewerPhotos.length > 1"
            type="button"
            class="btn btn-light btn-sm"
            @click="fotoSebelumnya"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <span class="text-white small">
            {{ photoViewerIndex + 1 }} / {{ photoViewerPhotos.length }}
          </span>

          <button
            v-if="photoViewerPhotos.length > 1"
            type="button"
            class="btn btn-light btn-sm"
            @click="fotoBerikutnya"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div
          v-if="photoViewerPhotos.length > 1"
          class="agenda-photo-modal__thumbs justify-content-center"
        >
          <button
            v-for="(foto, index) in photoViewerPhotos"
            :key="foto.id"
            type="button"
            class="p-0 bg-transparent border-0"
            @click="photoViewerIndex = index"
          >
            <img
              :src="foto.url"
              class="agenda-photo-modal__thumb"
              :class="{ active: index === photoViewerIndex }"
              alt=""
            >
          </button>
        </div>
      </div>

      <div v-else class="text-white text-center">
        Tidak ada foto yang tersedia.
      </div>
    </div>
  </div>

</template>

<script setup>
import { demoPosition } from "../../demo/browser.js"
import { ref, reactive, onMounted } from 'vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import api from '../../services/api'
import { usePwaMode } from '../../composables/usePwaMode'
import './components/agendaPhotoViewer.css'

import AgendaPerjalananPwa from './components/AgendaPerjalananPwa.vue'
import AgendaPerjalananWeb from './components/AgendaPerjalananWeb.vue'

const { isPwa } = usePwaMode()

const today = (() => {
  // Gunakan tanggal lokal perangkat; toISOString() dapat bergeser ke UTC pada PWA.
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})()

const loading = ref(false)
const saving = ref(false)
const actionLoading = ref(null)

const message = ref('')
const errorMessage = ref('')
const agendaList = ref([])
const currentUserId = ref(null)
const currentUserRole = ref(null)

const showPhotoViewer = ref(false)
const photoViewerPhotos = ref([])
const photoViewerIndex = ref(0)

const showFormAgenda = ref(false)

const filter = reactive({
  tanggal: today,
  status: ''
})

const form = reactive({
  tanggal: today,
  items: [
    {
      tujuan: '',
      keperluan: ''
    }
  ]
})

const toggleFormAgenda = () => {
  showFormAgenda.value = !showFormAgenda.value
}

const tutupFormAgenda = () => {
  showFormAgenda.value = false
}

const tambahTujuan = () => {
  form.items.push({
    tujuan: '',
    keperluan: ''
  })
}

const hapusTujuan = (index) => {
  form.items.splice(index, 1)
}

const resetForm = () => {
  form.tanggal = today
  form.items = [
    {
      tujuan: '',
      keperluan: ''
    }
  ]
}

const resetDanTutupForm = () => {
  resetForm()
  tutupFormAgenda()
}

const loadCurrentUser = async () => {
  try {
    const response = await api.get('/me')
    const user = response.data?.data || response.data?.user || response.data

    currentUserId.value = user?.id ?? null
    currentUserRole.value = user?.role ?? null
  } catch (error) {
    console.error('Gagal memuat user aktif:', error)
    currentUserId.value = null
    currentUserRole.value = null
  }
}

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/agenda-perjalanan', {
      params: {
        tanggal: filter.tanggal,
        status: filter.status || undefined
      }
    })

    agendaList.value = response.data.data || []
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Gagal memuat data perjalanan.'
  } finally {
    loading.value = false
  }
}

const simpanAgenda = async () => {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const invalid = form.items.some(item => {
      return !item.tujuan.trim() || !item.keperluan.trim()
    })

    if (invalid) {
      errorMessage.value = 'Semua tujuan dan keperluan wajib diisi.'
      return
    }

    const payloadItems = form.items.map(item => ({
      tujuan: item.tujuan.trim(),
      keperluan: item.keperluan.trim()
    }))

    await api.post('/agenda-perjalanan/bulk', {
      tanggal: form.tanggal,
      items: payloadItems
    })

    filter.tanggal = form.tanggal
    message.value = `${payloadItems.length} agenda perjalanan berhasil ditambahkan.`

    resetForm()

    if (isPwa.value) {
      tutupFormAgenda()
    }

    await loadData()
  } catch (error) {
    console.error(error)
    errorMessage.value = getErrorMessage(error, 'Gagal menyimpan agenda perjalanan.')
  } finally {
    saving.value = false
  }
}

const prosesAksi = async (agenda, aksi) => {
  // Cegah request ganda saat jaringan/PWA lambat.
  if (actionLoading.value) return

  let fotoSelesai = null

  if (aksi === 'selesai') {
    fotoSelesai = await pilihFotoSelesai()

    if (!fotoSelesai) {
      return
    }
  } else {
    const confirmed = await konfirmasiAksi(aksi)

    if (!confirmed) {
      return
    }
  }

  actionLoading.value = `${agenda.id}-${aksi}`
  message.value = ''
  errorMessage.value = ''

  try {
    Swal.fire({
      title: 'Mengambil Lokasi...',
      text: 'Mohon tunggu, sistem sedang membaca titik lokasi Anda.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const lokasi = await ambilLokasi()

    if (aksi === 'selesai') {
      const formData = new FormData()

      formData.append('latitude', lokasi.latitude)
      formData.append('longitude', lokasi.longitude)
      formData.append('accuracy', lokasi.accuracy || '')
      fotoSelesai.forEach((file) => {
        formData.append('foto_selesai[]', file)
      })

      await api.post(`/agenda-perjalanan/${agenda.id}/selesai`, formData, {
        // Biarkan Axios/browser menambahkan multipart boundary yang benar.
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      })
    } else {
      await api.post(`/agenda-perjalanan/${agenda.id}/${aksi}`, {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        accuracy: lokasi.accuracy
      })
    }

    Swal.close()

    message.value = aksi === 'selesai'
      ? 'Perjalanan berhasil diselesaikan dan foto bukti tersimpan.'
      : 'Status perjalanan berhasil diperbarui.'

    await loadData()

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: message.value,
      timer: 1800,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.close()
    console.error(error)

    if (error?.name === 'GEOLOCATION_PERMISSION_DENIED' || error?.code === 1) {
      errorMessage.value = 'Izin lokasi ditolak. Aktifkan izin Lokasi untuk browser/PWA mPro di pengaturan HP, lalu coba lagi.'
    } else if (error?.name === 'GEOLOCATION_SECURE_CONTEXT') {
      errorMessage.value = 'Lokasi hanya dapat digunakan melalui HTTPS. Buka mPro menggunakan alamat HTTPS.'
    } else if (error?.name === 'GEOLOCATION_UNSUPPORTED') {
      errorMessage.value = 'Perangkat/browser tidak mendukung lokasi.'
    } else if (error?.code === 2) {
      errorMessage.value = 'Lokasi perangkat tidak tersedia. Pastikan GPS/Lokasi HP aktif, lalu coba lagi.'
    } else if (error?.code === 3) {
      errorMessage.value = 'Lokasi terlalu lama diperoleh. Pastikan GPS/Lokasi HP aktif dan coba lagi.'
    } else {
      errorMessage.value = getErrorMessage(error, 'Gagal memperbarui status perjalanan.')
    }

    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage.value,
      confirmButtonText: 'Mengerti',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    actionLoading.value = null
  }
}

const batalAgenda = async (agenda) => {
  const result = await Swal.fire({
    title: 'Batalkan Perjalanan?',
    text: 'Silakan isi alasan pembatalan perjalanan.',
    icon: 'warning',
    input: 'textarea',
    inputLabel: 'Alasan Pembatalan',
    inputPlaceholder: 'Contoh: Dokumen belum siap / tujuan ditunda / pegawai berhalangan',
    inputAttributes: {
      'aria-label': 'Alasan pembatalan'
    },
    showCancelButton: true,
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Kembali',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Alasan pembatalan wajib diisi.'
      }
    }
  })

  if (!result.isConfirmed) {
    return
  }

  actionLoading.value = `${agenda.id}-batal`
  message.value = ''
  errorMessage.value = ''

  try {
    let payload = {
      alasan_batal: result.value.trim()
    }

    Swal.fire({
      title: 'Menyimpan Pembatalan...',
      text: 'Mohon tunggu sebentar.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      const lokasi = await ambilLokasi()

      payload = {
        ...payload,
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        accuracy: lokasi.accuracy
      }
    } catch {
      // Lokasi pembatalan bersifat opsional.
    }

    await api.post(`/agenda-perjalanan/${agenda.id}/batal`, payload)

    Swal.close()

    message.value = 'Perjalanan berhasil dibatalkan.'
    await loadData()

    await Swal.fire({
      icon: 'success',
      title: 'Dibatalkan',
      text: 'Perjalanan berhasil dibatalkan.',
      timer: 1800,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.close()
    console.error(error)

    errorMessage.value = getErrorMessage(error, 'Gagal membatalkan perjalanan.')

    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage.value,
      confirmButtonText: 'Mengerti',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    actionLoading.value = null
  }
}

const ambilLokasi = async () => {
  if (!window.isSecureContext) {
    const error = new Error('Lokasi membutuhkan koneksi HTTPS.')
    error.name = 'GEOLOCATION_SECURE_CONTEXT'
    throw error
  }

  if (!demoPosition) {
    const error = new Error('Browser tidak mendukung geolocation.')
    error.name = 'GEOLOCATION_UNSUPPORTED'
    throw error
  }

  // Pada Android/PWA, GPS high accuracy kadang timeout meskipun izin
  // sudah diberikan. Coba high accuracy terlebih dahulu, lalu fallback
  // ke provider lokasi biasa agar proses tidak gagal hanya karena GPS.
  const getPosition = (options) => new Promise((resolve, reject) => {
    demoPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => reject(error),
      options
    )
  })

  // Cek permission bila API Permissions tersedia. Jangan memaksa prompt;
  // browser tetap yang mengontrol dialog izin lokasi.
  try {
    if (navigator.permissions?.query) {
      const permission = await navigator.permissions.query({ name: 'geolocation' })

      if (permission.state === 'denied') {
        const error = new Error('Izin lokasi browser ditolak.')
        error.name = 'GEOLOCATION_PERMISSION_DENIED'
        throw error
      }
    }
  } catch (error) {
    if (error?.name === 'GEOLOCATION_PERMISSION_DENIED') {
      throw error
    }
    // Permissions API tidak tersedia/ditolak browser; lanjutkan ke
    // getCurrentPosition karena itu tetap merupakan sumber kebenaran.
  }

  try {
    return await getPosition({
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 10000
    })
  } catch (firstError) {
    // TIMEOUT (3) / POSITION_UNAVAILABLE (2): retry menggunakan
    // network/provider location yang biasanya lebih cepat di Android PWA.
    if (firstError?.code === 2 || firstError?.code === 3) {
      try {
        return await getPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 30000
        })
      } catch (fallbackError) {
        throw fallbackError
      }
    }

    throw firstError
  }
}

const konfirmasiAksi = async (aksi) => {
  const config = {
    mulai: {
      title: 'Mulai Perjalanan?',
      text: 'Sistem akan menyimpan lokasi awal perjalanan Anda.',
      icon: 'question',
      confirmButtonText: 'Ya, Mulai',
      confirmButtonColor: '#198754'
    },
    sampai: {
      title: 'Sampai di Tujuan?',
      text: 'Sistem akan menyimpan lokasi saat ini sebagai titik sampai tujuan.',
      icon: 'info',
      confirmButtonText: 'Ya, Simpan',
      confirmButtonColor: '#ffc107'
    }
  }

  const result = await Swal.fire({
    title: config[aksi].title,
    text: config[aksi].text,
    icon: config[aksi].icon,
    showCancelButton: true,
    confirmButtonText: config[aksi].confirmButtonText,
    cancelButtonText: 'Batal',
    confirmButtonColor: config[aksi].confirmButtonColor,
    cancelButtonColor: '#6c757d',
    reverseButtons: true
  })

  return result.isConfirmed
}

const pilihFotoSelesai = async () => {
  const result = await Swal.fire({
    title: 'Bukti Pengiriman / Penyelesaian',
    html: `
      <div class="text-start">
        <p class="mb-2">Pilih cara melampirkan bukti:</p>
        <div class="d-grid gap-2">
          <label for="agenda-foto-kamera" class="btn btn-primary">
            <i class="fas fa-camera me-2"></i>Ambil Foto
          </label>
          <label for="agenda-foto-galeri" class="btn btn-outline-primary">
            <i class="fas fa-images me-2"></i>Ambil dari Galeri
          </label>
        </div>
        <input id="agenda-foto-kamera" type="file" accept="image/*" capture="environment" class="d-none">
        <input id="agenda-foto-galeri" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple class="d-none">
        <div id="agenda-foto-terpilih" class="small text-muted mt-3">Belum ada foto dipilih.</div>
        <div class="form-text mt-2">Minimal 1 dan maksimal 10 foto. Maksimal 4 MB per foto.</div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Selesaikan Perjalanan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
    focusConfirm: false,
    didOpen: () => {
      const cameraInput = document.getElementById('agenda-foto-kamera')
      const galleryInput = document.getElementById('agenda-foto-galeri')
      const selectedLabel = document.getElementById('agenda-foto-terpilih')
      const confirmButton = Swal.getConfirmButton()
      if (confirmButton) confirmButton.disabled = true

      const showSelected = (input) => {
        // Pilihan terbaru menggantikan pilihan sebelumnya agar tidak mengirim duplikat.
        if (input === cameraInput && galleryInput) galleryInput.value = ''
        if (input === galleryInput && cameraInput) cameraInput.value = ''
        const files = Array.from(input?.files || [])
        if (selectedLabel) {
          selectedLabel.textContent = files.length
            ? `${files.length} foto dipilih: ${files.map(file => file.name || 'Foto kamera').join(', ')}`
            : 'Belum ada foto dipilih.'
        }
        if (confirmButton) confirmButton.disabled = files.length === 0
      }

      cameraInput?.addEventListener('change', () => showSelected(cameraInput))
      galleryInput?.addEventListener('change', () => showSelected(galleryInput))
    },
    preConfirm: () => {
      const cameraInput = document.getElementById('agenda-foto-kamera')
      const galleryInput = document.getElementById('agenda-foto-galeri')
      let files = Array.from(galleryInput?.files || [])
      if (!files.length) files = Array.from(cameraInput?.files || [])

      if (!files.length) {
        Swal.showValidationMessage('Ambil foto atau pilih foto dari galeri terlebih dahulu.')
        return false
      }
      if (files.length > 10) {
        Swal.showValidationMessage('Maksimal 10 foto bukti.')
        return false
      }

      const allowedExtensions = /\.(jpe?g|png|webp|heic|heif)$/i
      for (const file of files) {
        const isImage = file.type?.startsWith('image/') || allowedExtensions.test(file.name || '')
        if (!isImage) {
          Swal.showValidationMessage('Semua lampiran harus berupa file gambar.')
          return false
        }
        if (file.size > 4 * 1024 * 1024) {
          Swal.showValidationMessage(`Foto ${file.name || 'kamera'} melebihi ukuran maksimal 4 MB.`)
          return false
        }
      }
      return files
    }
  })

  return result.isConfirmed ? result.value : null
}

const revokePhotoViewerUrls = () => {
  photoViewerPhotos.value.forEach((foto) => {
    if (foto?.__blobUrl) {
      URL.revokeObjectURL(foto.__blobUrl)
    }
  })
}

const lihatFoto = async (agendaId) => {
  if (!agendaId) return

  try {
    // Endpoint daftar foto mengembalikan URL file yang dilindungi auth:sanctum.
    // <img src> tidak membawa header Authorization, sehingga file harus
    // diambil melalui axios/api terlebih dahulu sebagai blob.
    const response = await api.get(`/agenda-perjalanan/${agendaId}/fotos`)
    const photos = response.data?.data || []

    if (!photos.length) {
      await Swal.fire({
        icon: 'info',
        title: 'Bukti Foto',
        text: 'Belum ada bukti foto untuk perjalanan ini.',
        confirmButtonText: 'Tutup'
      })
      return
    }

    revokePhotoViewerUrls()

    const loadedPhotos = []

    for (const foto of photos) {
      try {
        const blobResponse = await api.get(
          `/agenda-perjalanan/${agendaId}/fotos/${foto.id}`,
          { responseType: 'blob' }
        )

        const blobUrl = URL.createObjectURL(blobResponse.data)

        loadedPhotos.push({
          ...foto,
          __blobUrl: blobUrl,
          url: blobUrl
        })
      } catch (photoError) {
        console.error('Gagal mengambil foto #' + foto.id, photoError)
      }
    }

    if (!loadedPhotos.length) {
      await Swal.fire({
        icon: 'error',
        title: 'Foto Tidak Dapat Dibuka',
        text: 'File foto ada di server, tetapi tidak dapat diambil dengan sesi login saat ini.',
        confirmButtonText: 'Tutup'
      })
      return
    }

    photoViewerPhotos.value = loadedPhotos
    photoViewerIndex.value = 0
    showPhotoViewer.value = true
  } catch (error) {
    console.error(error)
    await Swal.fire({
      icon: 'error',
      title: 'Foto Tidak Dapat Dibuka',
      text: getErrorMessage(error, 'Bukti foto tidak dapat dimuat dari server.'),
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#dc3545'
    })
  }
}

const fotoSebelumnya = () => {
  if (!photoViewerPhotos.value.length) return
  photoViewerIndex.value = photoViewerIndex.value === 0
    ? photoViewerPhotos.value.length - 1
    : photoViewerIndex.value - 1
}

const fotoBerikutnya = () => {
  if (!photoViewerPhotos.value.length) return
  photoViewerIndex.value = photoViewerIndex.value === photoViewerPhotos.value.length - 1
    ? 0
    : photoViewerIndex.value + 1
}

const tutupPhotoViewer = () => {
  showPhotoViewer.value = false
  revokePhotoViewerUrls()
  photoViewerPhotos.value = []
  photoViewerIndex.value = 0
}

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(', ')
  }

  return fallback
}

const userName = (agenda) => {
  return agenda.user?.name || agenda.user?.username || '-'
}

const statusLabel = (status) => {
  const labels = {
    antrian: 'Antrian',
    dalam_perjalanan: 'Sedang Dalam Perjalanan',
    sampai_tujuan: 'Sampai di Tujuan',
    selesai: 'Selesai',
    batal: 'Batal'
  }

  return labels[status] || status
}

const statusBadgeClass = (status) => {
  const classes = {
    antrian: 'bg-secondary',
    dalam_perjalanan: 'bg-primary',
    sampai_tujuan: 'bg-warning text-dark',
    selesai: 'bg-success',
    batal: 'bg-danger'
  }

  return classes[status] || 'bg-secondary'
}

const formatDateTime = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const hasLokasi = (lat, lng) => {
  return lat !== null && lat !== undefined && lng !== null && lng !== undefined
}

const lokasiText = (lat, lng) => {
  if (!hasLokasi(lat, lng)) {
    return '-'
  }

  return `${lat}, ${lng}`
}

const mapsUrl = (lat, lng) => {
  if (!hasLokasi(lat, lng)) {
    return null
  }

  return `https://www.google.com/maps?q=${lat},${lng}`
}

const lokasiTerbaru = (agenda) => {
  if (hasLokasi(agenda.selesai_latitude, agenda.selesai_longitude)) {
    return {
      label: 'Lokasi Selesai',
      koordinat: lokasiText(agenda.selesai_latitude, agenda.selesai_longitude),
      url: mapsUrl(agenda.selesai_latitude, agenda.selesai_longitude)
    }
  }

  if (hasLokasi(agenda.sampai_latitude, agenda.sampai_longitude)) {
    return {
      label: 'Lokasi Sampai',
      koordinat: lokasiText(agenda.sampai_latitude, agenda.sampai_longitude),
      url: mapsUrl(agenda.sampai_latitude, agenda.sampai_longitude)
    }
  }

  if (hasLokasi(agenda.mulai_latitude, agenda.mulai_longitude)) {
    return {
      label: 'Lokasi Mulai',
      koordinat: lokasiText(agenda.mulai_latitude, agenda.mulai_longitude),
      url: mapsUrl(agenda.mulai_latitude, agenda.mulai_longitude)
    }
  }

  return {
    label: '-',
    koordinat: '-',
    url: null
  }
}

onMounted(async () => {
  await loadCurrentUser()
  await loadData()
})
</script>