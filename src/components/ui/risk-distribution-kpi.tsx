import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFitty } from "@/hooks/use-auto-fit-text";

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
  
  const energyRef = useFitty({ minSize: 12, maxSize: 22, multiLine: false });
  const submarketRef = useFitty({ minSize: 12, maxSize: 22, multiLine: false });
  const sourceRef = useFitty({ minSize: 12, maxSize: 22, multiLine: false });

  return (
    <Card className={cn("risk-distribution-kpi smooth-transition hover:shadow-lg", className)}
          style={{ display: 'grid', gridTemplateRows: 'auto 1fr', rowGap: '10px', padding: '16px', borderRadius: '16px' }}>
      <CardHeader className="p-0">
        <CardTitle className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                   style={{ lineHeight: '1.15' }}>
          Distribuição de Risco
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ display: 'grid', gridAutoRows: '1fr', rowGap: '7px' }}>
          {/* Energia - Violet #5370EA */}
          <span 
            ref={energyRef}
            className="w-full font-semibold"
            style={{
              color: '#5370EA',
              display: 'block'
            }}
          >
            {formatPercent(energyPercentage)} - Energia
          </span>
          
          {/* Submercado - Crimson Red #B40833 */}
          <span 
            ref={submarketRef}
            className="w-full font-semibold"
            style={{
              color: '#B40833',
              display: 'block'
            }}
          >
            {formatPercent(submarketPercentage)} - Submercado
          </span>
          
          {/* Fonte - Cerulean Blue #3A4FA5 */}
          <span 
            ref={sourceRef}
            className="w-full font-semibold"
            style={{
              color: '#3A4FA5',
              display: 'block'
            }}
          >
            {formatPercent(sourcePercentage)} - Fonte
          </span>
        </div>
      </CardContent>
    </Card>
  );
}