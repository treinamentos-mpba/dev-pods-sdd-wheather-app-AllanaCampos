import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 21.3,
    weatherCode: 2,
    observedAt: '2026-10-29T10:00',
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minimumC: 17.4,
      maximumC: 25.8,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      minimumC: 16.9,
      maximumC: 24.2,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      minimumC: 18.1,
      maximumC: 23.6,
    },
    {
      date: '2026-11-01',
      weatherCode: 1,
      minimumC: 17.2,
      maximumC: 26.1,
    },
    {
      date: '2026-11-02',
      weatherCode: 0,
      minimumC: 18.5,
      maximumC: 27.3,
    },
  ],
};
