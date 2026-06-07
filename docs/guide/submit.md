# Submit Handling

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

## Exposed Methods

| Method          | Returns                               | Description                                   |
| --------------- | ------------------------------------- | --------------------------------------------- |
| `validateAll()` | `boolean`                             | Validates all fields; returns `true` if valid |
| `errors`        | `Record<string, string \| undefined>` | Reactive map of current field errors          |
