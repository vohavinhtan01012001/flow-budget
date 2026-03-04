import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { TheLoading } from '@/components/shared/TheLoading';
import { AntConfigProvider } from '@/contexts/AntConfigProvider';
import { useAutoSync } from '@/libs/dexie/sync';
import { supabase } from '@/libs/supabase/client';
import { useAuthStore } from '@/stores/auth.store';

import { AppRoutes } from './AppRoutes';

const queryClient = new QueryClient();

const AuthListener: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useAutoSync();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setToken(session.access_token);
        setUser({
          email: session.user.email ?? '',
          id: session.user.id,
        });
      } else if (event === 'SIGNED_OUT') {
        clearSession();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setToken(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [setToken, setUser, clearSession]);

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AntConfigProvider>
        <TheLoading />

        <BrowserRouter>
          <AuthListener>
            <AppRoutes />
          </AuthListener>
        </BrowserRouter>
      </AntConfigProvider>
    </QueryClientProvider>
  );
};
