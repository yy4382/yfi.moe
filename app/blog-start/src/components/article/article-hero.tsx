import { PostAttrTags } from "@/components/posts/post-attr-tags";
import { PostAttrTime } from "@/components/posts/post-attr-time";
import { Section } from "@/components/ui/section";
import type { ContentTimeData } from "@/lib/content/source";

export function ArticleHero({
  title,
  time,
  tags,
}: {
  title: string;
  time?: ContentTimeData;
  tags?: string[];
}) {
  return (
    <Section
      className="mx-auto flex flex-col center gap-6 py-24"
      padding="article"
    >
      <h1 className="text-center text-3xl font-bold text-heading">{title}</h1>
      <div className="flex flex-col items-center gap-2 text-[0.8rem] text-comment md:flex-row lg:gap-3">
        {time && <PostAttrTime {...time} />}
        {tags && <PostAttrTags tags={tags} />}
      </div>
    </Section>
  );
}
