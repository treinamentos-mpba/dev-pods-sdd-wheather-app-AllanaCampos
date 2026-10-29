import type { OpenMeteoGeocodingResponse, OpenMeteoGeocodingResult } from '../types/openMeteo';
import type { City } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherServiceError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
  }
}

function mapGeocodingResult(result: OpenMeteoGeocodingResult): City {
  const { id, name, country, latitude, longitude } = result;

  if (
    id === undefined ||
    name === undefined ||
    country === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    throw new WeatherServiceError('Resposta incompleta da geocodificação.');
  }

  return {
    id,
    name,
    country,
    latitude,
    longitude,
    ...(result.admin1 === undefined ? {} : { admin1: result.admin1 }),
    ...(result.timezone === undefined ? {} : { timezone: result.timezone }),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades.', response.status);
  }

  const payload = (await response.json()) as OpenMeteoGeocodingResponse;
  return (payload.results ?? []).map(mapGeocodingResult);
}

function assertAlignedSeries(
  values: Array<number | null> | undefined,
  expectedLength: number,
  fieldName: string,
): void {
  if (values !== undefined && values.length !== expectedLength) {
    throw new WeatherServiceError(`Série ${fieldName} desalinhada na resposta meteorológica.`);
  }
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      'Não foi possível carregar os dados meteorológicos.',
      response.status,
    );
  }

  const payload = (await response.json()) as OpenMeteoForecastResponse;
  if (!payload?.current || !payload.daily) {
    throw new WeatherServiceError('Resposta incompleta: current ou daily ausente.');
  }

  const { current, daily } = payload;
  const dates = daily.time;
  if (dates?.length !== 5) {
    throw new WeatherServiceError('Resposta incompleta: esperadas cinco datas de previsão.');
  }

  assertAlignedSeries(daily.weather_code, dates.length, 'weather_code');
  assertAlignedSeries(daily.temperature_2m_min, dates.length, 'temperature_2m_min');
  assertAlignedSeries(daily.temperature_2m_max, dates.length, 'temperature_2m_max');
  assertAlignedSeries(
    daily.precipitation_probability_max,
    dates.length,
    'precipitation_probability_max',
  );

  const timezone = payload.timezone ?? city.timezone;
  if (!timezone) {
    throw new WeatherServiceError('Resposta incompleta: timezone ausente.');
  }

  return {
    city,
    timezone,
    current: {
      temperatureC: current.temperature_2m ?? null,
      weatherCode: current.weather_code ?? null,
      observedAt: current.time ?? null,
      humidityPercent: current.relative_humidity_2m ?? null,
      windSpeedKmh: current.wind_speed_10m ?? null,
      precipitationMm: current.precipitation ?? null,
      pressureHpa: current.surface_pressure ?? null,
    },
    forecast: dates.map((date, index) => ({
      date,
      weatherCode: daily.weather_code?.[index] ?? null,
      minimumC: daily.temperature_2m_min?.[index] ?? null,
      maximumC: daily.temperature_2m_max?.[index] ?? null,
      precipitationProbabilityPercent: daily.precipitation_probability_max?.[index] ?? null,
    })),
  };
}
