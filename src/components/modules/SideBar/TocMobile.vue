<script setup lang="ts">
import MobileDialog from "@comp/elements/MobileDialog.vue";
import TocEntry from "./TocEntry.vue";
import { ref } from "vue";
import type { MarkdownHeading } from "astro";
import useHeading from "@utils/useHeading";
import MingcuteMenuLine from "@comp/icons/MingcuteMenuLine.vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
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
</script>

<template>
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
          class="fixed z-20 bottom-4 right-4 rounded-full bg-card border dark:border-gray-600 p-2"
        >
          <MingcuteMenuLine class="size-4 text-heading" />
        </button>
      </div>
    </template>
  </MobileDialog>
</template>
