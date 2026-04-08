import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, Globe, Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onAction: (id: number) => void;
  onOpenIA?: () => void;
}

export default function LandingPage({ onAction, onOpenIA }: LandingPageProps) {
  const { fontSize, iconSize, showIcons, showText, isHostingVisible, setIsHostingVisible } = useSettings();
  const buttons = [
    { id: 1, label: 'TENGO' },
    { id: 2, label: 'QUIERO' },
    { id: 6, label: 'COMPARTIR' },
    { id: 3, label: 'DONAR' },
    { id: 5, label: 'PARTICULARES' },
    { id: 4, label: 'EMPRESAS' },
    { id: 7, label: 'REGISTRARSE' },
    { id: 8, label: 'INICIO SESIÓN' },
    { id: 9, label: 'IA' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center text-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")',
          filter: 'contrast(105%)'
        }}
      />
      
      {/* Animated Grid Overlay - Very subtle */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Subtle Radial Gradient */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Content */}
      <div className={`relative z-30 flex flex-col items-center w-full py-12 px-6 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110 h-full justify-center'}`}>
        {/* Top Brand Mark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`flex flex-col items-center transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}
        >
          <p className="text-3xl font-black tracking-[0.3em] text-white">
            TESO <span className="text-white/40">SYSTEM</span>
          </p>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mt-2" />
        </motion.div>
      </div>

      {/* Controls next to REGISTRARSE (to the left of the grid) */}
      <div className="fixed bottom-5 right-[273px] md:right-[525px] z-50 flex flex-col items-end justify-end gap-[4px] md:gap-[8px] pointer-events-none">
        <AnimatePresence mode="wait">
          {isHostingVisible ? (
            <motion.div
              key="controls-open"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              className="flex flex-col gap-[4px] md:gap-[8px] pointer-events-auto"
            >
              {/* Settings button (above arrow) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction(99)}
                className="aspect-square w-[40px] h-[40px] md:w-[80px] md:h-[80px] rounded-xl bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg"
              >
                <Settings className="w-5 h-5 md:w-10 md:h-10 text-white/70" />
              </motion.button>
              {/* Arrow/close button (at the bottom) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsHostingVisible(false)}
                className="aspect-square w-[40px] h-[40px] md:w-[80px] md:h-[80px] rounded-xl bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/50 flex items-center justify-center transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 md:w-10 md:h-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 6L6 18M6 18V10M6 18H14" />
                </svg>
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="controls-closed"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHostingVisible(true)}
              className="bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/50 w-10 h-10 rounded-lg flex items-center justify-center shadow-md pointer-events-auto"
            >
              <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M18 6v8M18 6H10" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Right Grid */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end justify-end pointer-events-none">
        <AnimatePresence mode="wait">
          {isHostingVisible && (
            <motion.div
              key="grid-open"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="flex flex-col gap-2 sm:gap-3 pointer-events-auto"
            >
              {/* 3x3 Grid of Buttons */}
              <div className="grid grid-cols-3 gap-[4px] md:gap-[8px] w-fit ml-auto">
                {buttons.map((btn, index) => (
                  <motion.button
                    key={btn.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02, duration: 0.4 }}
                    onClick={() => {
                      if (btn.id === 9 && onOpenIA) {
                        onOpenIA();
                      } else {
                        onAction(btn.id);
                      }
                    }}
                    className={`
                      aspect-square w-[80px] h-[80px] md:w-[160px] md:h-[160px] rounded-2xl flex flex-col items-center justify-center p-1 sm:p-3
                      backdrop-blur-md border transition-all active:scale-90
                      ${btn.id === 8 ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white'}
                    `}
                  >
                    {showText && (
                      <span 
                        style={{ fontSize: btn.id === 9 ? fontSize * 1.5 : (btn.id === 5 || btn.id === 7 ? 7 : Math.min(fontSize, 9)) }}
                        className={`
                          max-w-[85%] w-full flex items-center justify-center text-center break-normal whitespace-normal overflow-hidden line-clamp-2 font-black uppercase tracking-tighter leading-[1.1] drop-shadow-sm
                        `}
                      >
                        {btn.label}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
