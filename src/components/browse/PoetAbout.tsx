interface PoetAboutProps {
  name: string;
  description?: string;
}

export function PoetAbout({ name, description }: PoetAboutProps) {
  if (!description?.trim()) return null;

  return (
    <section className="surface-card mb-5 rounded-2xl border p-4">
      <h3 className="mb-2 text-lg font-bold">درباره {name}</h3>
      <p className="text-muted text-sm leading-7">{description}</p>
    </section>
  );
}
