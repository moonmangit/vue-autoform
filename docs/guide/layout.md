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

Control exactly which fields appear in each row at each breakpoint. Each inner array is a row; each item is either a schema key string or an object with `key` and optional `colSpan`.

```ts
const layout = {
  // Mobile: one field per row
  default: [["firstName"], ["lastName"], ["email"], ["role"]],
  // Tablet: 2-col rows
  md: [
    ["firstName", "lastName"],
    ["email", "role"],
  ],
  // Desktop: first three fields in one row, role spans the full width below
  lg: [
    ["firstName", "lastName", "email"],
    [{ key: "role", colSpan: 3 }],
  ],
};
```

> Fields not listed in a breakpoint layout are **hidden** at that breakpoint. Use this to progressively reveal complexity.
