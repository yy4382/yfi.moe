<script setup lang="ts">
import { computed } from "vue";
type ButtonType = "primary" | "card" | "plain";
const props = defineProps<{
  type?: ButtonType;
  disabled?: boolean;
  link?: string;
  label?: string;
  isRounded?: boolean;
  class?: string;
}>();
const tagName = computed(() => {
  return props.link ? "a" : "button";
});
const classObj = computed(() => ({
  "base-primary": props.type === "primary" && props.disabled,
  primary: props.type === "primary" && !props.disabled,
  "base-card": props.type === "card" && props.disabled,
  card: props.type === "card" && !props.disabled,
  "base-plain": props.type === "plain" && props.disabled,
  plain: props.type === "plain" && !props.disabled,
  "rounded-lg": props.isRounded,
}));
</script>
<template>
  <component :is="tagName" :class="[classObj, props.class]">
    <slot>
      {{ props.label }}
    </slot>
  </component>
</template>
<style scoped>
.base-primary {
  @apply bg-portage-100/60 text-sm text-portage-600/80
    dark:(bg-portage-200/20 text-gray-300/90);
}
.primary {
  @apply bg-portage-100/60 text-sm text-portage-600/80
       btn-transition hover:bg-portage-200/80 active:bg-portage-300/80 
       dark:(bg-portage-200/20 text-gray-300/90 
       hover:bg-portage-200/40 active:bg-portage-200/60);
}
.base-card {
  @apply bg-white text-gray-700
    dark:(bg-gray-900 text-gray-300/90);
}
.card {
  @apply bg-white text-gray-700 btn-transition
      hover:bg-portage-200/80 active:bg-portage-300/80
      dark:(bg-gray-900 text-gray-300/90
      hover:bg-portage-100/20 active:bg-portage-200/40);
}
.base-plain {
  @apply bg-none text-gray-700
    dark:(text-gray-300/90);
}
.plain {
  @apply bg-none text-gray-700 btn-transition
      hover:bg-portage-200/80 active:bg-portage-300/80 
      dark:( text-gray-300/90 hover:bg-portage-100/20);
}
</style>
