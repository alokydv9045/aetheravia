import { Metadata } from 'next';
import { Leaf, Globe, Award, Users, ShieldCheck, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us - Aetheravia',
  description: 'Discover Aetheravia&apos;s story—India&apos;s first earth-based solution for body odor, tan, and fungal skin problems. Clean, science-backed formulations for real results.',
};

const AboutPage = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Our Story
            </h1>
            <p className='text-xl text-gray-700'>
              Clean, high-performance body care without the chemical drama.
              Science-backed solutions for odor, tan, fungal concerns, and bacterial build-up.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Journey */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                How Aetheravia Began
              </h2>
              <div className='space-y-4 text-gray-700'>
                <p className='text-lg'>
                  Aetheravia began in the peak of a harsh summer—a time when I was struggling with extreme sun tan. 
                  College kept me busy, and Sunday was the only day I could think about skincare.
                </p>
                <p>
                  One Sunday, while visiting a friend, her mother asked why I wasn&apos;t treating my sun tan. 
                  I replied: &quot;Even if I start now, it&apos;ll take weeks to fade… and once it fades, the tan will come back again.&quot;
                </p>
                <p>
                  Everyone suggested Multani Mitti, but all I found were harsh soaps, ubtans, and products that didn&apos;t work. 
                  That&apos;s when it hit me: What if there was a product that could reduce sun tan without daily hassles? 
                  Something quick, gentle, and effective I could use every day.
                </p>
                <p>
                  As we worked on effective ingredients, we discovered solutions not just for sun tan, 
                  but also for body odor, fungal issues, and bacterial concerns—real, everyday problems people silently struggle with. 
                  Aetheravia became our mission to build products that are clean, effective, and genuinely helpful.
                </p>
              </div>
            </div>
            <div className='relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-blue-100'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-8xl'>🌿</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Our Mission
            </h2>
            <p className='text-xl text-gray-700 max-w-3xl mx-auto mb-4'>
              To revolutionize India&apos;s body-care standards with effective, clean, 
              dermatologically trustworthy products that deliver actual improvements—not marketing fluff.
            </p>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              Make body care functional, aesthetic, and accessible.
            </p>
            <p className='text-sm text-green-700 font-semibold mt-6 italic'>
              India&apos;s First Earth-Based Solution for Body Odour, Tan &amp; Fungal Skin Problems
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              What Makes Us Unique
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Our commitment to excellence goes beyond just creating products—we&apos;re 
              cultivating a movement toward conscious beauty.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Leaf className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Science-Driven Formulas</h3>
              <p className='text-gray-600'>
                Created to combat odor, tan, and microbial concerns with purposeful, 
                research-backed ingredients.
              </p>
            </div>

            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Globe className='w-8 h-8 text-blue-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Active-Rich Ingredients</h3>
              <p className='text-gray-600'>
                Multani mitti, Reetha, tea tree, minerals, AHAs/BHAs, pumice—only what&apos;s 
                truly sufficient to tackle the concern effectively.
              </p>
            </div>

            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Award className='w-8 h-8 text-purple-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Dermatologically Tested</h3>
              <p className='text-gray-600'>
                Every formula is assessed for skin compatibility. Clean, safe, and 
                backed by rigorous testing protocols.
              </p>
            </div>

            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-8 h-8 text-pink-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Cruelty-Free &amp; Clean</h3>
              <p className='text-gray-600'>
                No harsh chemicals, no shortcuts. Cruelty-free, vegan, and ethically crafted 
                from formulation to final product.
              </p>
            </div>

            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Star className='w-8 h-8 text-yellow-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Visible Results</h3>
              <p className='text-gray-600'>
                Formulated for effectiveness, not trends. Real results you can see and feel.
              </p>
            </div>

            <div className='text-center p-6 bg-white rounded-lg border border-gray-200'>
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <ShieldCheck className='w-8 h-8 text-orange-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Ethically Crafted</h3>
              <p className='text-gray-600'>
                Transparent processes from formulation to final product. We stand by every ingredient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className='py-16 bg-gradient-to-br from-green-50 to-blue-50'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div className='relative h-80 rounded-lg overflow-hidden bg-gradient-to-br from-green-200 to-blue-200'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-32 h-32 bg-white rounded-full flex items-center justify-center'>
                    <Users className='w-16 h-16 text-gray-600' />
                  </div>
                </div>
              </div>
              <div>
                <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                  A Message from Our Founder
                </h2>
                <blockquote className='text-lg text-gray-700 italic mb-6'>
                  &quot;Aetheravia was born from a need—a need for personal care that actually works. 
                  Skincare should be honest, safe, and functional. My goal is to create products that solve 
                  the everyday problems most people don&apos;t talk about: odor, tan, sweat, fungal irritation.&quot;
                </blockquote>
                <p className='text-gray-600 mb-4'>
                  &quot;Aetheravia is not just a brand—it&apos;s a movement towards confident, healthy skin.&quot;
                </p>
                <div className='mt-6'>
                  <p className='font-semibold text-gray-900'>— Arpita Kashyap</p>
                  <p className='text-sm text-gray-600'>Founder, Aetheravia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Commitments */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Our Commitments
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Transparency in ingredients and processes. Safety first. Cruelty-free manufacturing. 
              Clean, effective, purposeful skincare. Zero tolerance for harsh or unsafe chemicals.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4'>
                <Heart className='w-6 h-6 text-pink-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Cruelty-Free</h3>
              <p className='text-gray-600'>
                PETA Cruelty-Free Compliance. Never testing on animals at any stage.
              </p>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
                <Leaf className='w-6 h-6 text-green-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Dermatologist Tested</h3>
              <p className='text-gray-600'>
                Safety first. Every formula assessed for skin compatibility and efficacy.
              </p>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
                <ShieldCheck className='w-6 h-6 text-blue-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Clean Formulations</h3>
              <p className='text-gray-600'>
                Zero harsh chemicals. Only purposeful ingredients. No synthetic shortcuts.
              </p>
            </div>
          </div>

          {/* Certification Logos */}
          <div className='text-center'>
            <h3 className='text-xl font-bold text-gray-900 mb-8'>
              Trusted Certifications
            </h3>
            <div className='flex flex-wrap justify-center items-center gap-8 opacity-60'>
              <div className='w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-xs text-center'>FDA<br/>Registration</span>
              </div>
              <div className='w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-xs text-center'>Dermatologically<br/>Tested</span>
              </div>
              <div className='w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-xs text-center'>PETA<br/>Cruelty-Free</span>
              </div>
              <div className='w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-xs text-center'>Trademark<br/>Certification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Experience Aetheravia?
          </h2>
          <p className='text-xl text-green-50 mb-8 max-w-2xl mx-auto'>
            India&apos;s First Earth-Based Solution for Body Odour, Tan &amp; Fungal Skin Problems.
            Clean, effective, dermatologically trustworthy products.
          </p>
          <Link href='/shop'>
            <Button size="lg" className='bg-white hover:bg-green-50 text-green-600 font-semibold px-8 py-4 text-lg'>
              Shop Our Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;