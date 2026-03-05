import { Button, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { BudgetCard } from '@/components/expense/BudgetCard';
import { db } from '@/libs/dexie/db';
import { EBudgetPeriod } from '@/models/enums/expense.enum';
import { useAuthStore } from '@/stores/auth.store';
import { useBudgetStore } from '@/stores/budget.store';
import { useCategoryStore } from '@/stores/category.store';

export const Budget: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const budgets = useBudgetStore((s) => s.budgets);
  const loadBudgets = useBudgetStore((s) => s.loadBudgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    null | string
  >(null);
  const [amount, setAmount] = useState<null | number>(null);
  const [period, setPeriod] = useState<EBudgetPeriod>(EBudgetPeriod.Monthly);
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userInfo?.id) {
      loadBudgets(userInfo.id);
      loadCategories(userInfo.id);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    const calcSpent = async () => {
      if (!userInfo?.id) return;
      const expenses = await db.expenses
        .where('userId')
        .equals(userInfo.id)
        .toArray();

      const map: Record<string, number> = {};
      budgets.forEach((b) => {
        const catKey = b.categoryId ?? 'total';
        let start: dayjs.Dayjs;
        switch (b.period) {
          case 'daily':
            start = dayjs().startOf('day');
            break;
          case 'weekly':
            start = dayjs().startOf('week');
            break;
          default:
            start = dayjs().startOf('month');
        }

        const filtered = expenses.filter((e) => {
          const matchDate = dayjs(e.expenseDate).isAfter(start);
          const matchCat = b.categoryId
            ? e.categoryId === b.categoryId
            : true;
          return matchDate && matchCat;
        });

        map[`${catKey}-${b.period}`] = filtered.reduce(
          (s, e) => s + e.amount,
          0,
        );
      });

      setSpentMap(map);
    };

    calcSpent();
  }, [budgets, userInfo?.id]);

  const handleAdd = async () => {
    if (!amount || !userInfo?.id) return;
    await addBudget(userInfo.id, selectedCategoryId, amount, period);
    setAmount(null);
    setSelectedCategoryId(null);
    setPeriod(EBudgetPeriod.Monthly);
    setIsModalOpen(false);
  };

  return (
    <div className={styles['budget-page']}>
      <div className={styles['budget-page__header']}>
        <h2>Ngân sách</h2>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          + Thêm
        </Button>
      </div>

      {budgets.length === 0 && (
        <div className="tw-text-center tw-py-10 tw-text-gray-400">
          Chưa thiết lập ngân sách nào
        </div>
      )}

      {budgets.map((b) => {
        const catKey = b.categoryId ?? 'total';
        const spent = spentMap[`${catKey}-${b.period}`] ?? 0;
        const cat = categories.find(
          (c) =>
            c.serverId === b.categoryId ||
            String(c.localId) === b.categoryId,
        );

        return (
          <BudgetCard
            budget={b}
            categoryName={cat?.name ?? 'Tổng'}
            icon={cat?.icon ?? '💰'}
            key={b.localId}
            onDelete={deleteBudget}
            spent={spent}
          />
        );
      })}

      <Modal
        okText="Thêm"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        open={isModalOpen}
        title="Thêm ngân sách"
      >
        <div className="tw-space-y-3">
          <Select
            allowClear
            onChange={setSelectedCategoryId}
            options={[
              { label: '💰 Tổng (tất cả)', value: null },
              ...categories.map((c) => ({
                label: `${c.icon} ${c.name}`,
                value: c.serverId ?? String(c.localId),
              })),
            ]}
            placeholder="Danh mục (để trống = tổng)"
            style={{ width: '100%' }}
            value={selectedCategoryId}
          />
          <InputNumber
            className="tw-w-full"
            formatter={(v) =>
              `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            min={1000}
            onChange={(v) => setAmount(v)}
            placeholder="Số tiền (VND)"
            step={10000}
            style={{ width: '100%' }}
            value={amount}
          />
          <Select
            onChange={setPeriod}
            options={[
              { label: 'Theo ngày', value: EBudgetPeriod.Daily },
              { label: 'Theo tuần', value: EBudgetPeriod.Weekly },
              { label: 'Theo tháng', value: EBudgetPeriod.Monthly },
            ]}
            style={{ width: '100%' }}
            value={period}
          />
        </div>
      </Modal>
    </div>
  );
};
