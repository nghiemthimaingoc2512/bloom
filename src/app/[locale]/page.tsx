import { GardenHero } from "@/components/bloom/garden-hero";
import { AiCompanion } from "@/components/bloom/ai-companion";
import { SummaryCards } from "@/components/bloom/summary-cards";
import { ReflectionCard } from "@/components/bloom/reflection-card";
import { MomentumRules } from "@/components/bloom/momentum-rules";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <GardenHero />
      <AiCompanion />
      <SummaryCards />
      <ReflectionCard />
      <MomentumRules />
    </div>
  );
}
