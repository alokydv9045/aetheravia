import { Metadata } from 'next';
import React from 'react';
import ContactFAQ from './ContactFAQ';
import ContactForm from './ContactForm';
import { shopAddress } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contact Us | Aethravia',
  description: 'Whether you seek guidance on a personalized ritual or have a question about our artisanal ingredients, our archive is open to you.',
};

export default function ContactPage() {
  return (
    <main className="relative pt-24 pb-24 bg-surface text-on-surface overflow-x-hidden antialiased">
      <div 
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          opacity: 0.03,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}
      ></div>

      {/* Hero Header */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-24 relative z-10">
        <h1 className="text-5xl md:text-7xl font-headline tracking-tight text-primary mb-6">Contact Us</h1>
        <p className="text-lg md:text-xl font-body text-secondary max-w-2xl mx-auto leading-relaxed">
          Whether you seek guidance on a personalized ritual or have a question about our artisanal ingredients, our archive is open to you.
        </p>
      </header>

      {/* Contact Cards */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-surface-container-low p-8 transition-all hover:bg-surface-container-high group rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6 text-on-secondary-container">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <h3 className="text-xl font-headline text-primary mb-2">Email Us</h3>
            <p className="text-secondary font-body text-sm mb-4">Expect a response within 24 hours.</p>
            <a className="text-on-surface font-semibold font-body hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4 block" href="mailto:hello@aethravia.com">hello@aethravia.com</a>
          </div>
          {/* Card 2 */}
          <div className="bg-surface-container-low p-8 transition-all hover:bg-surface-container-high group rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6 text-on-secondary-container">
              <span className="material-symbols-outlined">call</span>
            </div>
            <h3 className="text-xl font-headline text-primary mb-2">Call Us</h3>
            <p className="text-secondary font-body text-sm mb-4">Mon-Fri, 9am to 6pm IST.</p>
            <a className="text-on-surface font-semibold font-body hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4 block" href="tel:+910000000000">+91 (800) 123-4567</a>
          </div>
          {/* Card 3 */}
          <div className="bg-surface-container-low p-8 transition-all hover:bg-surface-container-high group rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6 text-on-secondary-container">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <h3 className="text-xl font-headline text-primary mb-2">Visit Us</h3>
            <p className="text-secondary font-body text-sm mb-4">Our Flagship Heritage Store.</p>
            <span className="text-on-surface font-semibold font-body block">{shopAddress}</span>
          </div>
          {/* Card 4 */}
          <div className="bg-surface-container-low p-8 transition-all hover:bg-surface-container-high group rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6 text-on-secondary-container">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <h3 className="text-xl font-headline text-primary mb-2">Business Hours</h3>
            <p className="text-secondary font-body text-sm mb-4 relative z-10 bg-transparent">Weekdays: 09:00 - 18:00</p>
            <p className="text-on-surface font-semibold font-body">Weekends: 10:00 - 16:00</p>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="max-w-7xl mx-auto px-6 mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative z-10">
        {/* Form Column */}
        <div className="bg-surface-container-lowest p-8 md:p-12 shadow-sm rounded-lg border border-outline-variant/20">
          <h2 className="text-3xl font-headline text-primary mb-8">Send us a Message</h2>
          <ContactForm />
        </div>
        
        {/* Map Column */}
        <div className="space-y-12">
          <div className="relative overflow-hidden aspect-[4/3] w-full bg-surface-container shadow-md rounded-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113032.55325510684!2d79.72887649557458!3d28.629199321396866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a1b41f81d1152d%3A0x6b45a0b77b752df7!2sPilibhit%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 bg-surface p-4 shadow-xl rounded pointer-events-none">
              <p className="font-headline text-primary text-lg">Aethravia Heritage</p>
              <p className="text-sm font-body text-secondary">Pilibhit, Uttar Pradesh</p>
            </div>
          </div>
          <div className="space-y-8 pl-4 border-l-2 border-primary/20">
            <div>
              <h4 className="font-headline text-xl text-primary mb-2">Physical Address</h4>
              <p className="text-secondary font-body leading-relaxed">
                {shopAddress}
              </p>
            </div>
            <div>
              <h4 className="font-headline text-xl text-primary mb-2">Parking Info</h4>
              <p className="text-secondary font-body leading-relaxed">
                Complimentary valet parking is available at the front entrance for all patrons visiting the Archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Details & Socials */}
      <section className="max-w-7xl mx-auto px-6 mb-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-surface-container-low p-12 rounded-lg relative z-10 shadow-sm border border-outline-variant/10">
        <div>
          <div className="inline-flex items-center gap-3 text-primary mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-xs font-label uppercase tracking-widest font-bold">Quick Response Guarantee</span>
          </div>
          <h2 className="text-3xl font-headline text-on-surface mb-4 leading-snug">We value your time as much as your skin.</h2>
          <p className="text-secondary font-body leading-relaxed">Our concierge team of herbalists and skincare specialists aims to respond to every inquiry within a single business day.</p>
        </div>
        <div className="flex flex-col md:items-end gap-6">
          <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Follow us on Insta</span>
          <div className="flex gap-4">
            <a 
              className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-on-surface" 
              href="https://www.instagram.com/aeth.ravia/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined">share</span>
            </a>
            <a 
              className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-on-surface" 
              href="https://www.instagram.com/aeth.ravia/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a 
              className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-on-surface" 
              href="https://www.instagram.com/aeth.ravia/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined">play_circle</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Snippet */}
      <section className="max-w-4xl mx-auto px-6 mb-32 relative z-10">
        <h2 className="text-4xl font-headline text-primary text-center mb-12">Frequently Asked Questions</h2>
        <ContactFAQ />
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 relative z-10 mb-8">
        <div className="bg-primary-container p-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden rounded-lg shadow-xl">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-headline text-on-primary-container mb-2">Need Immediate Help?</h2>
            <p className="text-on-primary-container/80 font-body">Our concierge is standing by to assist with urgent order issues.</p>
          </div>
          <a className="relative z-10 px-10 py-4 bg-on-primary-container text-primary font-bold tracking-widest uppercase text-xs hover:bg-surface transition-all flex items-center gap-3 shadow-xl rounded" href="tel:+911234567890">
            <span className="material-symbols-outlined text-sm">phone_in_talk</span>
            Call Now
          </a>
        </div>
      </section>

    </main>
  );
}