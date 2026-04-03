import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';

import type { ILocalCategory } from '@/libs/dexie/db';
import type { TParsedExpense } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  categories?: ILocalCategory[];
  categoryName: null | string;
  onAmountChange?: (amount: number) => void;
  onCategoryChange?: (cat: ILocalCategory) => void;
  onDateChange?: (date: dayjs.Dayjs) => void;
  onDescriptionChange?: (desc: string) => void;
  parsed: null | TParsedExpense;
  selectedDate: dayjs.Dayjs;
}

type TEditingField = 'amount' | 'description' | null;

export const ExpensePreview: React.FC<IProps> = ({
  categories,
  categoryName,
  onAmountChange,
  onCategoryChange,
  onDateChange,
  onDescriptionChange,
  parsed,
  selectedDate,
}) => {
  const [editing, setEditing] = useState<TEditingField>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  if (!parsed) return null;

  const startEditAmount = () => {
    setEditAmount(String(parsed.amount));
    setEditing('amount');
    setTimeout(() => amountRef.current?.focus(), 50);
  };

  const confirmAmount = () => {
    const num = Number(editAmount.replace(/[^0-9]/g, ''));
    if (num > 0) onAmountChange?.(num);
    setEditing(null);
  };

  const startEditDesc = () => {
    setEditDesc(parsed.description || '');
    setEditing('description');
    setTimeout(() => descRef.current?.focus(), 50);
  };

  const confirmDesc = () => {
    if (editDesc.trim()) onDescriptionChange?.(editDesc.trim());
    setEditing(null);
  };

  const handleCatSelect = (cat: ILocalCategory) => {
    onCategoryChange?.(cat);
    setShowCatPicker(false);
  };

  return (
    <div className={styles['expense-preview']}>
      {/* Amount row */}
      <div
        className={`${styles['expense-preview__row']} ${styles['expense-preview__row--editable']}`}
        onClick={editing !== 'amount' ? startEditAmount : undefined}
      >
        <span className={styles['expense-preview__label']}>Số tiền</span>
        {editing === 'amount' ? (
          <input
            className={styles['expense-preview__input']}
            inputMode="numeric"
            onBlur={confirmAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmAmount()}
            ref={amountRef}
            value={editAmount}
          />
        ) : (
          <span
            className={`${styles['expense-preview__value']} ${styles['expense-preview__value--amount']}`}
          >
            {formatVND(parsed.amount)}
            <Pencil
              className={styles['expense-preview__edit-icon']}
              size={14}
            />
          </span>
        )}
      </div>

      {/* Description row */}
      <div
        className={`${styles['expense-preview__row']} ${styles['expense-preview__row--editable']}`}
        onClick={editing !== 'description' ? startEditDesc : undefined}
      >
        <span className={styles['expense-preview__label']}>Mô tả</span>
        {editing === 'description' ? (
          <input
            className={styles['expense-preview__input']}
            onBlur={confirmDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmDesc()}
            placeholder="Nhập mô tả..."
            ref={descRef}
            value={editDesc}
          />
        ) : (
          <span className={styles['expense-preview__value']}>
            {parsed.description || 'Chưa có mô tả'}
            <Pencil
              className={styles['expense-preview__edit-icon']}
              size={12}
            />
          </span>
        )}
      </div>

      {/* Category row */}
      <div
        className={`${styles['expense-preview__row']} ${styles['expense-preview__row--editable']}`}
        onClick={() => setShowCatPicker(!showCatPicker)}
      >
        <span className={styles['expense-preview__label']}>Danh mục</span>
        <span className={styles['expense-preview__value']}>
          {categoryName || 'Chưa chọn'}
          <Pencil
            className={styles['expense-preview__edit-icon']}
            size={12}
          />
        </span>
      </div>

      {/* Date row */}
      <div className={styles['expense-preview__row']}>
        <span className={styles['expense-preview__label']}>Ngày</span>
        <input
          className={styles['expense-preview__date-input']}
          max={dayjs().format('YYYY-MM-DD')}
          onChange={(e) => {
            const d = dayjs(e.target.value, 'YYYY-MM-DD');
            if (d.isValid()) onDateChange?.(d);
          }}
          type="date"
          value={selectedDate.format('YYYY-MM-DD')}
        />
      </div>

      {/* Inline category picker */}
      {showCatPicker && categories && categories.length > 0 && (
        <div className={styles['expense-preview__cat-picker']}>
          {categories.map((cat) => (
            <button
              className={`${styles['expense-preview__cat-item']} ${
                categoryName === cat.name
                  ? styles['expense-preview__cat-item--active']
                  : ''
              }`}
              key={cat.localId}
              onClick={() => handleCatSelect(cat)}
              type="button"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
