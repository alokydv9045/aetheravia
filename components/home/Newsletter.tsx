'use client';

export default function Newsletter() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-headline text-4xl md:text-5xl text-primary mb-8 italic">Stay Grounded.</h2>
        <p className="font-body text-surface-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join our collective to receive artisanal stories, seasonal ritual guides, 
          and exclusive early access to small-batch harvests.
        </p>
        <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            className="flex-grow bg-surface-container border border-outline-variant/30 focus:ring-1 focus:ring-primary rounded-lg font-body text-sm p-4 outline-none transition-all" 
            placeholder="Enter your email" 
            type="email" 
          />
          <button className="px-10 py-4 bg-secondary text-white font-label text-xs uppercase tracking-widest rounded-lg hover:bg-primary transition-all shadow-md">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
