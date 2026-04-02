/**
 * Session Recovery Helper
 * This utility helps recover from JWT session errors by clearing invalid tokens
 */

export const clearInvalidSession = () => {
  if (typeof window !== 'undefined') {
    // Clear NextAuth cookies
    const cookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ];
    
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
    
    // Clear local storage items that might store auth state
    localStorage.removeItem('nextauth.message');
    sessionStorage.clear();
    
    console.log('[SESSION RECOVERY] Cleared invalid session data');
  }
};

export const isValidSession = (session: any) => {
  if (!session) return false;
  if (!session.user) return false;
  if (!session.user.email) return false;
  
  // Check if token is expired
  if (session.expires) {
    const expiryTime = new Date(session.expires).getTime();
    const currentTime = new Date().getTime();
    if (currentTime >= expiryTime) {
      console.log('[SESSION RECOVERY] Session expired');
      return false;
    }
  }
  
  return true;
};