"use client";

import React, { useState } from 'react';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Inquiry',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      // Optional: Reset form fields if we wanted to allow multiple messages
      // setFormData({ name: '', email: '', phone: '', subject: 'Product Inquiry', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-surface-container border border-outline-variant/30 p-12 text-center rounded animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">done_all</span>
        </div>
        <h3 className="text-2xl font-headline text-primary mb-4">Message Sent</h3>
        <p className="text-secondary font-body leading-relaxed mb-8">
          Thank you for reaching out, {formData.name || 'Friend'}. Our herbalist team will review your inquiry and get back to you at {formData.email} shortly.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-on-surface font-semibold font-body hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Full Name *</label>
          <input 
            required 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="w-full bg-surface-container font-body border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all py-3 px-4 rounded-t" 
            placeholder="Enter your name" 
            type="text" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Email Address *</label>
          <input 
            required 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className="w-full bg-surface-container font-body border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all py-3 px-4 rounded-t" 
            placeholder="email@example.com" 
            type="email" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Phone Number</label>
          <input 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            className="w-full bg-surface-container font-body border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all py-3 px-4 rounded-t" 
            placeholder="+91 00000 00000" 
            type="tel" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Subject</label>
          <select 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange}
            className="w-full bg-surface-container font-body border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all py-3 px-4 rounded-t"
          >
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Ritual Consultation">Ritual Consultation</option>
            <option value="Order Support">Order Support</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Your Message *</label>
        <textarea 
          required 
          name="message" 
          value={formData.message} 
          onChange={handleChange}
          className="w-full bg-surface-container font-body border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all py-3 px-4 rounded-t resize-y" 
          placeholder="How can we assist you?" 
          rows={4}
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-bold tracking-widest uppercase text-xs transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/10 rounded cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 500" }}>refresh</span>
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
