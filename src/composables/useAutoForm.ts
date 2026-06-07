import { reactive, computed } from 'vue'
import type { Ref } from 'vue'
import type { ZodObject, ZodRawShape } from 'zod'

export function useAutoForm(
  schema: ZodObject<ZodRawShape>,
  modelValue: Ref<Record<string, unknown>>,
  emit: (event: 'update:modelValue', value: Record<string, unknown>) => void,
  validateOn: Ref<'blur' | 'input' | 'submit'>,
) {
  const errors = reactive<Record<string, string>>({})

  const schemaKeys = computed<string[]>(() => Object.keys(schema.shape))

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
    const result = schema.safeParse(modelValue.value)
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        errors[key] = err.message
      })
      return false
    }
    Object.keys(errors).forEach((k: string) => delete errors[k])
    return true
  }

  const lastValue: Record<string, unknown> = {}

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

  return {
    errors,
    schemaKeys,
    onFieldInput,
    onFieldBlur,
    validateAll,
  }
}
