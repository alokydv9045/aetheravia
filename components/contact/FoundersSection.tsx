'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FoundersSection() {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const settings = await res.json();
        const teamSetting = settings.find((s: any) => s.key === 'team_members');
        if (teamSetting && teamSetting.value) {
          setTeam(teamSetting.value);
        }
      } catch (err) {
        console.error('Failed to fetch team settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return null;
  if (!team || (!team.founder?.name && !team.coFounder?.name)) return null;

  return (
    <section className="px-8 md:px-24 py-24 md:py-32 space-y-24 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">Our Leadership</span>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface italic">The Minds Behind the Ritual</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-32">
          {/* Founder */}
          {team.founder?.name && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row gap-20 items-center"
            >
              <div className="lg:w-1/3 relative group">
                <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-2xl transition-all duration-700 group-hover:shadow-primary/5">
                  {team.founder.image ? (
                    <Image 
                      src={team.founder.image} 
                      alt={team.founder.name} 
                      fill 
                      className="object-cover grayscale brightness-90 contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-primary/10">
                      <span className="material-symbols-outlined text-9xl">person</span>
                    </div>
                  )}
                </div>
                {team.founder.quote && (
                  <div className="absolute -bottom-8 -right-8 bg-primary text-on-primary p-8 rounded-lg shadow-xl hidden sm:block max-w-xs transition-transform duration-500 group-hover:-translate-x-2">
                    <p className="font-headline text-lg italic leading-relaxed">"{team.founder.quote}"</p>
                  </div>
                )}
              </div>
              <div className="lg:w-2/3 max-w-2xl">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6 border-b border-outline-variant/20 pb-4 inline-block">A Message from Our Founder</h4>
                {team.founder.bio ? (
                  <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                    "{team.founder.bio}"
                  </blockquote>
                ) : (
                   <p className="text-on-surface-variant leading-relaxed mb-8 italic">No message available.</p>
                )}
                <div>
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">{team.founder.name}</p>
                  <p className="font-body text-on-surface-variant text-xs mt-1 uppercase tracking-widest">{team.founder.title || 'Founder'}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Co-Founder */}
          {team.coFounder?.name && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row-reverse gap-20 items-center"
            >
              <div className="lg:w-1/3 relative group">
                <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-2xl transition-all duration-700 group-hover:shadow-secondary/5">
                  {team.coFounder.image ? (
                    <Image 
                      src={team.coFounder.image} 
                      alt={team.coFounder.name} 
                      fill 
                      className="object-cover grayscale brightness-90 contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-primary/10">
                      <span className="material-symbols-outlined text-9xl">person</span>
                    </div>
                  )}
                </div>
                {team.coFounder.quote && (
                  <div className="absolute -bottom-8 -left-8 bg-secondary text-on-primary p-8 rounded-lg shadow-xl hidden sm:block max-w-xs transition-transform duration-500 group-hover:translate-x-2">
                    <p className="font-headline text-lg italic leading-relaxed">"{team.coFounder.quote}"</p>
                  </div>
                )}
              </div>
              <div className="lg:w-2/3 max-w-2xl lg:text-right">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6 border-b border-outline-variant/20 pb-4 inline-block">A Note from Our Co-Founder</h4>
                {team.coFounder.bio ? (
                  <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                    "{team.coFounder.bio}"
                  </blockquote>
                ) : (
                  <p className="text-on-surface-variant leading-relaxed mb-8 italic">No message available.</p>
                )}
                <div className="lg:flex lg:flex-col lg:items-end">
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">{team.coFounder.name}</p>
                  <p className="font-body text-on-surface-variant text-xs mt-1 uppercase tracking-widest">{team.coFounder.title || 'Co-Founder'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
