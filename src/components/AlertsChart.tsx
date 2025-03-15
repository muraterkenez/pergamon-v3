import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AlertsChartProps {
  data: {
    date: string;
    warning: number;
    danger: number;
    info: number;
  }[];
  height?: number;
}

const COLORS = {
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: tr });
  } catch (err) {
    return dateStr;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !label) return null;

  try {
    const date = parseISO(label);
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {format(date, 'd MMMM yyyy', { locale: tr })}
        </p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.name}:</span>
            <span className="font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    );
  } catch (err) {
    return null;
  }
};

export default function AlertsChart({ data, height = 300 }: AlertsChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="warning" name="Uyarı" stackId="a">
            {data.map((entry, index) => (
              <Cell key={`warning-${index}`} fill={COLORS.warning} />
            ))}
          </Bar>
          <Bar dataKey="danger" name="Tehlike" stackId="a">
            {data.map((entry, index) => (
              <Cell key={`danger-${index}`} fill={COLORS.danger} />
            ))}
          </Bar>
          <Bar dataKey="info" name="Bilgi" stackId="a">
            {data.map((entry, index) => (
              <Cell key={`info-${index}`} fill={COLORS.info} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}