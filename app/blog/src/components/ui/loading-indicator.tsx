export function LoadingIndicator({ text }: { text?: string }) {
  return (
    <>
      <div className="size-8 animate-spin rounded-full border-3 border-primary/75 border-t-transparent" />
      <p className="ml-4 text-lg text-content">{text || "加载中..."}</p>
    </>
  );
}
