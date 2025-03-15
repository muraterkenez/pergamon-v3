import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Droplet, Heart, Syringe, Truck } from 'lucide-react';

interface Activity {
  id: string;
  type: 'milk' | 'health' | 'vaccination' | 'delivery';
  title: string;
  description: string;
  time: string;
  status?: string;
  date: string;
}

interface MonthlyCalendarProps {
  selectedDate: Date;
  activities: Activity[];
}

export default function MonthlyCalendar({ selectedDate, activities }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'milk':
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case 'health':
        return <Heart className="h-4 w-4 text-yellow-500" />;
      case 'vaccination':
        return <Syringe className="h-4 w-4 text-green-500" />;
      case 'delivery':
        return <Truck className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getDayActivities = (date: Date) => {
    return activities.filter(activity => 
      format(new Date(activity.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="grid grid-cols-7 gap-px">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((day, dayIdx) => {
          const dayActivities = getDayActivities(day);
          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] p-2 border ${
                !isSameMonth(day, selectedDate)
                  ? 'bg-gray-50'
                  : isToday(day)
                  ? 'bg-blue-50'
                  : 'bg-white'
              }`}
            >
              <p className={`text-sm ${
                isToday(day)
                  ? 'font-bold text-blue-600'
                  : !isSameMonth(day, selectedDate)
                  ? 'text-gray-400'
                  : 'text-gray-700'
              }`}>
                {format(day, 'd')}
              </p>
              <div className="mt-1 space-y-1">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-1 text-xs"
                  >
                    {getActivityIcon(activity.type)}
                    <span className="truncate">{activity.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}