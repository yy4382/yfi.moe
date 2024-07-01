<script setup lang="ts">
import MingCuteMenuLine from "@icons/MingcuteMenuLine.vue";
import MingcuteCloseFill from "@icons/MingcuteCloseFill.vue";
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
  DialogDescription,
} from "radix-vue";

import { computed, nextTick, ref, watch } from "vue";
import { useMotion } from "@vueuse/motion";
import { useWindowSize, useSwipe } from "@vueuse/core";

const MARGIN_TOP = 96;
const { height: windowHeight } = useWindowSize();

const dialogContent = ref<HTMLElement | null>(null);
const dialogOverlay = ref<HTMLElement | null>(null);

const {
  apply: contentApply,
  set: contentSet,
  // state: contentState,
} = useMotion(
  dialogContent,
  computed(() => ({
    initial: {
      y: windowHeight.value - MARGIN_TOP,
      transition: { type: "keyframes", ease: "easeOut" },
    },
    enter: { y: 0, transition: { type: "keyframes", ease: "easeOut" } },
  })),
);
contentSet("initial");

const {
  apply: overlayApply,
  set: overlaySet,
  // state: overlayState,
} = useMotion(
  dialogOverlay,
  computed(() => ({
    initial: { opacity: 0, transition: { type: "keyframes", ease: "linear" } },
    enter: { opacity: 1, transition: { type: "keyframes", ease: "linear" } },
  })),
);
overlaySet("initial");

const open = ref(false);
const show = ref<boolean | undefined>(undefined);
watch(open, async () => {
  if (open.value) {
    if (show.value === undefined) {
      contentSet("initial");
      overlaySet("initial");
      await nextTick();
    }
    show.value = true;
    await Promise.all([contentApply("enter"), overlayApply("enter")]);
  } else {
    await Promise.all([contentApply("initial"), overlayApply("initial")]);
    show.value = false;
  }
});

const { lengthY } = useSwipe(dialogContent, {
  onSwipe: (_e: TouchEvent) => {
    if (lengthY.value < -10) {
      contentSet({
        y: -lengthY.value,
      });
    }
  },
  onSwipeEnd: (_e: TouchEvent) => {
    if (lengthY.value < -200) {
      open.value = false;
    } else {
      contentApply("enter");
    }
  },
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <MingCuteMenuLine class="w-8 h-8 text-heading outline-0" />
    </DialogTrigger>
    <DialogPortal v-if="show">
      <DialogOverlay
        ref="dialogOverlay"
        class="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-20"
        force-mount
      />
      <DialogContent
        ref="dialogContent"
        class="bg-white dark:bg-gray-950 focus-visible:outline-none rounded-lg shadow-lg p-8 fixed inset-0 mt-24 z-50"
        force-mount
      >
        <VisuallyHidden as-child>
          <DialogTitle>Menu Bar for mobile</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden as-child>
          <DialogDescription>Menu Bar for mobile</DialogDescription>
        </VisuallyHidden>
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
              v-if="
                nav.subMenu && nav.subMenu.length > 0 && nav.text !== '首页'
              "
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
        <DialogClose class="absolute top-4 right-4">
          <MingcuteCloseFill class="text-heading" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
