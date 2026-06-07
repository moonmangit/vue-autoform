<template>
  <div class="demo-container">
    <AutoForm
      v-model="formData"
      :schema="schema"
      :fields="fields"
      validate-on="blur"
    />
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

const formData = ref({ firstName: "", lastName: "", email: "" });
</script>

<style scoped>
.demo-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #f9fafb;
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
