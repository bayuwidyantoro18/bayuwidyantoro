import { computed, ref, onMounted, onUnmounted } from 'vue'

export function usePwaMode() {
  const isPwa = ref(false)

  let mqStandalone = null
  let mqFullscreen = null
  let mqMinimalUi = null
  let mqMobile = null

  const checkPwaMode = () => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches
    const minimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
    const iosStandalone = window.navigator.standalone === true
    const androidPwa = document.referrer.startsWith('android-app://')

    isPwa.value =
      standalone ||
      fullscreen ||
      minimalUi ||
      iosStandalone ||
      androidPwa ||
      window.matchMedia('(max-width: 768px)').matches
  }

  onMounted(() => {
    checkPwaMode()

    mqStandalone = window.matchMedia('(display-mode: standalone)')
    mqFullscreen = window.matchMedia('(display-mode: fullscreen)')
    mqMinimalUi = window.matchMedia('(display-mode: minimal-ui)')
    mqMobile = window.matchMedia('(max-width: 768px)')

    const add = (mq) => {
      if (!mq) return

      if (mq.addEventListener) {
        mq.addEventListener('change', checkPwaMode)
      } else {
        mq.addListener(checkPwaMode)
      }
    }

    add(mqStandalone)
    add(mqFullscreen)
    add(mqMinimalUi)
    add(mqMobile)
  })

  onUnmounted(() => {
    const remove = (mq) => {
      if (!mq) return

      if (mq.removeEventListener) {
        mq.removeEventListener('change', checkPwaMode)
      } else {
        mq.removeListener(checkPwaMode)
      }
    }

    remove(mqStandalone)
    remove(mqFullscreen)
    remove(mqMinimalUi)
    remove(mqMobile)
  })

  const isWeb = computed(() => !isPwa.value)

  return { isPwa, isWeb }
}