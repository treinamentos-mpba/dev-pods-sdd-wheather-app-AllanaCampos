import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('searchCities', () => {
  it('retorna lista vazia para input vazio sem chamar fetch', async () => {
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia results para City e codifica o nome na URL', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );

    await expect(searchCities(" São Paulo d'Aliança ")).resolves.toEqual([
      {
        id: 1,
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
    ]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get('name')).toBe("São Paulo d'Aliança");
  });

  it('retorna lista vazia quando results está ausente', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ generationtime_ms: 0.1 }));

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError quando a resposta não é ok', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: true }, 503));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });

  it('converte falha de rede offline em erro amigável de geocoding', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      service: 'geocoding',
      kind: 'network',
      message: 'Não foi possível buscar cidades. Verifique sua conexão e tente novamente.',
    });
  });

  it('converte timeout de geocoding em erro de timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const request = searchCities('São Paulo');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      service: 'geocoding',
      kind: 'timeout',
      message: 'A busca demorou mais que o esperado. Tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  it('mapeia current e cinco itens de daily, convertendo precipitação null para zero', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-29T10:00',
          temperature_2m: 22.4,
          weather_code: 1,
          relative_humidity_2m: 61,
          wind_speed_10m: 10.2,
          precipitation: null,
          surface_pressure: 1014.3,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [1, 2, 3, 61, 0],
          temperature_2m_min: [18, 19, 17, 16, 18],
          temperature_2m_max: [27, 28, 24, 22, 26],
          precipitation_probability_max: [0, 10, 25, 80, 5],
        },
      }),
    );

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.current).toEqual({
      temperatureC: 22.4,
      weatherCode: 1,
      observedAt: '2026-10-29T10:00',
      humidityPercent: 61,
      windSpeedKmh: 10.2,
      precipitationMm: 0,
      pressureHpa: 1014.3,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: '2026-10-29',
      weatherCode: 1,
      minimumC: 18,
      maximumC: 27,
      precipitationProbabilityPercent: 0,
    });
    expect(weather.forecast[3]?.precipitationProbabilityPercent).toBe(80);
  });

  it.each([
    ['current', { daily: { time: ['2026-10-29'] } }],
    ['daily', { current: { temperature_2m: 22 } }],
  ])('lança WeatherServiceError quando %s está ausente', async (_missing, payload) => {
    fetchMock.mockResolvedValue(jsonResponse(payload));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converte falha de rede offline em erro amigável de forecast', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      service: 'weather',
      kind: 'network',
      message:
        'Não foi possível carregar os dados meteorológicos. Verifique sua conexão e tente novamente.',
    });
  });
});
