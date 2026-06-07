# Validation

Three modes, set once per form via `validate-on`:

```vue
<!-- Per-field on focus-out (default) -->
<AutoForm validate-on="blur" ... />

<!-- Live — re-validates on every keystroke -->
<AutoForm validate-on="input" ... />

<!-- Deferred — errors only shown after submit -->
<AutoForm validate-on="submit" ... />
```

## Modes

| Mode      | When validation runs                                    |
| --------- | ------------------------------------------------------- |
| `blur`    | When a field loses focus (default)                      |
| `input`   | On every keystroke (live)                                |
| `submit`  | Only when you call `validateAll()` via template ref     |

## Submit Validation

See [Submit Handling](./submit.md) for how to use `validateAll()` with the `submit` mode.
