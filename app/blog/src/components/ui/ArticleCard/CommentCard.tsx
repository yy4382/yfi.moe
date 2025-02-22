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
    dark: "html.dark",
    lang: "zh-CN",
    search: false,
    emoji: false,
    requiredMeta: ["nick", "mail"],
    ...props,
  };
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...config,
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update(config);
  }, [config]);

  return <div ref={containerRef} />;
};

export { Waline as default };
