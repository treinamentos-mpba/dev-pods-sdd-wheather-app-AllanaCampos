import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const currentIndex = units.indexOf(event.currentTarget.value as Unit);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + units.length) % units.length;
    const nextUnit = units[nextIndex];

    buttonRefs.current[nextIndex]?.focus();
    onChange(nextUnit);
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        ref={(element) => {
          buttonRefs.current[0] = element;
        }}
        type="button"
        value="celsius"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        onKeyDown={handleKeyDown}
        className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${unit === 'celsius' ? 'bg-accent-700 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °C
      </button>
      <button
        ref={(element) => {
          buttonRefs.current[1] = element;
        }}
        type="button"
        value="fahrenheit"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={handleKeyDown}
        className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${unit === 'fahrenheit' ? 'bg-accent-700 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °F
      </button>
    </div>
  );
}
