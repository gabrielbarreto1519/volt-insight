import React, { useState, useEffect } from 'react';
import { CounterpartyFilters } from '@/components/filters/counterparty-filters';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { 
  loadExcelFile, 
  processCounterpartyData, 
  processCreditExposureData,
  processCreditExposureMonthlyData,
  fillMissingMonths, 
  CounterpartyData,
  CreditExposureData,
  CreditExposureMonthlyData,
  formatCurrency, 
  formatNumber, 
  aggregateByYear 
} from '@/lib/data-processing';

export function CreditRiskTab() {
  const [counterparty, setCounterparty] = useState('');
  const [year, setYear] = useState('2025');
  
  const [counterpartyData, setCounterpartyData] = useState<CounterpartyData[]>([]);
  const [creditExposureData, setCreditExposureData] = useState<CreditExposureData[]>([]);
  const [creditExposureMonthlyData, setCreditExposureMonthlyData] = useState<CreditExposureMonthlyData[]>([]);
  const [availableCounterparties, setAvailableCounterparties] = useState<string[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [netCounterparty, creditExposure, creditExposureMonthly] = await Promise.all([
          loadExcelFile('net_counterparty.xlsx'),
          loadExcelFile('credit_exposure.xlsx'),
          loadExcelFile('credit_exposure_-_month.xlsx')
        ]);
        
        const processedNetData = processCounterpartyData(netCounterparty);
        const processedCreditData = processCreditExposureData(creditExposure);
        const processedCreditMonthlyData = processCreditExposureMonthlyData(creditExposureMonthly);
        
        setCounterpartyData(processedNetData);
        setCreditExposureData(processedCreditData);
        setCreditExposureMonthlyData(processedCreditMonthlyData);
        
        // Get unique counterparties from credit exposure data
        const uniqueCounterparties = [...new Set(processedCreditData.map(d => d.counterparty))].sort();
        setAvailableCounterparties(uniqueCounterparties);
        
        // Set first counterparty as default
        if (uniqueCounterparties.length > 0 && !counterparty) {
          setCounterparty(uniqueCounterparties[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de crédito:', error);
      }
    };
    
    loadData();
  }, []);


  // Filter data based on selections
  const filteredData = counterpartyData.filter(d => {
    const matchesCounterparty = d.counterparty === counterparty;
    const isAllYear = year?.trim().toLowerCase() === '__all__' || year?.trim().toLowerCase() === 'todos';
    const matchesYear = isAllYear || d.year === parseInt(year);
    return matchesCounterparty && matchesYear;
  });

  const filteredMonthlyData = creditExposureMonthlyData.filter(d => {
    const matchesCounterparty = d.counterparty === counterparty;
    const isAllYear = year?.trim().toLowerCase() === '__all__' || year?.trim().toLowerCase() === 'todos';
    const matchesYear = isAllYear || d.year === parseInt(year);
    return matchesCounterparty && matchesYear;
  });

  // Get available options from data for dynamic filters
  const availableYears = [...new Set(creditExposureMonthlyData.map(d => d.year.toString().trim()))]
    .filter((y) => y.toLowerCase() !== 'todos')
    .sort();

  // Calculate annual KPIs for selected counterparty
  const getAnnualKPIs = () => {
    const isAllYearLocal = year?.trim().toLowerCase() === '__all__' || year?.trim().toLowerCase() === 'todos';
    if (!counterparty) return null;
    
    // Get yearly credit exposure data for the counterparty
    const yearlyData = creditExposureData.find(d => d.counterparty === counterparty);
    
    // Get net position data
    const totalFaceValue = aggregateByYear(filteredData, 'faceValue');
    const totalMtM = aggregateByYear(filteredData, 'MtM');
    const totalPL = aggregateByYear(filteredData, 'profitLoss');
    
    return {
      EPE: yearlyData?.EPE || 0,
      PFE_year: yearlyData?.PFE_year || 0,
      CVaR_year: yearlyData?.CVaR_year || 0,
      EL_EPE: yearlyData?.EL_EPE || 0,
      EL_PFE: yearlyData?.EL_PFE_year || 0,
      EL_CVaR: yearlyData?.EL_CVaR_year || 0,
      profitLossLimit: yearlyData?.profitLossLimit || 0,
      rating: yearlyData?.rating || '',
      totalFaceValue,
      totalMtM,
      totalPL,
    };
  };


  const annualKPIs = getAnnualKPIs();
  const isAllYear = year?.trim().toLowerCase() === '__all__' || year?.trim().toLowerCase() === 'todos';
  const showCharts = !isAllYear;

  // Prepare chart data for credit exposure metrics
  const eeChartData = showCharts ? fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      EE: d.EE,
    })),
    parseInt(year),
    { EE: 0 }
  ) : [];

  const pfeChartData = showCharts ? fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      PFE: d.PFE,
    })),
    parseInt(year),
    { PFE: 0 }
  ) : [];

  const cvarChartData = showCharts ? fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      CVaR: d.CVaR,
    })),
    parseInt(year),
    { CVaR: 0 }
  ) : [];

  const elChartData = showCharts ? fillMissingMonths(
    filteredMonthlyData.map(d => ({
      month: d.month,
      year: d.year,
      EL_EE: d.EL_EE,
      EL_PFE: d.EL_PFE,
      EL_CVaR: d.EL_CVaR,
    })),
    parseInt(year),
    { EL_EE: 0, EL_PFE: 0, EL_CVaR: 0 }
  ) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <CounterpartyFilters
          counterparty={counterparty}
          setCounterparty={setCounterparty}
          year={year}
          setYear={setYear}
          availableCounterparties={availableCounterparties}
          availableYears={availableYears}
        />
      </div>

      {/* KPI Cards - Credit Exposure Metrics */}
      {annualKPIs && counterparty && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="EPE (Expected Positive Exposure)"
              value={formatCurrency(annualKPIs.EPE)}
              trend={annualKPIs.EPE >= 0 ? "up" : "down"}
              isNegative={annualKPIs.EPE < 0}
            />
            <KpiCard
              title="PFE Anual"
              value={formatCurrency(annualKPIs.PFE_year)}
              trend={annualKPIs.PFE_year >= 0 ? "up" : "down"}
              isNegative={annualKPIs.PFE_year < 0}
            />
            <KpiCard
              title="CVaR Anual"
              value={formatCurrency(annualKPIs.CVaR_year)}
              trend={annualKPIs.CVaR_year >= 0 ? "up" : "down"}
              isNegative={annualKPIs.CVaR_year < 0}
            />
            <KpiCard
              title="Limite de P&L"
              value={formatCurrency(annualKPIs.profitLossLimit)}
              trend="neutral"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="EL (EPE)"
              value={formatCurrency(annualKPIs.EL_EPE)}
              trend={annualKPIs.EL_EPE >= 0 ? "up" : "down"}
              isNegative={annualKPIs.EL_EPE < 0}
            />
            <KpiCard
              title="EL (PFE)"
              value={formatCurrency(annualKPIs.EL_PFE)}
              trend={annualKPIs.EL_PFE >= 0 ? "up" : "down"}
              isNegative={annualKPIs.EL_PFE < 0}
            />
            <KpiCard
              title="EL (CVaR)"
              value={formatCurrency(annualKPIs.EL_CVaR)}
              trend={annualKPIs.EL_CVaR >= 0 ? "up" : "down"}
              isNegative={annualKPIs.EL_CVaR < 0}
            />
            <KpiCard
              title="Rating"
              value={annualKPIs.rating}
              trend="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KpiCard
              title="Face Value"
              value={formatCurrency(annualKPIs.totalFaceValue)}
              trend={annualKPIs.totalFaceValue >= 0 ? "up" : "down"}
              isNegative={annualKPIs.totalFaceValue < 0}
            />
            <KpiCard
              title="Mark-to-Market"
              value={formatCurrency(annualKPIs.totalMtM)}
              trend={annualKPIs.totalMtM >= 0 ? "up" : "down"}
              isNegative={annualKPIs.totalMtM < 0}
            />
            <KpiCard
              title="Profit and Loss"
              value={formatCurrency(annualKPIs.totalPL)}
              trend={annualKPIs.totalPL >= 0 ? "up" : "down"}
              isNegative={annualKPIs.totalPL < 0}
            />
          </div>
        </>
      )}

      {/* Charts - Only show when year is not "Todos" */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-6">
          <ChartContainer
            title="Expected Exposure (EE) por Mês"
            description="Exposição esperada mensal da contraparte"
          >
            <FinancialLineChart
              data={eeChartData}
              lines={[
                {
                  dataKey: 'EE',
                  stroke: 'hsl(var(--chart-1))',
                  name: 'Expected Exposure',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>

          <ChartContainer
            title="Potential Future Exposure (PFE) por Mês"
            description="Exposição futura potencial mensal"
          >
            <FinancialLineChart
              data={pfeChartData}
              lines={[
                {
                  dataKey: 'PFE',
                  stroke: 'hsl(var(--chart-2))',
                  name: 'PFE',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>

          <ChartContainer
            title="CVaR por Mês"
            description="Conditional Value at Risk mensal"
          >
            <FinancialLineChart
              data={cvarChartData}
              lines={[
                {
                  dataKey: 'CVaR',
                  stroke: 'hsl(var(--chart-3))',
                  name: 'CVaR',
                  format: 'currency',
                },
              ]}
              height={400}
              yAxisFormat="currency"
            />
          </ChartContainer>

          <ChartContainer
            title="Expected Loss (EL) por Mês"
            description="Perda esperada mensal por métrica"
          >
            <FinancialLineChart
              data={elChartData}
              lines={[
                {
                  dataKey: 'EL_EE',
                  stroke: 'hsl(var(--profit))',
                  name: 'EL (EE)',
                  format: 'currency',
                },
                {
                  dataKey: 'EL_PFE',
                  stroke: 'hsl(var(--chart-4))',
                  name: 'EL (PFE)',
                  format: 'currency',
                },
                {
                  dataKey: 'EL_CVaR',
                  stroke: 'hsl(var(--loss))',
                  name: 'EL (CVaR)',
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