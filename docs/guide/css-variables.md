# CSS Variables

Control spacing without touching component internals:

```css
/* In your global CSS or scoped to a wrapper */
.autoform {
  --autoform-gap: 1rem; /* column gap between fields  */
  --autoform-row-gap: 1rem; /* row gap between field rows */
}
```

## Available Variables

| Variable            | Default | Description                  |
| ------------------- | ------- | ---------------------------- |
| `--autoform-gap`    | `1rem`  | Column gap between fields    |
| `--autoform-row-gap` | `1rem`  | Row gap between field rows   |
