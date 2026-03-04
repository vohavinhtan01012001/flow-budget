import '@/assets/styles/root/main.scss';
import '@/plugins/react-i18next.plugin';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App.tsx';

const app = createRoot(document.getElementById('root')!);

app.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
