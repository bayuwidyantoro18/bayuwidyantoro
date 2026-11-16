import { ref } from 'vue'

const showBirthdayPlayButton = ref(false)
const birthdayAudio = ref(null)
const birthdaySongChecked = ref(false)

const todayKey = () => {
  return new Date().toISOString().slice(0, 10)
}

const getUsername = () => {
  return (
    sessionStorage.getItem('username') ||
    localStorage.getItem('username') ||
    'unknown-user'
  )
}

const getStorageKey = () => {
  return `birthday_song_played_${getUsername()}_${todayKey()}`
}

export function useBirthdaySong() {
  const playBirthdaySongOnce = async (isBirthdayToday) => {
    if (!isBirthdayToday) return
    if (birthdaySongChecked.value) return

    birthdaySongChecked.value = true

    const storageKey = getStorageKey()

    if (localStorage.getItem(storageKey) === '1') {
      return
    }

    try {
      const audio = new Audio('/audio/birthday.mp3')

      audio.volume = 0.75
      audio.preload = 'auto'

      birthdayAudio.value = audio

      await audio.play()

      localStorage.setItem(storageKey, '1')
      showBirthdayPlayButton.value = false
    } catch (error) {
      console.warn('Autoplay lagu ulang tahun diblokir browser:', error)

      // Browser kadang memblokir autoplay.
      // Jika gagal, tampilkan tombol manual.
      showBirthdayPlayButton.value = true
    }
  }

  const playBirthdaySongManually = async () => {
    const storageKey = getStorageKey()

    try {
      const audio = birthdayAudio.value || new Audio('/audio/birthday.mp3')

      audio.volume = 0.75
      audio.preload = 'auto'

      await audio.play()

      localStorage.setItem(storageKey, '1')
      showBirthdayPlayButton.value = false
    } catch (error) {
      console.error('Gagal memutar lagu ulang tahun:', error)
    }
  }

  const resetBirthdaySongCheck = () => {
    birthdaySongChecked.value = false
    showBirthdayPlayButton.value = false
  }

  return {
    showBirthdayPlayButton,
    playBirthdaySongOnce,
    playBirthdaySongManually,
    resetBirthdaySongCheck
  }
}