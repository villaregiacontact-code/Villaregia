'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_ARTICLES } from '@/data/properties';
import { BlogPost } from '@/types';
import { ArrowLeft, Clock, Calendar, User, Share2 } from 'lucide-react';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();

  const slug = params?.slug ? String(params.slug) : '';
  const [article, setArticle] = useState<BlogPost | null>(() =>
    INITIAL_ARTICLES.find((a) => a.slug === slug) || INITIAL_ARTICLES[0]
  );
  const [loading, setLoading] = useState(!article);

  useEffect(() => {
    if (!slug) return;
    async function loadSingleArticle() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        const data = await res.json();
        if (data.success && data.article) {
          setArticle(data.article);
        }
      } catch (err) {
        console.warn('Single article live fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSingleArticle();
  }, [slug]);

  if (loading || !article) {
    return (
      <div className="pt-40 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-travertine text-xs uppercase tracking-widest font-mono mt-4">Chargement de l'article...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Journal</span>
        </button>

        <div className="space-y-6 mb-10">
          <span className="text-xs font-mono tracking-widest text-brand-gold uppercase bg-brand-gold/10 px-3 py-1 rounded">
            {article.category}
          </span>

          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine leading-tight">
            {article.title[language]}
          </h1>

          <div className="flex items-center gap-6 text-xs text-brand-travertine/60 font-mono border-y border-white/10 py-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-gold" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-gold" />
              {article.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              {article.readTime}
            </span>
          </div>
        </div>

        <div className="relative w-full h-[450px] rounded-xl overflow-hidden mb-12 glass-card border border-brand-gold/20">
          <Image src={article.coverImage} alt={article.title[language]} fill className="object-cover" />
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-brand-travertine/90 font-light text-sm sm:text-base leading-relaxed">
          <p className="text-lg font-editorial italic text-brand-gold border-l-2 border-brand-gold pl-4 py-1">
            « {article.excerpt[language]} »
          </p>

          <p>
            L’architecture contemporaine à Sfax s’inscrit aujourd’hui dans une double dynamique : honorer l’héritage artisanal sfaxien tout en intégrant les principes d’isolation, de ventilation naturelle et de domotique de luxe.
          </p>

          <h2 className="font-editorial text-3xl text-brand-travertine font-normal pt-4">
            Une valorisation patrimoniale pérenne
          </h2>

          <p>
            Les acquéreurs exigeants recherchent désormais des demeures qui allient des volumes généreux, des matériaux nobles comme le marbre blanc et la pierre naturelle, tout en conservant une discrétion absolue.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
          <Link href="/properties" className="bg-brand-gold text-brand-navy px-6 py-3 rounded text-xs font-bold uppercase tracking-widest">
            Explorer les propriétés associées
          </Link>
        </div>

      </div>
    </div>
  );
}
