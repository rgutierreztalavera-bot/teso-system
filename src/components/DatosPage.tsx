import React from 'react';
import { motion } from 'motion/react';
import { List } from 'lucide-react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

interface DatosPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
  onOpenListados: () => void;
}

const DATOS_BUTTONS = [
  { id: 1, label: 'LISTADOS', icon: <List className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[1] },
  { id: 2, label: '', icon: null, color: TESO_COLORS[2] },
  { id: 3, label: '', icon: null, color: TESO_COLORS[3] },
  { id: 4, label: '', icon: null, color: TESO_COLORS[4] },
  { id: 5, label: '', icon: null, color: TESO_COLORS[5] },
  { id: 6, label: '', icon: null, color: TESO_COLORS[6] },
  { id: 7, label: '', icon: null, color: TESO_COLORS[7] },
  { id: 8, label: '', icon: null, color: TESO_COLORS[8] },
  { id: 9, label: '', icon: null, color: TESO_COLORS[9] },
];

export default function DatosPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion, onOpenListados }: DatosPageProps) {
  const { configMode, getLayerSettings, fontSize: globalFontSize, iconSize: globalIconSize, isHostingVisible } = useSettings();

  const layerId = 'datos';
  const layerSettings = getLayerSettings(layerId);

  const currentFontSize = layerSettings.fontSize ?? globalFontSize;
  const currentIconSize = layerSettings.iconSize ?? globalIconSize;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>

        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex flex-col items-end">
            <p className="text-2xl font-black tracking-tight text-white uppercase">DATOS</p>
            {configMode !== 'none' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black text-yellow-500 tracking-widest uppercase"
              >
                MODO AJUSTE: {configMode === 'text' ? 'TEXTO' : 'ICONOS'}
              </motion.p>
            )}
          </div>
        </header>

        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {DATOS_BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon ?? undefined}
              color={btn.color}
              fontSize={currentFontSize}
              iconSize={currentIconSize}
              onClick={() => {
                if (configMode === 'none') {
                  if (btn.id === 1) onOpenListados();
                }
              }}
            />
          ))}
        </main>

        <TesoHosting
          layerId={layerId}
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          {DATOS_BUTTONS.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (btn.id === 1) onOpenListados();
              }}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>
      </div>
    </div>
  );
}
