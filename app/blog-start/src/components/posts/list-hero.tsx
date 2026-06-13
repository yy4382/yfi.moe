import { Section } from "@/components/ui/section";

export function ListHero({ title, desc }: { title: string; desc?: string }) {
  return (
    <Section
      className="flex h-52 flex-col items-start justify-center lg:h-96"
      padding="postList"
      bg="grid"
    >
      <h1 className="text-5xl font-bold text-heading @3xl:text-6xl">{title}</h1>
      {desc && <p className="mt-4 ml-1 text-lg text-content">{desc}</p>}
    </Section>
  );
}
