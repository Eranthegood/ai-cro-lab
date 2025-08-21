import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAbTestWithTracking } from "@/hooks/useLaunchDarkly";
import InsightsVariantA from "@/components/insights/InsightsVariantA";
import InsightsVariantB from "@/components/insights/InsightsVariantB";

const AIInsights = () => {
  const variant = useAbTestWithTracking('insights-layout-test', 'variant-a');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {variant === 'variant-b' ? <InsightsVariantB /> : <InsightsVariantA />}
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;