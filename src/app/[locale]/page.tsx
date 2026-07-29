import { GardenHero } from "@/components/bloom/garden-hero";
import { AiCompanion } from "@/components/bloom/ai-companion";
import { SummaryCards } from "@/components/bloom/summary-cards";
import { DailyShareButtons } from "@/components/bloom/share-buttons";
import { ReflectionCard } from "@/components/bloom/reflection-card";
import { MomentumRules } from "@/components/bloom/momentum-rules";

export default function HomePage() {
  return (
    <div className="space-y-7">
      <GardenHero />
      <AiCompanion />
      <SummaryCards />
      <DailyShareButtons />
      <ReflectionCard />
      <MomentumRules />
    </div>
  );
}
