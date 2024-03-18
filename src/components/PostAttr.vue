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
  <div class="flex flex-wrap items-center gap-2 lg:gap-3 text-sm">
    <!-- Date -->
    <VButton link="/achieve" type="primary" class="meta-icon">
      <MingcuteCalendarLine class="text-lg mr-1" />
      {{ DateTime.fromJSDate(post.data.date).toFormat("yyyy-MM-dd") }}
    </VButton>

    <!-- Tags -->
    <VButton type="primary" class="meta-icon" disabled v-if="post.data.tags">
      <MingcuteHashtagLine class="text-lg mr-1" />
      <span class="space-x-1">
        <a
          class=""
          v-for="(tag, index) in post.data.tags"
          :key="tag"
          :href="'/tags/' + tag"
        >
          {{ (index === 0 ? "" : "/ ") + tag }}
        </a>
      </span>
    </VButton>
  </div>
</template>
<style scoped>
.meta-icon {
  @apply mr-2 flex h-8 items-center justify-center rounded-md px-3 transition;
}
</style>
