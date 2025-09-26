import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Textfit } from 'react-textfit';

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
    <Card className={cn("kpi-card smooth-transition hover:shadow-lg flex flex-col", className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className={cn(
          "text-sm font-medium leading-tight", 
          "whitespace-nowrap overflow-hidden text-ellipsis",
          getTitleColor()
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 flex-grow flex items-start">
        <div className="w-full overflow-visible">
          <Textfit 
            mode="single" 
            min={12} 
            max={40}
            style={{
              width: '100%',
              fontWeight: 'bold',
              color: 'hsl(var(--foreground))',
              whiteSpace: 'nowrap',
              overflow: 'visible',
              lineHeight: '1',
              display: 'block'
            }}
          >
            {value}
          </Textfit>
        </div>
      </CardContent>
    </Card>
  );
}