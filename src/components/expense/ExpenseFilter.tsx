import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { Button, DatePicker, Input, Select } from 'antd';

import type { TExpenseFilter } from '@/models/types/expense.type';

import { useCategoryStore } from '@/stores/category.store';

interface IProps {
  filter: TExpenseFilter;
  onFilterChange: (filter: Partial<TExpenseFilter>) => void;
}

const EMPTY_FILTER: Partial<TExpenseFilter> = {
  categoryId: undefined,
  dateRange: undefined,
  search: '',
};

export const ExpenseFilter: React.FC<IProps> = ({
  filter,
  onFilterChange,
}) => {
  const categories = useCategoryStore((s) => s.categories);

  const startDate = filter.dateRange?.start
    ? dayjs(filter.dateRange.start)
    : null;
  const endDate = filter.dateRange?.end
    ? dayjs(filter.dateRange.end)
    : null;

  const handleStartChange = (date: Dayjs | null) => {
    if (date) {
      onFilterChange({
        dateRange: {
          end: endDate?.toISOString() ?? date.endOf('day').toISOString(),
          start: date.toISOString(),
        },
      });
    } else {
      // Clear start → if no end either, clear range
      if (!endDate) {
        onFilterChange({ dateRange: undefined });
      } else {
        onFilterChange({
          dateRange: { end: endDate.toISOString(), start: '' },
        });
      }
    }
  };

  const handleEndChange = (date: Dayjs | null) => {
    if (date) {
      onFilterChange({
        dateRange: {
          end: date.toISOString(),
          start:
            startDate?.toISOString() ??
            date.startOf('day').toISOString(),
        },
      });
    } else {
      if (!startDate) {
        onFilterChange({ dateRange: undefined });
      } else {
        onFilterChange({
          dateRange: { end: '', start: startDate.toISOString() },
        });
      }
    }
  };

  const hasActiveFilter =
    !!filter.search ||
    !!filter.categoryId ||
    !!filter.dateRange;

  const handleReset = () => {
    onFilterChange(EMPTY_FILTER);
  };

  return (
    <div className="tw-space-y-2">
      <Input
        allowClear
        onChange={(e) => onFilterChange({ search: e.target.value })}
        placeholder="Tìm kiếm..."
        value={filter.search}
      />
      <Select
        allowClear
        onChange={(v) => onFilterChange({ categoryId: v })}
        options={categories.map((c) => ({
          label: `${c.icon} ${c.name}`,
          value: c.serverId ?? String(c.localId),
        }))}
        placeholder="Danh mục"
        style={{ width: '100%' }}
        value={filter.categoryId}
      />
      <div className="tw-flex tw-gap-2">
        <DatePicker
          allowClear
          getPopupContainer={(trigger) =>
            trigger.parentElement ?? document.body
          }
          onChange={handleStartChange}
          placeholder="Từ ngày"
          style={{ flex: 1 }}
          value={startDate}
        />
        <DatePicker
          allowClear
          getPopupContainer={(trigger) =>
            trigger.parentElement ?? document.body
          }
          onChange={handleEndChange}
          placeholder="Đến ngày"
          style={{ flex: 1 }}
          value={endDate}
        />
      </div>
      {hasActiveFilter && (
        <Button
          block
          onClick={handleReset}
          size="small"
          style={{ borderRadius: 10 }}
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
};
