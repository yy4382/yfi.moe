// uno.config.ts
import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import presetAnimations from "unocss-preset-animations";

export default defineConfig({
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      portage: {
        50: "hsl(230, 100%, 96%)",
        100: "hsl(234, 100%, 94%)",
        200: "hsl(234, 100%, 89%)",
        300: "hsl(236, 100%, 81%)",
        400: "hsl(241, 95%, 74%)",
        500: "hsl(246, 89%, 67%)",
        600: "hsl(250, 80%, 59%)",
        700: "hsl(251, 62%, 51%)",
        800: "hsl(251, 58%, 41%)",
        900: "hsl(249, 51%, 34%)",
        950: "hsl(252, 51%, 20%)",
      },
    },
  },
  presets: [
    presetUno({
      dark: "media",
    }),
    presetAnimations(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "text-bottom",
      },
    }),
    presetTypography({
      cssExtend: {
        a: {
          "text-decoration": "none",
          "border-bottom": "2px solid var(--link-underline-normal)",
          transition: "border-bottom .1s ease-in-out",
        },
        "a:hover": {
          "border-bottom": "2px solid var(--link-underline-hover)",
        },
        "a:active": {
          "border-bottom": "2px solid var(--link-underline-active)",
        },
        "*:not(pre) > code": {
          "white-space": "pre-wrap",
          "word-break": "break-word",
        },
        blockquote: {
          "font-style": "normal",
          "--un-prose-borders": "hsl(236, 100%, 81%)",
          "--un-prose-invert-borders": "hsl(234, 100%, 89%)",
        },
      },
    }),
    // ...custom presets
  ],
  shortcuts: {
    "btn-transition": "transition-all duration-200 ease-in-out",

    "btn-regular": `bg-portage-100/60 text-sm text-portage-600/80
       btn-transition hover:bg-portage-200/80 active:bg-portage-300/80 
       dark:(bg-portage-200/20 text-gray-300/90 
       hover:bg-portage-200/40 active:bg-portage-200/60)`,

    "btn-card": `bg-white text-gray-700 btn-transition
      hover:bg-portage-200/80 active:bg-portage-300/80
      dark:(bg-gray-900 text-gray-300/90
      hover:bg-portage-100/20 active:bg-portage-200/40)`,

    "btn-plain": `bg-none btn-transition text-content
      hover:bg-portage-200/80 active:bg-portage-300/80 
      dark:hover:bg-portage-100/20`,

    "card-heading": `relative text-wrap text-xl font-medium tracking-tight
      text-gray-900 transition dark:text-gray-100
      before:(absolute hidden -left-4 top-1 h-5 w-1 rounded-md bg-portage-300 lg:block content-[""])`,

    "text-content": `text-gray-700 dark:text-gray-300`,
    "text-heading": `text-gray-900 dark:text-gray-100`,
    "text-comment": `text-gray-600 dark:text-gray-400`,
    "text-primary": `text-portage-400 dark:text-portage-400`,

    "bg-card": "bg-white dark:bg-gray-900",
    "shape-card": "rounded-xl shadow-lg",
  },
});
