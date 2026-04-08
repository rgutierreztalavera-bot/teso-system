import React from 'react';
import { motion } from 'motion/react';
import { 
  Factory, 
  ShieldCheck, 
  Truck, 
  Cpu, 
  Settings,
  BarChart3,
  Map,
  Globe,
  ArrowLeft,
  PlusCircle,
  Users,
  SlidersHorizontal,
  MessageSquareMore
} from 'lucide-react';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';
import TesoButton from './TesoButton';

interface HomeScreenProps {
  onSelectPRL: () => void;
  onSelectEmpresas: () => void;
  onSelectUsuariosRoles: () => void;
  onSelectIndustry: () => void;
  onSelectMaps: () => void;
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA: () => void;
  onOpenConfiguracion?: () => void;
}

const HOME_BUTTONS = [
  { id: 1, label: 'PRL', icon: <ShieldCheck />, color: TESO_COLORS[1] },
  { id: 2, label: 'INDUSTRY', icon: <Factory />, color: TESO_COLORS[2] },
  { id: 3, label: 'LOGÍSTICA', icon: <Truck />, color: TESO_COLORS[3] },
  { id: 4, label: 'MAPAS', icon: <Map />, color: TESO_COLORS[4] },
  { id: 5, label: 'AJUSTES', icon: <Settings />, color: TESO_COLORS[5] },
  { id: 6, label: 'DATOS', icon: <BarChart3 />, color: TESO_COLORS[6] },
  { id: 7, label: 'AUTO', icon: <Cpu />, color: TESO_COLORS[7] },
  { id: 8, label: 'GLOBAL', icon: <Globe />, color: TESO_COLORS[8] },
  { id: 9, label: 'USUARIOS', icon: <Users />, color: TESO_COLORS[9] },
];

import { useSettings } from '../contexts/SettingsContext';
import { useLayerId } from '../contexts/LayerContext';
import TesoHosting from './TesoHosting';

export default function HomeScreen({ onSelectPRL, onSelectEmpresas, onSelectUsuariosRoles, onSelectIndustry, onSelectMaps, onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: HomeScreenProps) {
  const { isHostingVisible } = useSettings();
  
  const handleButtonClick = (id: number) => {
    if (id === 1) onSelectPRL();
    if (id === 2) onSelectIndustry();
    if (id === 4) onSelectMaps();
    if (id === 9) onSelectUsuariosRoles();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        
        {/* Header */}
        <header className={`space-y-1 pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">TESO</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-white">SYSTEM</p>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
        </header>

        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {HOME_BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon}
              color={btn.color}
              onClick={() => handleButtonClick(btn.id)}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="home"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {HOME_BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleButtonClick(btn.id)}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        {/* Footer */}
        <footer className={`text-center pb-4 flex flex-col gap-1 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Capa de Entrada del Sistema</p>
          <button 
            onClick={onBack}
            className="text-[11px] uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors"
          >
            VOLVER A PORTADA
          </button>
        </footer>
      </div>
    </div>
  );
}
