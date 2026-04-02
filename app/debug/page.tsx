import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  // Disable debug page in production
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }
  
  const session = await auth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status</h2>
          <p>Has Session: {session ? 'Yes' : 'No'}</p>
          <p>Has User: {session?.user ? 'Yes' : 'No'}</p>
          <p>User Email: {session?.user?.email || 'None'}</p>
          <p>Is Admin: {session?.user?.isAdmin ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Raw Session Object</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="space-x-2 space-y-2">
            <a href="/api/admin-setup" className="btn btn-primary" target="_blank">
              Check Admin User
            </a>
            <a href="/signin?callbackUrl=/debug" className="btn btn-secondary">
              Login
            </a>
            <a href="/admin/dashboard" className="btn btn-accent">
              Admin Dashboard
            </a>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">🔧 Debug Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-error">💳 Razorpay Testing</h3>
                <p className="text-sm">Debug payment API issues and configuration</p>
                <div className="card-actions">
                  <a href="/debug/razorpay" className="btn btn-primary btn-sm">
                    Test Configuration
                  </a>
                  <a href="/api/test/razorpay" className="btn btn-outline btn-sm" target="_blank">
                    API Health Check
                  </a>
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-success">🛡️ Security Monitor</h3>
                <p className="text-sm">Real-time security and threat monitoring</p>
                <div className="card-actions">
                  <a href="/admin/test-notifications" className="btn btn-primary btn-sm">
                    Security Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}