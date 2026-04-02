import { Metadata } from 'next';
import { ChevronDown, Shield, Award, Leaf, Heart, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Ingredients & Craftsmanship - Aetheravia',
  description: 'Discover the natural ingredients and sustainable craftsmanship behind Aetheravia\'s skincare and body care products.',
};

const ingredients = [
  {
    name: 'Aloe Vera',
    benefits: 'Deeply hydrates and soothes irritated skin',
    sourcing: 'Organically grown in sustainable farms in Rajasthan, India',
    icon: '🌿'
  },
  {
    name: 'Green Tea Extract',
    benefits: 'Rich in antioxidants, fights signs of aging',
    sourcing: 'Fair-trade certified gardens in Darjeeling',
    icon: '🍃'
  },
  {
    name: 'Coconut Oil',
    benefits: 'Natural moisturizer with antimicrobial properties',
    sourcing: 'Cold-pressed from sustainable Kerala coconuts',
    icon: '🥥'
  },
  {
    name: 'Turmeric',
    benefits: 'Anti-inflammatory, brightens skin naturally',
    sourcing: 'Ethically sourced from Tamil Nadu farmers',
    icon: '🌺'
  },
  {
    name: 'Rose Water',
    benefits: 'Tones and refreshes, suitable for all skin types',
    sourcing: 'Steam-distilled from Kannauj roses',
    icon: '🌹'
  },
  {
    name: 'Neem',
    benefits: 'Purifies and protects against bacteria',
    sourcing: 'Sustainably harvested from Gujarat',
    icon: '🌳'
  }
];

const certifications = [
  {
    name: 'PETA Certified',
    description: '100% cruelty-free, never tested on animals',
    icon: <Heart className='w-8 h-8 text-pink-600' />
  },
  {
    name: 'Organic Certified',
    description: 'USDA Organic certified ingredients',
    icon: <Leaf className='w-8 h-8 text-green-600' />
  },
  {
    name: 'FDA Approved',
    description: 'All products meet FDA safety standards',
    icon: <ShieldCheck className='w-8 h-8 text-blue-600' />
  },
  {
    name: 'Fair Trade',
    description: 'Ethically sourced from certified suppliers',
    icon: <Award className='w-8 h-8 text-purple-600' />
  },
  {
    name: 'Dermatologist Tested',
    description: 'Clinically tested for safety and efficacy',
    icon: <Shield className='w-8 h-8 text-teal-600' />
  },
  {
    name: 'Eco-Friendly',
    description: 'Sustainable packaging and processes',
    icon: <CheckCircle className='w-8 h-8 text-emerald-600' />
  }
];

const IngredientsPage = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Ingredients & Craftsmanship
            </h1>
            <p className='text-xl text-gray-700'>
              Transparency, quality, and sustainability in every formula
            </p>
          </div>
        </div>
      </section>

      {/* Ingredient Transparency */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Nature&apos;s Finest Ingredients
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              We believe in complete transparency. Every ingredient in our products 
              is carefully selected for its proven benefits and sustainable sourcing.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {ingredients.map((ingredient, index) => (
              <div key={index} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
                <div className='text-center mb-4'>
                  <div className='text-4xl mb-2'>{ingredient.icon}</div>
                  <h3 className='text-xl font-bold text-gray-900'>{ingredient.name}</h3>
                </div>
                
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-1'>Benefits:</h4>
                    <p className='text-gray-600 text-sm'>{ingredient.benefits}</p>
                  </div>
                  
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-1'>Sourcing:</h4>
                    <p className='text-gray-600 text-sm'>{ingredient.sourcing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Don't Use */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              What We Don&apos;t Use
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Our commitment to clean beauty means avoiding harmful chemicals and additives.
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto'>
            {[
              'Parabens',
              'Sulfates',
              'Synthetic Fragrances',
              'Phthalates',
              'Formaldehyde',
              'Mineral Oil',
              'Artificial Dyes',
              'Triclosan'
            ].map((item, index) => (
              <div key={index} className='bg-white rounded-lg p-4 text-center border border-red-200'>
                <div className='text-red-500 text-2xl mb-2'>❌</div>
                <p className='text-gray-900 font-medium'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Process */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Our Craftsmanship Process
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              From sourcing to packaging, every step is carefully controlled 
              to ensure the highest quality and sustainability standards.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🌱</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>1. Sourcing</h3>
              <p className='text-gray-600'>
                Carefully selected ingredients from trusted, sustainable suppliers
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🧪</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>2. Formulation</h3>
              <p className='text-gray-600'>
                Expert chemists create effective, gentle formulas in small batches
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🔬</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>3. Testing</h3>
              <p className='text-gray-600'>
                Rigorous safety and efficacy testing without animal testing
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>📦</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>4. Packaging</h3>
              <p className='text-gray-600'>
                Eco-friendly packaging that protects product integrity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Trusted Certifications
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              All products are rigorously tested and certified for safety and efficacy. 
              Our certifications reflect our commitment to quality and ethics.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {certifications.map((cert, index) => (
              <div key={index} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center'>
                <div className='flex justify-center mb-4'>
                  {cert.icon}
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>{cert.name}</h3>
                <p className='text-gray-600'>{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                Quality Assurance Promise
              </h2>
              <div className='space-y-4 text-gray-700'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                  <p>Every batch is tested for purity, potency, and safety</p>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                  <p>Climate-controlled manufacturing environments</p>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                  <p>Third-party testing and certification</p>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                  <p>Full traceability from source to shelf</p>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
                  <p>Continuous improvement based on customer feedback</p>
                </div>
              </div>
            </div>
            <div className='relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-blue-100'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-8xl'>🔬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className='py-16 bg-gray-900 text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-8'>
            Trusted by Thousands
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-8'>
            <div>
              <div className='text-3xl font-bold text-green-400'>100%</div>
              <p className='text-gray-300'>Natural Ingredients</p>
            </div>
            <div>
              <div className='text-3xl font-bold text-blue-400'>0</div>
              <p className='text-gray-300'>Animal Testing</p>
            </div>
            <div>
              <div className='text-3xl font-bold text-purple-400'>50+</div>
              <p className='text-gray-300'>Botanical Extracts</p>
            </div>
            <div>
              <div className='text-3xl font-bold text-pink-400'>5★</div>
              <p className='text-gray-300'>Customer Rating</p>
            </div>
          </div>
          <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
            Experience the difference that transparency and quality make 
            in your skincare routine.
          </p>
          <Button size="lg" className='bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg'>
            Shop Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default IngredientsPage;