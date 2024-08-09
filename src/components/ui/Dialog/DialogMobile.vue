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
      transition: { type: "keyframes", ease: "easeOut", duration: 150 },
    },
    enter: { y: 0 /*, transition: { type: "keyframes", ease: "easeOut" }*/ },
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
/**
 * The height of the content when the dialog is opened.
 * Adjusted when the dialog is about to open.
 *
 * @type {number}
 */
let contentHeightThisTime: number = 0;

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
    contentMotion.stop();

    await Promise.all([contentMotion.apply("enter"), overlayApply("enter")]);
  } else {
    await Promise.all([
      contentMotion.apply({
        y: contentHeightThisTime,
        transition: {
          type: "keyframes",
          ease: "easeOut",
          duration: contentHeightThisTime / 2,
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
  onSwipeEnd: (_e: TouchEvent, direction) => {
    if (lengthY.value < contentHeightThisTime / 5 && direction === "down") {
      open.value = false;
    } else {
      contentMotion.apply("enter");
    }
  },
});
</script>

<template>
  <div>
    <DialogRoot v-model:open="open">
      <DialogTrigger as-child class="outline-none">
        <slot name="trigger" />
      </DialogTrigger>
      <DialogPortal v-if="show">
        <DialogOverlay
          ref="dialogOverlay"
          class="fixed inset-0 z-20 bg-[rgba(0,0,0,0.3)]"
          force-mount
        />
        <DialogContent
          ref="dialogContent"
          class="fixed inset-0 top-[unset] z-50 mt-24 h-fit max-h-[90vh] !rounded-b-none bg-card p-8 pt-9 shape-card focus-visible:outline-none"
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
            class="absolute left-1/2 top-4 h-1 w-16 translate-x-[-50%] outline-none"
          >
            <div class="h-full w-full rounded-full bg-gray-300 outline-none" />
          </DialogClose>

          <!-- Dialog bottom padding, avoid showing base layer content when open with spring animation -->
          <div
            class="absolute inset-x-0 -bottom-48 top-8 z-[-10] bg-card will-change-transform"
          ></div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
