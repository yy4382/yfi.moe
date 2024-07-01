<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
/* prettier-ignore */
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTrigger, DialogTitle, VisuallyHidden, DialogDescription } from "radix-vue";
import { useSwipe, useElementBounding, until } from "@vueuse/core";
import { useMotion } from "@vueuse/motion";

defineProps<{
  title?: string;
  description?: string;
}>();

const dialogContent = ref<HTMLElement | null>(null);
const dialogOverlay = ref<HTMLElement | null>(null);

const contentMotion = useMotion(
  dialogContent,
  computed(() => ({
    initial: {
      y: 5000,
      transition: { type: "keyframes", ease: "easeOut", duration: 500 },
    },
    enter: { y: 0, transition: { type: "keyframes", ease: "easeOut" } },
  })),
);
contentMotion.set("initial");

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

const open = defineModel<boolean>();
const show = ref<boolean | undefined>(undefined);
const contentHeight = useElementBounding(dialogContent).height;
let contentHeightThisTime = 0;

watch(open, async () => {
  if (open.value) {
    if (show.value === undefined) {
      contentMotion.set("initial");
      overlaySet("initial");
      await nextTick();
    }
    show.value = true;

    await until(contentHeight).not.toBe(0);
    contentHeightThisTime = contentHeight.value;
    contentMotion.set({ y: contentHeightThisTime });

    await Promise.all([contentMotion.apply("enter"), overlayApply("enter")]);
  } else {
    await Promise.all([
      contentMotion.apply({
        y: contentHeightThisTime,
        transition: {
          type: "keyframes",
          ease: "easeOut",
          duration: contentHeightThisTime,
        },
      }),
      overlayApply("initial"),
    ]);
    show.value = false;
    contentMotion.set("initial");
  }
});

const { lengthY } = useSwipe(dialogContent, {
  onSwipe: (_e: TouchEvent) => {
    if (lengthY.value < 0) contentMotion.set({ y: -lengthY.value });
  },
  onSwipeEnd: (_e: TouchEvent) => {
    if (lengthY.value < contentHeightThisTime / 5) {
      open.value = false;
    } else {
      contentMotion.apply("enter");
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
        class="bg-card shape-card !rounded-b-none focus-visible:outline-none p-8 pt-9 fixed inset-0 top-[unset] h-fit mt-24 max-h-[90vh] z-50"
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
