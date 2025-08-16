"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./theme-provider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
        <ToasterWithTheme />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ToasterWithTheme() {
  const theme = useTheme();
  return <Toaster theme={theme} />;
}
