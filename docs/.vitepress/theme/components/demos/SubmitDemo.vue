<template>
  <div class="demo-container">
    <AutoForm
      ref="formRef"
      v-model="formData"
      :schema="schema"
      :layout="layout"
      :fields="fields"
      validate-on="submit"
    />
    <button class="btn" @click="handleSubmit">Submit & Validate</button>
    <p v-if="submitResult !== null" :class="submitResult ? 'result-ok' : 'result-err'">
      {{ submitResult ? "✓ Valid! Ready to submit." : "✗ Validation failed. Check errors above." }}
    </p>
    <div class="output">
      <strong>Model:</strong>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { AutoForm } from "vue-autoform";
import TextInput from "../inputs/TextInput.vue";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Must be a valid email"),
});

const fields = {
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
};

const layout = {
  default: 1,
  md: 2,
};

const formData = ref({ firstName: "", lastName: "", email: "" });
const formRef = ref<InstanceType<typeof AutoForm> | null>(null);
const submitResult = ref<boolean | null>(null);

function handleSubmit() {
  if (formRef.value) {
    submitResult.value = formRef.value.validateAll();
  }
}
</script>

<style scoped>
.demo-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #f9fafb;
}

.btn {
  margin-top: 1rem;
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

.result-ok {
  margin-top: 0.75rem;
  color: #16a34a;
  font-size: 0.875rem;
}

.result-err {
  margin-top: 0.75rem;
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

.output pre {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>
