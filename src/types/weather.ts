export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  observedAt: string | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minimumC: number | null;
  maximumC: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
