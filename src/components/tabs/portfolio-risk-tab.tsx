import React, { useState, useEffect } from 'react';
import { ChartContainer } from '@/components/ui/chart-container';
import { 
  loadExcelFile, 
  processCreditExposureData,
  CreditExposureData,
  formatCurrency, 
  formatNumber 
} from '@/lib/data-processing';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

// Risk bucket mapping
const RISK_BUCKET_MAP: Record<string, string> = {
  '1A': 'Baixíssimo risco',
  '2B': 'Baixo risco',
  '3C': 'Médio risco 1',
  '4D': 'Médio risco 2',
  '5E': 'Alto risco',
  '6F': 'Altíssimo risco',
};

// Target PMA distribution
const TARGET_DISTRIBUTION = {
  'Baixíssimo risco': { percentage: 7, pma: 220 },
  'Baixo risco': { percentage: 13, pma: 397 },
  'Médio risco 1': { percentage: 38, pma: 1133 },
  'Médio risco 2': { percentage: 42, pma: 1250 },
  'Alto risco': { percentage: 0, pma: 0 },
  'Altíssimo risco': { percentage: 0, pma: 0 },
};

const TARGET_TOTAL_PMA = 3000;

function mapRatingToRiskBucket(rating: string): string | null {
  // Ignore ACR and I ratings (no credit risk)
  if (rating === 'ACR' || rating === 'I') {
    return null;
  }
  
  return RISK_BUCKET_MAP[rating] || null;
}

interface RiskBucketData {
  bucket: string;
  el_sum: number;
  percentage_real: number;
  pma_real: number;
  percentage_target: number;
  pma_target: number;
}

export function PortfolioRiskTab() {
  const [creditData, setCreditData] = useState<CreditExposureData[]>([]);
  const [bucketData, setBucketData] = useState<RiskBucketData[]>([]);
  const [totalEL, setTotalEL] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadExcelFile('credit_exposure.xlsx');
        const processedData = processCreditExposureData(data);
        
        // Filter: exclude ACR and I, keep only EL_PFE > 0
        const filteredData = processedData.filter(d => {
          const hasRisk = d.rating !== 'ACR' && d.rating !== 'I';
          const hasPositiveEL = d.EL_PFE_year > 0;
          return hasRisk && hasPositiveEL;
        });
        
        setCreditData(filteredData);
        
        // Calculate distribution by risk bucket
        const buckets = new Map<string, number>();
        
        filteredData.forEach(item => {
          const bucket = mapRatingToRiskBucket(item.rating);
          if (bucket) {
            const current = buckets.get(bucket) || 0;
            buckets.set(bucket, current + item.EL_PFE_year);
          }
        });
        
        // Calculate total EL
        const total = Array.from(buckets.values()).reduce((sum, val) => sum + val, 0);
        setTotalEL(total);
        
        // Build bucket data array
        const orderedBuckets = [
          'Baixíssimo risco',
          'Baixo risco',
          'Médio risco 1',
          'Médio risco 2',
          'Alto risco',
          'Altíssimo risco',
        ];
        
        const bucketArray: RiskBucketData[] = orderedBuckets.map(bucket => {
          const el_sum = buckets.get(bucket) || 0;
          const percentage_real = total > 0 ? (el_sum / total * 100) : 0;
          const pma_real = el_sum / 1000; // Convert to thousands
          const target = TARGET_DISTRIBUTION[bucket as keyof typeof TARGET_DISTRIBUTION];
          
          return {
            bucket,
            el_sum,
            percentage_real,
            pma_real,
            percentage_target: target.percentage,
            pma_target: target.pma,
          };
        });
        
        setBucketData(bucketArray);
      } catch (error) {
        console.error('Erro ao carregar dados de exposição de crédito:', error);
      }
    };
    
    loadData();
  }, []);

  // Prepare chart data
  const chartData = bucketData.map(item => ({
    name: item.bucket,
    'Real': item.percentage_real,
    'Alvo': item.percentage_target,
    isOverTarget: item.percentage_real > item.percentage_target,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">Risco de Portfólio</h3>
        <p className="text-muted-foreground text-sm">
          Análise da distribuição de Expected Loss por faixa de risco comparada com distribuição alvo de Perda Máxima Aceitável (PMA)
        </p>
      </div>

      {/* Comparative Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Perfil de Risco da Contraparte</TableHead>
              <TableHead className="text-right font-semibold">% da PMA (Real)</TableHead>
              <TableHead className="text-right font-semibold">PMA Real (R$ mil)</TableHead>
              <TableHead className="text-right font-semibold">% da PMA (Alvo)</TableHead>
              <TableHead className="text-right font-semibold">PMA Alvo (R$ mil)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bucketData.map((row) => (
              <TableRow key={row.bucket}>
                <TableCell className="font-medium">{row.bucket}</TableCell>
                <TableCell className="text-right">
                  <span className={row.percentage_real > row.percentage_target ? 'text-loss font-semibold' : ''}>
                    {formatNumber(row.percentage_real, 2)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(row.pma_real, 2)}
                </TableCell>
                <TableCell className="text-right">{formatNumber(row.percentage_target, 2)}%</TableCell>
                <TableCell className="text-right">{formatNumber(row.pma_target, 2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-bold">100.00%</TableCell>
              <TableCell className="text-right font-bold">
                {formatNumber(totalEL / 1000, 2)}
              </TableCell>
              <TableCell className="text-right font-bold">100.00%</TableCell>
              <TableCell className="text-right font-bold">{formatNumber(TARGET_TOTAL_PMA, 2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Comparative Chart */}
      <ChartContainer
        title="Distribuição de PMA: Real vs Alvo"
        description="Comparação da distribuição percentual de PMA por faixa de risco"
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: '% da PMA', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `${formatNumber(value, 2)}%`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar dataKey="Real" fill="hsl(var(--chart-1))" name="Real" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isOverTarget ? 'hsl(var(--loss))' : 'hsl(var(--chart-1))'}
                />
              ))}
            </Bar>
            <Bar dataKey="Alvo" fill="hsl(var(--chart-2))" name="Alvo" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Expected Loss</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalEL)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">PMA Real Total (R$ mil)</div>
          <div className="text-2xl font-bold text-foreground">{formatNumber(totalEL / 1000, 2)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">PMA Alvo Total (R$ mil)</div>
          <div className="text-2xl font-bold text-foreground">{formatNumber(TARGET_TOTAL_PMA, 2)}</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Esta análise considera apenas contrapartes com Expected Loss positiva, excluindo contrapartes no ACR e contrapartes internas (sem risco de crédito). Valores destacados em vermelho indicam faixas onde o percentual real excede o alvo.
        </p>
      </div>
    </div>
  );
}

