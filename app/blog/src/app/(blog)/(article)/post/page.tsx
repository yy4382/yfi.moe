import { redirect } from "next/navigation";

export default async function PostListPage() {
  return redirect("/posts");
}
