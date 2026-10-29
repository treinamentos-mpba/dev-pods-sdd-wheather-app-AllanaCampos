import { useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weatherData';
import type { Unit, WeatherData } from './types/weather';

type WeatherScreenState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string }
  | { status: 'success'; data: WeatherData };

function normalizeCityName(city: string): string {
  return city.trim().toLocaleLowerCase('pt-BR');
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [screenState, setScreenState] = useState<WeatherScreenState>({ status: 'idle' });
  const lastQuery = useRef('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(city: string) {
    const query = city.trim();
    if (!query || screenState.status === 'loading') return;

    lastQuery.current = query;
    setScreenState({ status: 'loading', query });

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 300));

      if (normalizeCityName(query) === normalizeCityName(mockWeatherData.city.name)) {
        setScreenState({ status: 'success', data: mockWeatherData });
        return;
      }

      setScreenState({ status: 'empty', query });
    } catch {
      setScreenState({
        status: 'error',
        query,
        message: 'Não foi possível carregar os dados meteorológicos',
      });
    }
  }

  function handleRetry() {
    if (!lastQuery.current) return;
    searchInputRef.current?.focus();
    void handleSearch(lastQuery.current);
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-800/60 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center lg:px-8">
          <div className="flex w-fit items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg border border-accent-400/30 bg-accent-500/15 text-lg font-bold text-accent-400"
            >
              W
            </span>
            <span className="text-lg font-semibold tracking-wide text-white">Weather App</span>
          </div>

          <SearchBar onSearch={handleSearch} inputRef={searchInputRef} />

          <div className="flex justify-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        aria-busy={screenState.status === 'loading'}
        className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        {screenState.status === 'idle' && (
          <EmptyState
            title="Consulte o clima da sua cidade"
            hint="Busque São Paulo para visualizar a demonstração com dados locais."
          />
        )}

        {screenState.status === 'loading' && <LoadingState />}

        {screenState.status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não há dados de demonstração para “${screenState.query}”. Tente São Paulo.`}
          />
        )}

        {screenState.status === 'error' && (
          <ErrorState message={screenState.message} onRetry={handleRetry} />
        )}

        {screenState.status === 'success' && (
          <div className="space-y-8">
            <p role="status" aria-live="polite" className="sr-only">
              Dados meteorológicos de {screenState.data.city.name} carregados.
            </p>
            <CurrentWeather
              city={screenState.data.city}
              current={screenState.data.current}
              unit={unit}
            />
            <ForecastList forecast={screenState.data.forecast} unit={unit} />
          </div>
        )}
      </main>
    </div>
  );
}
