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
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
}

export interface OpenMeteoDailyResponse {
  time?: string[];
  weather_code?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  temperature_2m_max?: Array<number | null>;
  precipitation_probability_max?: Array<number | null>;
}
