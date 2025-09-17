import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatNumber, getMonthName } from '@/lib/data-processing';

interface ChartData {
  month: number;
  [key: string]: any;
}

interface LineConfig {
  dataKey: string;
  stroke: string;
  strokeDasharray?: string;
  name: string;
  unit?: string;
  format?: 'currency' | 'number' | 'percent';
}

interface FinancialLineChartProps {
  data: ChartData[];
  lines: LineConfig[];
  height?: number;
  yAxisLabel?: string;
  yAxisFormat?: 'currency' | 'number' | 'percent';
}

const formatYAxisValue = (value: number, format?: 'currency' | 'number' | 'percent'): string => {
  let formattedValue = '';
  
  switch (format) {
    case 'currency':
      // For currency values, use shorter format for Y axis
      if (Math.abs(value) >= 1000000) {
        formattedValue = formatNumber(value / 1000000, 1) + 'M';
      } else if (Math.abs(value) >= 1000) {
        formattedValue = formatNumber(value / 1000, 1) + 'K';
      } else {
        formattedValue = formatNumber(value, 0);
      }
      break;
    case 'percent':
      formattedValue = formatNumber(value * 100, 1) + '%';
      break;
    case 'number':
    default:
      formattedValue = formatNumber(value, 0);
      break;
  }
  
  return formattedValue;
};

const formatValue = (value: number, format?: string, unit?: string): string => {
  let formattedValue = '';
  
  switch (format) {
    case 'currency':
      formattedValue = formatCurrency(value);
      break;
    case 'percent':
      formattedValue = formatNumber(value * 100, 1) + '%';
      break;
    case 'number':
    default:
      formattedValue = formatNumber(value, 2);
      break;
  }
  
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium mb-2">
          {getMonthName(label)}
        </p>
        {payload.map((entry: any, index: number) => {
          const lineConfig = entry.payload.__lineConfigs?.[entry.dataKey];
          let formattedValue = '';
          
          switch (lineConfig?.format) {
            case 'currency':
              formattedValue = formatCurrency(entry.value);
              break;
            case 'percent':
              formattedValue = formatNumber(entry.value * 100, 1) + '%';
              break;
            case 'number':
            default:
              formattedValue = formatNumber(entry.value, 2);
              break;
          }
          
          const displayValue = lineConfig?.unit ? `${formattedValue} ${lineConfig.unit}` : formattedValue;
          
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {displayValue}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function FinancialLineChart({ data, lines, height = 400, yAxisLabel, yAxisFormat }: FinancialLineChartProps) {
  // Add line configurations to data for tooltip access
  const enrichedData = data.map(item => ({
    ...item,
    __lineConfigs: lines.reduce((acc, line) => {
      acc[line.dataKey] = { unit: line.unit, format: line.format };
      return acc;
    }, {} as Record<string, { unit?: string; format?: string }>)
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={enrichedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          tickFormatter={getMonthName}
          className="text-muted-foreground"
        />
        <YAxis 
          className="text-muted-foreground"
          tickFormatter={(value) => formatYAxisValue(value, yAxisFormat)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            strokeWidth={2}
            strokeDasharray={line.strokeDasharray}
            name={line.name}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}