<script setup lang="ts">
import MobileDialog from "@comp/elements/MobileDialog.vue";
import { ref } from "vue";
import type { MarkdownHeading } from "astro";
defineProps<{
  headings: MarkdownHeading[];
}>();
const open = ref(false);
const onClickLink = () => {
  setTimeout(() => {
    open.value = false;
  }, 50);
};
</script>

<template>
  <MobileDialog
    v-model="open"
    title="Table of Contents"
    description="Table of Contents"
  >
    <template #default>
      <ul>
        <li v-for="heading in headings" :key="heading.slug" class="py-1">
          <a
            :href="`#${heading.slug}`"
            class="btn-plain hover:translate-x-1 text-ellipsis whitespace-nowrap overflow-hidden p-2 rounded-md select-none"
            :style="`margin-left: calc(0.75rem * ${heading.depth - 2});`"
            @click="onClickLink"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </template>

    <template #trigger>
      <div>
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <button class="fixed z-20 bottom-4 right-4">A</button>
      </div>
    </template>
  </MobileDialog>
</template>
