<template>
  <div class="playground">
    <header class="header">
      <h1>vue-autoform <span class="badge">playground</span></h1>
      <p>
        Headless Vue 3 form library with Zod validation &amp; responsive grid
        layout
      </p>
    </header>

    <main class="content">
      <!-- Demo 1: No layout (default 1-col) -->
      <section class="demo-card">
        <h2>Demo 1 — No layout (default single column)</h2>
        <p class="demo-desc">
          <code>layout</code> omitted → all fields rendered in schema-key order,
          1 column.
        </p>
        <AutoForm
          v-model="formData1"
          :schema="schema"
          :fields="fieldConfig"
          validate-on="blur"
        />
        <div class="output">
          <strong>Model:</strong>
          <pre>{{ JSON.stringify(formData1, null, 2) }}</pre>
        </div>
      </section>

      <!-- Demo 2: Shorthand responsive layout -->
      <section class="demo-card">
        <h2>Demo 2 — Shorthand responsive layout</h2>
        <p class="demo-desc">
          <code>layout: &#123; default: 1, md: 2, lg: 3 &#125;</code>
          — resize the window to see column changes.
        </p>
        <AutoForm
          v-model="formData2"
          :schema="schema"
          :layout="shorthandLayout"
          :fields="fieldConfig"
          validate-on="input"
        >
          <template #error="{ fieldKey, error }">
            <span v-if="error" class="custom-error">⚠ {{ fieldKey }}: {{ error }}</span>
          </template>
        </AutoForm>
        <div class="output">
          <strong>Model:</strong>
          <pre>{{ JSON.stringify(formData2, null, 2) }}</pre>
        </div>
      </section>

      <!-- Demo 3: Explicit per-breakpoint layout -->
      <section class="demo-card">
        <h2>Demo 3 — Explicit per-breakpoint layout</h2>
        <p class="demo-desc">
          Different row/column arrangement at each breakpoint.
        </p>
        <AutoForm
          v-model="formData3"
          :schema="schema"
          :layout="explicitLayout"
          :fields="fieldConfig"
          validate-on="blur"
        />
        <div class="output">
          <strong>Model:</strong>
          <pre>{{ JSON.stringify(formData3, null, 2) }}</pre>
        </div>
      </section>

      <!-- Demo 4: Submit validation -->
      <section class="demo-card">
        <h2>Demo 4 — Submit validation</h2>
        <p class="demo-desc">
          Errors only shown on submit. Uses <code>ref</code> to call
          <code>validate()</code>.
        </p>
        <AutoForm
          ref="submitForm"
          v-model="formData4"
          :schema="schema"
          :layout="shorthandLayout"
          :fields="fieldConfig"
          validate-on="submit"
        />
        <button class="btn" @click="handleSubmit">Submit &amp; Validate</button>
        <p
          v-if="submitResult !== null"
          :class="submitResult ? 'result-ok' : 'result-err'"
        >
          {{
            submitResult
              ? "✓ Valid! Ready to submit."
              : "✗ Validation failed. Check errors above."
          }}
        </p>
      </section>
      <!-- Demo 5: Complex Job Application -->
      <section class="demo-card demo-card--complex">
        <div class="demo-card-header">
          <h2>Demo 5 — Job Application Form</h2>
          <span class="tag">complex</span>
        </div>
        <p class="demo-desc">
          Rich Zod schema: string, email, url, enum, number, boolean, literal.
          Responsive 1→2→3 col layout. Blur validation. Submit + success state.
        </p>

        <div v-if="jobSubmitted" class="success-banner">
          <div class="success-icon">✓</div>
          <div>
            <strong>Application submitted!</strong>
            <p>
              Thanks {{ (jobFormData as any).fullName }}, we'll be in touch.
            </p>
          </div>
          <button class="btn btn--ghost" @click="resetJobForm">Reset</button>
        </div>

        <template v-else>
          <div class="form-section-label">Personal Information</div>
          <AutoForm
            ref="jobFormRef"
            v-model="jobFormData"
            :schema="jobSchema"
            :layout="jobLayout"
            :fields="jobFields"
            validate-on="blur"
          />

          <div class="form-actions">
            <button class="btn" @click="handleJobSubmit">
              Submit Application
            </button>
            <p v-if="jobSubmitValid === false" class="result-err">
              ✗ Please fix the errors above before submitting.
            </p>
          </div>

          <details class="output output--collapsible">
            <summary><strong>Current model payload</strong></summary>
            <pre>{{ JSON.stringify(jobFormData, null, 2) }}</pre>
          </details>
        </template>
      </section>

      <!-- Demo 6: Async options + array-of-object value -->
      <section class="demo-card">
        <h2>Demo 6 — Async options &amp; array-of-object values</h2>
        <p class="demo-desc">
          <code>props</code> as a getter function — reactive async values
          (loading state, fetched options) stay live without rebuilding
          <code>fields</code>. The <code>tags</code> field stores an array of
          objects.
        </p>

        <div
          style="
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          "
        >
          <button
            class="btn"
            :disabled="asyncLoading"
            @click="fetchAsyncOptions"
          >
            {{ asyncLoading ? "Fetching…" : "Simulate Fetch Options" }}
          </button>
          <span v-if="asyncLoading" style="font-size: 0.8125rem; color: #6b7280">Loading options from server…</span>
          <span
            v-else-if="asyncOptions.length"
            style="font-size: 0.8125rem; color: #16a34a"
          >✓ {{ asyncOptions.length }} options loaded</span>
        </div>

        <AutoForm
          v-model="asyncFormData"
          :schema="asyncSchema"
          :fields="asyncFields"
          :layout="{ default: 1, md: 2 }"
          validate-on="blur"
        />

        <div class="output">
          <strong>Model (note tags is array of objects):</strong>
          <pre>{{ JSON.stringify(asyncFormData, null, 2) }}</pre>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "vue-autoform";
