import React from 'react';
import { motion } from 'motion/react';
import { Layers, Grid3x3 } from 'lucide-react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS, TESO_SUBZONES } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

interface ListadoZonaPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
  zoneId: string;
  onSelectSubZone: (subZoneId: string | null) => void;
}

export default function ListadoZonaPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion, zoneId, onSelectSubZone }: ListadoZonaPageProps) {
  const { configMode, getLayerSettings, fontSize: globalFontSize, iconSize: globalIconSize, isHostingVisible } = useSettings();

  const layerId = 'listadoZona';
  const layerSettings = getLayerSettings(layerId);

  const currentFontSize = layerSettings.fontSize ?? globalFontSize;
  const currentIconSize = layerSettings.iconSize ?? globalIconSize;

  const subZones = TESO_SUBZONES[zoneId] ?? [];

  const buttons = [
    { id: 1, label: 'TODOS', icon: <Layers className="w-14 h-14 sm:w-16 sm:h-16" />, color: TESO_COLORS[1], subZoneId: null as string | null },
    ...subZones.slice(0, 7).map((sz, i) => ({
      id: i + 2,
      label: sz.id,
      icon: <Grid3x3 className="w-14 h-14 sm:w-16 sm:h-16" />,
      color: TESO_COLORS[(i + 2) as keyof typeof TESO_COLORS],
      subZoneId: sz.id,
    })),
    ...Array.from({ length: Math.max(0, 8 - subZones.length) }, (_, i) => ({
      id: subZones.length + i + 2,
      label: '',
      icon: null as React.ReactNode,
      color: TESO_COLORS[((subZones.length + i + 2) % 9 || 9) as keyof typeof TESO_COLORS],
      subZoneId: null as string | null,
    })),
  ].slice(0, 9);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>

        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex flex-col items-end">
            <p className="text-2xl font-black tracking-tight text-white uppercase">{zoneId}</p>
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
          {buttons.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon ?? undefined}
              color={btn.color}
              fontSize={currentFontSize}
              iconSize={currentIconSize}
              onClick={() => {
                if (configMode === 'none' && (btn.subZoneId !== null || btn.label === 'TODOS')) {
                  onSelectSubZone(btn.subZoneId);
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
          {buttons.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (btn.subZoneId !== null || btn.label === 'TODOS') {
                  onSelectSubZone(btn.subZoneId);
                }
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
