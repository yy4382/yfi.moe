<script setup lang="ts">
import { ref } from "vue";
const showTooltip = ref(false);
const beingHovered = ref(false);
function mouseEnter() {
  beingHovered.value = true;
  showTooltip.value = true;
}
function mouseLeave() {
  beingHovered.value = false;
  setTimeout(() => {
    if (!beingHovered.value) showTooltip.value = false;
  }, 150);
}
</script>

<template>
  <div
    class="relative"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
  >
    <slot></slot>
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
  transition: all 0.15s;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
