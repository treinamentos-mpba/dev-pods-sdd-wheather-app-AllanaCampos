import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('usa Hoje para o índice zero', () => {
    expect(formatDayLabel('2026-10-29', 0)).toBe('Hoje');
  });

  it('usa Amanhã para o índice um', () => {
    expect(formatDayLabel('2026-10-30', 1)).toBe('Amanhã');
  });

  it('formata o dia da semana para os demais índices', () => {
    expect(formatDayLabel('2026-10-31', 2)).toBe('sábado');
  });

  it('retorna uma indicação neutra para data inválida', () => {
    expect(formatDayLabel('2026-02-30', 2)).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it('formata dia e mês abreviado em pt-BR', () => {
    expect(getShortDate('2026-10-29')).toBe('29 de out.');
  });

  it('retorna uma indicação neutra para data inválida', () => {
    expect(getShortDate('data-invalida')).toBe('Data indisponível');
  });
});
