import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAutoFitText } from "@/hooks/use-auto-fit-text";

interface RiskDistributionKpiProps {
  energyPercentage: number;
  submarketPercentage: number;
  sourcePercentage: number;
  className?: string;
}

export function RiskDistributionKpi({ 
  energyPercentage, 
  submarketPercentage, 
  sourcePercentage, 
  className 
}: RiskDistributionKpiProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  const energyRef = useAutoFitText({ minSize: 12, maxSize: 22 });
  const submarketRef = useAutoFitText({ minSize: 12, maxSize: 22 });
  const sourceRef = useAutoFitText({ minSize: 12, maxSize: 22 });

  return (
    <Card className={cn("risk-distribution-kpi smooth-transition hover:shadow-lg", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
          Distribuição de Risco
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="grid grid-rows-3 gap-1 h-full">
          {/* Energia - Violet #5370EA */}
          <div className="flex items-center overflow-visible">
            <span 
              ref={energyRef}
              className="w-full font-semibold whitespace-nowrap overflow-visible"
              style={{
                color: '#5370EA',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(energyPercentage)} - Energia
            </span>
          </div>
          
          {/* Submercado - Crimson Red #B40833 */}
          <div className="flex items-center overflow-visible">
            <span 
              ref={submarketRef}
              className="w-full font-semibold whitespace-nowrap overflow-visible"
              style={{
                color: '#B40833',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(submarketPercentage)} - Submercado
            </span>
          </div>
          
          {/* Fonte - Cerulean Blue #3A4FA5 */}
          <div className="flex items-center overflow-visible">
            <span 
              ref={sourceRef}
              className="w-full font-semibold whitespace-nowrap overflow-visible"
              style={{
                color: '#3A4FA5',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(sourcePercentage)} - Fonte
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}