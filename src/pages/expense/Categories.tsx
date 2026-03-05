import { Button, ColorPicker, Input, List, Modal, Space } from 'antd';

import { confirm } from '@/components/shared/ConfirmDialog';
import { EToast } from '@/models/enums/shared.enum';
import { useAuthStore } from '@/stores/auth.store';
import { useCategoryStore } from '@/stores/category.store';

export const Categories: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#0ea5e9');

  useEffect(() => {
    if (userInfo?.id) loadCategories(userInfo.id);
  }, [userInfo?.id]);

  const handleAdd = async () => {
    if (!name.trim() || !userInfo?.id) return;
    try {
      await addCategory(name.trim(), icon, color, userInfo.id);
      setName('');
      setIcon('📦');
      setColor('#0ea5e9');
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE_CATEGORY') {
        showToast(`Danh mục "${name.trim()}" đã tồn tại!`, EToast.Warning);
      }
    }
  };

  const handleDelete = async (localId: number, isPreset: boolean) => {
    if (isPreset) return;
    confirm({
      content: 'Bạn có chắc muốn xóa danh mục này?',
      danger: true,
      okText: 'Xóa',
      onOk: () => deleteCategory(localId),
      title: 'Xóa danh mục',
    });
  };

  return (
    <div>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <h2 className="tw-text-lg tw-font-semibold tw-m-0">Danh mục</h2>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          + Thêm
        </Button>
      </div>

      <List
        dataSource={categories}
        renderItem={(cat) => (
          <List.Item
            actions={
              !cat.isPreset
                ? [
                    <Button
                      danger
                      key="delete"
                      onClick={() => handleDelete(cat.localId, cat.isPreset)}
                      size="small"
                      type="text"
                    >
                      Xóa
                    </Button>,
                  ]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={
                <span
                  className="tw-text-2xl tw-w-10 tw-h-10 tw-rounded-lg tw-flex tw-items-center tw-justify-center"
                  style={{ background: `${cat.color}20` }}
                >
                  {cat.icon}
                </span>
              }
              description={cat.isPreset ? 'Mặc định' : 'Tùy chỉnh'}
              title={cat.name}
            />
          </List.Item>
        )}
      />

      <Modal
        okText="Thêm"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        open={isModalOpen}
        title="Thêm danh mục"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            value={name}
          />
          <Input
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (emoji)"
            value={icon}
          />
          <ColorPicker
            onChange={(_, hex) => setColor(hex)}
            showText
            value={color}
          />
        </Space>
      </Modal>
    </div>
  );
};
