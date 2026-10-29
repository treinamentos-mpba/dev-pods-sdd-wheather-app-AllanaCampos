export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number; // Identificador da localidade no geocoding.
  name: string; // Nome da cidade.
  admin1?: string; // Região ou estado para distinguir homônimos.
  country: string; // País da localidade.
  latitude: number; // Latitude usada na consulta meteorológica.
  longitude: number; // Longitude usada na consulta meteorológica.
  timezone?: string; // Fuso IANA, quando disponível.
}

export interface CurrentWeather {
  temperatureC: number | null; // Temperatura atual em Celsius.
  weatherCode: number | null; // Código meteorológico WMO atual.
  observedAt: string | null; // Horário de referência retornado pela API.
  humidityPercent?: number | null; // Umidade relativa em porcentagem.
  windSpeedKmh?: number | null; // Velocidade do vento em quilômetros por hora.
  precipitationMm?: number | null; // Precipitação em milímetros.
  pressureHpa?: number | null; // Pressão atmosférica em hectopascais.
}

export interface ForecastDay {
  date: string; // Data local no formato YYYY-MM-DD.
  weatherCode: number | null; // Código meteorológico WMO do dia.
  minimumC: number | null; // Temperatura mínima em Celsius.
  maximumC: number | null; // Temperatura máxima em Celsius.
}

export interface WeatherData {
  city: City; // Localidade selecionada.
  timezone: string; // Fuso usado para as datas e horários do relatório.
  current: CurrentWeather; // Condições meteorológicas atuais.
  forecast: ForecastDay[]; // Previsão diária em ordem cronológica.
}
