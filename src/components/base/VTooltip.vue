<script setup lang="ts">
import { ref } from "vue";
const showTooltip = ref(false);
</script>

<template>
  <div class="relative">
    <div @mouseover="showTooltip = true" @mouseout="showTooltip = false">
      <slot></slot>
    </div>
    <div
      class="z-10 absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2"
    >
      <Transition>
        <div v-show="showTooltip">
          <slot name="tooltip"></slot>
        </div>
      </Transition>
    </div>
  </div>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.3s;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
