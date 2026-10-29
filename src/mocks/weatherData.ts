import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 22.4,
    weatherCode: 1,
    observedAt: '2026-10-29T10:00',
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minimumC: 18.2,
      maximumC: 26.5,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      minimumC: 17.4,
      maximumC: 25.0,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      minimumC: 18.1,
      maximumC: 24.2,
    },
    {
      date: '2026-11-01',
      weatherCode: 0,
      minimumC: 17.0,
      maximumC: 27.1,
    },
    {
      date: '2026-11-02',
      weatherCode: 2,
      minimumC: 18.5,
      maximumC: 26.8,
    },
  ],
};
