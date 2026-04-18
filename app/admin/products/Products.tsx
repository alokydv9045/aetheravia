'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { Product } from '@/lib/models/ProductModel';
import productService from '@/lib/services/productService';
import { formatId, formatPrice } from '@/lib/utils';

interface ShowColumnsState {
  price: boolean;
  category: boolean;
  stock: boolean;
  rating: boolean;
  status: boolean;
}

export default function Products() {
  const { data: products, error } = useSWR(`/api/admin/products`);
  const [rawSearch, setRawSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showColumns, setShowColumns] = useState<ShowColumnsState>({
    price: true,
    category: true,
    stock: true,
    rating: true,
    status: true,
  });

  // Debounce search input for performance
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const router = useRouter();

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: string } }) => {
      const toastId = toast.loading('Deleting product...');
      const res = await fetch(`${url}/${arg.productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      res.ok
        ? toast.success('Product deleted successfully', { id: toastId })
        : toast.error(data.message, { id: toastId });
    },
  );

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success('Product created successfully');
      router.push(`/admin/products/${data.product._id}`);
    },
  );

  // Unique categories for filter
  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p: Product) => p.category)));
  }, [products]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const term = searchTerm.toLowerCase();
    let filtered = products.filter((product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return b.countInStock - a.countInStock;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Reset to first page on filter changes
  useEffect(() => { setPage(1); }, [searchTerm, selectedCategory, sortBy, pageSize]);

  const handleSelectAll = () => {
    if (selectedProducts.length === paginated.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginated.map((p: Product) => p._id!));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) return;
    if (confirm(`Delete ${selectedProducts.length} selected product(s)?`)) {
      for (const productId of selectedProducts) {
        await deleteProduct({ productId });
      }
      setSelectedProducts([]);
    }
  };

  if (error) return (
    <div className="alert alert-error">
      <span>An error occurred while loading products.</span>
    </div>
  );

  if (!products) return (
    <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
      <span className="loading loading-spinner loading-lg" />
      <p className="text-sm text-base-content/60">Loading products…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
        <div>
          <h1 className='h-fluid'>Products Management</h1>
          <p className="text-base-content/60 mt-1 text-sm">{filteredProducts.length} of {products.length} products • Page {page}/{totalPages}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedProducts.length > 0 && (
            <button onClick={handleBulkDelete} className='btn btn-error btn-sm'>
              <span className="mr-1">🗑️</span> Delete Selected ({selectedProducts.length})
            </button>
          )}
          <button disabled={isCreating} onClick={() => createProduct()} className='btn btn-primary btn-sm'>
            {isCreating && <span className='loading loading-spinner loading-xs'></span>}
            <span className="mr-1">➕</span> Create Product
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-soft p-3"><p className="text-[0.65rem] uppercase tracking-wide text-base-content/50 mb-1">Total</p><div className="value-fluid">{products.length}</div></div>
        <div className="card-soft p-3"><p className="text-[0.65rem] uppercase tracking-wide text-base-content/50 mb-1">Filtered</p><div className="value-fluid text-primary">{filteredProducts.length}</div></div>
        <div className="card-soft p-3"><p className="text-[0.65rem] uppercase tracking-wide text-base-content/50 mb-1">Selected</p><div className="value-fluid text-accent">{selectedProducts.length}</div></div>
        <div className="card-soft p-3"><p className="text-[0.65rem] uppercase tracking-wide text-base-content/50 mb-1">Categories</p><div className="value-fluid text-secondary">{categories.length}</div></div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Search</span></label>
              <input
                type="text"
                placeholder="Search name or brand..."
                className="input input-bordered input-sm"
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
              />
            </div>
            {/* Category */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Category</span></label>
              <select
                className="select select-bordered select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {(categories as string[]).map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Sort By</span></label>
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low→High)</option>
                <option value="stock">Stock (High→Low)</option>
                <option value="rating">Rating (High→Low)</option>
              </select>
            </div>
            {/* Page Size */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Page Size</span></label>
              <select
                className="select select-bordered select-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10,20,50,100].map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
              </select>
            </div>
            {/* Actions */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Actions</span></label>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setRawSearch('');
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('name');
                    setSelectedProducts([]);
                    setPage(1);
                  }}
                >
                  <span className="mr-1">🔄</span> Reset
                </button>
                <details className="dropdown">
                  <summary className="btn btn-outline btn-sm cursor-pointer select-none">Columns ▾</summary>
                  <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-44 text-xs">
                    {Object.entries(showColumns).map(([key, val]) => (
                      <li key={key}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={val}
                            onChange={() => setShowColumns(sc => ({ ...sc, [key]: !sc[key as keyof ShowColumnsState] }))}
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="card bg-base-100 shadow-sm">
        <div className='overflow-x-auto hidden md:block'>
          <table className='table table-zebra text-sm'>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedProducts.length === paginated.length && paginated.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Product Info</th>
                {showColumns.price && <th>Price</th>}
                {showColumns.category && <th>Category</th>}
                {showColumns.stock && <th>Stock</th>}
                {showColumns.rating && <th>Rating</th>}
                {showColumns.status && <th>Status</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product: Product) => (
                <tr key={product._id} className="hover">
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedProducts.includes(product._id!)}
                      onChange={() => handleProductSelect(product._id!)}
                    />
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image src={product.image} alt={product.name} width={48} height={48} className="object-cover" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm line-clamp-2 max-w-[220px]">{product.name}</div>
                        <div className="text-xs opacity-60">{product.brand}</div>
                        <div className="text-[10px] opacity-40">ID: {formatId(product._id!)}</div>
                      </div>
                    </div>
                  </td>
                  {showColumns.price && (
                    <td><div className="font-semibold text-primary">{formatPrice(product.price)}</div></td>
                  )}
                  {showColumns.category && (
                    <td><div className="badge badge-outline badge-sm">{product.category}</div></td>
                  )}
                  {showColumns.stock && (
                    <td>
                      <div className={`badge badge-sm ${product.countInStock > 10 ? 'badge-success' : product.countInStock > 0 ? 'badge-warning' : 'badge-error'}`}>
                        {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                      </div>
                    </td>
                  )}
                  {showColumns.rating && (
                    <td>
                      <div className="flex items-center gap-1">
                        <div className="rating rating-sm">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`mask mask-star-2 w-3 h-3 ${i < Math.floor(product.rating) ? 'bg-warning' : 'bg-base-300'}`} />
                          ))}
                        </div>
                        <span className="text-[11px] ml-1">({product.rating?.toFixed(1)})</span>
                      </div>
                    </td>
                  )}
                  {showColumns.status && (
                    <td>
                      <div className={`badge badge-sm ${product.countInStock > 0 ? 'badge-success' : 'badge-error'}`}>{product.countInStock > 0 ? 'Available' : 'Unavailable'}</div>
                    </td>
                  )}
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product._id}`} className='btn btn-ghost btn-xs' title="Edit Product">✏️</Link>
                      <button onClick={() => deleteProduct({ productId: product._id! })} className='btn btn-ghost btn-xs text-error' title="Delete Product">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginated.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-20">📦</div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-base-content/60">{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by creating your first product.'}</p>
            </div>
          )}
          <div className="flex justify-between items-center p-3 border-t border-base-200 text-xs">
            <div>Showing {(page-1)*pageSize + (paginated.length ? 1 : 0)}-{Math.min(page*pageSize, filteredProducts.length)} of {filteredProducts.length}</div>
            <div className="flex items-center gap-1">
              <button className="btn btn-xs" disabled={page===1} onClick={() => setPage(p => p-1)}>{'<'}</button>
              <span className="px-2">{page}/{totalPages}</span>
              <button className="btn btn-xs" disabled={page===totalPages} onClick={() => setPage(p => p+1)}>{'>'}</button>
            </div>
          </div>
        </div>
        {/* Mobile Cards (Vault System) */}
        <div className="md:hidden space-y-4 p-2">
          {paginated.map((product: Product) => (
            <div key={product._id} className="p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm relative group transition-all hover:bg-white/60">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 border border-primary/5">
                  <Image src={product.image} alt={product.name} width={80} height={80} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-0.5">{product.brand}</div>
                  <div className="font-bold text-sm text-primary leading-tight line-clamp-2">{product.name}</div>
                  <div className="mt-auto flex items-center gap-2">
                    <span className="text-sm font-black text-primary">{formatPrice(product.price)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${product.countInStock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {product.countInStock > 0 ? `${product.countInStock} In Vault` : 'Deteriorated'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary/5">
                <div>
                  <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1">Archive Dept.</div>
                  <div className="text-[10px] font-bold text-gray-600 truncate">{product.category}</div>
                </div>
                <div>
                  <div className="text-[9px] font-label font-bold text-gray-300 uppercase tracking-widest mb-1">Authenticity</div>
                  <div className="flex items-center gap-1">
                    <div className="rating rating-xs">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`mask mask-star-2 w-2 h-2 ${i < Math.floor(product.rating) ? 'bg-primary' : 'bg-base-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{product.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Link href={`/admin/products/${product._id}`} className="flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">Edit Asset</Link>
                <button onClick={() => deleteProduct({ productId: product._id! })} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">Del</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 pb-6 px-4">
            <div className="text-[10px] font-label font-bold text-gray-400 uppercase tracking-widest">Dept. Page {page}/{totalPages}</div>
            <div className="flex gap-2">
              <button className="btn btn-xs rounded-lg border-primary/10 bg-white/50" disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
              <button className="btn btn-xs rounded-lg border-primary/10 bg-white/50" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
