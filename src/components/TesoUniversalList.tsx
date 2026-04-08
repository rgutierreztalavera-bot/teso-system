import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutGrid, SlidersHorizontal, ArrowLeft, ArrowUp, ArrowDown, Check, Minus, Settings, ChevronDown, Plus, Cloud, Trash, Menu, MessageSquareMore } from 'lucide-react';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';

export const LIST_COLORS = {
  1: { bg: '#FFFFFF', text: '#000000', check: '#000000' },
  2: { bg: '#F5E6AB', text: '#000000', check: '#000000' }, // Crema claro
  3: { bg: '#FFB3FF', text: '#000000', check: '#000000' }, // Magenta claro
  4: { bg: '#FFFF00', text: '#000000', check: '#000000' }, // Amarillo oscuro
  5: { bg: '#228B22', text: '#FFFFFF', check: '#FFFFFF' }, // Verde
  6: { bg: '#0044FF', text: '#FFFFFF', check: '#FFFFFF' }, // Azul oscuro
  7: { bg: '#633F1B', text: '#FFFFFF', check: '#FFFFFF' }, // Marrón oscuro
  8: { bg: '#666666', text: '#FFFFFF', check: '#FFFFFF' }, // Gris
  9: { bg: '#000000', text: '#FFFFFF', check: '#FFFFFF', border: '#FFFFFF' }, // Negro
};

import { useSettings } from '../contexts/SettingsContext';

export interface TesoListItemData {
  id: string;
  name: string;
  location: string;
  stateColor: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  numericValue: number;
}

interface TesoUniversalListProps {
  title?: string;
  items: TesoListItemData[];
  onBack: () => void;
  onOpenIA: () => void;
  onItemDoubleTap?: (item: TesoListItemData) => void;
}

// ── Datos "Incorporar elemento" ─────────────────────────────────────────────
const INC_L1 = ['Seguridad','Maquinaria','Herramientas','Material','Instalaciones','Personas','Vehículos','Documentación','Otros'];
const INC_L2: Record<string, string[]> = {
  'Seguridad':     ['Extintores','Alarmas','Señalización','EPIs','Detectores','Cámaras','Control accesos','Emergencias','Otros'],
  'Maquinaria':    ['Producción','Industrial','Líneas','Equipos','Automatización','Control','Energía','Mantenimiento','Otros'],
  'Herramientas':  ['Manuales','Eléctricas','Medición','Corte','Montaje','Limpieza','Taller','Precisión','Otros'],
  'Material':      ['Oficina','Producción','Almacén','Limpieza','Recambios','Embalaje','Consumibles','Stock','Otros'],
  'Instalaciones': ['Oficinas','Almacén','Producción','Muelles','Salas','Zonas comunes','Técnicas','Exteriores','Otros'],
  'Personas':      ['Trabajadores','Técnicos','Supervisores','Dirección','Mantenimiento','Seguridad','Limpieza','Externos','Otros'],
  'Vehículos':     ['Coches','Furgonetas','Camiones','Carretillas','Maq. móvil','Transporte int.','Logística','Flota','Otros'],
  'Documentación': ['Certificados','Revisiones','Contratos','Manuales','Fichas téc.','Informes','Permisos','Normativa','Otros'],
  'Otros':         ['Animales','Eventos','Pruebas','Temporal','Urgente','Experimental','Mixto','General','Otros'],
};
const INC_L3: Record<string, string[]> = {
  'Seguridad/Extintores':  ['Polvo','CO₂','Agua','Espuma','Automático','Industrial','Portátil','Móvil','Otros'],
  'Material/Oficina':      ['Ordenadores','Pantallas','Mesas','Sillas','Impresoras','Teléfonos','Archivadores','Papelería','Otros'],
  'Vehículos/Coches':      ['Gasolina','Diésel','Eléctrico','Híbrido','Empresa','Renting','Operativo','Reserva','Otros'],
  'Maquinaria/Producción': ['Corte','Montaje','Envasado','Transporte','Control','Robotizada','Manual','Mixta','Otros'],
};
const INC_DEFAULT_L3 = ['Tipo 1','Tipo 2','Tipo 3','Tipo 4','Tipo 5','Tipo 6','Tipo 7','Tipo 8','Otros'];

// ==========================================
// HOSTING BUTTONS COMPONENT
// ==========================================
// Este componente maneja exclusivamente la botonera inferior derecha de los listados.
// Se aísla aquí ("Hosting") para poder configurarlo de manera independiente al resto del sistema.
export interface HostingButtonsProps {
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
  onAddElement?: (category: string, subcategory: string, type: string, colorKey: number) => void;
  onSpeedSelect?: (speed: number) => void;
  onHostingSpeedSelect?: (speed: number) => void;
  onHostingSizeSelect?: (size: number) => void;
  onFontSizeSelect?: (size: number) => void;
  onIconSizeSelect?: (size: number) => void;
  hostingSize: number;
  fontSizeLevel: number;
  iconSizeLevel: number;
  hostingScrollSpeed?: number;
  listScrollSpeed?: number;
  onDeleteElement?: () => void;
  onZoom?: (delta: number) => void;
  onUploadMap?: () => void;
  showDynamicToggle?: boolean;
}

