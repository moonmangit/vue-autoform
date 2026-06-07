<template>
  <div class="demo-container">
    <div v-if="submitted" class="success-banner">
      <div class="success-icon">✓</div>
      <div>
        <strong>Application submitted!</strong>
        <p>Thanks {{ formData.fullName as string }}, we'll be in touch.</p>
      </div>
      <button class="btn btn--ghost" @click="resetForm">Reset</button>
    </div>

    <template v-else>
      <div class="form-section-label">Personal Information</div>
      <AutoForm
        ref="formRef"
        v-model="formData"
        :schema="schema"
        :layout="layout"
        :fields="fields"
        validate-on="blur"
      />

      <div class="form-actions">
        <button class="btn" @click="handleSubmit">Submit Application</button>
        <p v-if="submitValid === false" class="result-err">
          ✗ Please fix the errors above before submitting.
        </p>
      </div>

      <details class="output output--collapsible">
        <summary><strong>Current model payload</strong></summary>
        <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
      </details>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "vue-autoform";
import TextInput from "../inputs/TextInput.vue";
import SelectInput from "../inputs/SelectInput.vue";
import TextareaInput from "../inputs/TextareaInput.vue";
import NumberInput from "../inputs/NumberInput.vue";
import CheckboxInput from "../inputs/CheckboxInput.vue";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Must be a valid email"),
  position: z.enum(["frontend", "backend", "fullstack", "devops", "design"], {
    errorMap: () => ({ message: "Please select a position" }),
  }),
  yearsExperience: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(50, "Max 50 years"),
  coverLetter: z
    .string()
    .min(100, "Cover letter must be at least 100 characters"),
  remoteOk: z.boolean(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

const fields = {
  fullName: {
    component: TextInput,
    props: { label: "Full Name *", placeholder: "Jane Doe" },
  },
  email: {
    component: TextInput,
    props: { label: "Email *", placeholder: "jane@example.com", type: "email" },
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
  yearsExperience: {
    component: NumberInput,
    props: {
      label: "Years of Experience *",
      placeholder: "3",
      min: 0,
      max: 50,
    },
  },
  coverLetter: {
    component: TextareaInput,
    props: {
      label: "Cover Letter *",
      placeholder: "Tell us about yourself...",
      rows: 4,
    },
  },
  remoteOk: {
    component: CheckboxInput,
    props: { label: "Open to remote work" },
  },
  agreeTerms: {
    component: CheckboxInput,
    props: { label: "I agree to the terms and conditions *" },
  },
};

const layout = {
  default: 1,
  md: 2,
};

const formData = ref<Record<string, unknown>>({
  fullName: "",
  email: "",
  position: "",
  yearsExperience: 0,
  coverLetter: "",
  remoteOk: false,
  agreeTerms: false,
});

const formRef = ref<InstanceType<typeof AutoForm> | null>(null);
const submitValid = ref<boolean | null>(null);
const submitted = ref(false);

function handleSubmit() {
  if (formRef.value) {
    submitValid.value = formRef.value.validateAll();
    if (submitValid.value) {
      submitted.value = true;
    }
  }
}

function resetForm() {
  submitted.value = false;
  submitValid.value = null;
  formData.value = {
    fullName: "",
    email: "",
    position: "",
    yearsExperience: 0,
    coverLetter: "",
    remoteOk: false,
    agreeTerms: false,
  };
}
</script>

<style scoped>
.demo-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #f9fafb;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  color: #166534;
}

.success-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.form-section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn:hover {
  background: #4f46e5;
}

.btn--ghost {
  background: transparent;
  color: #166534;
  border: 1px solid #86efac;
}

.btn--ghost:hover {
  background: #bbf7d0;
}

.result-err {
  color: #ef4444;
  font-size: 0.875rem;
}

.output {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #1f2937;
  border-radius: 0.375rem;
  color: #e5e7eb;
}

.output--collapsible {
  cursor: pointer;
}

.output pre {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>
