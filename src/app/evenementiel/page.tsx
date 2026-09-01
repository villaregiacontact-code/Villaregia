'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Calendar, Users, CheckCircle, Send, Check } from 'lucide-react';

export default function EventsPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const [eventType, setEventType] = useState('Mariage');
  const [guestCount, setGuestCount] = useState(250);
  const [eventDate, setEventDate] = useState('2026-10-15');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Univers Événementiel & Mariages</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine">
            Des lieux pour créer des souvenirs.
          </h1>
          <p className="text-sm text-brand-travertine/80 font-light leading-relaxed">
            Organisez vos mariages d’exception, soirées de gala, séminaires de prestige et shootings photo dans nos domaines privés à Sfax.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Visual Presentation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden glass-card border border-brand-gold/30">
              <Image
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85"
                alt="Domaine Événementiel Villa Regia Sfax"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-brand-travertine">
                <span className="text-[10px] font-mono uppercase text-brand-gold block">Domaine Palm Grove Sfax</span>
                <h3 className="font-editorial text-2xl font-light">Capacité jusqu'à 450 invités</h3>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-editorial text-2xl font-light text-brand-travertine">Prestations Incluses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Esplanade en marbre extérieur',
                  'Éclairage d\'ambiance architectural',
                  'Cuisine professionnelle traiteur',
                  'Parking privé 120 véhicules',
                  'Loge nuptiale VIP privée',
                  'Sécurité & gardiennage 24/7',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded glass-card border border-white/5">
                    <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
                    <span className="text-xs text-brand-travertine/90 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Event Quote Request Form */}
          <div className="lg:col-span-6">
            <div className="glass-navy p-8 rounded-xl border border-brand-gold/30 shadow-2xl space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase text-brand-gold">Formulaire de Devis Sur Mesure</span>
                <h3 className="font-editorial text-2xl font-light text-brand-travertine mt-1">
                  Demande d’Événement Privé
                </h3>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-editorial text-2xl text-brand-travertine">Demande Transmise</h4>
                  <p className="text-xs text-brand-travertine/80 leading-relaxed max-w-sm mx-auto">
                    Votre demande a bien été transmise au département événementiel de Villa Regia. Notre chargé d’événements vous recontactera sous 24 heures.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-brand-gold text-brand-navy px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest"
                  >
                    Nouvelle Demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Type d’événement</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Mariage">Mariage & Réception</option>
                      <option value="Réception Privée">Soirée Privée / Anniversaire</option>
                      <option value="Séminaire Enterprise">Séminaire d'Entreprise / Gala</option>
                      <option value="Shooting Photo">Shooting Photo & Média</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nombre d’invités</label>
                      <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Date souhaitée</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom complet</label>
                    <input
                      required
                      type="text"
                      placeholder="ex: Yassine Karray"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Téléphone</label>
                      <input
                        required
                        type="tel"
                        placeholder="+216 20 123 456"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="client@domaine.tn"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Précisions ou demandes particulières</label>
                    <textarea
                      rows={3}
                      placeholder="Service traiteur, scénographie, installation..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer la demande de devis</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
