<script setup lang="ts">
import type { NavMenu } from "@config";
import { defineProps } from "vue";
import VTooltip from "@comp/base/VTooltip.vue";
const props = defineProps<{ nav: NavMenu }>();
</script>
<template>
  <div class="w-20 font-medium justify-center items-center h-full flex">
    <VTooltip class="self-center h-full">
      <div class="h-full flex justify-center items-center">
        <a
          :href="nav.link"
          class="w-full hover:text-portage-300 self-center z-1 select-none self-center align-middle"
        >
          {{ nav.text }}
        </a>
      </div>
      <template #tooltip>
        <ul
          v-if="nav.subMenu && nav.subMenu.length > 0"
          class="w-24 bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:border-gray-800 p-1 space-y-0.5"
        >
          <li
            v-for="subItem in nav.subMenu"
            class="text-center rounded-lg py-2 transition-colors hover:(bg-gray-100 dark:bg-gray-800 text-portage-400)"
          >
            <a :href="subItem.link" class="text-sm"> {{ subItem.text }} </a>
          </li>
        </ul>
      </template>
    </VTooltip>
  </div>
</template>
