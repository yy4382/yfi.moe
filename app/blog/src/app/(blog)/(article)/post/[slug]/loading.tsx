import { Card } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function Loading() {
  return (
    <Card className="flex h-screen items-center justify-center">
      <LoadingIndicator />
    </Card>
  );
}
