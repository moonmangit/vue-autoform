<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <select
      class="field-input"
      :class="{
        'field-input--error': !!error,
        'field-input--disabled': disabled,
      }"
      :value="modelValue"
      :disabled="disabled"
      @change="
        emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
      @blur="emit('blur')"
    >
      <option value="" disabled>{{ placeholder ?? "Select..." }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
    error?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    options: { value: string; label: string }[];
  }>(),
  {
    modelValue: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "blur"): void;
}>();
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
  background: white;
  cursor: pointer;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.field-input--error {
  border-color: #ef4444;
}

.field-input--disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
}
</style>
