import { ofetch } from "ofetch";
import { VERCEL_AUTOMATION_BYPASS_SECRET, VERCEL_ENV } from "astro:env/server";

export function useSelfFetch(config: { origin: string }) {
  let headers: HeadersInit | undefined = undefined;

  if (VERCEL_ENV === "preview") {
    if (!VERCEL_AUTOMATION_BYPASS_SECRET) {
      console.error(
        "VERCEL_AUTOMATION_BYPASS_SECRET is not set, go to Vercel dashboard and enable it",
      );
      throw new Error("VERCEL_AUTOMATION_BYPASS_SECRET is not set");
    } else {
      headers = {
        "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET,
      };
    }
  }

  return ofetch.create({
    baseURL: config.origin,
    headers,
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
