import { Card } from './ui/Card';
import type { FoodLogItem, FoodTodayResponse } from '../lib/api';

interface FoodTodayLogListProps {
  data: FoodTodayResponse | null;
  editingRow: number | null;
  editQty: string;
  loading: boolean;
  onEditQtyChange: (value: string) => void;
  onStartEdit: (item: FoodLogItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (item: FoodLogItem) => void;
  onDelete: (row: number) => void;
}

export function FoodTodayLogList({
  data,
  editingRow,
  editQty,
  loading,
  onEditQtyChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: FoodTodayLogListProps) {
  return (
    <Card className="food-today-log-card home-export-card--health">
      <p className="section-eyebrow">Today</p>
      <h2>Today&apos;s log</h2>
      {!data?.items.length ? (
        <p className="muted">No entries yet today.</p>
      ) : (
        <ul className="food-list">
          {data.items.map((item) => (
            <li key={item.row} className="food-row">
              <div>
                <strong>{item.food}</strong>
                {editingRow === item.row ? (
                  <span className="food-row-edit">
                    <input
                      type="number"
                      className="inline-edit"
                      value={editQty}
                      onChange={(e) => onEditQtyChange(e.target.value)}
                    />
                    g
                    <button type="button" className="btn-pill" onClick={() => onSaveEdit(item)}>
                      Save
                    </button>
                    <button type="button" className="btn-pill btn-pill-outline" onClick={onCancelEdit}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span className="muted food-row-stats">
                    {' '}
                    · {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                  </span>
                )}
              </div>
              <div className="food-row-actions">
                {editingRow !== item.row && (
                  <button
                    type="button"
                    className="btn-pill btn-pill-outline"
                    onClick={() => onStartEdit(item)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="keep-card-delete"
                  aria-label={`Remove ${item.food}`}
                  onClick={() => onDelete(item.row)}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
