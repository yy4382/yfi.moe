<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import { useElementBounding } from "@vueuse/core";
import { card, tvButton } from "@styles/tv";
import MobileMenu from "./MobileMenu.vue";
import MingcuteSearch3Line from "@comp/icons/MingcuteSearch3Line.vue";
import { type NavMenu, navMenu } from "@configs/navbar";
import { siteConfig } from "@configs/site";

const props = defineProps<{
  navStats?: NavMenu | string;
}>();

const navEl = ref<HTMLElement | null>(null);
const { top, height } = useElementBounding(navEl);
const isFixed = computed(() => top.value <= 0 && height.value !== 0);

const { base } = card({ padding: "xs" });

const highlight = computed<number>(() => {
  if (props.navStats === undefined) return navMenu.length - 1;
  if (typeof props.navStats === "string")
    return navMenu.findIndex((item) => item.text === props.navStats);
  return navMenu.findIndex(
    (item) => item.text === (props.navStats as NavMenu).text,
  );
});
onMounted(() => {
  watchEffect(() => {
    document.documentElement.style.setProperty(
      "--navbar-height",
      `${height.value}px`,
    );
  });
  watchEffect(() => {
    if (isFixed.value) {
      document.documentElement.style.setProperty("--navbar-top-margin", "0rem");
    } else {
      document.documentElement.style.setProperty("--navbar-top-margin", "1rem");
    }
  });
});
</script>

<template>
  <nav
    ref="navEl"
    class="mt-4 sticky top-0 z-20 h-16 min-h-16 transition-all duration-500 xl:mx-auto box-border"
    :class="[isFixed ? 'max-w-full' : 'px-4 max-w-screen-xl']"
    style="view-transition-name: navbar"
  >
    <div
      :class="[
        base({ class: '!py-2' }),
        'text-heading transition-all duration-500 !shadow-md h-full',
        isFixed && '!rounded-none',
      ]"
    >
      <div class="size-full flex items-center justify-between">
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
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
    </div>
  </nav>
</template>
