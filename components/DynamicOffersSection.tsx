"use client";
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function DynamicOffersSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/offers')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="my-8">Loading offers...</div>;
  if (!data) return null;

  return (
    <div className="my-8 flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Active Popups & Banners</h2>
        {data.popups?.length ? (
          <div className="flex flex-wrap gap-2">
            {data.popups.map((popup: any) => (
              <Badge key={popup._id} variant="outline">
                {popup.title}
              </Badge>
            ))}
          </div>
        ) : (
          <div>No active popups or banners.</div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Flash Sales</h2>
        {data.flashSales?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.flashSales.map((product: any) => (
              <div key={product._id} className="border p-4 rounded-lg">
                <div className="font-bold mb-1">{product.name}</div>
                <div>Discount: {product.discount}%</div>
                <div>Price: {formatPrice(product.price)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No flash sales right now.</div>
        )}
      </div>
    </div>
  );
}
