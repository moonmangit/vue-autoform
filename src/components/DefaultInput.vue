<script setup lang="ts">
defineProps<{
  modelValue?: unknown
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()
</script>

<template>
  <input
    class="autoform-default-input"
    :value="String(modelValue ?? '')"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="emit('blur')"
  />
</template>
