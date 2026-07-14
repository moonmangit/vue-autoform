# @moonmangit/vue-autoform

[![npm version](https://img.shields.io/npm/v/@moonmangit/vue-autoform)](https://www.npmjs.com/package/@moonmangit/vue-autoform)
[![license](https://img.shields.io/npm/l/@moonmangit/vue-autoform)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/vue-3.x-42b883)](https://vuejs.org)
[![Zod](https://img.shields.io/badge/zod-3.x-3068B7)](https://zod.dev)

**Headless** Vue 3 form library that auto-renders fields from a Zod schema with responsive CSS grid layout and fully customisable field components. You own the UI — the library owns the wiring.

---

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Quick Start](#quick-start)
- [Field Components](#field-components)
- [Layout](#layout)
  - [No Layout](#no-layout-single-column)
  - [Shorthand Layout](#shorthand-layout)
  - [Explicit Layout](#explicit-layout)
- [Validation](#validation)
- [Submit Handling](#submit-handling)
- [Custom Error Rendering](#custom-error-rendering)
- [Custom Breakpoints](#custom-breakpoints)
- [CSS Variables](#css-variables)
- [Props Reference](#props-reference)
- [Development](#development)

---

## Features

|                            |                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| 🧩 **Schema-driven**       | Define fields once in Zod — validation rules, types, and error messages come free        |
| 🎨 **Headless**            | No styles imposed. Bring your own components, any UI library                             |
| 📐 **Responsive grid**     | Shorthand (`{ default: 1, md: 2, lg: 3 }`) or explicit per-breakpoint row/column layouts |
| ✅ **Flexible validation** | Per-field on `blur`, live on `input`, or all-at-once on `submit`                         |
| 🔑 **Submit control**      | Expose `validateAll()` via template ref for full submit-flow control                     |
| 🪝 **Error slot**          | Override error rendering globally or per-field via scoped slots                          |
| 🔷 **TypeScript-first**    | Full type inference on schema keys, field configs, and layout                            |

---

## Install

```bash
# pnpm
pnpm add @moonmangit/vue-autoform zod@^3

# npm
npm install @moonmangit/vue-autoform zod@^3

# yarn
yarn add @moonmangit/vue-autoform zod@^3
```

> **Note:** `vue` and `zod` are peer dependencies — install them in your own project.  
> zod v4 is not yet supported; pin to `zod@^3`.

---

## Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "@moonmangit/vue-autoform";
import TextInput from "./components/TextInput.vue";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
});

const fields = {
  email: { component: TextInput, props: { label: "Email", type: "email" } },
  password: {
    component: TextInput,
    props: { label: "Password", type: "password" },
  },
};

const formData = ref({ email: "", password: "" });
</script>

<template>
  <AutoForm
    v-model="formData"
    :schema="schema"
    :fields="fields"
    validate-on="blur"
  />
</template>
```

---

## Field Components

`AutoForm` is **headless** — you provide the components that render each field. Every field component receives these props automatically:

| Prop         | Type                  | Description                                   |
| ------------ | --------------------- | --------------------------------------------- |
| `modelValue` | `unknown`             | Current field value (bind with `:value`)      |
| `error`      | `string \| undefined` | Zod error message for this field              |
| `...props`   | —                     | Any extra props from your `FieldConfig.props` |

It must emit:

- `update:modelValue` — on value change
- `blur` — when the field loses focus (for blur validation)

### Minimal example

```vue
<!-- components/TextInput.vue -->
<script setup lang="ts">
defineProps<{
  modelValue?: string;
  error?: string;
  label?: string;
  type?: string;
}>();
defineEmits<{ (e: "update:modelValue", v: string): void; (e: "blur"): void }>();
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      @blur="$emit('blur')"
      :class="{ 'is-error': error }"
    />
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>
```

### FieldConfig shape

```ts
type FieldContext = {
  fieldKey: string;
  value: unknown;
  error: string | undefined;
};

type FieldConfig = {
  component: Component;
  props?: Record<string, unknown> | ((ctx: FieldContext) => Record<string, unknown>);
};

type FieldDefinition = Component | FieldConfig;
```

`fields` is a map of schema key → `Component` or `FieldConfig`:

```ts
const fields = {
  // shorthand — just the component
  firstName: TextInput,

  // full config with static props
  email: { component: TextInput, props: { label: "Email", type: "email" } },

  // props as a getter that receives the field context
  role: {
    component: SelectInput,
    props: ({ error }) => ({
      label: "Role",
      placeholder: error ? "Fix the error first" : "Select a role",
      options: roleOptions,
    }),
  },
};
```

### Async options (props as a getter function)

When your field needs options loaded from a server, pass `props` as a **getter function** instead of a plain object. The function is called at render time so reactive refs inside it stay live — no need to rebuild the `fields` object when data arrives.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "@moonmangit/vue-autoform";
import SelectInput from "./components/SelectInput.vue";
import TextInput from "./components/TextInput.vue";

const loading = ref(false);
const options = ref<{ value: string; label: string }[]>([]);

// Fetch however you like — the library doesn't care
async function loadOptions() {
  loading.value = true;
  const res = await fetch("/api/frameworks");
  options.value = await res.json();
  loading.value = false;
}
loadOptions();

const schema = z.object({
  name: z.string().min(1),
  framework: z.string().min(1, "Please select a framework"),
  // array-of-object field — Zod validates each item's shape
  tags: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
});

const fields = {
  name: { component: TextInput, props: { label: "Name" } },

  framework: {
    component: SelectInput,
    // getter — reads `loading` and `options` reactively at render time
    props: () => ({
      label: "Framework",
      disabled: loading.value,
      options: options.value,
    }),
  },

  tags: {
    component: SelectInput,
    props: () => ({
      label: "Tags",
      disabled: loading.value,
      options: options.value,
    }),
  },
};

const formData = ref({ name: "", framework: "", tags: [] });
</script>

<template>
  <AutoForm v-model="formData" :schema="schema" :fields="fields" />
</template>
```

### Complex custom input

Here is a multi-select that emits an array of `{ value, label }` objects. It is useful when the schema expects `z.array(z.object({ ... }))`.

```vue
<!-- components/MultiSelectInput.vue -->
<script setup lang="ts">
type Option = { value: string; label: string };

const props = withDefaults(
  defineProps<{
    modelValue?: Option[];
    error?: string;
    label?: string;
    disabled?: boolean;
    options: Option[];
  }>(),
  { modelValue: () => [] },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: Option[]): void;
  (e: "blur"): void;
}>();

function isSelected(opt: Option): boolean {
  return (props.modelValue ?? []).some((o) => o.value === opt.value);
}

function toggle(opt: Option) {
  const current = props.modelValue ?? [];
  const exists = current.some((o) => o.value === opt.value);
  const next = exists
    ? current.filter((o) => o.value !== opt.value)
    : [...current, opt];
  emit("update:modelValue", next);
  emit("blur");
}
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="multi-select" :class="{ 'multi-select--error': !!error }">
      <div v-if="!options.length" class="multi-select__empty">
        No options available
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
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "@moonmangit/vue-autoform";
import MultiSelectInput from "./components/MultiSelectInput.vue";

const schema = z.object({
  tags: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Select at least one tag"),
});

const fields = {
  tags: {
    component: MultiSelectInput,
    props: () => ({
      label: "Tags",
      options: [
        { value: "vue", label: "Vue" },
        { value: "react", label: "React" },
        { value: "svelte", label: "Svelte" },
      ],
    }),
  },
};

const formData = ref({ tags: [] });
</script>

<template>
  <AutoForm v-model="formData" :schema="schema" :fields="fields" />
</template>
```

**Key points:**

- Your component receives `disabled` and `options` as normal props — the library passes them through unchanged
- `tags` value is whatever your component emits via `update:modelValue` — pass an array of objects, receive an array of objects
- Zod validates the array contents exactly as defined in the schema
- The library has **no opinion on how you fetch** — use `fetch`, Axios, TanStack Query, Pinia, anything

---

## Layout

The `layout` prop is **optional**. Without it, fields render in schema-key order in a single column.

### No Layout (single column)

```vue
<AutoForm v-model="formData" :schema="schema" :fields="fields" />
```

### Shorthand Layout

Pass column counts per breakpoint. Fields auto-flow left-to-right, top-to-bottom.

```ts
const layout = {
  default: 1, // mobile: 1 column
  md: 2, // ≥ 768px: 2 columns
  lg: 3, // ≥ 1024px: 3 columns
};
```

```vue
<AutoForm
  v-model="formData"
  :schema="schema"
  :fields="fields"
  :layout="layout"
/>
```

### Explicit Layout

Control exactly which fields appear in each row at each breakpoint. Each inner array is a row; each item is either a schema key string or an object with `key` and optional `colSpan`.

```ts
const layout = {
  // Mobile: one field per row
  default: [["firstName"], ["lastName"], ["email"], ["role"]],
  // Tablet: 2-col rows
  md: [
    ["firstName", "lastName"],
    ["email", "role"],
  ],
  // Desktop: first three fields in one row, role spans the full width below
  lg: [
    ["firstName", "lastName", "email"],
    [{ key: "role", colSpan: 3 }],
  ],
};
```

> Fields not listed in a breakpoint layout are **hidden** at that breakpoint. Use this to progressively reveal complexity.

---

## Validation

Three modes, set once per form via `validate-on`:

```vue
<!-- Per-field on focus-out (default) -->
<AutoForm validate-on="blur" ... />

<!-- Live — re-validates on every keystroke -->
<AutoForm validate-on="input" ... />

<!-- Deferred — errors only shown after submit -->
<AutoForm validate-on="submit" ... />
```

---

## Submit Handling

Use a template `ref` to call `validateAll()` imperatively. It validates every field and surfaces errors, returning `true` if the form is valid.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AutoForm } from "@moonmangit/vue-autoform";

const formRef = ref<InstanceType<typeof AutoForm> | null>(null);
const submitResult = ref<boolean | null>(null);

function handleSubmit() {
  submitResult.value = formRef.value?.validateAll() ?? false;

  if (submitResult.value) {
    // ✅ form is valid — send to API
  }
}
</script>

<template>
  <AutoForm
    ref="formRef"
    v-model="formData"
    :schema="schema"
    :fields="fields"
    validate-on="submit"
  />
  <button @click="handleSubmit">Submit</button>
  <p v-if="submitResult === true">✓ Submitted!</p>
  <p v-if="submitResult === false">✗ Fix the errors above</p>
</template>
```

---

## Custom Error Rendering

By default, errors are passed as a prop to your field component. You can also override rendering globally using the `#error` scoped slot:

```vue
<AutoForm v-model="formData" :schema="schema" :fields="fields">
  <template #error="{ fieldKey, error }">
    <p v-if="error" class="my-custom-error">
      ⚠ {{ error }}
    </p>
  </template>
</AutoForm>
```

The slot receives:
| Slot prop | Type | Description |
|---|---|---|
| `fieldKey` | `string` | The schema key of the field |
| `error` | `string \| undefined` | Current validation error |

---

## Custom Breakpoints

Default breakpoints are Tailwind-compatible. Override per form with the `breakpoints` prop:

| Key   | Default min-width |
| ----- | ----------------- |
| `sm`  | 640px             |
| `md`  | 768px             |
| `lg`  | 1024px            |
| `xl`  | 1280px            |
| `2xl` | 1536px            |

```vue
<!-- Use a custom "tablet" breakpoint at 900px -->
<AutoForm
  v-model="formData"
  :schema="schema"
  :fields="fields"
  :layout="{ default: 1, tablet: 2 }"
  :breakpoints="{ tablet: 900 }"
/>
```

---

## CSS Variables

Control spacing without touching component internals:

```css
/* In your global CSS or scoped to a wrapper */
.autoform {
  --autoform-gap: 1rem; /* column gap between fields  */
  --autoform-row-gap: 1rem; /* row gap between field rows */
}
```

---

## Styling

`AutoForm` is headless. It auto-injects only the minimal CSS Grid layout styles it needs to position fields; it does **not** style your inputs. No manual CSS import is required.

If you leave a schema key out of `fields`, the library renders a bare `<input class="autoform-default-input">` for that key so the form is still usable. You can style `.autoform-default-input` yourself, or map every key to your own component.

### Customizing Styles

You have two options:

**1. Override with CSS variables** (recommended)
```css
.autoform {
  --autoform-gap: 1.5rem;
  --autoform-row-gap: 1.5rem;
}
```

**2. Completely custom styling**
If you want full control over the form's appearance, you can:
- Write your own field components with custom styles
- Override the auto-injected layout styles with higher specificity
- Use CSS modules or scoped styles in your field components

---

## Props Reference

| Prop          | Type                               | Default           | Description                                      |
| ------------- | ---------------------------------- | ----------------- | ------------------------------------------------ |
| `schema`      | `ZodObject`                        | **required**      | Zod object schema defining fields and validation |
| `fields`      | `Record<string, FieldDefinition>`  | `{}`              | Map of field key → component or FieldConfig      |
| `modelValue`  | `Record<string, unknown>`          | **required**      | Form data object, bound with `v-model`           |
| `layout`      | `ShorthandLayout \| ExplicitLayout` | `undefined`       | Responsive grid layout config                    |
| `validateOn`  | `'blur' \| 'input' \| 'submit'`    | `'blur'`          | When to run per-field validation                 |
| `breakpoints` | `Partial<BreakpointMap>`           | Tailwind defaults | Custom breakpoint widths in px                   |

### Exposed methods (via template ref)

| Method          | Returns                               | Description                                   |
| --------------- | ------------------------------------- | --------------------------------------------- |
| `validateAll()` | `boolean`                             | Validates all fields; returns `true` if valid |
| `errors`        | `Record<string, string \| undefined>` | Reactive map of current field errors          |

---

## Development

```bash
# Install dependencies
pnpm install

# Run interactive playground (http://localhost:5174)
pnpm playground

# Build library for distribution
pnpm build

# Type-check library source only
pnpm type-check

# Lint
pnpm lint
pnpm lint:fix
```

The `playground/` directory contains a full demo app with 5 examples covering every feature. It uses a Vite path alias to import the library source directly — no rebuild needed during development.

---

## License

MIT © [moonmangit](https://github.com/moonmangit)
