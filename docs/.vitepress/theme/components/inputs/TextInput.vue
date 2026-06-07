<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <input
      class="field-input"
      :class="{ 'field-input--error': !!error }"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    error?: string
    label?: string
    placeholder?: string
    type?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()
</script>

<style scoped>
.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.field-input--error {
  border-color: #ef4444;
}

.field-input--error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
}
</style>
