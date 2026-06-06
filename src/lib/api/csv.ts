export type CsvHeader<T extends Record<string, unknown>> = keyof T & string;

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "object" ? JSON.stringify(value) : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function rowsToCsv<T extends Record<string, unknown>>(headers: Array<CsvHeader<T>>, rows: T[]): string {
  const lines = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))];
  return `${lines.join("\n")}\n`;
}
