import type { jsPDF } from 'jspdf';

export function fmtReportDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  return y + 7;
}

export function addTableHeader(doc: jsPDF, y: number, cols: string[], colX: number[]): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  cols.forEach((col, i) => doc.text(col, colX[i], y));
  doc.setFont('helvetica', 'normal');
  return y + 5;
}

export function ensurePage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}
