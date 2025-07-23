import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Font,
} from "@react-email/components";
import React from "react";

interface BaseTemplateProps {
  children: React.ReactNode;
  title: string;
}

export const BaseTemplate = ({ children, title }: BaseTemplateProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>yfi.moe</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>{title}</Text>
            {children}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Best regards,
              <br />
              <strong>yfi.moe</strong>
            </Text>
            <Text style={footerMuted}>
              You're receiving this email because you're subscribed to
              notifications on yfi.moe.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '"Inter", "Arial", sans-serif',
  lineHeight: "1.6",
  color: "#333333",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0070f3",
  margin: "0",
};

const content = {
  padding: "0 20px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
  marginTop: "0",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "32px 0",
};

const footer = {
  padding: "0 20px",
};

const footerText = {
  fontSize: "14px",
  color: "#666666",
  marginBottom: "8px",
};

const footerMuted = {
  fontSize: "12px",
  color: "#999999",
  margin: "0",
};
