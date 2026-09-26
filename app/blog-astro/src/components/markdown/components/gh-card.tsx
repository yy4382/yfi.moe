import type { components } from "@octokit/openapi-types";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { cardMarker, styles } from "./gh-card.stylex";

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
  <div className={`not-prose ${stylex.props(styles.skeleton).className}`}>
    <div {...stylex.props(styles.skeletonBody)}>
      <div>
        <div {...stylex.props(styles.skeletonLine, styles.skeletonTitle)}></div>
        <div
          {...stylex.props(styles.skeletonLine, styles.skeletonDescription)}
        ></div>
        <div
          {...stylex.props(
            styles.skeletonLine,
            styles.skeletonDescriptionShort,
          )}
        ></div>
      </div>
      <div {...stylex.props(styles.skeletonMeta)}>
        <div
          {...stylex.props(styles.skeletonLine, styles.skeletonLanguage)}
        ></div>
        <div {...stylex.props(styles.skeletonLine, styles.skeletonStars)}></div>
      </div>
    </div>
  </div>
);

export const GhCard = ({ user, repo }: { user: string; repo: string }) => {
  if (!user || !repo) {
    return (
      <div {...stylex.props(styles.invalid)}>
        Invalid GitHub repository URL provided: {user}/{repo}
      </div>
    );
  }
  const repoUrl = `https://github.com/${user}/${repo}`;

  return (
    <div {...stylex.props(styles.centered)}>
      <ErrorBoundary
        fallbackRender={() => (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`not-prose ${stylex.props(styles.messageCard, styles.fallbackMessage).className}`}
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
    void fetchData();
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
        className={`not-prose ${stylex.props(styles.loadingLink).className}`}
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
        className={`not-prose ${stylex.props(styles.messageCard, styles.errorMessage).className}`}
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

  const cardProps = stylex.props(
    cardMarker,
    styles.card,
    styles.cardBorder(`${color}30`),
  );

  return (
    <a
      href={data.html_url}
      target="_blank"
      rel="noopener noreferrer"
      {...cardProps}
      className={`not-prose ${cardProps.className}`}
    >
      <div {...stylex.props(styles.cardBody)}>
        <div {...stylex.props(styles.summary)}>
          <p {...stylex.props(styles.repoName)}>{data.full_name}</p>
          <p {...stylex.props(styles.description)}>{data.description}</p>
        </div>

        <div {...stylex.props(styles.metadata)}>
          {data.language && (
            <div {...stylex.props(styles.language)}>
              <span {...stylex.props(styles.languageDot(color))} />
              <span>{data.language}</span>
            </div>
          )}
          <div {...stylex.props(styles.stars)}>
            {/* Icon placeholder */}
            <span role="img" aria-label="star">
              ★
            </span>
            <span>{data.stargazers_count}</span>
          </div>
        </div>
      </div>

      {data.owner?.avatar_url && (
        <div {...stylex.props(styles.avatarContainer)}>
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
