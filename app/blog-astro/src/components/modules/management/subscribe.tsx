import * as stylex from "@stylexjs/stylex";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  colors,
  motion,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: spacing.lg },
  copy: {
    color: colors.textSecondary,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineRelaxed,
    margin: 0,
  },
  success: { color: colors.success, fontWeight: typography.weightSemibold },
  error: { color: colors.danger },
  button: {
    border: 0,
    borderRadius: radii.md,
    color: colors.textOnAccent,
    cursor: "pointer",
    fontWeight: typography.weightMedium,
    paddingBlock: spacing.sm,
    paddingInline: spacing.lg,
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, opacity",
    transitionTimingFunction: motion.easeStandard,
    ":disabled": { cursor: "wait", opacity: 0.5 },
  },
  dangerButton: {
    backgroundColor: colors.danger,
    ":hover": { backgroundColor: colors.dangerText },
  },
  restoreButton: {
    backgroundColor: colors.accentText,
    ":hover": { opacity: 0.86 },
  },
});

function UnsubscribeWrapper() {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null,
  );
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchParams(searchParams);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      {searchParams ? (
        <Unsubscribe searchParams={searchParams} />
      ) : (
        <div>Loading...</div>
      )}
    </QueryClientProvider>
  );
}

export { UnsubscribeWrapper as Unsubscribe };

function Unsubscribe({ searchParams }: { searchParams: URLSearchParams }) {
  const email = searchParams.get("email");
  const signature = searchParams.get("signature");
  const expiresAtTimestampSec = searchParams.get("expiresAtTimestampSec");
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!email || !signature || !expiresAtTimestampSec) {
        throw new Error("请求 URL 不完整");
      }
      const result1 = await client.account.notification.unsubscribe.$post({
        json: {
          email,
          credentials: {
            signature,
            expiresAtTimestampSec: parseInt(expiresAtTimestampSec),
          },
        },
      });
      const resultJson = await result1.json();
      if (!resultJson.success) {
        throw new Error(resultJson.cause);
      }
      return true;
    },
    onSuccess: () => setIsUnsubscribed(true),
  });

  const resubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!email || !signature || !expiresAtTimestampSec) {
        throw new Error("请求 URL 不完整");
      }
      const result1 = await client.account.notification.resubscribe.$post({
        json: {
          email,
          credentials: {
            signature,
            expiresAtTimestampSec: parseInt(expiresAtTimestampSec),
          },
        },
      });
      const resultJson = await result1.json();
      if (!resultJson.success) {
        throw new Error(resultJson.cause);
      }
      return true;
    },
    onSuccess: () => setIsUnsubscribed(false),
  });

  if (!email || !signature || !expiresAtTimestampSec) {
    return <div>请求 URL 不完整</div>;
  }

  if (unsubscribeMutation.data && isUnsubscribed) {
    return (
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.success)}>取消订阅成功</div>
        <p {...stylex.props(styles.copy)}>
          如果您后悔了，可以点击下面的按钮重新订阅邮件通知。
        </p>
        <button
          onClick={() => resubscribeMutation.mutate()}
          disabled={resubscribeMutation.isPending}
          {...stylex.props(styles.button, styles.restoreButton)}
        >
          {resubscribeMutation.isPending ? "重新订阅中..." : "重新订阅"}
        </button>
        {resubscribeMutation.error && (
          <div {...stylex.props(styles.error)}>
            重新订阅失败: {resubscribeMutation.error.message}
          </div>
        )}
      </div>
    );
  }

  if (resubscribeMutation.data && !isUnsubscribed) {
    return (
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.success)}>重新订阅成功</div>
        <p {...stylex.props(styles.copy)}>
          您已重新订阅邮件通知，将会收到新评论的邮件提醒。
        </p>
        <button
          onClick={() => unsubscribeMutation.mutate()}
          disabled={unsubscribeMutation.isPending}
          {...stylex.props(styles.button, styles.dangerButton)}
        >
          {unsubscribeMutation.isPending ? "取消订阅中..." : "取消订阅"}
        </button>
        {unsubscribeMutation.error && (
          <div {...stylex.props(styles.error)}>
            取消订阅失败: {unsubscribeMutation.error.message}
          </div>
        )}
      </div>
    );
  }

  if (unsubscribeMutation.error) {
    return (
      <div {...stylex.props(styles.error)}>
        取消订阅失败: {unsubscribeMutation.error.message}
      </div>
    );
  }

  if (unsubscribeMutation.isPending) {
    return <div>取消订阅中...</div>;
  }

  return (
    <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.copy)}>
        点击下面的按钮来取消邮件通知订阅，您将不再收到新评论的邮件提醒。
      </p>
      <button
        onClick={() => unsubscribeMutation.mutate()}
        {...stylex.props(styles.button, styles.dangerButton)}
      >
        取消订阅
      </button>
    </div>
  );
}
