import { Spin } from 'antd';

import { useLoadingStore } from '@/stores/loading.store';

export const TheLoading: React.FC = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return <Spin fullscreen={true} size="large" tip="Loading" />;
};
