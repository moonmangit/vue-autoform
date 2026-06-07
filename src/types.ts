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

export interface FieldConfig {
  component: Component
  props?: Record<string, unknown> | (() => Record<string, unknown>)
}

export type LayoutRow = string[]

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

export interface FieldRenderInfo {
  key: string
  config: FieldConfig | undefined
  value: unknown
  error: string | undefined
}
