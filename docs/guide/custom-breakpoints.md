# Custom Breakpoints

Default breakpoints are Tailwind-compatible. Override per form with the `breakpoints` prop:

| Key   | Default min-width |
| ----- | ----------------- |
| `sm`  | 640px             |
| `md`  | 768px             |
| `lg`  | 1024px            |
| `xl`  | 1280px            |
| `2xl` | 1536px            |

## Custom Breakpoint Example

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

## Partial Override

You only need to specify the breakpoints you want to change — others fall back to defaults:

```vue
<AutoForm
  :layout="{ default: 1, md: 2, lg: 3 }"
  :breakpoints="{ lg: 1200 }"  // only override lg, others use defaults
/>
```
