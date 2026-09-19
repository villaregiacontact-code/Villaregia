'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
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

import { getMergedProperties } from '@/lib/clientStorage';

export default function LuxuryVillasPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [luxuryVillas, setLuxuryVillas] = useState<Property[]>(() => {
    const merged = getMergedProperties(INITIAL_PROPERTIES);
    return merged.filter((p) => p.universe === 'LUXE');
  });
  const [selectedVilla, setSelectedVilla] = useState<Property>(() => luxuryVillas[0] || INITIAL_PROPERTIES[0]);
  const [loadingVillas, setLoadingVillas] = useState<boolean>(true);

  React.useEffect(() => {
    async function loadLuxuryVillas() {
      try {
        setLoadingVillas(true);
        const res = await fetch('/api/properties?universe=LUXE');
        const data = await res.json();
        const serverProps = data.success && Array.isArray(data.properties) ? data.properties : [];
        const merged = getMergedProperties(serverProps.length > 0 ? serverProps : INITIAL_PROPERTIES);
        const luxList = merged.filter((p) => p.universe === 'LUXE');
        setLuxuryVillas(luxList);
        setSelectedVilla((prev: Property) => luxList.find((p: Property) => p.id === prev?.id) || luxList[0]);
      } catch (err) {
        console.warn('Luxury villas live fetch fallback:', err);
        const merged = getMergedProperties(INITIAL_PROPERTIES);
        const luxList = merged.filter((p) => p.universe === 'LUXE');
        setLuxuryVillas(luxList);
      } finally {
        setLoadingVillas(false);
      }
    }
    loadLuxuryVillas();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(nextWeekStr);
  const [guests, setGuests] = useState<number>(4);

  const [bookingStep, setBookingStep] = useState<'IDLE' | 'REVIEW' | 'PAYMENT' | 'CONFIRMED'>('IDLE');

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
  const subtotal = (selectedVilla?.price?.amount || 1450) * nights;
  const deposit = Math.round(subtotal * 0.3); // 30% deposit
  const total = subtotal;

  const [dateError, setDateError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    if (!checkIn || !checkOut) {
      setDateError('Veuillez sélectionner vos dates de séjour.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('La date de départ doit être strictement postérieure à la date d’arrivée.');
      return;
    }
    setBookingStep('REVIEW');
  };

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

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
    <div className="pt-28 pb-24 bg-[#FAF8F3] text-[#132339] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B8912E] bg-[#B8912E]/10 border border-[#B8912E]/30 px-3.5 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B8912E]" />
            <span>Univers Hospitality & Court Séjour</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#132339]">
            Villas de Luxe & Conciergerie Privée
          </h1>
          <p className="text-base text-[#2c3f57] font-normal leading-relaxed">
            Passez quelques jours dans un lieu hors du commun. Profitez d’un service d’hospitalité haut de gamme, d’un chef cuisinier sur demande et de piscines à débordement privées à Sfax.
          </p>
        </div>

        {/* Villa Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column: Select Villa */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#132339]">
              Choisissez votre Demeure
            </h2>

            <div className="space-y-4">
              {luxuryVillas.map((villa) => (
                <div
                  key={villa.id}
                  onClick={() => setSelectedVilla(villa)}
                  className={`cursor-pointer rounded-xs overflow-hidden bg-[#FAF8F3] border transition-all p-4 flex flex-col sm:flex-row gap-4 shadow-sm ${
                    selectedVilla.id === villa.id
                      ? 'border-[#B8912E] shadow-xl ring-1 ring-[#B8912E]'
                      : 'border-[rgba(19,35,57,0.14)] opacity-85 hover:opacity-100 hover:border-[#132339]'
                  }`}
                >
                  <div className="relative w-full sm:w-48 h-36 rounded-xs overflow-hidden shrink-0">
                    <Image src={villa.images[0].url} alt={villa.title[language]} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-[#B8912E] block">{villa.location.district}, {villa.location.city}</span>
                      <h3 className="font-serif text-xl font-semibold text-[#132339]">{villa.title[language]}</h3>
                      <p className="text-xs text-[#2c3f57] line-clamp-2 mt-1">{villa.description[language]}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[rgba(19,35,57,0.1)]">
                      <span className="text-xs text-[#2c3f57]">{villa.specs.bedrooms} ch. • Jusqu’à {villa.specs.guestCapacity || 8} invités</span>
                      <span className="font-serif text-lg text-[#132339] font-semibold">
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
            <div className="sticky top-28 bg-[#FAF8F3] p-8 rounded-xs border border-[rgba(19,35,57,0.14)] shadow-xl space-y-6">
              
              <div className="border-b border-[rgba(19,35,57,0.1)] pb-4">
                <span className="text-xs font-semibold uppercase text-[#B8912E]">Moteur de Réservation En Ligne</span>
                <h3 className="font-serif text-2xl font-semibold text-[#132339] mt-1">
                  {selectedVilla.title[language]}
                </h3>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-[#B8912E] block mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[rgba(19,35,57,0.18)] rounded-xs px-3 py-2.5 text-xs text-[#132339]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-[#B8912E] block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[rgba(19,35,57,0.18)] rounded-xs px-3 py-2.5 text-xs text-[#132339]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase text-[#B8912E] block mb-1">Nombre d’invités</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-[#FAF8F3] border border-[rgba(19,35,57,0.18)] rounded-xs px-3 py-2.5 text-xs text-[#132339]"
                  >
                    {[1, 2, 4, 6, 8, 10, 12].map((g) => (
                      <option key={g} value={g}>{g} Invité(s)</option>
                    ))}
                  </select>
                </div>

                {/* Real-time Pricing Summary */}
                <div className="p-4 rounded-xs bg-[#EFE8D8] border border-[rgba(19,35,57,0.14)] space-y-2 text-xs">
                  <div className="flex justify-between text-[#2c3f57]">
                    <span>{selectedVilla.price.amount} TND x {nights} nuit(s)</span>
                    <span>{subtotal} TND</span>
                  </div>
                  <div className="flex justify-between text-[#B15A3C] font-semibold pt-2 border-t border-[rgba(19,35,57,0.1)]">
                    <span>Acompte de confirmation (30%)</span>
                    <span>{deposit} TND</span>
                  </div>
                  <div className="flex justify-between text-[#132339] font-serif text-xl pt-1 font-bold">
                    <span>Total du Séjour</span>
                    <span className="text-[#132339]">{total} TND</span>
                  </div>
                </div>

                {dateError && (
                  <div className="p-3 rounded-xs bg-red-500/10 border border-red-500/30 text-red-700 text-xs">
                    ⚠️ {dateError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#B15A3C] hover:bg-[#97492e] text-[#FAF8F3] font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xs shadow-md transition-all"
                >
                  Calculer & Continuer la Réservation
                </button>
              </form>

              <div className="flex items-center gap-2 text-[11px] text-[#2c3f57]">
                <Shield className="w-4 h-4 text-[#B8912E] shrink-0" />
                <span>Paiement de l’acompte sécurisé en ligne</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Booking Review & Payment Simulation Modal */}
      {bookingStep !== 'IDLE' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] text-[#132339] p-8 rounded-2xl max-w-lg w-full border border-[rgba(19,35,57,0.15)] shadow-2xl space-y-6 relative">
            
            {bookingStep === 'REVIEW' && (
              <>
                <div className="border-b border-[rgba(19,35,57,0.12)] pb-3">
                  <span className="text-xs font-mono uppercase text-[#132339] font-bold">Étape 1/2 — Récapitulatif & Invité</span>
                  <h3 className="font-editorial text-2xl text-[#132339]">Confirmation de votre Séjour</h3>
                </div>

                <div className="space-y-3 text-xs text-[#2c3f57] font-medium bg-white p-4 rounded-xl border border-[rgba(19,35,57,0.1)] shadow-sm">
                  <p><strong className="text-[#132339]">Villa:</strong> {selectedVilla.title[language]}</p>
                  <p><strong className="text-[#132339]">Dates:</strong> Du {checkIn} au {checkOut} ({nights} nuits)</p>
                  <p><strong className="text-[#132339]">Invités:</strong> {guests} personne(s)</p>
                  <p><strong className="text-[#132339]">Montant Total:</strong> {total} TND</p>
                  <p className="text-[#132339] font-bold text-sm"><strong>Acompte à régler maintenant:</strong> {deposit} TND</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[rgba(19,35,57,0.1)]">
                  <label className="text-[10px] font-mono uppercase text-[#132339] block font-bold">Vos Coordonnées (Obligatoires * )</label>
                  <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} type="text" placeholder="Nom complet *" className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} type="tel" placeholder="Téléphone *" className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm" />
                    <input required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" placeholder="Email *" className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm" />
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-mono">
                    ⚠️ {bookingError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setBookingError(null);
                      setBookingStep('IDLE');
                    }}
                    className="w-1/2 bg-[#EFE8D8] text-[#132339] py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#e0d6c3] transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setBookingError(null);
                      if (!guestName.trim() || guestName.trim().length < 2) {
                        setBookingError('Veuillez renseigner votre nom complet.');
                        return;
                      }
                      if (!guestPhone.trim() || guestPhone.trim().length < 8) {
                        setBookingError('Veuillez renseigner un numéro de téléphone valide.');
                        return;
                      }
                      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
                        setBookingError('Veuillez renseigner une adresse email valide.');
                        return;
                      }
                      setBookingStep('PAYMENT');
                    }}
                    className="w-1/2 bg-[#132339] hover:bg-[#1c3250] text-[#FAF8F3] py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                  >
                    Procéder au Paiement
                  </button>
                </div>
              </>
            )}

            {bookingStep === 'PAYMENT' && (
              <>
                <div className="border-b border-[rgba(19,35,57,0.12)] pb-3">
                  <span className="text-xs font-mono uppercase text-[#132339] font-bold">Étape 2/2 — Passerelle Sécurisée</span>
                  <h3 className="font-editorial text-2xl text-[#132339]">Paiement de l’Acompte ({deposit} TND)</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-[rgba(19,35,57,0.15)] bg-[#EFE8D8] space-y-2">
                    <span className="text-[10px] font-mono text-[#132339] uppercase font-bold block">Passerelle Konnect / Flouci</span>
                    <p className="text-xs text-[#2c3f57]">Paiement crypté SSL par Carte Bancaire Tunisienne ou Internationale.</p>
                  </div>
                  <input type="text" placeholder="Nom sur la carte" className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm" defaultValue={guestName} />
                  <input type="text" placeholder="Numéro de carte bancaire" className="w-full bg-white border border-[#132339]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#132339] focus:outline-none focus:border-[#B8912E] shadow-sm" defaultValue="4000 1234 5678 9010" />
                </div>

                <button
                  disabled={isSavingBooking}
                  onClick={handleConfirmPayment}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl transition-all disabled:opacity-50"
                >
                  {isSavingBooking ? 'Validation en cours...' : `Payer l’acompte (${deposit} TND) & Confirmer`}
                </button>
              </>
            )}

            {bookingStep === 'CONFIRMED' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-3xl text-[#132339]">Réservation Enregistrée</h3>
                {confirmedBookingId && (
                  <span className="inline-block px-3 py-1 bg-[#132339] text-[#B8912E] text-xs font-mono rounded-lg font-bold">
                    RÉF: {confirmedBookingId}
                  </span>
                )}
                <p className="text-xs text-[#2c3f57] leading-relaxed max-w-sm mx-auto">
                  Votre réservation a été enregistrée avec succès. Notre concierge privé Villa Regia vous contactera sur le {guestPhone} pour valider les détails d'accueil.
                </p>
                <button
                  onClick={() => setBookingStep('IDLE')}
                  className="bg-[#132339] hover:bg-[#1c3250] text-[#FAF8F3] px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md"
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
