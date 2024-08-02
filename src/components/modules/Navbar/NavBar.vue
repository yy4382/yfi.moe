<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import { useElementBounding } from "@vueuse/core";
import { tvButton } from "@styles/tv";
import MobileMenu from "./MobileMenu.vue";
import MingcuteSearch3Line from "@comp/icons/MingcuteSearch3Line.vue";
import { type NavMenu, navMenu } from "@configs/navbar";
import { siteConfig } from "@configs/site";
// import { tv } from "tailwind-variants";

const props = defineProps<{
  navStats?: NavMenu | string;
}>();

const navEl = ref<HTMLElement | null>(null);
const { top, height } = useElementBounding(navEl);
const isFixed = computed(() => top.value <= 0 && height.value !== 0);

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
  <nav ref="navEl" :class="['sticky top-0 z-20 h-16 min-h-16 w-full']">
    <div
      :class="[
        'absolute h-full backdrop-blur-lg text-heading shadow inset-y-0 left-1/2 -translate-x-1/2 transform-gpu',
        isFixed ? 'w-screen' : 'w-full',
        isFixed ? 'bg-card/80' : 'bg-card',
        isFixed ? 'rounded-none' : 'rounded-card',
        isFixed ? 'transition-expand' : 'transition-shrink',
      ]"
      style="view-transition-name: navbar"
    >
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
    </div>
  </nav>
</template>

<style scoped>
.transition-expand,
.transition-shrink {
  --tm: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  --full: 300ms var(--tm);
}
.transition-expand {
  transition:
    width var(--full),
    background-color ease-in-out,
    border-radius 100ms ease-in-out 200ms;
}
.transition-shrink {
  transition:
    width var(--full),
    background-color ease-in-out,
    border-radius 200ms ease-in-out;
}
</style>
