'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { BlogPost } from '@/types';
import { ArrowUpRight, BookOpen } from 'lucide-react';

export const JournalSection: React.FC = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          setArticles(data.articles.slice(0, 2));
        }
      } catch (err) {
        console.warn('Live articles fetch fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticles();
  }, []);

  return (
    <section className="py-24 bg-brand-navy border-t border-brand-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-brand-gold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Publication Éditoriale</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-brand-travertine font-light">
              Le Regard Villa Regia
            </h2>
          </div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-gold font-bold hover:underline"
          >
            <span>Lire tous les articles</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group glass-card rounded-xl overflow-hidden border border-brand-gold/20 hover:border-brand-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title[language]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-brand-navy/80 backdrop-blur text-brand-gold text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded border border-brand-gold/30">
                  {article.category}
                </div>
              </div>

              <div className="p-8 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-brand-travertine/50 font-mono">
                  <span>{article.author}</span>
                  <span>{article.readTime} de lecture</span>
                </div>

                <h3 className="font-editorial text-2xl text-brand-travertine group-hover:text-brand-gold transition-colors font-light">
                  {article.title[language]}
                </h3>

                <p className="text-xs text-brand-travertine/70 font-light leading-relaxed line-clamp-2">
                  {article.excerpt[language]}
                </p>

                <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold">
                  <span>Lire l’analyse</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
