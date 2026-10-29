import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type RetryOperation = { type: 'search'; name: string } | { type: 'weather'; city: City };

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof WeatherServiceError ? error.message : fallback;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<RetryOperation | null>(null);

  async function loadWeather(city: City, currentRequestId: number): Promise<void> {
    try {
      const weather = await getWeather(city);
      if (currentRequestId !== requestId.current) return;

      setData(weather);
      setError(null);
      setStatus('success');
    } catch (cause) {
      if (currentRequestId !== requestId.current) return;

      setData(null);
      setError(errorMessage(cause, 'Não foi possível carregar os dados meteorológicos.'));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    const currentRequestId = ++requestId.current;

    setQuery(trimmedName);
    setData(null);
    setCities([]);
    setError(null);

    if (!trimmedName) {
      lastOperation.current = null;
      setError('Informe uma cidade.');
      setStatus('error');
      return;
    }

    lastOperation.current = { type: 'search', name: trimmedName };
    setStatus('loading');

    try {
      const results = await searchCities(trimmedName);
      if (currentRequestId !== requestId.current) return;

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      const firstCity = results[0];
      lastOperation.current = { type: 'weather', city: firstCity };
      await loadWeather(firstCity, currentRequestId);
    } catch (cause) {
      if (currentRequestId !== requestId.current) return;

      setError(errorMessage(cause, 'Não foi possível buscar cidades.'));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = { type: 'weather', city };
    setData(null);
    setError(null);
    setStatus('loading');
    await loadWeather(city, currentRequestId);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.type === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}
