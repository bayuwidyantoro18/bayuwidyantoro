import { computed, ref } from 'vue'
import api from '../services/api'

const navigation = ref(null)
const loadingNavigation = ref(false)

export function useAccessControl() {
  const loadNavigation = async (force = false) => {
    if (loadingNavigation.value) return

    if (navigation.value && !force) return

    loadingNavigation.value = true

    try {
      const response = await api.get('/me/navigation')

      const data = response.data?.data || {
        role: 'user',
        modules: []
      }

      // Urutan modul aplikasi
      // Manajemen Kehadiran selalu berada paling atas.
      if (Array.isArray(data.modules)) {
        data.modules.sort((a, b) => {
          const aKey = a.module_key || a.code || ''
          const bKey = b.module_key || b.code || ''

          if (aKey === 'kehadiran' && bKey !== 'kehadiran') {
            return -1
          }

          if (bKey === 'kehadiran' && aKey !== 'kehadiran') {
            return 1
          }

          return 0
        })
      }

      navigation.value = data

    } catch (error) {
      console.error('Gagal mengambil navigation:', error)

      navigation.value = {
        role: 'user',
        modules: []
      }
    } finally {
      loadingNavigation.value = false
    }
  }

  const resetNavigation = () => {
    navigation.value = null
  }

  const role = computed(() => {
    return navigation.value?.role || 'user'
  })

  const modules = computed(() => {
    return navigation.value?.modules || []
  })

  const getModule = (moduleKey) => {
    return modules.value.find((item) => {
      return item.module_key === moduleKey || item.code === moduleKey
    }) || null
  }

  const getMenus = (moduleKey) => {
    return getModule(moduleKey)?.menus || []
  }

  const getMenu = (moduleKey, menuKey) => {
    return getMenus(moduleKey).find((item) => item.menu_key === menuKey) || null
  }

  const can = (moduleKey, menuKey, action = 'can_view') => {
    const menu = getMenu(moduleKey, menuKey)

    return Boolean(menu?.permissions?.[action])
  }

  return {
    navigation,
    loadingNavigation,
    role,
    modules,
    loadNavigation,
    resetNavigation,
    getModule,
    getMenus,
    getMenu,
    can
  }
}