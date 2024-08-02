<script setup lang="ts">
import { computed } from "vue";
import { tvButton } from "@styles/tv";
import NavStickyWrapper from "./NavStickyWrapper.vue";
import MobileMenu from "./MobileMenu.vue";
import MingcuteSearch3Line from "~icons/mingcute/search-3-line";
import { type NavMenu, navMenu } from "@configs/navbar";
import { siteConfig } from "@configs/site";

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
      class="size-full mx-auto flex items-center justify-between px-3 sm:px-4 py-2"
    >
      <div class="md:hidden h-8"><MobileMenu /></div>
      <div class="self-center">
        <a class="flex items-center text-xl" href="/">
          <slot />
          <span class="hidden md:inline">{{ siteConfig.title }}</span>
        </a>
      </div>
      <div class="hidden md:flex h-full items-center space-x-1">
        <a
          v-for="(item, index) of navMenu"
          :key="item.text"
          :href="item.link"
          class="w-20 font-medium h-full flex center"
          :class="[
            highlight === index ? 'text-primary' : 'text-heading',
            tvButton(),
          ]"
        >
          <span
            class="self-center z-1 select-none align-middle inline-flex items-center gap-1"
          >
            <component
              :is="item.vueIcon"
              v-if="highlight === index"
              class="w-5 h-5"
              style="view-transition-name: nav-item-icon"
            />
            <span :style="`view-transition-name: nav-item-text-` + item.text">
              {{ item.text }}
            </span>
          </span>
        </a>
      </div>
      <a href="/search" aria-label="Search Button">
        <MingcuteSearch3Line class="size-6" />
      </a>
    </div>
  </NavStickyWrapper>
</template>
