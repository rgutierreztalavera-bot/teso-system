import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';
import { TESO_COLORS } from '../constants';

import { useSettings } from '../contexts/SettingsContext';

interface RegistrarEstadoExtintorPageProps {
  extintorId: string;
  onBack: () => void;
  onGoLanding: () => void;
}

export default function RegistrarEstadoExtintorPage({ extintorId, onBack, onGoLanding }: RegistrarEstadoExtintorPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

  return (
    <div className="min-h-screen bg-[#050A15] text-white font-sans p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-white" />
            <p className="text-lg font-black tracking-tight text-white uppercase">REGISTRAR ESTADO</p>
          </div>
        </header>

        <h1 className={`text-3xl font-black tracking-tight mt-2 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>EXTINTOR {extintorId}</h1>
        
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 mt-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          <p className="text-white/60">Formulario para registrar el estado del extintor {extintorId}...</p>
        </div>

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Registro de Inspección de Campo</p>
        </footer>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        {...longPressBack}
        className="fixed bottom-6 left-6 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-lg z-50"
      >
        <ArrowLeft className="w-8 h-8" />
      </motion.button>
    </div>
  );
}
