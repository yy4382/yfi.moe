"use client";

import { useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const animationDuration = 300;
const threshold = 200;

type IndicatorStyle = CSSProperties & {
  "--progress": string;
};

export function LoadingIndicator() {
  const isPending = useRouterState({
    select: (state) => state.status === "pending",
  });
  const elementRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0.25);
  const hasStartedRef = useRef(false);
  const thresholdTimeoutRef = useRef<number | undefined>(undefined);
  const trickleIntervalRef = useRef<number | undefined>(undefined);
  const fadeTimeoutRef = useRef<number | undefined>(undefined);
  const resetTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const setProgress = (progress: number) => {
      progressRef.current = progress;
      elementRef.current?.style.setProperty("--progress", String(progress));
    };

    const setOpacity = (opacity: number) => {
      elementRef.current?.style.setProperty("opacity", String(opacity));
    };

    const clearLoadingTimers = () => {
      window.clearTimeout(thresholdTimeoutRef.current);
      window.clearInterval(trickleIntervalRef.current);
      thresholdTimeoutRef.current = undefined;
      trickleIntervalRef.current = undefined;
    };

    const clearCompletionTimers = () => {
      window.clearTimeout(fadeTimeoutRef.current);
      window.clearTimeout(resetTimeoutRef.current);
      fadeTimeoutRef.current = undefined;
      resetTimeoutRef.current = undefined;
    };

    if (isPending) {
      hasStartedRef.current = true;
      clearLoadingTimers();
      clearCompletionTimers();

      thresholdTimeoutRef.current = window.setTimeout(() => {
        setOpacity(1);
        trickleIntervalRef.current = window.setInterval(() => {
          setProgress(progressRef.current + Math.random() * 0.03);
        }, animationDuration);
      }, threshold);

      return () => {
        clearLoadingTimers();
      };
    }

    if (hasStartedRef.current) {
      hasStartedRef.current = false;
      clearLoadingTimers();
      clearCompletionTimers();

      setProgress(1);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setOpacity(0);
      }, animationDuration / 2);
      resetTimeoutRef.current = window.setTimeout(() => {
        setProgress(0.25);
      }, animationDuration * 2);
    }

    return clearCompletionTimers;
  }, [isPending]);

  return (
    <div
      aria-hidden="true"
      className="tanstack-loading-indicator"
      ref={elementRef}
      style={
        {
          "--progress": "0.25",
          opacity: 0,
        } as IndicatorStyle
      }
    />
  );
}
