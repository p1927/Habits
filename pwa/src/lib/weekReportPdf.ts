import { jsPDF } from 'jspdf';
import {
  writeWeekReportCover,
  writeWeekReportHabits,
  writeWeekReportNutrition,
  writeWeekReportSummary,
} from './weekReportPdfSections';
import type { WeekReportData } from './weekReportPdfTypes';

export type { WeekReportData };

export function downloadWeekReportPdf(data: WeekReportData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = writeWeekReportCover(doc, data);
  y = writeWeekReportSummary(doc, data, y);
  y = writeWeekReportNutrition(doc, data, y);
  writeWeekReportHabits(doc, data, y);
  const slug = new Date().toISOString().slice(0, 10);
  doc.save(`habits-week-${slug}.pdf`);
}
