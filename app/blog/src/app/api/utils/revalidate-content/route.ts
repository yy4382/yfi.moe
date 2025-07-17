import {
  pageCollection,
  postCollection,
} from "@/lib/content-layer/collections";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization");
  if (token !== `Bearer ${process.env.CONTENT_REFRESH_TOKEN}`) {
    console.log(token, process.env.CONTENT_REFRESH_TOKEN);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(`github-content-getter`);

  await Promise.all([postCollection.clearCache(), pageCollection.clearCache()]);

  // warm the cache (don't wait)
  Promise.all([postCollection.getCollection(), pageCollection.getCollection()])
    .then(() => {
      console.log("content warmed by revalidate-content");
    })
    .catch((err) => {
      console.error(err);
    });

  return NextResponse.json({ message: "Content revalidated" });
}
