<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import MingcuteSunLine from "~icons/mingcute/sun-line";
import MingcuteMoonLine from "~icons/mingcute/moon-line";
import MingcuteComputerLine from "~icons/mingcute/computer-line";
import { ToggleGroupItem, ToggleGroupRoot } from "radix-vue";
const mode = useColorMode();
</script>

<template>
  <div>
    <ToggleGroupRoot v-model="mode">
      <ToggleGroupItem value="light"><MingcuteSunLine /></ToggleGroupItem>
      <ToggleGroupItem value="dark"><MingcuteMoonLine /></ToggleGroupItem>
      <ToggleGroupItem value="auto"><MingcuteComputerLine /></ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>
