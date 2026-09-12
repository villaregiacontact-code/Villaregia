'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_ARTICLES } from '@/data/properties';
import { BlogPost } from '@/types';
import { BookOpen, ArrowUpRight, Sparkles } from 'lucide-react';

export default function JournalPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<BlogPost[]>(INITIAL_ARTICLES);

  useEffect(() => {
    async function loadLiveArticles() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
        }
      } catch (err) {
        console.warn('Live articles fetch fallback:', err);
      }
    }
    loadLiveArticles();
  }, []);

  return (
    <div className="pt-28 pb-24 bg-[#FAF8F3] min-h-screen text-[#132339]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-[#B15A3C] bg-[#B15A3C]/10 px-3 py-1 rounded-full border border-[#B15A3C]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Magazine & Réflexions</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-[#132339]">
            Le Regard Villa Regia
          </h1>
          <p className="text-sm text-[#132339]/80 font-light leading-relaxed">
            Analyses d’architecture, perspectives d’investissement immobilier à Sfax et art de vivre en Méditerranée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#132339]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative w-full h-72 overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title[language]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#132339] text-[#FAF8F3] text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full border border-white/10">
                  {article.category}
                </div>
              </div>

              <div className="p-8 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-[#132339]/60 font-mono">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="font-editorial text-2xl text-[#132339] group-hover:text-[#B15A3C] transition-colors font-light">
                  {article.title[language]}
                </h2>

                <p className="text-xs text-[#132339]/70 font-light leading-relaxed">
                  {article.excerpt[language]}
                </p>

                <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B15A3C]">
                  <span>Lire l’analyse complète</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
