export function LoadingIndicator({ text }: { text?: string }) {
  return (
    <>
      <div className="border-primary/75 size-8 animate-spin rounded-full border-3 border-t-transparent" />
      <p className="text-content ml-4 text-lg">{text || "加载中..."}</p>
    </>
  );
}
