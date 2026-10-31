import { FocusBoard } from "@/components/bloom/focus-board";
import { ReflectionCard } from "@/components/bloom/reflection-card";
import { AiCompanion } from "@/components/bloom/ai-companion";

export default function HomePage() {
  return (
    <div className="space-y-7">
      <FocusBoard />
      <ReflectionCard />
      <AiCompanion />
    </div>
  );
}
