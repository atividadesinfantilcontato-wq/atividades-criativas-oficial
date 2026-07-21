import React from 'react';
import { Mail, Instagram, Facebook, Youtube } from 'lucide-react';

interface PromoBarProps {
  promoText?: string;
  contactEmail?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeChannelUrl?: string;
}

export default function PromoBar({
  promoText = 'Materiais pedagógicos digitais para aprender, brincar e criar',
  contactEmail = 'contato@atividadescriativasoficial.com.br',
  instagramUrl = 'https://instagram.com/atividadescriativasoficial',
  facebookUrl = 'https://facebook.com/atividadescriativasoficial',
  youtubeChannelUrl = 'https://youtube.com/atividadescriativasoficial'
}: PromoBarProps) {
  return (
    <div id="promo-bar" className="bg-[#37C76A] text-white py-2 px-4 text-xs md:text-sm font-medium border-b border-[#2ca455]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Promotion Message */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-200 animate-pulse">★</span>
          <span>{promoText}</span>
        </div>

        {/* Contact and Social Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
          <a 
            href={`mailto:${contactEmail}`} 
            className="flex items-center gap-1 hover:text-green-100 transition-colors"
          >
            <Mail size={13} />
            <span className="hidden md:inline">{contactEmail}</span>
            <span className="md:hidden">E-mail</span>
          </a>

          {/* Social icons divide bar */}
          <span className="text-green-200 hidden sm:inline">|</span>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-green-100 transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={14} />
            </a>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-green-100 transition-transform hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook size={14} />
            </a>
            <a 
              href={youtubeChannelUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-green-100 transition-transform hover:scale-110"
              aria-label="YouTube"
            >
              <Youtube size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

