<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementBounding } from "@vueuse/core";
import { card } from "@styles/tv";
import MobileMenu from "./MobileMenu.vue";
import MingcuteSearch3Line from "@comp/icons/MingcuteSearch3Line.vue";
import type { NavMenu } from "@configs/navbar";

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
</script>

<template>
  <nav
    ref="navEl"
    class="mt-4 sticky top-0 z-20 h-16 min-h-16 transition-all duration-500 xl:mx-auto"
    :class="[isFixed ? 'max-w-full' : 'px-4 max-w-screen-xl']"
    style="view-transition-name: navbar;"
  >
    <div
      :class="[
        base(),
        'text-heading transition-all duration-500 !shadow-md',
        isFixed && '!rounded-none',
      ]"
    >
      <div class="w-full flex items-center justify-between">
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <div class="md:hidden h-8"><MobileMenu /></div>
        <div class="self-center">
          <a class="flex items-center text-xl" href="/">
            <slot />
            <span class="hidden md:inline">{{ siteConfig.title }}</span>
          </a>
        </div>
        <div class="hidden md:flex h-full items-center space-x-1">
          <div
            v-for="(item, index) of navMenu"
            :key="item.text"
            class="w-20 font-medium h-full flex center"
            :class="[highlight === index ? 'text-primary' : 'text-heading']"
          >
            <span
              class="hover:text-primary self-center z-1 select-none align-middle inline-flex items-center gap-1"
            >
              <component
                :is="item.vueIcon"
                v-if="highlight === index"
                class="w-5 h-5"
                style="view-transition-name: nav-item-icon"
              />
              <a
                :href="item.link"
                :style="`view-transition-name: nav-item-text-` + item.text"
              >
                {{ item.text }}
              </a>
            </span>
          </div>
        </div>
        <a href="/search" aria-label="Search Button">
          <MingcuteSearch3Line class="size-6" />
        </a>
      </div>
    </div>
  </nav>
</template>
