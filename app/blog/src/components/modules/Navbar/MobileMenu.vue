<script setup lang="ts">
import DialogMobile from "@comp/ui/Dialog/DialogMobile.vue";
import MingCuteMenuLine from "~icons/mingcute/menu-line";
import { navMenu } from "@configs/navbar";
</script>

<template>
  <DialogMobile description="Menu Bar for mobile" title="Menu Bar for mobile">
    <template #trigger>
      <MingCuteMenuLine class="h-8 w-8 text-heading outline-0" />
    </template>
    <div class="flex flex-col gap-4">
      <section v-for="nav in navMenu" :key="nav.text">
        <a
          :href="nav.link"
          class="modal-link inline-flex items-center gap-2 font-medium text-heading"
        >
          <component :is="nav.vueIcon" class="size-5 text-heading" />
          {{ nav.text }}
        </a>
        <ul
          v-if="nav.subMenu && nav.subMenu.length > 0"
          class="my-2 grid grid-cols-2 gap-2"
        >
          <li v-for="child in nav.subMenu" :key="child.text">
            <a :href="child.link" class="p-4 pl-6 text-sm text-content">
              {{ child.text }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </DialogMobile>
</template>
