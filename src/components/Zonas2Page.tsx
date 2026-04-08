import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, PlusCircle, SlidersHorizontal, MessageSquareMore } from 'lucide-react';
import TesoHosting from './TesoHosting';
import TesoButton from './TesoButton';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';

import { useSettings } from '../contexts/SettingsContext';

interface Zonas2PageProps {
  centroId: number;
  centroName?: string;
  onBack: () => void;
  onGoLanding: () => void;
  onSelectZona: (id: number, name: string) => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const BUTTONS: Array<{ id: number; label: string; colorKey: number }> = [
  { id: 1, label: 'ACCESO', colorKey: 1 },
  { id: 2, label: 'OFICINAS', colorKey: 2 },
  { id: 3, label: 'PRODUCCIÓN', colorKey: 3 },
  { id: 4, label: 'ALMACÉN', colorKey: 4 },
  { id: 5, label: 'CARGA', colorKey: 5 },
  { id: 6, label: 'EXTERIOR', colorKey: 6 },
  { id: 7, label: 'ZONAS COMUNES', colorKey: 7 },
  { id: 8, label: 'VESTUARIOS', colorKey: 8 },
  { id: 9, label: 'SALA TÉCNICA', colorKey: 9 },
];

export default function Zonas2Page({ centroId, centroName, onBack, onGoLanding, onSelectZona, onOpenIA, onOpenConfiguracion }: Zonas2PageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

  const isDefaultName = centroName?.toLowerCase().startsWith('editar centro');
  const displayTitle = centroName && !isDefaultName ? centroName : `CENTRO ${centroId}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-white" />
            <p className="text-2xl font-black tracking-tight text-white uppercase">ZONAS {displayTitle}</p>
          </div>
        </header>

        {/* Main 3x3 Grid */}
        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              color={TESO_COLORS[btn.colorKey as keyof typeof TESO_COLORS]}
              onClick={() => onSelectZona(btn.id, btn.label)}
              centerContent={true}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="zonas2"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectZona(btn.id, btn.label)}
              className={`${TESO_COLORS[btn.colorKey as keyof typeof TESO_COLORS]} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Gestión de Zonas Secundarias</p>
        </footer>
      </div>
    </div>
  );
}
