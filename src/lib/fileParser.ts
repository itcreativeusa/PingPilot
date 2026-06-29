import * as XLSX from "xlsx";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromUpload(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return extractSpreadsheetText(buffer, name);
  }

  if (name.endsWith(".pdf")) {
    const pdfParser = new PDFParse({});
    const data = await pdfParser.getText({});
    return data.text || "";
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (file.type.startsWith("text/") || name.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  return "";
}

function extractSpreadsheetText(buffer: Buffer, name: string): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Array<Record<string, unknown>>;

    return rows
      .slice(0, 8)
      .map((row) => Object.values(row).join(" | "))
      .join("\n");
  });

  return sheets.filter(Boolean).join("\n\n");
}

export function buildUploadContext(fileName: string, extractedText: string): string {
  const trimmed = extractedText.trim();
  if (!trimmed) {
    return `Uploaded file: ${fileName}\nNo readable content was found.`;
  }

  return `Uploaded file: ${fileName}\nExtracted content:\n${trimmed}`;
}
