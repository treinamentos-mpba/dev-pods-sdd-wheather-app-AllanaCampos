interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-red-300/20 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <p role="alert" className="text-sm text-white/80">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
