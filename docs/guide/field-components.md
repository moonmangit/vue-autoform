# Field Components

`AutoForm` is **headless** — you provide the components that render each field. Every field component receives these props automatically:

| Prop         | Type                  | Description                                   |
| ------------ | --------------------- | --------------------------------------------- |
| `modelValue` | `unknown`             | Current field value (bind with `:value`)      |
| `error`      | `string \| undefined` | Zod error message for this field              |
| `...props`   | —                     | Any extra props from your `FieldConfig.props` |

It must emit:

- `update:modelValue` — on value change
- `blur` — when the field loses focus (for blur validation)

## FieldConfig Shape

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

## Simple Custom Input

The simplest field is a text input. It only needs to bind `modelValue`, display the `error`, and emit the two required events.

```vue
<!-- components/TextInput.vue -->
<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
    error?: string;
    label?: string;
    placeholder?: string;
    type?: string;
  }>(),
  { modelValue: "", type: "text" },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "blur"): void;
}>();
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <input
      class="field-input"
      :class="{ 'field-input--error': !!error }"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      @blur="emit('blur')"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>
```

Use it with the component shorthand:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "@moonmangit/vue-autoform";
import TextInput from "./components/TextInput.vue";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

const formData = ref({ name: "" });
</script>

<template>
  <AutoForm v-model="formData" :schema="schema" :fields="{ name: TextInput }" />
</template>
```

## Complex Custom Input

A more advanced component can handle non-string values, options, loading states, or arrays of objects. Here is a multi-select that emits an array of `{ value, label }` objects, useful when the schema expects `z.array(z.object({ ... }))`.

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
    <div
      class="multi-select"
      :class="{ 'multi-select--error': !!error, 'multi-select--disabled': disabled }"
    >
      <div v-if="!options.length" class="multi-select__empty">
        {{ disabled ? "Loading options…" : "No options available" }}
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

Register it with a `FieldConfig`:

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

## Async Options (Props as a Getter Function)

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
    // getter — reads `loading` and `options` reactively at render time
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

**Key points:**

- Your component receives `disabled` and `options` as normal props — the library passes them through unchanged
- `tags` value is whatever your component emits via `update:modelValue` — pass an array of objects, receive an array of objects
- Zod validates the array contents exactly as defined in the schema
- The library has **no opinion on how you fetch** — use `fetch`, Axios, TanStack Query, Pinia, anything
