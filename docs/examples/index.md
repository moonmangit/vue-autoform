# Examples

Interactive demos showing all the features of vue-autoform.

## Demo 1 — No Layout (Default Single Column)

`layout` omitted → all fields rendered in schema-key order, 1 column.

<BasicDemo />

## Demo 2 — Shorthand Responsive Layout

`layout: { default: 1, md: 2, lg: 3 }` — resize the window to see column changes.

<ShorthandDemo />

## Demo 3 — Explicit Per-Breakpoint Layout

Different row/column arrangement at each breakpoint.

<ExplicitDemo />

## Demo 4 — Submit Validation

Errors only shown on submit. Uses `ref` to call `validateAll()`.

<SubmitDemo />

## Demo 5 — Job Application Form

Rich Zod schema: string, email, enum, number, boolean, literal. Responsive 1→2 col layout. Blur validation. Submit + success state.

<JobFormDemo />

## Demo 6 — Async Options & Array-of-Object Values

`props` as a getter function — reactive async values (loading state, fetched options) stay live without rebuilding `fields`. The `tags` field stores an array of objects.

<AsyncDemo />
