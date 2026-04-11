import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import ProductItems, { ProductItemsSkeleton } from '@/components/products/ProductItems';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Shop - Aetheravia',
  description: 'Discover our complete range of natural, sustainable skincare and body care products.',
};

const ShopPage = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-green-50 to-blue-50 py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Shop Aetheravia
            </h1>
            <p className='text-xl text-gray-700'>
              Discover our complete range of natural, sustainable skincare and body care products
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className='py-8 bg-white border-b border-gray-200'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap justify-center gap-4'>
            <Button variant="default" className='bg-primary hover:bg-black text-white'>
              All Products
            </Button>
            <Button variant="outline" className='border-primary/20 hover:bg-primary/5 text-primary'>
              Face Wash
            </Button>
            <Button variant="outline" className='border-primary/20 hover:bg-primary/5 text-primary'>
              Body Scrub
            </Button>
            <Button variant="outline" className='border-primary/20 hover:bg-primary/5 text-primary'>
              Body Wash
            </Button>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className='py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar Filters */}
            <div className='lg:w-1/4'>
              <div className='bg-gray-50 rounded-lg p-6'>
                <div className='flex items-center gap-2 mb-6'>
                  <Filter className='w-5 h-5 text-gray-600' />
                  <h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
                </div>

                {/* Price Range */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3'>Price Range</h4>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Under ₹500</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>₹500 - ₹1000</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>₹1000 - ₹2000</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Above ₹2000</span>
                    </label>
                  </div>
                </div>

                {/* Skin Type */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3'>Skin Type</h4>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>All Skin Types</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Sensitive Skin</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Dry Skin</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Oily Skin</span>
                    </label>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3'>Key Benefits</h4>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Hydrating</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Anti-Aging</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Brightening</span>
                    </label>
                    <label className='flex items-center'>
                      <input type='checkbox' className='mr-2' />
                      <span className='text-gray-700'>Exfoliating</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className='lg:w-3/4'>
              <div className='flex justify-between items-center mb-6'>
                <p className='text-gray-600'>Showing 12 of 24 products</p>
                <div className='flex items-center gap-4'>
                  <select className='border border-gray-300 rounded-md px-3 py-2 text-gray-700'>
                    <option>Sort by: Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                    <option>Best Rated</option>
                  </select>
                  <div className='flex gap-1'>
                    <Button variant="outline" size="sm">
                      <Grid className='w-4 h-4' />
                    </Button>
                    <Button variant="outline" size="sm">
                      <List className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </div>

              <Suspense fallback={<ProductItemsSkeleton qty={12} name='Products' />}>
                <ProductItems />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Shop by Category
            </h2>
            <p className='text-lg text-gray-600'>
              Find the perfect products for your skincare routine
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🧼</span>
              </div>
              <h3 className='text-xl font-semibold text-primary mb-2'>Face Wash</h3>
              <p className='text-gray-600 mb-4'>Gentle cleansers for all skin types</p>
              <Button variant="outline" size="sm" className='border-primary/20 hover:bg-primary/5 text-primary'>
                Shop Now
              </Button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🫧</span>
              </div>
              <h3 className='text-xl font-semibold text-primary mb-2'>Body Scrub</h3>
              <p className='text-gray-600 mb-4'>Exfoliating scrubs for smooth skin</p>
              <Button variant="outline" size="sm" className='border-primary/20 hover:bg-primary/5 text-primary'>
                Shop Now
              </Button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🧴</span>
              </div>
              <h3 className='text-xl font-semibold text-primary mb-2'>Body Wash</h3>
              <p className='text-gray-600 mb-4'>Nourishing cleansers for daily use</p>
              <Button variant="outline" size="sm" className='border-primary/20 hover:bg-primary/5 text-primary'>
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;