export const HostingButtons: React.FC<HostingButtonsProps> = ({
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
  onAddElement,
  onSpeedSelect,
  onHostingSpeedSelect,
  onHostingSizeSelect,
  onFontSizeSelect,
  onIconSizeSelect,
  hostingSize,
  fontSizeLevel,
  iconSizeLevel,
  hostingScrollSpeed = 5,
  listScrollSpeed = 5,
  onDeleteElement,
  onZoom,
  onUploadMap,
  showDynamicToggle = true,
}) => {
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const btnLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const zoomIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showAddMode, setShowAddMode] = useState(false);
  const [addLayerPath, setAddLayerPath] = useState<number[]>([]);

  const getAddItems = (): string[] => {
    if (addLayerPath.length === 0) return INC_L1;
    const l1 = INC_L1[addLayerPath[0]];
    if (addLayerPath.length === 1) return INC_L2[l1] ?? INC_L1;
    const l2 = (INC_L2[l1] ?? [])[addLayerPath[1]];
    return INC_L3[`${l1}/${l2}`] ?? INC_DEFAULT_L3;
  };
  const getAddBreadcrumb = (): string => {
    if (addLayerPath.length === 0) return 'INCORPORAR ELEMENTO';
    const l1 = INC_L1[addLayerPath[0]] ?? '';
    if (addLayerPath.length === 1) return l1.toUpperCase();
    const l2 = (INC_L2[l1] ?? [])[addLayerPath[1]] ?? '';
    return `${l1} › ${l2}`;
  };
  const handleAddSelect = (index: number) => {
    if (addLayerPath.length < 2) {
      setAddLayerPath([...addLayerPath, index]);
    } else {
      const l1 = INC_L1[addLayerPath[0]];
      const l2 = (INC_L2[l1] ?? [])[addLayerPath[1]];
      const items = INC_L3[`${l1}/${l2}`] ?? INC_DEFAULT_L3;
      onAddElement?.(l1, l2, items[index], index + 1);
      setShowAddMode(false);
      setAddLayerPath([]);
    }
  };
  const handleAddBack = () => {
    if (addLayerPath.length > 0) {
      setAddLayerPath(addLayerPath.slice(0, -1));
    } else {
      setShowAddMode(false);
    }
  };

  const startZoom = (delta: number) => {
    if (!onZoom) return;
    onZoom(delta);
    zoomIntervalRef.current = setInterval(() => onZoom(delta), 100);
  };
  const stopZoom = () => {
    if (zoomIntervalRef.current) { clearInterval(zoomIntervalRef.current); zoomIntervalRef.current = null; }
  };

  const handleZoomPointerDown = (e: React.PointerEvent<HTMLDivElement>, delta: 0.18 | -0.18) => {
    e.preventDefault();
    e.stopPropagation();
    startZoom(delta);
  };

  const handleZoomPointerUp = () => { stopZoom(); };

  const SIZES = [80, 100, 120, 140, 160, 180, 200, 215, 230];
  const containerSize = SIZES[hostingSize - 1];
  const dynamicGap = Math.max(2, containerSize * 0.05);
  const gridButtonSize = (containerSize - (dynamicGap * 2)) / 3;
  const dynamicButtonSize = gridButtonSize; // Unificamos tamaño con los botones de la rejilla
  const overlayBtnSize = Math.round((containerSize + 48 - dynamicGap * 2) / 3); // Tamaño real de cada celda del overlay
  
  // Dynamic font sizes for grid buttons and other elements
  // Level 1 and 2 are the baseline (equivalent to the old Level 5)
  // This allows scaling down (if needed) or up from this comfortable base.
  // We center the scale around 1.0 at level 5, but shift it so Level 1-2 is the "sweet spot"
  const fontScale = 0.8 + (fontSizeLevel * 0.06); // Level 1 = 0.86, Level 2 = 0.92, Level 5 = 1.1, Level 9 = 1.34
  
  // Icon scale logic (same as font scale logic)
  const iconScale = 0.6 + (iconSizeLevel * 0.1); // Level 1 = 0.7, Level 5 = 1.1, Level 9 = 1.5
  
  const dynamicIconSize = dynamicButtonSize * 0.5 * iconScale;
  const iaFontSize = dynamicButtonSize * 0.4 * fontScale;
  
  const gridNumberFontSize = Math.max(10, gridButtonSize * 0.5 * fontScale);
  const gridTextSmallFontSize = Math.max(6, gridButtonSize * 0.16 * fontScale);
  const gridTextMediumFontSize = Math.max(8, gridButtonSize * 0.2 * fontScale);
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
    
    // Aumentamos el umbral a 15px para evitar que un toque impreciso se registre como arrastre
    if (Math.abs(totalDx) > 15 || Math.abs(totalDy) > 15) {
      hasMoved.current = true;
      if (btnLongPressTimer.current) clearTimeout(btnLongPressTimer.current);
    }

    // Detectar arco diagonal lento hacia abajo-izquierda para ocultar
    // (Empieza arriba-derecha, termina abajo-izquierda)
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
    if (!isDragging.current) return; // Evitar doble ejecución por pointerleave/cancel
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    if (!hasMoved.current) {
      onSelectFromCenter();
    }
  };

  return (
    <motion.section 
      className="fixed flex flex-row-reverse items-end p-0 pointer-events-none z-50"
      style={{ gap: `${dynamicGap}px`, bottom: 'max(8px, env(safe-area-inset-bottom))', right: '8px' }}
    >
      {/* Main Grid Area (Right side) */}
      <AnimatePresence>
        {isHostingVisible && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative pointer-events-none transition-all duration-200 ease-out"
            style={{ 
              width: `${containerSize + 48}px`, 
              height: `${containerSize + 48}px` 
            }}
          >
            {activeOverlay === 'trackpad' && !showAddMode && (
              <>
                {/* Mode Button (Top Right) */}
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

                {/* Filter/Search Button (Top Left) */}
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

                {/* Actions Button (Bottom Left) */}
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

                {/* Marcar Todo Button (Top Center) */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onSelectAll}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ 
                    width: `${containerSize * 0.44}px`, 
                    height: `${containerSize * 0.20}px` 
                  }}
                  className={`absolute top-1 left-1/2 transform -translate-x-1/2 rounded border flex items-center justify-center z-20 pointer-events-auto font-bold uppercase leading-tight text-center ${allSelected ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-gradient-to-br from-zinc-800 to-black text-white border-zinc-600/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}
                >
                  <span style={{ fontSize: `${marcarTodoFontSize}px` }}>
                    {allSelected ? 'Desmarcar' : 'Marcar\nTodo'}
                  </span>
                </motion.button>

                {/* placeholder — Add Element moved outside !showAddMode block */}

                {/* Back Button (Bottom Right) - Trackpad Position */}
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

                {/* Zoom strip — between Mode button (top-right) and Back button (bottom-right) */}
                {onZoom && (() => {
                  const btnSz = Math.round(containerSize * 0.26);
                  const gap = 4;
                  const iconSz = Math.round(dynamicIconSize * 0.85);
                  const halfCls = "w-full flex-1 flex items-center justify-center active:bg-white/10 select-none";
                  const lupaSz = Math.round(btnSz * 0.72);
                  return (
                    <div
                      style={{ position: 'absolute', right: 4, top: gap + btnSz + gap, bottom: gap + btnSz + gap, width: btnSz, zIndex: 25, touchAction: 'none' }}
                      className="rounded-xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 border border-slate-500/50 shadow-[0_6px_24px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between py-1 overflow-hidden pointer-events-auto"
                    >
                      {/* Mitad superior — zoom + */}
                      <div className="w-full flex-1 flex items-center justify-center rounded-t-xl active:bg-white/10 select-none"
                        onPointerDown={(e) => handleZoomPointerDown(e, 0.18)}
                        onPointerUp={handleZoomPointerUp} onPointerLeave={handleZoomPointerUp} onPointerCancel={handleZoomPointerUp}
                      >
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: lupaSz, height: lupaSz }}>
                          <circle cx="8" cy="8" r="6.5" stroke="#94a3b8" strokeWidth="1.8"/>
                          <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                          {/* + dentro de la lupa */}
                          <line x1="8" y1="4.5" x2="8" y2="11.5" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round"/>
                          <line x1="4.5" y1="8" x2="11.5" y2="8" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="w-3/4 h-px bg-slate-600/50" />
                      {/* Mitad inferior — zoom − */}
                      <div className="w-full flex-1 flex items-center justify-center rounded-b-xl active:bg-white/10 select-none"
                        onPointerDown={(e) => handleZoomPointerDown(e, -0.18)}
                        onPointerUp={handleZoomPointerUp} onPointerLeave={handleZoomPointerUp} onPointerCancel={handleZoomPointerUp}
                      >
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: lupaSz, height: lupaSz }}>
                          <circle cx="8" cy="8" r="6.5" stroke="#94a3b8" strokeWidth="1.8"/>
                          <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                          {/* − dentro de la lupa */}
                          <line x1="4.5" y1="8" x2="11.5" y2="8" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Upload Map Button — solo visible en modo trackpad normal, sin overlays abiertos */}
            {onUploadMap && activeOverlay === 'trackpad' && !showAddMode && (() => {
              const btnSz = Math.round(containerSize * 0.26);
              const labelSz = Math.max(8, Math.round(btnSz * 0.22));
              const arrowSz = Math.max(12, Math.round(btnSz * 0.32));
              return (
                <motion.button
                  key="upload-map-btn"
                  whileTap={{ scale: 0.9 }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onUploadMap}
                  style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', width: btnSz, height: btnSz, zIndex: 25 }}
                  className="rounded-xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-900 border border-emerald-500/50 shadow-[0_6px_24px_rgba(0,0,0,0.5),0_0_12px_rgba(16,185,129,0.25)] flex flex-col items-center justify-center gap-0.5 pointer-events-auto"
                >
                  <span style={{ fontSize: arrowSz, lineHeight: 1, color: '#6ee7b7' }}>↑</span>
                  <span style={{ fontSize: labelSz, lineHeight: 1, color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.02em' }}>Mapa</span>
                </motion.button>
              );
            })()}

            {/* Delete Element Button — izquierda del botón añadir, solo cuando hay función de eliminar */}
            {activeOverlay === 'trackpad' && !showAddMode && onDeleteElement && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDeleteElement}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ width: `${containerSize * 0.26}px`, height: `${containerSize * 0.26}px`, position: 'absolute', bottom: 4, left: `${(containerSize + 48) / 2 - containerSize * 0.26 - 4}px` }}
                className="rounded-lg border flex items-center justify-center z-30 pointer-events-auto bg-gradient-to-br from-red-900 via-red-950 to-neutral-950 border-red-700/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              >
                <Trash className="text-red-300" style={{ width: `${containerSize * 0.12}px`, height: `${containerSize * 0.12}px` }} strokeWidth={2} />
              </motion.button>
            )}

            {/* Add Element Button — movido a la derecha del centro */}
            {activeOverlay === 'trackpad' && !showAddMode && onAddElement && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => showAddMode ? handleAddBack() : (setShowAddMode(true), setAddLayerPath([]))}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ width: `${containerSize * 0.26}px`, height: `${containerSize * 0.26}px`, position: 'absolute', bottom: 4, left: `${(containerSize + 48) / 2 + 4}px` }}
                className={`rounded-lg border flex items-center justify-center z-30 pointer-events-auto shadow-[0_0_15px_rgba(150,150,150,0.15)] ${showAddMode ? 'bg-gradient-to-br from-amber-700 via-amber-900 to-neutral-950 border-amber-500/50' : 'bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900 border-zinc-500/50'}`}
              >
                {showAddMode ? (
                  <ArrowLeft className="text-amber-300" style={{ width: `${containerSize * 0.12}px`, height: `${containerSize * 0.12}px` }} strokeWidth={2.5} />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <div className="rounded-full border-[2px] border-zinc-300/70 absolute" style={{ width: `${containerSize * 0.16}px`, height: `${containerSize * 0.16}px` }} />
                    <Plus className="text-zinc-200 relative z-10" style={{ width: `${containerSize * 0.1}px`, height: `${containerSize * 0.1}px` }} strokeWidth={2.5} />
                  </div>
                )}
              </motion.button>
            )}

            {activeOverlay === 'trackpad' && showAddMode ? (
              <div className="relative w-full h-full pointer-events-none">
                {/* Botón Atrás — misma posición y estilo que los overlays existentes */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddBack}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    width: `${overlayBtnSize}px`,
                    height: `${overlayBtnSize}px`,
                    top: -(overlayBtnSize + dynamicGap),
                    right: 0,
                  }}
                  className="z-50 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-slate-200/50 pointer-events-auto"
                >
                  <ArrowLeft style={{ width: dynamicIconSize, height: dynamicIconSize }} strokeWidth={3} />
                </motion.button>
                {/* Cuadrícula 3×3 — mismo estilo que los overlays existentes */}
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full" style={{ gap: `${dynamicGap}px` }}>
                  {getAddItems().map((text, index) => {
                    const num = index + 1;
                    return (
                      <motion.button
                        key={`add-${addLayerPath.join('-')}-${num}`}
                        whileTap={{ scale: 0.9 }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => handleAddSelect(index)}
                        className={`w-full h-full ${TESO_COLORS[num as keyof typeof TESO_COLORS]} rounded-lg flex items-center justify-center border border-white/20 shadow-xl overflow-hidden select-none [-webkit-touch-callout:none] [-webkit-user-select:none] pointer-events-auto`}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                      >
                        <span
                          style={{
                            fontSize: `${
                              text.length <= 5 ? Math.max(7, overlayBtnSize * 0.20 * fontScale) :
                              text.length <= 8 ? Math.max(6, overlayBtnSize * 0.16 * fontScale) :
                              text.length <= 11 ? Math.max(5, overlayBtnSize * 0.13 * fontScale) :
                              Math.max(5, overlayBtnSize * 0.10 * fontScale)
                            }px`,
                          }}
                          className="font-black leading-tight text-center px-0.5 uppercase break-words hyphens-auto w-full"
                        >
                          {text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : activeOverlay === 'trackpad' ? (
              <div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-[inset_0_0_20px_rgba(212,175,55,0.1),0_10px_20px_rgba(0,0,0,0.8)] border border-yellow-900/50 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing select-none [-webkit-touch-callout:none] [-webkit-user-select:none] overflow-hidden pointer-events-auto"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
              >
                {/* Futuristic Grid Lines */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Inner Sci-Fi Button */}
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
                {/* Back Button — esquina superior-derecha, dentro del contenedor */}
                {activeOverlay !== 'trackpad' && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (activeOverlay === 'none') {
                        setActiveOverlay('trackpad');
                      } else if (activeOverlay === 'tools_velocidad_listado' || activeOverlay === 'tools_velocidad_hosting') {
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
                        setActiveOverlay('trackpad');
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ 
                      width: `${overlayBtnSize}px`, 
                      height: `${overlayBtnSize}px`,
                      top: -(overlayBtnSize + dynamicGap),
                      right: 0,
                    }}
                    className="absolute z-50 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-slate-200/50 pointer-events-auto"
                  >
                    <ArrowLeft style={{ width: dynamicIconSize, height: dynamicIconSize }} strokeWidth={3} />
                  </motion.button>
                )}
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full" style={{ gap: `${dynamicGap}px` }}>
                  {getGridOptions().map((text, index) => {
                    const num = index + 1;
                    const isActiveSelected =
                      (activeOverlay === 'tools_tamano_hosting' && num === hostingSize) ||
                      (activeOverlay === 'tools_velocidad_hosting' && num === hostingScrollSpeed) ||
                      (activeOverlay === 'tools_velocidad_listado' && num === listScrollSpeed) ||
                      (activeOverlay === 'tools_tamano_letra' && num === fontSizeLevel) ||
                      (activeOverlay === 'tools_tamano_iconos' && num === iconSizeLevel);
                    
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
                        className={`w-full h-full ${TESO_COLORS[num as keyof typeof TESO_COLORS]} rounded-lg flex items-center justify-center border shadow-sm overflow-hidden select-none [-webkit-touch-callout:none] [-webkit-user-select:none] pointer-events-auto transition-all duration-150 ${(activeOverlay === 'none' || activeOverlay === 'trackpad') ? 'opacity-80 border-white/5' : 'opacity-100 shadow-xl border-white/20'} ${isActiveSelected ? 'scale-110 border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.4)] z-10' : ''}`}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                      >
                        <span 
                          style={{
                            fontSize: (activeOverlay === 'none' || activeOverlay === 'trackpad') ? `${gridNumberFontSize}px` : 
                                     (text.length > 8) ? `${gridTextSmallFontSize}px` :
                                     (/^[1-9]$/.test(text) || text === 'Aa') ? `${gridNumberFontSize}px` :
                                     `${gridTextMediumFontSize}px`
                          }}
                          className="font-black leading-tight text-center px-0.5 uppercase break-words"
                        >
                          {activeOverlay === 'tools_tamano_iconos' ? (
                            text === 'Settings' ? <Settings style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'ArrowLeft' ? <ArrowLeft style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'ChevronDown' ? <ChevronDown style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'Search' ? <Search style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'Check' ? <Check style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'Plus' ? <Plus style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'Cloud' ? <Cloud style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            text === 'Trash' ? <Trash style={{ width: dynamicIconSize, height: dynamicIconSize }} /> :
                            <Menu style={{ width: dynamicIconSize, height: dynamicIconSize }} />
                          ) : text}
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

      {/* Controls Column (IA, Tools, Hide/Restore, Back) */}
      <div className="flex flex-col-reverse justify-end pointer-events-none" style={{ gap: `${dynamicGap}px` }}>
        <AnimatePresence mode="wait">
          {isHostingVisible ? (
            <motion.div 
              key="hosting-open"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex flex-col-reverse justify-end pointer-events-none" 
              style={{ gap: `${dynamicGap}px` }}
            >
              {/* Close toggle — flecha diagonal ↘ sup-izq → inf-der */}
              <div className="flex gap-2" style={{ gap: `${dynamicGap}px` }}>
                <div style={{ width: overlayBtnSize, height: overlayBtnSize }} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsHostingVisible(false)}
                  style={{ width: overlayBtnSize, height: overlayBtnSize }}
                  className="rounded-lg bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center pointer-events-auto transition-all duration-200"
                >
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: dynamicIconSize + 4, height: dynamicIconSize + 4 }}>
                    <line x1="3" y1="3" x2="17" y2="17" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                    <polyline points="9,17 17,17 17,9" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>

              {/* Joystick Dinámico Toggle - encima de la flecha bajar */}
              {showDynamicToggle && (activeOverlay !== 'trackpad' || showAddMode) && (
                <div className="flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowAddMode(false); setAddLayerPath([]); setActiveOverlay('trackpad'); }}
                    style={{ width: overlayBtnSize, height: overlayBtnSize }}
                    className="bg-gradient-to-br from-violet-900 via-purple-950 to-indigo-950 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/40 pointer-events-auto relative overflow-hidden transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: dynamicIconSize + 2, height: dynamicIconSize + 2 }}>
                      {/* Base del joystick */}
                      <ellipse cx="12" cy="19" rx="7" ry="3" stroke="#a78bfa" strokeWidth="1.5"/>
                      {/* Palo */}
                      <line x1="12" y1="19" x2="10" y2="9" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
                      {/* Bola superior */}
                      <circle cx="10" cy="7.5" r="2.5" fill="#a78bfa"/>
                    </svg>
                  </motion.button>
                </div>
              )}

              {/* IA Button - ABOVE HIDE */}
              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenIA}
                  style={{ width: overlayBtnSize, height: overlayBtnSize }}
                  className="bg-[#1A1500] text-[#FFD700] rounded-lg flex items-center justify-center font-black tracking-[0.1em] shadow-[0_0_15px_rgba(255,215,0,0.15),inset_0_0_10px_rgba(255,215,0,0.1)] border border-[#FFD700]/40 pointer-events-auto relative overflow-hidden transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent pointer-events-none" />
                  <span style={{ fontSize: `${iaFontSize}px` }} className="relative z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">IA</span>
                </motion.button>
              </div>

              {/* Tools Button (Futuristic) - ABOVE IA */}
              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveOverlay(activeOverlay === 'tools' ? 'trackpad' : 'tools')}
                  style={{ width: overlayBtnSize, height: overlayBtnSize }}
                  className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 text-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2),inset_0_0_10px_rgba(34,211,238,0.1)] border border-cyan-500/40 pointer-events-auto relative overflow-hidden transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none" />
                  <Settings style={{ width: dynamicIconSize, height: dynamicIconSize }} className="relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" strokeWidth={2} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="hosting-closed"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex flex-col-reverse justify-end pointer-events-none" 
              style={{ gap: `${dynamicGap}px` }}
            >
              {/* Back Button (Silver) — alineado con open toggle */}
              <div className="flex" style={{ gap: `${dynamicGap}px` }}>
                <div style={{ width: overlayBtnSize, height: overlayBtnSize }} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  style={{ width: overlayBtnSize, height: overlayBtnSize }}
                  className="bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-md border border-slate-200/50 pointer-events-auto transition-all duration-200"
                >
                  <ArrowLeft style={{ width: dynamicIconSize + 4, height: dynamicIconSize + 4 }} strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Open toggle — flecha diagonal ↖ inf-der → sup-izq */}
              <div className="flex gap-2" style={{ gap: `${dynamicGap}px` }}>
                <div style={{ width: overlayBtnSize, height: overlayBtnSize }} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsHostingVisible(true)}
                  style={{ width: overlayBtnSize, height: overlayBtnSize }}
                  className="rounded-lg bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center pointer-events-auto transition-all duration-200"
                >
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: dynamicIconSize + 4, height: dynamicIconSize + 4 }}>
                    <line x1="17" y1="17" x2="3" y2="3" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                    <polyline points="11,3 3,3 3,11" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default function TesoUniversalList({ title = "LISTADO", items, onBack, onOpenIA, onItemDoubleTap }: TesoUniversalListProps) {
  const { isHostingVisible, setIsHostingVisible } = useSettings();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeOverlay, setActiveOverlay] = useState<'trackpad' | 'none' | 'filters' | 'actions' | 'modes' | 'actions_enviar' | 'tools' | 'tools_velocidad' | 'tools_velocidad_listado' | 'tools_velocidad_hosting' | 'tools_tamano' | 'tools_tamano_letra' | 'tools_tamano_hosting' | 'tools_tamano_iconos'>('trackpad');
  const [searchQuery, setSearchQuery] = useState('');
  const [listScrollSpeed, setListScrollSpeed] = useState(() => Number(localStorage.getItem('teso_listScrollSpeed')) || 5);
  const [hostingScrollSpeed, setHostingScrollSpeed] = useState(() => Number(localStorage.getItem('teso_hostingScrollSpeed')) || 5);
  const [hostingSize, setHostingSize] = useState(() => Number(localStorage.getItem('teso_hostingSize')) || 7);
  const [fontSizeLevel, setFontSizeLevel] = useState(() => Number(localStorage.getItem('teso_fontSizeLevel')) || 1);
  const [iconSizeLevel, setIconSizeLevel] = useState(() => Number(localStorage.getItem('teso_iconSizeLevel')) || 5);
  const [listOffset, setListOffset] = useState({ x: 0, y: 0 });
  const [targetedItemId, setTargetedItemId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('teso_listScrollSpeed', listScrollSpeed.toString());
  }, [listScrollSpeed]);
  useEffect(() => {
    localStorage.setItem('teso_hostingScrollSpeed', hostingScrollSpeed.toString());
  }, [hostingScrollSpeed]);
  useEffect(() => {
    localStorage.setItem('teso_hostingSize', hostingSize.toString());
  }, [hostingSize]);
  useEffect(() => {
    localStorage.setItem('teso_fontSizeLevel', fontSizeLevel.toString());
  }, [fontSizeLevel]);
  useEffect(() => {
    localStorage.setItem('teso_iconSizeLevel', iconSizeLevel.toString());
  }, [iconSizeLevel]);
  const listRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<Record<string, number>>({});
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Ficha Técnica State
  const [selectedExtintor, setSelectedExtintor] = useState<TesoListItemData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [extintorData, setExtintorData] = useState<any>({});
  const itemLongPressTimer = useRef<Record<string, NodeJS.Timeout>>({});

  const updateTargetedItem = useCallback(() => {
    if (!isHostingVisible || activeOverlay !== 'trackpad') {
      setTargetedItemId(null);
      return;
    }
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const centerEl = document.elementFromPoint(centerX, centerY);
    
    let newTargetId: string | null = null;
    if (selectedExtintor) {
      const fieldRow = centerEl?.closest('[data-field-id]');
      newTargetId = fieldRow ? fieldRow.getAttribute('data-field-id') : null;
    } else {
      const row = centerEl?.closest('[data-item-id]');
      newTargetId = row ? row.getAttribute('data-item-id') : null;
    }

    if (newTargetId !== targetedItemId) {
      if (newTargetId && navigator.vibrate) {
        navigator.vibrate(10); // Vibración leve al "enganchar"
      }
      setTargetedItemId(newTargetId);
    }
  }, [isHostingVisible, activeOverlay, selectedExtintor, targetedItemId]);

  useEffect(() => {
    updateTargetedItem();
  }, [updateTargetedItem, items, searchQuery]);

  // Scroll to top when ficha opens
  useEffect(() => {
    if (selectedExtintor && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [selectedExtintor]);

  const snapToTarget = () => {
    if (!listRef.current) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const centerEl = document.elementFromPoint(centerX, centerY) as HTMLElement;

    const targetRow = centerEl?.closest('[data-item-id], [data-field-id]') as HTMLElement;
    if (targetRow) {
      const rect = targetRow.getBoundingClientRect();
      const rowCenterY = rect.top + rect.height / 2;
      const diff = rowCenterY - centerY;
      
      // Snap if it's close enough (e.g., within half a row height)
      if (Math.abs(diff) > 1 && Math.abs(diff) < 40) {
        listRef.current.scrollBy({ top: diff, behavior: 'smooth' });
      }
    }
  };

  const handleScroll = () => {
    requestAnimationFrame(updateTargetedItem);
    
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      snapToTarget();
    }, 150);
  };

  const openFicha = (item: TesoListItemData) => {
    const itemAny = item as any;
    setSelectedExtintor(item);
    setExtintorData({
      ...item,
      type: itemAny.type || item.name,
      client: itemAny.client || 'Empresa Demo S.L.',
      installDate: itemAny.installDate || '2024-01-15',
      lastRev: itemAny.lastRev || '2025-01-10',
      nextRev: itemAny.nextRev || '2026-01-10',
      state: itemAny.state || 'Operativo',
      responsible: itemAny.responsible || 'Juan Pérez',
      serial: itemAny.serial || `SN-${Math.floor(Math.random()*10000)}`,
      capacity: itemAny.capacity || '6 kg',
      pressure: itemAny.pressure || '15 bar',
      notes: itemAny.notes || 'Sin observaciones.',
    });
  };

  const handleItemPointerDown = (item: TesoListItemData) => {
    itemLongPressTimer.current[item.id] = setTimeout(() => {
      openFicha(item);
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }, 1000);
  };

  const handleItemPointerUp = (item: TesoListItemData) => {
    if (itemLongPressTimer.current[item.id]) {
      clearTimeout(itemLongPressTimer.current[item.id]);
    }
  };

  const handleItemClick = (item: TesoListItemData) => {
    const now = Date.now();
    const last = lastClickTime.current[item.id] || 0;
    
    if (now - last < 500) {
      // Doble toque: abre el elemento
      onItemDoubleTap?.(item);
      lastClickTime.current[item.id] = 0; // reset
    } else {
      // Un toque: selecciona/deselecciona
      lastClickTime.current[item.id] = now;
      toggleSelection(item.id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  };

  const handlePan = (dx: number, dy: number) => {
    if (listRef.current) {
      if (editingField) setEditingField(null);
      
      const absDy = Math.abs(dy);
      let speedFactor = 1;
      
      // Base speed factor based on movement size
      if (absDy < 2) speedFactor = 0.3; // Very slow for precise movements
      else if (absDy < 5) speedFactor = 0.6;
      else if (absDy < 15) speedFactor = 1.0;
      else if (absDy < 30) speedFactor = 1.5;
      else speedFactor = 2.0; // Fast for large swipes

      // Scale speed factor based on list size for large lists
      if (items.length > 20 && absDy >= 5) {
        // Increase speed progressively based on list size, up to a max multiplier
        const listMultiplier = Math.min(3.0, 1 + (items.length - 20) * 0.05);
        speedFactor *= listMultiplier;
      }

      // Apply user-selected speed multiplier (1-9, default 5)
      const userSpeedMultiplier = hostingScrollSpeed / 5;
      speedFactor *= userSpeedMultiplier;

      // Resistencia suave al pasar de elemento (magnetic feel)
      const resistance = targetedItemId ? 0.4 : 1.0;

      listRef.current.scrollTop -= dy * speedFactor * resistance;
    }
  };

  const handleSelectFromCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const centerEl = document.elementFromPoint(centerX, centerY);
    
    if (selectedExtintor) {
      // In Ficha view, single tap on trackpad could also select field, but user asked for long press.
      // We can make single tap also select field for convenience.
      const fieldRow = centerEl?.closest('[data-field-id]');
      if (fieldRow) {
        const fieldId = fieldRow.getAttribute('data-field-id');
        if (fieldId) {
          setEditingField(fieldId);
          setTimeout(() => {
            const input = fieldRow.querySelector('input, textarea') as HTMLElement;
            if (input) input.focus();
          }, 50);
        }
      }
      return;
    }

    const row = centerEl?.closest('[data-item-id]');
    
    if (row) {
      const id = row.getAttribute('data-item-id');
      if (id) {
        const item = items.find(i => i.id === id);
        if (item) {
          handleItemClick(item);
        }
      }
    }
  };

  const handleLongPressCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const centerEl = document.elementFromPoint(centerX, centerY);
    
    if (selectedExtintor) {
      const fieldRow = centerEl?.closest('[data-field-id]');
      if (fieldRow) {
        const fieldId = fieldRow.getAttribute('data-field-id');
        if (fieldId) {
          setEditingField(fieldId);
          setTimeout(() => {
            const input = fieldRow.querySelector('input, textarea') as HTMLElement;
            if (input) input.focus();
          }, 50);
        }
      }
    } else {
      const row = centerEl?.closest('[data-item-id]');
      if (row) {
        const id = row.getAttribute('data-item-id');
        const item = items.find(i => i.id === id);
        if (item) openFicha(item);
      }
    }
  };

  const toggleSelection = (id: string) => {
    const newSel = new Set(selectedIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedIds(newSel);
  };

  const getDensityClass = () => {
    const count = items.length;
    if (count <= 10) return 'py-2 text-base';
    if (count <= 20) return 'py-1.5 text-sm';
    return 'py-1 text-xs';
  };
  const densityClass = getDensityClass();

  const getGridOptions = () => {
    switch (activeOverlay) {
      case 'filters': return ['Ubicación', 'Estado', 'Tipo', 'Tiempo', 'Prioridad', 'Responsable', 'Relación', 'Propiedades', 'ID'];
      case 'actions': return ['Abrir', 'Editar', 'Historial', 'Copiar', 'Mover', 'Marcar', 'Enviar', 'Exportar', 'Eliminar'];
      case 'modes': return ['Ver', 'Selección', 'Edición', 'Ordenar', 'Agrupar', 'Compacto', 'Expandido', 'MULTI VISITA', 'Resumen'];
      case 'actions_enviar': return ['WhatsApp', 'Email', 'SMS', 'Sistema', 'PDF', 'Excel', 'Imprimir', 'Nube', 'Otro'];
      case 'tools': return ['Velocidad', 'Tema', 'Tamaño', 'Densidad', 'Háptica', 'Idioma', 'Exportar', 'Nube', 'Reset'];
      case 'tools_velocidad': return ['Hosting', 'Listado', 'Selección', 'Animación', 'Arrastre', 'Scroll', 'Doble Toque', 'Gestos', 'Por Defecto'];
      case 'tools_tamano': return ['Hosting', 'Letra', 'Iconos', 'Botones', 'Margen', 'Espacio', 'Grosor', 'Sombra', 'Borde'];
      case 'tools_tamano_letra': return ['Aa', 'Texto', 'Botón', 'Teso', 'Listado', 'Ficha', 'Grande', 'Título', 'MÁXIMO'];
      case 'tools_tamano_iconos': return ['Settings', 'ArrowLeft', 'ChevronDown', 'Search', 'Check', 'Plus', 'Cloud', 'Trash', 'Menu'];
      default: return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050A15] text-white font-sans flex justify-center overflow-hidden relative">
      
      <div className="w-full max-w-md min-h-[100dvh] relative flex flex-col">
        
        {/* Pulsors (Targets) */}
        {activeOverlay === 'trackpad' && isHostingVisible && (
          <>
            {/* Center Pulsor (Fixed Control) */}
            <div 
              id="center-pulsor"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center drop-shadow-[0_0_8px_rgba(0,0,0,1)] pointer-events-none"
            >
              <div className="w-12 h-12 rounded-full border-[2.5px] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.8),inset_0_0_15px_rgba(255,215,0,0.5)] flex items-center justify-center bg-transparent relative">
                {/* Spinning dashed ring */}
                <div className="absolute inset-[-5px] rounded-full border-[2px] border-dashed border-[#FFD700] animate-[spin_6s_linear_infinite]" />
                {/* Inner spinning ring reverse */}
                <div className="absolute inset-[4px] rounded-full border-[2px] border-[#FFD700] animate-[spin_4s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
                <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,1)]" />
              </div>
            </div>
          </>
        )}

        {/* List Area or Ficha Técnica (Behind everything) */}
        <div 
          ref={listRef}
          onScroll={handleScroll}
          className={`absolute inset-0 overflow-y-auto overflow-x-hidden z-0 pointer-events-auto no-scrollbar transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 80px, black 120px, black calc(100% - 120px), transparent calc(100% - 40px))',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 80px, black 120px, black calc(100% - 120px), transparent calc(100% - 40px))'
          }}
        >
          {selectedExtintor ? (
            <div className="w-full px-4 sm:px-6 pt-24 pb-[60vh]">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setSelectedExtintor(null)} className="p-2 bg-white/10 rounded-lg">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-black text-[#D4AF37] flex-1">FICHA TÉCNICA</h2>
                <button 
                  onClick={() => toggleSelection(selectedExtintor.id)}
                  className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${selectedIds.has(selectedExtintor.id) ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'bg-transparent border-white/20 text-white'}`}
                >
                  {selectedIds.has(selectedExtintor.id) ? <Check className="w-6 h-6" strokeWidth={4} /> : <div className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: 'id', label: 'Código', type: 'text' },
                  { id: 'type', label: 'Tipo', type: 'text' },
                  { id: 'location', label: 'Ubicación', type: 'text' },
                  { id: 'client', label: 'Empresa / Cliente', type: 'text' },
                  { id: 'installDate', label: 'Fecha Instalación', type: 'date' },
                  { id: 'lastRev', label: 'Última Revisión', type: 'date' },
                  { id: 'nextRev', label: 'Próxima Revisión', type: 'date' },
                  { id: 'state', label: 'Estado', type: 'text' },
                  { id: 'responsible', label: 'Responsable', type: 'text' },
                  { id: 'serial', label: 'Número de Serie', type: 'text' },
                  { id: 'capacity', label: 'Capacidad', type: 'text' },
                  { id: 'pressure', label: 'Presión', type: 'text' },
                  { id: 'notes', label: 'Observaciones', type: 'textarea' },
                ].map(field => (
                  <div 
                    key={field.id}
                    data-field-id={field.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${editingField === field.id ? 'bg-[#D4AF37]/20 border-[#D4AF37]' : targetedItemId === field.id ? 'bg-white/10 border-[#FFD700]/60 shadow-[inset_0_0_20px_rgba(255,215,0,0.15),0_0_15px_rgba(255,215,0,0.2)] scale-[1.02] z-10 relative' : 'bg-white/5 border-white/10'}`}
                    onClick={() => setEditingField(field.id)}
                  >
                    {/* Visual Projection Pulsor */}
                    {targetedItemId === field.id && activeOverlay === 'trackpad' && isHostingVisible && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-[1.5px] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] flex items-center justify-center pointer-events-none opacity-80">
                        <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                      </div>
                    )}
                    <label className={`text-[10px] uppercase font-bold tracking-wider mb-1 block transition-colors ${targetedItemId === field.id ? 'text-white' : 'text-white/50'}`}>{field.label}</label>
                    {editingField === field.id ? (
                      field.type === 'textarea' ? (
                        <textarea 
                          className="w-full bg-transparent text-white font-bold outline-none resize-none"
                          value={extintorData[field.id] || ''}
                          onChange={(e) => setExtintorData({...extintorData, [field.id]: e.target.value})}
                          onBlur={() => setEditingField(null)}
                          autoFocus
                          rows={3}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          name={`field_${Math.random().toString(36).substring(7)}`}
                          role="presentation"
                        />
                      ) : (
                        <input 
                          type={field.type === 'date' ? 'date' : 'text'}
                          className="w-full bg-transparent text-white font-bold outline-none"
                          value={extintorData[field.id] || ''}
                          onChange={(e) => setExtintorData({...extintorData, [field.id]: e.target.value})}
                          onBlur={() => setEditingField(null)}
                          autoFocus
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          name={`field_${Math.random().toString(36).substring(7)}`}
                          role="presentation"
                        />
                      )
                    ) : (
                      <div className="text-white font-bold min-h-[24px]">
                        {extintorData[field.id] || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full px-4 sm:px-6" style={{ paddingTop: 'calc(50vh - 52px)', paddingBottom: '70vh' }}>
              <div className="flex justify-end mb-2 pr-2">
                <span className="text-white text-xs font-bold tracking-widest uppercase opacity-80">CÓDIGO</span>
              </div>
              {items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <div 
                  key={item.id}
                  data-item-id={item.id}
                  className={`flex items-center justify-between border-b border-white/10 active:bg-white/5 transition-all duration-200 select-none cursor-pointer [-webkit-touch-callout:none] [-webkit-user-select:none] ${densityClass} ${targetedItemId === item.id ? 'bg-white/10 shadow-[inset_0_0_25px_rgba(255,215,0,0.1),0_0_20px_rgba(255,215,0,0.15)] border-[#FFD700]/50 scale-[1.02] rounded-lg px-2 -mx-2 z-10 relative' : ''}`}
                  onClick={() => handleItemClick(item)}
                  onPointerDown={() => handleItemPointerDown(item)}
                  onPointerUp={() => handleItemPointerUp(item)}
                  onPointerCancel={() => handleItemPointerUp(item)}
                  onPointerLeave={() => handleItemPointerUp(item)}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                >
                  {/* Visual Projection Pulsor */}
                  {targetedItemId === item.id && activeOverlay === 'trackpad' && isHostingVisible && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-[1.5px] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] flex items-center justify-center pointer-events-none opacity-80 z-20">
                      <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                    </div>
                  )}
              {/* LEFT */}
              <div className={`flex items-center gap-3 overflow-hidden flex-1 pointer-events-none ${targetedItemId === item.id ? 'pl-8' : ''}`}>
                <div 
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-white"
                  style={{ 
                    backgroundColor: LIST_COLORS[item.stateColor].bg,
                  }}
                >
                  {selectedIds.has(item.id) && (
                    <Check style={{ color: LIST_COLORS[item.stateColor].check }} className="w-5 h-5" strokeWidth={4} />
                  )}
                </div>
                <div className="flex items-center gap-2 truncate text-left flex-1">
                  <span className="font-bold shrink-0">{item.id}</span>
                  <span className="truncate">{item.name}</span>
                  <span className="text-white text-xs shrink-0 ml-auto">{item.location}</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center flex-shrink-0 ml-4 pointer-events-none">
                <span className="font-bold text-lg text-right">{item.numericValue}</span>
              </div>
            </div>
          ))}
          </div>
          )}
        </div>

        {/* Foreground (Floating elements) */}
        <div className="absolute inset-0 h-full flex flex-col z-50 pointer-events-none">
          
          {/* Header */}
          <header className={`flex justify-between items-center pt-6 px-4 sm:px-6 pb-4 bg-gradient-to-b from-[#050A15] via-[#050A15]/90 to-transparent pointer-events-auto transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-black tracking-tight text-left">TESO</p>
            </div>
            <p className="text-xl font-black tracking-tight text-white uppercase text-right leading-none">
              {selectedExtintor ? 'FICHA' : title}
            </p>
          </header>

          {/* Search Bar (Only when filters active) */}
          {activeOverlay === 'filters' && (
            <div className="px-4 sm:px-6 pointer-events-auto mt-4">
              <div className="flex items-center gap-2 bg-[#050A15]/95 backdrop-blur p-3 rounded border border-white/20 shadow-lg">
                <Search className="w-5 h-5 text-white/50" />
                <input 
                  type="text"
                  placeholder="BUSCAR..." 
                  className="bg-transparent outline-none flex-1 text-xs font-mono uppercase text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  name={`teso_search_${Math.random().toString(36).substring(7)}`}
                  role="presentation"
                  onFocus={(e) => {
                    e.target.setAttribute('autocomplete', 'off');
                    e.target.setAttribute('role', 'presentation');
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Interaction Section (Thumb-friendly) */}
        <HostingButtons 
          onOpenIA={onOpenIA}
          onBack={selectedExtintor ? () => setSelectedExtintor(null) : onBack}
          activeOverlay={activeOverlay}
          setActiveOverlay={setActiveOverlay}
          getGridOptions={getGridOptions}
          onPan={handlePan}
          onSelectFromCenter={handleSelectFromCenter}
          onLongPressCenter={handleLongPressCenter}
          isHostingVisible={isHostingVisible}
          setIsHostingVisible={setIsHostingVisible}
          onSelectAll={() => {
            const allSelected = selectedIds.size === items.length && items.length > 0;
            if (allSelected) setSelectedIds(new Set());
            else setSelectedIds(new Set(items.map(i => i.id)));
          }}
          allSelected={selectedIds.size === items.length && items.length > 0}
          isFichaVisible={!!selectedExtintor}
          onSpeedSelect={setListScrollSpeed}
          onHostingSpeedSelect={setHostingScrollSpeed}
          onHostingSizeSelect={setHostingSize}
          onFontSizeSelect={setFontSizeLevel}
          onIconSizeSelect={setIconSizeLevel}
          hostingSize={hostingSize}
          fontSizeLevel={fontSizeLevel}
          iconSizeLevel={iconSizeLevel}
          hostingScrollSpeed={hostingScrollSpeed}
          listScrollSpeed={listScrollSpeed}
          showDynamicToggle={false}
        />
      </div>
    </div>
  );
}
