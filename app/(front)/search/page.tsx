import { redirect } from 'next/navigation';

export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (q) {
    redirect(`/shop?q=${q}`);
  }
  redirect('/shop');
}
