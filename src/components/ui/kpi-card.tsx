import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFitty } from "@/hooks/use-auto-fit-text";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  isNegative?: boolean; // New prop to handle negative face values
}

export function KpiCard({ title, value, subtitle, trend, className, isNegative }: KpiCardProps) {
  const valueRef = useFitty({ minSize: 12, maxSize: 44, multiLine: false });
  
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

  // Determine subtitle color - use value-based color for "Face Value" subtitles
  const getSubtitleColor = () => {
    if (subtitle === "Face Value") {
      return getTitleColor(); // Use same color logic as title for Face Value
    }
    return getTrendColor(); // Use trend color for other subtitles
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
    <Card className={cn("kpi-card smooth-transition hover:shadow-lg", className)} 
          style={{ display: 'grid', gridTemplateRows: 'auto 1fr', rowGap: '8px', padding: '16px', borderRadius: '16px' }}>
      <CardHeader className="p-0">
        <CardTitle className={cn(
          "text-sm font-semibold", 
          "whitespace-nowrap overflow-hidden text-ellipsis",
          getTitleColor()
        )}
        style={{ lineHeight: '1.15' }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex items-center">
        <span 
          ref={valueRef}
          className="w-full font-bold"
          style={{
            color: 'hsl(var(--foreground))',
            display: 'block'
          }}
        >
          {value}
        </span>
      </CardContent>
    </Card>
  );
}