import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface QualityParameter {
  name: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  optimal?: number;
}

interface MilkQualityIndicatorProps {
  parameters: QualityParameter[];
}

const getStatusColor = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) return 'text-red-600';
  if (max !== undefined && value > max) return 'text-red-600';
  return 'text-green-600';
};

const getStatusIcon = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) return <XCircle className="h-5 w-5 text-red-600" />;
  if (max !== undefined && value > max) return <AlertTriangle className="h-5 w-5 text-red-600" />;
  return <CheckCircle className="h-5 w-5 text-green-600" />;
};

export default function MilkQualityIndicator({ parameters }: MilkQualityIndicatorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {parameters.map((param) => (
        <div
          key={param.name}
          className="flex flex-col justify-between p-3 bg-white rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">{param.name}</p>
            </div>
            <div className="ml-2 flex-shrink-0">
              {getStatusIcon(param.value, param.min, param.max)}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold ${getStatusColor(param.value, param.min, param.max)}`}>
              {param.value}
            </span>
            <span className="text-sm text-gray-500">{param.unit}</span>
          </div>
          {(param.min !== undefined || param.max !== undefined) && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {param.min !== undefined && param.max !== undefined
                ? `Normal: ${param.min}-${param.max}`
                : param.min !== undefined
                ? `Min: ${param.min}`
                : `Max: ${param.max}`}
            </p>
          )}
          {param.optimal !== undefined && (
            <p className="text-xs text-gray-500 truncate">Optimal: {param.optimal}</p>
          )}
        </div>
      ))}
    </div>
  );
}