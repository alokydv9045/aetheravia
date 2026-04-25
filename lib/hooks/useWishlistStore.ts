import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  _id?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  countInStock: number;
};

type Wishlist = {
  items: WishlistItem[];
};

const initialState: Wishlist = {
  items: [],
};

export const wishlistStore = create<Wishlist>()(
  persist(() => initialState, {
    name: 'wishlistStore',
  })
);

export default function useWishlistService() {
  const { items } = wishlistStore();

  return {
    items,
    toggle: (product: WishlistItem) => {
      const exist = items.find((x) => x.slug === product.slug);
      const updatedItems = exist
        ? items.filter((x) => x.slug !== product.slug)
        : [...items, product];
      
      wishlistStore.setState({ items: updatedItems });
      return !exist; // Returns true if added, false if removed
    },
    exists: (slug: string) => items.some((x) => x.slug === slug),
    clear: () => wishlistStore.setState({ items: [] }),
  };
}
