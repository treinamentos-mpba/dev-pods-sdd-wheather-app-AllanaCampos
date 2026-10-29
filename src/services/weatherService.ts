import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult,
} from '../types/openMeteo';
import type { City, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type WeatherServiceName = 'geocoding' | 'weather';
export type WeatherServiceErrorKind = 'network' | 'timeout' | 'api' | 'invalid-response';

const errorMessages: Record<WeatherServiceName, Record<WeatherServiceErrorKind, string>> = {
  geocoding: {
    network: 'Não foi possível buscar cidades. Verifique sua conexão e tente novamente.',
    timeout: 'A busca demorou mais que o esperado. Tente novamente.',
    api: 'Não foi possível buscar cidades. Tente novamente.',
    'invalid-response': 'Não foi possível interpretar os resultados da busca. Tente novamente.',
  },
  weather: {
    network:
      'Não foi possível carregar os dados meteorológicos. Verifique sua conexão e tente novamente.',
    timeout:
      'O carregamento dos dados meteorológicos demorou mais que o esperado. Tente novamente.',
    api: 'Não foi possível carregar os dados meteorológicos. Tente novamente.',
    'invalid-response': 'Os dados meteorológicos recebidos são inválidos. Tente novamente.',
  },
};

export class WeatherServiceError extends Error {
  readonly status?: number;
  readonly service: WeatherServiceName;
  readonly kind: WeatherServiceErrorKind;

  constructor(
    message: string,
    options: { service: WeatherServiceName; kind: WeatherServiceErrorKind; status?: number },
  ) {
    super(message);
    this.name = 'WeatherServiceError';
    this.service = options.service;
    this.kind = options.kind;
    this.status = options.status;
  }
}

function createWeatherServiceError(
  service: WeatherServiceName,
  kind: WeatherServiceErrorKind,
  status?: number,
): WeatherServiceError {
  return new WeatherServiceError(errorMessages[service][kind], { service, kind, status });
}

async function fetchWithTimeout(url: string, service: WeatherServiceName): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    const isAbortError =
      controller.signal.aborted ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError');

    if (isAbortError) {
      throw createWeatherServiceError(service, 'timeout');
    }

    throw createWeatherServiceError(service, 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJson<T>(response: Response, service: WeatherServiceName): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw createWeatherServiceError(service, 'invalid-response');
  }
}

function finiteNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapGeocodingResult(result: OpenMeteoGeocodingResult | null): City {
  if (!result) {
    throw createWeatherServiceError('geocoding', 'invalid-response');
  }

  const { id, name, country, latitude, longitude } = result;

  if (
    typeof id !== 'number' ||
    !Number.isFinite(id) ||
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof country !== 'string' ||
    country.trim().length === 0 ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude)
  ) {
    throw createWeatherServiceError('geocoding', 'invalid-response');
  }

  return {
    id,
    name,
    country,
    latitude,
    longitude,
    ...(typeof result.admin1 === 'string' && result.admin1.length > 0
      ? { admin1: result.admin1 }
      : {}),
    ...(typeof result.timezone === 'string' && result.timezone.length > 0
      ? { timezone: result.timezone }
      : {}),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url, 'geocoding');

  if (!response.ok) {
    throw createWeatherServiceError('geocoding', 'api', response.status);
  }

  const payload = await readJson<OpenMeteoGeocodingResponse>(response, 'geocoding');
  const results = payload?.results;
  if (results == null) return [];
  if (!Array.isArray(results)) {
    throw createWeatherServiceError('geocoding', 'invalid-response');
  }

  return results.map(mapGeocodingResult);
}

function assertAlignedSeries(
  values: Array<number | null> | null | undefined,
  expectedLength: number,
): void {
  if (values != null && values.length !== expectedLength) {
    throw createWeatherServiceError('weather', 'invalid-response');
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
  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`, 'weather');

  if (!response.ok) {
    throw createWeatherServiceError('weather', 'api', response.status);
  }

  const payload = await readJson<OpenMeteoForecastResponse>(response, 'weather');
  if (!payload?.current || !payload.daily) {
    throw createWeatherServiceError('weather', 'invalid-response');
  }

  const { current, daily } = payload;
  const dates = daily.time;
  if (
    !Array.isArray(dates) ||
    dates.length !== 5 ||
    dates.some((date) => typeof date !== 'string' || date.trim().length === 0)
  ) {
    throw createWeatherServiceError('weather', 'invalid-response');
  }
  const forecastDates = dates as string[];

  assertAlignedSeries(daily.weather_code, forecastDates.length);
  assertAlignedSeries(daily.temperature_2m_min, forecastDates.length);
  assertAlignedSeries(daily.temperature_2m_max, forecastDates.length);
  assertAlignedSeries(daily.precipitation_probability_max, forecastDates.length);

  const timezone = payload.timezone?.trim() || city.timezone?.trim();
  if (!timezone) {
    throw createWeatherServiceError('weather', 'invalid-response');
  }

  return {
    city,
    timezone,
    current: {
      temperatureC: finiteNumber(current.temperature_2m),
      weatherCode: finiteNumber(current.weather_code),
      observedAt: current.time ?? null,
      humidityPercent: finiteNumber(current.relative_humidity_2m),
      windSpeedKmh: finiteNumber(current.wind_speed_10m),
      precipitationMm: finiteNumber(current.precipitation) ?? 0,
      pressureHpa: finiteNumber(current.surface_pressure),
    },
    forecast: forecastDates.map((date, index) => ({
      date,
      weatherCode: finiteNumber(daily.weather_code?.[index]),
      minimumC: finiteNumber(daily.temperature_2m_min?.[index]),
      maximumC: finiteNumber(daily.temperature_2m_max?.[index]),
      precipitationProbabilityPercent: finiteNumber(daily.precipitation_probability_max?.[index]),
    })),
  };
}
