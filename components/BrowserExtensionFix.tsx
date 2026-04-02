'use client';

import { useEffect } from 'react';

export default function BrowserExtensionFix() {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('cz-shortcut-listen')
      ) {
        return;
      }
      originalError(...args);
    };

    const cleanupAttributes = () => {
      const attrs = ['cz-shortcut-listen', 'data-new-gr-c-s-check-loaded'];
      attrs.forEach(attr => {
        if (document.body.hasAttribute(attr)) {
          document.body.removeAttribute(attr);
        }
      });
    };

    cleanupAttributes();

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
