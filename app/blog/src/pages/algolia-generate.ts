import algoliasearch from "algoliasearch";
import { getCollection, type CollectionEntry } from "astro:content";
import removeMD from "remove-markdown";
import runtimeEnv from "@utils/runtimeEnv";
import { algoliaConfig } from "@configs/algolia";
import { ALGOLIA_WRITE_API_KEY } from "astro:env/server";

export async function GET() {
  if (runtimeEnv() !== "production") {
    return new Response("Not found", { status: 404 });
  }

  if (!ALGOLIA_WRITE_API_KEY) {
    throw new Error("Algolia environment variables not set");
  }
  const client = algoliasearch(algoliaConfig.appId, ALGOLIA_WRITE_API_KEY);

  const posts = await getCollection("post");

  function post2Index(post: CollectionEntry<"post">) {
    const content = removeMD(post.body);
    const contentChunks = chunkString(content, 8000);

    if (contentChunks.length === 1) {
      return {
        objectID: post.slug,
        title: post.data.title,
        content: contentChunks[0],
        slug: post.slug,
      };
    }
    return contentChunks.map((chunk, index) => ({
      objectID: `${post.slug}_${index}`,
      title: post.data.title,
      content: chunk,
      slug: post.slug,
    }));
  }

  const index = posts.flatMap(post2Index);

  await client
    .initIndex("posts")
    .saveObjects(JSON.parse(JSON.stringify(index)))
    .then((res) => console.log(res, "algolia index updated"));

  return new Response("You shouldn't be here", { status: 404 });
}

function chunkString(str: string, maxBytes: number = 10000): string[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  let offset = 0;
  while (offset < bytes.length) {
    // Find a good splitting point within maxBytes
    let end = Math.min(offset + maxBytes, bytes.length);

    // If we're not at the end, try to avoid splitting multi-byte characters
    if (end < bytes.length) {
      while (end > offset && (bytes[end] & 0xc0) === 0x80) {
        end--;
      }
    }

    chunks.push(decoder.decode(bytes.subarray(offset, end)));
    offset = end;
  }

  return chunks;
}