import type { AutoFormLayout } from "vue-autoform";
import TextInput from "./components/TextInput.vue";
import SelectInput from "./components/SelectInput.vue";
import TextareaInput from "./components/TextareaInput.vue";
import CheckboxInput from "./components/CheckboxInput.vue";
import NumberInput from "./components/NumberInput.vue";
import MultiSelectInput from "./components/MultiSelectInput.vue";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Please select a role"),
  bio: z.string().optional(),
});

const fieldConfig = {
  firstName: {
    component: TextInput,
    props: { label: "First Name", placeholder: "John" },
  },
  lastName: {
    component: TextInput,
    props: { label: "Last Name", placeholder: "Doe" },
  },
  email: {
    component: TextInput,
    props: { label: "Email", placeholder: "john@example.com", type: "email" },
  },
  password: {
    component: TextInput,
    props: { label: "Password", placeholder: "••••••••", type: "password" },
  },
  role: {
    component: SelectInput,
    props: {
      label: "Role",
      placeholder: "Select a role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ],
    },
  },
  bio: {
    component: TextInput,
    props: {
      label: "Bio (optional)",
      placeholder: "Tell us about yourself...",
    },
  },
};

const shorthandLayout: AutoFormLayout = {
  default: 1,
  md: 2,
  lg: 3,
};

const explicitLayout: AutoFormLayout = {
  default: [
    ["firstName"],
    ["lastName"],
    ["email"],
    ["password"],
    ["role"],
    ["bio"],
  ],
  md: [
    ["firstName", "lastName"],
    ["email", "password"],
    ["role", "bio"],
  ],
  lg: [
    ["firstName", "lastName", "email"],
    ["password", "role", "bio"],
  ],
};

const emptyModel = () => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "",
  bio: "",
});

const formData1 = ref(emptyModel());
const formData2 = ref(emptyModel());
const formData3 = ref(emptyModel());
const formData4 = ref(emptyModel());

const submitForm = ref<InstanceType<typeof AutoForm> | null>(null);
const submitResult = ref<boolean | null>(null);

function handleSubmit() {
  if (submitForm.value) {
    submitResult.value = submitForm.value.validateAll();
  }
}

// ── Demo 6: Async options + array-of-object field ────────────────────────────

const asyncLoading = ref(false);
const asyncOptions = ref<{ value: string; label: string }[]>([]);

function fetchAsyncOptions() {
  asyncLoading.value = true;
  asyncOptions.value = [];
  setTimeout(() => {
    asyncOptions.value = [
      { value: "vue", label: "Vue.js" },
      { value: "react", label: "React" },
      { value: "svelte", label: "Svelte" },
      { value: "angular", label: "Angular" },
    ];
    asyncLoading.value = false;
  }, 1500);
}

const asyncSchema = z.object({
  name: z.string().min(1, "Name is required"),
  framework: z.string().min(1, "Please select a framework"),
  tags: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Select at least one tag"),
});

