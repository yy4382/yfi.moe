<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
/* prettier-ignore */
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTrigger, DialogTitle, VisuallyHidden, DialogDescription } from "radix-vue";
import { useWindowSize, useSwipe } from "@vueuse/core";
import { useMotion } from "@vueuse/motion";

defineProps<{
  title?: string;
  description?: string;
}>();

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
    <DialogTrigger as-child class="outline-none">
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal v-if="show">
      <DialogOverlay
        ref="dialogOverlay"
        class="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-20"
        force-mount
      />
      <DialogContent
        ref="dialogContent"
        class="bg-card shape-card !rounded-b-none focus-visible:outline-none p-8 pt-9 fixed inset-0 mt-24 z-50"
        force-mount
      >
        <VisuallyHidden as-child>
          <DialogTitle>{{ title ?? "Dialog" }}</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden as-child>
          <DialogDescription>{{ description ?? "Dialog" }}</DialogDescription>
        </VisuallyHidden>
        <slot />
        <DialogClose
          class="absolute top-4 w-16 left-1/2 translate-x-[-50%] h-1"
        >
          <div class="bg-gray-300 rounded-full h-full w-full" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
