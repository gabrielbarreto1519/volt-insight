import { useState, useEffect } from 'react';
import { loadExcelFile } from '@/lib/data-processing';

export function DebugData() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadDebugData = async () => {
      try {
        // Load all problematic files
        const [netProducts, monthlyRisk, yearlyRisk] = await Promise.all([
          loadExcelFile('net_products.xlsx'),
          loadExcelFile('downside_risk_-_month.xlsx'),
          loadExcelFile('downside_risk_-_year.xlsx')
        ]);

        setDebugInfo({
          netProducts: {
            sample: netProducts.slice(0, 2),
            fields: netProducts.length > 0 ? Object.keys(netProducts[0]) : [],
            count: netProducts.length
          },
          monthlyRisk: {
            sample: monthlyRisk.slice(0, 2),
            fields: monthlyRisk.length > 0 ? Object.keys(monthlyRisk[0]) : [],
            count: monthlyRisk.length
          },
          yearlyRisk: {
            sample: yearlyRisk.slice(0, 2),
            fields: yearlyRisk.length > 0 ? Object.keys(yearlyRisk[0]) : [],
            count: yearlyRisk.length
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados de debug:', error);
        setDebugInfo({ error: error.message });
      }
    };

    loadDebugData();
  }, []);

  if (!debugInfo) return <div>Carregando dados de debug...</div>;

  if (debugInfo.error) return <div>Erro: {debugInfo.error}</div>;

  return (
    <div className="p-4 space-y-4 text-sm">
      <h3 className="text-lg font-bold">Debug - Estrutura dos Novos Dados</h3>
      
      <div>
        <h4 className="font-bold">net_products.xlsx ({debugInfo.netProducts.count} linhas)</h4>
        <p>Campos: {debugInfo.netProducts.fields.join(', ')}</p>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(debugInfo.netProducts.sample, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-bold">downside_risk_-_month.xlsx ({debugInfo.monthlyRisk.count} linhas)</h4>
        <p>Campos: {debugInfo.monthlyRisk.fields.join(', ')}</p>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(debugInfo.monthlyRisk.sample, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-bold">downside_risk_-_year.xlsx ({debugInfo.yearlyRisk.count} linhas)</h4>
        <p>Campos: {debugInfo.yearlyRisk.fields.join(', ')}</p>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(debugInfo.yearlyRisk.sample, null, 2)}
        </pre>
      </div>
    </div>
  );
}