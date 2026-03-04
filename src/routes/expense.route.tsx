import { EXPENSE_PAGES } from '@/constants/route-pages.const';
import { MobileLayout } from '@/layouts/MobileLayout';
import { ERole } from '@/models/enums/auth.enum';
import { Budget } from '@/pages/expense/Budget';
import { Categories } from '@/pages/expense/Categories';
import { Dashboard } from '@/pages/expense/Dashboard';
import { ExpenseInput } from '@/pages/expense/ExpenseInput';
import { History } from '@/pages/expense/History';
import { KeywordMappings } from '@/pages/expense/KeywordMappings';
import { Settings } from '@/pages/expense/Settings';

export default {
  children: [
    {
      element: <ExpenseInput />,
      index: true,
    },
    {
      element: <History />,
      path: EXPENSE_PAGES.HISTORY,
    },
    {
      element: <Dashboard />,
      path: EXPENSE_PAGES.DASHBOARD,
    },
    {
      element: <Budget />,
      path: EXPENSE_PAGES.BUDGET,
    },
    {
      element: <Settings />,
      path: EXPENSE_PAGES.SETTINGS,
    },
    {
      element: <Categories />,
      path: EXPENSE_PAGES.CATEGORIES,
    },
    {
      element: <KeywordMappings />,
      path: EXPENSE_PAGES.KEYWORDS,
    },
  ],
  element: <MobileLayout />,
  meta: {
    requiresAuth: true,
    roles: [ERole.Admin, ERole.Moderator, ERole.SuperAdmin, ERole.User],
    title: 'Flow Budget',
  },
  path: EXPENSE_PAGES.INPUT,
};
