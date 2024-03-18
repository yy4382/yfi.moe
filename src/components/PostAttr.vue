<script setup lang="ts">
import { DateTime } from "luxon";
import VButton from "./base/VButton.vue";
import MingcuteCalendarLine from "./icons/MingcuteCalendarLine.vue";
import MingcuteHashtagLine from "./icons/MingcuteHashtagLine.vue";
import { defineProps, computed } from "vue";
import { type CollectionEntry } from "astro:content";
const props = defineProps<{
  post: CollectionEntry<"post">;
}>();
const post = computed(() => props.post);
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-2 lg:gap-3 text-[0.8rem] text-gray-500 dark:text-gray-400"
  >
    <!-- Date -->
    <div class="flex select-none items-center">
      <MingcuteCalendarLine class="text-base mr-1" />
      {{ DateTime.fromJSDate(post.data.date).toFormat("yyyy-MM-dd") }}
    </div>
    <!-- Tags -->
    <div class="flex select-none items-center">
      <MingcuteHashtagLine class="text-base mr-1" />
      <span class="space-x-1">
        <span class="" v-for="(tag, index) in post.data.tags" :key="tag">
          <span v-if="index !== 0" class="text-gray-500">/ </span>
          <a :href="'/tags/' + tag" class="hover:text-portage-300 transition">{{
            tag
          }}</a>
        </span>
      </span>
    </div>
  </div>
</template>
<style scoped>
.meta-icon {
  @apply mr-2 flex h-8 items-center justify-center rounded-md px-3 transition;
}
</style>
