<template>
  <button
    class="cart-button"
    type="button"
    :aria-label="cartButtonLabel"
    @click="$emit('toggle')"
  >
    <span class="cart-icon" aria-hidden="true">🛒</span>
    <span class="cart-text">{{ t('cart') }}</span>
    <span class="cart-badge">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { t } from '../i18n'

interface Props {
  count: number
}

const props = defineProps<Props>()

defineEmits<{
  toggle: []
}>()

const cartButtonLabel = computed(() => t('viewCart', { count: props.count }))
</script>

<style scoped>
.cart-button {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid var(--header-control-border);
  border-radius: 999px;
  background: var(--header-control-bg);
  color: var(--header-control-text);
  box-shadow: var(--header-control-shadow);
  backdrop-filter: blur(16px);
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.cart-button:hover {
  background: var(--header-control-bg-hover);
  transform: translateY(-1px);
}

.cart-icon {
  font-size: 1.1rem;
}

.cart-badge {
  min-width: 1.6rem;
  height: 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--accent-color);
  color: var(--text-on-accent);
  font-size: 0.85rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .cart-button {
    width: 100%;
    justify-content: center;
  }
}
</style>