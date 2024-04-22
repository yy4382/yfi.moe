<script setup lang="ts">
import MingCuteMenuLine from "@icons/MingcuteMenuLine.vue";
import MingcuteCloseFill from "@icons/MingcuteCloseFill.vue";
import { navMenu } from "@config";
import { Icon } from "@iconify/vue";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  VisuallyHidden,
} from "radix-vue";
</script>

<template>
  <DialogRoot>
    <DialogTrigger>
      <MingCuteMenuLine class="w-8 h-8 text-heading" />
    </DialogTrigger>
    <DialogPortal>
      <Transition name="fade">
        <DialogOverlay class="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-50" />
      </Transition>
      <Transition name="move">
        <DialogContent
          class="fixed bg-white dark:bg-gray-950 w-[calc(100%-2rem)] rounded-lg shadow-lg p-8 top-18 z-100 left-4"
        >
          <VisuallyHidden>
            <DialogTitle>Menu Bar for mobile</DialogTitle>
          </VisuallyHidden>
          <div class="flex flex-col gap-4">
            <section v-for="nav in navMenu">
              <a
                :href="nav.link"
                class="inline-flex items-center gap-2 modal-link font-medium text-heading"
              >
                <Icon :icon="nav.icon || ''" />
                {{ nav.text }}
              </a>
              <ul
                class="grid grid-cols-2 gap-2 my-2"
                v-if="nav.subMenu && nav.subMenu.length > 0 && nav.text !== '首页'"
              >
                <li v-for="child in nav.subMenu">
                  <a :href="child.link" class="p-4 pl-6 text-sm text-content">
                    {{ child.text }}
                  </a>
                </li>
              </ul>
            </section>
          </div>
          <DialogClose class="absolute top-4 right-4">
            <MingcuteCloseFill class="text-heading" />
          </DialogClose>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
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
