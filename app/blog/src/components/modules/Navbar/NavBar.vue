<script setup lang="ts">
import { computed } from "vue";
import { tvButton } from "@styles/tv";
import NavStickyWrapper from "./NavStickyWrapper.vue";
import MobileMenu from "./MobileMenu.vue";
import MingcuteSearch3Line from "~icons/mingcute/search-3-line";
import { type NavMenu, navMenu } from "@configs/navbar";
import { siteConfig } from "@configs/site";
import ColorSelectPopover from "./ColorSelect/ColorSelectPopover.vue";

const props = defineProps<{
  navStats?: NavMenu | string;
}>();

const highlight = computed<number>(() => {
  if (props.navStats === undefined) return navMenu.length - 1;
  if (typeof props.navStats === "string")
    return navMenu.findIndex((item) => item.text === props.navStats);
  return navMenu.findIndex(
    (item) => item.text === (props.navStats as NavMenu).text,
  );
});
</script>

<template>
  <NavStickyWrapper>
    <div
      class="mx-auto grid size-full grid-cols-[1fr_auto_1fr] grid-rows-1 content-center items-center px-3 py-2 sm:px-4"
    >
      <div class="h-8 justify-self-start md:hidden"><MobileMenu /></div>
      <div class="justify-self-center md:justify-self-start">
        <a class="flex items-center text-xl" href="/">
          <slot />
          <span class="ml-3 hidden md:inline">{{ siteConfig.title }}</span>
        </a>
      </div>
      <div
        class="hidden h-full items-center space-x-1 justify-self-center md:flex"
      >
        <a
          v-for="(item, index) of navMenu"
          :key="item.text"
          :href="item.link"
          class="flex h-full w-20 font-medium center"
          :class="[
            highlight === index ? 'text-primary' : 'text-heading',
            tvButton(),
          ]"
        >
          <span
            class="z-1 inline-flex select-none items-center gap-1 self-center align-middle"
          >
            <component
              :is="item.vueIcon"
              v-if="highlight === index"
              class="h-5 w-5"
              style="view-transition-name: nav-item-icon"
            />
            <span :style="`view-transition-name: nav-item-text-` + item.text">
              {{ item.text }}
            </span>
          </span>
        </a>
      </div>
      <div class="flex h-fit gap-4 justify-self-end">
        <ColorSelectPopover />
        <a href="/search" aria-label="Search Button" class="size-6">
          <MingcuteSearch3Line class="size-6" />
        </a>
      </div>
    </div>
  </NavStickyWrapper>
</template>
