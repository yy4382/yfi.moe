<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import MingcuteSunLine from "~icons/mingcute/sun-line";
import MingcuteMoonLine from "~icons/mingcute/moon-line";
import MingcuteComputerLine from "~icons/mingcute/computer-line";
import { ToggleGroupItem, ToggleGroupRoot } from "radix-vue";
const { store: mode } = useColorMode({ storageKey: "style:color-mode" });
const nameMap = {
  light: "明亮",
  dark: "暗黑",
  auto: "自动",
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between items-center text-heading">
      <span class="text-lg font-medium inline-flex gap-2 items-center">
        配色方案
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ nameMap[mode] }}
      </span>
    </div>
    <div class="rounded-md outline outline-2 outline-primary/40 w-fit">
      <ToggleGroupRoot v-model="mode" class="flex gap-0.5">
        <ToggleGroupItem
          value="light"
          class="color-mode-btn inline-flex gap-1 items-center"
        >
          <MingcuteSunLine class="size-6" />
          <span class="text-content">{{ nameMap.light }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          class="color-mode-btn inline-flex gap-1 items-center"
        >
          <MingcuteMoonLine class="size-6" />
          <span class="text-content">{{ nameMap.dark }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="auto"
          class="color-mode-btn inline-flex gap-1 items-center"
        >
          <MingcuteComputerLine class="size-6" />
          <span class="text-content">{{ nameMap.auto }}</span>
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </div>
  </div>
</template>

<style>
.color-mode-btn {
  @apply py-1 px-2 relative text-heading active:scale-[95%] transition-transform;
  &::before {
    @apply content-[""] absolute inset-0 opacity-0 scale-50 bg-primary/25 transition-[transform,opacity] rounded-md;
  }
  &:hover::before,
  &[data-state="on"]::before {
    @apply scale-100;
  }
  &:hover::before {
    @apply opacity-60;
  }
  &[data-state="on"]::before {
    @apply opacity-100;
  }
}
</style>
