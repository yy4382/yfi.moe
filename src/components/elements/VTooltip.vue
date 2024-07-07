<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "radix-vue";
import { useMotion } from "@vueuse/motion";
import { nextTick, ref, watch } from "vue";

const tip = ref(null);
const stages = ref({
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  leave: { opacity: 0, y: 0, transition: { duration: 300 } },
});

const { apply, set } = useMotion(tip, stages);

apply("initial");

const open = ref<boolean | undefined>(undefined);
const mount = ref(false);
watch(open, async (value) => {
  if (value) {
    mount.value = true;
    apply("enter");
  } else {
    await apply("leave");
    await nextTick();
    mount.value = false;
    set("initial");
  }
});
</script>

<template>
  <div>
    <TooltipProvider>
      <TooltipRoot
        :delay-duration="50"
        @update:open="(state) => (open = state)"
      >
        <TooltipTrigger>
          <slot />
        </TooltipTrigger>
        <TooltipPortal v-if="mount">
          <TooltipContent ref="tip" :side-offset="5" force-mount class="z-[9999]">
            <slot name="content" />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  </div>
</template>
