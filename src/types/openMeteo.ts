export interface OpenMeteoGeocodingResponse {
  results?: Array<OpenMeteoGeocodingResult | null> | null;
}

export interface OpenMeteoGeocodingResult {
  id?: number | null;
  name?: string | null;
  admin1?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

export interface OpenMeteoForecastResponse {
  timezone?: string | null;
  current?: OpenMeteoCurrentResponse | null;
  daily?: OpenMeteoDailyResponse | null;
}

export interface OpenMeteoCurrentResponse {
  time?: string | null;
  temperature_2m?: number | null;
  weather_code?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
}

export interface OpenMeteoDailyResponse {
  time?: Array<string | null> | null;
  weather_code?: Array<number | null> | null;
  temperature_2m_min?: Array<number | null> | null;
  temperature_2m_max?: Array<number | null> | null;
  precipitation_probability_max?: Array<number | null> | null;
}
