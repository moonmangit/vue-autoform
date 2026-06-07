<template>
  <div class="demo-container">
    <div class="controls">
      <button class="btn" :disabled="loading" @click="fetchOptions">
        {{ loading ? "Fetching…" : "Simulate Fetch Options" }}
      </button>
      <span v-if="loading" class="status">Loading options from server…</span>
      <span v-else-if="error" class="status error">{{ error }}</span>
      <span v-else-if="options.length" class="status success"
        >✓ {{ options.length }} options loaded</span
      >
    </div>
    <AutoForm
      v-model="formData"
      :schema="schema"
      :fields="fields"
      :layout="{ default: 1, md: 2 }"
      validate-on="blur"
    />
    <div class="output">
      <strong>Model (note tags is array of objects):</strong>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { z } from "zod";
import { AutoForm } from "vue-autoform";
import TextInput from "../inputs/TextInput.vue";
import SelectInput from "../inputs/SelectInput.vue";
import MultiSelectInput from "../inputs/MultiSelectInput.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const options = ref<{ value: string; label: string }[]>([]);

function fetchOptions() {
  loading.value = true;
  error.value = null;
  options.value = [];
  setTimeout(() => {
    try {
      options.value = [
        { value: "vue", label: "Vue.js" },
        { value: "react", label: "React" },
        { value: "svelte", label: "Svelte" },
        { value: "angular", label: "Angular" },
      ];
    } catch (e) {
      error.value = "Failed to load options";
    } finally {
      loading.value = false;
    }
  }, 1500);
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  framework: z.string().min(1, "Please select a framework"),
  tags: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Select at least one tag"),
});

const formData = ref<Record<string, unknown>>({
  name: "",
  framework: "",
  tags: [],
});

const fields = computed(() => ({
  name: {
    component: TextInput,
    props: { label: "Your Name", placeholder: "Jane Doe" },
  },
  framework: {
    component: SelectInput,
    props: {
      label: "Preferred Framework",
      placeholder: loading.value ? "Loading…" : "Select a framework",
      disabled: loading.value,
      options: options.value,
    },
  },
  tags: {
    component: MultiSelectInput,
    props: {
      label: "Tags (multi-select → emits array of objects)",
      disabled: loading.value,
      options: options.value,
    },
  },
}));
</script>

<style scoped>
.demo-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #f9fafb;
}

.controls {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.btn:hover:not(:disabled) {
  background: #4f46e5;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  font-size: 0.8125rem;
  color: #6b7280;
}

.status.success {
  color: #16a34a;
}

.status.error {
  color: #ef4444;
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
