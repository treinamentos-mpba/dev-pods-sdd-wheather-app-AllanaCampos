export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-5 text-white/80 shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <span>Carregando...</span>
    </div>
  );
}