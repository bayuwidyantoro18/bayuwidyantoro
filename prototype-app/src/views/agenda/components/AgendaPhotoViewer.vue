<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="agenda-photo-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Bukti foto perjalanan"
      @click.self="close"
    >
      <div class="agenda-photo-modal__content">
        <button
          type="button"
          class="btn btn-light agenda-photo-modal__close"
          aria-label="Tutup"
          @click="close"
        >
          <i class="fas fa-times"></i>
        </button>

        <div v-if="loading" class="agenda-photo-modal__loading">
          <div class="spinner-border text-light" role="status"></div>
          <div class="mt-2 text-white">Memuat bukti foto...</div>
        </div>

        <template v-else-if="photos.length">
          <div class="agenda-photo-modal__stage">
            <button
              v-if="photos.length > 1"
              type="button"
              class="agenda-photo-modal__nav agenda-photo-modal__nav--prev"
              aria-label="Foto sebelumnya"
              @click="previous"
            >
              ‹
            </button>

            <img
              v-if="currentPhotoUrl"
              :src="currentPhotoUrl"
              class="agenda-photo-modal__image"
              alt="Bukti foto perjalanan"
            />

            <button
              v-if="photos.length > 1"
              type="button"
              class="agenda-photo-modal__nav agenda-photo-modal__nav--next"
              aria-label="Foto berikutnya"
              @click="next"
            >
              ›
            </button>
          </div>

          <div class="agenda-photo-modal__counter">
            {{ currentIndex + 1 }} / {{ photos.length }}
          </div>

          <div
            v-if="photos.length > 1"
            class="agenda-photo-modal__thumbs"
          >
            <button
              v-for="(photo, index) in photos"
              :key="photo.id"
              type="button"
              class="agenda-photo-modal__thumb-button"
              :class="{ active: index === currentIndex }"
              :aria-label="`Lihat foto ${index + 1}`"
              @click="selectPhoto(index)"
            >
              <img
                v-if="photoUrls[index]"
                :src="photoUrls[index]"
                class="agenda-photo-modal__thumb"
                alt=""
              />
            </button>
          </div>
        </template>

        <div v-else class="agenda-photo-modal__empty">
          <i class="fas fa-image"></i>
          <div class="mt-2">Bukti foto tidak tersedia.</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import api from '../../../services/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  agendaId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const photos = ref([])
const photoUrls = ref([])
const currentIndex = ref(0)

const currentPhotoUrl = computed(() => {
  return photoUrls.value[currentIndex.value] || ''
})

const revokeUrls = () => {
  photoUrls.value.forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url)
    }
  })
  photoUrls.value = []
}

const reset = () => {
  revokeUrls()
  photos.value = []
  currentIndex.value = 0
  loading.value = false
}

const loadPhotos = async (agendaId) => {
  reset()

  if (!agendaId) return

  loading.value = true

  try {
    const response = await api.get(`/agenda-perjalanan/${agendaId}/fotos`)
    const rows = Array.isArray(response.data?.data)
      ? response.data.data
      : []

    photos.value = rows
    currentIndex.value = 0

    // Endpoint file membutuhkan autentikasi, jadi jangan dipasang
    // langsung ke <img>. Ambil sebagai Blob melalui Axios.
    const urls = await Promise.all(
      rows.map(async (photo) => {
        try {
          const fileResponse = await api.get(
            `/agenda-perjalanan/${agendaId}/fotos/${photo.id}`,
            { responseType: 'blob' }
          )

          const contentType =
            fileResponse.headers?.['content-type'] ||
            fileResponse.data?.type ||
            ''

          if (!contentType.startsWith('image/')) {
            return ''
          }

          return URL.createObjectURL(fileResponse.data)
        } catch (error) {
          console.error(
            `Gagal memuat foto agenda ${agendaId}, foto ${photo.id}:`,
            error
          )
          return ''
        }
      })
    )

    photoUrls.value = urls
  } catch (error) {
    console.error('Gagal mengambil daftar bukti foto:', error)
    photos.value = []
  } finally {
    loading.value = false
  }
}

const selectPhoto = (index) => {
  if (index >= 0 && index < photos.value.length) {
    currentIndex.value = index
  }
}

const previous = () => {
  if (photos.value.length < 2) return

  currentIndex.value =
    currentIndex.value === 0
      ? photos.value.length - 1
      : currentIndex.value - 1
}

const next = () => {
  if (photos.value.length < 2) return

  currentIndex.value =
    currentIndex.value === photos.value.length - 1
      ? 0
      : currentIndex.value + 1
}

const close = () => {
  reset()
  emit('close')
}

watch(
  () => [props.visible, props.agendaId],
  ([visible, agendaId]) => {
    if (visible) {
      loadPhotos(agendaId)
    } else {
      reset()
    }
  }
)

onBeforeUnmount(() => {
  revokeUrls()
})
</script>
