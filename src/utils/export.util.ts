import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

// Import font as URL via Vite
import fontUrl from '@/assets/fonts/plus-jakarta-sans/PlusJakartaSans-VariableFont_wght.ttf?url';

let fontRegistered = false;

const registerViFont = async (doc: jsPDF) => {
  if (fontRegistered) {
    doc.setFont('PlusJakartaSans');
    return;
  }

  const res = await fetch(fontUrl);
  const buf = await res.arrayBuffer();

  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  doc.addFileToVFS('PlusJakartaSans.ttf', base64);
  doc.addFont('PlusJakartaSans.ttf', 'PlusJakartaSans', 'normal');
  doc.setFont('PlusJakartaSans');
  fontRegistered = true;
};

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

export const exportToPDF = async (
  expenses: ILocalExpense[],
  categories: ILocalCategory[],
) => {
  const doc = new jsPDF();
  await registerViFont(doc);

  const rows = getRows(expenses, categories);

  doc.setFontSize(16);
  doc.text('Flow Budget - Chi tiêu', 14, 20);
  doc.setFontSize(10);
  doc.text(`Ngày xuất: ${dayjs().format('DD/MM/YYYY')}`, 14, 28);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  doc.text(
    `Tổng: ${new Intl.NumberFormat('vi-VN').format(total)} VND`,
    14,
    34,
  );

  autoTable(doc, {
    body: rows.map((r) => [
      r.date,
      r.description,
      r.category,
      new Intl.NumberFormat('vi-VN').format(r.amount),
      r.note,
    ]),
    head: [['Ngày', 'Mô tả', 'Danh mục', 'Số tiền', 'Ghi chú']],
    startY: 40,
    styles: { font: 'PlusJakartaSans' },
  });

  doc.save(`flow-budget-${dayjs().format('YYYY-MM-DD')}.pdf`);
};
