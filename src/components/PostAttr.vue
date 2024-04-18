<script setup lang="ts">
import { DateTime } from "luxon";
import VTooltip from "./base/VTooltip.vue";
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
    class="flex flex-wrap items-center gap-2 lg:gap-3 text-[0.8rem] text-comment"
  >
    <!-- Date -->
    <VTooltip>
      <div class="flex select-none items-center">
        <MingcuteCalendarLine class="text-base mr-1" />
        {{ DateTime.fromJSDate(post.data.date).toFormat("yyyy-MM-dd") }}
      </div>
      <template #tooltip>
        <div class="bg-white dark:bg-gray-900 rounded-md border w-fit whitespace-nowrap
          shadow-[0px_0px_6px_2px_rgba(0,0,0,0.1)] px-2 py-0.5">
          修改于 {{ DateTime.fromJSDate(post.data.updated).toFormat("yyyy-MM-dd") }}
        </div>
      </template>
    </VTooltip>

    <!-- Tags -->
    <div class="flex select-none items-center">
      <MingcuteHashtagLine class="text-base mr-1" />
      <span class="space-x-1">
        <span class="" v-for="(tag, index) in post.data.tags" :key="tag">
          <span v-if="index !== 0" class="text-comment">/ </span>
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
