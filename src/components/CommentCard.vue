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
  <div class="bg-card rounded-xl shadow-lg p-2">
    <Waline :server-u-r-l="serverURL" :path dark="auto" lang="zh-CN" />
  </div>
</template>

<style>
.wl-count {
  color: var(--waline-color);
}
</style>
