import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Textfit } from 'react-textfit';

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
            <Textfit 
              mode="single" 
              min={12} 
              max={22}
              style={{
                width: '100%',
                fontWeight: '600',
                color: '#5370EA',
                whiteSpace: 'nowrap',
                overflow: 'visible',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(energyPercentage)} - Energia
            </Textfit>
          </div>
          
          {/* Submercado - Crimson Red #B40833 */}
          <div className="flex items-center overflow-visible">
            <Textfit 
              mode="single" 
              min={12} 
              max={22}
              style={{
                width: '100%',
                fontWeight: '600',
                color: '#B40833',
                whiteSpace: 'nowrap',
                overflow: 'visible',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(submarketPercentage)} - Submercado
            </Textfit>
          </div>
          
          {/* Fonte - Cerulean Blue #3A4FA5 */}
          <div className="flex items-center overflow-visible">
            <Textfit 
              mode="single" 
              min={12} 
              max={22}
              style={{
                width: '100%',
                fontWeight: '600',
                color: '#3A4FA5',
                whiteSpace: 'nowrap',
                overflow: 'visible',
                lineHeight: '1.1',
                display: 'block'
              }}
            >
              {formatPercent(sourcePercentage)} - Fonte
            </Textfit>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}