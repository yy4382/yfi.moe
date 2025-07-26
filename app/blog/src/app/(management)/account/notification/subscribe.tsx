"use client";

import { honoClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export function Unsubscribe() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const signature = searchParams.get("signature");
  const expiresAtTimestampSec = searchParams.get("expiresAtTimestampSec");
  const { mutate, data, error, isPending } = useMutation({
    mutationFn: async () => {
      if (!email || !signature || !expiresAtTimestampSec) {
        throw new Error("请求 URL 不完整");
      }
      const res = await honoClient.account.notification.unsubscribe.$post({
        json: {
          email,
          credentials: {
            signature,
            expiresAtTimestampSec: parseInt(expiresAtTimestampSec),
          },
        },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error("cause" in data ? (data.cause as string) : "未知错误");
      }
      return true;
    },
  });
  if (!email || !signature || !expiresAtTimestampSec) {
    return <div>请求 URL 不完整</div>;
  }
  if (data) {
    return <div>取消订阅成功</div>;
  }
  if (error) {
    return <div>取消订阅失败: {error.message}</div>;
  }
  if (isPending) {
    return <div>取消订阅中...</div>;
  }
  return <button onClick={() => mutate()}>取消订阅</button>;
}
