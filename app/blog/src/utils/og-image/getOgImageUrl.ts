import { OG_IMG_ENDPOINT, OG_IMG_TOKEN } from "astro:env/server";
import { generateOgImageForPost } from "./generateOgImages";

export const getOgImageUrl = async (
  path: string,
  title: string,
  date: string,
) => {
  const checkRes = await fetch(
    new URL(`/check?path=${path}&title=${title}&date=${date}`, OG_IMG_ENDPOINT),
  );
  if (checkRes.ok) {
    return checkRes.json().then((res) => res.url);
  }

  const image = await generateOgImageForPost({ title, date });
  const imageBlob = new Blob([image], { type: "image/png" });
  const form = new FormData();
  form.append("image", imageBlob);
  form.append("path", path);
  form.append("title", title);
  form.append("date", date);
  const uploadRes = await fetch(new URL("/upload", OG_IMG_ENDPOINT), {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${OG_IMG_TOKEN}`,
    },
  });
  if (!uploadRes.ok) {
    throw new Error(`Failed to upload og image: ${uploadRes.statusText}`);
  }
  return uploadRes.json().then((res) => res.url);
};
