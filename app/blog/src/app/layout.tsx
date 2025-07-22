import { umamiConfig /*, googleMeasurementId*/ } from "@/config/track";
import type { Metadata } from "next";
import "./globals.css";
import { getOpenGraph } from "./metadata";
// import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://yfi.moe"),
  title: {
    default: "Yunfi",
    template: "%s | Yunfi",
  },
  description: "笔记与分享，代码和生活",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: getOpenGraph(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <TrackingTags />
      </head>
      <body style={{ textRendering: "optimizeLegibility" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

function TrackingTags() {
  return (
    <>
      <Script
        defer
        src={umamiConfig.src}
        data-website-id={umamiConfig.websiteId}
        data-domains={umamiConfig.domains.join(",")}
      />
      {/* <GoogleAnalytics
        gaId={googleMeasurementId}
        debugMode={process.env.VERCEL_ENV !== "production"}
      /> */}
      <Script id="microsoft-clarity">
        {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "rf5k9triig");
            `}
      </Script>
    </>
  );
}
