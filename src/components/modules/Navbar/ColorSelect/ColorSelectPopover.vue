<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "radix-vue";
import MingcuteColorFilterLine from "~icons/mingcute/color-filter-line";
import ColorModeSwitch from "./ColorModeSwitch.vue";
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger>
      <MingcuteColorFilterLine class="size-6" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="z-50 color-select-dropdown"
        side="bottom"
        :side-offset="24"
      >
        <div
          class="bg-card border border-gray-300 dark:border-gray-800 rounded-card shadow-xl p-4 animate-onload_small animate-duration-500"
        >
          <ColorModeSwitch />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style>
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.color-select-dropdown[data-state="closed"] {
  animation: fadeOut 0.15s ease-in-out;
}
</style>
