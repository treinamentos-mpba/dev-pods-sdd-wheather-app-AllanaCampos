import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number | null, unit: Unit): number | null {
  if (temperatureC === null) return null;
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}
