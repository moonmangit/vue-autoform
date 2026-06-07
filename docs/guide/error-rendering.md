# Custom Error Rendering

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

## Slot Props

| Slot prop | Type | Description |
|---|---|---|
| `fieldKey` | `string` | The schema key of the field |
| `error` | `string \| undefined` | Current validation error |
