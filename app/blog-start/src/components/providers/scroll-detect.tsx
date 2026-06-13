"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";
import type { FC, PropsWithChildren } from "react";
import { useLayoutEffect, useMemo, useRef, useEffectEvent } from "react";
import { throttle } from "@/lib/utils/debounce";

const pageScrollLocationAtom = atom(0);
const pageScrollDirectionAtom = atom<"up" | "down" | null>(null);

export const PageScrollInfoProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <ScrollDetector />
      {children}
    </>
  );
};

const ScrollDetector = () => {
  const setPageScrollLocation = useEffectEvent(
    useSetAtom(pageScrollLocationAtom),
  );
  const setPageScrollDirection = useEffectEvent(
    useSetAtom(pageScrollDirectionAtom),
  );
  const prevScrollY = useRef(0);

  // Reset on mount so route transitions do not inherit a stale scroll state.
  useLayoutEffect(() => {
    setPageScrollDirection(null);
    setPageScrollLocation(0);
  }, []);

  useLayoutEffect(() => {
    const scrollHandler = throttle(
      () => {
        let currentTop = document.documentElement.scrollTop;

        // 当 radix modal 被唤出，body 会被设置为 fixed，此时需要获取 body 的 top 值。
        // 只有在 mobile 端会出现这种逻辑
        if (currentTop === 0) {
          const bodyStyle = document.body.style;
          if (bodyStyle.position === "fixed") {
            const bodyTop = bodyStyle.top;
            currentTop = Math.abs(Number.parseInt(bodyTop, 10));
          }
        }
        setPageScrollDirection(
          prevScrollY.current - currentTop > 0 ? "up" : "down",
        );
        prevScrollY.current = currentTop;

        setPageScrollLocation(prevScrollY.current);
      },
      16,
      {
        leading: false,
      },
    );
    window.addEventListener("scroll", scrollHandler);

    scrollHandler();

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return null;
};

const usePageScrollLocation = () => useAtomValue(pageScrollLocationAtom);
const usePageScrollDirection = () => useAtomValue(pageScrollDirectionAtom);

const useIsScrollDownAndPageIsOver = (threshold: number) => {
  return useAtomValue(
    useMemo(
      () =>
        atom((get) => {
          const scrollLocation = get(pageScrollLocationAtom);
          const scrollDirection = get(pageScrollDirectionAtom);
          return scrollLocation > threshold && scrollDirection === "down";
        }),
      [threshold],
    ),
  );
};

const usePageIsOver = (threshold: number) => {
  return useAtomValue(
    useMemo(
      () => atom((get) => get(pageScrollLocationAtom) > threshold),
      [threshold],
    ),
  );
};

export {
  useIsScrollDownAndPageIsOver,
  usePageScrollDirection,
  usePageScrollLocation,
  usePageIsOver,
};
