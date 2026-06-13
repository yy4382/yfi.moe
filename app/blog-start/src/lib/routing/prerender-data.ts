type PrerenderMatch = {
  l?: unknown;
};

type PrerenderRouterState = {
  matches?: PrerenderMatch[];
};

type PrerenderWindow = Window & {
  $_TSR?: {
    router?: PrerenderRouterState;
  };
};

export function getPrerenderedLoaderData<T>(): T | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const matches = (window as PrerenderWindow).$_TSR?.router?.matches;
  if (!Array.isArray(matches)) {
    return undefined;
  }

  for (let index = matches.length - 1; index >= 0; index--) {
    if (matches[index]?.l !== undefined) {
      return matches[index].l as T;
    }
  }

  return undefined;
}
