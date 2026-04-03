import { Pencil, Trash2 } from 'lucide-react';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/swipeable-item.module.scss';
import { ExpenseListItem } from '@/components/expense/ExpenseListItem';
import { actionSheet } from '@/components/shared/ActionSheet';
import { confirm } from '@/components/shared/ConfirmDialog';

interface IProps {
  categories: ILocalCategory[];
  expense: ILocalExpense;
  onDelete: (localId: number) => void;
  onEdit?: (expense: ILocalExpense) => void;
}

const SWIPE_THRESHOLD = 80;
const LONG_PRESS_MS = 500;

export const SwipeableExpenseItem: React.FC<IProps> = ({
  categories,
  expense,
  onDelete,
  onEdit,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const longPressTimer = useRef<null | ReturnType<typeof setTimeout>>(
    null,
  );
  const didLongPress = useRef(false);

  const showDeleteConfirm = useCallback(() => {
    confirm({
      content: `${expense.description || 'Chi tiêu'} sẽ bị xóa vĩnh viễn.`,
      danger: true,
      okText: 'Xóa',
      onOk: () => onDelete(expense.localId),
      title: 'Xóa chi tiêu?',
    });
  }, [expense, onDelete]);

  const showActions = useCallback(() => {
    actionSheet({
      options: [
        {
          icon: <Pencil size={18} />,
          label: 'Chỉnh sửa',
          onClick: () => onEdit?.(expense),
        },
        {
          danger: true,
          icon: <Trash2 size={18} />,
          label: 'Xóa',
          onClick: showDeleteConfirm,
        },
      ],
      title: expense.description || 'Chi tiêu',
    });
  }, [expense, onEdit, showDeleteConfirm]);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isHorizontal.current = null;
    didLongPress.current = false;

    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(30);
      showActions();
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    clearLongPress();

    if (!isHorizontal.current) return;

    // Only allow swipe left
    const clampedX = Math.min(0, Math.max(dx, -SWIPE_THRESHOLD - 20));
    setOffsetX(clampedX);
    setSwiping(true);
  };

  const handleTouchEnd = () => {
    clearLongPress();

    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    if (offsetX < -SWIPE_THRESHOLD) {
      showDeleteConfirm();
    }

    setSwiping(false);
    setOffsetX(0);
  };

  const deleteVisible = offsetX < -30;

  return (
    <div className={styles['swipeable-item']}>
      {/* Delete background */}
      <div
        className={styles['swipeable-item__delete-bg']}
        style={{ opacity: deleteVisible ? 1 : 0 }}
      >
        <span>Xóa</span>
      </div>

      {/* Swipeable content */}
      <div
        className={styles['swipeable-item__content']}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease',
        }}
      >
        <ExpenseListItem
          categories={categories}
          className="!tw-mb-0"
          expense={expense}
        />
      </div>
    </div>
  );
};
