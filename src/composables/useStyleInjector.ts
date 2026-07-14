import { onMounted, onUnmounted, watch, unref, type Ref } from 'vue'

export function useStyleInjector(id: Ref<string>, css: Ref<string>) {
  if (typeof document === 'undefined') return

  let styleEl: HTMLStyleElement | null = null

  function mount() {
    if (styleEl) return
    styleEl = document.createElement('style')
    styleEl.id = unref(id)
    styleEl.textContent = unref(css)
    document.head.appendChild(styleEl)
  }

  function update() {
    if (styleEl) styleEl.textContent = unref(css)
  }

  function cleanup() {
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
    styleEl = null
  }

  onMounted(mount)
  onUnmounted(cleanup)
  watch(css, update)
}
