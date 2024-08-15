<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "radix-vue";
import MingcuteColorFilterLine from "~icons/mingcute/color-filter-line";
import ColorModeSwitch from "./ColorModeSwitch.vue";
import ColorHueSlider from "./ColorHueSlider.vue";
import { useColorMode } from "@vueuse/core";

// required because the real one controlling the color mode is in the popover, which won't be mounted until the popover is opened
useColorMode({ storageKey: "style:color-mode" });
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger>
      <MingcuteColorFilterLine class="size-6" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="color-select-dropdown z-50"
        side="bottom"
        :side-offset="24"
        :collision-padding="4"
      >
        <div
          class="animate-onload_small rounded-card border-2 border-gray-300 bg-card p-4 shadow-xl animate-duration-500 dark:border-gray-800"
        >
          <div class="flex flex-col gap-6">
            <ColorHueSlider />
            <ColorModeSwitch />
          </div>
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
