'use client';

import React from 'react';

export const JournalSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Vous décrivez votre projet',
      desc: 'Achat, location, ou événement — un formulaire court adapté à votre besoin exact.',
    },
    {
      num: '02',
      title: 'Un conseiller Villa Regia vous répond',
      desc: 'Par WhatsApp ou téléphone, avec une sélection de biens correspondant à vos critères.',
    },
    {
      num: '03',
      title: 'Visite ou réservation',
      desc: 'Visite physique ou virtuelle, puis réservation et acompte sécurisé en ligne si besoin.',
    },
    {
      num: '04',
      title: 'Signature et suivi',
      desc: 'Contrat, remise des clés ou du bien, et suivi après-vente ou après-séjour.',
    },
  ];

  return (
    <section className="bg-[#EFE8D8] py-20 sm:py-24 text-[#132339]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
        
        {/* Left Title */}
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#132339] max-w-[12ch] leading-tight">
            Comment ça se passe avec nous
          </h2>
        </div>

        {/* Right Step List */}
        <div className="flex flex-col">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`grid grid-cols-[50px_1fr] sm:grid-cols-[70px_1fr] gap-5 py-6 border-t border-[#E1D6BC] ${
                idx === steps.length - 1 ? 'border-b border-[#E1D6BC]' : ''
              }`}
            >
              <div className="font-serif text-2xl sm:text-3xl text-[#B15A3C] font-semibold">
                {step.num}
              </div>
              <div>
                <h4 className="font-sans text-base sm:text-lg font-semibold text-[#132339] mb-1.5">
                  {step.title}
                </h4>
                <p className="text-sm text-[#2c3f57] max-w-[52ch] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

