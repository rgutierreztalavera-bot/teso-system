import React from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  List, 
  Search, 
  AlertCircle, 
  Wrench, 
  History, 
  Bell, 
  Shield, 
  PlusCircle,
  ArrowLeft,
  SlidersHorizontal,
  MessageSquareMore
} from 'lucide-react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';

interface ExtintoresPageProps {
  centroName: string;
  zonaName: string;
  onBack: () => void;
  onGoLanding: () => void;
  onSelectRegistrarEstado: () => void;
  onSelectListado: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const EXTINTORES_BUTTONS = [
  { id: 1, label: 'REGISTRO', icon: <ClipboardCheck className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[1] },
  { id: 2, label: 'LISTADO', icon: <List className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[2] },
  { id: 3, label: 'BUSCAR', icon: <Search className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[3] },
  { id: 4, label: 'INCIDENCIAS', icon: <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[4] },
  { id: 5, label: 'REVISIÓN', icon: <Wrench className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[5] },
  { id: 6, label: 'HISTORIAL', icon: <History className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[6] },
  { id: 7, label: 'AÑADIR', icon: <PlusCircle className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[7] },
  { id: 8, label: 'ALERTAS', icon: <Bell className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[8] },
  { id: 9, label: 'TIPOS', icon: <Shield className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[9] },
];

import { useSettings } from '../contexts/SettingsContext';

export default function ExtintoresPage({ 
  centroName,
  zonaName,
  onBack, 
  onGoLanding, 
  onSelectRegistrarEstado, 
  onSelectListado,
  onOpenIA,
  onOpenConfiguracion
}: ExtintoresPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
    longPressThreshold: 1000,
  });

  const isBlackText = (colorKey: number) => colorKey < 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        
        {/* Header - Contextual */}
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight text-left">TESO</p>
          <div className="text-right">
            <p className="text-xs font-black text-white uppercase">CENTRO: {centroName}</p>
            <p className="text-xs font-black text-white uppercase">ZONA: {zonaName}</p>
          </div>
        </header>

        {/* Main 3x3 Grid */}
        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
            {EXTINTORES_BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon}
              color={btn.color}
              onClick={() => {
                if (btn.id === 1) onSelectRegistrarEstado();
                if (btn.id === 2) onSelectListado();
              }}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="extintores"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {EXTINTORES_BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (btn.id === 1) onSelectRegistrarEstado();
                if (btn.id === 2) onSelectListado();
              }}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        {/* Minimal Footer */}
        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Gestión Industrial de Campo</p>
        </footer>
      </div>
    </div>
  );
}
