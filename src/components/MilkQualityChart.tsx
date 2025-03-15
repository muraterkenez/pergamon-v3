import React from 'react';
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
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MilkQualityData {
  date: string;
  fat: number;
  protein: number;
  scc: number;
}

interface MilkQualityChartProps {
  data: MilkQualityData[];
  height?: number;
}

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'd MMM', { locale: tr });
};

const formatValue = (value: number, metric: string) => {
  switch (metric) {
    case 'fat':
    case 'protein':
      return `${value.toFixed(1)}%`;
    case 'scc':
      return `${value} x1000/ml`;
    default:
      return value;
  }
};

const getMetricColor = (metric: string) => {
  switch (metric) {
    case 'fat':
      return '#3b82f6'; // blue
    case 'protein':
      return '#10b981'; // green
    case 'scc':
      return '#f59e0b'; // yellow
    default:
      return '#6b7280'; // gray
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 border rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900 mb-2">
        {format(new Date(label), 'd MMMM yyyy', { locale: tr })}
      </p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600">{item.name}:</span>
          <span className="font-medium text-gray-900">
            {formatValue(item.value, item.dataKey)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MilkQualityChart({ data, height = 300 }: MilkQualityChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="fat"
            name="Yağ"
            stroke={getMetricColor('fat')}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="protein"
            name="Protein"
            stroke={getMetricColor('protein')}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="scc"
            name="Somatik Hücre"
            stroke={getMetricColor('scc')}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}