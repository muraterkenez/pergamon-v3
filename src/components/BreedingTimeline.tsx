import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { BreedingCycle } from '../types/breeding';

interface BreedingTimelineProps {
  cycle: BreedingCycle;
}

const PREGNANCY_DURATION = 280; // Ortalama gebelik süresi (gün)
const DRY_PERIOD_START = 60; // Doğumdan önce kuruya çıkarma süresi (gün)

export default function BreedingTimeline({ cycle }: BreedingTimelineProps) {
  if (!cycle) return null;

  const today = new Date();
  const inseminationDate = new Date(cycle.start_date);
  const expectedCalvingDate = cycle.expected_calving_date ? new Date(cycle.expected_calving_date) : null;
  const dryPeriodStartDate = expectedCalvingDate ? new Date(expectedCalvingDate.getTime() - (DRY_PERIOD_START * 24 * 60 * 60 * 1000)) : null;

  const getProgressPercentage = () => {
    if (!expectedCalvingDate) return 0;
    const totalDays = PREGNANCY_DURATION;
    const daysCompleted = differenceInDays(today, inseminationDate);
    return Math.min(Math.max((daysCompleted / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = () => {
    if (!expectedCalvingDate) return null;
    return differenceInDays(expectedCalvingDate, today);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inseminated':
        return 'bg-yellow-500';
      case 'pregnant':
        return 'bg-green-500';
      case 'calved':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Üreme Durumu</h2>
        <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(cycle.status)}`}>
          {cycle.status === 'inseminated' && 'Tohumlanmış'}
          {cycle.status === 'pregnant' && 'Gebe'}
          {cycle.status === 'calved' && 'Doğum Yaptı'}
          {cycle.status === 'failed' && 'Başarısız'}
        </div>
      </div>

      {/* Progress Bar */}
      {cycle.status === 'pregnant' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Gebelik İlerlemesi</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          {getDaysRemaining() !== null && (
            <p className="text-sm text-gray-600 mt-2">
              Tahmini doğuma {getDaysRemaining()} gün kaldı
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {/* Tohumlama */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Tohumlama</h3>
            <p className="text-sm text-gray-500">
              {format(inseminationDate, 'd MMMM yyyy', { locale: tr })}
            </p>
            {cycle.insemination_count > 1 && (
              <p className="text-xs text-yellow-600 mt-1">
                {cycle.insemination_count}. deneme
              </p>
            )}
          </div>
        </div>

        {/* Gebelik Onayı */}
        {cycle.pregnancy_confirmed_date && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Gebelik Onaylandı</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(cycle.pregnancy_confirmed_date), 'd MMMM yyyy', { locale: tr })}
              </p>
            </div>
          </div>
        )}

        {/* Kuruya Çıkarma */}
        {dryPeriodStartDate && cycle.status === 'pregnant' && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Kuruya Çıkarma</h3>
              <p className="text-sm text-gray-500">
                {format(dryPeriodStartDate, 'd MMMM yyyy', { locale: tr })}
              </p>
              {differenceInDays(dryPeriodStartDate, today) > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  {differenceInDays(dryPeriodStartDate, today)} gün kaldı
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tahmini Doğum */}
        {expectedCalvingDate && cycle.status === 'pregnant' && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Tahmini Doğum</h3>
              <p className="text-sm text-gray-500">
                {format(expectedCalvingDate, 'd MMMM yyyy', { locale: tr })}
              </p>
              {getDaysRemaining() !== null && getDaysRemaining() > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {getDaysRemaining()} gün kaldı
                </p>
              )}
            </div>
          </div>
        )}

        {/* Gerçekleşen Doğum */}
        {cycle.actual_calving_date && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Doğum Gerçekleşti</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(cycle.actual_calving_date), 'd MMMM yyyy', { locale: tr })}
              </p>
              {cycle.calf_id && (
                <p className="text-xs text-green-600 mt-1">
                  Buzağı ID: {cycle.calf_id}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}