const asyncFormData = ref<Record<string, unknown>>({
  name: "",
  framework: "",
  tags: [],
});

const asyncFields = {
  name: {
    component: TextInput,
    props: { label: "Your Name", placeholder: "Jane Doe" },
  },
  framework: {
    component: SelectInput,
    // props as getter function — reads asyncOptions and asyncLoading reactively
    props: () => ({
      label: "Preferred Framework",
      placeholder: asyncLoading.value ? "Loading…" : "Select a framework",
      disabled: asyncLoading.value,
      options: asyncOptions.value,
    }),
  },
  tags: {
    component: MultiSelectInput,
    // getter — reads asyncOptions and asyncLoading reactively
    props: () => ({
      label: "Tags (multi-select → emits array of objects)",
      disabled: asyncLoading.value,
      options: asyncOptions.value,
    }),
  },
};

// ── Demo 5: Complex Job Application ──────────────────────────────────────────

const jobSchema = z.object({
  // Personal
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,}$/, "Enter a valid phone number"),
  email: z.string().email("Must be a valid email"),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // Position
  position: z.enum(["frontend", "backend", "fullstack", "devops", "design"], {
    errorMap: () => ({ message: "Please select a position" }),
  }),
  employmentType: z.enum(["fulltime", "parttime", "contract", "freelance"], {
    errorMap: () => ({ message: "Please select employment type" }),
  }),
  startDate: z.string().min(1, "Expected start date is required"),
  salaryExpectation: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Please enter salary expectation")
    .max(999999, "That seems too high"),
  // Experience
  yearsExperience: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(50, "Max 50 years"),
  currentCompany: z.string().optional(),
  coverLetter: z
    .string()
    .min(100, "Cover letter must be at least 100 characters"),
  // Agreements
  remoteOk: z.boolean(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

const jobFields = {
  fullName: {
    component: TextInput,
    props: { label: "Full Name *", placeholder: "Jane Doe" },
  },
  dateOfBirth: {
    component: TextInput,
    props: { label: "Date of Birth *", type: "date" },
  },
  phone: {
    component: TextInput,
    props: { label: "Phone *", placeholder: "+1 555 000 0000", type: "tel" },
  },
  email: {
    component: TextInput,
    props: { label: "Email *", placeholder: "jane@example.com", type: "email" },
  },
  linkedin: {
    component: TextInput,
    props: {
      label: "LinkedIn URL",
      placeholder: "https://linkedin.com/in/janedoe",
    },
  },
  portfolio: {
    component: TextInput,
    props: { label: "Portfolio URL", placeholder: "https://janedoe.dev" },
  },
  position: {
    component: SelectInput,
    props: {
      label: "Position *",
      placeholder: "Select position",
      options: [
        { value: "frontend", label: "Frontend Engineer" },
        { value: "backend", label: "Backend Engineer" },
        { value: "fullstack", label: "Full-Stack Engineer" },
        { value: "devops", label: "DevOps / Infrastructure" },
        { value: "design", label: "Product Designer" },
      ],
    },
  },
  employmentType: {
    component: SelectInput,
    props: {
      label: "Employment Type *",
      placeholder: "Select type",
      options: [
        { value: "fulltime", label: "Full-Time" },
        { value: "parttime", label: "Part-Time" },
        { value: "contract", label: "Contract" },
        { value: "freelance", label: "Freelance" },
      ],
    },
  },
  startDate: {
    component: TextInput,
    props: { label: "Available From *", type: "date" },
  },
  salaryExpectation: {
    component: NumberInput,
    props: {
      label: "Salary Expectation (USD/yr) *",
      placeholder: "80000",
      min: 1,
    },
  },
  yearsExperience: {
    component: NumberInput,
    props: {
      label: "Years of Experience *",
      placeholder: "3",
      min: 0,
      max: 50,
    },
  },
  currentCompany: {
    component: TextInput,
    props: { label: "Current Company", placeholder: "Acme Corp (optional)" },
  },
  coverLetter: {
    component: TextareaInput,
    props: {
      label: "Cover Letter * (min 100 chars)",
      placeholder: "Tell us why you're a great fit...",
      rows: 5,
    },
  },
  remoteOk: {
    component: CheckboxInput,
    props: { label: "I am open to fully remote work" },
  },
  agreeTerms: {
    component: CheckboxInput,
    props: { label: "I agree to the terms and conditions *" },
  },
};

const jobLayout: AutoFormLayout = {
  default: [
    ["fullName"],
    ["dateOfBirth"],
    ["phone"],
    ["email"],
    ["linkedin"],
    ["portfolio"],
    ["position"],
    ["employmentType"],
    ["startDate"],
    ["salaryExpectation"],
    ["yearsExperience"],
    ["currentCompany"],
    ["coverLetter"],
    ["remoteOk"],
    ["agreeTerms"],
  ],
  md: [
    ["fullName", "dateOfBirth"],
    ["phone", "email"],
    ["linkedin", "portfolio"],
    ["position", "employmentType"],
    ["startDate", "salaryExpectation"],
    ["yearsExperience", "currentCompany"],
    ["coverLetter"],
    ["remoteOk", "agreeTerms"],
  ],
  lg: [
    ["fullName", "dateOfBirth", "phone"],
    ["email", "linkedin", "portfolio"],
    ["position", "employmentType", "startDate"],
    ["salaryExpectation", "yearsExperience", "currentCompany"],
    ["coverLetter"],
    ["remoteOk", "agreeTerms"],
  ],
};

const jobFormData = ref({
  fullName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  linkedin: "",
  portfolio: "",
  position: "",
  employmentType: "",
  startDate: "",
  salaryExpectation: undefined as number | undefined,
  yearsExperience: undefined as number | undefined,
  currentCompany: "",
  coverLetter: "",
  remoteOk: false,
  agreeTerms: false,
});

const jobFormRef = ref<InstanceType<typeof AutoForm> | null>(null);
const jobSubmitted = ref(false);
const jobSubmitValid = ref<boolean | null>(null);

function handleJobSubmit() {
  if (jobFormRef.value) {
    const valid = jobFormRef.value.validateAll();
    jobSubmitValid.value = valid;
    if (valid) {
      jobSubmitted.value = true;
    }
  }
}

function resetJobForm() {
  jobFormData.value = {
    fullName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    linkedin: "",
    portfolio: "",
    position: "",
    employmentType: "",
    startDate: "",
    salaryExpectation: undefined,
    yearsExperience: undefined,
    currentCompany: "",
    coverLetter: "",
    remoteOk: false,
    agreeTerms: false,
  };
  jobSubmitted.value = false;
  jobSubmitValid.value = null;
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f3f4f6;
  color: #111827;
  min-height: 100vh;
}

.playground {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  background: #6366f1;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  vertical-align: middle;
}

.header p {
  color: #6b7280;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.demo-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.demo-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.demo-desc code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
}

.output {
  margin-top: 1.25rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
}

.output pre {
  margin-top: 0.25rem;
  white-space: pre-wrap;
  color: #374151;
}

.custom-error {
  display: block;
  margin-top: 2px;
  font-size: 0.75rem;
  color: #dc2626;
}

.btn {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s;
}

.btn:hover {
  background: #4f46e5;
}

.result-ok {
  margin-top: 0.75rem;
  color: #16a34a;
  font-weight: 500;
}

.result-err {
  margin-top: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.demo-card--complex {
  border: 2px solid #e0e7ff;
}

.demo-card-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
}

.demo-card-header h2 {
  margin-bottom: 0;
}

.tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.form-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 1.25rem 0 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.4rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.form-actions .btn {
  margin-top: 0;
}

.form-actions .result-err {
  margin-top: 0;
}

.btn--ghost {
  background: transparent;
  color: #6366f1;
  border: 1px solid #6366f1;
  margin-top: 0;
}

.btn--ghost:hover {
  background: #e0e7ff;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.success-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.success-banner strong {
  display: block;
  color: #15803d;
  font-size: 1rem;
}

.success-banner p {
  color: #166534;
  font-size: 0.875rem;
  margin-top: 0.125rem;
}

.success-banner .btn--ghost {
  margin-left: auto;
  white-space: nowrap;
}

.output--collapsible {
  cursor: pointer;
  margin-top: 1.25rem;
}

.output--collapsible summary {
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.output--collapsible summary::before {
  content: "▶";
  font-size: 0.625rem;
  color: #9ca3af;
  transition: transform 0.15s;
}

.output--collapsible[open] summary::before {
  transform: rotate(90deg);
}

.output--collapsible pre {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0 0 0.375rem 0.375rem;
  margin-top: 1px;
}
</style>
