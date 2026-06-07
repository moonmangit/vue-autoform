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
import "@moonmangit/vue-autoform/dist/style.css";
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
type FieldConfig = {
  component: Component; // your Vue component
  props?: Record<string, unknown>; // extra props passed through
};
```

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

Control exactly which fields appear in each row at each breakpoint. Each inner array is a row; each string is a schema key.

```ts
const layout = {
  // Mobile: one field per row
  default: [["firstName"], ["lastName"], ["email"], ["role"]],
  // Tablet: 2-col rows
  md: [
    ["firstName", "lastName"],
    ["email", "role"],
  ],
  // Desktop: everything in one row
  lg: [["firstName", "lastName", "email", "role"]],
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

## Props Reference

| Prop          | Type                                | Default           | Description                                      |
| ------------- | ----------------------------------- | ----------------- | ------------------------------------------------ |
| `schema`      | `ZodObject`                         | **required**      | Zod object schema defining fields and validation |
| `fields`      | `Record<string, FieldConfig>`       | **required**      | Map of field key → component + props             |
| `modelValue`  | `Record<string, unknown>`           | **required**      | Form data object, bound with `v-model`           |
| `layout`      | `ShorthandLayout \| ExplicitLayout` | `undefined`       | Responsive grid layout config                    |
| `validateOn`  | `'blur' \| 'input' \| 'submit'`     | `'blur'`          | When to run per-field validation                 |
| `breakpoints` | `Partial<BreakpointMap>`            | Tailwind defaults | Custom breakpoint widths in px                   |

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
