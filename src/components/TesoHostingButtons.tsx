import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutGrid, SlidersHorizontal, ArrowLeft, MessageSquareMore, X } from 'lucide-react';
import { TESO_COLORS } from '../constants';

export interface TesoHostingButtonsProps {
  onOpenIA: () => void;
  onBack: () => void;
  activeOverlay: 'trackpad' | 'none' | 'filters' | 'actions' | 'modes' | 'actions_enviar' | 'tools' | 'tools_velocidad' | 'tools_velocidad_listado' | 'tools_velocidad_hosting' | 'tools_tamano' | 'tools_tamano_letra' | 'tools_tamano_hosting' | 'tools_tamano_iconos';
  setActiveOverlay: (overlay: 'trackpad' | 'none' | 'filters' | 'actions' | 'modes' | 'actions_enviar' | 'tools' | 'tools_velocidad' | 'tools_velocidad_listado' | 'tools_velocidad_hosting' | 'tools_tamano' | 'tools_tamano_letra' | 'tools_tamano_hosting' | 'tools_tamano_iconos') => void;
  getGridOptions: () => string[];
  onPan: (dx: number, dy: number) => void;
  onSelectFromCenter: () => void;
  onLongPressCenter?: () => void;
  isHostingVisible: boolean;
  setIsHostingVisible: (visible: boolean) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  isFichaVisible?: boolean;
  onSpeedSelect?: (speed: number) => void;
  onHostingSpeedSelect?: (speed: number) => void;
  onHostingSizeSelect?: (size: number) => void;
  onFontSizeSelect?: (size: number) => void;
  onIconSizeSelect?: (size: number) => void;
  hostingSize: number;
  fontSizeLevel: number;
  iconSizeLevel: number;
}

