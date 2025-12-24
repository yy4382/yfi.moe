import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

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
      <div className="flex flex-col gap-4">
        <div className="text-green-600">取消订阅成功</div>
        <p className="text-sm text-gray-600">
          如果您后悔了，可以点击下面的按钮重新订阅邮件通知。
        </p>
        <button
          onClick={() => resubscribeMutation.mutate()}
          disabled={resubscribeMutation.isPending}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {resubscribeMutation.isPending ? "重新订阅中..." : "重新订阅"}
        </button>
        {resubscribeMutation.error && (
          <div className="text-red-600">
            重新订阅失败: {resubscribeMutation.error.message}
          </div>
        )}
      </div>
    );
  }

  if (resubscribeMutation.data && !isUnsubscribed) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-green-600">重新订阅成功</div>
        <p className="text-sm text-gray-600">
          您已重新订阅邮件通知，将会收到新评论的邮件提醒。
        </p>
        <button
          onClick={() => unsubscribeMutation.mutate()}
          disabled={unsubscribeMutation.isPending}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {unsubscribeMutation.isPending ? "取消订阅中..." : "取消订阅"}
        </button>
        {unsubscribeMutation.error && (
          <div className="text-red-600">
            取消订阅失败: {unsubscribeMutation.error.message}
          </div>
        )}
      </div>
    );
  }

  if (unsubscribeMutation.error) {
    return (
      <div className="text-red-600">
        取消订阅失败: {unsubscribeMutation.error.message}
      </div>
    );
  }

  if (unsubscribeMutation.isPending) {
    return <div>取消订阅中...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        点击下面的按钮来取消邮件通知订阅，您将不再收到新评论的邮件提醒。
      </p>
      <button
        onClick={() => unsubscribeMutation.mutate()}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        取消订阅
      </button>
    </div>
  );
}
