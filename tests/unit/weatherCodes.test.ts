import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna a condição e o ícone de um código WMO conhecido', () => {
    expect(getWeatherCondition(0)).toEqual({
      description: 'Céu limpo',
      icon: '☀',
    });
  });

  it('retorna fallback neutro para um código desconhecido', () => {
    expect(getWeatherCondition(999)).toEqual({
      description: 'Dados indisponíveis',
      icon: '—',
    });
  });
});
