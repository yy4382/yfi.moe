import { visit } from "unist-util-visit";
import type { Root } from "hast";

export default function rehypeImageOptimization(options?: {
  originValidation?: string | RegExp | ((arg0: string) => boolean);
}) {
  const { originValidation } = options ?? {};
  const processedOriginValidation = (origin: string) => {
    if (originValidation === undefined) {
      return true;
    }
    if (typeof originValidation === "string") {
      return originValidation === origin;
    }
    if (originValidation instanceof RegExp) {
      return originValidation.test(origin);
    }
    if (typeof originValidation === "function") {
      return originValidation(origin);
    }
    throw new Error("Invalid originValidation option");
  };

  return function (tree: Root) {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img" || !node.properties.src) {
        return;
      }
      let origin: string;
      let pathname: string;

      try {
        const url = new URL(node.properties.src.toString());
        origin = url.origin;
        pathname = url.pathname;
      } catch {
        console.error("Invalid URL:", node.properties.src);
        return;
      }

      if (!processedOriginValidation(origin)) {
        return;
      }

      const image320 = `${origin}/cdn-cgi/image/f=auto,w=320,fit=scale-down,q=80${pathname}`;
      const image640 = `${origin}/cdn-cgi/image/f=auto,w=640,fit=scale-down,q=80${pathname}`;
      const image1280 = `${origin}/cdn-cgi/image/f=auto,w=1280,fit=scale-down,q=80${pathname}`;
      node.properties.srcset = `${image320} 320w, ${image640} 640w, ${image1280} 1280w`;
      node.properties.src = image640;
      node.properties.sizes = "(max-width: 640px) 320px, 640px";
      node.properties.style = "max-width: 100%; width: 100%; height: auto;";
    });
  };
}
