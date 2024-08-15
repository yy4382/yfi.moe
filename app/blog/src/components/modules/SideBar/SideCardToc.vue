<script setup lang="ts">
import DialogMobile from "@comp/ui/Dialog/DialogMobile.vue";
import TocEntry from "./TocEntry.vue";
import { ref } from "vue";
import type { MarkdownHeading } from "astro";
import useHeading from "@utils/useHeading";
import MingcuteListCheckLine from "~icons/mingcute/list-check-line";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { card } from "@styles/tv";
const props = defineProps<{
  headings: MarkdownHeading[];
}>();

const breakpoints = useBreakpoints(breakpointsTailwind);

const shouldMount = breakpoints.smaller("lg");

const activeIndex = useHeading(props.headings);
const open = ref(false);
const onClickLink = () => {
  setTimeout(() => {
    open.value = false;
  }, 50);
};

const { base, heading } = card({ padding: "sm" });
</script>

<template>
  <div v-show="!shouldMount" :class="base()">
    <div
      :class="heading()"
      class="block pb-2 transition-[color] hover:text-primary"
    >
      <h5>目录</h5>
    </div>
    <TocEntry :headings="headings" :active-index @click-link="onClickLink" />
  </div>
  <DialogMobile
    v-show="shouldMount"
    v-model="open"
    title="Table of Contents"
    description="Table of Contents"
  >
    <template #default>
      <TocEntry :headings="headings" :active-index @click-link="onClickLink" />
    </template>

    <template #trigger>
      <div>
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <button
          class="fixed bottom-4 right-4 z-20 animate-onload border bg-card p-2 opacity-0 animate-delay-300 shape-card dark:border-gray-600"
        >
          <MingcuteListCheckLine class="size-6 text-heading" />
        </button>
      </div>
    </template>
  </DialogMobile>
</template>
