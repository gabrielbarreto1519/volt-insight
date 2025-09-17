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
  const [productDimension, setProductDimension] = useState<'energia' | 'fonte' | 'submercado'>('energia');
  const [submarketType, setSubmarketType] = useState<'N' | 'NE' | 'SE' | 'S'>('N');
  const [maturation, setMaturation] = useState<string | undefined>(undefined);
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
    if (item.year !== year) return false;
    if (maturation && item.maturation !== maturation) return false;
    return true;
  });

  // Get available years and maturations for filters
  const availableYears = [...new Set(productData.map(item => item.year))].sort();
  const availableMaturations = [...new Set(productData.map(item => item.maturation))].sort();

  // Prepare chart data based on product dimension
  const getVolumeData = () => {
    const monthlyData: { [key: number]: number } = {};
    
    filteredData.forEach(item => {
      if (!monthlyData[item.month]) monthlyData[item.month] = 0;
      
      switch (productDimension) {
        case 'energia':
          monthlyData[item.month] += item.energyVolumn;
          break;
        case 'fonte':
          monthlyData[item.month] += item.sourceVolumn + item.conVolumn;
          break;
        case 'submercado':
          switch (submarketType) {
            case 'N':
              monthlyData[item.month] += item.nSubmarketVolumn;
              break;
            case 'NE':
              monthlyData[item.month] += item.neSubmarketVolumn;
              break;
            case 'SE':
              monthlyData[item.month] += item.seSubmarketVolumn;
              break;
            case 'S':
              monthlyData[item.month] += item.sSubmarketVolumn;
              break;
          }
          break;
      }
    });

    return fillMissingMonths(
      Object.entries(monthlyData).map(([month, volume]) => ({
        month: parseInt(month),
        year,
        volume,
      })),
      year,
      { volume: 0 }
    ).map(item => ({
      month: item.month,
      volume: item.volume,
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
  const totalVolume = filteredData.reduce((sum, item) => {
    switch (productDimension) {
      case 'energia':
        return sum + item.energyVolumn;
      case 'fonte':
        return sum + item.sourceVolumn + item.conVolumn;
      case 'submercado':
        switch (submarketType) {
          case 'N':
            return sum + item.nSubmarketVolumn;
          case 'NE':
            return sum + item.neSubmarketVolumn;
          case 'SE':
            return sum + item.seSubmarketVolumn;
          case 'S':
            return sum + item.sSubmarketVolumn;
          default:
            return sum;
        }
      default:
        return sum;
    }
  }, 0);

  const totalExposure = filteredData.reduce((sum, item) => sum + item.faceValue, 0);
  const totalMtm = filteredData.reduce((sum, item) => sum + item.mtm, 0);
  const totalProfitLoss = filteredData.reduce((sum, item) => sum + item.profitLoss, 0);

  const volumeUnit = productDimension === 'energia' ? 'MWm' : 'MWm';
  const dimensionLabel = productDimension === 'energia' ? 'Energia' 
    : productDimension === 'fonte' ? 'Fonte (Conv./Inc.)'
    : `Submercado ${submarketType}`;

  return (
    <div className="space-y-6">
      <ProductFilters 
        onFiltersChange={({ year, productDimension, submarketType, maturation }) => {
          setYear(year);
          setProductDimension(productDimension);
          if (submarketType) setSubmarketType(submarketType);
          setMaturation(maturation);
        }}
        availableYears={availableYears}
        availableMaturations={availableMaturations}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Volume Total"
          value={formatNumber(totalVolume, 2)}
          subtitle={`${volumeUnit} (${dimensionLabel})`}
        />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title={`Volume do Produto - ${dimensionLabel}`}
          description={`Evolução mensal do volume (${volumeUnit})`}
        >
          <FinancialLineChart
            data={getVolumeData()}
            lines={[
              {
                dataKey: 'volume',
                stroke: 'hsl(var(--chart-1))',
                name: 'Volume',
                unit: volumeUnit,
                format: 'number',
              },
            ]}
            height={300}
            yAxisFormat="number"
          />
        </ChartContainer>

        <ChartContainer
          title="Exposição"
          description="Evolução mensal do Face Value"
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