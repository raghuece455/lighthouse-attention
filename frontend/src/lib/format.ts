const integerFormatter = new Intl.NumberFormat("en-US");

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatInteger(value: number): string {
  return integerFormatter.format(Math.round(value));
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatMemory(value: number): string {
  if (value < 1) {
    return `${(value * 1024).toFixed(1)} KB`;
  }
  return `${value.toFixed(2)} MB`;
}

export function formatScore(value: number): string {
  return value.toFixed(3);
}
