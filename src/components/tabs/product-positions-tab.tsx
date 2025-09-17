import { useState, useEffect } from 'react';
import { ProductFilters } from '@/components/filters/product-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { 
  loadExcelFile, 
  processProductData, 
  fillMissingMonths, 
  formatCurrency, 
  formatNumber, 
  getMonthName,
  type ProductData 
} from '@/lib/data-processing';

export function ProductPositionsTab() {
  const [year, setYear] = useState<number>(2025);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['todos']);
  const [productData, setProductData] = useState<ProductData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await loadExcelFile('net_products.xlsx');
        const processed = processProductData(rawData);
        setProductData(processed);
      } catch (error) {
        console.error('Erro ao carregar dados de produtos:', error);
      }
    };

    loadData();
  }, []);

  // Filter data based on current selections
  const filteredData = productData.filter(item => {
    return item.year === year;
  });

  // Get available years for filters
  const availableYears = [...new Set(productData.map(item => item.year))].sort();

  // Prepare volume chart data with all product types
  const getVolumeData = () => {
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
        year,
        ...data,
      })),
      year,
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
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.faceValue;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, faceValue]) => ({
        month: parseInt(month),
        year,
        faceValue,
      })),
      year,
      { faceValue: 0 }
    ).map(item => ({
      month: item.month,
      faceValue: item.faceValue,
    }));
  };

  const getMtmData = () => {
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.mtm;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, mtm]) => ({
        month: parseInt(month),
        year,
        mtm,
      })),
      year,
      { mtm: 0 }
    ).map(item => ({
      month: item.month,
      mtm: item.mtm,
    }));
  };

  const getProfitLossData = () => {
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      monthlyData[item.month] += item.profitLoss;
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, profitLoss]) => ({
        month: parseInt(month),
        year,
        profitLoss,
      })),
      year,
      { profitLoss: 0 }
    ).map(item => ({
      month: item.month,
      profitLoss: item.profitLoss,
    }));
  };

  // Calculate KPIs
  const totalExposure = filteredData.reduce((sum, item) => sum + item.faceValue, 0);
  const totalMtm = filteredData.reduce((sum, item) => sum + item.mtm, 0);
  const totalProfitLoss = filteredData.reduce((sum, item) => sum + item.profitLoss, 0);

  return (
    <div className="space-y-6">
      <ProductFilters 
        onFiltersChange={({ year, selectedProducts }) => {
          setYear(year);
          setSelectedProducts(selectedProducts);
        }}
        availableYears={availableYears}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Exposição Total"
          value={formatCurrency(totalExposure)}
          subtitle="Face Value"
        />
        <KpiCard
          title="MtM Total"
          value={formatCurrency(totalMtm)}
          subtitle="Mark-to-Market"
          trend={totalMtm >= 0 ? "up" : "down"}
        />
        <KpiCard
          title="P&L Total"
          value={formatCurrency(totalProfitLoss)}
          subtitle="Profit & Loss"
          trend={totalProfitLoss >= 0 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <ChartContainer
          title="Volumes por Tipo de Produto"
          description="Evolução mensal dos volumes por tipo de produto (MWm)"
          className="w-full"
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
          title="Exposição"
          description="Evolução mensal do Face Value"
          className="w-full"
        >
          <FinancialLineChart
            data={getExposureData()}
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
          title="Mark-to-Market (MtM)"
          description="Evolução mensal do MtM"
          className="w-full"
        >
          <FinancialLineChart
            data={getMtmData()}
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
          title="Profit and Loss (P&L)"
          description="Evolução mensal do P&L"
          className="w-full"
        >
          <FinancialLineChart
            data={getProfitLossData()}
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