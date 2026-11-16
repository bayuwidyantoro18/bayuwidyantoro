export async function readSheet(file) {
  if (!file || typeof file.arrayBuffer !== 'function') return [];
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  const sheets = await readXlsxFile(file);
  const [header, ...rows] = sheets[0]?.data || [];
  if (!header) return [];
  const keys = header.map(label => String(label).toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return rows.map((row, index) => ({
    ...Object.fromEntries(keys.filter(Boolean).map(key => {
      const value = row[keys.indexOf(key)];
      return [key, value instanceof Date ? value.toISOString().slice(0, 10) : value ?? ''];
    })),
    row_number: index + 2,
  }));
}
export const formatCell = value => value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
export async function excel(rows, keys) {
  const cols = keys || Object.keys(rows[0] || {}).filter(key => !key.startsWith('can_'));
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  return writeXlsxFile([[...cols], ...rows.map(row => cols.map(key => formatCell(row[key])))].map(row => row.map(value => ({ value, type: String })))).toBlob();
}
export async function pdf(rows, title) {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  let page, y;
  function addPage() {
    page = document.addPage([595, 842]);
    y = 790;
    page.drawText(title, { x: 38, y, size: 17, font });
    page.drawText('Data fiktif untuk demonstrasi portofolio', { x: 38, y: y - 22, size: 11, font });
    y -= 57;
  }
  addPage();
  for (const item of rows) {
    const plain = Object.values(item).filter(value => value != null && typeof value !== 'object').map(formatCell).join(' | ').replace(/[^\x20-\x7E]/g, ' ');
    for (const line of plain.match(/.{1,90}/g) || []) {
      if (y < 55) addPage();
      page.drawText(line, { x: 38, y, size: 9, font });
      y -= 14;
    }
    y -= 10;
  }
  return new Blob([await document.save()], { type: 'application/pdf' });
}
