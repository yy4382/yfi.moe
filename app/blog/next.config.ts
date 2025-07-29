/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextConfig } from "next";
import withBundleAnalyzerFn from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // @ts-expect-error find rule
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /^$/,
      },
      {
        test: /\.svg$/i,
        resourceQuery: /source/,
        type: "asset/source",
      },
    );
    return config;
  },
  compiler: {
    removeConsole: { exclude: ["error", "warn", "info"] },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    reactCompiler: true,
  },
};

const withBundleAnalyzer = withBundleAnalyzerFn({
  enabled: process.env.ANALYZE === "true",
});
export default withBundleAnalyzer(nextConfig);
