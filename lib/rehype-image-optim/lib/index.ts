import { visit } from "unist-util-visit";
import type { Root } from "hast";

type OptimizeOptions = string[] | string;
export default function rehypeImageOptimization(options?: {
  originValidation?: string | RegExp | ((arg0: string) => boolean);
  /**
   * Options for the image optimization. Used to replace the image `src` property.
   *
   * Can be `string` or `string[]`. If an array is provided, it is joined with a comma.
   *
   * The following examples are equivalent:
   * @example "f=auto,w=320,q=80"
   * @example ["f=auto", "w=320", "q=80"]
   * @example ["f=auto,w=320", "q=80"]
   *
   * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/#options
   */
  optimizeOptions?: OptimizeOptions;
  /**
   * Options for the image optimization. Used to replace the image `srcset` property.
   * The `descriptor` is a string that describes the size of the image or density.
   *
   * @example [{ optimOptions: "w=320", descriptor: "320w" }, { optimOptions: "w=640", descriptor: "640w" }]
   * @example [{ optimOptions: "w=640", descriptor: "2x" }]
   * @see https://developers.cloudflare.com/images/transform-images/make-responsive-images/
   */
  srcsetOptionsList?: { optimOptions: OptimizeOptions; descriptor: string }[];
  sizesOptionsList?: string[] | string;
  style?: string;
}) {
  const {
    originValidation,
    optimizeOptions,
    srcsetOptionsList,
    sizesOptionsList,
    style,
  } = options ?? {};
  const validateOrigin = (origin: string) => {
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

      if (!validateOrigin(origin)) {
        return;
      }

      if (optimizeOptions !== undefined)
        node.properties.src = generateOptimizedUrl(
          origin,
          pathname,
          optimizeOptions,
        );

      if (srcsetOptionsList !== undefined)
        node.properties.srcset = srcsetOptionsList
          .map(
            ({ optimOptions, descriptor }) =>
              `${generateOptimizedUrl(origin, pathname, optimOptions)} ${descriptor}`,
          )
          .join(", ");

      if (sizesOptionsList !== undefined)
        node.properties.sizes =
          typeof sizesOptionsList === "string"
            ? sizesOptionsList
            : sizesOptionsList.join(", ");

      node.properties.style += style ?? "";
    });
  };
}

const joinOptions = (options: OptimizeOptions) => {
  if (typeof options === "string") {
    return options;
  }
  return options.join(",");
};

const generateOptimizedUrl = (
  uriOrigin: string,
  ogPath: string,
  optimOptions: OptimizeOptions,
) => {
  const optionString = joinOptions(optimOptions);
  return `${uriOrigin}/cdn-cgi/image/${optionString}${ogPath}`;
};
