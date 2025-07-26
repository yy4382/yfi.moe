import { Text, Link, Section } from "@react-email/components";
import { BaseTemplate } from "./base-template";
import * as React from "react";

interface CommentReplyEmailProps {
  authorName: string;
  postTitle: string;
  postSlug: string;
  commentContent: string;
  unsubscribeUrl?: string;
}

export const CommentReplyEmail = ({
  authorName,
  postTitle,
  postSlug,
  commentContent,
  unsubscribeUrl,
}: CommentReplyEmailProps) => {
  return (
    <BaseTemplate
      title="New reply to your comment"
      unsubscribeUrl={unsubscribeUrl}
    >
      <>
        <Text style={text}>
          <strong>{authorName}</strong> has replied to your comment on &quot;
          {postTitle}&quot;:
        </Text>

        <Section style={blockquote}>
          <Text style={quoteText}>&quot;{commentContent}&quot;</Text>
        </Section>

        <Text style={text}>
          <Link href={`https://yfi.moe/post/${postSlug}`} style={button}>
            View Comment
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
  borderLeft: "3px solid #0070f3",
  paddingLeft: "16px",
  margin: "24px 0",
  backgroundColor: "#f8fafc",
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
  backgroundColor: "#0070f3",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "600",
  display: "inline-block",
};
