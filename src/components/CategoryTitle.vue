<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{
  title: string;
  count: number;
}>();
</script>
<template>
  <div class="flex flex-col justify-start space-y-4 mb-4 ml-2">
    <h1 class="text-3xl font-bold text-heading">分类 - {{ title }}</h1>
    <span class="text-gray-600 dark:text-gray-400">
      该分类共有 {{ count }} 篇文章。
      <a href="/post/1" class="text-portage-400 dark:text-portage-300/80 text-sm"
        >查看所有文章<i class="i-mingcute-external-link-line"></i
      ></a>
    </span>
  </div>
</template>
