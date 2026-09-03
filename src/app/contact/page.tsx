'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, MessageCircle, Send, Check, Instagram, Facebook } from 'lucide-react';

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

              <div className="pt-4 border-t border-white/10 space-y-3">
                <a
                  href="https://wa.me/21627745405?text=Bonjour%20Villa%20Regia%2C%20je%20souhaite%20%C3%A9changer%20avec%20un%20conseiller%20concernant%20vos%20services%20immobiliers."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 shadow-lg transition-all font-mono"
                  title="Ouvrir le compte WhatsApp Business de Villa Regia (+216 27 745 405)"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Business (+216 27 745 405)</span>
                </a>

                {/* Official Social Media Channels */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-brand-travertine/60 text-center mb-2">
                    Réseaux Officiels
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href="https://www.instagram.com/villaregia_/?hl=fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 text-brand-travertine hover:text-white border border-white/10 transition-all text-[11px]"
                      title="Instagram @villaregia_"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span className="font-mono">Instagram</span>
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61572363513663"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-[#1877F2] text-brand-travertine hover:text-white border border-white/10 transition-all text-[11px]"
                      title="Facebook Villa Regia"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span className="font-mono">Facebook</span>
                    </a>
                    <a
                      href="https://www.tiktok.com/@villaregia.tn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-black text-brand-travertine hover:text-white border border-white/10 transition-all text-[11px]"
                      title="TikTok @villaregia.tn"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                      <span className="font-mono">TikTok</span>
                    </a>
                  </div>
                </div>
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
