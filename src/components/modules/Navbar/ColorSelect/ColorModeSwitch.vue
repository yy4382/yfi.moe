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
    <div class="flex items-center justify-between text-heading">
      <span class="inline-flex items-center gap-2 text-lg font-medium">
        配色方案
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ nameMap[mode] }}
      </span>
    </div>
    <div class="w-full rounded-md outline outline-2 outline-primary/40">
      <ToggleGroupRoot v-model="mode" class="flex justify-between gap-0.5">
        <ToggleGroupItem
          value="light"
          class="color-mode-btn inline-flex items-center gap-1"
        >
          <MingcuteSunLine class="size-6" />
          <span class="text-content">{{ nameMap.light }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          class="color-mode-btn inline-flex items-center gap-1"
        >
          <MingcuteMoonLine class="size-6" />
          <span class="text-content">{{ nameMap.dark }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="auto"
          class="color-mode-btn inline-flex items-center gap-1"
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
  @apply relative px-2 py-1 text-heading transition-transform active:scale-[95%];
  &::before {
    @apply absolute inset-0 scale-50 rounded-md bg-primary/25 opacity-0 transition-[transform,opacity] content-[""];
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
