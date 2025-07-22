import { Text, Link, Section } from "@react-email/components";
import { BaseTemplate } from "./base-template";

interface AdminNewCommentEmailProps {
  authorName: string;
  authorEmail: string;
  postTitle: string;
  postSlug: string;
  commentContent: string;
}

export const AdminNewCommentEmail = ({
  authorName,
  authorEmail,
  postTitle,
  postSlug,
  commentContent,
}: AdminNewCommentEmailProps) => {
  return (
    <BaseTemplate title="New comment requires moderation">
      <>
        <Text style={text}>
          A new comment has been posted on "{postTitle}" and may require
          moderation:
        </Text>

        <Section style={blockquote}>
          <Text style={quoteText}>"{commentContent}"</Text>
        </Section>

        <Text style={text}>
          <strong>By:</strong> {authorName} (
          <Link href={`mailto:${authorEmail}`} style={emailLink}>
            {authorEmail}
          </Link>
          )
        </Text>

        <Text style={text}>
          <Link href="https://yfi.moe/admin/comments" style={button}>
            Manage Comments
          </Link>
        </Text>
      </>
    </BaseTemplate>
  );
};

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

const quoteText = {
  fontSize: "15px",
  fontStyle: "italic",
  color: "#555555",
  margin: "0",
};

const button = {
  backgroundColor: "#f59e0b",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "600",
  display: "inline-block",
};

const emailLink = {
  color: "#0070f3",
  textDecoration: "underline",
};
