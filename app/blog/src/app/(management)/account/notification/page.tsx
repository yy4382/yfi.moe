import { Metadata } from "next";
import { Unsubscribe } from "./subscribe";

export const metadata: Metadata = {
  title: "通知设定",
  robots: {
    index: false,
  },
};

export default function NotificationPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">邮件通知设定</h1>
      <Unsubscribe />
    </div>
  );
}
