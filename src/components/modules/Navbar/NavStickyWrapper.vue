<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import { useElementBounding } from "@vueuse/core";

const navEl = ref<HTMLElement | null>(null);
const { top, height } = useElementBounding(navEl);
const isFixed = computed(() => top.value <= 0 && height.value !== 0);

onMounted(() => {
  watchEffect(() => {
    document.documentElement.style.setProperty(
      "--navbar-height",
      `${height.value}px`,
    );
  });
  watchEffect(() => {
    if (isFixed.value) {
      document.documentElement.style.setProperty("--navbar-top-margin", "0rem");
    } else {
      document.documentElement.style.setProperty("--navbar-top-margin", "1rem");
    }
  });
});
</script>
<template>
  <nav ref="navEl" :class="['sticky top-0 z-20 h-16 min-h-16 w-full']">
    <div
      :class="[
        'absolute h-full backdrop-blur-lg text-heading shadow inset-y-0 left-1/2 -translate-x-1/2 transform-gpu',
        isFixed ? 'w-screen' : 'w-full',
        isFixed ? 'bg-card/80' : 'bg-card',
        isFixed ? 'rounded-none' : 'rounded-card',
        isFixed ? 'transition-expand' : 'transition-shrink',
      ]"
      style="view-transition-name: navbar"
    >
      <slot />
    </div>
  </nav>
</template>

<style scoped>
.transition-expand,
.transition-shrink {
  --tm: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  --full: 300ms var(--tm);
}
.transition-expand {
  transition:
    width var(--full),
    background-color ease-in-out,
    border-radius 100ms ease-in-out 200ms;
}
.transition-shrink {
  transition:
    width var(--full),
    background-color ease-in-out,
    border-radius 200ms ease-in-out;
}
</style>
