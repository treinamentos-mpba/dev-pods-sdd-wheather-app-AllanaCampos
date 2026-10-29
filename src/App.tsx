import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const weather = useWeather();

  useEffect(() => {
    if (weather.status === 'success' || weather.status === 'empty' || weather.status === 'error') {
      resultsRef.current?.focus();
    }
  }, [weather.status]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-800/60 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center lg:px-8">
          <h1 className="flex w-fit items-center gap-3 text-lg font-semibold tracking-wide text-white">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg border border-accent-400/30 bg-accent-500/15 text-lg font-bold text-accent-400"
            >
              W
            </span>
            <span>Weather App</span>
          </h1>

          <SearchBar onSearch={weather.search} inputRef={searchInputRef} />

          <div className="flex justify-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {weather.status === 'loading' && <LoadingState />}

        <section
          ref={resultsRef}
          aria-label="Resultado da busca"
          aria-busy={weather.status === 'loading'}
          tabIndex={-1}
          className="space-y-6 outline-none"
        >
          {weather.status === 'idle' && (
            <EmptyState
              title="Consulte o clima da sua cidade"
              hint="Busque uma cidade para ver as condições atuais e a previsão para cinco dias."
            />
          )}

          {weather.status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint={`Não encontramos resultados para “${weather.query}”. Verifique o nome e tente novamente.`}
            />
          )}

          {weather.status === 'error' && (
            <ErrorState
              message={weather.error ?? 'Não foi possível carregar os dados.'}
              onRetry={() => {
                searchInputRef.current?.focus();
                void weather.retry();
              }}
            />
          )}

          {weather.status === 'success' && weather.data && (
            <div className="space-y-8">
              <p role="status" aria-live="polite" className="sr-only">
                Dados meteorológicos de {weather.data.city.name} carregados.
              </p>
              {weather.cities.length > 0 && (
                <section aria-labelledby="city-results-heading" className="space-y-3">
                  <h2 id="city-results-heading" className="text-sm font-medium text-white/80">
                    {weather.cities.length > 1 ? 'Escolha uma cidade' : 'Cidade encontrada'}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {weather.cities.map((city) => (
                      <li key={city.id}>
                        <button
                          type="button"
                          aria-pressed={weather.data?.city.id === city.id}
                          onClick={() => void weather.selectCity(city)}
                          className={`rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${weather.data?.city.id === city.id ? 'border-accent-400 bg-accent-700 text-white' : 'border-white/25 bg-white/5 text-white/80 hover:bg-white/10'}`}
                        >
                          {[city.name, city.admin1, city.country].filter(Boolean).join(', ')}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <CurrentWeather city={weather.data.city} current={weather.data.current} unit={unit} />
              <ForecastList forecast={weather.data.forecast} unit={unit} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
