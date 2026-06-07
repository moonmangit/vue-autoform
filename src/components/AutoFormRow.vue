<template>
  <div
    class="autoform-row"
    :style="{ '--autoform-cols': row.length }"
  >
    <div
      v-for="fieldKey in row"
      :key="fieldKey"
      class="autoform-cell"
    >
      <slot :fieldKey="fieldKey" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  row: string[]
}>()
</script>

<style>
.autoform-row {
  display: grid;
  grid-template-columns: repeat(var(--autoform-cols, 1), minmax(0, 1fr));
  gap: var(--autoform-gap, 1rem);
  width: 100%;
}

.autoform-cell {
  min-width: 0;
}
</style>
