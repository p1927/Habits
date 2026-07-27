import { BottomSheet } from './ui/BottomSheet';

export interface LogFoodEditSheetProps {
  open: boolean;
  title: string;
  name: string;
  quantity: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => void;
}

export function LogFoodEditSheet({
  open,
  title,
  name,
  quantity,
  onClose,
  onNameChange,
  onQuantityChange,
  onSubmit,
}: LogFoodEditSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <label className="field">
        Food name
        <input value={name} onChange={(e) => onNameChange(e.target.value)} />
      </label>
      <label className="field">
        Quantity (g)
        <input type="number" value={quantity} onChange={(e) => onQuantityChange(e.target.value)} />
      </label>
      <button type="button" onClick={onSubmit}>
        Log food
      </button>
    </BottomSheet>
  );
}
