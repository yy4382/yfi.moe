import { createFileRoute, Link } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import { Section } from "@/components/ui/section";
import { contactInfo } from "@/config/author";
import { buildSeo } from "@/lib/utils/seo";

const mailToLink = contactInfo.find((info) =>
  info.link.startsWith("mailto:"),
)?.link;

export const Route = createFileRoute("/404")({
  head: () =>
    buildSeo({
      title: "404",
      canonical: "https://yfi.moe/404",
    }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <NavLayout>
      <Section className="mx-auto my-24 max-w-xl px-8 text-heading">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-semibold">哎呀！网页走丢啦</h1>
            <p>您遇到了一个 404 错误。</p>
          </div>
          <div className="flex flex-col gap-2">
            您可以：
            <div className="flex gap-4">
              <Link
                className="block rounded-md bg-primary/80 p-2 text-black"
                to="/"
              >
                返回首页
              </Link>
              <button
                className="rounded-md bg-primary/80 p-2 text-black"
                type="button"
                onClick={() => {
                  if (!mailToLink) {
                    alert("站长未设置联系邮箱");
                    return;
                  }
                  const subject = `404 问题反馈：${window.location.href}`;
                  const body =
                    `在该 URL 中遇到了 404 问题：${window.location.href}\n\n` +
                    `可以告诉我们您在哪里发现了这个 404 的 URL 吗？\n\n\n` +
                    `有其他需要反馈的相关信息吗？\n\n\n` +
                    `自动生成的诊断信息：\n` +
                    `UA: ${navigator.userAgent}\n` +
                    `上一个页面：${document.referrer}\n` +
                    `*如果您不愿意与我们分享该信息，可以自行删除\n`;
                  window.open(
                    `${mailToLink}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                    "_blank",
                  );
                }}
              >
                通过邮件联系我
              </button>
            </div>
          </div>
          <div className="prose dark:prose-invert">
            <h2>为什么会遇到这个错误？</h2>
            <p>这可能是因为：</p>
            <ul>
              <li>您输入的网址有误</li>
              <li>您访问的页面已被删除或移动</li>
              <li>其他地方给出的本站网址有误</li>
            </ul>
          </div>
        </div>
      </Section>
    </NavLayout>
  );
}
