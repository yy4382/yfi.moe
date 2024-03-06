<script setup>
import { Waline } from "@waline/client/component";
const props = defineProps({
  path: {
    type: String,
    required: true,
  },
});

import "@waline/client/style";

const serverURL = "https://waline.yfi.moe";
const path = props.path;
</script>
<template>
  <div class="bg-white rounded-xl shadow-lg p-2 dark:bg-gray-900">
    <Waline :serverURL="serverURL" :path="path" dark="auto" />
  </div>
</template>

<style>
.wl-count {
  color: var(--waline-color);
}
</style>
