"use client";
import { useEffect, useMemo, useState } from "react";
import type { components } from "@octokit/openapi-types";
import { ErrorBoundary } from "react-error-boundary";

type GetRepoResp = components["schemas"]["repository"];

// Source: https://github.com/ozh/github-colors/blob/master/colors.json
const languageColorMap: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

const GhCardSkeleton = () => (
  <div className="not-prose group relative flex h-36 w-100 max-w-sm animate-pulse rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex flex-1 flex-col justify-between">
      <div className="space-y-3">
        <div className="h-5 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="h-4 w-full rounded bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="h-4 w-1/2 rounded bg-zinc-300 dark:bg-zinc-700"></div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="h-4 w-16 rounded bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="h-4 w-12 rounded bg-zinc-300 dark:bg-zinc-700"></div>
      </div>
    </div>
  </div>
);

export const GhCard = ({ user, repo }: { user: string; repo: string }) => {
  if (!user || !repo) {
    return (
      <div className="text-red-500">
        Invalid GitHub repository URL provided: {user}/{repo}
      </div>
    );
  }
  const repoUrl = `https://github.com/${user}/${repo}`;

  return (
    <div className="flex w-full justify-center">
      <ErrorBoundary
        fallbackRender={() => (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="not-prose group relative flex h-36 w-100 max-w-sm items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 text-center text-red-500 transition-all hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            加载 GitHub 数据失败，点击直接访问仓库 {user}/{repo}。
          </a>
        )}
      >
        <GhCardImpl user={user} repo={repo} />
      </ErrorBoundary>
    </div>
  );
};

function GhCardImpl({ user, repo }: { user: string; repo: string }) {
  const [data, setData] = useState<GetRepoResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`https://api.github.com/repos/${user}/${repo}`);
        if (!res.ok) {
          if (res.status === 403) {
            const body = await res.json();
            if (body.message?.includes("API rate limit exceeded")) {
              throw new Error("Rate limited by Github");
            }
          }
          throw new Error(
            `Could not load repository data for: ${user}/${repo}.`,
          );
        }
        setData(await res.json());
      } catch (e: unknown) {
        setErrorMessage(e instanceof Error ? e.message : "Unknown error");
        console.error("Failed to fetch GitHub repo data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, repo]);

  const color = useMemo(() => {
    if (!data?.language) return "#888888";
    return languageColorMap[data.language] || "#888888";
  }, [data?.language]);

  const repoUrl = `https://github.com/${user}/${repo}`;

  if (loading) {
    return (
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="not-prose block max-w-sm"
      >
        <GhCardSkeleton />
      </a>
    );
  }

  if (errorMessage) {
    return (
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="not-prose group relative flex h-36 w-100 max-w-sm items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 text-center text-comment transition-all hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
      >
        {errorMessage}
        <br />
        点击直接访问仓库 {user}/{repo}
      </a>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <a
      href={data.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose group relative flex max-w-md rounded-lg border bg-white text-left transition-all hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-heading">{data.full_name}</p>
          <p className="text-sm text-comment">{data.description}</p>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-comment">
          {data.language && (
            <div className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{data.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {/* Icon placeholder */}
            <span role="img" aria-label="star">
              ★
            </span>
            <span>{data.stargazers_count}</span>
          </div>
        </div>
      </div>

      {data.owner?.avatar_url && (
        <div className="relative hidden shrink-0 self-center sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.owner.avatar_url}
            alt={data.owner.login}
            className="mr-8 h-16 w-16 rounded-xl transition-transform group-hover:scale-105"
            width={64}
            height={64}
          />
        </div>
      )}
    </a>
  );
}
