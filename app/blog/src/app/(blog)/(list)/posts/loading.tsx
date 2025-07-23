import { ListHero } from "../post-list-layout";
import { Section } from "@/components/ui/section";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function PostListLoading() {
  return (
    <div>
      <ListHero title="Blog" />
      <Section className="flex h-128 items-center justify-center">
        <LoadingIndicator text="加载文章列表..." />
      </Section>
    </div>
  );
}
