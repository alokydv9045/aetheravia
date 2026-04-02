export default function WebhooksPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <p className="opacity-70 text-sm">Configure webhook endpoints and secrets per provider.</p>
      <ul className="list-disc pl-5 text-sm">
        <li>Delivery.com → /api/3pl/webhook/delivery-com</li>
        <li>E‑Cart → /api/3pl/webhook/e-cart</li>
      </ul>
    </div>
  );
}
