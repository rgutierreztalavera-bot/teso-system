import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PlusCircle, SearchCheck, SlidersHorizontal, MessageSquareMore } from 'lucide-react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';
import { useSettings } from '../contexts/SettingsContext';

interface PRLPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onSelectCentros: () => void;
  onOpenIA: () => void;
  onOpenConfiguracion?: () => void;
}

// Custom SVG for Emergency Exit (Modern Signboard Style)
const EmergencyExitIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 text-white" fill="currentColor">
    <rect x="5" y="20" width="90" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="32" cy="40" r="6" />
    <path d="M32 48 L27 65 L32 78 H40 L36 65 L44 55 V48 Z" />
    <path d="M27 65 L17 78 H25 L33 65 Z" />
    <path d="M50 50 H70 L63 43 M70 50 L63 57" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M80 35 H90 V65 H80 V35" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="83" cy="50" r="1.5" />
  </svg>
);

// Custom SVG for Safety Helmet (EPIs) - 3/4 Perspective Professional 3D White Style
const SafetyHelmetIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md">
    <defs>
      <linearGradient id="helmet3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#F8F8F8" />
        <stop offset="100%" stopColor="#D1D1D1" />
      </linearGradient>
      <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E0E0E0" />
        <stop offset="100%" stopColor="#BDBDBD" />
      </linearGradient>
    </defs>
    <path d="M30 65 L35 88 C40 92 60 92 65 88 L70 65" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <rect x="46" y="86" width="8" height="3" rx="1" fill="#222" opacity="0.8" />
    <path d="M15 65 C15 20 85 20 85 65 L90 70 H10 L15 65" fill="url(#helmet3DGrad)" />
    <path d="M85 65 L98 72 L70 80 L10 70 L15 65 Z" fill="url(#visorGrad)" />
    <path d="M85 65 L98 72 L90 73 L80 67 Z" fill="#FFFFFF" opacity="0.4" />
    <path d="M35 35 C45 22 75 22 80 45 L72 48 C68 32 45 32 38 48 Z" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
    <circle cx="50" cy="30" r="1.2" fill="#999" opacity="0.5" />
    <circle cx="25" cy="62" r="1.5" fill="#999" opacity="0.5" />
    <circle cx="75" cy="62" r="1.5" fill="#999" opacity="0.5" />
    <path d="M25 45 C35 30 60 25 80 40" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    <path d="M40 28 C50 24 70 24 75 30" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
    <path d="M25 68 Q50 75 75 68" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

// Custom SVG for Communication (Speech Bubble) - Elongated White Oval with Dots
const CommunicationIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 text-white" fill="currentColor">
    <ellipse cx="50" cy="45" rx="42" ry="28" />
    <path d="M30 68 L15 85 L45 72 Z" />
    <circle cx="35" cy="45" r="3.5" fill="black" />
    <circle cx="50" cy="45" r="3.5" fill="black" />
    <circle cx="65" cy="45" r="3.5" fill="black" />
  </svg>
);

// Custom SVG for Reports (Document) - Realistic White Paper
const ReportsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm">
    <defs>
      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F0F0F0" />
      </linearGradient>
    </defs>
    <path d="M25 15 H65 L80 30 V85 H25 Z" fill="url(#paperGrad)" stroke="#DDD" strokeWidth="1" />
    <path d="M65 15 V30 H80 Z" fill="#E0E0E0" stroke="#CCC" strokeWidth="0.5" />
    <rect x="35" y="40" width="35" height="3" rx="1.5" fill="#BBB" opacity="0.5" />
    <rect x="35" y="50" width="35" height="3" rx="1.5" fill="#BBB" opacity="0.5" />
    <rect x="35" y="60" width="25" height="3" rx="1.5" fill="#BBB" opacity="0.5" />
    <rect x="35" y="75" width="10" height="3" rx="1.5" fill="#228B22" opacity="0.4" />
  </svg>
);

