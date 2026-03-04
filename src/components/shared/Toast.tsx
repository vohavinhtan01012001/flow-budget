import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { createRoot, Root } from 'react-dom/client';

import { EToast } from '@/models/enums/shared.enum';

interface IToastItem {
  description: string;
  id: number;
  message: string;
  type: EToast;
}

let toastId = 0;
let addToastFn: ((item: IToastItem) => void) | null = null;
let containerRoot: null | Root = null;

const iconMap: Record<EToast, React.FC<{ size?: number | string }>> = {
  [EToast.Error]: XCircle,
  [EToast.Info]: Info,
  [EToast.Success]: CheckCircle,
  [EToast.Warning]: AlertTriangle,
};

const colorMap: Record<EToast, string> = {
  [EToast.Error]: 'var(--danger)',
  [EToast.Info]: 'var(--accent)',
  [EToast.Success]: 'var(--success)',
  [EToast.Warning]: 'var(--warning)',
};

const bgMap: Record<EToast, string> = {
  [EToast.Error]: 'var(--danger-soft)',
  [EToast.Info]: 'var(--accent-soft)',
  [EToast.Success]: 'var(--success-soft)',
  [EToast.Warning]: 'var(--warning-soft)',
};

const ToastItem: React.FC<{
  item: IToastItem;
  onDismiss: (id: number) => void;
}> = ({ item, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(item.id), 280);
    }, 2800);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      onClick={() => {
        setExiting(true);
        setTimeout(() => onDismiss(item.id), 280);
      }}
      style={{
        alignItems: 'flex-start',
        animation: exiting
          ? 'toast-out 0.28s ease forwards'
          : 'toast-in 0.28s ease forwards',
        backdropFilter: 'blur(16px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderLeft: `3px solid ${colorMap[item.type]}`,
        borderRadius: 14,
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        display: 'flex',
        gap: 12,
        maxWidth: 360,
        padding: '14px 16px',
        width: '100%',
      }}
    >
      <span
        style={{
          background: bgMap[item.type],
          borderRadius: 8,
          color: colorMap[item.type],
          display: 'flex',
          flexShrink: 0,
          padding: 6,
        }}
      >
        {React.createElement(iconMap[item.type], { size: 20 })}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {item.message}
        </div>
        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: 13,
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          {item.description}
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<IToastItem[]>([]);

  useEffect(() => {
    addToastFn = (item) => setToasts((prev) => [...prev, item]);
    return () => {
      addToastFn = null;
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        left: '50%',
        maxWidth: 392,
        padding: '0 16px',
        pointerEvents: 'none',
        position: 'fixed',
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        transform: 'translateX(-50%)',
        width: '100%',
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem item={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
};

function ensureContainer() {
  if (containerRoot) return;
  const el = document.createElement('div');
  el.id = 'toast-root';
  document.body.appendChild(el);

  // Inject keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(-12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(-8px) scale(0.96); }
    }
  `;
  document.head.appendChild(style);

  containerRoot = createRoot(el);
  containerRoot.render(<ToastContainer />);
}

export const toast = (
  description: string,
  type = EToast.Success,
  message?: string,
) => {
  ensureContainer();

  const labels: Record<EToast, string> = {
    [EToast.Error]: 'Error',
    [EToast.Info]: 'Info',
    [EToast.Success]: 'Success',
    [EToast.Warning]: 'Warning',
  };

  addToastFn?.({
    description,
    id: ++toastId,
    message: message ?? labels[type],
    type,
  });
};
