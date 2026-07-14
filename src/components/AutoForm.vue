<template>
  <div class="autoform" :data-autoform-id="formId">
    <div class="autoform-flat-grid">
      <div
        v-for="fieldKey in schemaKeys"
        :key="fieldKey"
        class="autoform-cell"
        :data-field-key="isExplicit ? fieldKey : undefined"
      >
        <template v-if="getUserFieldConfig(fieldKey)">
          <component
            :is="getUserFieldConfig(fieldKey)?.component"
            v-bind="getFieldProps(fieldKey)"
            @update:modelValue="(val: unknown) => onFieldInput(fieldKey, val)"
            @blur="() => onFieldBlur(fieldKey)"
          />
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
            <DefaultInput
              :modelValue="modelValue[fieldKey]"
              :error="errors[fieldKey]"
              @update:modelValue="(val: unknown) => onFieldInput(fieldKey, val)"
              @blur="() => onFieldBlur(fieldKey)"
            />
          </slot>
        </template>
        <slot name="error" :fieldKey="fieldKey" :error="errors[fieldKey]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import type { ZodObject, ZodRawShape } from "zod";
import { useAutoForm } from "../composables/useAutoForm";
import { useStyleInjector } from "../composables/useStyleInjector";
import DefaultInput from "./DefaultInput.vue";
import type {
  AutoFormLayout,
  BreakpointMap,
  FieldConfig,
  FieldDefinition,
  LayoutGrid,
  LayoutItem,
} from "../types";
import {
  isExplicitLayout,
  isFieldConfig,
  isShorthandLayout,
  DEFAULT_BREAKPOINTS,
} from "../types";

const props = withDefaults(
  defineProps<{
    schema: ZodObject<ZodRawShape>;
    layout?: AutoFormLayout;
    fields?: Record<string, FieldDefinition>;
    modelValue: Record<string, unknown>;
    validateOn?: "blur" | "input" | "submit";
    breakpoints?: Partial<BreakpointMap>;
  }>(),
  {
    validateOn: "blur",
    fields: () => ({}),
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

defineExpose({ validateAll, errors });

const isExplicit = computed(() =>
  props.layout ? isExplicitLayout(props.layout) : false,
);

function getUserFieldConfig(fieldKey: string): FieldConfig | undefined {
  const raw = props.fields?.[fieldKey];
  if (!raw) return undefined;
  return isFieldConfig(raw) ? raw : { component: raw };
}

function getFieldProps(fieldKey: string): Record<string, unknown> {
  const value = props.modelValue[fieldKey];
  const error = errors[fieldKey];
  const cfg = getUserFieldConfig(fieldKey);
  const base = { modelValue: value, error };
  if (!cfg?.props) return base;
  const extra =
    typeof cfg.props === "function"
      ? cfg.props({ fieldKey, value, error })
      : cfg.props;
  return { ...extra, ...base };
}

const breakpoints = computed(() => ({
  ...DEFAULT_BREAKPOINTS,
  ...props.breakpoints,
}));

const mediaQueryCss = computed<string>(() => {
  if (!props.layout) return "";

  const bps = breakpoints.value;
  const id = formId.value;
  const lines: string[] = [];

  if (isShorthandLayout(props.layout)) {
    const layout = props.layout;
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

    const itemKey = (item: string | LayoutItem): string =>
      typeof item === "string" ? item : item.key;

    const itemSpan = (item: string | LayoutItem): number =>
      typeof item === "string" ? 1 : (item.colSpan ?? 1);

    const gridToCss = (grid: LayoutGrid, wrap?: string): string => {
      const maxCols = Math.max(
        0,
        ...grid.map((row) =>
          row.reduce((sum, item) => sum + itemSpan(item), 0),
        ),
      );

      if (maxCols === 0) return "";

      const fieldRules: string[] = [];
      const visibleKeys = new Set<string>();
      const areaRows: string[] = [];

      for (const row of grid) {
        const tokens: string[] = [];
        let colCount = 0;
        for (const item of row) {
          const key = itemKey(item);
          const span = itemSpan(item);
          visibleKeys.add(key);
          for (let i = 0; i < span; i++) {
            tokens.push(key);
            colCount++;
          }
        }
        while (colCount < maxCols) {
          tokens.push(".");
          colCount++;
        }
        areaRows.push(`"${tokens.join(" ")}"`);
      }

      fieldRules.push(
        `[data-autoform-id="${id}"] .autoform-flat-grid {`,
        `  grid-template-columns: repeat(${maxCols}, minmax(0, 1fr));`,
        `  grid-template-areas: ${areaRows.join(" ")};`,
        `}`,
      );

      for (const key of schemaKeys.value) {
        if (!visibleKeys.has(key)) {
          fieldRules.push(
            `[data-autoform-id="${id}"] [data-field-key="${key}"] { display: none; }`,
          );
        }
      }

      for (const key of visibleKeys) {
        fieldRules.push(
          `[data-autoform-id="${id}"] [data-field-key="${key}"] { display: block; grid-area: ${key}; }`,
        );
      }

      if (wrap) {
        return [
          `@media (min-width: ${wrap}px) {`,
          ...fieldRules.map((r) => `  ${r}`),
          `}`,
        ].join("\n");
      }
      return fieldRules.join("\n");
    };

    lines.push(gridToCss(layout.default));

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
        const css = gridToCss(grid, String(minWidth));
        if (css) lines.push(css);
      }
    }
  }

  return lines.join("\n");
});

useStyleInjector(formId, mediaQueryCss);
</script>

<style scoped>
.autoform {
  width: 100%;
}

.autoform-flat-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  grid-auto-rows: min-content;
  column-gap: var(--autoform-gap, 1rem);
  row-gap: var(--autoform-row-gap, 1rem);
  width: 100%;
}

.autoform-flat-grid .autoform-cell {
  min-width: 0;
}
</style>
