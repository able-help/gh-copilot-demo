<template>
  <div v-if="open" class="cart-backdrop" @click.self="$emit('close')">
    <aside class="cart-panel" aria-modal="true" role="dialog" :aria-label="t('cart')">
      <div class="cart-header">
        <div>
          <h2>{{ t('cart') }}</h2>
          <p>{{ t('itemsInCart', { count }) }}</p>
        </div>

        <button class="close-button" type="button" :aria-label="t('closeCart')" @click="$emit('close')">
          ×
        </button>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        <p>{{ t('cartEmpty') }}</p>
      </div>

      <ul v-else class="cart-list">
        <li v-for="item in items" :key="item.album.id" class="cart-item">
          <img :src="item.album.image_url" :alt="item.album.title" loading="lazy" />

          <div class="cart-item-copy">
            <h3>{{ item.album.title }}</h3>
            <p>{{ item.album.artist.name }}</p>
            <span>{{ formatCurrency(item.album.price) }}</span>
            <strong>{{ t('subtotalLabel') }} {{ formatCurrency(getCartItemSubtotal(item)) }}</strong>
          </div>

          <div class="cart-item-actions">
            <div class="quantity-controls" :aria-label="t('quantityLabel')">
              <button type="button" class="quantity-button" :aria-label="t('decreaseQuantity')" @click="$emit('decrease', item.album.id)">
                −
              </button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button type="button" class="quantity-button" :aria-label="t('increaseQuantity')" @click="$emit('increase', item.album.id)">
                +
              </button>
            </div>

            <button class="remove-button" type="button" @click="$emit('remove', item.album.id)">
              {{ t('removeFromCart') }}
            </button>
          </div>
        </li>
      </ul>

      <div v-if="items.length > 0" class="cart-summary">
        <div class="checkout-summary">
          <div class="summary-row">
            <span>{{ t('subtotalOnlyLabel') }}</span>
            <strong>{{ formatCurrency(subtotal) }}</strong>
          </div>
          <div class="summary-row">
            <span>{{ t('taxLabel') }}</span>
            <strong>{{ formatCurrency(tax) }}</strong>
          </div>
          <div class="summary-row">
            <span>{{ t('shippingLabel') }}</span>
            <strong>{{ formatCurrency(shipping) }}</strong>
          </div>
        </div>
        <div class="cart-summary-copy">
          <span>{{ t('grandTotalLabel') }}</span>
          <strong>{{ formatCurrency(total) }}</strong>
        </div>
        <button class="clear-button" type="button" @click="$emit('clear')">
          {{ t('clearCart') }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, t } from '../i18n'
import { getCartItemSubtotal } from '../utils/cart'
import type { CartItem } from '../utils/cart'

interface Props {
  open: boolean
  items: CartItem[]
  count: number
  subtotal: number
  tax: number
  shipping: number
  total: number
}

defineProps<Props>()

defineEmits<{
  close: []
  clear: []
  increase: [albumId: number]
  decrease: [albumId: number]
  remove: [albumId: number]
}>()
</script>

<style scoped>
.cart-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-backdrop);
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  z-index: 20;
}

.cart-panel {
  width: min(100%, 26rem);
  height: 100%;
  background: var(--surface-modal);
  color: var(--text-primary);
  border-radius: 28px;
  box-shadow: var(--shadow-panel);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.6rem;
}

.cart-header p {
  margin: 0.35rem 0 0;
  color: var(--text-tertiary);
}

.close-button {
  border: none;
  background: var(--surface-subtle);
  color: var(--text-primary);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  font-size: 1.4rem;
  cursor: pointer;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--border-default);
  border-radius: 20px;
  background: var(--surface-empty);
  padding: 1.5rem;
  text-align: center;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 4.5rem 1fr auto;
  gap: 0.9rem;
  align-items: start;
  padding: 0.9rem;
  border-radius: 20px;
  background: var(--surface-card);
}

.cart-item img {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 14px;
  object-fit: cover;
}

.cart-item-copy h3,
.cart-item-copy p,
.cart-item-copy strong {
  margin: 0;
}

.cart-item-copy {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.cart-item-copy p,
.cart-item-copy span {
  color: var(--text-tertiary);
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.quantity-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 999px;
  background: var(--surface-neutral);
  padding: 0.25rem;
}

.quantity-button {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  background: var(--surface-pill);
  color: var(--text-primary);
  font-size: 1.1rem;
  cursor: pointer;
}

.quantity-value {
  min-width: 1.25rem;
  text-align: center;
  font-weight: 700;
}

.remove-button {
  border: none;
  border-radius: 999px;
  background: var(--surface-danger);
  color: var(--text-danger-strong);
  padding: 0.65rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
  font-size: 1.05rem;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: var(--cart-summary-bg);
  border: 1px solid var(--cart-summary-border);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--cart-summary-border);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row span {
  color: var(--cart-summary-label);
}

.cart-summary-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: var(--cart-total-bg);
  border: 1px solid var(--cart-total-border);
}

.cart-summary-copy span {
  color: var(--cart-summary-label);
}

.cart-summary-copy strong {
  font-size: 1.18rem;
}

.clear-button {
  border: none;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .cart-backdrop {
    padding: 0.5rem;
  }

  .cart-panel {
    width: 100%;
    border-radius: 22px;
  }

  .cart-item {
    grid-template-columns: 4rem 1fr;
  }

  .cart-item-actions {
    grid-column: 1 / -1;
    align-items: stretch;
  }

  .quantity-controls {
    justify-content: center;
  }

  .remove-button {
    width: 100%;
  }

  .cart-summary {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>