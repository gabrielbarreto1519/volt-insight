import React, { useState, useEffect } from 'react';
import { EnergyFilters } from '@/components/filters/energy-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { loadExcelFile, processPmixData, processNetData, fillMissingMonths, formatCurrency, formatNumber, PmixData, NetPosition } from '@/lib/data-processing';

export function NetPositionsTab() {
  const [energySource, setEnergySource] = useState('Convencional');
  const [submarket, setSubmarket] = useState('N');
  const [year, setYear] = useState('2025');
  const [isFinancialMode, setIsFinancialMode] = useState(false);
  
  const [pmixData, setPmixData] = useState<PmixData[]>([]);
  const [netData, setNetData] = useState<NetPosition[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pmixRaw, netRaw] = await Promise.all([
          loadExcelFile('Pmix.xlsx'),
          loadExcelFile('net.xlsx')
        ]);
        
        setPmixData(processPmixData(pmixRaw));
        setNetData(processNetData(netRaw));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selections with support for financial mode
  const filteredPmixData = pmixData.filter(d => {
    const yearMatch = d.year === parseInt(year);
    if (isFinancialMode) {
      // In financial mode, include all energy sources and submarkets
      return yearMatch;
    } else {
      // In physical mode, filter by specific energy source and submarket
      const energyMatch = d.energySourceDescription === energySource;
      const submarketMatch = d.submarketDescription === submarket;
      return yearMatch && energyMatch && submarketMatch;
    }
  });

  const filteredNetData = netData.filter(d => {
    const yearMatch = d.year === parseInt(year);
    if (isFinancialMode) {
      // In financial mode, include all energy sources and submarkets
      return yearMatch;
    } else {
      // In physical mode, filter by specific energy source and submarket
      const energyMatch = d.energySourceDescription === energySource;
      const submarketMatch = d.submarketDescription === submarket;
      return yearMatch && energyMatch && submarketMatch;
    }
  });

  // Check if we should hide physical charts (volume and prices) in financial mode
  const shouldHidePhysicalCharts = isFinancialMode;

  // Prepare volume chart data
  const volumeChartData = fillMissingMonths(
    isFinancialMode 
      ? // In financial mode, aggregate by month
        Object.entries(
          filteredPmixData.reduce((acc, d) => {
            const key = d.month;
            if (!acc[key]) acc[key] = { month: d.month, year: d.year, volume: 0 };
            acc[key].volume += d.netVolumn || 0;
            return acc;
          }, {} as Record<number, { month: number; year: number; volume: number }>)
        ).map(([_, data]) => data)
      : // In physical mode, use filtered data as is
        filteredPmixData.map(d => ({
          month: d.month,
          year: d.year,
          volume: d.netVolumn,
        })),
    parseInt(year),
    { volume: 0 }
  );


  // Prepare price chart data
  const priceChartData = fillMissingMonths(
    isFinancialMode
      ? // In financial mode, aggregate by month (weighted average by volume)
        Object.entries(
          filteredPmixData.reduce((acc, d) => {
            const key = d.month;
            if (!acc[key]) {
              acc[key] = { 
                month: d.month, 
                year: d.year, 
                totalBuyValue: 0, 
                totalSellValue: 0, 
                totalVolume: 0 
              };
            }
            const volume = d.netVolumn || 0;
            acc[key].totalBuyValue += (d.buyPmix || 0) * volume;
            acc[key].totalSellValue += (d.sellPmix || 0) * volume;
            acc[key].totalVolume += volume;
            return acc;
          }, {} as Record<number, { month: number; year: number; totalBuyValue: number; totalSellValue: number; totalVolume: number }>)
        ).map(([_, data]) => ({
          month: data.month,
          year: data.year,
          buyPrice: data.totalVolume > 0 ? data.totalBuyValue / data.totalVolume : 0,
          sellPrice: data.totalVolume > 0 ? data.totalSellValue / data.totalVolume : 0,
        }))
      : // In physical mode, use filtered data as is
        filteredPmixData.map(d => ({
          month: d.month,
          year: d.year,
          buyPrice: d.buyPmix,
          sellPrice: d.sellPmix,
        })),
    parseInt(year),
    { buyPrice: 0, sellPrice: 0 }
  );

  // Prepare MtM chart data
  const mtmChartData = fillMissingMonths(
    isFinancialMode
      ? // In financial mode, aggregate by month
        Object.entries(
          filteredNetData.reduce((acc, d) => {
            const key = d.month;
            if (!acc[key]) acc[key] = { month: d.month, year: d.year, mtm: 0 };
            acc[key].mtm += d.MtM || 0;
            return acc;
          }, {} as Record<number, { month: number; year: number; mtm: number }>)
        ).map(([_, data]) => data)
      : // In physical mode, use filtered data as is
        filteredNetData.map(d => ({
          month: d.month,
          year: d.year,
          mtm: d.MtM,
        })),
    parseInt(year),
    { mtm: 0 }
  );

  // Prepare P&L chart data
  const plChartData = fillMissingMonths(
    isFinancialMode
      ? // In financial mode, aggregate by month
        Object.entries(
          filteredNetData.reduce((acc, d) => {
            const key = d.month;
            if (!acc[key]) acc[key] = { month: d.month, year: d.year, profitLoss: 0 };
            acc[key].profitLoss += d.profitLoss || 0;
            return acc;
          }, {} as Record<number, { month: number; year: number; profitLoss: number }>)
        ).map(([_, data]) => data)
      : // In physical mode, use filtered data as is
        filteredNetData.map(d => ({
          month: d.month,
          year: d.year,
          profitLoss: d.profitLoss,
        })),
    parseInt(year),
    { profitLoss: 0 }
  );

  // Prepare Face Value chart data
  const faceValueChartData = fillMissingMonths(
    isFinancialMode
      ? // In financial mode, aggregate by month
        Object.entries(
          filteredNetData.reduce((acc, d) => {
            const key = d.month;
            if (!acc[key]) acc[key] = { month: d.month, year: d.year, faceValue: 0 };
            acc[key].faceValue += d.faceValue || 0;
            return acc;
          }, {} as Record<number, { month: number; year: number; faceValue: number }>)
        ).map(([_, data]) => data)
      : // In physical mode, use filtered data as is
        filteredNetData.map(d => ({
          month: d.month,
          year: d.year,
          faceValue: d.faceValue,
        })),
    parseInt(year),
    { faceValue: 0 }
  );

  // Get available options from data for dynamic filters (excluding "Todas" options)
  const availableYears = [...new Set([...pmixData.map(d => d.year.toString()), ...netData.map(d => d.year.toString())])].sort();
  const availableEnergySource = [...new Set([...pmixData.map(d => d.energySourceDescription), ...netData.map(d => d.energySourceDescription)])].filter(Boolean);
  const availableSubmarkets = [...new Set([...pmixData.map(d => d.submarketDescription), ...netData.map(d => d.submarketDescription)])].filter(Boolean);

  // Calculate annual KPIs
  const totalVolume = filteredPmixData.reduce((sum, item) => sum + (item.netVolumn || 0), 0);
  const totalMtM = filteredNetData.reduce((sum, item) => sum + (item.MtM || 0), 0);
  const totalProfitLoss = filteredNetData.reduce((sum, item) => sum + (item.profitLoss || 0), 0);
  const totalExposure = filteredNetData.reduce((sum, item) => sum + (item.faceValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <EnergyFilters
          energySource={energySource}
          setEnergySource={setEnergySource}
          submarket={submarket}
          setSubmarket={setSubmarket}
          year={year}
          setYear={setYear}
          isFinancialMode={isFinancialMode}
          setIsFinancialMode={setIsFinancialMode}
          availableYears={availableYears}
          availableEnergySource={availableEnergySource}
          availableSubmarkets={availableSubmarkets}
        />
      </div>

      {/* KPIs Anuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Exposição Total"
          value={formatCurrency(totalExposure)}
          subtitle="Face Value"
          trend="neutral"
        />
        <KpiCard
          title="MtM Total"
          value={formatCurrency(totalMtM)}
          subtitle="Marcação a Mercado"
          trend={totalMtM >= 0 ? "up" : "down"}
        />
        <KpiCard
          title="Resultado Total"
          value={formatCurrency(totalProfitLoss)}
          subtitle="P&L Consolidado"
          trend={totalProfitLoss >= 0 ? "up" : "down"}
        />
      </div>

      <div className="space-y-6">
        {!shouldHidePhysicalCharts && (
          <ChartContainer
            title="Volumes de Energia"
            description="Volume líquido mensal"
            className="w-full"
          >
            <FinancialLineChart
              data={volumeChartData}
              lines={[
                {
                  dataKey: 'volume',
                  stroke: 'hsl(var(--chart-1))',
                  name: 'Volume Líquido',
                  unit: 'MWm',
                  format: 'number',
                },
              ]}
              height={300}
              yAxisFormat="number"
            />
          </ChartContainer>
        )}

        {!shouldHidePhysicalCharts && (
          <ChartContainer
            title="Preços Médios"
            description="Preço médio de compra e venda mensal"
            className="w-full"
          >
            <FinancialLineChart
              data={priceChartData}
              lines={[
                {
                  dataKey: 'buyPrice',
                  stroke: 'hsl(var(--chart-3))',
                  name: 'Preço Compra',
                  unit: 'R$/MWh',
                  format: 'currency',
                },
                {
                  dataKey: 'sellPrice',
                  stroke: 'hsl(var(--chart-4))',
                  name: 'Preço Venda',
                  unit: 'R$/MWh',
                  format: 'currency',
                },
              ]}
              height={300}
              yAxisFormat="currency"
            />
          </ChartContainer>
        )}

        <ChartContainer
          title="Exposição (Face Value)"
          description="Exposição mensal da posição selecionada"
          className="w-full"
        >
          <FinancialLineChart
            data={faceValueChartData}
            lines={[
              {
                dataKey: 'faceValue',
                stroke: 'hsl(var(--chart-2))',
                name: 'Face Value',
                unit: 'R$',
                format: 'currency',
              },
            ]}
            height={300}
            yAxisFormat="currency"
          />
        </ChartContainer>

        <ChartContainer
          title="Marcação a Mercado"
          description="MtM mensal da posição selecionada"
          className="w-full"
        >
          <FinancialLineChart
            data={mtmChartData}
            lines={[
              {
                dataKey: 'mtm',
                stroke: 'hsl(var(--profit))',
                name: 'MtM',
                unit: 'R$',
                format: 'currency',
              },
            ]}
            height={300}
            yAxisFormat="currency"
          />
        </ChartContainer>

        <ChartContainer
          title="Profit and Loss"
          description="P&L mensal da posição selecionada"
          className="w-full"
        >
          <FinancialLineChart
            data={plChartData}
            lines={[
              {
                dataKey: 'profitLoss',
                stroke: 'hsl(var(--loss))',
                name: 'P&L',
                unit: 'R$',
                format: 'currency',
              },
            ]}
            height={300}
            yAxisFormat="currency"
          />
        </ChartContainer>
      </div>
    </div>
  );
}