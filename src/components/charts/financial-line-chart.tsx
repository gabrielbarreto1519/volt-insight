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
}

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
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value, entry.payload.format, entry.payload.unit)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function FinancialLineChart({ data, lines, height = 400 }: FinancialLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          tickFormatter={getMonthName}
          className="text-muted-foreground"
        />
        <YAxis 
          className="text-muted-foreground"
          tickFormatter={(value) => formatNumber(value, 0)}
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