import { redirect, notFound } from "next/navigation";

export function pagination<T>(
  entries: T[],
  pageSize: number,
): { paginator: (page: number) => T[] | null; totalPages: number } {
  const totalPages = Math.ceil(entries.length / pageSize);
  const paginator = (page: number) => {
    if (page <= 0 || page > totalPages) return null;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return entries.slice(startIndex, endIndex);
  };
  return { paginator, totalPages };
}
export function paginationPageFromParams(
  pageParam: string[] | undefined,
  base: string,
) {
  if (pageParam && pageParam.length === 1 && pageParam[0] === "1") {
    redirect(`${base}`);
  }

  let page: number;
  if (!pageParam || pageParam.length === 0) page = 1;
  else if (pageParam.length > 1) {
    notFound();
  } else {
    try {
      page = parseInt(pageParam[0]!);
    } catch {
      notFound();
    }
  }
  return page;
}
