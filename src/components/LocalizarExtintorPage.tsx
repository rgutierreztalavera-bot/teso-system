import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  QrCode, 
  History, 
  MapPin, 
  Map, 
  List, 
  PlusCircle, 
  AlertCircle,
  ClipboardCheck,
  Star,
  SlidersHorizontal,
  MessageSquareMore
} from 'lucide-react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';

interface LocalizarExtintorPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onSelectPorZonas: () => void;
  onSelectUltimosUsados: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const BUTTONS = [
  { id: 1, label: 'ESCANEAR QR', icon: <QrCode className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[1] },
  { id: 2, label: 'ÚLTIMOS USADOS', icon: <History className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[2] },
  { id: 3, label: 'FAVORITOS', icon: <Star className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[3] },
  { id: 4, label: 'CERCANOS', icon: <MapPin className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[4] },
  { id: 5, label: 'LISTADO', icon: <List className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[5] },
  { id: 6, label: 'BUSCAR', icon: <Search className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[6] },
  { id: 7, label: 'AÑADIR', icon: <PlusCircle className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[7] },
  { id: 8, label: 'INCIDENCIAS', icon: <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[8] },
  { id: 9, label: 'REGISTRO', icon: <ClipboardCheck className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[9] },
];

import { useSettings } from '../contexts/SettingsContext';

export default function LocalizarExtintorPage({ onBack, onGoLanding, onSelectPorZonas, onSelectUltimosUsados, onOpenIA, onOpenConfiguracion }: LocalizarExtintorPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-white" />
            <p className="text-lg font-black tracking-tight text-white uppercase">REGISTRAR ESTADO</p>
          </div>
        </header>

        {/* Main 3x3 Grid */}
        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
            {BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon}
              color={btn.color}
              onClick={() => {
                if (btn.id === 2) onSelectUltimosUsados();
              }}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="localizar-extintor"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (btn.id === 2) onSelectUltimosUsados();
              }}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Registro de Estado de Equipos P.R.L.</p>
        </footer>
      </div>
    </div>
  );
}
