import { convertTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return 'Dados indisponíveis';
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const temperature = convertTemperature(current.temperatureC, unit);
  const condition = getWeatherCondition(current.weatherCode);
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';
  const region = city.admin1 && city.admin1 !== city.name ? city.admin1 : undefined;
  const locationContext = [region, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-labelledby="current-weather-title"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="current-weather-title" className="text-xl font-semibold text-white">
            {city.name}
          </h2>
          {locationContext && <p className="mt-1 text-sm text-white/60">{locationContext}</p>}
          <p className="mt-5 text-lg text-white/80">{condition.description}</p>
        </div>

        <div className="flex items-center gap-5">
          <span aria-hidden="true" className="text-6xl leading-none sm:text-7xl">
            {condition.icon}
          </span>
          <p className="flex items-start text-6xl font-semibold leading-none text-white sm:text-7xl">
            {temperature === null ? (
              <span className="text-xl text-white/70">Dados indisponíveis</span>
            ) : (
              <>
                <span>{temperature.toFixed(1)}</span>
                <span className="ml-1 mt-1 text-xl text-white/70 sm:text-2xl">{unitSymbol}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-white/60">Umidade</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current.humidityPercent, '%')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Vento</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current.windSpeedKmh, 'km/h')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Precipitação</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current.precipitationMm, 'mm')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Pressão</dt>
          <dd className="mt-1 font-medium text-white">
            {formatMetric(current.pressureHpa, 'hPa')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
