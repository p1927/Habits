import { jsPDF } from 'jspdf';
import type { FoodHistoryDay, HabitsStreaksResponse, HabitsWeekResponse } from './api';

export interface WeekReportData {
  foodDays: FoodHistoryDay[];
  habitWeek: HabitsWeekResponse;
  streaks: HabitsStreaksResponse;
  calorieTarget: number;
  proteinTarget: number;
}

const HABIT_COLS = ['sleep', 'work', 'read', 'speak', 'game', 'wasted'] as const;

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  return y + 7;
}

function addTableHeader(doc: jsPDF, y: number, cols: string[], colX: number[]): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  cols.forEach((col, i) => doc.text(col, colX[i], y));
  doc.setFont('helvetica', 'normal');
  return y + 5;
}

function ensurePage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function downloadWeekReportPdf(data: WeekReportData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
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
    rangeStart && rangeEnd ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}` : 'Last 7 days',
    14,
    28,
  );
  doc.text(`Generated ${generated}`, 14, 34);
  doc.setTextColor(0);

  let y = 44;

  y = addSectionTitle(doc, y, 'Summary');
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
  y += 10;

  if (data.foodDays.length > 0) {
    y = ensurePage(doc, y);
    y = addSectionTitle(doc, y, 'Nutrition');
    const foodCols = ['Date', 'Cal', 'Protein', 'Carbs', 'Fat'];
    const foodX = [14, 52, 72, 98, 124];
    y = addTableHeader(doc, y, foodCols, foodX);
    for (const day of data.foodDays) {
      y = ensurePage(doc, y);
      doc.text(fmtDate(day.date), foodX[0], y);
      doc.text(String(Math.round(day.calories)), foodX[1], y);
      doc.text(`${Math.round(day.protein)}g`, foodX[2], y);
      doc.text(`${Math.round(day.carbs)}g`, foodX[3], y);
      doc.text(`${Math.round(day.fat)}g`, foodX[4], y);
      y += 5;
    }
    y += 6;
  }

  if (data.habitWeek.recent_days.length > 0) {
    y = ensurePage(doc, y, 40);
    y = addSectionTitle(doc, y, 'Habits (hours)');
    const habitCols = ['Date', ...HABIT_COLS.map((c) => c.charAt(0).toUpperCase() + c.slice(1))];
    const habitX = [14, 46, 58, 70, 82, 94, 106, 118];
    y = addTableHeader(doc, y, habitCols, habitX);
    for (const day of data.habitWeek.recent_days) {
      y = ensurePage(doc, y);
      doc.text(fmtDate(day.date), habitX[0], y);
      HABIT_COLS.forEach((key, i) => {
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
    HABIT_COLS.forEach((key) => {
      const avg = data.habitWeek.averages[key];
      if (avg != null) {
        doc.text(`${key}: ${avg}h`, 14, y);
        y += 4;
      }
    });
  }

  const slug = new Date().toISOString().slice(0, 10);
  doc.save(`habits-week-${slug}.pdf`);
}
