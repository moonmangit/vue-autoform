<template>
  <div class="field-wrapper">
    <label class="checkbox-label">
      <input
        type="checkbox"
        class="checkbox-input"
        :checked="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        @blur="emit('blur')"
      />
      <span class="checkbox-text">{{ label }}</span>
    </label>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: boolean
    error?: string
    label?: string
  }>(),
  {
    modelValue: false,
  },
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'blur'): void
}>()
</script>

<style scoped>
.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 1.5rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}
.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}
.checkbox-text {
  font-weight: 500;
}
.field-error {
  font-size: 0.75rem;
  color: #ef4444;
}
</style>
