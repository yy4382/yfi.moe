<script setup lang="ts">
import VTooltip from "./VTooltip.vue";

defineProps<{
  postTime: string;
  updatedTime: string;
}>();
</script>

<template>
  <VTooltip>
    <slot />
    <template #content>
      <div
        class="border-2 bg-card p-2 text-sm text-content shape-card dark:border-gray-700"
      >
        <div class="flex select-none items-center">
          Posted on {{ postTime }}
        </div>
        <div class="flex select-none items-center">
          Updated on {{ updatedTime }}
        </div>
      </div>
    </template>
  </VTooltip>
</template>
