import React, { useState, useEffect } from 'react';
import { ChartContainer } from '@/components/ui/chart-container';
import { KpiCard } from '@/components/ui/kpi-card';
import { FinancialLineChart } from '@/components/charts/financial-line-chart';
import { 
  loadExcelFile, 
  processCreditExposureData,
  processCreditExposureMonthlyData,
  processCounterpartyProductData,
  CreditExposureData,
  CreditExposureMonthlyData,
  CounterpartyProductData,
  formatCurrency, 
  formatNumber,
  fillMissingMonths
} from '@/lib/data-processing';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SpecialFilter = 'none' | 'top-pl' | 'above-pl-limit' | 'above-el-limit';

export function BilateralRiskTab() {
  const [counterparty, setCounterparty] = useState('');
  const [year, setYear] = useState<string>('2025');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>('none');
  
  const [creditExposureData, setCreditExposureData] = useState<CreditExposureData[]>([]);
  const [creditExposureMonthlyData, setCreditExposureMonthlyData] = useState<CreditExposureMonthlyData[]>([]);
  const [counterpartyProductData, setCounterpartyProductData] = useState<CounterpartyProductData[]>([]);
  const [availableCounterparties, setAvailableCounterparties] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [creditData, monthlyData, productData] = await Promise.all([
          loadExcelFile('credit_exposure.xlsx'),
          loadExcelFile('credit_exposure_-_month.xlsx'),
          loadExcelFile('net_counterparty_products.xlsx')
        ]);
        
        const processedCredit = processCreditExposureData(creditData);
        const processedMonthly = processCreditExposureMonthlyData(monthlyData);
        const processedProduct = processCounterpartyProductData(productData);
        
        // Filter out ACR and I ratings (no credit risk)
        const filteredCredit = processedCredit.filter(d => d.rating !== 'ACR' && d.rating !== 'I');
        
        setCreditExposureData(filteredCredit);
        setCreditExposureMonthlyData(processedMonthly);
        setCounterpartyProductData(processedProduct);
        
        // Get unique counterparties (excluding ACR and I)
        const uniqueCounterparties = [...new Set(filteredCredit.map(d => d.counterparty))].sort();
        setAvailableCounterparties(uniqueCounterparties);
        
        // Set first counterparty as default
        if (uniqueCounterparties.length > 0 && !counterparty) {
          setCounterparty(uniqueCounterparties[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de risco bilateral:', error);
      }
    };
    
    loadData();
  }, []);

  // Get available years from monthly data
  const availableYears = [...new Set(creditExposureMonthlyData.map(d => d.year.toString()))].sort();

  // Get filtered counterparties based on special filter
  const getFilteredCounterparties = (): CreditExposureData[] => {
    switch (specialFilter) {
      case 'top-pl':
        return [...creditExposureData].sort((a, b) => b.profitLoss_year - a.profitLoss_year);
      case 'above-pl-limit':
        return creditExposureData.filter(d => d.profitLoss_year > d.profitLossLimit);
      case 'above-el-limit':
        return creditExposureData.filter(d => d.EL_PFE_year > d.profitLossLimit);
      default:
        return [];
    }
  };

  const filteredCounterpartyList = getFilteredCounterparties();
  const showCounterpartyCards = specialFilter !== 'none';

  // Get KPIs for selected counterparty
  const getKPIs = () => {
    const counterpartyData = creditExposureData.find(d => d.counterparty === counterparty);
    if (!counterpartyData) return null;
    
    return {
      profitLossLimit: counterpartyData.profitLossLimit,
      profitLoss: counterpartyData.profitLoss_year,
      rating: counterpartyData.rating,
      expectedLoss: counterpartyData.EL_PFE_year,
      pfe: counterpartyData.PFE_year,
    };
  };

  const kpis = getKPIs();

  // Get volumes by product type (GRÁFICO 1)
  const getVolumesByProductType = () => {
    const filteredData = counterpartyProductData.filter(d => 
      d.counterparty === counterparty && 
      d.year === parseInt(year)
    );

    const monthlyData: { [key: number]: {
      energia: number;
      convencional: number;
      incentivada: number;
      seSubmarket: number;
      sSubmarket: number;
      neSubmarket: number;
      nSubmarket: number;
    }} = {};

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
      
      monthlyData[item.month].energia += item.energyVolumn || 0;
      monthlyData[item.month].convencional += item.conVolumn || 0;
      monthlyData[item.month].incentivada += item.sourceVolumn || 0;
      monthlyData[item.month].seSubmarket += item.seSubmarketVolumn || 0;
      monthlyData[item.month].sSubmarket += item.sSubmarketVolumn || 0;
      monthlyData[item.month].neSubmarket += item.neSubmarketVolumn || 0;
      monthlyData[item.month].nSubmarket += item.nSubmarketVolumn || 0;
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

  // Get monthly PFE data (GRÁFICO 2)
  const getMonthlyPFE = () => {
    const filteredData = creditExposureMonthlyData.filter(d => 
      d.counterparty === counterparty && 
      d.year === parseInt(year)
    );

    const filled = fillMissingMonths(
      filteredData,
      parseInt(year),
      {
        counterparty,
        counterpartyCode: filteredData[0]?.counterpartyCode || '',
        maturation: '',
        profitLoss: 0,
        EE: 0,
        PFE: 0,
        CVaR: 0,
        PD: 0,
        LGD: 0,
        EL_EE: 0,
        EL_PFE: 0,
        EL_CVaR: 0,
        profitLossLimit: 0,
        rating: filteredData[0]?.rating || '',
      }
    );

    return filled.map(d => ({
      month: d.month,
      PFE: d.PFE,
    }));
  };

  const volumeData = getVolumesByProductType();
  const pfeData = getMonthlyPFE();

  // Get monthly P&L data (GRÁFICO 3)
  const getMonthlyPL = () => {
    const filteredData = creditExposureMonthlyData.filter(d => 
      d.counterparty === counterparty && 
      d.year === parseInt(year)
    );

    const filled = fillMissingMonths(
      filteredData,
      parseInt(year),
      {
        counterparty,
        counterpartyCode: filteredData[0]?.counterpartyCode || '',
        maturation: '',
        profitLoss: 0,
        EE: 0,
        PFE: 0,
        CVaR: 0,
        PD: 0,
        LGD: 0,
        EL_EE: 0,
        EL_PFE: 0,
        EL_CVaR: 0,
        profitLossLimit: 0,
        rating: filteredData[0]?.rating || '',
      }
    );

    return filled.map(d => ({
      month: d.month,
      profitLoss: d.profitLoss,
    }));
  };

  const plData = getMonthlyPL();

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">Risco Bilateral</h3>
        <p className="text-muted-foreground text-sm">
          Análise de risco bilateral por contraparte ao longo do ano
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Ano:</span>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Counterparty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Contraparte:</span>
          <Select value={counterparty} onValueChange={(val) => {
            setCounterparty(val);
            setSpecialFilter('none');
          }}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCounterparties.map(cp => (
                <SelectItem key={cp} value={cp}>{cp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Special Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">Filtros especiais:</span>
          <Badge 
            variant={specialFilter === 'top-pl' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => {
              setSpecialFilter(specialFilter === 'top-pl' ? 'none' : 'top-pl');
              if (specialFilter !== 'top-pl' && filteredCounterpartyList.length > 0) {
                setCounterparty(filteredCounterpartyList[0].counterparty);
              }
            }}
          >
            Top P&L (toda carteira)
          </Badge>
          <Badge 
            variant={specialFilter === 'above-pl-limit' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => {
              setSpecialFilter(specialFilter === 'above-pl-limit' ? 'none' : 'above-pl-limit');
              if (specialFilter !== 'above-pl-limit') {
                const filtered = creditExposureData.filter(d => d.profitLoss_year > d.profitLossLimit);
                if (filtered.length > 0) {
                  setCounterparty(filtered[0].counterparty);
                }
              }
            }}
          >
            Acima do limite por P&L
          </Badge>
          <Badge 
            variant={specialFilter === 'above-el-limit' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => {
              setSpecialFilter(specialFilter === 'above-el-limit' ? 'none' : 'above-el-limit');
              if (specialFilter !== 'above-el-limit') {
                const filtered = creditExposureData.filter(d => d.EL_PFE_year > d.profitLossLimit);
                if (filtered.length > 0) {
                  setCounterparty(filtered[0].counterparty);
                }
              }
            }}
          >
            Acima do limite por Expected Loss
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <KpiCard
            title="P&L Limit"
            value={formatCurrency(kpis.profitLossLimit)}
          />
          <KpiCard
            title="P&L"
            value={formatCurrency(kpis.profitLoss)}
            isNegative={kpis.profitLoss < 0}
          />
          <KpiCard
            title="Potential Future Exposure"
            value={formatCurrency(kpis.pfe)}
          />
          <KpiCard
            title="Rating"
            value={kpis.rating}
          />
          <KpiCard
            title="Expected Loss"
            value={formatCurrency(kpis.expectedLoss)}
          />
        </div>
      )}

      {/* GRÁFICO 1 - Volumes por tipo de produto */}
      <ChartContainer
        title="Volumes"
        description="Volumes por produto"
      >
        <FinancialLineChart
          data={volumeData}
          lines={[
            {
              dataKey: 'energia' as const,
              stroke: 'hsl(var(--chart-1))',
              name: 'Energia',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'convencional' as const,
              stroke: 'hsl(var(--chart-2))',
              name: 'Convencional',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'incentivada' as const,
              stroke: 'hsl(var(--chart-3))',
              name: 'Incentivada 50%',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'seSubmarket' as const,
              stroke: 'hsl(var(--chart-4))',
              name: 'Sudeste/Centro-Oeste',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'sSubmarket' as const,
              stroke: 'hsl(var(--chart-5))',
              name: 'Sul',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'neSubmarket' as const,
              stroke: 'hsl(var(--destructive))',
              name: 'Nordeste',
              unit: 'MWm',
              format: 'number' as const,
            },
            {
              dataKey: 'nSubmarket' as const,
              stroke: 'hsl(var(--warning))',
              name: 'Norte',
              unit: 'MWm',
              format: 'number' as const,
            },
          ]}
        />
      </ChartContainer>

      {/* GRÁFICO 2 - Potential Future Exposure mensal */}
      <ChartContainer
        title="Potential Future Exposure (PFE)"
        description="Evolução mensal da Potential Future Exposure"
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={pfeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => monthNames[value - 1]}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => monthNames[label - 1]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="PFE" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              name="Potential Future Exposure"
              dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* GRÁFICO 3 - P&L mensal */}
      <ChartContainer
        title="Profit and Loss"
        description="Evolução mensal do P&L"
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={plData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => monthNames[value - 1]}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => monthNames[label - 1]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="profitLoss" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="P&L"
              dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Counterparty Cards (only when special filter is active) */}
      {showCounterpartyCards && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">
            Contrapartes Filtradas ({filteredCounterpartyList.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCounterpartyList.map((cp) => (
              <Card 
                key={cp.counterparty}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  counterparty === cp.counterparty ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCounterparty(cp.counterparty)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{cp.counterparty}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P&L:</span>
                    <span className={cp.profitLoss_year >= 0 ? 'text-profit font-semibold' : 'text-loss font-semibold'}>
                      {formatCurrency(cp.profitLoss_year)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Future Exposure:</span>
                    <span className="font-medium">{formatCurrency(cp.PFE_year)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P&L Limit:</span>
                    <span className="font-medium">{formatCurrency(cp.profitLossLimit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{cp.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
