import { Button } from 'antd';
import dayjs from 'dayjs';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';
import { ExpenseCategoryChips } from '@/components/expense/ExpenseCategoryChips';
import { ExpensePreview } from '@/components/expense/ExpensePreview';
import { ExpenseQuickInput } from '@/components/expense/ExpenseQuickInput';
import { SwipeableExpenseItem } from '@/components/expense/SwipeableExpenseItem';
import { useBudgetAlert } from '@/hooks/shared/use-budget-alert';
import { useSpeechRecognition } from '@/hooks/shared/use-speech-recognition';
import { db } from '@/libs/dexie/db';
import { useAuthStore } from '@/stores/auth.store';
import { useBudgetStore } from '@/stores/budget.store';
import { useCategoryStore } from '@/stores/category.store';
import { useExpenseStore } from '@/stores/expense.store';
import { useSyncStore } from '@/stores/sync.store';
import { formatVND, parseExpenseInput, resolveCategory } from '@/utils/expense-parser.util';

export const ExpenseInput: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const recentExpenses = useExpenseStore((s) => s.recentExpenses);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const loadBudgets = useBudgetStore((s) => s.loadBudgets);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const refreshPendingCount = useSyncStore((s) => s.refreshPendingCount);
  const { checkBudgets } = useBudgetAlert();
  const [editingExpense, setEditingExpense] = useState<ILocalExpense | null>(null);
  const [overrideAmount, setOverrideAmount] = useState<null | number>(null);
  const [overrideDesc, setOverrideDesc] = useState<null | string>(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    isTranscribing,
    startListening,
    stopListening,
    transcript,
  } = useSpeechRecognition();

  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ILocalCategory | null>(null);
  const [customMappings, setCustomMappings] = useState<
    Record<string, string>
  >({});

  // Feed voice transcript into input
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const parsed = useMemo(
    () => parseExpenseInput(inputValue, customMappings),
    [inputValue, customMappings],
  );

  const categoryNames = useMemo(
    () => categories.map((c) => c.name),
    [categories],
  );

  const categoryName = useMemo(() => {
    if (selectedCategory) return selectedCategory.name;
    if (parsed?.categoryKeyword) {
      return resolveCategory(
        parsed.categoryKeyword,
        customMappings,
        categoryNames,
      );
    }
    return null;
  }, [parsed, selectedCategory, customMappings, categoryNames]);

  useEffect(() => {
    if (userInfo?.id) {
      loadCategories(userInfo.id);
      loadExpenses(userInfo.id);
      loadBudgets(userInfo.id);
      refreshPendingCount();
    }
  }, [userInfo?.id]);

  // Handle edit from History page navigation
  const location = useLocation();
  useEffect(() => {
    const state = location.state as
      | undefined
      | { editExpense?: ILocalExpense };
    if (state?.editExpense) {
      handleEdit(state.editExpense);
      // Clear the state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Load custom keyword mappings and resolve to category names
  useEffect(() => {
    if (!userInfo?.id || categories.length === 0) return;
    db.keywordMappings
      .where('userId')
      .equals(userInfo.id)
      .toArray()
      .then((mappings) => {
        const map: Record<string, string> = {};
        for (const m of mappings) {
          const cat = categories.find(
            (c) =>
              c.serverId === m.categoryId ||
              String(c.localId) === m.categoryId,
          );
          if (cat) map[m.keyword] = cat.name;
        }
        setCustomMappings(map);
      });
  }, [userInfo?.id, categories]);

  const handleEdit = (expense: ILocalExpense) => {
    setEditingExpense(expense);
    const cat = categories.find(
      (c) =>
        c.serverId === expense.categoryId ||
        String(c.localId) === expense.categoryId,
    );
    setSelectedCategory(cat ?? null);
    setInputValue(
      `${expense.description || ''} ${formatVND(expense.amount)}`.trim(),
    );
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setInputValue('');
    setSelectedCategory(null);
    setOverrideAmount(null);
    setOverrideDesc(null);
  };

  const handleSubmit = async () => {
    if (!parsed || !userInfo?.id) return;

    const finalAmount = overrideAmount ?? parsed.amount;
    const finalDesc = overrideDesc ?? (parsed.description || parsed.rawInput);

    let categoryId: null | string = null;
    if (selectedCategory) {
      categoryId =
        selectedCategory.serverId ?? String(selectedCategory.localId);
    } else if (categoryName) {
      const cat = categories.find((c) => c.name === categoryName);
      if (cat) categoryId = cat.serverId ?? String(cat.localId);
    }

    if (editingExpense) {
      await updateExpense(editingExpense.localId, {
        amount: finalAmount,
        categoryId,
        description: finalDesc,
      });
      setEditingExpense(null);
      setInputValue('');
      setSelectedCategory(null);
      setOverrideAmount(null);
      setOverrideDesc(null);
      if (navigator.vibrate) navigator.vibrate(50);
      showToast('Đã cập nhật chi tiêu!');
      await refreshPendingCount();
      return;
    }

    await addExpense({
      amount: finalAmount,
      categoryId,
      description: finalDesc,
      expenseDate: dayjs().toISOString(),
      note: null,
      userId: userInfo.id,
    });

    setInputValue('');
    setSelectedCategory(null);
    setOverrideAmount(null);
    setOverrideDesc(null);

    if (navigator.vibrate) navigator.vibrate(50);
    showToast('Đã thêm chi tiêu!');
    await refreshPendingCount();
    await checkBudgets();
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCategorySelect = (cat: ILocalCategory) => {
    setSelectedCategory(
      selectedCategory?.localId === cat.localId ? null : cat,
    );
  };

  return (
    <div className={styles['expense-input-page']}>
      <div className={styles['expense-input-page__header']}>
        <h2>Flow Budget</h2>
        {pendingCount > 0 && (
          <p>{pendingCount} mục chờ đồng bộ</p>
        )}
      </div>

      <div className={styles['expense-input-page__quick-input']}>
        <ExpenseQuickInput
          inputValue={inputValue}
          isListening={isListening}
          isSpeechSupported={isSpeechSupported}
          isTranscribing={isTranscribing}
          onMicClick={handleMicClick}
          onSubmit={handleSubmit}
          setInputValue={setInputValue}
        />
      </div>

      <div className={styles['expense-input-page__preview']}>
        <ExpensePreview
          categories={categories}
          categoryName={categoryName}
          onAmountChange={setOverrideAmount}
          onCategoryChange={handleCategorySelect}
          onDescriptionChange={setOverrideDesc}
          parsed={
            parsed
              ? {
                  ...parsed,
                  amount: overrideAmount ?? parsed.amount,
                  description: overrideDesc ?? parsed.description,
                }
              : null
          }
        />
      </div>

      {parsed && (
        <div className="tw-mb-4 tw-flex tw-gap-2">
          {editingExpense && (
            <Button
              onClick={handleCancelEdit}
              size="large"
              style={{
                borderRadius: 14,
                fontWeight: 600,
                height: 50,
              }}
            >
              Hủy
            </Button>
          )}
          <Button
            block
            onClick={handleSubmit}
            size="large"
            style={{
              borderRadius: 14,
              fontWeight: 600,
              height: 50,
              letterSpacing: '-0.01em',
            }}
            type="primary"
          >
            {editingExpense ? 'Cập nhật' : 'Thêm chi tiêu'}
          </Button>
        </div>
      )}

      <div className={styles['expense-input-page__chips']}>
        <ExpenseCategoryChips
          categories={categories}
          onSelect={handleCategorySelect}
          selectedId={selectedCategory?.localId ?? null}
        />
      </div>

      {recentExpenses.length > 0 && (
        <div className={styles['expense-input-page__recent']}>
          <h3>Gần đây</h3>
          {recentExpenses.map((expense) => (
            <SwipeableExpenseItem
              categories={categories}
              expense={expense}
              key={expense.localId}
              onDelete={deleteExpense}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
