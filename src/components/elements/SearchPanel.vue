<script setup lang="ts">
import {
  AisSearchBox,
  AisInstantSearch,
  AisInfiniteHits,
  AisHighlight,
  AisConfigure,
  AisSnippet,
  // @ts-expect-error missing types
} from "vue-instantsearch/vue3/es";
import algoliasearch from "algoliasearch/lite";
import { getPostPath } from "@utils/path";
import { algoliaConfig } from "@configs/algolia";
import { card } from "@styles/tv";
import { onMounted, ref } from "vue";
import MingcuteSearch3Line from "@comp/icons/MingcuteSearch3Line.vue";

const searchClient = algoliasearch(
  algoliaConfig.appId,
  algoliaConfig.readonlyKey,
);
// import "instantsearch.css/themes/satellite.css";
const inputValue = ref("");
const inputting = ref(false);
const inputEvent = (event: Event, refine: (arg0: string) => void) => {
  if (inputting.value) return;
  inputValue.value = (event.currentTarget as HTMLInputElement).value;
  refine(inputValue.value);
};
onMounted(() => {
  const event = new CustomEvent("search-panel-mounted");
  console.log("search-panel-mounted");
  window.dispatchEvent(event);
});
</script>
<template>
  <AisInstantSearch
    :search-client="searchClient"
    index-name="posts"
    :future="{ preserveSharedStateOnUnmount: true }"
  >
    <AisConfigure
      :attributes-to-snippet.camel="['content:50']"
      :hits-per-page.camel="3"
    />
    <AisSearchBox
      class="mb-4 focus-within:shadow-md transition-shadow duration-300 animate-fade animate-duration-150"
      :class="card({ padding: 'xs' }).base({ class: '!p-0 h-12' })"
    >
      <template #default="{ currentRefinement, refine }">
        <form
          class="size-full flex center px-4 gap-4 transition-[margin-top] relative will-change-transform mt-52 focus-within:mt-4"
          @submit.prevent=""
        >
          <MingcuteSearch3Line class="text-content size-5" />
          <input
            type="search"
            class="ais-SearchBox-input size-full outline-none bg-transparent text-content"
            placeholder="Search for something..."
            :value="currentRefinement"
            @compositionstart="inputting = true"
            @compositionend="
              (event) => {
                inputting = false;
                inputEvent(event, refine);
              }
            "
            @input="(event) => inputEvent(event, refine)"
          />
        </form>
      </template>
    </AisSearchBox>
    <AisInfiniteHits v-show="inputValue !== ''">
      <template #item="{ item }">
        <div class="flex flex-col gap-2 break-words" :class="card().base()">
          <a :href="getPostPath(item)" class="text-xl text-heading">
            <AisHighlight attribute="title" :hit="item" />
          </a>
          <AisSnippet attribute="content" :hit="item" />
        </div>
      </template>
      <template #loadMore="{ isLastPage, refineNext }">
        <button
          :hidden="isLastPage"
          class="bg-card shape-card py-2 px-4 w-fit text-content hover:translate-y-0.5 transition-transform"
          @click="refineNext"
        >
          Show more
        </button>
      </template>
    </AisInfiniteHits>
  </AisInstantSearch>
</template>

<style>
.ais-SearchBox-input::-ms-clear,
.ais-SearchBox-input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
.ais-SearchBox-input::-webkit-search-decoration,
.ais-SearchBox-input::-webkit-search-cancel-button,
.ais-SearchBox-input::-webkit-search-results-button,
.ais-SearchBox-input::-webkit-search-results-decoration {
  display: none;
}
.ais-InfiniteHits {
  @apply grid grid-cols-1 gap-4 justify-items-center animate-onload;
}
.ais-InfiniteHits-list {
  @apply grid grid-cols-1 gap-4;
}
.ais-Snippet {
  @apply text-comment text-sm;
}

.ais-InfiniteHits-loadMore {
  @apply bg-card shape-card py-2 px-4 w-fit text-content hover:translate-y-0.5 transition-transform;
}
.ais-InfiniteHits-loadMore--disabled {
  @apply text-comment hover:transform-none cursor-not-allowed;
}
</style>
