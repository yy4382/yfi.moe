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
import MingcuteSearch3Line from "~icons/mingcute/search-3-line";

const searchClient = algoliasearch(
  algoliaConfig.appId,
  algoliaConfig.readonlyKey,
);

const inputValue = ref("");
const inputting = ref(false);
const inputEvent = (event: Event, refine: (arg0: string) => void) => {
  if (inputting.value) return;
  inputValue.value = (event.currentTarget as HTMLInputElement).value;
  refine(inputValue.value);
};
onMounted(() => {
  const event = new CustomEvent("search-panel-mounted");
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
      class="mb-4 animate-fade transition-shadow duration-300 animate-duration-150 focus-within:shadow-md"
      :class="card({ padding: 'xs' }).base({ class: 'h-12 !p-0' })"
    >
      <template #default="{ currentRefinement, refine }">
        <form
          class="relative mt-52 flex size-full gap-4 px-4 transition-[margin-top] will-change-transform center focus-within:mt-4"
          @submit.prevent=""
        >
          <MingcuteSearch3Line class="size-5 text-content" />
          <input
            type="search"
            class="ais-SearchBox-input size-full bg-transparent text-content outline-none"
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
          class="w-fit bg-card px-4 py-2 text-content transition-transform shape-card hover:translate-y-0.5"
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
  @apply grid animate-onload grid-cols-1 justify-items-center gap-4;
}
.ais-InfiniteHits-list {
  @apply grid grid-cols-1 gap-4;
}
.ais-Snippet {
  @apply text-sm text-comment;
}

.ais-InfiniteHits-loadMore {
  @apply w-fit bg-card px-4 py-2 text-content transition-transform shape-card hover:translate-y-0.5;
}
.ais-InfiniteHits-loadMore--disabled {
  @apply cursor-not-allowed text-comment hover:transform-none;
}
</style>
