<template>
  <div class="autoform" :data-autoform-id="formId">
    <component :is="'style'" v-if="mediaQueryCss">{{
      mediaQueryCss
    }}</component>

    <!-- Flat grid: CSS handles column count (shorthand) or per-field position (explicit/none) -->
    <div class="autoform-flat-grid">
      <div
        v-for="fieldKey in schemaKeys"
        :key="fieldKey"
        class="autoform-cell"
        :data-field-key="isExplicit ? fieldKey : undefined"
      >
        <template v-if="fields[fieldKey]">
          <component
            :is="fields[fieldKey].component"
            :modelValue="modelValue[fieldKey]"
            :error="errors[fieldKey]"
            v-bind="resolveProps(fieldKey)"
            @update:modelValue="(val: unknown) => onFieldInput(fieldKey, val)"
            @blur="() => onFieldBlur(fieldKey)"
          />
          <slot name="error" :fieldKey="fieldKey" :error="errors[fieldKey]" />
        </template>
        <template v-else>
          <slot
            :name="`field-${fieldKey}`"
            :fieldKey="fieldKey"
            :value="modelValue[fieldKey]"
            :error="errors[fieldKey]"
            :onUpdate="(val: unknown) => onFieldInput(fieldKey, val)"
            :onBlur="() => onFieldBlur(fieldKey)"
          >
            <input
              class="autoform-default-input"
              :value="String(modelValue[fieldKey] ?? '')"
              @input="
                (e: Event) =>
                  onFieldInput(fieldKey, (e.target as HTMLInputElement).value)
              "
              @blur="() => onFieldBlur(fieldKey)"
            />
          </slot>
          <slot name="error" :fieldKey="fieldKey" :error="errors[fieldKey]" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import type { ZodObject, ZodRawShape } from "zod";
import { useAutoForm } from "../composables/useAutoForm";
import type {
  AutoFormLayout,
  BreakpointMap,
  FieldConfig,
  LayoutGrid,
} from "../types";
import {
  isExplicitLayout,
  isShorthandLayout,
  DEFAULT_BREAKPOINTS,
} from "../types";

const props = withDefaults(
  defineProps<{
    schema: ZodObject<ZodRawShape>;
    layout?: AutoFormLayout;
    fields: Record<string, FieldConfig>;
    modelValue: Record<string, unknown>;
    validateOn?: "blur" | "input" | "submit";
    breakpoints?: Partial<BreakpointMap>;
  }>(),
  {
    validateOn: "blur",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, unknown>): void;
}>();

const formId = ref(`autoform-${Math.random().toString(36).slice(2, 9)}`);

const { errors, schemaKeys, onFieldInput, onFieldBlur, validateAll } =
  useAutoForm(
    props.schema,
    toRef(props, "modelValue"),
    (event, val) => emit(event, val),
    toRef(props, "validateOn"),
  );

const isExplicit = computed(() =>
  props.layout ? isExplicitLayout(props.layout) : true,
);

function resolveProps(fieldKey: string): Record<string, unknown> {
  const cfg = props.fields[fieldKey];
  if (!cfg) return {};
  const p = cfg.props;
  return typeof p === "function" ? p() : (p ?? {});
}

const mediaQueryCss = computed<string>(() => {
  if (!props.layout) return "";

  const bps: BreakpointMap = { ...DEFAULT_BREAKPOINTS, ...props.breakpoints };
  const id = formId.value;
  const lines: string[] = [];

  if (isShorthandLayout(props.layout)) {
    const layout = props.layout;
    // Base columns for the flat grid
    lines.push(
      `[data-autoform-id="${id}"] .autoform-flat-grid {`,
      `  grid-template-columns: repeat(${layout.default}, minmax(0, 1fr));`,
      `}`,
    );
    const bpKeys = Object.keys(layout).filter((k) => k !== "default") as Array<
      keyof typeof layout
    >;
    for (const bpKey of bpKeys) {
      const minWidth = bps[bpKey as keyof BreakpointMap];
      const cols = layout[bpKey as keyof typeof layout] as number;
      if (minWidth && cols) {
        lines.push(
          `@media (min-width: ${minWidth}px) {`,
          `  [data-autoform-id="${id}"] .autoform-flat-grid {`,
          `    grid-template-columns: repeat(${cols}, minmax(0, 1fr));`,
          `  }`,
          `}`,
        );
      }
    }
  } else if (isExplicitLayout(props.layout)) {
    const layout = props.layout;
    // Helper: build CSS rules for a given grid at a given scope (media query or base)
    const gridToCss = (grid: LayoutGrid, wrap?: string): string => {
      const maxCols = Math.max(...grid.map((r: string[]) => r.length));
      const allKeys = schemaKeys.value;
      const keysInGrid = new Set(grid.flat());
      const fieldRules: string[] = [];

      // Set grid column count
      fieldRules.push(
        `[data-autoform-id="${id}"] .autoform-flat-grid { grid-template-columns: repeat(${maxCols}, minmax(0, 1fr)); }`,
      );

      // Hide fields not in this layout
      allKeys.forEach((key: string) => {
        if (!keysInGrid.has(key)) {
          fieldRules.push(
            `[data-autoform-id="${id}"] [data-field-key="${key}"] { display: none; }`,
          );
        }
      });

      // Position each field
      let rowStart = 1;
      grid.forEach((row: string[]) => {
        let colStart = 1;
        row.forEach((key: string) => {
          fieldRules.push(
            `[data-autoform-id="${id}"] [data-field-key="${key}"] { display: block; grid-row: ${rowStart}; grid-column: ${colStart}; }`,
          );
          colStart++;
        });
        rowStart++;
      });

      if (wrap) {
        return [
          `@media (min-width: ${wrap}px) {`,
          ...fieldRules.map((r) => `  ${r}`),
          `}`,
        ].join("\n");
      }
      return fieldRules.join("\n");
    };

    // Default layout base styles
    lines.push(gridToCss(layout.default));

    // Per-breakpoint overrides
    const bpKeys = Object.keys(layout).filter((k) => k !== "default") as Array<
      keyof typeof layout
    >;
    const sortedBpKeys = bpKeys.sort(
      (a, b) =>
        (bps[a as keyof BreakpointMap] ?? 0) -
        (bps[b as keyof BreakpointMap] ?? 0),
    );
    for (const bpKey of sortedBpKeys) {
      const minWidth = bps[bpKey as keyof BreakpointMap];
      const grid = layout[bpKey as keyof typeof layout] as LayoutGrid;
      if (minWidth && grid) {
        lines.push(gridToCss(grid, String(minWidth)));
      }
    }
  }

  return lines.join("\n");
});

defineExpose({ validateAll, errors });
</script>

<style>
.autoform {
  width: 100%;
}

.autoform-flat-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  column-gap: var(--autoform-gap, 1rem);
  row-gap: var(--autoform-row-gap, 1rem);
  width: 100%;
}

.autoform-flat-grid .autoform-cell {
  min-width: 0;
}

.autoform-default-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.autoform-default-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
</style>
