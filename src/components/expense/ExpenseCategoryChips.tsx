import type { ILocalCategory } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';

interface IProps {
  categories: ILocalCategory[];
  onSelect: (category: ILocalCategory) => void;
  selectedId: null | number;
}

export const ExpenseCategoryChips: React.FC<IProps> = ({
  categories,
  onSelect,
  selectedId,
}) => {
  return (
    <div className={styles['category-chips']}>
      {categories.map((cat) => (
        <button
          className={`${styles['category-chips__item']} ${
            selectedId === cat.localId
              ? styles['category-chips__item--active']
              : ''
          }`}
          key={cat.localId}
          onClick={() => onSelect(cat)}
          type="button"
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
};
