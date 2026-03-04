import type { Dayjs } from 'dayjs';

import { DatePicker, Input, Select } from 'antd';

import type { TExpenseFilter } from '@/models/types/expense.type';

import { useCategoryStore } from '@/stores/category.store';

interface IProps {
  filter: TExpenseFilter;
  onFilterChange: (filter: Partial<TExpenseFilter>) => void;
}

export const ExpenseFilter: React.FC<IProps> = ({
  filter,
  onFilterChange,
}) => {
  const categories = useCategoryStore((s) => s.categories);

  const handleDateChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      onFilterChange({
        dateRange: {
          end: dates[1].toISOString(),
          start: dates[0].toISOString(),
        },
      });
    } else {
      onFilterChange({ dateRange: undefined });
    }
  };

  return (
    <div className="tw-space-y-2">
      <Input
        allowClear
        onChange={(e) => onFilterChange({ search: e.target.value })}
        placeholder="Tìm kiếm..."
        value={filter.search}
      />
      <div className="tw-flex tw-gap-2">
        <Select
          allowClear
          onChange={(v) => onFilterChange({ categoryId: v })}
          options={categories.map((c) => ({
            label: `${c.icon} ${c.name}`,
            value: c.serverId ?? String(c.localId),
          }))}
          placeholder="Danh mục"
          style={{ flex: 1 }}
          value={filter.categoryId}
        />
        <DatePicker.RangePicker
          getPopupContainer={(trigger) =>
            trigger.parentElement ?? document.body
          }
          onChange={handleDateChange}
          placeholder={['Từ ngày', 'Đến ngày']}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
};
