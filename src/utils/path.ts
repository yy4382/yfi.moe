const POST_PREFIX = '/post';



export function getPostLink(slug: string) {
  return `${POST_PREFIX}/${slug}`;
}