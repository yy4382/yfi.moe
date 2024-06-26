<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "radix-vue";
import { Icon } from "@iconify/vue";

defineProps<{
  postTime: string;
  updatedTime: string;
}>();
</script>

<template>
  <div>
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger>
          <slot></slot>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :side-offset="5">
            <div class="bg-card shape-card text-content p-2">
              <div class="flex select-none items-center">
                Posted on {{ postTime }}
              </div>
              <div class="flex select-none items-center">
                Updated on {{ updatedTime }}
              </div>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  </div>
</template>
