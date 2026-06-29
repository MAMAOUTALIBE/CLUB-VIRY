import { NextRequest } from "next/server";

import { conductBlocks, regulationItems } from "@/lib/club-pages-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pageWidth = 595.28;
const pageHeight = 841.89;
const marginX = 48;
const marginBottom = 48;
const contentWidth = pageWidth - marginX * 2;
const fileName = "code-de-bonne-conduite-es-viry.pdf";

type FontName = "regular" | "bold";
type Rgb = [number, number, number];

type PdfPage = {
  commands: string[];
};

function normalizePdfText(text: string) {
  return text
    .normalize("NFC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

function escapePdfString(text: string) {
  return normalizePdfText(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function colorCommand([red, green, blue]: Rgb) {
  return `${red.toFixed(3)} ${green.toFixed(3)} ${blue.toFixed(3)} rg\n`;
}

function textCommand(text: string, x: number, y: number, size: number, font: FontName, color: Rgb) {
  const pdfFont = font === "bold" ? "F2" : "F1";
  return `${colorCommand(color)}BT /${pdfFont} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfString(text)}) Tj ET\n`;
}

function rectCommand(x: number, y: number, width: number, height: number, color: Rgb) {
  return `${colorCommand(color)}${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f\n`;
}

function wrapText(text: string, maxWidth: number, size: number) {
  const maxChars = Math.max(22, Math.floor(maxWidth / (size * 0.52)));
  const words = normalizePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function buildContentPages() {
  const pages: PdfPage[] = [];
  let current: PdfPage;
  let y = pageHeight - 116;

  function addPage(withCoverHeader = false) {
    current = { commands: [] };
    pages.push(current);

    if (withCoverHeader) {
      current.commands.push(rectCommand(0, pageHeight - 96, pageWidth, 96, [0, 0.184, 0.114]));
      current.commands.push(textCommand("ES Viry-Châtillon Football", marginX, pageHeight - 36, 11, "bold", [1, 1, 1]));
      current.commands.push(textCommand("Codes de bonne conduite", marginX, pageHeight - 62, 24, "bold", [1, 1, 1]));
      current.commands.push(textCommand("Joueurs, parents, supporters, éducateurs et règlement intérieur", marginX, pageHeight - 82, 10, "regular", [1, 1, 1]));
      y = pageHeight - 122;
      return;
    }

    current.commands.push(textCommand("ES Viry-Châtillon Football - Codes de bonne conduite", marginX, pageHeight - 36, 9, "bold", [0, 0.184, 0.114]));
    current.commands.push(rectCommand(marginX, pageHeight - 48, contentWidth, 1.2, [0.969, 0.776, 0]));
    y = pageHeight - 68;
  }

  function ensureSpace(height: number) {
    if (y - height < marginBottom) {
      addPage();
    }
  }

  function addGap(size: number) {
    ensureSpace(size);
    y -= size;
  }

  function addText(text: string, options: { font?: FontName; size?: number; color?: Rgb; indent?: number; gapAfter?: number } = {}) {
    const font = options.font ?? "regular";
    const size = options.size ?? 10;
    const color = options.color ?? ([0.17, 0.22, 0.28] satisfies Rgb);
    const indent = options.indent ?? 0;
    const lineHeight = size * 1.38;
    const lines = wrapText(text, contentWidth - indent, size);

    for (const line of lines) {
      ensureSpace(lineHeight);
      current.commands.push(textCommand(line, marginX + indent, y, size, font, color));
      y -= lineHeight;
    }

    if (options.gapAfter) {
      addGap(options.gapAfter);
    }
  }

  function addSectionTitle(title: string) {
    addGap(10);
    ensureSpace(24);
    current.commands.push(rectCommand(marginX, y + 5, 34, 3, [0.969, 0.776, 0]));
    y -= 6;
    addText(title, { font: "bold", size: 15, color: [0, 0.184, 0.114], gapAfter: 6 });
  }

  function addSubTitle(title: string) {
    ensureSpace(20);
    addText(title, { font: "bold", size: 11, color: [0, 0.184, 0.114], gapAfter: 2 });
  }

  function addBullet(text: string) {
    addText(`- ${text}`, { size: 9.6, indent: 12 });
  }

  addPage(true);
  addText("Ce document rassemble les règles de conduite à respecter au sein du club. Il complète la page publique du site et permet une lecture ou une impression directe en PDF.", {
    size: 10.5,
    gapAfter: 8
  });
  addText("Les principes centraux restent simples : respect, ponctualité, responsabilité, tolérance et protection du collectif.", {
    font: "bold",
    size: 10.5,
    color: [0, 0.184, 0.114],
    gapAfter: 8
  });

  for (const block of conductBlocks) {
    addSectionTitle(`${block.title} - ${block.audience}`);
    addText(block.intro, { size: 10, gapAfter: 4 });
    addSubTitle("Repères essentiels");
    for (const rule of block.essentials) {
      addBullet(rule);
    }
    addSubTitle("Règles complètes");
    for (const rule of block.rules) {
      addBullet(rule);
    }
  }

  addSectionTitle("Règlement intérieur");
  regulationItems.forEach((item, index) => {
    addText(`${index + 1}. ${item.title}`, { font: "bold", size: 10.5, color: [0, 0.184, 0.114], gapAfter: 1 });
    addText(item.text, { size: 9.7, indent: 12, gapAfter: 4 });
  });

  const totalPages = pages.length;
  pages.forEach((page, index) => {
    page.commands.push(rectCommand(marginX, 34, contentWidth, 0.8, [0.86, 0.9, 0.88]));
    page.commands.push(textCommand(`Page ${index + 1} / ${totalPages}`, marginX, 22, 8, "regular", [0.38, 0.43, 0.48]));
  });

  return pages;
}

function buildPdf() {
  const pages = buildContentPages();
  const objects: Array<Buffer | string> = [];
  const pageObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((page, index) => {
    const pageObjectId = 5 + index * 2;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);

    const stream = Buffer.from(page.commands.join(""), "latin1");
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "ascii"), stream, Buffer.from("\nendstream", "ascii")]);
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  const chunks: Buffer[] = [];
  const offsets: number[] = [];
  let position = 0;

  function append(data: Buffer | string, encoding: BufferEncoding = "latin1") {
    const chunk = Buffer.isBuffer(data) ? data : Buffer.from(data, encoding);
    chunks.push(chunk);
    position += chunk.length;
  }

  append("%PDF-1.4\n", "ascii");

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = position;
    append(`${index} 0 obj\n`, "ascii");
    append(objects[index]);
    append("\nendobj\n", "ascii");
  }

  const xrefOffset = position;
  append(`xref\n0 ${objects.length}\n`, "ascii");
  append("0000000000 65535 f \n", "ascii");
  for (let index = 1; index < objects.length; index += 1) {
    append(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`, "ascii");
  }
  append(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`, "ascii");

  return Buffer.concat(chunks);
}

export async function GET(request: NextRequest) {
  const pdf = buildPdf();
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `${disposition}; filename="${fileName}"`,
      "Content-Type": "application/pdf"
    }
  });
}
