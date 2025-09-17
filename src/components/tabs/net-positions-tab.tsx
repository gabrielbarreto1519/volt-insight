import React, { useState, useEffect } from 'react';
import { EnergyFilters } from '@/components/filters/energy-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { loadExcelFile, processPmixData, processNetData, fillMissingMonths, PmixData, NetPosition } from '@/lib/data-processing';

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

  // Filter data based on selections
  const filteredPmixData = pmixData.filter(d => 
    d.energySourceDescription === energySource &&
    d.submarketDescription === submarket &&
    d.year === parseInt(year)
  );

  const filteredNetData = netData.filter(d => 
    d.energySourceDescription === energySource &&
    d.submarketDescription === submarket &&
    d.year === parseInt(year)
  );

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

  // Add annual consolidated line
  const annualAverage = filteredPmixData.reduce((sum, d) => sum + d.netVolumn, 0) / 12;
  const volumeDataWithConsolidated = volumeChartData.map(d => ({
    ...d,
    consolidated: annualAverage,
  }));

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
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Volumes de Energia"
          description="Volume líquido mensal com posição consolidada anual"
        >
          <FinancialLineChart
            data={volumeDataWithConsolidated}
            lines={[
              {
                dataKey: 'volume',
                stroke: 'hsl(var(--chart-1))',
                name: 'Volume Líquido',
                unit: 'MW',
                format: 'number',
              },
              {
                dataKey: 'consolidated',
                stroke: 'hsl(var(--chart-2))',
                strokeDasharray: '5 5',
                name: 'Posição Anual',
                unit: 'MW',
                format: 'number',
              },
            ]}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Preços Médios"
          description="Preço médio de compra e venda mensal"
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
          />
        </ChartContainer>

        <ChartContainer
          title="Marcação a Mercado"
          description="MtM mensal da posição selecionada"
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
          description="P&L mensal da posição selecionada"
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
    </div>
  );
}