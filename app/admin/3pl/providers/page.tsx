import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '3PL Providers',
  description: 'Manage integrated logistics providers',
};

const providers = [
  { key: 'DELIVERY_COM', name: 'Delivery.com', status: 'active' },
  { key: 'E_CART', name: 'E‑Cart', status: 'active' },
];

export default function ProvidersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Providers</h1>
      <p className="opacity-70 text-sm">Configured third‑party logistics providers.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {providers.map((p) => (
          <div key={p.key} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">{p.name}</h3>
                  <p className="text-xs opacity-60">Key: {p.key}</p>
                </div>
                <div className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>{p.status}</div>
              </div>
              <div className="mt-3 text-sm opacity-80">
                Webhook: <code className="kbd kbd-sm">/api/3pl/webhook/{p.key === 'DELIVERY_COM' ? 'delivery-com' : 'e-cart'}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
