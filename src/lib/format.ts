function parseDateOnly(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
}

export function formatDayLabel(date: string, index?: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const parsedDate = parseDateOnly(date);
  if (!parsedDate) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export function getShortDate(date: string): string {
  const parsedDate = parseDateOnly(date);
  if (!parsedDate) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsedDate);
}
