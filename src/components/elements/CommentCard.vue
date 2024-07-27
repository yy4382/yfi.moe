<script setup lang="ts">
// @ts-expect-error don't get types...
import { Waline } from "@waline/client/component";
import { ref, onMounted, onUnmounted } from "vue";
defineProps<{
  serverUrl: string;
}>();

import "@waline/client/style";

const path = ref("");

const updatePath = () => {
  path.value = window.location.pathname;
};

onMounted(() => {
  updatePath();
  window.addEventListener("popstate", updatePath);
});
onUnmounted(() => {
  window.removeEventListener("popstate", updatePath);
});
</script>
<template>
  <div class="bg-card rounded-xl shadow-lg p-2">
    <Waline
      :server-u-r-l="serverUrl"
      :path
      dark="auto"
      lang="zh-CN"
      :search="false"
      :emoji="false"
      :required-meta="['nick', 'mail']"
    />
  </div>
</template>

<style>
.wl-count {
  color: var(--waline-color);
}
</style>
