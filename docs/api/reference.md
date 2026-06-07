# Props Reference

## AutoForm Props

| Prop          | Type                                | Default           | Description                                      |
| ------------- | ----------------------------------- | ----------------- | ------------------------------------------------ |
| `schema`      | `ZodObject`                         | **required**      | Zod object schema defining fields and validation |
| `fields`      | `Record<string, FieldConfig>`       | **required**      | Map of field key → component + props             |
| `modelValue`  | `Record<string, unknown>`           | **required**      | Form data object, bound with `v-model`           |
| `layout`      | `ShorthandLayout \| ExplicitLayout` | `undefined`       | Responsive grid layout config                    |
| `validateOn`  | `'blur' \| 'input' \| 'submit'`     | `'blur'`          | When to run per-field validation                 |
| `breakpoints` | `Partial<BreakpointMap>`            | Tailwind defaults | Custom breakpoint widths in px                   |

## Exposed Methods (via template ref)

| Method          | Returns                               | Description                                   |
| --------------- | ------------------------------------- | --------------------------------------------- |
| `validateAll()` | `boolean`                             | Validates all fields; returns `true` if valid |
| `errors`        | `Record<string, string \| undefined>` | Reactive map of current field errors          |

## Types

### FieldConfig

```ts
type FieldConfig = {
  component: Component;
  props?: Record<string, unknown> | (() => Record<string, unknown>);
};
```

### ShorthandLayout

```ts
type ShorthandLayout = { default: number } & Partial<Record<BreakpointKey, number>>;
```

### ExplicitLayout

```ts
type ExplicitLayout = { default: LayoutGrid } & Partial<Record<BreakpointKey, LayoutGrid>>;
```

### BreakpointMap

```ts
type BreakpointMap = Record<BreakpointKey, number>;
```

Default breakpoints:

| Key   | Value  |
| ----- | ------ |
| `sm`  | 640px  |
| `md`  | 768px  |
| `lg`  | 1024px |
| `xl`  | 1280px |
| `2xl` | 1536px |
