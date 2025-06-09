import React, { useEffect, useRef } from "react";
import {
  type WalineInstance,
  type WalineInitOptions,
  init,
} from "@waline/client";

import "@waline/client/style";

export type WalineOptions = Omit<WalineInitOptions, "el"> & { path: string };

const Waline = (props: WalineOptions) => {
  const config: WalineOptions = {
    dark: "auto",
    lang: "zh-CN",
    search: false,
    emoji: false,
    reaction: false,
    requiredMeta: ["nick", "mail"],
    ...props,
  };
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...config,
      path: window.location.pathname.endsWith("/")
        ? window.location.pathname.slice(0, -1)
        : window.location.pathname,
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    document.addEventListener("astro:before-preparation", () => {
      walineInstanceRef.current?.destroy();
    });
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update(config);
  }, [config]);

  return <div ref={containerRef} />;
};

export { Waline as default };
