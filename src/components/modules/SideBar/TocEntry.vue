<script setup lang="ts">
import useHeading from "@utils/useHeading";
import type { MarkdownHeading } from "astro";
import { toRefs } from "vue";
const props = defineProps<{
  headings: MarkdownHeading[];
  activeIndex?: number;
}>();
// When on mobile, this component is not mounted by default, so it needs parent component to pass activeIndex
const activeIndex =
  props.activeIndex === undefined
    ? useHeading(props.headings)
    : toRefs(props).activeIndex;

defineEmits(["clickLink"]);
</script>

<template>
  <ul>
    <li
      v-for="(heading, index) of headings"
      :key="heading.slug"
      class="relative min-w-0 py-1 before:absolute before:-left-1 before:top-1/2 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-md before:bg-primary before:opacity-0 before:transition-opacity before:content-['']"
      :class="{ 'before:opacity-100': activeIndex === index }"
    >
      <a
        :href="`#${heading.slug}`"
        class="inline-block w-full min-w-0 select-none truncate align-middle text-comment transition-[color,margin-left] hover:text-content"
        :style="`margin-left: calc(0.75rem * ${heading.depth - 2 + Number(activeIndex === index) * 0.7});`"
        :class="{
          '!text-heading': activeIndex === index,
        }"
        @click="$emit('clickLink')"
      >
        {{ heading.text }}
      </a>
    </li>
  </ul>
</template>
