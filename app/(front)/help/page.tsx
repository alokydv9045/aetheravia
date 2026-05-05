import Link from 'next/link'
import { Metadata } from 'next'
import { Mail, Phone, Package, RotateCcw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

import FAQSection from '@/components/footer/FAQ'

export const metadata: Metadata = {
  title: 'Help & Support - AetherAvia',
  description: 'Get help with your AetherAvia orders, account, and shopping experience',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Help & Support
            </h1>
            <p className="text-xl text-gray-700">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/order-history" className="group bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Order</h3>
            <p className="text-gray-600 text-sm">View order status and tracking information</p>
          </Link>

          <Link href="/returns" className="group bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <RotateCcw className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Returns & Exchanges</h3>
            <p className="text-gray-600 text-sm">Start a return or exchange process</p>
          </Link>

          <Link href="/profile" className="group bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600 text-sm">Manage your profile and preferences</p>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <FAQSection />
        </div>

        {/* Contact Support */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-green-50 text-lg">
              Our customer support team is here to help you with any questions or concerns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
              <div className="mb-4">
                <Mail className="w-8 h-8 mx-auto text-green-100" />
              </div>
              <p className="font-semibold text-white mb-2">Email Support</p>
              <a href="mailto:curators@AetherAvia.com" className="text-green-100 hover:text-white">
                curators@AetherAvia.com
              </a>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
              <div className="mb-4">
                <Phone className="w-8 h-8 mx-auto text-green-100" />
              </div>
              <p className="font-semibold text-white mb-2">Phone Support</p>
              <a href="tel:+91-9876543210" className="text-green-100 hover:text-white">
                +91-9876543210
              </a>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-white hover:bg-green-50 text-green-600 font-semibold px-8 py-3 text-lg">
              <Link href="/contact">Contact Support Team</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
