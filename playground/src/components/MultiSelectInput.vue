<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="multi-select" :class="{ 'multi-select--error': !!error, 'multi-select--disabled': disabled }">
      <div v-if="!options.length" class="multi-select__empty">
        {{ disabled ? 'Loading options…' : 'No options available' }}
      </div>
      <label
        v-for="opt in options"
        :key="opt.value"
        class="multi-select__option"
        :class="{ 'multi-select__option--checked': isSelected(opt) }"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="isSelected(opt)"
          :disabled="disabled"
          @change="toggle(opt)"
        />
        {{ opt.label }}
      </label>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
type Option = { value: string; label: string }

const props = withDefaults(
  defineProps<{
    modelValue?: Option[]
    error?: string
    label?: string
    disabled?: boolean
    options: Option[]
  }>(),
  {
    modelValue: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option[]): void
  (e: 'blur'): void
}>()

function isSelected(opt: Option): boolean {
  return (props.modelValue ?? []).some((o) => o.value === opt.value)
}

function toggle(opt: Option) {
  const current = props.modelValue ?? []
  const exists = current.some((o) => o.value === opt.value)
  const next = exists
    ? current.filter((o) => o.value !== opt.value)
    : [...current, opt]
  emit('update:modelValue', next)
  emit('blur')
}
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

.multi-select {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.multi-select--error {
  border-color: #ef4444;
}

.multi-select--disabled {
  background: #f9fafb;
  opacity: 0.6;
  pointer-events: none;
}

.multi-select__empty {
  font-size: 0.8125rem;
  color: #9ca3af;
  padding: 0.25rem 0;
}

.multi-select__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.1s;
}

.multi-select__option:hover {
  background: #f3f4f6;
}

.multi-select__option--checked {
  background: #e0e7ff;
  color: #4338ca;
  font-weight: 500;
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
}
</style>
