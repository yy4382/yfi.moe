import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

export function PostAttrTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex items-center select-none">
      <span className="mr-1 i-lucide-hash size-4" />
      <span className="space-x-0.5">
        {tags.map((tag, index) => (
          <Fragment key={tag}>
            {index !== 0 && <span className="text-comment">|</span>}
            <Link
              to="/tags/$tag"
              params={{ tag }}
              className="transition hover:text-accent-foreground"
            >
              {tag}
            </Link>
          </Fragment>
        ))}
      </span>
    </div>
  );
}
