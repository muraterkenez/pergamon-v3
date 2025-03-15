import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'windy';
  humidity: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 23,
    condition: 'cloudy',
    humidity: 65
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'rain':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-5 w-5 text-blue-300" />;
      case 'storm':
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      case 'windy':
        return <Wind className="h-5 w-5 text-gray-500" />;
      default:
        return <Cloud className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
      {getWeatherIcon(weather.condition)}
      <span className="text-sm font-medium">{weather.temperature}°C</span>
      <span className="text-xs text-gray-300">%{weather.humidity}</span>
    </div>
  );
}