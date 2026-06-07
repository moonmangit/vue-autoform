# vue-autoform

Headless Vue 3 auto-rendering form library with Zod schema validation, responsive CSS grid layout, and fully customisable field components.

## Features

- **Schema-driven** — define fields with Zod; validation is automatic
- **Headless** — bring your own UI components; no styles imposed
- **Responsive grid** — shorthand col-counts or explicit per-breakpoint layouts, CSS-only
- **Flexible validation** — run on `blur`, `input`, or `submit`
- **Full TypeScript support**

## Install

```bash
pnpm add vue-autoform zod
# or
npm install vue-autoform zod
```

> `vue` and `zod` are peer dependencies and must be installed in your project.

---

## Basic Usage

```vue
<template>
  <AutoForm
    :schema="schema"
    :fields="fields"
    v-model="formData"
    validate-on="blur"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { AutoForm } from 'vue-autoform'
import MyTextInput from './MyTextInput.vue'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

const fields = {
  email: {
    component: MyTextInput,
    props: { label: 'Email', type: 'email' },
  },
  password: {
    component: MyTextInput,
    props: { label: 'Password', type: 'password' },
  },
}

const formData = reactive({ email: '', password: '' })
</script>
```

---

## Field Component Contract

Your custom field components receive these props automatically:

| Prop | Type | Description |
|---|---|---|
| `modelValue` | `unknown` | Current field value |
| `error` | `string \| undefined` | Zod validation error message |
| `...props` | — | Any extra props from `FieldConfig.props` |

They should emit `update:modelValue` for v-model binding and `blur` for blur-based validation.

```vue
<!-- Example field component -->
<template>
  <div>
    <input :value="modelValue" @input="emit('update:modelValue', $event.target.value)" @blur="emit('blur')" />
    <span v-if="error">{{ error }}</span>
  </div>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string; error?: string; label?: string }>()
const emit = defineEmits(['update:modelValue', 'blur'])
</script>
```

---

## Layout

`layout` is optional. Omitting it renders all fields in a single column in schema-key order.

### Shorthand — column count per breakpoint

```ts
const layout = {
  default: 1,   // 1 column on mobile
  md: 2,        // 2 columns at ≥768px
  lg: 3,        // 3 columns at ≥1024px
}
```

Fields auto-flow into columns following schema-key order.

### Explicit — full grid per breakpoint

```ts
const layout = {
  default: [
    ['firstName'],
    ['lastName'],
    ['email'],
  ],
  md: [
    ['firstName', 'lastName'],
    ['email'],
  ],
}
```

Each inner array is a row; each string is a field key matching the Zod schema.

---

## Breakpoints

Default breakpoints (Tailwind-compatible):

| Key | Min-width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Override per form with the `breakpoints` prop:

```vue
<AutoForm
  :schema="schema"
  :layout="{ default: 1, tablet: 2 }"
  :breakpoints="{ tablet: 900 }"
  :fields="fields"
  v-model="formData"
/>
```

---

## Validation

```vue
<!-- Validate on blur (default) -->
<AutoForm validate-on="blur" ... />

<!-- Validate on every keystroke -->
<AutoForm validate-on="input" ... />

<!-- Validate only on submit -->
<AutoForm ref="form" validate-on="submit" ... />
```

For `submit` mode, call `validateAll()` via template ref:

```ts
const form = ref()
function handleSubmit() {
  const valid = form.value.validateAll() // returns true/false
}
```

---

## Error Slot

Use the `#error` scoped slot for custom error rendering:

```vue
<AutoForm :schema="schema" :fields="fields" v-model="formData">
  <template #error="{ fieldKey, error }">
    <p v-if="error" class="my-error">{{ fieldKey }}: {{ error }}</p>
  </template>
</AutoForm>
```

---

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `schema` | `ZodObject` | required | Zod object schema |
| `fields` | `Record<string, FieldConfig>` | required | Field component map |
| `modelValue` | `Record<string, unknown>` | required | Form data (`v-model`) |
| `layout` | `AutoFormLayout` | undefined | Grid layout config |
| `validateOn` | `'blur' \| 'input' \| 'submit'` | `'blur'` | Validation trigger |
| `breakpoints` | `Partial<BreakpointMap>` | Tailwind defaults | Custom breakpoint widths |

---

## CSS Variables

Customise spacing without overriding component styles:

```css
.autoform {
  --autoform-gap: 1rem;      /* gap between fields in a row */
  --autoform-row-gap: 1rem;  /* gap between rows */
}
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run playground (port 5174)
pnpm playground

# Build library
pnpm build

# Type check
pnpm type-check
```
