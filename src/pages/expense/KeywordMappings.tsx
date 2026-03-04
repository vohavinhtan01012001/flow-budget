import { Button, Input, List, Modal, Select, Tag } from 'antd';

import { DEFAULT_KEYWORD_MAPPINGS } from '@/constants/expense.const';
import { db, ILocalKeywordMapping } from '@/libs/dexie/db';
import { ESyncStatus } from '@/models/enums/expense.enum';
import { useAuthStore } from '@/stores/auth.store';
import { useCategoryStore } from '@/stores/category.store';

export const KeywordMappings: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const categories = useCategoryStore((s) => s.categories);
  const [mappings, setMappings] = useState<ILocalKeywordMapping[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    null | string
  >(null);

  const loadMappings = async () => {
    if (!userInfo?.id) return;
    const local = await db.keywordMappings
      .where('userId')
      .equals(userInfo.id)
      .toArray();
    setMappings(local);
  };

  useEffect(() => {
    loadMappings();
  }, [userInfo?.id]);

  const handleAdd = async () => {
    if (!keyword.trim() || !selectedCategoryId || !userInfo?.id) return;
    await db.keywordMappings.add({
      categoryId: selectedCategoryId,
      keyword: keyword.trim().toLowerCase(),
      serverId: null,
      syncStatus: ESyncStatus.Pending,
      userId: userInfo.id,
    } as ILocalKeywordMapping);
    setKeyword('');
    setSelectedCategoryId(null);
    setIsModalOpen(false);
    await loadMappings();
  };

  const handleDelete = async (localId: number) => {
    await db.keywordMappings.delete(localId);
    await loadMappings();
  };

  // Combine default + custom mappings for display
  const defaultEntries = Object.entries(DEFAULT_KEYWORD_MAPPINGS);

  return (
    <div>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <h2 className="tw-text-lg tw-font-semibold tw-m-0">
          Từ khóa
        </h2>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          + Thêm
        </Button>
      </div>

      <h3 className="tw-text-sm tw-font-medium tw-mb-2">Mặc định</h3>
      <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
        {defaultEntries.map(([kw, cat]) => (
          <Tag color="blue" key={kw}>
            {kw} → {cat}
          </Tag>
        ))}
      </div>

      <h3 className="tw-text-sm tw-font-medium tw-mb-2">Tùy chỉnh</h3>
      <List
        dataSource={mappings}
        locale={{ emptyText: 'Chưa có từ khóa tùy chỉnh' }}
        renderItem={(m) => {
          const cat = categories.find(
            (c) =>
              c.serverId === m.categoryId ||
              String(c.localId) === m.categoryId,
          );
          return (
            <List.Item
              actions={[
                <Button
                  danger
                  key="del"
                  onClick={() => handleDelete(m.localId)}
                  size="small"
                  type="text"
                >
                  Xóa
                </Button>,
              ]}
            >
              <span>
                <strong>{m.keyword}</strong> → {cat?.name ?? 'N/A'}
              </span>
            </List.Item>
          );
        }}
      />

      <Modal
        okText="Thêm"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        open={isModalOpen}
        title="Thêm từ khóa"
      >
        <Input
          className="tw-mb-3"
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Từ khóa (vd: cf, bún, grab...)"
          value={keyword}
        />
        <Select
          onChange={setSelectedCategoryId}
          options={categories.map((c) => ({
            label: `${c.icon} ${c.name}`,
            value: c.serverId ?? String(c.localId),
          }))}
          placeholder="Chọn danh mục"
          style={{ width: '100%' }}
          value={selectedCategoryId}
        />
      </Modal>
    </div>
  );
};
