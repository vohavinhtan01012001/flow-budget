import { createRoot, Root } from 'react-dom/client';

interface IActionSheetOption {
  danger?: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface IActionSheetOptions {
  cancelText?: string;
  onCancel?: () => void;
  options: IActionSheetOption[];
  title?: string;
}

let sheetRoot: null | Root = null;
let sheetEl: HTMLDivElement | null = null;
let styleInjected = false;

function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes action-sheet-overlay-in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes action-sheet-overlay-out { from { opacity: 1 } to { opacity: 0 } }
    @keyframes action-sheet-slide-in {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes action-sheet-slide-out {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
  `;
  document.head.appendChild(s);
}

const ActionSheetContent: React.FC<
  IActionSheetOptions & { onClose: () => void }
> = ({ cancelText, onCancel, onClose, options, title }) => {
  const [exiting, setExiting] = useState(false);

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  const handleOption = (opt: IActionSheetOption) => {
    close();
    setTimeout(() => opt.onClick(), 260);
  };

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  return (
    <>
      <div
        onClick={handleCancel}
        style={{
          animation: exiting
            ? 'action-sheet-overlay-out 0.2s ease forwards'
            : 'action-sheet-overlay-in 0.2s ease forwards',
          background: 'rgba(0,0,0,0.45)',
          inset: 0,
          position: 'fixed',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          animation: exiting
            ? 'action-sheet-slide-out 0.25s ease forwards'
            : 'action-sheet-slide-in 0.25s cubic-bezier(0.32,0.72,0,1) forwards',
          bottom: 0,
          left: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          position: 'fixed',
          right: 0,
          zIndex: 9999,
        }}
      >
        {/* Main group */}
        <div
          style={{
            backdropFilter: 'blur(20px)',
            background: 'var(--bg-card)',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            padding: '8px 0',
          }}
        >
          {title && (
            <div
              style={{
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                padding: '10px 16px 12px',
                textAlign: 'center',
              }}
            >
              {title}
            </div>
          )}
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOption(opt)}
              style={{
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                borderTop:
                  i > 0 || title
                    ? '1px solid var(--border-color)'
                    : 'none',
                color: opt.danger
                  ? 'var(--danger)'
                  : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: 16,
                fontWeight: 500,
                gap: 12,
                justifyContent: 'center',
                padding: '14px 16px',
                width: '100%',
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div style={{ padding: '8px 0 0' }}>
          <button
            onClick={handleCancel}
            style={{
              background: 'var(--bg-card)',
              border: 'none',
              borderRadius: 14,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
              margin: '0 8px',
              padding: '14px 16px',
              width: 'calc(100% - 16px)',
            }}
          >
            {cancelText ?? 'Hủy'}
          </button>
        </div>
      </div>
    </>
  );
};

function unmount() {
  if (sheetRoot) {
    sheetRoot.unmount();
    sheetRoot = null;
  }
  if (sheetEl) {
    sheetEl.remove();
    sheetEl = null;
  }
}

export const actionSheet = (options: IActionSheetOptions) => {
  injectStyles();
  unmount();

  sheetEl = document.createElement('div');
  sheetEl.id = 'action-sheet-root';
  document.body.appendChild(sheetEl);
  sheetRoot = createRoot(sheetEl);
  sheetRoot.render(<ActionSheetContent {...options} onClose={unmount} />);
};
