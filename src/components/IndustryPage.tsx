import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Factory, 
  Cpu, 
  AlertCircle, 
  Bell, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  SlidersHorizontal,
  Settings,
  ArrowLeft,
  PlusCircle,
  MessageSquareMore
} from 'lucide-react';
import TesoHosting from './TesoHosting';
import TesoButton from './TesoButton';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';

interface IndustryPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const BUTTONS = [
  { id: 1, label: 'DASHBOARD', icon: <LayoutDashboard className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[1] },
  { id: 2, label: 'LÍNEAS', icon: <Factory className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[2] },
  { id: 3, label: 'MAQUINARIAS', icon: <Cpu className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[3] },
  { id: 4, label: 'INCIDENCIAS', icon: <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[4] },
  { id: 5, label: 'ALERTAS', icon: <Bell className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[5] },
  { id: 6, label: 'PROYECTOS', icon: <Briefcase className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[6] },
  { id: 7, label: 'TAREAS', icon: <CheckSquare className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[7] },
  { id: 8, label: 'REPORTES', icon: <FileText className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[8] },
  { id: 9, label: 'AJUSTES', icon: <Settings className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[9] },
];

import { useSettings } from '../contexts/SettingsContext';

export default function IndustryPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: IndustryPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

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
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">INDUSTRY</p>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
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
                
              }}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="industry"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        />

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Gestión de Producción Industrial</p>
        </footer>
      </div>
    </div>
  );
}
