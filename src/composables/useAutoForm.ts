import { reactive, computed } from 'vue'
import type { Ref } from 'vue'
import type { ZodObject, ZodRawShape } from 'zod'
import type { BreakpointMap, AutoFormLayout, LayoutGrid } from '../types'
import {
  DEFAULT_BREAKPOINTS,
  isShorthandLayout,
  isExplicitLayout,
} from '../types'

export function useAutoForm(
  schema: ZodObject<ZodRawShape>,
  modelValue: Ref<Record<string, unknown>>,
  emit: (event: 'update:modelValue', value: Record<string, unknown>) => void,
  validateOn: Ref<'blur' | 'input' | 'submit'>,
  layout: Ref<AutoFormLayout | undefined>,
  breakpointsOverride: Ref<Partial<BreakpointMap> | undefined>,
) {
  const errors = reactive<Record<string, string>>({})

  const breakpoints = computed<BreakpointMap>(() => ({
    ...DEFAULT_BREAKPOINTS,
    ...breakpointsOverride.value,
  }))

  const schemaKeys = computed<string[]>(() => Object.keys(schema.shape))

  const resolvedLayout = computed<LayoutGrid>(() => {
    const l = layout.value
    if (!l) {
      return schemaKeys.value.map((key: string) => [key])
    }
    if (isExplicitLayout(l)) {
      return l.default
    }
    if (isShorthandLayout(l)) {
      const cols = l.default
      const keys = schemaKeys.value
      const rows: LayoutGrid = []
      for (let i = 0; i < keys.length; i += cols) {
        rows.push(keys.slice(i, i + cols))
      }
      return rows
    }
    return schemaKeys.value.map((key: string) => [key])
  })

  function validateField(key: string, value: unknown): string | undefined {
    const shape = schema.shape
    if (!shape[key]) return undefined
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

  function onFieldInput(key: string, value: unknown) {
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
      const msg = validateField(key, modelValue.value[key])
      if (msg) {
        errors[key] = msg
      } else {
        delete errors[key]
      }
    }
  }

  function getBreakpointLayouts(): Array<{ minWidth: number; grid: LayoutGrid; key: string }> {
    const l = layout.value
    if (!l) return []

    const bps = breakpoints.value
    const result: Array<{ minWidth: number; grid: LayoutGrid; key: string }> = []

    if (isExplicitLayout(l)) {
      const bpKeys = Object.keys(l).filter((k) => k !== 'default') as Array<keyof typeof l>
      for (const bpKey of bpKeys) {
        const minWidth = bps[bpKey as keyof BreakpointMap]
        const grid = l[bpKey as keyof typeof l] as LayoutGrid
        if (minWidth && grid) {
          result.push({ minWidth, grid, key: bpKey })
        }
      }
    } else if (isShorthandLayout(l)) {
      const bpKeys = Object.keys(l).filter((k) => k !== 'default') as Array<keyof typeof l>
      for (const bpKey of bpKeys) {
        const minWidth = bps[bpKey as keyof BreakpointMap]
        const cols = l[bpKey as keyof typeof l] as number
        if (minWidth && cols) {
          const keys = schemaKeys.value
          const rows: LayoutGrid = []
          for (let i = 0; i < keys.length; i += cols) {
            rows.push(keys.slice(i, i + cols))
          }
          result.push({ minWidth, grid: rows, key: bpKey })
        }
      }
    }

    return result.sort((a, b) => a.minWidth - b.minWidth)
  }

  return {
    errors,
    resolvedLayout,
    schemaKeys,
    onFieldInput,
    onFieldBlur,
    validateAll,
    getBreakpointLayouts,
  }
}
