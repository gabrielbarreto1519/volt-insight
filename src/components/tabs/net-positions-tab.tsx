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

  // Filter data based on selections with support for "Todas" options
  const filteredPmixData = pmixData.filter(d => {
    const yearMatch = d.year === parseInt(year);
    const energyMatch = energySource === 'Todas as Fontes' || d.energySourceDescription === energySource;
    const submarketMatch = submarket === 'Todos os Submercados' || d.submarketDescription === submarket;
    return yearMatch && energyMatch && submarketMatch;
  });

  const filteredNetData = netData.filter(d => {
    const yearMatch = d.year === parseInt(year);
    const energyMatch = energySource === 'Todas as Fontes' || d.energySourceDescription === energySource;
    const submarketMatch = submarket === 'Todos os Submercados' || d.submarketDescription === submarket;
    return yearMatch && energyMatch && submarketMatch;
  });

  // Check if we should hide the average prices chart (when "Todas" options are selected)
  const shouldHidePricesChart = energySource === 'Todas as Fontes' || submarket === 'Todos os Submercados';

  // Prepare volume chart data
  const volumeChartData = fillMissingMonths(
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
    filteredNetData.map(d => ({
      month: d.month,
      year: d.year,
      faceValue: d.faceValue,
    })),
    parseInt(year),
    { faceValue: 0 }
  );

  // Get available options from data for dynamic filters
  const availableYears = [...new Set([...pmixData.map(d => d.year.toString()), ...netData.map(d => d.year.toString())])].sort();
  const availableEnergySource = [...new Set([...pmixData.map(d => d.energySourceDescription), ...netData.map(d => d.energySourceDescription)])].filter(Boolean);
  const availableSubmarkets = [...new Set([...pmixData.map(d => d.submarketDescription), ...netData.map(d => d.submarketDescription)])].filter(Boolean);

  // Add "Todas" options to dynamic lists
  const energySourceOptions = [...availableEnergySource, "Todas as Fontes"];
  const submarketOptions = [...availableSubmarkets, "Todos os Submercados"];

  // Calculate annual KPIs
  const totalVolume = filteredPmixData.reduce((sum, item) => sum + (item.netVolumn || 0), 0);
  const totalMtM = filteredNetData.reduce((sum, item) => sum + (item.MtM || 0), 0);
  const totalProfitLoss = filteredNetData.reduce((sum, item) => sum + (item.profitLoss || 0), 0);
  const totalExposure = filteredNetData.reduce((sum, item) => sum + (item.faceValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">Posições Líquidas</h2>
        <EnergyFilters
          energySource={energySource}
          setEnergySource={setEnergySource}
          submarket={submarket}
          setSubmarket={setSubmarket}
          year={year}
          setYear={setYear}
          availableYears={availableYears}
          availableEnergySource={energySourceOptions}
          availableSubmarkets={submarketOptions}
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

        {!shouldHidePricesChart && (
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
      </div>
    </div>
  );
}