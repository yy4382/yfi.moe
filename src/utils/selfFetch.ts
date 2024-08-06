import { ofetch } from "ofetch";

export function useSelfFetch(config: { origin: string }) {
  return ofetch.create({
    baseURL: config.origin,
    headers:
      import.meta.env.VERCEL_ENV === "preview"
        ? {
            "x-vercel-protection-bypass": import.meta.env
              .VERCEL_AUTOMATION_BYPASS_SECRET,
          }
        : undefined,
    parseResponse: JSON.parse,
  });
}

export default async function $selfFetch<T>(
  url: string,
  options: {
    origin: string;
  },
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const fetch = useSelfFetch({ origin: options.origin });

  let data: T | null = null;
  let error: string | null = null;

  try {
    data = await fetch(url);
  } catch (err) {
    console.error("error in fetching data in NodeList.astro", error);
    error =
      err instanceof Error
        ? err.message
        : "Server error, please try again later.";
  }

  if (data === null) error = "No data found";
  if (error !== null) data = null;

  // @ts-expect-error typescript is not smart enough
  return { data, error };
}
