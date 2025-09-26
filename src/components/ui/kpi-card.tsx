import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  isNegative?: boolean; // New prop to handle negative face values
}

export function KpiCard({ title, value, subtitle, trend, className, isNegative }: KpiCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  // Determine title color based on value (positive/negative)
  const getTitleColor = () => {
    // Convert value to number for comparison if it's a string
    const numericValue = typeof value === 'string' ? 
      parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    
    if (isNegative !== undefined) {
      return isNegative ? "text-destructive" : "text-success";
    }
    
    if (numericValue < 0) {
      return "text-destructive";
    } else if (numericValue > 0) {
      return "text-success";
    }
    
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("kpi-card smooth-transition hover:shadow-lg", className)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", getTitleColor())}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className={cn("text-sm mt-1", getTrendColor())}>{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}