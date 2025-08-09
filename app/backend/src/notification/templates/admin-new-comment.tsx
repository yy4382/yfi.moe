import { Text, Link, Section } from "@react-email/components";
import { BaseTemplate } from "./base-template.js";

interface AdminNewCommentEmailProps {
  authorName: string;
  postTitle: string;
  postSlug: string;
  commentContent: string;
  unsubscribeUrl?: string;
}

export const AdminNewCommentEmail = ({
  authorName,
  postTitle,
  commentContent,
  unsubscribeUrl,
}: AdminNewCommentEmailProps) => {
  return (
    <BaseTemplate
      title="New comment requires moderation"
      unsubscribeUrl={unsubscribeUrl}
    >
      <>
        <Text style={text}>
          A new comment has been posted on &quot;{postTitle}&quot; and may
          require moderation:
        </Text>

        <Section style={blockquote}>
          <Text style={quoteText}>&quot;{commentContent}&quot;</Text>
        </Section>

        <Text style={text}>
          <strong>By:</strong> {authorName}
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

AdminNewCommentEmail.PreviewProps = {
  authorName: "John Doe",
  postTitle: "My First Post",
  postSlug: "my-first-post",
  commentContent: "This is a test comment",
  unsubscribeUrl: "https://yfi.moe/unsubscribe",
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
