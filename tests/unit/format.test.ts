import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDayLabel, getShortDate } from '../../src/lib/format';

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

describe('formatDateTime', () => {
  it('formata o horário local da API em pt-BR', () => {
    const formattedDateTime = formatDateTime('2026-10-29T10:00');

    expect(formattedDateTime).toContain('29');
    expect(formattedDateTime).toContain('out.');
    expect(formattedDateTime).toContain('10:00');
  });

  it('retorna null para timestamp ausente ou inválido', () => {
    expect(formatDateTime(null)).toBeNull();
    expect(formatDateTime('data-invalida')).toBeNull();
  });
});
