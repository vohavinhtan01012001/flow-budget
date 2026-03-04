import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

const getRows = (
  expenses: ILocalExpense[],
  categories: ILocalCategory[],
) => {
  return expenses.map((e) => {
    const cat = categories.find(
      (c) =>
        c.serverId === e.categoryId ||
        String(c.localId) === e.categoryId,
    );
    return {
      amount: e.amount,
      category: cat?.name ?? 'Khác',
      date: dayjs(e.expenseDate).format('DD/MM/YYYY'),
      description: e.description ?? '',
      note: e.note ?? '',
    };
  });
};

export const exportToCSV = (
  expenses: ILocalExpense[],
  categories: ILocalCategory[],
) => {
  const rows = getRows(expenses, categories);
  const csv = Papa.unparse(rows, {
    columns: ['date', 'description', 'category', 'amount', 'note'],
    header: true,
  });

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flow-budget-${dayjs().format('YYYY-MM-DD')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (
  expenses: ILocalExpense[],
  categories: ILocalCategory[],
) => {
  const doc = new jsPDF();
  const rows = getRows(expenses, categories);

  doc.setFontSize(16);
  doc.text('Flow Budget - Chi tieu', 14, 20);
  doc.setFontSize(10);
  doc.text(`Ngay xuat: ${dayjs().format('DD/MM/YYYY')}`, 14, 28);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  doc.text(`Tong: ${new Intl.NumberFormat('vi-VN').format(total)} VND`, 14, 34);

  autoTable(doc, {
    body: rows.map((r) => [
      r.date,
      r.description,
      r.category,
      new Intl.NumberFormat('vi-VN').format(r.amount),
      r.note,
    ]),
    head: [['Ngay', 'Mo ta', 'Danh muc', 'So tien', 'Ghi chu']],
    startY: 40,
  });

  doc.save(`flow-budget-${dayjs().format('YYYY-MM-DD')}.pdf`);
};
