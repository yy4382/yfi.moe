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
      class="py-1 min-w-0 relative before:absolute before:-left-1 before:w-[2px] before:top-1/2 before:h-4 before:-translate-y-1/2 before:rounded-md before:bg-primary before:content-[''] before:opacity-0 before:transition-opacity"
      :class="{ 'before:opacity-100': activeIndex === index }"
    >
      <a
        :href="`#${heading.slug}`"
        class="truncate select-none text-comment hover:text-content transition-[color,margin-left] min-w-0 w-full inline-block align-middle"
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
