export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export interface OpenMeteoGeocodingResult {
  id?: number;
  name?: string;
  admin1?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface OpenMeteoForecastResponse {
  timezone?: string;
  current?: OpenMeteoCurrentResponse;
  daily?: OpenMeteoDailyResponse;
}

export interface OpenMeteoCurrentResponse {
  time?: string;
  temperature_2m?: number | null;
  weather_code?: number | null;
}

export interface OpenMeteoDailyResponse {
  time?: string[];
  weather_code?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  temperature_2m_max?: Array<number | null>;
}
