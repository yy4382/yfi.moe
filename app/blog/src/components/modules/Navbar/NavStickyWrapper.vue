<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import { useElementBounding, useWindowScroll } from "@vueuse/core";
import remToPixel from "@utils/remToPixel";

const DEFAULT_NAV_TOP_MARGIN = 1; // in rem

const navEl = ref<HTMLElement | null>(null);
const { height } = useElementBounding(navEl);
const navTopPixel = ref(remToPixel(DEFAULT_NAV_TOP_MARGIN));
const { y } = useWindowScroll();
const isFixed = computed(() => y.value >= remToPixel(DEFAULT_NAV_TOP_MARGIN));

onMounted(() => {
  navTopPixel.value = remToPixel(DEFAULT_NAV_TOP_MARGIN);
});

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
      document.documentElement.style.setProperty(
        "--navbar-top-margin",
        `${DEFAULT_NAV_TOP_MARGIN}rem`,
      );
    }
  });
});
</script>
<template>
  <nav ref="navEl" :class="['sticky top-0 z-20 h-16 min-h-16 w-full']">
    <div
      :class="[
        'absolute inset-y-0 left-1/2 h-full -translate-x-1/2 transform-gpu text-heading shadow backdrop-blur-lg',
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
.transition-expand {
  transition:
    width 300ms cubic-bezier(0.22, 0.61, 0.36, 1),
    border-radius 200ms ease-in-out 100ms;
}
.transition-shrink {
  transition:
    width 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28),
    border-radius 200ms ease-in-out;
}
</style>
