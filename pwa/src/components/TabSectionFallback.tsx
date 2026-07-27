export function TabSectionFallback() {
  return (
    <div className="section-loading section-loading--skeleton" role="status" aria-live="polite" aria-label="Loading section">
      <div className="section-loading__bar section-loading__bar--title" aria-hidden="true" />
      <div className="section-loading__bar section-loading__bar--sub" aria-hidden="true" />
      <div className="section-loading__card" aria-hidden="true" />
    </div>
  );
}
