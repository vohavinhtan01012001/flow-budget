import { Button, List } from 'antd';

import { confirm } from '@/components/shared/ConfirmDialog';
import { EXPENSE_PAGES } from '@/constants/route-pages.const';
import { db } from '@/libs/dexie/db';
import { processSyncQueue } from '@/libs/dexie/sync';
import { useAuthStore } from '@/stores/auth.store';
import { useSyncStore } from '@/stores/sync.store';
import { showToast } from '@/utils/shared.util';

export const Settings: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const logout = useAuthStore((s) => s.logout);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const refreshPendingCount = useSyncStore((s) => s.refreshPendingCount);
  const navigate = useNavigate();

  useEffect(() => {
    refreshPendingCount();
  }, []);

  const handleSync = async () => {
    await processSyncQueue();
    await refreshPendingCount();
    showToast('Đồng bộ hoàn tất!');
  };

  const handleLogout = () => {
    confirm({
      content: 'Bạn có chắc muốn đăng xuất?',
      danger: true,
      okText: 'Đăng xuất',
      onOk: () => {
        logout();
        navigate('/auth/login');
      },
      title: 'Đăng xuất',
    });
  };

  const handleClearLocal = () => {
    confirm({
      content: 'Xóa toàn bộ dữ liệu offline? Dữ liệu đã sync lên server sẽ không bị ảnh hưởng.',
      danger: true,
      okText: 'Xóa',
      onOk: async () => {
        await db.expenses.clear();
        await db.categories.clear();
        await db.budgets.clear();
        await db.keywordMappings.clear();
        await db.syncQueue.clear();
        showToast('Đã xóa dữ liệu offline');
      },
      title: 'Xóa dữ liệu offline',
    });
  };

  return (
    <div>
      <h2 className="tw-text-lg tw-font-semibold tw-mb-4">Cài đặt</h2>

      <List>
        <List.Item>
          <List.Item.Meta
            description={userInfo?.email ?? 'N/A'}
            title="Tài khoản"
          />
        </List.Item>

        <List.Item
          actions={[
            <Button key="go" onClick={() => navigate(EXPENSE_PAGES.CATEGORIES)} type="link">
              Mở
            </Button>,
          ]}
        >
          <List.Item.Meta title="Quản lý danh mục" />
        </List.Item>

        <List.Item
          actions={[
            <Button key="go" onClick={() => navigate(EXPENSE_PAGES.KEYWORDS)} type="link">
              Mở
            </Button>,
          ]}
        >
          <List.Item.Meta title="Quản lý từ khóa" />
        </List.Item>

        <List.Item
          actions={[
            <Button key="sync" onClick={handleSync} type="link">
              Đồng bộ ({pendingCount})
            </Button>,
          ]}
        >
          <List.Item.Meta
            description={`${pendingCount} mục chờ đồng bộ`}
            title="Đồng bộ dữ liệu"
          />
        </List.Item>

        <List.Item>
          <Button block danger onClick={handleClearLocal} type="text">
            Xóa dữ liệu offline
          </Button>
        </List.Item>

        <List.Item>
          <Button block danger onClick={handleLogout} type="primary">
            Đăng xuất
          </Button>
        </List.Item>
      </List>
    </div>
  );
};
