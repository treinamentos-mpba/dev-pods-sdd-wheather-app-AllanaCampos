import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, Unit } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

function WeatherUnitHarness() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={city}
        unit={unit}
        current={{ temperatureC: 0, weatherCode: 0, observedAt: null }}
      />
    </>
  );
}

describe('UnitToggle com CurrentWeather', () => {
  it('atualiza 0 °C para 32 °F ao selecionar Fahrenheit', async () => {
    const user = userEvent.setup();

    render(<WeatherUnitHarness />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByRole('button', { name: 'Fahrenheit' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByRole('region', { name: 'São Paulo' }).textContent).toContain('32.0°F');
  });

  it('mostra fallback para métricas ausentes ou não finitas', () => {
    render(
      <CurrentWeather
        city={city}
        unit="celsius"
        current={{
          temperatureC: Number.NaN,
          weatherCode: null,
          observedAt: null,
          humidityPercent: Number.NaN,
          windSpeedKmh: undefined,
          precipitationMm: null,
          pressureHpa: Number.POSITIVE_INFINITY,
        }}
      />,
    );

    const weatherRegion = screen.getByRole('region', { name: 'São Paulo' });
    expect(weatherRegion.textContent).not.toContain('NaN');
    expect(weatherRegion.textContent).not.toContain('Infinity');
    expect(weatherRegion.textContent).not.toContain('undefined');
    expect(weatherRegion.textContent).toContain('Dados indisponíveis');
  });
});
