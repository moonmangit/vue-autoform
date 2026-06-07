# Getting Started

## Installation

::: code-group

```bash [pnpm]
pnpm add @moonmangit/vue-autoform zod@^3
```

```bash [npm]
npm install @moonmangit/vue-autoform zod@^3
```

```bash [yarn]
yarn add @moonmangit/vue-autoform zod@^3
```

:::

> **Note:** `vue` and `zod` are peer dependencies — install them in your own project. zod v4 is not yet supported; pin to `zod@^3`.

## Basic Usage

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

## What's Next

- [Field Components](./field-components.md) — Learn how to build your own input components
- [Layout](./layout.md) — Configure responsive grid layouts
- [Validation](./validation.md) — Control when validation runs
