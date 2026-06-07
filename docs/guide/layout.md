# Layout

The `layout` prop is **optional**. Without it, fields render in schema-key order in a single column.

## No Layout (Single Column)

```vue
<AutoForm v-model="formData" :schema="schema" :fields="fields" />
```

## Shorthand Layout

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

## Explicit Layout

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
