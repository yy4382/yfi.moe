import { Text, Link, Section, CodeInline } from "@react-email/components";
import type { CSSProperties } from "react";
import { BaseTemplate } from "@/notification/templates/base-template.js";

interface AdminNewCommentEmailProps {
  authorName: string;
  postSlug: string;
  commentContentHtml: string;
  commentContentText: string;
  unsubscribeUrl?: string;
  frontendUrl: string;
  isSpam: boolean;
}

export const AdminNewCommentEmail = ({
  authorName,
  postSlug,
  commentContentHtml,
  commentContentText,
  unsubscribeUrl,
  frontendUrl,
  isSpam,
}: AdminNewCommentEmailProps) => {
  return (
    <BaseTemplate
      title="新评论被发布"
      unsubscribeUrl={unsubscribeUrl}
      previewText={`在 ${postSlug.split("/").at(-1) ?? postSlug} 有新评论：${commentContentText.slice(0, 50)}`}
    >
      <>
        <Text style={text}>
          {authorName} 在 <CodeInline style={codeInline}>{postSlug}</CodeInline>{" "}
          发表了新评论{isSpam && <span style={spamBadge}>【垃圾评论】</span>}：
        </Text>

        <Section style={blockquote}>
          <div
            style={htmlWrapper}
            dangerouslySetInnerHTML={{ __html: commentContentHtml }}
          />
        </Section>

        <Text style={text}>
          <Link href={new URL(postSlug, frontendUrl).toString()} style={button}>
            查看该评论
          </Link>
        </Text>
      </>
    </BaseTemplate>
  );
};

AdminNewCommentEmail.PreviewProps = {
  authorName: "John Doe",
  postSlug: "/post/test-post",
  commentContentHtml:
    "<p>This is a test comment</p><p>This is a test comment</p>",
  commentContentText: "This is a test comment\nThis is a test comment",
  unsubscribeUrl: "https://yfi.moe/unsubscribe",
  frontendUrl: "https://example.com",
  isSpam: true,
} satisfies AdminNewCommentEmailProps;

export default AdminNewCommentEmail;

const text = {
  fontSize: "16px",
  color: "#333333",
  margin: "16px 0",
};

const blockquote = {
  borderLeft: "3px solid #f59e0b",
  paddingLeft: "16px",
  margin: "24px 0",
  backgroundColor: "#fffbeb",
  padding: "16px",
  borderRadius: "4px",
};

const htmlWrapper = {
  fontSize: "15px",
  fontStyle: "italic",
  color: "#555555",
  margin: "0",
};

const button = {
  backgroundColor: "#8b5cf6",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "600",
  display: "inline-block",
};

const codeInline: CSSProperties = {
  backgroundColor: "rgb(209,213,219)",
  borderRadius: 6,
  paddingLeft: 4,
  paddingRight: 4,
  paddingTop: 2,
  paddingBottom: 2,
};

const spamBadge: CSSProperties = {
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
  marginLeft: "8px",
};
