<!--
Inspired and adapted from https://github.com/saicaca/fuwari/blob/main/src/components/widget/DisplaySettings.svelte

Original license:
```
MIT License

Copyright (c) 2024 saicaca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
-->
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import { getDefaultHue, getHue, setHue } from "@utils/color";
import MingcuteBackLine from "~icons/mingcute/back-line";
const hue = ref<number | undefined>(undefined);
const hueDebounced = refDebounced(hue, 30);

const setHueRef = (value: string) => {
  const num = parseInt(value);
  if (isNaN(num)) {
    return;
  }
  if (num < 0) {
    hue.value = 0;
  } else if (num > 360) {
    hue.value = 360;
  } else {
    hue.value = num;
  }
};

onMounted(() => {
  hue.value = getHue();
  watch(hueDebounced, () => {
    if (hueDebounced.value === undefined) return;
    setHue(hueDebounced.value);
  });
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between text-heading">
      <span class="inline-flex items-center gap-2 text-lg font-medium">
        主题色
        <button
          class="flex size-7 rounded-md bg-primary/25 p-1 transition-colors center hover:bg-primary/35"
          @click="
            () => {
              setHue(getDefaultHue());
              hue = getHue();
            }
          "
        >
          <MingcuteBackLine />
        </button>
      </span>
      <input
        :value="hue"
        type="number"
        class="h-7 w-10 rounded-md bg-primary/25 p-1 text-center"
        @change="
          ($event) => {
            const inputElement = $event.target as HTMLInputElement;
            if (inputElement) {
              setHueRef(inputElement.value);
            }
          }
        "
      />
    </div>
    <input v-model="hue" type="range" min="0" max="360" step="5" />
  </div>
</template>

<style>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none; /* Add the standard appearance property */
  width: 15rem;
  height: 1.5rem;
  @apply rounded-md px-1;
  background: linear-gradient(
    to right in oklch,
    oklch(64.78% 0.1472 0),
    oklch(64.78% 0.1472 60),
    oklch(64.78% 0.1472 120),
    oklch(64.78% 0.1472 180),
    oklch(64.78% 0.1472 240),
    oklch(64.78% 0.1472 300),
    oklch(64.78% 0.1472 360)
  );
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 1rem;
    width: 0.5rem;
    border-radius: 0.125rem;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: none;
    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
    &:active {
      background: rgba(255, 255, 255, 0.6);
    }
  }

  &::-moz-range-thumb {
    -webkit-appearance: none;
    appearance: none; /* Add the standard appearance property */
    height: 1rem;
    width: 0.5rem;
    border-radius: 0.125rem;
    border-width: 0;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: none;
    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
    &:active {
      background: rgba(255, 255, 255, 0.6);
    }
  }

  &::-ms-thumb {
    -webkit-appearance: none;
    appearance: none; /* Add the standard appearance property */
    height: 1rem;
    width: 0.5rem;
    border-radius: 0.125rem;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: none;
    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
    &:active {
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
