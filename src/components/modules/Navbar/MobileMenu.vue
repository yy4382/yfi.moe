<script setup lang="ts">
import MobileDialog from "@comp/elements/MobileDialog.vue";
import MingCuteMenuLine from "@icons/MingcuteMenuLine.vue";
import { Icon } from "@iconify/vue";
</script>

<template>
  <MobileDialog description="Menu Bar for mobile" title="Menu Bar for mobile">
    <template #trigger>
      <MingCuteMenuLine class="w-8 h-8 text-heading outline-0" />
    </template>
    <div class="flex flex-col gap-4">
      <section v-for="nav in navMenu" :key="nav.text">
        <a
          :href="nav.link"
          class="inline-flex items-center gap-2 modal-link font-medium text-heading"
        >
          <Icon :icon="nav.icon || ''" />
          {{ nav.text }}
        </a>
        <ul
          v-if="nav.subMenu && nav.subMenu.length > 0"
          class="grid grid-cols-2 gap-2 my-2"
        >
          <li v-for="child in nav.subMenu" :key="child.text">
            <a :href="child.link" class="p-4 pl-6 text-sm text-content">
              {{ child.text }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </MobileDialog>
</template>
