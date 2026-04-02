"use client";
import { useEffect } from 'react';
import useLayoutService from '@/lib/hooks/useLayout';

/**
 * This component runs once on the client to set an appropriate initial drawer state:
 * - Keep drawer closed by default on all devices
 * - User must click the toggle button to open the drawer
 */
const ResponsiveDrawerInit = () => {
  const { drawerInitialized, markDrawerInitialized, setDrawerOpen } = useLayoutService();

  useEffect(() => {
    // One-time clear of old layout preferences to ensure new behavior
    const hasCleared = localStorage.getItem('drawer-behavior-updated');
    if (!hasCleared) {
      localStorage.removeItem('layoutStore');
      localStorage.setItem('drawer-behavior-updated', 'true');
    }
    
    if (drawerInitialized) return; // respect persisted preference
    // Always start with drawer closed, regardless of screen size
    setDrawerOpen(false);
    markDrawerInitialized();
  }, [drawerInitialized, markDrawerInitialized, setDrawerOpen]);

  return null; // no UI
};

export default ResponsiveDrawerInit;
