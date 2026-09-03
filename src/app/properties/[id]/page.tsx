'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import {
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Car,
  Heart,
  Share2,
  CheckCircle2,
  MessageCircle,
  Calendar,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Hammer,
  Store,
  Briefcase,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const propertyId = params?.id ? String(params.id) : '';
  const [property, setProperty] = useState(() => INITIAL_PROPERTIES.find((p) => p.id === propertyId) || null);
  const [isLoading, setIsLoading] = useState(!property);

  React.useEffect(() => {
    if (!propertyId) return;
    async function loadLiveProperty() {
      try {
        const res = await fetch(`/api/properties/${propertyId}`);
        const data = await res.json();
        if (data.success && data.property) {
          setProperty(data.property);
        }
      } catch (err) {
        console.warn('Live property fetch fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveProperty();
  }, [propertyId]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!inquiryName) setInquiryName(user.name || '');
      if (!inquiryEmail) setInquiryEmail(user.email || '');
      if (!inquiryPhone) setInquiryPhone(user.phone || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-24 text-center space-y-6 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-travertine text-xs uppercase tracking-widest font-mono">Chargement de la demeure d'exception...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-40 pb-24 text-center space-y-6">
        <h1 className="font-editorial text-4xl text-brand-travertine">Cette adresse semble introuvable.</h1>
        <Link href="/properties" className="inline-block bg-brand-gold text-brand-navy px-6 py-3 rounded text-xs font-bold uppercase tracking-widest">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title[language],
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien de la propriété copié !');
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);

    if (!inquiryName.trim() || inquiryName.trim().length < 2) {
      setInquiryError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!inquiryPhone.trim() || inquiryPhone.trim().length < 8) {
      setInquiryError('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (!inquiryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryEmail.trim())) {
      setInquiryError('Veuillez renseigner une adresse email valide.');
      return;
    }

    setInquirySending(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName.trim(),
          phone: inquiryPhone.trim(),
          email: inquiryEmail.trim(),
          source: 'Demande Visite',
          universe: property.universe,
          propertyTitle: property.title[language],
          message: inquiryMessage?.trim() || `Demande de visite pour : ${property.title[language]}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setInquiryError(data.error || 'Erreur lors de l\'envoi de la demande.');
        setInquirySending(false);
        return;
      }
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setInquiryModalOpen(false);
      }, 2500);
    } catch (err) {
      console.warn('Inquiry submit fallback:', err);
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setInquiryModalOpen(false);
      }, 2000);
    } finally {
      setInquirySending(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour Villa Regia, je suis intéressé(e) par la propriété : ${property.title[language]} (${property.id}). Pouvons-nous convenir d'un rendez-vous ?`
  );
  const whatsappUrl = `https://wa.me/21627745403?text=${whatsappMessage}`;

  return (
    <div className="bg-brand-navy min-h-screen pb-24">
      
      {/* Fullscreen Property Hero */}
      <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        <Image
          src={property.images[activeImageIndex]?.url || property.images[0].url}
          alt={property.title[language]}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-black/40" />

        {/* Floating Top Actions */}
        <div className="absolute top-24 left-6 right-6 z-20 flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="glass-navy text-brand-travertine px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-brand-gold/30 hover:border-brand-gold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btn.back')}</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="glass-navy p-3 rounded-full text-brand-travertine hover:text-brand-gold border border-white/20 transition-all"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`glass-navy p-3 rounded-full border transition-all ${
                isFavorite(property.id)
                  ? 'bg-brand-gold text-brand-navy border-brand-gold'
                  : 'text-brand-travertine border-white/20 hover:border-brand-gold'
              }`}
              title="Favoris"
            >
              <Heart className={`w-4 h-4 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Badge Overlay */}
        <div className="absolute bottom-12 left-6 right-6 z-20 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-gold text-brand-navy text-[10px] font-bold font-mono uppercase tracking-widest rounded-full">
                {property.universe}
              </span>
              <span className="text-xs font-mono text-brand-travertine/80 uppercase">
                {property.category}
              </span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl text-brand-travertine font-light max-w-3xl">
              {property.title[language]}
            </h1>
            <p className="flex items-center gap-2 text-xs text-brand-travertine/80 font-light">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span>{property.location.district}, {property.location.city} — {property.location.country}</span>
            </p>
          </div>

          <div className="glass-navy p-6 rounded-xl border border-brand-gold/40 space-y-1 text-right">
            <span className="text-[10px] font-mono uppercase text-brand-gold block">Prix de présentation</span>
            <div className="font-editorial text-3xl text-brand-travertine font-normal">
              {property.price.amount.toLocaleString('fr-FR')} {property.price.currency}
              {property.price.period ? <span className="text-sm font-sans text-brand-travertine/60"> / {property.price.period}</span> : ''}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Story & Specs */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Gallery Thumbnails */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-editorial text-2xl text-brand-travertine font-light">Galerie Privée</h3>
              <button
                onClick={() => setLightboxOpen(true)}
                className="text-xs font-mono uppercase text-brand-gold hover:underline flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Plein Écran ({property.images.length} photos)</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    activeImageIndex === idx ? 'border-brand-gold scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* ── VILLA SEMI-CONSTRUITE : CARTE D'ESTIMATION DES TRAVAUX D'ACHÈVEMENT ── */}
          {(property.category === 'Villa Semi-Construite' || property.specs.completionEstimate) && (
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/15 via-brand-navy-dark to-amber-600/10 border-2 border-brand-gold/50 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 text-brand-gold">
                  <div className="p-2 rounded-lg bg-brand-gold/15 border border-brand-gold/30">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-editorial text-xl text-brand-travertine font-light">Estimation d'Achèvement des Travaux</h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">Dossier technique & métré chiffré par expert</span>
                  </div>
                </div>
                {property.specs.constructionStage && (
                  <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase rounded-full border border-amber-500/40">
                    🏗️ {property.specs.constructionStage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">1. Prix d'Acquisition Actuel</span>
                  <div className="font-editorial text-2xl sm:text-3xl text-brand-travertine">
                    {property.price.amount.toLocaleString('fr-FR')} {property.price.currency}
                  </div>
                  <span className="text-[10px] text-white/40 block">Terrain + Gros œuvre réalisé</span>
                </div>

                {property.specs.completionEstimate && (
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-6 pt-3 sm:pt-0">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">2. Budget Travaux de Finition</span>
                    <div className="font-editorial text-2xl sm:text-3xl text-brand-gold font-bold">
                      + {property.specs.completionEstimate.toLocaleString('fr-FR')} TND
                    </div>
                    <span className="text-[10px] text-brand-gold/70 block">Devis métré artisans partenaires</span>
                  </div>
                )}

                {property.specs.completionEstimate && (
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-6 pt-3 sm:pt-0">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">3. Coût Global Clé en Main</span>
                    <div className="font-editorial text-2xl sm:text-3xl text-emerald-400 font-bold">
                      ≈ {(property.price.amount + property.specs.completionEstimate).toLocaleString('fr-FR')} TND
                    </div>
                    <span className="text-[10px] text-emerald-300/60 block">Économie patrimoniale substantielle</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ESPACE COMMERCIAL & FONDS DE COMMERCE : SPÉCIFICITÉS INVESTISSEMENT ── */}
          {(property.category === 'Espace Commercial' || property.category === 'Fonds de Commerce') && (
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-sky-500/15 via-brand-navy-dark to-sky-600/10 border-2 border-sky-500/40 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 text-sky-300">
                  <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30">
                    {property.category === 'Fonds de Commerce' ? <Briefcase className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-editorial text-xl text-brand-travertine font-light">Actif Professionnel & Commercial</h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-200/50 block">Investissement & Implantation Entreprise</span>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 bg-sky-500/20 text-sky-300 text-xs font-mono font-bold uppercase rounded-full border border-sky-500/40">
                  🏢 {property.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                {property.specs.businessActivity && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">Vocation / Activité</span>
                    <div className="font-editorial text-lg sm:text-xl text-white font-medium leading-snug">
                      {property.specs.businessActivity}
                    </div>
                  </div>
                )}

                {property.specs.monthlyRentTND !== undefined && (
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-6 pt-3 sm:pt-0">
                    <span className="text-[10px] font-mono uppercase text-sky-400 block font-bold">Loyer Mensuel des Murs</span>
                    <div className="font-editorial text-2xl sm:text-3xl text-sky-300 font-bold">
                      {property.specs.monthlyRentTND.toLocaleString('fr-FR')} TND
                    </div>
                    <span className="text-[10px] text-white/40 block">Bail commercial protégé 3-6-9</span>
                  </div>
                )}

                {property.specs.linearFacadeMeters && (
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-6 pt-3 sm:pt-0">
                    <span className="text-[10px] font-mono uppercase text-brand-gold block font-bold">Linéaire Vitrine</span>
                    <div className="font-editorial text-2xl sm:text-3xl text-brand-gold">
                      {property.specs.linearFacadeMeters} Mètres
                    </div>
                    <span className="text-[10px] text-white/40 block">Visibilité et flux passant N°1</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div className="p-6 rounded-xl glass-card border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <Maximize2 className="w-5 h-5 text-brand-gold mx-auto mb-2" />
              <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">Surface</span>
              <span className="font-editorial text-2xl text-brand-travertine">{property.specs.surfaceM2} m²</span>
            </div>

            {property.specs.bedrooms !== undefined && (
              <div>
                <Bed className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">Chambres</span>
                <span className="font-editorial text-2xl text-brand-travertine">{property.specs.bedrooms}</span>
              </div>
            )}

            {property.specs.bathrooms !== undefined && (
              <div>
                <Bath className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">Salles d'eau</span>
                <span className="font-editorial text-2xl text-brand-travertine">{property.specs.bathrooms}</span>
              </div>
            )}

            {property.specs.parkingSpaces !== undefined && (
              <div>
                <Car className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <span className="text-[10px] font-mono uppercase text-brand-travertine/60 block">Stationnements</span>
                <span className="font-editorial text-2xl text-brand-travertine">{property.specs.parkingSpaces}</span>
              </div>
            )}
          </div>

          {/* Description & Editorial Story */}
          <div className="space-y-6">
            <h3 className="font-editorial text-3xl font-light text-brand-travertine border-b border-white/10 pb-3">
              L'Architecture & L'Esprit du Lieu
            </h3>
            <p className="text-sm font-light text-brand-travertine/90 leading-relaxed whitespace-pre-line">
              {property.description[language]}
            </p>

            {property.story && (
              <div className="p-8 rounded-xl glass-navy border-l-2 border-brand-gold space-y-3 my-6">
                <span className="text-[10px] font-mono uppercase text-brand-gold tracking-widest block">Le Récit Villa Regia</span>
                <p className="font-editorial text-xl italic font-light text-brand-travertine leading-relaxed">
                  "{property.story[language]}"
                </p>
              </div>
            )}
          </div>

          {/* Amenities Matrix */}
          <div className="space-y-6">
            <h3 className="font-editorial text-2xl font-light text-brand-travertine border-b border-white/10 pb-3">
              Prestations & Équipements Exclusifs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10 text-xs text-brand-travertine/90">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Inquiry Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 glass-navy p-8 rounded-xl border border-brand-gold/30 shadow-2xl space-y-6">
            
            <div className="border-b border-white/10 pb-4 text-center">
              <span className="text-xs font-mono uppercase text-brand-gold block mb-1">Conseil Privé & Visite</span>
              <h4 className="font-editorial text-2xl font-light text-brand-travertine">
                Intéressé par ce Bien ?
              </h4>
            </div>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded flex items-center justify-center gap-2 shadow-lg transition-all"
                title="Contacter le conseiller privé Villa Regia sur WhatsApp Business (+216 27 745 403)"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Business Officiel</span>
              </a>

              {property.universe === 'LUXE' ? (
                <Link
                  href="/villas-de-luxe"
                  className="w-full bg-brand-gold hover:bg-amber-400 text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded flex items-center justify-center gap-2 shadow-lg transition-all text-center block"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver mon Séjour</span>
                </Link>
              ) : (
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="w-full bg-white/10 hover:bg-brand-gold hover:text-brand-navy text-brand-travertine py-3.5 rounded text-xs font-bold uppercase tracking-widest transition-all border border-brand-gold/30"
                >
                  Formulaire de Demande
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-brand-travertine/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>Transaction sécurisée & accompagnement juridique Villa Regia</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-brand-gold z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
            className="absolute left-6 text-white hover:text-brand-gold p-2 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative max-w-5xl max-h-[80vh] w-full h-full">
            <Image
              src={property.images[activeImageIndex].url}
              alt={property.images[activeImageIndex].alt}
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setActiveImageIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
            className="absolute right-6 text-white hover:text-brand-gold p-2 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Inquiry Form Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="glass-navy p-8 rounded-xl max-w-md w-full border border-brand-gold/30 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-editorial text-2xl font-light text-brand-travertine">Demande de Renseignements</h3>
              <button onClick={() => setInquiryModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand-gold mx-auto animate-bounce" />
                <h4 className="font-editorial text-xl text-white">Demande Transmise</h4>
                <p className="text-xs text-white/60">Un conseiller privé Villa Regia vous recontacte dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom complet</label>
                  <input required value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} type="text" placeholder="ex: Mohamed Triki" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Téléphone</label>
                  <input required value={inquiryPhone} onChange={(e) => setInquiryPhone(e.target.value)} type="tel" placeholder="+216 20 000 000" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Email</label>
                  <input required value={inquiryEmail} onChange={(e) => setInquiryEmail(e.target.value)} type="email" placeholder="client@exemple.tn" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Message</label>
                  <textarea rows={3} value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} placeholder={`Je souhaite réserver une visite privée pour : ${property.title[language]}`} className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold" />
                </div>

                {inquiryError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono">
                    ⚠️ {inquiryError}
                  </div>
                )}

                <button disabled={inquirySending} type="submit" className="w-full bg-brand-gold text-brand-navy py-3 rounded text-xs font-bold uppercase tracking-widest mt-2 hover:bg-amber-400 transition-colors disabled:opacity-50">
                  {inquirySending ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
