import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface RouteParams {
  role?: 'resident' | 'security' | 'authority' | 'admin';
  section?: string;
  id?: string;
  channel?: string;
  postId?: string;
  subSection?: string;
}

interface RouterContextType {
  path: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  goBack: (fallback?: string) => void;
  params: RouteParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function normalizePath(hash: string): string {
  const clean = hash.replace(/^#/, '').trim();
  if (!clean || clean === '/') return '/resident';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

export function parseRoute(path: string): RouteParams {
  const parts = path.split('/').filter(Boolean);
  const role = (parts[0] || 'resident') as RouteParams['role'];
  
  let defaultSection = 'home';
  if (role === 'security') defaultSection = 'gate';
  else if (role === 'authority') defaultSection = 'work';
  else if (role === 'admin') defaultSection = 'overview';

  const section = parts[1] || defaultSection;
  const third = parts[2];
  const fourth = parts[3];

  const params: RouteParams = {
    role,
    section,
  };

  if (role === 'resident') {
    if (section === 'community') {
      params.channel = third;
      params.postId = fourth;
    } else if (section === 'announcements' || section === 'issues' || section === 'visitors') {
      params.id = third;
    }
  } else if (role === 'authority') {
    if (section === 'issues' || section === 'work') {
      params.id = third;
    }
  } else if (role === 'admin') {
    if (section === 'issues' || section === 'announcements' || section === 'residents') {
      params.id = third;
    }
  } else if (role === 'security') {
    if (section === 'visitors') {
      params.id = third;
    }
  }

  return params;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    return normalizePath(window.location.hash);
  });
  const [historyStack, setHistoryStack] = useState<string[]>([normalizePath(window.location.hash)]);

  useEffect(() => {
    const handleHashChange = () => {
      const current = normalizePath(window.location.hash);
      setPath(current);
      setHistoryStack((prev) => (prev[prev.length - 1] === current ? prev : [...prev, current]));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((targetPath: string, options?: { replace?: boolean }) => {
    const formatted = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    if (options?.replace) {
      window.location.replace(`#${formatted}`);
    } else {
      window.location.hash = formatted;
    }
    setPath(formatted);
    setHistoryStack((prev) => (options?.replace ? [...prev.slice(0, -1), formatted] : [...prev, formatted]));
  }, []);

  const goBack = useCallback((fallback?: string) => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current
      const previous = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      window.location.hash = previous;
      setPath(previous);
    } else if (fallback) {
      navigate(fallback);
    } else {
      const params = parseRoute(path);
      const defaultFallback = params.role ? `/${params.role}` : '/resident';
      navigate(defaultFallback);
    }
  }, [historyStack, path, navigate]);

  const params = parseRoute(path);

  return (
    <RouterContext.Provider value={{ path, navigate, goBack, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return ctx;
};
