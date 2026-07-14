import type { Component } from 'vue'

export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type BreakpointMap = Record<BreakpointKey, number>

export const DEFAULT_BREAKPOINTS: BreakpointMap = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export interface FieldContext {
  fieldKey: string
  value: unknown
  error: string | undefined
}

export interface FieldConfig {
  component: Component
  props?: Record<string, unknown> | ((ctx: FieldContext) => Record<string, unknown>)
}

/**
 * A field can be configured either with a full FieldConfig object or just
 * a plain component. In the shorthand form the component receives the
 * standard modelValue / error props and no extra props.
 */
export type FieldDefinition = Component | FieldConfig

export interface LayoutItem {
  key: string
  colSpan?: number
}

export type LayoutRow = (string | LayoutItem)[]

export type LayoutGrid = LayoutRow[]

export type ShorthandLayout = { default: number } & Partial<Record<BreakpointKey, number>>

export type ExplicitLayout = { default: LayoutGrid } & Partial<Record<BreakpointKey, LayoutGrid>>

export type AutoFormLayout = ShorthandLayout | ExplicitLayout

export function isShorthandLayout(layout: AutoFormLayout): layout is ShorthandLayout {
  return typeof layout.default === 'number'
}

export function isExplicitLayout(layout: AutoFormLayout): layout is ExplicitLayout {
  return Array.isArray(layout.default)
}

export function isFieldConfig(def: FieldDefinition | undefined): def is FieldConfig {
  return typeof def === 'object' && def !== null && 'component' in def
}
