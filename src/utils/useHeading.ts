import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  toRef,
  type Ref,
} from "vue";
import type { MarkdownHeading } from "astro";
export default function useHeading(
  headingsInput: Ref<MarkdownHeading[]> | MarkdownHeading[],
) {
  const headings: Ref<MarkdownHeading[]> = toRef(headingsInput);
  const isVisible = ref<boolean[]>(Array(headings.value.length).fill(false));
  let headers: HTMLElement[] = [];
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const headersWithUn: (HTMLElement | undefined)[] = [];
    headings.value.forEach((heading) => {
      headersWithUn.push(document.getElementById(heading.slug) ?? undefined);
    });
    headers = headersWithUn.filter(
      (header): header is HTMLElement => header !== undefined,
    );
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = headings.value.findIndex(
            (heading) => entry.target.id === heading.slug,
          );
          if (index === -1) return;
          isVisible.value[index] = entry.isIntersecting;
        });
      },
      {
        rootMargin: "-80px 0px 0px 0px",
      },
    );
    headers.forEach((header) => {
      if (header) {
        observer?.observe(header);
        header.style.scrollMarginTop = "5rem";
      }
    });
  });
  onBeforeUnmount(() => {
    headers.forEach((header) => {
      if (header) {
        observer?.unobserve(header);
      }
    });
  });

  const activeIndex = computed<number>((oldVal) => {
    const index = isVisible.value.findIndex((visible) => visible);
    if (index !== -1) return index;
    return oldVal === undefined ? 0 : oldVal;
  });
  return activeIndex;
}
