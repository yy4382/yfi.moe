import { Hydrate } from "@tanstack/react-start";
import { visible } from "@tanstack/react-start/hydration";
import { Comment } from "@/components/comments/comment";
import { Section } from "@/components/ui/section";

export function CommentSection({ pathname }: { pathname: string }) {
  const normalizedPathname =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  return (
    <Section padding="article" className="mx-auto min-h-72 max-w-2xl py-12">
      <Hydrate when={visible({ rootMargin: "400px" })}>
        <Comment pathname={normalizedPathname} />
      </Hydrate>
    </Section>
  );
}
