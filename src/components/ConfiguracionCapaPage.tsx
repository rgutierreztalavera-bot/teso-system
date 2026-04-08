import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  SlidersHorizontal,
  Eye,
  EyeOff,
  Type,
  Image as ImageIcon,
  PlusCircle,
  RefreshCw,
  Plus,
  Minus,
  MessageSquareMore
} from 'lucide-react';
import TesoButton from './TesoButton';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';
import { useSettings } from '../contexts/SettingsContext';

interface ConfiguracionCapaPageProps {
  layerId: string;
  layerName: string;
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
}

export default function ConfiguracionCapaPage({ layerId, layerName, onBack, onGoLanding, onOpenIA }: ConfiguracionCapaPageProps) {
  const { fontSize: globalFontSize, iconSize: globalIconSize, showIcons: globalShowIcons, showText: globalShowText, setLayerSetting, resetLayerSettings, getLayerSettings, setConfigMode } = useSettings();
  
  const layerSettings = getLayerSettings(layerId);
  const fontSize = layerSettings.fontSize ?? globalFontSize;
  const iconSize = layerSettings.iconSize ?? globalIconSize;
  const showIcons = layerSettings.showIcons ?? globalShowIcons;
  const showText = layerSettings.showText ?? globalShowText;

  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
    longPressThreshold: 1000,
  });

  const CONFIG_BUTTONS = [
    { 
      id: 1, 
      label: 'AJUSTAR TEXTO', 
      icon: <Type />, 
      colorKey: 1, 
      action: () => {
        setConfigMode('text');
        onBack();
      } 
    },
    { 
      id: 2, 
      label: 'AJUSTAR ICONOS', 
      icon: <ImageIcon />, 
      colorKey: 2, 
      action: () => {
        setConfigMode('icons');
        onBack();
      } 
    },
    { id: 3, label: 'VISUAL', icon: <Eye />, colorKey: 3 },
    { id: 4, label: 'OCULTAR TEXTO', icon: showText ? <EyeOff /> : <Eye />, colorKey: 4, action: () => setLayerSetting(layerId, 'showText', !showText) },
    { id: 5, label: showIcons ? 'OCULTAR ICONOS' : 'MOSTRAR ICONOS', icon: showIcons ? <EyeOff /> : <Eye />, colorKey: 5, action: () => setLayerSetting(layerId, 'showIcons', !showIcons) },
    { id: 6, label: 'PERMISOS', icon: <PlusCircle />, colorKey: 6 },
    { id: 7, label: 'IA', icon: <PlusCircle />, colorKey: 7 },
    { id: 8, label: 'CONFIGURACIÓN', icon: <PlusCircle />, colorKey: 8 },
    { id: 9, label: 'REINICIAR', icon: <RefreshCw />, colorKey: 9, action: () => resetLayerSettings(layerId) },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-md flex flex-col h-full flex-grow">
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <SlidersHorizontal className="w-8 h-8 text-black" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase">CONFIGURACIÓN {layerName}</h1>
              <p className="text-[10px] text-white font-bold tracking-[0.2em]">DE CAPA ESPECÍFICA</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-white">TESO SYSTEM</p>
            <p className="text-[10px] text-white font-bold">v2.4.0</p>
          </div>
        </header>

        {/* Status Bar */}
        <div className="flex gap-1 mb-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`h-1 flex-grow rounded-full ${i < 8 ? 'bg-white/40' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Main Grid */}
        <main className="flex-grow grid grid-cols-3 gap-3 mb-6">
            {CONFIG_BUTTONS.map((btn) => (
            <TesoButton
              key={btn.id}
              id={btn.id}
              label={btn.label}
              icon={btn.icon}
              color={TESO_COLORS[btn.colorKey as keyof typeof TESO_COLORS]}
              onClick={() => btn.action && btn.action()}
              fontSize={10}
              iconSize={55}
              showIcons={true}
              showText={true}
            />
          ))}
        </main>

        {/* Interaction Section */}
        <section className="mt-1 flex flex-col items-end gap-2">
          {/* Top Row: IA Button and Back Button */}
          <div className="flex gap-2 w-[248px]">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onOpenIA}
              className="w-[184px] h-14 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 text-yellow-950 rounded-lg flex items-center justify-center font-black tracking-[0.2em] text-xl shadow-md border border-yellow-300/50"
            >
              IA
            </motion.button>
            
            {/* Back Button (Silver) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              {...longPressBack}
              className="bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-slate-200/50"
            >
              <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Main Grid Area */}
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-2">
              {/* Settings Button (Dark Bronze) - Active state */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-orange-800 via-orange-950 to-neutral-950 text-orange-200 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-orange-800/50"
              >
                <SlidersHorizontal className="w-8 h-8 text-orange-200" strokeWidth={2.5} />
              </motion.button>

              {/* Add Button (Chrome/Dark Metal) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 text-zinc-100 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-zinc-400/50"
              >
                <PlusCircle className="w-8 h-8" strokeWidth={2.5} />
              </motion.button>

              {/* Messages Button (Dark Orange Metallic) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-amber-700 via-orange-800 to-orange-950 text-orange-100 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-orange-500/50"
              >
                <MessageSquareMore className="w-8 h-8" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* 3x3 Grid (Numeric) */}
            <div className="grid grid-cols-3 gap-2 w-[184px] h-[184px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const configBtn = CONFIG_BUTTONS.find(b => b.id === num);
                return (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => configBtn?.action?.()}
                    className={`${TESO_COLORS[num as keyof typeof TESO_COLORS]} w-14 h-14 rounded-lg flex items-center justify-center ${num === 8 ? 'text-[7px] tracking-tighter' : 'text-[8px]'} font-black border border-white/5 shadow-sm transition-all hover:brightness-110 active:scale-95 leading-none text-center px-1`}
                  >
                    <span className={num === 8 ? 'scale-x-90 inline-block' : ''}>{configBtn?.label || num}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="text-center py-4">
          <p className="text-[8px] text-white font-bold tracking-[0.3em]">
            LAYER CONFIGURATION INTERFACE • SYSTEM SECURE
          </p>
        </footer>
      </div>
    </div>
  );
}