// Custom SVG for Calendar - Realistic Style
const CalendarIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm">
    <defs>
      <linearGradient id="calGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F0F0F0" />
      </linearGradient>
      <linearGradient id="calHeader" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF4B4B" />
        <stop offset="100%" stopColor="#D32F2F" />
      </linearGradient>
    </defs>
    <rect x="20" y="25" width="60" height="60" rx="8" fill="url(#calGrad)" stroke="#DDD" strokeWidth="1" />
    <rect x="20" y="25" width="60" height="20" rx="8" fill="url(#calHeader)" />
    <path d="M20 45 H80 V35 H20 Z" fill="url(#calHeader)" />
    <rect x="30" y="15" width="6" height="15" rx="3" fill="#E0E0E0" stroke="#999" strokeWidth="1" />
    <rect x="64" y="15" width="6" height="15" rx="3" fill="#E0E0E0" stroke="#999" strokeWidth="1" />
    <circle cx="33" cy="22" r="1.5" fill="#555" />
    <circle cx="67" cy="22" r="1.5" fill="#555" />
    
    <rect x="30" y="55" width="10" height="10" rx="2" fill="#E0E0E0" />
    <rect x="45" y="55" width="10" height="10" rx="2" fill="#E0E0E0" />
    <rect x="60" y="55" width="10" height="10" rx="2" fill="#E0E0E0" />
    <rect x="30" y="70" width="10" height="10" rx="2" fill="#E0E0E0" />
    <rect x="45" y="70" width="10" height="10" rx="2" fill="#FF4B4B" opacity="0.8" />
    <rect x="60" y="70" width="10" height="10" rx="2" fill="#E0E0E0" />
  </svg>
);

// Custom SVG for Fire Extinguisher - Professional 3D-ish Dark Maroon Style
const FireExtinguisherIcon = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md">
    <defs>
      <linearGradient id="extinguisherGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B0000" />
        <stop offset="50%" stopColor="#A52A2A" />
        <stop offset="100%" stopColor="#800000" />
      </linearGradient>
      <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E0E0E0" />
        <stop offset="100%" stopColor="#999" />
      </linearGradient>
    </defs>
    {/* Body */}
    <path d="M35 30 H65 V85 C65 90 35 90 35 85 Z" fill="url(#extinguisherGrad)" />
    <rect x="35" y="35" width="30" height="5" fill="#000" opacity="0.1" />
    <rect x="35" y="70" width="30" height="5" fill="#000" opacity="0.1" />
    {/* Top Part */}
    <path d="M42 22 L58 22 L62 30 L38 30 Z" fill="url(#metalGrad)" />
    <rect x="48" y="15" width="4" height="8" fill="#444" />
    <path d="M45 15 H55 L60 10 H40 Z" fill="#333" />
    {/* Hose */}
    <path d="M62 25 Q80 25 80 50 V75" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
    <rect x="76" y="75" width="8" height="10" rx="2" fill="#222" />
    {/* Label */}
    <rect x="40" y="45" width="20" height="15" rx="1" fill="white" opacity="0.9" />
    <rect x="43" y="48" width="14" height="1.5" fill="#8B0000" />
    <rect x="43" y="52" width="14" height="1.5" fill="#8B0000" />
    <rect x="43" y="56" width="10" height="1.5" fill="#8B0000" />
  </svg>
);

const MAIN_BUTTONS = [
  { id: 1, label: 'EXTINTORES', icon: <FireExtinguisherIcon />, color: TESO_COLORS[1] },
  { id: 2, label: 'PLANES', icon: <CalendarIcon />, color: TESO_COLORS[2] },
  { id: 3, label: 'EPIS', icon: <SafetyHelmetIcon />, color: TESO_COLORS[3] },
  { id: 4, label: 'FORMACIÓN', image: 'https://img.icons8.com/3d-fluency/100/graduation-cap.png', color: TESO_COLORS[4] },
  { id: 5, label: 'MENSAJES', icon: <CommunicationIcon />, color: TESO_COLORS[5] },
  { id: 6, label: 'INCIDENTES', image: 'https://img.icons8.com/3d-fluency/100/warning-shield.png', color: TESO_COLORS[6] },
  { id: 7, label: 'INFORMES', icon: <ReportsIcon />, color: TESO_COLORS[7] },
  { id: 8, label: 'SALIDAS', icon: <EmergencyExitIcon />, color: TESO_COLORS[8] },
  { id: 9, label: 'INSPECCIÓN', icon: <SearchCheck />, color: TESO_COLORS[9] },
];

export default function PRLPage({ onBack, onGoLanding, onSelectCentros, onOpenIA, onOpenConfiguracion }: PRLPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        
        {/* Top Visualization Section */}
        <header className={`space-y-1 pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">TESO</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">P.R.L.</p>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
        </header>

        {/* Main 3x3 Grid */}
        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {MAIN_BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon}
              image={btn.image}
              color={btn.color}
              onClick={() => {
                if (btn.id === 1) onSelectCentros();
              }}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="prl"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {MAIN_BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (btn.id === 1) onSelectCentros();
              }}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        {/* Footer Info */}
        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Terminal de Campo Autorizada</p>
        </footer>
      </div>
    </div>
  );
}
