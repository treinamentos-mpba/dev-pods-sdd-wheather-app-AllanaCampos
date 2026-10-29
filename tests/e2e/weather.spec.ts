import { expect, type Page, test } from '@playwright/test';

const geocodingResult = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const forecastResponse = {
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
};

async function mockForecast(page: Page): Promise<string[]> {
  const forecastRequests: string[] = [];

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests.push(route.request().url());
    await route.fulfill({ json: forecastResponse });
  });

  return forecastRequests;
}

async function mockSuccessfulGeocoding(page: Page): Promise<void> {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({ json: { results: [geocodingResult] } }),
  );
}

async function searchForSaoPaulo(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
}

test('busca cidade, mostra previsão e converte temperatura para Fahrenheit', async ({ page }) => {
  const forecastRequests = await mockForecast(page);
  await mockSuccessfulGeocoding(page);

  await searchForSaoPaulo(page);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  expect(forecastRequests).toHaveLength(1);

  const forecastUrl = new URL(forecastRequests[0]);
  expect(forecastUrl.searchParams.get('latitude')).toBe('-23.55');
  expect(forecastUrl.searchParams.get('longitude')).toBe('-46.63');

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByRole('region', { name: 'São Paulo' })).toContainText('32.0°F');
});

test('mostra estado vazio sem solicitar forecast', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test('apresenta erro de geocoding e permite tentar novamente', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequests += 1;
    if (geocodingRequests === 1) {
      await route.fulfill({ status: 503, body: 'Service unavailable' });
      return;
    }

    await route.fulfill({ json: { results: [geocodingResult] } });
  });
  await mockForecast(page);

  await searchForSaoPaulo(page);
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar cidades');

  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('region', { name: 'São Paulo' })).toBeVisible();
  expect(geocodingRequests).toBe(2);
});

test('não tem overflow horizontal em viewport de 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await mockForecast(page);
  await mockSuccessfulGeocoding(page);

  await searchForSaoPaulo(page);
  await expect(page.getByRole('region', { name: 'São Paulo' })).toBeVisible();

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});
