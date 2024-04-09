<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from "radix-vue";
import SearchPanel from "./SearchPanel.vue";
</script>

<template>
  <DialogRoot>
    <DialogTrigger class="i-mingcute-search-2-line text-[2rem]" />
    <DialogPortal>
      <Transition name="fade">
        <DialogOverlay
          class="fixed top-0 left-0 w-full h-full bg-black/50 dark:bg-black/70 z-40"
      /></Transition>
      <Transition name="move">
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>Search Panel</DialogTitle>
            <DialogDescription>Search Panel for the site</DialogDescription>
          </VisuallyHidden>
          <SearchPanel
            class="fixed top-[10vh] left-8 right-8 lg:left-1/4 lg:right-1/4 z-50 shadow-lg"
          /> </DialogContent
      ></Transition>
    </DialogPortal>
  </DialogRoot>
</template>
