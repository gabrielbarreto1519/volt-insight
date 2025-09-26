import React, { useState, useEffect } from 'react';
import { CounterpartyProductFilters } from '@/components/filters/counterparty-product-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import {
  loadExcelFile,
  processCounterpartyProductData,
  fillMissingMonths,
  CounterpartyProductData,
  formatCurrency,
  formatNumber,
  aggregateByYear
} from '@/lib/data-processing';

export function CounterpartyProductPositionsTab() {
  const [counterparty, setCounterparty] = useState('');
  const [year, setYear] = useState('2025');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['todos']);
  
  const [counterpartyProductData, setCounterpartyProductData] = useState<CounterpartyProductData[]>([]);
  const [availableCounterparties, setAvailableCounterparties] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadExcelFile('net_counterparty_products.xlsx');
        const processedData = processCounterpartyProductData(data);
        setCounterpartyProductData(processedData);
        
        // Get unique counterparties
        const uniqueCounterparties = [...new Set(processedData.map(d => d.counterparty))].sort();
        setAvailableCounterparties(uniqueCounterparties);
        
        // Set first counterparty as default
        if (uniqueCounterparties.length > 0 && !counterparty) {
          setCounterparty(uniqueCounterparties[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de produtos por contraparte:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selections
  const filteredData = counterpartyProductData.filter(d => {
    const matchesCounterparty = d.counterparty === counterparty;
    const matchesYear = year === 'Todos' || d.year === parseInt(year);
    return matchesCounterparty && matchesYear;
  });

  // Get available options from data for dynamic filters (including "Todos" option)
  const uniqueYears = [...new Set(counterpartyProductData.map(d => d.year.toString()))].sort();
  const availableYears = ['Todos', ...uniqueYears.filter(year => year !== 'Todos')];

  // Calculate KPIs
  const calculateKPIs = () => {
    if (!counterparty || filteredData.length === 0) return null;
    
    const totalFaceValue = aggregateByYear(filteredData, 'faceValue');
    const totalMtM = aggregateByYear(filteredData, 'mtm');
    const totalPL = aggregateByYear(filteredData, 'profitLoss');
    const totalVolumeEnergy = aggregateByYear(filteredData, 'energyVolumn');
    const totalVolumeConventional = aggregateByYear(filteredData, 'conVolumn');
    const totalVolumeIncentivada = aggregateByYear(filteredData, 'sourceVolumn');
    const totalVolumeSE = aggregateByYear(filteredData, 'seSubmarketVolumn');
    const totalVolumeS = aggregateByYear(filteredData, 'sSubmarketVolumn');
    const totalVolumeNE = aggregateByYear(filteredData, 'neSubmarketVolumn');
    const totalVolumeN = aggregateByYear(filteredData, 'nSubmarketVolumn');
    
    return {
      totalFaceValue,
      totalMtM,
      totalPL,
      totalVolumeEnergy,
      totalVolumeConventional,
      totalVolumeIncentivada,
      totalVolumeSE,
      totalVolumeS,
      totalVolumeNE,
      totalVolumeN,
    };
  };

  const kpis = calculateKPIs();
  const showCharts = year !== 'Todos';

  // Prepare chart data functions
  const getVolumeData = () => {
    if (!showCharts) return [];
    
    const monthlyData: { [key: number]: {
      energia: number;
      convencional: number;
      incentivada: number;
      seSubmarket: number;
      sSubmarket: number;
      neSubmarket: number;
      nSubmarket: number;
    } } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = {
          energia: 0,
          convencional: 0,
          incentivada: 0,
          seSubmarket: 0,
          sSubmarket: 0,
          neSubmarket: 0,
          nSubmarket: 0,
        };
      }
      
      monthlyData[item.month].energia += item.energyVolumn;
      monthlyData[item.month].convencional += item.conVolumn;
      monthlyData[item.month].incentivada += item.sourceVolumn;
      monthlyData[item.month].seSubmarket += item.seSubmarketVolumn;
      monthlyData[item.month].sSubmarket += item.sSubmarketVolumn;
      monthlyData[item.month].neSubmarket += item.neSubmarketVolumn;
      monthlyData[item.month].nSubmarket += item.nSubmarketVolumn;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, data]) => ({
        month: parseInt(month),
        year: parseInt(year),
        ...data,
      })),
      parseInt(year),
      { energia: 0, convencional: 0, incentivada: 0, seSubmarket: 0, sSubmarket: 0, neSubmarket: 0, nSubmarket: 0 }
    ).map(item => ({
      month: item.month,
      energia: item.energia,
      convencional: item.convencional,
      incentivada: item.incentivada,
      seSubmarket: item.seSubmarket,
      sSubmarket: item.sSubmarket,
      neSubmarket: item.neSubmarket,
      nSubmarket: item.nSubmarket,
    }));
  };

  const getExposureData = () => {
    if (!showCharts) return [];
    
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.faceValue;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, faceValue]) => ({
        month: parseInt(month),
        year: parseInt(year),
        faceValue,
      })),
      parseInt(year),
      { faceValue: 0 }
    ).map(item => ({
      month: item.month,
      faceValue: item.faceValue,
    }));
  };

  const getMtmData = () => {
    if (!showCharts) return [];
    
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.mtm;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, mtm]) => ({
        month: parseInt(month),
        year: parseInt(year),
        mtm,
      })),
      parseInt(year),
      { mtm: 0 }
    ).map(item => ({
      month: item.month,
      mtm: item.mtm,
    }));
  };

  const getProfitLossData = () => {
    if (!showCharts) return [];
    
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.profitLoss;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, profitLoss]) => ({
        month: parseInt(month),
        year: parseInt(year),
        profitLoss,
      })),
      parseInt(year),
      { profitLoss: 0 }
    ).map(item => ({
      month: item.month,
      profitLoss: item.profitLoss,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <CounterpartyProductFilters
          counterparty={counterparty}
          setCounterparty={setCounterparty}
          year={year}
          setYear={setYear}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          availableCounterparties={availableCounterparties}
          availableYears={availableYears}
        />
      </div>

      {/* KPI Cards */}
      {kpis && counterparty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Exposição Total"
            value={formatCurrency(kpis.totalFaceValue)}
            trend={kpis.totalFaceValue >= 0 ? "up" : "down"}
            isNegative={kpis.totalFaceValue < 0}
          />
          <KpiCard
            title="MtM Total"
            value={formatCurrency(kpis.totalMtM)}
            trend={kpis.totalMtM >= 0 ? "up" : "down"}
            isNegative={kpis.totalMtM < 0}
          />
          <KpiCard
            title="P&L Total"
            value={formatCurrency(kpis.totalPL)}
            trend={kpis.totalPL >= 0 ? "up" : "down"}
            isNegative={kpis.totalPL < 0}
          />
        </div>
      )}

      {/* Charts - Only show when year is not "Todos" */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-6">
          <ChartContainer
            title="Volumes por Tipo de Produto"
            description="Volume mensal por tipo de produto da contraparte selecionada"
          >
            <FinancialLineChart
              data={getVolumeData()}
              lines={[
                ...(selectedProducts.includes('todos') || selectedProducts.includes('energia') ? [{
                  dataKey: 'energia' as const,
                  stroke: 'hsl(var(--chart-1))',
                  name: 'Energia',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('convencional') ? [{
                  dataKey: 'convencional' as const,
                  stroke: 'hsl(var(--chart-2))',
                  name: 'Convencional',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('incentivada') ? [{
                  dataKey: 'incentivada' as const,
                  stroke: 'hsl(var(--chart-3))',
                  name: 'Incentivada 50%',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('seSubmarket') ? [{
                  dataKey: 'seSubmarket' as const,
                  stroke: 'hsl(var(--chart-4))',
                  name: 'Sudeste/Centro-Oeste',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('sSubmarket') ? [{
                  dataKey: 'sSubmarket' as const,
                  stroke: 'hsl(var(--chart-5))',
                  name: 'Sul',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('neSubmarket') ? [{
                  dataKey: 'neSubmarket' as const,
                  stroke: 'hsl(var(--destructive))',
                  name: 'Nordeste',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
                ...(selectedProducts.includes('todos') || selectedProducts.includes('nSubmarket') ? [{
                  dataKey: 'nSubmarket' as const,
                  stroke: 'hsl(var(--primary))',
                  name: 'Norte',
                  unit: 'MWm',
                  format: 'number' as const,
                }] : []),
              ]}
              height={400}
              yAxisFormat="number"
            />
          </ChartContainer>

          <ChartContainer
            title="Exposição (Face Value) por Mês"
            description="Face value mensal da contraparte"
          >
            <FinancialLineChart
              data={getExposureData()}
              lines={[
                {
                  dataKey: 'faceValue',
                  stroke: 'hsl(var(--chart-2))',
                  name: 'Face Value',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>

          <ChartContainer
            title="Marcação a Mercado"
            description="MtM mensal da contraparte selecionada"
          >
            <FinancialLineChart
              data={getMtmData()}
              lines={[
                {
                  dataKey: 'mtm',
                  stroke: 'hsl(var(--profit))',
                  name: 'MtM',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>

          <ChartContainer
            title="Profit and Loss"
            description="P&L mensal da contraparte selecionada"
          >
            <FinancialLineChart
              data={getProfitLossData()}
              lines={[
                {
                  dataKey: 'profitLoss',
                  stroke: 'hsl(var(--loss))',
                  name: 'P&L',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>
        </div>
      )}
    </div>
  );
}