export const TesoHostingButtons: React.FC<TesoHostingButtonsProps> = ({
  onOpenIA,
  onBack,
  activeOverlay,
  setActiveOverlay,
  getGridOptions,
  onPan,
  onSelectFromCenter,
  onLongPressCenter,
  isHostingVisible,
  setIsHostingVisible,
  onSelectAll,
  allSelected,
  isFichaVisible = false,
  onSpeedSelect,
  onHostingSpeedSelect,
  onHostingSizeSelect,
  onFontSizeSelect,
  onIconSizeSelect,
  hostingSize,
  fontSizeLevel,
  iconSizeLevel
}) => {
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const btnLongPressTimer = useRef<NodeJS.Timeout | null>(null);

  const SIZES = [80, 100, 120, 140, 160, 180, 200, 215, 230];
  const containerSize = SIZES[hostingSize - 1];
  const dynamicGap = Math.max(2, containerSize * 0.05);
  const gridButtonSize = (containerSize - (dynamicGap * 2)) / 3;
  const dynamicButtonSize = gridButtonSize;
  
  const fontScale = 0.8 + (fontSizeLevel * 0.06);
  const iconScale = 0.6 + (iconSizeLevel * 0.1);
  
  const dynamicIconSize = dynamicButtonSize * 0.5 * iconScale;
  
  const gridNumberFontSize = Math.max(10, gridButtonSize * 0.5 * fontScale);
  const gridTextSmallFontSize = Math.max(6, gridButtonSize * 0.16 * fontScale);
  const marcarTodoFontSize = Math.max(8, containerSize * 0.06 * fontScale);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    startTime.current = Date.now();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    btnLongPressTimer.current = setTimeout(() => {
      if (!hasMoved.current) {
        onLongPressCenter?.();
        if (window.navigator.vibrate) window.navigator.vibrate(100);
      }
    }, 1000);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const totalDx = e.clientX - startPos.current.x;
    const totalDy = e.clientY - startPos.current.y;
    const duration = Date.now() - startTime.current;
    
    if (Math.abs(totalDx) > 15 || Math.abs(totalDy) > 15) {
      hasMoved.current = true;
      if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
    }

    if (totalDx < -100 && totalDy > 100 && duration > 800 && isHostingVisible) {
      setIsHostingVisible(false);
      isDragging.current = false;
      return;
    }

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onPan(dx * 1.0, dy * 1.0);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    if (!hasMoved.current) {
      onSelectFromCenter();
    }
  };

  return (
    <motion.section 
      className="fixed bottom-5 right-5 flex flex-row-reverse items-end p-0 pointer-events-none z-50"
      style={{ gap: `${dynamicGap}px` }}
    >
      <AnimatePresence>
        {isHostingVisible && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative pointer-events-none transition-all duration-200 ease-out"
            style={{ 
              width: `${containerSize}px`, 
              height: `${containerSize}px` 
            }}
          >
            {activeOverlay === 'trackpad' && (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveOverlay(activeOverlay === 'modes' ? 'trackpad' : 'modes')}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.26}px`, 
                    height: `${containerSize * 0.26}px` 
                  }}
                  className="absolute top-1 right-1 rounded-lg bg-gradient-to-br from-[#4A3018] via-[#2A1A0A] to-[#1A0F05] border border-[#8B5A2B]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                >
                  <SlidersHorizontal className="w-6 h-6 text-[#D4AF37]" strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveOverlay(activeOverlay === 'filters' ? 'trackpad' : 'filters')}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.26}px`, 
                    height: `${containerSize * 0.26}px` 
                  }}
                  className="absolute top-1 left-1 rounded-lg bg-gradient-to-br from-orange-800 via-orange-950 to-neutral-950 border border-orange-800/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                >
                  <Search className="w-6 h-6 text-orange-200" strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveOverlay(activeOverlay === 'actions' ? 'trackpad' : 'actions')}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.26}px`, 
                    height: `${containerSize * 0.26}px` 
                  }}
                  className="absolute bottom-1 left-1 rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 border border-zinc-600/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                >
                  <LayoutGrid className="w-6 h-6 text-zinc-100" strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onSelectAll}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.38}px`, 
                    height: `${containerSize * 0.16}px` 
                  }}
                  className={`absolute top-1 left-1/2 transform -translate-x-1/2 rounded border flex items-center justify-center z-20 pointer-events-auto font-bold uppercase leading-tight text-center ${allSelected ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-gradient-to-br from-zinc-800 to-black text-white border-zinc-600/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}
                >
                  <span style={{ fontSize: `${marcarTodoFontSize}px` }}>
                    {allSelected ? 'Desmarcar' : 'Marcar\nTodo'}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onBack()}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.26}px`, 
                    height: `${containerSize * 0.26}px` 
                  }}
                  className="absolute bottom-1 right-1 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-md border border-slate-200/50 z-30 pointer-events-auto"
                >
                  <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
                </motion.button>
              </>
            )}

            {activeOverlay === 'trackpad' ? (
              <div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-[inset_0_0_20px_rgba(212,175,55,0.1),0_10px_20px_rgba(0,0,0,0.8)] border border-yellow-900/50 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing select-none [-webkit-touch-callout:none] [-webkit-user-select:none] overflow-hidden pointer-events-auto"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <div 
                  className="rounded-full bg-gradient-to-br from-yellow-950 to-black shadow-[inset_0_0_15px_rgba(212,175,55,0.2),0_0_20px_rgba(212,175,55,0.1)] border border-yellow-600/30 flex items-center justify-center pointer-events-none relative transition-all duration-300"
                  style={{ 
                    width: `${containerSize * 0.65}px`, 
                    height: `${containerSize * 0.65}px` 
                  }}
                >
                  <div className="absolute inset-0 rounded-full border border-yellow-500/30 animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                  <div 
                    className="rounded-full bg-gradient-to-br from-yellow-900 to-black shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center relative transition-all duration-300"
                    style={{ 
                      width: `${containerSize * 0.43}px`, 
                      height: `${containerSize * 0.43}px` 
                    }}
                  >
                    <div 
                      className="rounded-full bg-yellow-500/10 border border-yellow-400/40 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300" 
                      style={{ 
                        width: `${containerSize * 0.22}px`, 
                        height: `${containerSize * 0.22}px` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full pointer-events-none">
                {activeOverlay !== 'trackpad' && activeOverlay !== 'none' && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (activeOverlay === 'tools_velocidad_listado' || activeOverlay === 'tools_velocidad_hosting') {
                        setActiveOverlay('tools_velocidad');
                      } else if (activeOverlay === 'tools_tamano_hosting' || activeOverlay === 'tools_tamano_letra' || activeOverlay === 'tools_tamano_iconos') {
                        setActiveOverlay('tools_tamano');
                      } else if (activeOverlay === 'tools_velocidad' || activeOverlay === 'tools_tamano') {
                        setActiveOverlay('tools');
                      } else if (activeOverlay === 'tools' || activeOverlay === 'filters' || activeOverlay === 'actions' || activeOverlay === 'modes') {
                        setActiveOverlay('trackpad');
                      } else if (activeOverlay === 'actions_enviar') {
                        setActiveOverlay('actions');
                      } else {
                        onBack();
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ 
                      width: `${gridButtonSize}px`, 
                      height: `${gridButtonSize}px`,
                      top: `-${gridButtonSize + dynamicGap}px`,
                      right: `0px`
                    }}
                    className="absolute z-50 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-slate-200/50 pointer-events-auto"
                  >
                    <ArrowLeft style={{ width: dynamicIconSize, height: dynamicIconSize }} strokeWidth={3} />
                  </motion.button>
                )}
                <div className="grid grid-cols-3 w-full h-full" style={{ gap: `${dynamicGap}px` }}>
                  {getGridOptions().map((text, index) => {
                    const num = index + 1;
                    
                    return (
                      <motion.button
                        key={`${activeOverlay}-${num}`}
                        whileTap={{ scale: 0.9 }}
                        onPointerDown={() => {
                          btnLongPressTimer.current = setTimeout(() => {
                            setActiveOverlay('trackpad');
                            if (navigator.vibrate) navigator.vibrate(50);
                          }, 1000);
                        }}
                        onPointerUp={() => {
                          if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
                        }}
                        onPointerLeave={() => {
                          if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
                        }}
                        onClick={() => {
                          if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
                          if (activeOverlay === 'actions' && text === 'Enviar') {
                            setActiveOverlay('actions_enviar');
                          } else if (activeOverlay === 'tools' && text === 'Velocidad') {
                            setActiveOverlay('tools_velocidad');
                          } else if (activeOverlay === 'tools' && text === 'Tamaño') {
                            setActiveOverlay('tools_tamano');
                          } else if (activeOverlay === 'tools_tamano' && text === 'Hosting') {
                            setActiveOverlay('tools_tamano_hosting');
                          } else if (activeOverlay === 'tools_tamano' && text === 'Letra') {
                            setActiveOverlay('tools_tamano_letra');
                          } else if (activeOverlay === 'tools_tamano' && text === 'Iconos') {
                            setActiveOverlay('tools_tamano_iconos');
                          } else if (activeOverlay === 'tools_velocidad' && text === 'Listado') {
                            setActiveOverlay('tools_velocidad_listado');
                          } else if (activeOverlay === 'tools_velocidad' && text === 'Hosting') {
                            setActiveOverlay('tools_velocidad_hosting');
                          } else if (activeOverlay === 'tools_velocidad_listado') {
                            if (onSpeedSelect) onSpeedSelect(num);
                          } else if (activeOverlay === 'tools_velocidad_hosting') {
                            if (onHostingSpeedSelect) onHostingSpeedSelect(num);
                          } else if (activeOverlay === 'tools_tamano_hosting') {
                            if (onHostingSizeSelect) onHostingSizeSelect(num);
                          } else if (activeOverlay === 'tools_tamano_letra') {
                            if (onFontSizeSelect) onFontSizeSelect(num);
                          } else if (activeOverlay === 'tools_tamano_iconos') {
                            if (onIconSizeSelect) onIconSizeSelect(num);
                          } else if (activeOverlay !== 'none' && activeOverlay !== 'trackpad') {
                            setActiveOverlay('none');
                          }
                        }}
                        style={{ width: gridButtonSize, height: gridButtonSize }}
                        className={`${TESO_COLORS[num as keyof typeof TESO_COLORS]} rounded-lg flex items-center justify-center border border-white/5 shadow-sm overflow-hidden select-none [-webkit-touch-callout:none] [-webkit-user-select:none] pointer-events-auto ${(activeOverlay === 'none' || activeOverlay === 'trackpad') ? 'opacity-80' : 'opacity-100 shadow-xl border-white/20'}`}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                      >
                        <span 
                          style={{
                            fontSize: (activeOverlay === 'none' || activeOverlay === 'trackpad') ? `${gridNumberFontSize}px` : 
                                     (text.length > 8) ? `${gridTextSmallFontSize}px` :
                                     (/^[1-9]$/.test(text) || text === 'Aa') ? `${gridNumberFontSize}px` :
                                     '10px'
                          }}
                          className="text-center leading-none"
                        >
                          {text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
