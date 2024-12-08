export * from "./CompactEntryList";

export function groupingEntries<T>(posts: T[], getYear: (arg0: T) => number) {
  const groupedPosts = posts.reduce((grouped: Record<string, T[]>, post: T) => {
    const year = getYear(post);
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(post);
    return grouped;
  }, {});

  // convert the object to an array
  const groupedPostsArray = Object.keys(groupedPosts).map((key) => ({
    year: key,
    posts: groupedPosts[key],
  }));

  // sort years by latest first
  groupedPostsArray.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  return groupedPostsArray;
}
