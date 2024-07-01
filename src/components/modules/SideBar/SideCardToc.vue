<script setup lang="ts">
import MobileDialog from "@comp/elements/MobileDialog.vue";
import TocEntry from "./TocEntry.vue";
import { ref } from "vue";
import type { MarkdownHeading } from "astro";
import useHeading from "@utils/useHeading";
import MingcuteListCheckLine from "@icons/MingcuteListCheckLine.vue";
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
  <div v-if="!shouldMount" :class="base()">
    <div :class="heading()" class="transition pb-2 block hover:text-primary">
      <h5>目录</h5>
    </div>
    <TocEntry :headings="headings" :active-index @click-link="onClickLink" />
  </div>
  <MobileDialog
    v-if="shouldMount"
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
          class="fixed z-20 bottom-4 right-4 shape-card bg-card border dark:border-gray-600 p-2"
        >
          <MingcuteListCheckLine class="size-6 text-heading" />
        </button>
      </div>
    </template>
  </MobileDialog>
</template>
