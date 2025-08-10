import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Font,
  Link,
  Preview,
  Column,
  Row,
  Img,
} from "@react-email/components";
import React from "react";

interface BaseTemplateProps {
  children: React.ReactNode;
  title: string;
  previewText: string;
  unsubscribeUrl?: string;
}

export const BaseTemplate = ({
  children,
  title,
  previewText,
  unsubscribeUrl,
}: BaseTemplateProps) => {
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
        <Preview>{previewText}</Preview>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column style={{ width: "80%" }}>
                <Section width="fit-content" align="left">
                  <Row>
                    <Column>
                      <Img
                        alt="Yunfi"
                        height="42"
                        style={{
                          borderRadius: "4px",
                        }}
                        src="https://yfi.moe/icon.png"
                      />
                    </Column>
                    <Column>
                      <Text
                        style={{
                          fontSize: "24px",
                          fontWeight: 600,
                          marginLeft: 10,
                        }}
                      >
                        Yunfi
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Text style={heading}>{title}</Text>
            {children}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              祝好，
              <br />
              <strong>Yunfi</strong>
            </Text>

            <Hr style={hr} />

            <Text style={footerMuted}>
              您收到这封邮件是因为您在 yfi.moe
              上注册了账号。如果不想被打扰，您可以
              {unsubscribeUrl && (
                <>
                  <Link href={unsubscribeUrl} style={unsubscribeLink}>
                    取消邮件通知
                  </Link>
                  。
                </>
              )}
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
  padding: "24px 0 48px",
  maxWidth: "600px",
};

const header = {
  paddingTop: 40,
  paddingBottom: 40,
  paddingLeft: 24,
  paddingRight: 24,
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

const unsubscribeLink = {
  color: "#8b5cf6",
  textDecoration: "underline",
};
