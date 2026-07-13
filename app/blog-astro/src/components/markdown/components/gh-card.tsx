import type { components } from "@octokit/openapi-types";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  colors,
  motion,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";

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

const pulse = stylex.keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.52 },
});

const styles = stylex.create({
  center: { display: "flex", justifyContent: "center", width: "100%" },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
    borderRadius: radii.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textPrimary,
    display: "flex",
    maxWidth: "28rem",
    position: "relative",
    textAlign: "start",
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "border-color, background-color",
    transitionTimingFunction: motion.easeStandard,
    width: "100%",
    ":hover": { borderColor: colors.borderStrong },
  },
  fixedCard: {
    alignItems: "center",
    height: "9rem",
    justifyContent: "center",
    maxWidth: "25rem",
    padding: spacing.lg,
    textAlign: "center",
  },
  error: { color: colors.danger },
  loadingLink: {
    borderBottomWidth: 0,
    display: "block",
    maxWidth: "25rem",
    width: "100%",
  },
  skeleton: {
    animationDuration: "1.8s",
    animationIterationCount: "infinite",
    animationName: pulse,
    animationTimingFunction: "ease-in-out",
    alignItems: "stretch",
    height: "9rem",
    maxWidth: "25rem",
    padding: spacing.lg,
  },
  skeletonBody: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  skeletonLines: { display: "flex", flexDirection: "column", gap: spacing.md },
  skeletonLine: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: spacing.lg,
  },
  skeletonLineWide: { width: "100%" },
  skeletonLineMedium: { width: "75%" },
  skeletonLineShort: { width: "50%" },
  skeletonMeta: {
    display: "flex",
    gap: spacing.lg,
    paddingBlockStart: spacing.sm,
  },
  skeletonMetaWide: { width: "4rem" },
  skeletonMetaShort: { width: "3rem" },
  body: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: spacing.lg,
  },
  details: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: typography.weightSemibold,
    margin: 0,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizeSm,
    margin: 0,
  },
  metadata: {
    alignItems: "center",
    color: colors.textSecondary,
    display: "flex",
    fontSize: typography.sizeSm,
    gap: spacing.lg,
    marginBlockStart: spacing.lg,
  },
  metadataItem: { alignItems: "center", display: "flex", gap: spacing.sm },
  languageDot: {
    borderRadius: radii.round,
    height: spacing.md,
    width: spacing.md,
  },
  avatarFrame: {
    display: "none",
    flexShrink: 0,
    position: "relative",
    alignSelf: "center",
    "@media (min-width: 40rem)": { display: "block" },
  },
  avatar: {
    borderRadius: radii.xl,
    height: "4rem",
    marginInlineEnd: spacing.xxl,
    transitionDuration: motion.durationFast,
    transitionProperty: "transform",
    width: "4rem",
    ":hover": { transform: "scale(1.05)" },
  },
});

function GhCardSkeleton() {
  return (
    <div {...stylex.props(styles.card, styles.skeleton)}>
      <div {...stylex.props(styles.skeletonBody)}>
        <div {...stylex.props(styles.skeletonLines)}>
          <div
            {...stylex.props(styles.skeletonLine, styles.skeletonLineMedium)}
          />
          <div
            {...stylex.props(styles.skeletonLine, styles.skeletonLineWide)}
          />
          <div
            {...stylex.props(styles.skeletonLine, styles.skeletonLineShort)}
          />
        </div>
        <div {...stylex.props(styles.skeletonMeta)}>
          <div
            {...stylex.props(styles.skeletonLine, styles.skeletonMetaWide)}
          />
          <div
            {...stylex.props(styles.skeletonLine, styles.skeletonMetaShort)}
          />
        </div>
      </div>
    </div>
  );
}

export function GhCard({ user, repo }: { user: string; repo: string }) {
  if (!user || !repo) {
    return (
      <div {...stylex.props(styles.error)}>
        Invalid GitHub repository URL provided: {user}/{repo}
      </div>
    );
  }
  const repoUrl = `https://github.com/${user}/${repo}`;

  return (
    <div {...stylex.props(styles.center)}>
      <ErrorBoundary
        fallbackRender={() => (
          <a
            data-unstyled-link
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(styles.card, styles.fixedCard, styles.error)}
          >
            加载 GitHub 数据失败，点击直接访问仓库 {user}/{repo}。
          </a>
        )}
      >
        <GhCardImpl user={user} repo={repo} />
      </ErrorBoundary>
    </div>
  );
}

function GhCardImpl({ user, repo }: { user: string; repo: string }) {
  const [data, setData] = useState<GetRepoResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(
          `https://api.github.com/repos/${user}/${repo}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          if (res.status === 403) {
            const body = (await res.json()) as { message?: string };
            if (body.message?.includes("API rate limit exceeded")) {
              throw new Error("Rate limited by Github");
            }
          }
          throw new Error(
            `Could not load repository data for: ${user}/${repo}.`,
          );
        }
        setData((await res.json()) as GetRepoResp);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error",
        );
        console.error("Failed to fetch GitHub repo data", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchData();
    return () => controller.abort();
  }, [user, repo]);

  const languageColor = useMemo(() => {
    if (!data?.language) return "#888888";
    return languageColorMap[data.language] || "#888888";
  }, [data?.language]);

  const repoUrl = `https://github.com/${user}/${repo}`;

  if (loading) {
    return (
      <a
        data-unstyled-link
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.loadingLink)}
      >
        <GhCardSkeleton />
      </a>
    );
  }

  if (errorMessage) {
    return (
      <a
        data-unstyled-link
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.card, styles.fixedCard)}
      >
        {errorMessage}
        <br />
        点击直接访问仓库 {user}/{repo}
      </a>
    );
  }

  if (!data) return null;

  return (
    <a
      data-unstyled-link
      href={data.html_url}
      target="_blank"
      rel="noopener noreferrer"
      {...stylex.props(styles.card)}
      style={{ borderColor: `${languageColor}30` }}
    >
      <div {...stylex.props(styles.body)}>
        <div {...stylex.props(styles.details)}>
          <p {...stylex.props(styles.name)}>{data.full_name}</p>
          <p {...stylex.props(styles.description)}>{data.description}</p>
        </div>

        <div {...stylex.props(styles.metadata)}>
          {data.language && (
            <div {...stylex.props(styles.metadataItem)}>
              <span
                {...stylex.props(styles.languageDot)}
                style={{ backgroundColor: languageColor }}
              />
              <span>{data.language}</span>
            </div>
          )}
          <div {...stylex.props(styles.metadataItem)}>
            <span role="img" aria-label="star">
              ★
            </span>
            <span>{data.stargazers_count}</span>
          </div>
        </div>
      </div>

      {data.owner?.avatar_url && (
        <div {...stylex.props(styles.avatarFrame)}>
          <img
            src={data.owner.avatar_url}
            alt={data.owner.login}
            {...stylex.props(styles.avatar)}
            width={64}
            height={64}
          />
        </div>
      )}
    </a>
  );
}
