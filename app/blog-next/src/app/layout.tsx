import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/elements/navbar";
import Footer from "@/components/elements/footer/footer";
import { getOpenGraph } from "./metadata";
import { umamiConfig, googleMeasurementId } from "@/config/track";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

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
    <html lang="zh-Hans">
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <TrackingTags />
      </head>
      <body
        className="m-0 overflow-x-hidden bg-bg bg-fixed p-0 text-content"
        style={{ textRendering: "optimizeLegibility" }}
      >
        <div className="grid min-h-[100lvh] grid-rows-[auto_auto_1fr_auto]">
          <Navbar />
          <div className="w-full">{children}</div>
          <section className="h-full min-h-12 bg-grid border-b border-container" />
          <Footer />
        </div>
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
      <GoogleAnalytics
        gaId={googleMeasurementId}
        debugMode={process.env.VERCEL_ENV !== "production"}
      />
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
