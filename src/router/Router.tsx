import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppRoleRoute = 'resident' | 'security' | 'authority' | 'admin';

export interface RouteParams {
  role?: AppRoleRoute;
  section?: string;
  id?: string;
  channel?: string;
  postId?: string;
  subSection?: string;
  isUnknownRoute?: boolean;
  isPublic?: boolean;
}

interface RouterContextType {
  path: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  goBack: (fallback?: string) => void;
  params: RouteParams;
  isAllowedForRole: (userRole: string, targetPath?: string) => boolean;
  isPublicRoute: (targetPath?: string) => boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Explicit registry of valid roles and their registered primary sections
export const ROUTE_REGISTRY: Record<AppRoleRoute, string[]> = {
  resident: [
    'home',
    'community',
    'announcements',
    'issues',
    'visitors',
    'profile',
    'notifications',
  ],
  security: [
    'gate',
    'visitors',
    'history',
    'alerts',
    'profile',
  ],
  authority: [
    'work',
    'issues',
    'notifications',
    'profile',
  ],
  admin: [
    'overview',
    'issues',
    'residents',
    'announcements',
    'security',
    'more',
  ],
};

const PUBLIC_SECTIONS = ['home', 'chat', 'announcements', 'login', 'register'];

function normalizePath(hash: string): string {
  const clean = hash.replace(/^#/, '').trim();
  if (!clean || clean === '/') return '/home';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

export function parseRoute(path: string): RouteParams {
  const parts = path.split('/').filter(Boolean);
  const firstSegment = parts[0];

  const validRoles: AppRoleRoute[] = ['resident', 'security', 'authority', 'admin'];
  if (!firstSegment || !validRoles.includes(firstSegment as AppRoleRoute)) {
    // Public guest routes live under top-level public sections only.
    if (firstSegment && PUBLIC_SECTIONS.includes(firstSegment)) {
      const section = firstSegment;
      const id =
        firstSegment === 'announcements' && parts.length >= 2
          ? parts[1]
          : undefined;
      return {
        isPublic: true,
        section,
        id,
        isUnknownRoute: false,
      };
    }

    return {
      role: 'resident',
      section: 'home',
      isUnknownRoute: Boolean(firstSegment && !PUBLIC_SECTIONS.includes(firstSegment)),
    };
  }

  const role = firstSegment as AppRoleRoute;
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
    isUnknownRoute: false,
  };

  if (role === 'resident') {
    if (section === 'community') {
      params.channel = third;
      params.postId = fourth;
    } else if (section === 'announcements' || section === 'issues' || section === 'visitors') {
      if (third === 'activity') {
        params.subSection = 'activity';
      } else {
        params.id = third;
      }
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

export function checkRoleAllowed(userRole: string, targetPath: string): boolean {
  const params = parseRoute(targetPath);
  if (!params.role && !params.isPublic) return true;

  // Public guest pages never require a role.
  if (params.isPublic) return true;

  if (!params.role) return true;

  if (userRole === 'rwa_admin') {
    return true; // Admin has oversight access across the platform
  }

  if (params.role === 'resident') {
    return userRole === 'resident';
  }

  if (params.role === 'security') {
    return userRole === 'security_guard';
  }

  if (params.role === 'authority') {
    return ['water_worker', 'electrical_worker', 'sanitation_worker', 'maintenance_worker'].includes(userRole);
  }

  if (params.role === 'admin') {
    return userRole === 'rwa_admin';
  }

  return false;
}

export function checkPublicRoute(targetPath: string): boolean {
  const parsed = parseRoute(targetPath);
  return Boolean(parsed.isPublic);
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

  const isAllowedForRole = useCallback((userRole: string, targetPath?: string) => {
    return checkRoleAllowed(userRole, targetPath || path);
  }, [path]);

  const isPublicRoute = useCallback((targetPath?: string) => {
    return checkPublicRoute(targetPath || path);
  }, [path]);

  return (
    <RouterContext.Provider value={{ path, navigate, goBack, params, isAllowedForRole, isPublicRoute }}>
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
