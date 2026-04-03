export const PRESET_CATEGORIES = [
  { color: '#FF6B6B', icon: '🍜', name: 'Ăn uống', sortOrder: 1 },
  { color: '#4ECDC4', icon: '☕', name: 'Đồ uống', sortOrder: 2 },
  { color: '#45B7D1', icon: '🚗', name: 'Di chuyển', sortOrder: 3 },
  { color: '#96CEB4', icon: '🛒', name: 'Mua sắm', sortOrder: 4 },
  { color: '#FFEAA7', icon: '🏠', name: 'Nhà cửa', sortOrder: 5 },
  { color: '#DDA0DD', icon: '💊', name: 'Sức khỏe', sortOrder: 6 },
  { color: '#98D8C8', icon: '🎮', name: 'Giải trí', sortOrder: 7 },
  { color: '#F7DC6F', icon: '📚', name: 'Học tập', sortOrder: 8 },
  { color: '#BB8FCE', icon: '💡', name: 'Hóa đơn', sortOrder: 9 },
  { color: '#AEB6BF', icon: '📦', name: 'Khác', sortOrder: 10 },
] as const;

export const DEFAULT_KEYWORD_MAPPINGS: Record<string, string> = {
  'ăn': 'Ăn uống',
  'ăn sáng': 'Ăn uống',
  'ăn tối': 'Ăn uống',
  'ăn trưa': 'Ăn uống',
  'bún': 'Ăn uống',
  'cà phê': 'Đồ uống',
  'cf': 'Đồ uống',
  'cơm': 'Ăn uống',
  'điện': 'Hóa đơn',
  'game': 'Giải trí',
  'grab': 'Di chuyển',
  'gym': 'Sức khỏe',
  'internet': 'Hóa đơn',
  'nước': 'Hóa đơn',
  'phim': 'Giải trí',
  'phở': 'Ăn uống',
  'sách': 'Học tập',
  'shopee': 'Mua sắm',
  'taxi': 'Di chuyển',
  'thuê nhà': 'Nhà cửa',
  'thuốc': 'Sức khỏe',
  'trà': 'Đồ uống',
  'trà sữa': 'Đồ uống',
  'xăng': 'Di chuyển',
};

export const AMOUNT_SUFFIXES: Record<string, number> = {
  d: 1_000,
  k: 1_000,
  nghin: 1_000,
  nghìn: 1_000,
  tr: 1_000_000,
  trieu: 1_000_000,
  triệu: 1_000_000,
};

export const EXPENSE_TABS = [
  { icon: 'plus', key: 'input', label: 'Nhập' },
  { icon: 'list', key: 'history', label: 'Lịch sử' },
  { icon: 'chart', key: 'dashboard', label: 'Thống kê' },
  { icon: 'target', key: 'budget', label: 'Ngân sách' },
  { icon: 'settings', key: 'settings', label: 'Cài đặt' },
] as const;
