import SparkMD5 from "spark-md5";

export function getGravatarUrl(
  email: string,
  size = 200,
  defaultImage = "identicon",
  rating = "g",
) {
  const cleanEmail = email.trim().toLowerCase();
  const hash = SparkMD5.hash(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=${rating}`;
}

export function getDiceBearUrl(seed: string, { hashBeforeUse = false } = {}) {
  let cleanSeed = encodeURIComponent(seed.trim());
  if (hashBeforeUse) {
    cleanSeed = SparkMD5.hash(cleanSeed);
  }
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${cleanSeed}`;
}
