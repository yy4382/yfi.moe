/**
 * Formats a date as a relative time string in Chinese.
 *
 * @example
 * formatRelativeTime(new Date()) // "刚刚"
 * formatRelativeTime(fiveMinutesAgo) // "5分钟前"
 * formatRelativeTime(twoHoursAgo) // "2小时前"
 * formatRelativeTime(threeDaysAgo) // "3天前"
 * formatRelativeTime(twoWeeksAgo) // "2024年12月15日"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
