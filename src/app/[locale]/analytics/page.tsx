import { GardenHero } from "@/components/bloom/garden-hero";
import { SummaryCards } from "@/components/bloom/summary-cards";
import { Analytics } from "@/components/bloom/analytics";
import { DailyShareButtons } from "@/components/bloom/share-buttons";
import { MomentumRules } from "@/components/bloom/momentum-rules";
import { InstallCard } from "@/components/bloom/install-card";

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <GardenHero />
      <SummaryCards />
      <DailyShareButtons />
      <Analytics />
      <MomentumRules />
      <InstallCard compact />
    </div>
  );
}
