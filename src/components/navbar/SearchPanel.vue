<script setup>
// @ts-ignore
import {
  AisSearchBox,
  AisInstantSearch,
  AisInfiniteHits,
  AisHighlight,
  AisConfigure,
  AisSnippet,
} from "vue-instantsearch/vue3/es";
import algoliasearch from "algoliasearch/lite";
const searchClient = algoliasearch(
  "1348UVS1GQ",
  "c1c21db7f7677a90c797ea5f411d8940",
);
// import "instantsearch.css/themes/algolia-min.css";
import "instantsearch.css/themes/satellite.css";
</script>
<template>
  <AisInstantSearch
    :search-client="searchClient"
    index-name="posts"
    :future="{ preserveSharedStateOnUnmount: true }"
  >
    <AisConfigure
      :attributes-to-snippet.camel="['content:50']"
      :hits-per-page.camel="4"
    />
    <AisSearchBox />
    <AisInfiniteHits class="overflow-y-auto max-h-80vh">
      <template #item="{ item }">
        <div class="flex flex-col space-y-0.5 whitespace-break-spaces break-all">
          <a :href="item.slug" class="text-xl">
            <AisHighlight attribute="title" :hit="item" />
          </a>
          <AisSnippet attribute="content" :hit="item" />
        </div>
      </template>
    </AisInfiniteHits>
  </AisInstantSearch>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active,
.move-enter-active,
.move-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.move-enter-from,
.move-leave-to {
  opacity: 0;
  transform: translateY(-20%), scale(0.5);
}
</style>