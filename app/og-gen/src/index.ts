import { Hono } from "hono";
import mime from "mime";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
type Bindings = {
  BUCKET: R2Bucket;
  TOKEN: string;
};
const app = new Hono<{ Bindings: Bindings }>();

type Metadata = {
  // with .png / .jpg suffix
  path: string;
  title: string;
  date: string;
};

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/check", async (c) => {
  // without .png / .jpg suffix
  const path = c.req.query("path");
  const title = c.req.query("title");
  const date = c.req.query("date");

  const metadataObj = await c.env.BUCKET.get(`${path}.json`);
  const metadata = metadataObj
    ? ((await metadataObj.json()) as Metadata)
    : null;
  if (!metadata) {
    return c.json({ status: "not-found" }, 404);
  }
  if (metadata.title !== title || metadata.date !== date) {
    return c.json({ status: "need-update" }, 410);
  }
  return c.json({
    status: "updated",
    url: new URL(`og/${metadata.path}`, new URL(c.req.url).origin),
  });
});

app.get("/og/:path{.+}", async (c) => {
  // with .png / .jpg suffix
  const path = c.req.param("path");
  const ogImage = await c.env.BUCKET.get(path);
  if (!ogImage) {
    return c.text("OG image not found", 404);
  }

  const contentType = mime.getType(path);
  if (!contentType) {
    console.error("Content type not found", path);
    return c.text("Content type not found", 400);
  }
  c.header("Content-Type", contentType);
  return c.body(ogImage.body);
});

app.use("/upload/*", async (c, next) => {
  const auth = bearerAuth({ token: c.env.TOKEN });
  return auth(c, next);
});
app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const title = formData.get("title");
  const date = formData.get("date");
  const path = formData.get("path");
  const image = formData.get("image");

  const suffix = mime.getExtension((image as File).type || "");
  if (!suffix) {
    console.error("Content type not found", path, (image as File).type);
    throw new HTTPException(400, {
      message: "Content type not found",
    });
  }
  const newPath = `${path}.${suffix}`;

  const metadata: Metadata = {
    path: newPath,
    title: title as string,
    date: date as string,
  };
  await c.env.BUCKET.put(newPath, image);
  await c.env.BUCKET.put(`${path}.json`, JSON.stringify(metadata));
  return c.json({
    url: new URL(`og/${newPath}`, new URL(c.req.url).origin),
  });
});

export default app;
