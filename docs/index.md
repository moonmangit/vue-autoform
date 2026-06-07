---
layout: home

hero:
  name: VueAutoform
  text: Headless Vue 3 form library
  tagline: Auto-render fields from Zod schemas with responsive grid layout
  image:
    src: /logo.svg
    alt: VueAutoform Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/moonmangit/vue-autoform

features:
  - icon: 🧩
    title: Schema-driven
    details: Define fields once in Zod — validation rules, types, and error messages come free
  - icon: 🎨
    title: Headless
    details: No styles imposed. Bring your own components, any UI library
  - icon: 📐
    title: Responsive grid
    details: Shorthand or explicit per-breakpoint row/column layouts
  - icon: ✅
    title: Flexible validation
    details: Per-field on blur, live on input, or all-at-once on submit
  - icon: 🔑
    title: Submit control
    details: Expose validateAll() via template ref for full submit-flow control
  - icon: 🔷
    title: TypeScript-first
    details: Full type inference on schema keys, field configs, and layout
---

## Quick Install

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

Check out the [Guide](/guide/getting-started) for more details, or explore [Examples](/examples/) to see interactive demos.
