import type { Unit } from '../types/weather';

export function convertTemperature(
  temperatureC: number | null | undefined,
  unit: Unit,
): number | null {
  if (typeof temperatureC !== 'number' || !Number.isFinite(temperatureC)) return null;

  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  return Number.isFinite(temperature) ? temperature : null;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(temperatureC: number | null | undefined, unit: Unit): string {
  const temperature = convertTemperature(temperatureC, unit);
  if (temperature === null) return 'Dados indisponíveis';

  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(temperature);

  return `${formattedTemperature} ${unitLabel(unit)}`;
}
