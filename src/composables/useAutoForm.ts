import { reactive, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { ZodObject, ZodRawShape } from 'zod'

export function useAutoForm(
  schema: ZodObject<ZodRawShape>,
  modelValue: Ref<Record<string, unknown>>,
  emit: (event: 'update:modelValue', value: Record<string, unknown>) => void,
  validateOn: Ref<'blur' | 'input' | 'submit'>,
) {
  const errors = reactive<Record<string, string | undefined>>({})

  const schemaKeys = computed<string[]>(() => Object.keys(schema.shape))

  // lastValue tracks the most recent value for each field. It is updated on
  // every input event and kept in sync with the model, so it can be used as
  // the source of truth for validation even when the parent v-model has not
  // propagated back down yet.
  const lastValue: Record<string, unknown> = {}

  function validateField(key: string, value: unknown): string | undefined {
    const shape = schema.shape
    if (!(key in shape)) return undefined
    const fieldSchema = shape[key]
    const result = fieldSchema.safeParse(value)
    if (!result.success) {
      return result.error.errors[0]?.message ?? 'Invalid value'
    }
    return undefined
  }

  function validateAll(): boolean {
    const result = schema.safeParse(lastValue)
    if (!result.success) {
      const next: Record<string, string> = {}
      for (const err of result.error.errors) {
        const key = String(err.path[0])
        if (!key) continue
        if (!next[key]) {
          next[key] = err.message
        } else {
          next[key] += `; ${err.message}`
        }
      }

      // clear stale errors then apply the new set
      Object.keys(errors).forEach((k: string) => delete errors[k])
      Object.assign(errors, next)
      return false
    }

    Object.keys(errors).forEach((k: string) => delete errors[k])
    return true
  }

  function onFieldInput(key: string, value: unknown) {
    lastValue[key] = value
    const updated = { ...modelValue.value, [key]: value }
    emit('update:modelValue', updated)
    if (validateOn.value === 'input') {
      const msg = validateField(key, value)
      if (msg) {
        errors[key] = msg
      } else {
        delete errors[key]
      }
    }
  }

  function onFieldBlur(key: string) {
    if (validateOn.value === 'blur') {
      // Use lastValue if available — modelValue prop may not have propagated yet
      // when blur fires immediately after update:modelValue (e.g. checkbox toggles)
      const value = key in lastValue ? lastValue[key] : modelValue.value[key]
      const msg = validateField(key, value)
      if (msg) {
        errors[key] = msg
      } else {
        delete errors[key]
      }
    }
  }

  // Keep lastValue in sync when the form model is reset/changed externally.
  watch(
    modelValue,
    (v) => {
      if (v && typeof v === 'object') {
        Object.assign(lastValue, v)
      }
    },
    { immediate: true, deep: true },
  )

  return {
    errors,
    schemaKeys,
    onFieldInput,
    onFieldBlur,
    validateAll,
  }
}
