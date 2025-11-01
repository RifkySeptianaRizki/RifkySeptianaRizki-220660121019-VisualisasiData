const integerFormatter = new Intl.NumberFormat('id-ID');

export const fmtInt = (value: number): string => integerFormatter.format(Math.round(value));

export const fmtPct = (part: number, total: number, digits = 1): string => {
  if (!total || !Number.isFinite(part)) return '0%';
  const pct = (part / total) * 100;
  return `${pct.toFixed(digits)}%`;
};

export const avg = (values: Array<number | null | undefined>): number | null => {
  const filtered = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );
  if (!filtered.length) {
    return null;
  }
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
};
