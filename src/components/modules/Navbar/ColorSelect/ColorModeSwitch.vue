<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import MingcuteSunLine from "~icons/mingcute/sun-line";
import MingcuteMoonLine from "~icons/mingcute/moon-line";
import MingcuteComputerLine from "~icons/mingcute/computer-line";
import { ToggleGroupItem, ToggleGroupRoot } from "radix-vue";
const { store: mode } = useColorMode({ emitAuto: true });
</script>

<template>
  <div>
    <ToggleGroupRoot v-model="mode" class="flex gap-1">
      <ToggleGroupItem value="light" class="color-mode-btn">
        <MingcuteSunLine class="size-6" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" class="color-mode-btn">
        <MingcuteMoonLine class="size-6" />
      </ToggleGroupItem>
      <ToggleGroupItem value="auto" class="color-mode-btn">
        <MingcuteComputerLine class="size-6" />
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>

<style>
.color-mode-btn {
  @apply p-1 relative text-heading;
  &::before {
    @apply content-[""] absolute inset-0 opacity-0 scale-50 bg-primary/25 transition-all rounded-md;
  }
  &:hover::before,
  &[data-state="on"]::before {
    @apply scale-100 opacity-100;
  }
}
</style>
