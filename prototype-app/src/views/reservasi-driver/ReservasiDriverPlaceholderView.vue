<template>
  <div class="container-fluid placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-icon">
        <i class="fas fa-screwdriver-wrench"></i>
      </div>

      <div>
        <h3>{{ pageTitle }}</h3>
        <p>
          Halaman ini sedang disiapkan. Kita akan lanjutkan pengembangan menu ini pada tahap berikutnya.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  return route.meta.title || 'Reservasi Driver'
})
</script>

<style scoped>
.placeholder-page {
  padding-top: 0;
}

.placeholder-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.035);
}

.placeholder-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #eef2ff;
  color: #1d4ed8;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.placeholder-card h3 {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 3px;
}

.placeholder-card p {
  font-size: 12.5px;
  color: #64748b;
  margin-bottom: 0;
}
</style>