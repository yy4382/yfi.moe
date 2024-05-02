<script setup lang="ts">
import type { NavMenu } from "@config";
import VTooltip from "@comp/base/VTooltip.vue";
import { Fragment, computed } from "vue";
import { Icon } from "@iconify/vue";
const props = defineProps<{ nav: NavMenu; highlight: boolean }>();
const nav = computed(() => props.nav);
</script>
<template>
  <div class="w-20 font-medium justify-center items-center h-full flex">
    <VTooltip class="self-center h-full">
      <div
        :class="
          highlight
            ? 'text-portage-400 h-full flex justify-center items-center'
            : 'h-full flex justify-center items-center'
        "
      >
        <span
          class="w-full hover:text-portage-300 self-center z-1 select-none self-center align-middle inline-flex items-center gap-1"
        >
          <Icon :icon="nav.icon || ''" v-if="highlight" />
          <a v-if="nav.link" :href="nav.link">
            {{ nav.text }}
          </a>
          <span v-else>
            {{ nav.text }}
          </span>
        </span>
      </div>
      <template #tooltip>
        <ul
          v-if="nav.subMenu && nav.subMenu.length > 0"
          class="w-24 bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:border-gray-800 p-1 space-y-0.5"
        >
          <li
            v-for="subItem in nav.subMenu"
            class="text-center rounded-lg py-2 transition-colors hover:bg-gray-100 hover:dark:bg-gray-800 hover:text-portage-400"
          >
            <a :href="subItem.link" class="text-sm"> {{ subItem.text }} </a>
          </li>
        </ul>
      </template>
    </VTooltip>
  </div>
</template>
