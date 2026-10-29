import { formatDayLabel } from '../lib/format';
import { convertTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatTemperature(valueC: number | null, unit: Unit): string {
  const value = convertTemperature(valueC, unit);
  if (value === null) return 'Dados indisponíveis';

  const unitSymbol = unit === 'celsius' ? '°C' : '°F';
  return `${value.toFixed(1)} ${unitSymbol}`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const precipitation = day.precipitationProbabilityPercent;

  return (
    <article className="flex min-w-0 flex-col items-center rounded-lg border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold capitalize text-white">{formatDayLabel(day.date)}</h3>
      <span aria-hidden="true" className="my-4 text-4xl leading-none">
        {condition.icon}
      </span>
      <p className="min-h-10 text-sm text-white/70">{condition.description}</p>
      <p className="mt-3 text-sm font-medium text-white">
        <span className="text-white/60">Máx. </span>
        {formatTemperature(day.maximumC, unit)}
      </p>
      <p className="mt-1 text-sm text-white/70">
        <span className="text-white/50">Mín. </span>
        {formatTemperature(day.minimumC, unit)}
      </p>
      <p className="mt-4 text-xs text-white/60">
        Chuva:{' '}
        {precipitation === null || precipitation === undefined
          ? 'Dados indisponíveis'
          : `${precipitation}%`}
      </p>
    </article>
  );
}
