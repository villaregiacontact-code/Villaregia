'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WhatsAppButtonProps {
  propertyTitle?: string;
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  propertyTitle,
  customMessage,
}) => {
  const { t } = useLanguage();

  const phone = '21627745405'; // Villa Regia Sfax official WhatsApp Business contact
  
  const defaultText = propertyTitle
    ? `Bonjour Villa Regia,\nJe souhaite obtenir des informations exclusives concernant le bien : ${propertyTitle}.`
    : customMessage || `Bonjour Villa Regia,\nJe souhaite échanger avec un conseiller privé concernant vos biens d'exception à Sfax.`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultText)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group border border-white/20"
      aria-label="Contacter Villa Regia sur WhatsApp Business (+216 27 745 405)"
      title="Compte WhatsApp Business Officiel — Villa Regia (+216 27 745 405)"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <div className="hidden sm:flex flex-col items-start leading-tight">
        <span className="text-[11px] font-bold uppercase tracking-wider">
          WhatsApp Business
        </span>
        <span className="text-[9px] text-white/90 font-mono">
          +216 27 745 405
        </span>
      </div>
    </a>
  );
};
