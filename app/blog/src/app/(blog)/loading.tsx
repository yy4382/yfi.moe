import { Section } from "@/components/ui/section";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function Loading() {
  return (
    <Section className="flex h-screen items-center justify-center">
      <LoadingIndicator />
    </Section>
  );
}
