import { expect, test } from '@playwright/test';

test('busca uma cidade, mostra a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    }),
  );

  await page.route('https://api.open-meteo.com/v1/forecast**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-29T10:00',
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 60,
          wind_speed_10m: 8,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByRole('region', { name: 'São Paulo' })).toContainText('32.0°F');
});
