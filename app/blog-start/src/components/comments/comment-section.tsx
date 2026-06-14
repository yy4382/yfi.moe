import { Hydrate } from "@tanstack/react-start";
import { visible } from "@tanstack/react-start/hydration";
import { Comment } from "@/components/comments/comment";
import { Section } from "@/components/ui/section";
import { getClientEnv } from "@/env/client";

export function CommentSection({ pathname }: { pathname: string }) {
  const { VITE_WALINE_URL } = getClientEnv();
  if (!VITE_WALINE_URL) {
    return null;
  }

  const normalizedPathname =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  return (
    <Section padding="article" className="mx-auto min-h-72 max-w-2xl py-12">
      <Hydrate when={visible({ rootMargin: "400px" })}>
        <Comment pathname={normalizedPathname} serverURL={VITE_WALINE_URL} />
      </Hydrate>
    </Section>
  );
}
