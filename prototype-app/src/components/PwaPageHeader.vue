<template>
  <div class="pwa-page-head">
    <div class="head-icon">
      <i :class="icon"></i>
    </div>

    <div class="head-text">
      <h5>{{ title }}</h5>
      <p>{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'fas fa-layer-group'
  },
  title: {
    type: String,
    default: 'mPro Internal'
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.pwa-page-head {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 .25rem .75rem rgba(15, 23, 42, .055);
  display: flex;
  align-items: center;
  gap: 10px;
}

.head-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex: 0 0 auto;
}

.head-text {
  min-width: 0;
}

.head-text h5 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 950;
  line-height: 1.2;
}

.head-text p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
  line-height: 1.35;
}
</style>
