<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>
          <xsl:value-of select="/rss/channel/title" /> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style type="text/css">
          html {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            color: #111827;
          }
          .background {
            background-color: #f3f4f6;
          }
          .card {
            background-color: #e5e7eb;
          }
          a {
            color: #2563eb;
            text-decoration-line: none;
          }
          a:hover {
            text-decoration-line: underline;
          }
          a:visited {
            color: #9333ea;
          }
          @media (prefers-color-scheme: dark) {
            html {
              color: #f3f4f6;
            }
            a {
              color:#60a5fa;
            }
            a:visited {
              color: #c084fc;
            }
            .card {
              background-color: #374151;
            }
            .background {
              background-color: #111827;
            }
          }
        </style>
      </head>
      <body class="background">
        <div style="margin: 1rem auto; max-width: 42rem;">
          <header style="padding-bottom: 1rem;">
            <h1>
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="vertical-align: text-bottom; width: 1.2em; height: 1.2em; padding-right: 1rem;" id="RSSicon" viewBox="0 0 256 256">
                <defs>
                  <linearGradient x1="0.085" y1="0.085" x2="0.915" y2="0.915" id="RSSg">
                    <stop offset="0.0" stop-color="#E3702D" />
                    <stop offset="0.1071" stop-color="#EA7D31" />
                    <stop offset="0.3503" stop-color="#F69537" />
                    <stop offset="0.5" stop-color="#FB9E3A" />
                    <stop offset="0.7016" stop-color="#EA7C31" />
                    <stop offset="0.8866" stop-color="#DE642B" />
                    <stop offset="1.0" stop-color="#D95B29" />
                  </linearGradient>
                </defs>
                <rect width="256" height="256" rx="55" ry="55" x="0" y="0" fill="#CC5D15" />
                <rect width="246" height="246" rx="50" ry="50" x="5" y="5" fill="#F49C52" />
                <rect width="236" height="236" rx="47" ry="47" x="10" y="10" fill="url(#RSSg)" />
                <circle cx="68" cy="189" r="24" fill="#FFF" />
                <path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="#FFF" />
                <path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="#FFF" />
              </svg>
              <xsl:value-of select="/rss/channel/title" />
            </h1>
            <p>
              <xsl:value-of select="/rss/channel/description" />
            </p>
            <a class="head_link" target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link" />
              </xsl:attribute>
              <span> Visit Website </span>
            </a>
          </header>
          <div style="padding-bottom: 1rem;">
            <h2>Notice</h2>
            <div style="font-size: 0.875rem;">
              <p>
                这是一个 RSS 源！不是一个网页。
              </p>
              <p>
                如果你正在阅读这段文字，说明你直接在浏览器中打开了这个地址。
                请将浏览器地址栏中的 URL 复制到您的 RSS 阅读器中。
              </p>
              <p>
                如果你不知道什么是 RSS 阅读器，可以查看我的文章： <a href="http://yfi.moe/post/all-about-rss/" target="_blank">RSS: 是什么？为什么？怎么用？</a>。 
              </p>
            </div>
          </div>
          <h2>Recent Items</h2>
          <xsl:for-each select="/rss/channel/item">
            <div class="card" style="padding: 0.5rem 1rem 0.5rem; margin: 0.5rem 0rem; border-radius: 0.25rem;">
              <h3 style="margin: 0rem; font-size: 1rem;">
                <a target="_blank">
                  <xsl:attribute name="href">
                    <xsl:value-of select="link" />
                  </xsl:attribute>
                  <xsl:value-of select="title" />
                </a>
              </h3>
              <small style="font-size: 0.75rem;"> Published: <xsl:value-of select="pubDate" />
              </small>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>