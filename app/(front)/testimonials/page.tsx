import { Metadata } from 'next'
import { Star, Users, Award, Heart, ShieldCheck } from 'lucide-react'
import Testimonials from '@/components/testimonials/Testimonials'

export const metadata: Metadata = {
  title: 'Customer Testimonials - AetherAvia',
  description: 'Read what our customers say about AetherAvia skincare products. Real reviews from verified buyers sharing their experiences with our natural, cruelty-free beauty solutions.',
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Discover why thousands of customers trust AetherAvia for their skincare journey.
              Real stories from real people who love our natural, cruelty-free products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-6 py-3">
                <Star className="w-5 h-5 text-green-600 fill-current" />
                <span className="font-semibold text-gray-900">4.8/5</span>
                <span className="text-gray-600">Average Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-6 py-3">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">10,000+</span>
                <span className="text-gray-600">Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Testimonials
              title="Customer Reviews & Testimonials"
              items={[
                {
                  id: "review-1",
                  name: "Priya Sharma",
                  role: "Verified Buyer · Mumbai",
                  rating: 5,
                  quote: "AetherAvia has transformed my skincare routine! The natural ingredients make my skin glow, and I love that it's cruelty-free. The packaging is beautiful too - feels premium and eco-friendly."
                },
                {
                  id: "review-2",
                  name: "Rahul Kumar",
                  role: "Verified Buyer · Delhi",
                  rating: 5,
                  quote: "I've tried many skincare brands, but AetherAvia stands out. The products are effective, affordable, and the customer service is exceptional. Highly recommend!"
                },
                {
                  id: "review-3",
                  name: "Anjali Patel",
                  role: "Beauty Enthusiast · Ahmedabad",
                  rating: 5,
                  quote: "As someone with sensitive skin, finding gentle yet effective products was challenging. AetherAvia's natural formulations have been a game-changer. My skin has never looked better!"
                },
                {
                  id: "review-4",
                  name: "Vikram Singh",
                  role: "Verified Buyer · Bengaluru",
                  rating: 4,
                  quote: "Great products with visible results. The delivery was fast and the packaging was secure. Will definitely order again. Only giving 4 stars because I wish there were more product options."
                },
                {
                  id: "review-5",
                  name: "Meera Joshi",
                  role: "Skincare Blogger · Pune",
                  rating: 5,
                  quote: "I love how AetherAvia combines traditional Ayurvedic wisdom with modern science. The results are amazing and I feel good about using products that are kind to my skin and the environment."
                },
                {
                  id: "review-6",
                  name: "Arjun Reddy",
                  role: "Verified Buyer · Hyderabad",
                  rating: 5,
                  quote: "Outstanding quality and fast shipping. The products work as advertised and the scent is divine. AetherAvia has earned a loyal customer in me!"
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Customers Trust AetherAvia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment to quality, transparency, and customer satisfaction has made us a trusted name in natural skincare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Natural</h3>
              <p className="text-gray-600 text-sm">Plant-based ingredients sourced sustainably</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cruelty-Free</h3>
              <p className="text-gray-600 text-sm">PETA certified, never tested on animals</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">Rigorous testing and quality control</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600 text-sm">Dedicated support and satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Thousands of Happy Customers
          </h2>
          <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
            Experience the AetherAvia difference. Natural, effective, and loved by customers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="bg-white hover:bg-green-50 text-green-600 font-semibold px-8 py-4 rounded-lg transition-all"
            >
              Shop Our Products
            </a>
            <a
              href="/about"
              className="border-white border hover:bg-white/10 text-white px-8 py-4 rounded-lg transition-all"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
