export type CsvHeader<T extends Record<string, unknown>> = keyof T & string;

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let text = typeof value === "object" ? JSON.stringify(value) : String(value);

  // Anti-injection de formule (CSV injection) : une cellule commençant par
  // = + - @ (ou tabulation / retour chariot) est interprétée comme une formule
  // par Excel / LibreOffice / Google Sheets. On la préfixe d'une apostrophe pour
  // la neutraliser en simple texte avant tout échappement de guillemets.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function rowsToCsv<T extends Record<string, unknown>>(headers: Array<CsvHeader<T>>, rows: T[]): string {
  const lines = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))];
  return `${lines.join("\n")}\n`;
}
