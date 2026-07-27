export interface LogHistoryDayRow {
  date: string;
  calories: number;
  protein: number;
  meal_count?: number;
}

export function downloadLogHistoryCsv(days: LogHistoryDayRow[]): void {
  if (!days.length) return;
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const lines = [
    'date,meals,calories,protein',
    ...sorted.map((d) => {
      const meals = d.meal_count ?? '';
      return `${d.date},${meals},${Math.round(d.calories)},${d.protein.toFixed(1)}`;
    }),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habits-food-history-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
