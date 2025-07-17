import type { NextConfig } from "next";

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
    removeConsole: false,
  },
};

export default nextConfig;
