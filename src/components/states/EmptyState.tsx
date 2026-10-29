interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      className="rounded-lg border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </section>
  );
}
