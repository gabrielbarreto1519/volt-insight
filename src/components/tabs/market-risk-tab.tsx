import React, { useState, useEffect } from 'react';
import { RiskFilters } from '@/components/filters/risk-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { loadExcelFile, processRiskData, fillMissingMonths, RiskData, formatCurrency, formatNumber, formatPercent } from '@/lib/data-processing';

export function MarketRiskTab() {
  const [year, setYear] = useState('2025');
  const [produto, setProduto] = useState('Energia');
  const [isVaR, setIsVaR] = useState(true);
  
  const [monthlyRiskData, setMonthlyRiskData] = useState<RiskData[]>([]);
  const [yearlyRiskData, setYearlyRiskData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [monthlyRaw, yearlyRaw] = await Promise.all([
          loadExcelFile('downside_risk_-_month.xlsx'),
          loadExcelFile('downside_risk_-_year.xlsx')
        ]);
        
        setMonthlyRiskData(processRiskData(monthlyRaw));
        setYearlyRiskData(yearlyRaw);
      } catch (error) {
        console.error('Erro ao carregar dados de risco:', error);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selections
  const filteredMonthlyData = monthlyRiskData.filter(d => d.year === parseInt(year));
  const currentYearData = yearlyRiskData.find(d => d.year === parseInt(year));

  // Get available options from data for dynamic filters
  const availableYears = [...new Set([...monthlyRiskData.map(d => d.year.toString()), ...yearlyRiskData.map(d => d.year?.toString())])].filter(Boolean).sort();
  const availableProdutos = ['Energia', 'Fonte', 'Submercado']; // These are based on the data structure

  // Get annual KPIs
  const getAnnualKPIs = () => {
    if (!currentYearData) return null;
    
    const varTotal = isVaR ? currentYearData.VaR_total : currentYearData.CVaR_total;
    const plTotal = isVaR ? currentYearData.profitLossTotal_VaR : currentYearData.profitLossTotal_CVaR;
    const energyPercentage = isVaR ? currentYearData.percentageVaRenergy : currentYearData.percentageCVaRenergy;
    const submarketPercentage = isVaR ? currentYearData.percentageVaRsubmarket : currentYearData.percentageCVaRsubmarket;
    const sourcePercentage = isVaR ? currentYearData.percentageVaRsource : currentYearData.percentageCVaRsource;
    
    return {
      varTotal,
      mtmTotal: currentYearData.faceValue, // Using faceValue as MtM Total
      exposicaoTotal: currentYearData.faceValue, // Using faceValue as Exposição Total
      plTotal,
      energyPercentage,
      submarketPercentage,
      sourcePercentage,
    };
  };

  const annualKPIs = getAnnualKPIs();

  // Prepare exposure/risk by product chart data
  const getProductFieldName = () => {
    const prefix = isVaR ? 'VaR_' : 'CVaR_';
    switch (produto) {
      case 'Energia': return prefix + 'energy';
      case 'Fonte': return prefix + 'source';
      case 'Submercado': return prefix + 'submarket';
      default: return prefix + 'energy'; // fallback to energy
    }
  };

  const exposureChartData = fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      productRisk: d[getProductFieldName() as keyof RiskData] as number,
      totalRisk: isVaR ? d.VaR_total : d.CVaR_total,
    })),
    parseInt(year),
    { productRisk: 0, totalRisk: 0 }
  );

  // Prepare percentage decomposition chart data
  const percentageChartData = fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      energyPercent: isVaR ? d.percentageVaRenergy : d.percentageCVaRenergy,
      sourcePercent: isVaR ? d.percentageVaRsource : d.percentageCVaRsource,
      submarketPercent: isVaR ? d.percentageVaRsubmarket : d.percentageCVaRsubmarket,
    })),
    parseInt(year),
    { energyPercent: 0, sourcePercent: 0, submarketPercent: 0 }
  );

  // Prepare P&L + Risk measure chart data
  const plRiskChartData = fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      profitLoss: isVaR ? d.profitLossTotal_VaR : d.profitLossTotal_CVaR,
      riskMeasure: isVaR ? d.VaR_total : d.CVaR_total,
    })),
    parseInt(year),
    { profitLoss: 0, riskMeasure: 0 }
  );

  // Prepare volume chart data based on product selection
  const getVolumeData = () => {
    switch (produto) {
      case 'Energia':
        return fillMissingMonths(
          filteredMonthlyData.map(d => ({
            month: d.month,
            year: d.year,
            volume: d.energyVolumn,
          })),
          parseInt(year),
          { volume: 0 }
        );
      case 'Fonte':
        return fillMissingMonths(
          filteredMonthlyData.map(d => ({
            month: d.month,
            year: d.year,
            sourceVolume: d.sourceVolumn,
            conVolume: d.conVolumn,
          })),
          parseInt(year),
          { sourceVolume: 0, conVolume: 0 }
        );
      case 'Submercado':
        return fillMissingMonths(
          filteredMonthlyData.map(d => ({
            month: d.month,
            year: d.year,
            nVolume: d.nSubmarketVolumn || 0,
            neVolume: d.neSubmarketVolumn || 0,
            seVolume: d.seSubmarketVolumn || 0,
            sVolume: d.sSubmarketVolumn || 0,
          })),
          parseInt(year),
          { nVolume: 0, neVolume: 0, seVolume: 0, sVolume: 0 }
        );
      default:
        return [];
    }
  };

  const volumeChartData = getVolumeData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">Risco de Mercado</h2>
        <RiskFilters
          year={year}
          setYear={setYear}
          produto={produto}
          setProduto={setProduto}
          isVaR={isVaR}
          setIsVaR={setIsVaR}
          availableYears={availableYears}
          availableProdutos={availableProdutos}
        />
      </div>

      {/* KPIs Anuais */}
      {annualKPIs && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title={`${isVaR ? 'VaR' : 'CVaR'} Total Anual`}
            value={formatCurrency(annualKPIs.varTotal)}
            trend="neutral"
          />
          <KpiCard
            title="MtM Total"
            value={formatCurrency(annualKPIs.mtmTotal)}
            trend="neutral"
          />
          <KpiCard
            title="Exposição Total"
            value={formatCurrency(annualKPIs.exposicaoTotal)}
            trend="neutral"
          />
          <KpiCard
            title="P&L Estressado"
            value={formatCurrency(annualKPIs.plTotal)}
            trend={annualKPIs.plTotal >= 0 ? "up" : "down"}
          />
          <KpiCard
            title="Distribuição de Risco"
            value={formatPercent(annualKPIs.energyPercentage)}
            subtitle={`Submercado: ${formatPercent(annualKPIs.submarketPercentage)} | Fonte: ${formatPercent(annualKPIs.sourcePercentage)}`}
            trend="neutral"
          />
        </div>
      )}

      {/* Gráficos Mensais */}
      <div className="grid grid-cols-1 gap-6">
        <ChartContainer
          title={`Exposição/Risco por Produto - ${produto}`}
          description={`${isVaR ? 'VaR95' : 'CVaR95'} mensal com linha total`}
        >
          <FinancialLineChart
            data={exposureChartData}
            lines={[
              {
                dataKey: 'productRisk',
                stroke: 'hsl(var(--chart-1))',
                name: `${isVaR ? 'VaR' : 'CVaR'} ${produto}`,
                format: 'currency',
              },
              {
                dataKey: 'totalRisk',
                stroke: 'hsl(var(--chart-2))',
                strokeDasharray: '5 5',
                name: `${isVaR ? 'VaR' : 'CVaR'} Total`,
                format: 'currency',
              },
            ]}
            height={400}
            yAxisFormat="currency"
          />
        </ChartContainer>

        <ChartContainer
          title="Decomposição Percentual do Risco"
          description={`Contribuição por categoria - ${isVaR ? 'VaR95' : 'CVaR95'}`}
        >
          <FinancialLineChart
            data={percentageChartData}
            lines={[
              {
                dataKey: 'energyPercent',
                stroke: 'hsl(var(--chart-1))',
                name: '% Energia',
                format: 'percent',
              },
              {
                dataKey: 'sourcePercent',
                stroke: 'hsl(var(--chart-2))',
                name: '% Fonte',
                format: 'percent',
              },
              {
                dataKey: 'submarketPercent',
                stroke: 'hsl(var(--chart-3))',
                name: '% Submercado',
                format: 'percent',
              },
            ]}
            height={400}
            yAxisFormat="percent"
          />
        </ChartContainer>

        <ChartContainer
          title="P&L Estressado + Medida de Risco"
          description={`P&L e ${isVaR ? 'VaR95' : 'CVaR95'} mensal`}
        >
          <FinancialLineChart
            data={plRiskChartData}
            lines={[
              {
                dataKey: 'profitLoss',
                stroke: 'hsl(var(--profit))',
                name: 'P&L Estressado',
                format: 'currency',
              },
              {
                dataKey: 'riskMeasure',
                stroke: 'hsl(var(--loss))',
                name: `${isVaR ? 'VaR' : 'CVaR'} Total`,
                format: 'currency',
              },
            ]}
            height={400}
            yAxisFormat="currency"
          />
        </ChartContainer>

        {/* Volumes Chart - varies by product */}
        {produto === 'Energia' && (
          <ChartContainer
            title="Volumes que Sustentam o Risco - Energia"
            description="Volume de energia mensal"
          >
            <FinancialLineChart
              data={volumeChartData}
              lines={[
                {
                  dataKey: 'volume',
                  stroke: 'hsl(var(--chart-4))',
                  name: 'Volume Energia',
                  unit: 'MW',
                  format: 'number',
                },
              ]}
               height={400}
               yAxisFormat="number"
            />
          </ChartContainer>
        )}

        {produto === 'Fonte' && (
          <ChartContainer
            title="Volumes que Sustentam o Risco - Fonte"
            description="Volumes por fonte mensal"
          >
            <FinancialLineChart
              data={volumeChartData}
              lines={[
                {
                  dataKey: 'sourceVolume',
                  stroke: 'hsl(var(--chart-4))',
                  name: 'Volume Fonte',
                  unit: 'MW',
                  format: 'number',
                },
                {
                  dataKey: 'conVolume',
                  stroke: 'hsl(var(--chart-5))',
                  name: 'Volume Convencional',
                  unit: 'MW',
                  format: 'number',
                },
              ]}
               height={400}
               yAxisFormat="number"
            />
          </ChartContainer>
        )}

        {produto === 'Submercado' && (
          <ChartContainer
            title="Volumes que Sustentam o Risco - Submercado"
            description="Volumes por submercado mensal"
          >
            <FinancialLineChart
              data={volumeChartData}
              lines={[
                {
                  dataKey: 'nVolume',
                  stroke: 'hsl(var(--chart-1))',
                  name: 'Norte',
                  unit: 'MW',
                  format: 'number',
                },
                {
                  dataKey: 'neVolume',
                  stroke: 'hsl(var(--chart-2))',
                  name: 'Nordeste',
                  unit: 'MW',
                  format: 'number',
                },
                {
                  dataKey: 'seVolume',
                  stroke: 'hsl(var(--chart-3))',
                  name: 'Sudeste',
                  unit: 'MW',
                  format: 'number',
                },
                {
                  dataKey: 'sVolume',
                  stroke: 'hsl(var(--chart-4))',
                  name: 'Sul',
                  unit: 'MW',
                  format: 'number',
                },
              ]}
               height={400}
               yAxisFormat="number"
            />
          </ChartContainer>
        )}
      </div>
    </div>
  );
}