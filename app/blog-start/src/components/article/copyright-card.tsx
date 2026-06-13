import signature from "@/assets/signature-yunfi.svg?raw";
import { Section } from "@/components/ui/section";

export function CopyrightCard() {
  return (
    <Section className="overflow-hidden py-10" padding="article">
      <div className="mx-auto prose max-w-[75ch] !text-sm dark:prose-invert prose-p:text-comment/80 prose-a:!text-content/90">
        <div
          className="signature-wrapper float-right"
          dangerouslySetInnerHTML={{ __html: signature }}
        />
        <p className="!mt-0 !mb-2">
          本文使用“
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en">
            署名-非商业性使用-相同方式共享 4.0 国际(CC BY-NC-SA 4.0)
          </a>
          ”进行许可。
        </p>
        <p className="!mt-0">
          商业转载请联系站长获得授权，非商业转载请注明本文出处及文章链接。
          如果您再混合、转换或者基于本作品进行创作，您必须基于
          <a href="https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/">
            相同的
          </a>
          协议分发您贡献的作品。
        </p>
      </div>
      <style>{`
        .signature-wrapper {
          --signature-length: 2550px;
        }
        .signature-wrapper > svg {
          margin-left: 1rem;
          height: auto;
          width: 5rem;
          opacity: 1;
        }
        @media (min-width: 640px) {
          .signature-wrapper > svg {
            margin-top: -0.25rem;
            margin-right: -0.75rem;
          }
        }
        .signature-wrapper #main-stroke {
          stroke: black;
          opacity: 1;
          stroke-dashoffset: 1px;
          stroke-dasharray: var(--signature-length) 0;
          animation: grow 7s ease-out forwards infinite;
          transform-origin: center;
          animation-delay: 0s;
        }
        .dark .signature-wrapper #main-stroke {
          stroke: white;
        }
        @media (prefers-reduced-motion) {
          .signature-wrapper path {
            animation: none !important;
            stroke-dasharray: unset !important;
          }
        }
        @keyframes grow {
          0% {
            stroke-dashoffset: 1px;
            stroke-dasharray: 0 var(--signature-length);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          45% {
            stroke-dasharray: var(--signature-length) 0;
          }
          65% {
            stroke-dasharray: var(--signature-length) 0;
          }
          95%,
          to {
            stroke-dasharray: 0 var(--signature-length);
          }
        }
      `}</style>
    </Section>
  );
}
