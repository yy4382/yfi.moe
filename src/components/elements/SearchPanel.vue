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

const searchClient = algoliasearch(
  algoliaConfig.appId,
  algoliaConfig.readonlyKey,
);
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
    <AisInfiniteHits class="">
      <template #item="{ item }">
        <div
          class="flex flex-col space-y-0.5 whitespace-break-spaces break-all"
        >
          <a :href="getPostPath(item)" class="text-xl">
            <AisHighlight attribute="title" :hit="item" />
          </a>
          <AisSnippet attribute="content" :hit="item" />
        </div>
      </template>
    </AisInfiniteHits>
  </AisInstantSearch>
</template>
