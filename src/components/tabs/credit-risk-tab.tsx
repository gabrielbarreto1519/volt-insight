import React, { useState, useEffect } from 'react';
import { CounterpartyFilters } from '@/components/filters/counterparty-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { loadExcelFile, processCounterpartyData, fillMissingMonths, CounterpartyData, formatCurrency, formatNumber, aggregateByYear } from '@/lib/data-processing';

export function CreditRiskTab() {
  const [counterparty, setCounterparty] = useState('');
  const [year, setYear] = useState('2025');
  const [submarket, setSubmarket] = useState('');
  
  const [counterpartyData, setCounterpartyData] = useState<CounterpartyData[]>([]);
  const [availableCounterparties, setAvailableCounterparties] = useState<string[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadExcelFile('net_counterparty.xlsx');
        const processedData = processCounterpartyData(data);
        setCounterpartyData(processedData);
        
        // Get unique counterparties
        const uniqueCounterparties = [...new Set(processedData.map(d => d.counterparty))].sort();
        setAvailableCounterparties(uniqueCounterparties);
        
        // Set first counterparty as default
        if (uniqueCounterparties.length > 0 && !counterparty) {
          setCounterparty(uniqueCounterparties[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de contraparte:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selections
  const filteredData = counterpartyData.filter(d => 
    d.counterparty === counterparty &&
    d.year === parseInt(year) &&
    (!submarket || d.submarketDescription === submarket)
  );

  // Calculate annual KPIs for selected counterparty and year
  const getAnnualKPIs = () => {
    if (!counterparty || filteredData.length === 0) return null;
    
    const totalFaceValue = aggregateByYear(filteredData, 'faceValue');
    const totalMtM = aggregateByYear(filteredData, 'MtM');
    const totalPL = aggregateByYear(filteredData, 'profitLoss');
    const totalVolume = aggregateByYear(filteredData, 'netVolume');
    
    return {
      totalFaceValue,
      totalMtM,
      totalPL,
      totalVolume,
    };
  };

  const annualKPIs = getAnnualKPIs();

  // Prepare chart data
  const netPositionChartData = fillMissingMonths(
    filteredData.map(d => ({
      month: d.month,
      year: d.year,
      netVolume: d.netVolume,
    })),
    parseInt(year),
    { netVolume: 0 }
  );

  const faceValueChartData = fillMissingMonths(
    filteredData.map(d => ({
      month: d.month,
      year: d.year,
      faceValue: d.faceValue,
    })),
    parseInt(year),
    { faceValue: 0 }
  );

  const mtmChartData = fillMissingMonths(
    filteredData.map(d => ({
      month: d.month,
      year: d.year,
      mtm: d.MtM,
    })),
    parseInt(year),
    { mtm: 0 }
  );

  const plChartData = fillMissingMonths(
    filteredData.map(d => ({
      month: d.month,
      year: d.year,
      profitLoss: d.profitLoss,
    })),
    parseInt(year),
    { profitLoss: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">Risco de Crédito</h2>
        <CounterpartyFilters
          counterparty={counterparty}
          setCounterparty={setCounterparty}
          year={year}
          setYear={setYear}
          submarket={submarket}
          setSubmarket={setSubmarket}
          availableCounterparties={availableCounterparties}
        />
      </div>

      {/* KPI Cards */}
      {annualKPIs && counterparty && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Exposição Acumulada"
            value={formatCurrency(Math.abs(annualKPIs.totalFaceValue))}
            subtitle="Face Value Total"
            trend="neutral"
          />
          <KpiCard
            title="MtM Acumulado"
            value={formatCurrency(annualKPIs.totalMtM)}
            trend={annualKPIs.totalMtM >= 0 ? "up" : "down"}
          />
          <KpiCard
            title="P&L Acumulado"
            value={formatCurrency(annualKPIs.totalPL)}
            trend={annualKPIs.totalPL >= 0 ? "up" : "down"}
          />
          <KpiCard
            title="Volume Acumulado"
            value={`${formatNumber(annualKPIs.totalVolume)} MW`}
            trend="neutral"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Posição Líquida por Contraparte"
          description="Volume líquido mensal da contraparte selecionada"
        >
          <FinancialLineChart
            data={netPositionChartData}
            lines={[
              {
                dataKey: 'netVolume',
                stroke: 'hsl(var(--chart-1))',
                name: 'Volume Líquido',
                unit: 'MW',
                format: 'number',
              },
            ]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Exposição (Face Value) por Mês"
          description="Face value mensal da contraparte"
        >
          <FinancialLineChart
            data={faceValueChartData}
            lines={[
              {
                dataKey: 'faceValue',
                stroke: 'hsl(var(--chart-2))',
                name: 'Face Value',
                format: 'currency',
              },
            ]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Marcação a Mercado"
          description="MtM mensal da contraparte selecionada"
        >
          <FinancialLineChart
            data={mtmChartData}
            lines={[
              {
                dataKey: 'mtm',
                stroke: 'hsl(var(--profit))',
                name: 'MtM',
                format: 'currency',
              },
            ]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Profit and Loss"
          description="P&L mensal da contraparte selecionada"
        >
          <FinancialLineChart
            data={plChartData}
            lines={[
              {
                dataKey: 'profitLoss',
                stroke: 'hsl(var(--loss))',
                name: 'P&L',
                format: 'currency',
              },
            ]}
            height={300}
          />
        </ChartContainer>
      </div>

      {/* Optional breakdown by submarket - could be added as mini charts */}
      {submarket && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Quebra por Submercado: {submarket}
          </h3>
          <div className="text-sm text-muted-foreground">
            Dados filtrados para o submercado selecionado. 
            Para visualização detalhada por submercado, remova o filtro opcional.
          </div>
        </div>
      )}
    </div>
  );
}