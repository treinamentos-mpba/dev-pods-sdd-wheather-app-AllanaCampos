import { type FormEvent, type Ref, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export default function SearchBar({ onSearch, disabled = false, inputRef }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (disabled) return;
    if (trimmedCity.length === 0) {
      setValidationMessage('Informe uma cidade.');
      return;
    }

    setValidationMessage(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Busca de cidades"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-white/80">
          Buscar cidade
        </label>
        <input
          ref={inputRef}
          id="city-search"
          name="city"
          type="search"
          autoComplete="off"
          aria-invalid={validationMessage !== null}
          aria-describedby={validationMessage ? 'city-search-error' : undefined}
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            if (validationMessage) setValidationMessage(null);
          }}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="w-full rounded-lg border border-white/25 bg-night-900/70 px-4 py-3 text-white placeholder:text-white/65 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {validationMessage && (
          <p id="city-search-error" role="alert" className="mt-2 text-sm text-red-200">
            {validationMessage}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-accent-600 px-5 py-3 font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
