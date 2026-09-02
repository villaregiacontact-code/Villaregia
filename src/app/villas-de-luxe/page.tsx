'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { Property } from '@/types';
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  Sparkles,
  Shield,
  CreditCard,
  Check,
  Star,
} from 'lucide-react';

export default function LuxuryVillasPage() {
  const { t, language } = useLanguage();

  const [luxuryVillas, setLuxuryVillas] = useState<Property[]>(() =>
    INITIAL_PROPERTIES.filter((p) => p.universe === 'LUXE')
  );
  const [selectedVilla, setSelectedVilla] = useState<Property>(() => luxuryVillas[0] || INITIAL_PROPERTIES[0]);

  React.useEffect(() => {
    async function loadLuxuryVillas() {
      try {
        const res = await fetch('/api/properties?universe=LUXE');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          setLuxuryVillas(data.properties);
          setSelectedVilla((prev: Property) => data.properties.find((p: Property) => p.id === prev?.id) || data.properties[0]);
        }
      } catch (err) {
        console.warn('Luxury villas live fetch fallback:', err);
      }
    }
    loadLuxuryVillas();
  }, []);

  const [checkIn, setCheckIn] = useState<string>('2026-09-10');
  const [checkOut, setCheckOut] = useState<string>('2026-09-14');
  const [guests, setGuests] = useState<number>(4);

  const [bookingStep, setBookingStep] = useState<'IDLE' | 'REVIEW' | 'PAYMENT' | 'CONFIRMED'>('IDLE');

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
  const subtotal = selectedVilla.price.amount * nights;
  const deposit = Math.round(subtotal * 0.3); // 30% deposit
  const total = subtotal;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStep('REVIEW');
  };

  const [guestName, setGuestName] = useState('Kamel Triki');
  const [guestEmail, setGuestEmail] = useState('k.triki@business.tn');
  const [guestPhone, setGuestPhone] = useState('+216 98 123 456');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  const handleConfirmPayment = async () => {
    setIsSavingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedVilla.id,
          propertyTitle: selectedVilla.title[language],
          guestName,
          guestEmail,
          guestPhone,
          checkIn,
          checkOut,
          guestsCount: guests,
          totalNights: nights,
          pricePerNight: selectedVilla.price.amount,
          totalAmount: total,
          depositAmount: deposit,
        }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBookingId(data.booking.id);
      }
    } catch (err) {
      console.warn('Booking API error fallback:', err);
    } finally {
      setIsSavingBooking(false);
      setBookingStep('CONFIRMED');
    }
  };

  return (
    <div className="pt-28 pb-24 bg-brand-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Univers Hospitality & Court Séjour</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-brand-travertine">
            Villas de Luxe & Conciergerie Privée
          </h1>
          <p className="text-sm text-brand-travertine/80 font-light leading-relaxed">
            Passez quelques jours dans un lieu hors du commun. Profitez d’un service d’hospitalité haut de gamme, d’un chef cuisinier sur demande et de piscines à débordement privées à Sfax.
          </p>
        </div>

        {/* Villa Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Select Villa */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-editorial text-2xl font-light text-brand-travertine">
              Choisissez votre Demeure
            </h2>

            <div className="space-y-4">
              {luxuryVillas.map((villa) => (
                <div
                  key={villa.id}
                  onClick={() => setSelectedVilla(villa)}
                  className={`cursor-pointer rounded-xl overflow-hidden glass-card border transition-all p-4 flex flex-col sm:flex-row gap-4 ${
                    selectedVilla.id === villa.id
                      ? 'border-brand-gold bg-brand-navy-light/80 shadow-2xl ring-1 ring-brand-gold'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-full sm:w-48 h-36 rounded-lg overflow-hidden shrink-0">
                    <Image src={villa.images[0].url} alt={villa.title[language]} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-brand-gold block">{villa.location.district}, {villa.location.city}</span>
                      <h3 className="font-editorial text-xl text-brand-travertine">{villa.title[language]}</h3>
                      <p className="text-xs text-brand-travertine/70 line-clamp-2 mt-1">{villa.description[language]}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-xs text-brand-travertine/60">{villa.specs.bedrooms} ch. • Jusqu’à {villa.specs.guestCapacity || 8} invités</span>
                      <span className="font-editorial text-lg text-brand-gold font-normal">
                        {villa.price.amount} TND / nuit
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Custom Luxury Booking Engine */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 glass-navy p-8 rounded-xl border border-brand-gold/30 shadow-2xl space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase text-brand-gold">Moteur de Réservation En Ligne</span>
                <h3 className="font-editorial text-2xl font-light text-brand-travertine mt-1">
                  {selectedVilla.title[language]}
                </h3>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-gold block mb-1">Nombre d’invités</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2.5 text-xs text-white"
                  >
                    {[1, 2, 4, 6, 8, 10, 12].map((g) => (
                      <option key={g} value={g}>{g} Invité(s)</option>
                    ))}
                  </select>
                </div>

                {/* Real-time Pricing Summary */}
                <div className="p-4 rounded bg-brand-navy-dark border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-brand-travertine/70">
                    <span>{selectedVilla.price.amount} TND x {nights} nuit(s)</span>
                    <span>{subtotal} TND</span>
                  </div>
                  <div className="flex justify-between text-brand-gold font-mono font-bold pt-2 border-t border-white/10">
                    <span>Acompte de confirmation (30%)</span>
                    <span>{deposit} TND</span>
                  </div>
                  <div className="flex justify-between text-brand-travertine font-editorial text-xl pt-1">
                    <span>Total du Séjour</span>
                    <span className="text-brand-gold">{total} TND</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl hover:opacity-90 transition-all"
                >
                  Calculer & Continuer la Réservation
                </button>
              </form>

              <div className="flex items-center gap-2 text-[11px] text-brand-travertine/60">
                <Shield className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Paiement de l’acompte sécurisé en ligne via Konnect / ClicToPay</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Booking Review & Payment Simulation Modal */}
      {bookingStep !== 'IDLE' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4">
          <div className="glass-navy p-8 rounded-xl max-w-lg w-full border border-brand-gold/40 shadow-2xl space-y-6">
            
            {bookingStep === 'REVIEW' && (
              <>
                <div className="border-b border-white/10 pb-3">
                  <span className="text-xs font-mono uppercase text-brand-gold">Étape 1/2 — Récapitulatif & Invité</span>
                  <h3 className="font-editorial text-2xl text-brand-travertine">Confirmation de votre Séjour</h3>
                </div>

                <div className="space-y-3 text-xs text-brand-travertine/90">
                  <p><strong>Villa:</strong> {selectedVilla.title[language]}</p>
                  <p><strong>Dates:</strong> Du {checkIn} au {checkOut} ({nights} nuits)</p>
                  <p><strong>Invités:</strong> {guests} personne(s)</p>
                  <p><strong>Montant Total:</strong> {total} TND</p>
                  <p className="text-brand-gold font-bold"><strong>Acompte à régler maintenant:</strong> {deposit} TND</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-mono uppercase text-brand-gold block">Vos Coordonnées</label>
                  <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} type="text" placeholder="Nom complet" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} type="tel" placeholder="Téléphone" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white" />
                    <input required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setBookingStep('IDLE')}
                    className="w-1/2 bg-white/10 text-brand-travertine py-3 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setBookingStep('PAYMENT')}
                    className="w-1/2 bg-brand-gold text-brand-navy py-3 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Procéder au Paiement
                  </button>
                </div>
              </>
            )}

            {bookingStep === 'PAYMENT' && (
              <>
                <div className="border-b border-white/10 pb-3">
                  <span className="text-xs font-mono uppercase text-brand-gold">Étape 2/2 — Passerelle Sécurisée</span>
                  <h3 className="font-editorial text-2xl text-brand-travertine">Paiement de l’Acompte ({deposit} TND)</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded border border-brand-gold/30 bg-brand-navy-dark space-y-2">
                    <span className="text-[10px] font-mono text-brand-gold uppercase block">Passerelle Konnect / Flouci</span>
                    <p className="text-xs text-brand-travertine/70">Paiement crypté SSL par Carte Bancaire Tunisienne ou Internationale.</p>
                  </div>
                  <input type="text" placeholder="Nom sur la carte" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white" defaultValue={guestName} />
                  <input type="text" placeholder="Numéro de carte bancaire" className="w-full bg-brand-navy border border-white/20 rounded px-3 py-2 text-xs text-white" defaultValue="4000 1234 5678 9010" />
                </div>

                <button
                  disabled={isSavingBooking}
                  onClick={handleConfirmPayment}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded shadow-xl transition-all disabled:opacity-50"
                >
                  {isSavingBooking ? 'Validation en cours...' : `Payer l’acompte (${deposit} TND) & Confirmer`}
                </button>
              </>
            )}

            {bookingStep === 'CONFIRMED' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-3xl text-brand-travertine">Réservation Enregistrée</h3>
                {confirmedBookingId && (
                  <span className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-gold text-xs font-mono rounded">
                    RÉF: {confirmedBookingId}
                  </span>
                )}
                <p className="text-xs text-brand-travertine/80 leading-relaxed max-w-sm mx-auto">
                  Votre réservation a été enregistrée avec succès. Notre concierge privé Villa Regia vous contactera sur le {guestPhone} pour valider les détails d'accueil.
                </p>
                <button
                  onClick={() => setBookingStep('IDLE')}
                  className="bg-brand-gold text-brand-navy px-8 py-3 rounded text-xs font-bold uppercase tracking-widest"
                >
                  Fermer
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
