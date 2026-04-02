import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Layout = {
  theme: string;
  drawerOpen: boolean;
  /** internal flag to ensure we only run responsive initialization once */
  drawerInitialized: boolean;
};
const initialState: Layout = {
  theme: 'system',
  // Start closed by default; we'll open on large screens client-side.
  drawerOpen: false,
  drawerInitialized: false,
};

export const layoutStore = create<Layout>()(
  persist(
    () => initialState,
    {
      name: 'layoutStore',
      version: 4,
      migrate: (persistedState: any, version) => {
        // v4: Force drawer to start closed for all users
        if (version < 4) {
          return {
            ...persistedState,
            // Force drawer closed regardless of previous preference
            drawerOpen: false,
            drawerInitialized: false, // Reset initialization to apply new behavior
          } as Layout;
        }
        // v2 -> v3: introduce drawerInitialized & change default behavior (mobile closed)
        if (version < 3) {
          return {
            ...persistedState,
            // Preserve existing user preference if it existed; mark initialized so we don't override.
            drawerOpen: persistedState?.drawerOpen ?? initialState.drawerOpen,
            drawerInitialized: true,
          } as Layout;
        }
        return persistedState as Layout; // already up to date
      },
    },
  ),
);

export default function useLayoutService() {
  const { theme, drawerOpen, drawerInitialized } = layoutStore();

  return {
    theme,
    drawerOpen,
    drawerInitialized,
    toggleTheme: () => {
      layoutStore.setState({
        theme: theme === 'dark' ? 'light' : 'dark',
      });
    },
    toggleDrawer: () => {
      layoutStore.setState({
        drawerOpen: !drawerOpen,
      });
    },
    /** Set drawer open state explicitly */
    setDrawerOpen: (open: boolean) => {
      layoutStore.setState({ drawerOpen: open });
    },
    /** Mark initialization complete to avoid repeated responsive recalculations */
    markDrawerInitialized: () => {
      if (!drawerInitialized) layoutStore.setState({ drawerInitialized: true });
    },
  };
}
