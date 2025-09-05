function truncateAtClosestNewline(str: string, targetPosition = 150) {
  while (str.startsWith("\n")) {
    str = str.slice(1);
  }
  let newPosition = str.lastIndexOf("\n", targetPosition);

  if (newPosition === -1) {
    newPosition = str.indexOf("\n", targetPosition);
    if (newPosition === -1) {
      return str;
    }
  }

  // 截取字符串到换行符的位置
  return str.substring(0, newPosition);
}

export function getDesc(
  content: string,
  config?: { length?: number; tryMore?: boolean },
) {
  const { length = 70, tryMore = true } = config || {};
  content = content.trim();
  if (tryMore) {
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex !== -1) {
      content = content.substring(0, moreIndex).trim();
    } else {
      content = truncateAtClosestNewline(content, length);
    }
  } else {
    content = truncateAtClosestNewline(content, length);
  }
  return content;
}
