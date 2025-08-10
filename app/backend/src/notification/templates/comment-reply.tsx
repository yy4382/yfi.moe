import { Text, Link, Section } from "@react-email/components";
import { BaseTemplate } from "./base-template.js";
import type { CSSProperties } from "react";

interface CommentReplyEmailProps {
  authorName: string;
  postSlug: string;
  newCommentHtml: string;
  newCommentText: string;
  parentCommentHtml: string;
  unsubscribeUrl?: string;
  frontendUrl: string;
}

export const CommentReplyEmail = ({
  authorName,
  postSlug,
  newCommentHtml,
  newCommentText,
  parentCommentHtml,
  unsubscribeUrl,
  frontendUrl,
}: CommentReplyEmailProps) => {
  return (
    <BaseTemplate
      title="您的评论被回复了"
      unsubscribeUrl={unsubscribeUrl}
      previewText={`您的评论被回复了：${newCommentText.slice(0, 50)}`}
    >
      <>
        <Text style={text}>
          <strong>{authorName}</strong> 回复了您的评论:
        </Text>

        <Text style={sectionTitle}>新回复</Text>
        <Section style={blockquoteReply}>
          <div
            style={htmlWrapper}
            dangerouslySetInnerHTML={{ __html: newCommentHtml }}
          />
        </Section>

        <Text style={sectionTitle}>您发布的被回复的原评论</Text>
        <Section style={blockquoteParent}>
          <div
            style={htmlWrapper}
            dangerouslySetInnerHTML={{ __html: parentCommentHtml }}
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

CommentReplyEmail.PreviewProps = {
  authorName: "John Doe",
  postSlug: "/post/my-first-post",
  newCommentHtml: "<p>This is a <strong>new reply</strong> with HTML.</p>",
  newCommentText: "This is a new reply with HTML.",
  parentCommentHtml: "<p>This is the <em>original comment</em> content.</p>",
  unsubscribeUrl: "https://example.com/unsubscribe",
  frontendUrl: "https://example.com",
} satisfies CommentReplyEmailProps;

export default CommentReplyEmail;

const text = {
  fontSize: "16px",
  color: "#333333",
  margin: "16px 0",
};

const blockquoteBase: CSSProperties = {
  padding: "4px 16px",
  marginBottom: 24,
  borderRadius: "4px",
  width: "100%",
};

const blockquoteReply = {
  ...blockquoteBase,
  borderLeft: "3px solid #0070f3",
  backgroundColor: "#f0f7ff",
} as const;

const blockquoteParent = {
  ...blockquoteBase,
  borderLeft: "3px solid #64748b",
  backgroundColor: "#f8fafc",
} as const;

const sectionTitle = {
  fontSize: "14px",
  color: "#475569",
  margin: "0 0 8px 0",
  fontWeight: 600,
};

const htmlWrapper = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.6",
} as const;

const button = {
  backgroundColor: "#0070f3",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "600",
  display: "inline-block",
};
