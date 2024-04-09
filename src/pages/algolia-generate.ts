import algoliasearch from "algoliasearch";
import { getCollection, type CollectionEntry } from "astro:content";
import removeMD from "remove-markdown";
if (!process.env.ALGOLIA_WRITE_API_KEY) {
  throw new Error("Algolia environment variables not set");
}
import { algoliaConfig } from "../config";
const client = algoliasearch(
  algoliaConfig.appId,
  process.env.ALGOLIA_WRITE_API_KEY,
);

const posts = await getCollection("post");
console.log(posts.length, "posts found");
function post2Index(post: CollectionEntry<"post">) {
  const index = {
    objectID: post.slug,
    title: post.data.title,
    content: removeMD(post.body),
    slug: post.slug,
  };

  const indexString = JSON.stringify(index);
  // console.log(post.data.title, indexString.length, "bytes");
  const byteLength = new TextEncoder().encode(indexString).length;
  // console.log(post.data.title, byteLength, "bytes");
  if (byteLength >= 7000) {
    const contentChunks = chunkContent(removeMD(post.body));
    const indexes = contentChunks.map((chunk, index) => ({
      objectID: `${post.slug}_${index}`,
      title: post.data.title,
      content: chunk,
      slug: post.slug,
    }));
    // console.log(post.data.title, indexes.map((i) => new TextEncoder().encode(JSON.stringify(i)).length, "bytes"));
    return indexes;
  }

  return index;
}

function chunkContent(content: string) {
  const chunkSize = 5000;
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}

const index = posts.flatMap(post2Index);
// index.forEach((i) => {
//   console.log(i.objectID, new TextEncoder().encode(JSON.stringify(i)).length, "bytes");
// });

await client
  .initIndex("posts")
  .saveObjects(JSON.parse(JSON.stringify(index)))
  .then((res) => console.log(res, "algolia index updated"));

export async function GET({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  return new Response(
    JSON.stringify({
      name: "Astro",
      url: "https://astro.build/",
    }),
  );
}
