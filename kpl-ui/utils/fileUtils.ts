import * as XLSX from "xlsx";

/**
 * Reads the data from an Excel file.
 * 
 * @param file - The Excel file to read.
 * @returns The data from the Excel file as JSON.
 */
export async function ReadExcelFileData(file: File): Promise<[][]> {
  // Convert the file to a buffer
  const arrayBuffer = Buffer.from(await file.arrayBuffer());

  // Use xlsx to parse the buffer
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Get the first sheet from the workbook
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Read the data from the worksheet
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

  return jsonData as [][]; // Return the data as JSON
}
