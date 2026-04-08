import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Minus, Type, Image as ImageIcon, Eye, EyeOff, Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { TESO_COLORS } from '../constants';

import TesoButton from './TesoButton';

interface AjustesLandingPageProps {
  onBack: () => void;
}

export default function AjustesLandingPage({ onBack }: AjustesLandingPageProps) {
  const { 
    motherHostingFontSize, setMotherHostingFontSize, 
    motherHostingIconSize, setMotherHostingIconSize, 
    motherHostingShowIcons, setMotherHostingShowIcons, 
    motherHostingShowText, setMotherHostingShowText 
  } = useSettings();

  const [activeControl, setActiveControl] = useState<'none' | 'text' | 'icons'>('none');

  const handleNumericClick = (num: number) => {
    if (activeControl === 'text') {
      const newSize = 8 + (num - 1) * 2;
      setMotherHostingFontSize(newSize);
    } else if (activeControl === 'icons') {
      const newSize = 32 + (num - 1) * 8;
      setMotherHostingIconSize(newSize);
    }
  };

  const activeNum = activeControl === 'text' 
    ? Math.round((motherHostingFontSize - 8) / 2) + 1 
    : activeControl === 'icons' 
      ? Math.round((motherHostingIconSize - 32) / 8) + 1 
      : null;

  const buttons = [
    { id: 1, label: 'AJUSTAR TEXTO', icon: <Type />, action: () => setActiveControl(activeControl === 'text' ? 'none' : 'text') },
    { id: 2, label: 'AJUSTAR ICONOS', icon: <ImageIcon />, action: () => setActiveControl(activeControl === 'icons' ? 'none' : 'icons') },
    { id: 3, label: '', icon: null, action: null },
    { id: 4, label: motherHostingShowText ? 'OCULTAR TEXTO' : 'MOSTRAR TEXTO', icon: motherHostingShowText ? <EyeOff /> : <Eye />, action: () => setMotherHostingShowText(!motherHostingShowText) },
    { id: 5, label: motherHostingShowIcons ? 'OCULTAR ICONOS' : 'MOSTRAR ICONOS', icon: motherHostingShowIcons ? <EyeOff /> : <Eye />, action: () => setMotherHostingShowIcons(!motherHostingShowIcons) },
    { id: 6, label: '', icon: null, action: null },
    { id: 7, label: '', icon: null, action: null },
    { id: 8, label: '', icon: null, action: null },
    { id: 9, label: '', icon: null, action: null },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center text-white">
      {/* Background Image with Overlay (Same as Landing) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")',
          filter: 'contrast(105%)'
        }}
      />
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Subtle Radial Gradient */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Content */}
      <div className="relative z-30 flex flex-col items-center w-full py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <p className="text-3xl font-black tracking-[0.3em] text-white">
            TESO <span className="text-white/40">AJUSTES</span>
          </p>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mt-2" />
        </motion.div>
      </div>

      {/* Bottom Right Grid */}
      <div className="absolute bottom-2 right-2 z-50 w-[90%] max-h-[50vh] flex flex-col items-end justify-end">
        
        <div className="w-full flex flex-col gap-2 sm:gap-3">
          {/* Back Button Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mb-1">
            <div className="col-start-3 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="aspect-square w-12 sm:w-14 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
              >
                <ArrowLeft className="w-8 h-8 sm:w-7 sm:h-7 text-white/60" />
              </motion.button>
            </div>
          </div>

          {/* Controls Header (When in config mode) */}
          <AnimatePresence>
            {activeControl !== 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex items-center justify-between mb-2 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  {activeControl === 'text' ? <Type className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  <span className="font-black uppercase tracking-widest text-xs">
                    {activeControl === 'text' ? 'Tamaño Texto' : 'Tamaño Iconos'}
                  </span>
                </div>
                <span className="text-xl font-black text-orange-500">
                  {activeControl === 'text' ? motherHostingFontSize : motherHostingIconSize}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3x3 Grid of Buttons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            {activeControl !== 'none' ? (
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumericClick(num)}
                  className={`${TESO_COLORS[num as keyof typeof TESO_COLORS]} aspect-square rounded-2xl flex items-center justify-center text-xl font-black border border-white/5 shadow-sm transition-all ${
                    num === activeNum ? 'ring-4 ring-white scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'opacity-40 scale-90'
                  }`}
                >
                  <span className="text-center leading-none" style={{ fontSize: '16px' }}>
                    {num}
                  </span>
                </motion.button>
              ))
            ) : (
              buttons.map((btn) => (
                <TesoButton
                  key={btn.id}
                  id={btn.id}
                  label={btn.label}
                  icon={btn.icon}
                  showId={false}
                  fontSize={10}
                  iconSize={55}
                  showIcons={true}
                  showText={true}
                  className={`
                    ${(activeControl === 'text' && btn.id === 1) || (activeControl === 'icons' && btn.id === 2) ? 'bg-white/30 border-white/40' : ''}
                    ${!btn.action ? 'bg-white/2 opacity-20 border-white/5 cursor-default' : ''}
                  `}
                  onClick={() => btn.action && btn.action()}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
