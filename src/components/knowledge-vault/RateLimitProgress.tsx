import { Progress } from "@/components/ui/progress";
import { useRateLimit } from "@/hooks/useRateLimit";

export const RateLimitProgress = () => {
  const { dailyCount, limit, isUnlimited, loading, getUsagePercentage } = useRateLimit();

  // Don't show anything for unlimited users or while loading
  if (isUnlimited || loading) return null;

  const percentage = getUsagePercentage();
  
  // Determine color based on usage
  const getProgressColor = (): string => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-content"; // Orange-ish color
    return "bg-success";
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{dailyCount}/{limit} interactions aujourd'hui</span>
        <span>{percentage}%</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-1.5"
        style={{
          // Override the indicator color based on usage
          '--progress-color': percentage >= 90 ? 'hsl(var(--destructive))' : 
                             percentage >= 70 ? 'hsl(var(--content))' : 
                             'hsl(var(--success))'
        } as React.CSSProperties}
      />
    </div>
  );
};