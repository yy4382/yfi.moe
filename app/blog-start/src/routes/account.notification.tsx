import { createFileRoute } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import { Unsubscribe } from "@/components/management/subscribe";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/account/notification")({
  head: () =>
    buildSeo({
      title: "邮件通知设定",
      description: "邮件通知设定",
      noindex: true,
      canonical: "https://yfi.moe/account/notification",
    }),
  component: AccountNotificationPage,
});

function AccountNotificationPage() {
  return (
    <NavLayout>
      <div className="mx-auto mt-10 flex min-h-[80lvh] max-w-md flex-col gap-4">
        <h1 className="text-2xl font-bold">邮件通知设定</h1>
        <Unsubscribe />
      </div>
    </NavLayout>
  );
}
