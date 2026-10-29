import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (disabled || trimmedCity.length === 0) return;

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-white/80">
          Buscar cidade
        </label>
        <input
          id="city-search"
          name="city"
          type="search"
          autoComplete="off"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="w-full rounded-lg border border-white/10 bg-night-900/70 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-accent-500 px-5 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
