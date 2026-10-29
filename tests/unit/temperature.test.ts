import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %i °C para %i °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém o valor em Celsius quando a unidade é celsius', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
  });

  it('mantém null como temperatura indisponível', () => {
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });
});

describe('formatTemperature', () => {
  it('arredonda para uma casa decimal e inclui o símbolo Celsius', () => {
    expect(formatTemperature(20.24, 'celsius')).toBe('20,2 °C');
    expect(formatTemperature(20.26, 'celsius')).toBe('20,3 °C');
  });

  it('converte, arredonda e inclui o símbolo Fahrenheit', () => {
    expect(formatTemperature(20.3, 'fahrenheit')).toBe('68,5 °F');
  });

  it('indica quando a temperatura está indisponível', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Dados indisponíveis');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo correto para cada unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
