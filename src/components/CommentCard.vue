<script setup>
import { Waline } from '@waline/client/component';
const props = defineProps({
  path: {
    type: String,
    required: true,
  },
});

import '@waline/client/style';

const serverURL = 'https://waline.yfi.moe';
const path = props.path;
const dark = 'html[class="dark"]'
</script>
<template>
  <div class="card-base p-2">
    <Waline :serverURL="serverURL" :path="path" :dark="dark" />
  </div>
</template>

<style>
.wl-count {
  color: var(--waline-color);
}
</style>
