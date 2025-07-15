import {
  getPageCollection,
  getPostCollection,
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

  // warm the cache (don't wait)
  Promise.all([getPostCollection({ includeDraft: true }), getPageCollection()])
    .then(() => {
      console.log("content warmed by revalidate-content");
    })
    .catch((err) => {
      console.error(err);
    });

  return NextResponse.json({ message: "Content revalidated" });
}
