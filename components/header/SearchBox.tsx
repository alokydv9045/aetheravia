'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import { useState } from 'react';
import useSWR from 'swr';

export const SearchBox = () => {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') ?? '';
  const category = searchParams?.get('category') ?? 'all';
  const router = useRouter();

  const [formCategory, setFormCategory] = useState(category);
  const [formQuery, setFormQuery] = useState(q);

  const {
    data: categories,
    error,
    isLoading,
  } = useSWR('/api/products/categories');

  if (error) return error.message;

  if (isLoading) return <div className='skeleton h-12 w-full max-w-[380px]'></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?category=${formCategory}&q=${formQuery}`);
  };

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <div className='join w-full max-w-full'>
        <select
          name='category'
          defaultValue={formCategory}
          aria-label='Category'
          className='join-item select select-bordered w-[84px] sm:w-[100px]'
          onChange={(e) => setFormCategory(e.target.value)}
        >
          <option value='all'>All</option>
          {categories?.map((c: string) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className='input join-item input-bordered w-36 xs:w-44 sm:w-56 md:w-64 lg:w-72 flex-1'
          placeholder='Search'
          aria-label='Search'
          defaultValue={q}
          name='q'
          onChange={(e) => setFormQuery(e.target.value)}
        />
        <button className='btn join-item input-bordered px-4 min-w-[84px]' type='submit'>
          Search
        </button>
      </div>
    </form>
  );
};
