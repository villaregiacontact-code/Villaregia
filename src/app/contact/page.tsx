'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, MessageCircle, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Acquisition d’un bien');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          source: 'Formulaire Contact',
          universe: 'VENTE',
          propertyTitle: `Demande: ${subject}`,
          message,
        }),
      });
    } catch (err) {
      console.warn('Contact inquiry API error fallback:', err);
    } finally {
      setIsSending(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine">
            Parler à Villa Regia
          </h1>
          <p className="text-sm text-brand-travertine/80 font-light leading-relaxed">
            Notre équipe de conseillers privés est à votre entière disposition pour répondre à vos projets d’acquisition, de location ou de mise en valeur patrimoniale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-8 rounded-xl border border-brand-gold/20 space-y-6">
              <h2 className="font-editorial text-2xl font-light text-brand-travertine">
                Siège Principal — Sfax
              </h2>

              <div className="space-y-4 text-xs text-brand-travertine/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-travertine block">Adresse:</strong>
                    <span>Route de la Soukra, Km 2.5<br />3000 Sfax, Tunisie</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                  <div>
                    <strong className="text-brand-travertine block">Téléphone Privé:</strong>
                    <a href="tel:+21627745405" className="hover:text-brand-gold font-mono">+216 27 745 405</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                  <div>
                    <strong className="text-brand-travertine block">Email:</strong>
                    <a href="mailto:villaregia.contact@gmail.com" className="hover:text-brand-gold">villaregia.contact@gmail.com</a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href="https://wa.me/21627745405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Discussion WhatsApp Directe</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-navy p-8 rounded-xl border border-brand-gold/30 shadow-2xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-editorial text-2xl text-brand-travertine">Message Transmis</h3>
                  <p className="text-xs text-brand-travertine/80 max-w-sm mx-auto">
                    Nous avons bien reçu votre message. Un conseiller Villa Regia vous recontactera très prochainement.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-brand-gold text-brand-navy px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-editorial text-2xl font-light text-brand-travertine mb-4">
                    Formulaire de Contact
                  </h3>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nom & Prénom</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="ex: Sonia Masmoudi" className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Téléphone</label>
                      <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+216 20 000 000" className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Email</label>
                      <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="client@exemple.tn" className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Sujet de votre demande</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold">
                      <option>Acquisition d’un bien</option>
                      <option>Location Résidence ou Villa de luxe</option>
                      <option>Proposer mon bien</option>
                      <option>Événementiel & Mariage</option>
                      <option>Autre renseignement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Votre message</label>
                    <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Détaillez votre projet ou votre question..." className="w-full bg-brand-navy border border-white/20 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold" />
                  </div>

                  <button
                    disabled={isSending}
                    type="submit"
                    className="w-full bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Envoi...' : 'Envoyer mon message'}</span>
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
