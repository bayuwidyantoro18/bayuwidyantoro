<template>
  <div v-if="pagination.total > 0" class="pagination-footer">
    <div class="pagination-info">
      Menampilkan <strong>{{ pagination.from || 0 }}</strong> -
      <strong>{{ pagination.to || 0 }}</strong> dari
      <strong>{{ pagination.total || 0 }}</strong> data
    </div>

    <div class="pagination-actions">
      <button class="btn btn-sm btn-outline-secondary page-btn" :disabled="pagination.current_page <= 1 || loading" @click="$emit('change-page', 1)">
        «
      </button>

      <button class="btn btn-sm btn-outline-secondary page-btn" :disabled="pagination.current_page <= 1 || loading" @click="$emit('change-page', pagination.current_page - 1)">
        ‹
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        class="btn btn-sm page-number-btn"
        :class="page === pagination.current_page ? 'btn-primary' : 'btn-outline-secondary'"
        :disabled="loading"
        @click="$emit('change-page', page)"
      >
        {{ page }}
      </button>

      <button class="btn btn-sm btn-outline-secondary page-btn" :disabled="pagination.current_page >= pagination.last_page || loading" @click="$emit('change-page', pagination.current_page + 1)">
        ›
      </button>

      <button class="btn btn-sm btn-outline-secondary page-btn" :disabled="pagination.current_page >= pagination.last_page || loading" @click="$emit('change-page', pagination.last_page)">
        »
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true
  },
  loading: Boolean
})

defineEmits(['change-page'])

const pageNumbers = computed(() => {
  const current = props.pagination.current_page || 1
  const last = props.pagination.last_page || 1
  const pages = []

  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(last, start + 4)
    } else if (end === last) {
      start = Math.max(1, end - 4)
    }
  }

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
})
</script>

<style scoped>
.pagination-footer {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  font-size: 11.5px;
  color: #64748b;
}

.pagination-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-btn,
.page-number-btn {
  min-width: 30px;
  height: 28px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 7px;
}
</style>