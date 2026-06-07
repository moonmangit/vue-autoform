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

## Minimal Example

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

## FieldConfig Shape

```ts
type FieldConfig = {
  component: Component;
  // plain object OR a getter function (for reactive/async values)
  props?: Record<string, unknown> | (() => Record<string, unknown>);
};
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
