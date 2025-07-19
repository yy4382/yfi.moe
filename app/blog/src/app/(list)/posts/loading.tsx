import { ListHero } from "../post-list-layout";
import { Card } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function PostListLoading() {
  return (
    <div>
      <ListHero title="Blog" />
      <Card className="flex h-128 items-center justify-center">
        <LoadingIndicator text="加载文章列表..." />
      </Card>
    </div>
  );
}
