import { AlertTriangle, Info } from 'lucide-react';
import { createRoot, Root } from 'react-dom/client';

interface IConfirmOptions {
  cancelText?: string;
  content: string;
  danger?: boolean;
  okText?: string;
  onCancel?: () => void;
  onOk?: () => Promise<void> | void;
  title: string;
}

let dialogRoot: null | Root = null;
let dialogEl: HTMLDivElement | null = null;
let styleInjected = false;

function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes confirm-overlay-in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes confirm-overlay-out { from { opacity: 1 } to { opacity: 0 } }
    @keyframes confirm-card-in {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes confirm-card-out {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
    }
  `;
  document.head.appendChild(s);
}

const ConfirmContent: React.FC<
  IConfirmOptions & { onClose: () => void }
> = ({ cancelText, content, danger, okText, onCancel, onClose, onOk, title }) => {
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 220);
  }, [onClose]);

  const handleOk = async () => {
    try {
      setLoading(true);
      await onOk?.();
      close();
    } catch {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  const accentColor = danger ? 'var(--danger)' : 'var(--accent)';
  const accentBg = danger ? 'var(--danger-soft)' : 'var(--accent-soft)';

  return (
    <>
      {/* overlay */}
      <div
        onClick={handleCancel}
        style={{
          animation: exiting
            ? 'confirm-overlay-out 0.22s ease forwards'
            : 'confirm-overlay-in 0.22s ease forwards',
          background: 'rgba(0,0,0,0.45)',
          inset: 0,
          position: 'fixed',
          zIndex: 9998,
        }}
      />
      {/* card */}
      <div
        style={{
          animation: exiting
            ? 'confirm-card-out 0.22s ease forwards'
            : 'confirm-card-in 0.22s ease forwards',
          backdropFilter: 'blur(20px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 18,
          boxShadow: 'var(--shadow-lg)',
          left: '50%',
          maxWidth: 340,
          padding: '28px 24px 20px',
          position: 'fixed',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 40px)',
          zIndex: 9999,
        }}
      >
        {/* icon */}
        <div
          style={{
            alignItems: 'center',
            background: accentBg,
            borderRadius: 12,
            color: accentColor,
            display: 'flex',
            height: 44,
            justifyContent: 'center',
            margin: '0 auto 16px',
            width: 44,
          }}
        >
          {danger ? (
            <AlertTriangle size={22} />
          ) : (
            <Info size={22} />
          )}
        </div>

        <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>
          {title}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginTop: 8, textAlign: 'center' }}>
          {content}
        </div>

        {/* buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            disabled={loading}
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              flex: 1,
              fontSize: 14,
              fontWeight: 500,
              height: 42,
              transition: 'all 0.15s',
            }}
          >
            {cancelText ?? 'Hủy'}
          </button>
          <button
            disabled={loading}
            onClick={handleOk}
            style={{
              background: accentColor,
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: loading ? 'wait' : 'pointer',
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              height: 42,
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {loading ? '...' : (okText ?? 'Xác nhận')}
          </button>
        </div>
      </div>
    </>
  );
};

function unmount() {
  if (dialogRoot) {
    dialogRoot.unmount();
    dialogRoot = null;
  }
  if (dialogEl) {
    dialogEl.remove();
    dialogEl = null;
  }
}

export const confirm = (options: IConfirmOptions) => {
  injectStyles();
  unmount();

  dialogEl = document.createElement('div');
  dialogEl.id = 'confirm-root';
  document.body.appendChild(dialogEl);
  dialogRoot = createRoot(dialogEl);
  dialogRoot.render(<ConfirmContent {...options} onClose={unmount} />);
};
