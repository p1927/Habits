import type { jsPDF } from 'jspdf';
import { addSectionTitle, addTableHeader, ensurePage, fmtReportDate } from './weekReportPdfDocUtils';
import type { WeekReportData } from './weekReportPdfTypes';
import { WEEK_REPORT_HABIT_COLS } from './weekReportPdfTypes';

export function writeWeekReportCover(doc: jsPDF, data: WeekReportData): number {
  const rangeStart = data.foodDays[0]?.date ?? data.habitWeek.recent_days[0]?.date ?? '';
  const rangeEnd =
    data.foodDays[data.foodDays.length - 1]?.date ??
    data.habitWeek.recent_days[data.habitWeek.recent_days.length - 1]?.date ??
    '';
  const generated = new Date().toLocaleString();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Habits — Weekly Report', 14, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    rangeStart && rangeEnd ? `${fmtReportDate(rangeStart)} – ${fmtReportDate(rangeEnd)}` : 'Last 7 days',
    14,
    28,
  );
  doc.text(`Generated ${generated}`, 14, 34);
  doc.setTextColor(0);
  return 44;
}

export function writeWeekReportSummary(doc: jsPDF, data: WeekReportData, startY: number): number {
  let y = addSectionTitle(doc, startY, 'Summary');
  doc.text(`Overall streak: ${data.streaks.overall} days`, 14, y);
  y += 5;
  doc.text(`Calorie target: ${data.calorieTarget} kcal · Protein target: ${data.proteinTarget} g`, 14, y);
  y += 5;
  const avgCal =
    data.foodDays.length > 0
      ? Math.round(data.foodDays.reduce((s, d) => s + d.calories, 0) / data.foodDays.length)
      : 0;
  const avgProtein =
    data.foodDays.length > 0
      ? Math.round(data.foodDays.reduce((s, d) => s + d.protein, 0) / data.foodDays.length)
      : 0;
  doc.text(`7-day avg: ${avgCal} kcal · ${avgProtein} g protein`, 14, y);
  return y + 10;
}

export function writeWeekReportNutrition(doc: jsPDF, data: WeekReportData, startY: number): number {
  if (data.foodDays.length === 0) return startY;

  let y = ensurePage(doc, startY);
  y = addSectionTitle(doc, y, 'Nutrition');
  const foodCols = ['Date', 'Cal', 'Protein', 'Carbs', 'Fat'];
  const foodX = [14, 52, 72, 98, 124];
  y = addTableHeader(doc, y, foodCols, foodX);
  for (const day of data.foodDays) {
    y = ensurePage(doc, y);
    doc.text(fmtReportDate(day.date), foodX[0], y);
    doc.text(String(Math.round(day.calories)), foodX[1], y);
    doc.text(`${Math.round(day.protein)}g`, foodX[2], y);
    doc.text(`${Math.round(day.carbs)}g`, foodX[3], y);
    doc.text(`${Math.round(day.fat)}g`, foodX[4], y);
    y += 5;
  }
  return y + 6;
}

export function writeWeekReportHabits(doc: jsPDF, data: WeekReportData, startY: number): number {
  if (data.habitWeek.recent_days.length === 0) return startY;

  let y = ensurePage(doc, startY, 40);
  y = addSectionTitle(doc, y, 'Habits (hours)');
  const habitCols = ['Date', ...WEEK_REPORT_HABIT_COLS.map((c) => c.charAt(0).toUpperCase() + c.slice(1))];
  const habitX = [14, 46, 58, 70, 82, 94, 106, 118];
  y = addTableHeader(doc, y, habitCols, habitX);
  for (const day of data.habitWeek.recent_days) {
    y = ensurePage(doc, y);
    doc.text(fmtReportDate(day.date), habitX[0], y);
    WEEK_REPORT_HABIT_COLS.forEach((key, i) => {
      const val = day.metrics[key];
      doc.text(val != null ? String(val) : '—', habitX[i + 1], y);
    });
    y += 5;
  }
  y += 4;
  y = ensurePage(doc, y);
  doc.setFont('helvetica', 'italic');
  doc.text('Weekly averages (hours)', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  WEEK_REPORT_HABIT_COLS.forEach((key) => {
    const avg = data.habitWeek.averages[key];
    if (avg != null) {
      doc.text(`${key}: ${avg}h`, 14, y);
      y += 4;
    }
  });
  return y;
}
