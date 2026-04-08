import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  PlusCircle, 
  SlidersHorizontal, 
  MessageSquareMore, 
  Volume2, 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  X, 
  Maximize2, 
  Loader2,
  Mail,
  Smartphone,
  Cloud,
  Share2,
  MessageCircle,
  Send,
  Slack,
  Globe,
  UploadCloud,
  ArrowDown,
  ArrowUp,
  Search,
  LayoutGrid
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useLayerId } from '../contexts/LayerContext';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';

// ── Datos "Incorporar elemento" ─────────────────────────────────────────────
const INC_L1 = ['Seguridad','Maquinaria','Herramientas','Material','Instalaciones','Personas','Vehículos','Documentación','Otros'];
const INC_L2: Record<string, string[]> = {
  'Seguridad':     ['Extintores','Alarmas','Señalización','EPIs','Detectores','Cámaras','Control accesos','Emergencias','Otros'],
  'Maquinaria':    ['Producción','Industrial','Líneas','Equipos','Automatización','Control','Energía','Mantenimiento','Otros'],
  'Herramientas':  ['Manuales','Eléctricas','Medición','Corte','Montaje','Limpieza','Taller','Precisión','Otros'],
  'Material':      ['Oficina','Producción','Almacén','Limpieza','Recambios','Embalaje','Consumibles','Stock','Otros'],
  'Instalaciones': ['Oficinas','Almacén','Producción','Muelles','Salas','Zonas comunes','Técnicas','Exteriores','Otros'],
  'Personas':      ['Trabajadores','Técnicos','Supervisores','Dirección','Mantenimiento','Seguridad','Limpieza','Externos','Otros'],
  'Vehículos':     ['Coches','Furgonetas','Camiones','Carretillas','Maquinaria móvil','Transporte int.','Logística','Flota','Otros'],
  'Documentación': ['Certificados','Revisiones','Contratos','Manuales','Fichas téc.','Informes','Permisos','Normativa','Otros'],
  'Otros':         ['Animales','Eventos','Pruebas','Temporal','Urgente','Experimental','Mixto','General','Otros'],
};
const INC_L3: Record<string, string[]> = {
  'Seguridad/Extintores':   ['Polvo','CO₂','Agua','Espuma','Automático','Industrial','Portátil','Móvil','Otros'],
  'Material/Oficina':       ['Ordenadores','Pantallas','Mesas','Sillas','Impresoras','Teléfonos','Archivadores','Papelería','Otros'],
  'Vehículos/Coches':       ['Gasolina','Diésel','Eléctrico','Híbrido','Empresa','Renting','Operativo','Reserva','Otros'],
  'Maquinaria/Producción':  ['Corte','Montaje','Envasado','Transporte','Control','Robotizada','Manual','Mixta','Otros'],
};
const INC_DEFAULT_L3 = ['Tipo 1','Tipo 2','Tipo 3','Tipo 4','Tipo 5','Tipo 6','Tipo 7','Tipo 8','Otros'];

interface TesoHostingProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA: () => void;
  onOpenConfiguracion?: () => void;
  onAdd?: () => void;
  layerId: string;
  showPulsor?: boolean;
  className?: string;
  children?: React.ReactNode;
  breadcrumbItems?: { title: string; path: string[] }[];
  onNavigate?: (path: string[]) => void;
}

export default function TesoHosting({ 
  onBack, 
  onGoLanding, 
  onOpenIA, 
  onOpenConfiguracion, 
  onAdd,
  layerId,
  showPulsor = false,
  className = "mt-auto",
  children,
  breadcrumbItems: _breadcrumbItems,
  onNavigate: _onNavigate,
}: TesoHostingProps) {
  const { 
    configMode, 
    setConfigMode, 
    setLayerSetting, 
    getLayerSettings, 
    motherHostingFontSize, 
    motherHostingIconSize,
    motherHostingShowText,
    motherHostingShowIcons,
    setMotherHostingFontSize,
    setMotherHostingIconSize,
    setMotherHostingShowIcons,
    setMotherHostingShowText,
    resetLayerSettings,
    isHostingVisible,
    setIsHostingVisible
  } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [showPlayBar, setShowPlayBar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playBarScale, setPlayBarScale] = useState(1);
  const [showCommLayer, setShowCommLayer] = useState(false);
  const [showDynamic, setShowDynamic] = useState(false);
  const [showAddMode, setShowAddMode] = useState(false);
  const [addLayerPath, setAddLayerPath] = useState<number[]>([]);

  const dynIsDragging = useRef(false);
  const dynLastPos = useRef({ x: 0, y: 0 });

  const handleDynPointerDown = (e: React.PointerEvent) => {
    dynIsDragging.current = true;
    dynLastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleDynPointerMove = (e: React.PointerEvent) => {
    if (!dynIsDragging.current) return;
    const dx = e.clientX - dynLastPos.current.x;
    const dy = e.clientY - dynLastPos.current.y;
    dynLastPos.current = { x: e.clientX, y: e.clientY };
    const scrollable = document.querySelector('[data-teso-scroll]') as HTMLElement | null;
    if (scrollable) {
      scrollable.scrollTop -= dy;
      scrollable.scrollLeft -= dx;
    } else {
      window.scrollBy(-dx, -dy);
    }
  };
  const handleDynPointerUp = (e: React.PointerEvent) => {
    dynIsDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

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
      onAdd?.();
      setShowAddMode(false);
      setShowDynamic(false);
      setAddLayerPath([]);
    }
  };
  const handleAddBack = () => {
    if (addLayerPath.length > 0) {
      setAddLayerPath(addLayerPath.slice(0, -1));
    } else {
      setShowAddMode(false);
      setShowDynamic(false);
    }
  };

  const layerSettings = getLayerSettings(layerId);
  const currentFontSize = layerSettings.fontSize ?? motherHostingFontSize;
  const currentIconSize = layerSettings.iconSize ?? motherHostingIconSize;
  const currentShowText = layerSettings.showText ?? motherHostingShowText;
  const currentShowIcons = layerSettings.showIcons ?? motherHostingShowIcons;

  const longPressBack = useLongPress({
    onShortPress: () => {
      if (configMode !== 'none') {
        setConfigMode('none');
      } else {
        onBack();
      }
    },
    onLongPress: onGoLanding,
    longPressThreshold: 500,
  });

  const handleNumericClick = (num: number) => {
    if (showPlayBar) {
      const newSpeed = 1 + (num - 1) * 0.1875;
      setPlaybackSpeed(newSpeed);
      return;
    }

    if (configMode === 'text') {
      const newSize = 8 + (num - 1) * 2;
      if (layerId) {
        setLayerSetting(layerId, 'fontSize', newSize);
      } else {
        setMotherHostingFontSize(newSize);
      }
    } else if (configMode === 'icons') {
      const newSize = 32 + (num - 1) * 8;
      if (layerId) {
        setLayerSetting(layerId, 'iconSize', newSize);
      } else {
        setMotherHostingIconSize(newSize);
      }
    }
  };

  const getMenuLabel = (num: number) => {
    return num.toString();
  };

  const commButtons = [
    { id: 1, label: 'E-MAIL', icon: <Mail className="w-8 h-8" /> },
    { id: 2, label: 'SMS', icon: <Smartphone className="w-8 h-8" /> },
    { id: 3, label: 'NUBE', icon: <UploadCloud className="w-8 h-8" /> },
    { id: 4, label: 'REDES', icon: <Share2 className="w-8 h-8" /> },
    { id: 5, label: 'WHATSAPP', icon: <MessageCircle className="w-8 h-8" /> },
    { id: 6, label: 'TELEGRAM', icon: <Send className="w-8 h-8" /> },
    { id: 7, label: 'SLACK', icon: <Slack className="w-8 h-8" /> },
    { id: 8, label: 'WEB', icon: <Globe className="w-8 h-8" /> },
    { id: 9, label: 'TESO', icon: <Loader2 className="w-8 h-8" /> },
  ];

  const activeNum = showPlayBar
    ? Math.round((playbackSpeed - 1) / 0.1875) + 1
    : configMode === 'text' 
      ? Math.round((currentFontSize - 8) / 2) + 1 
      : configMode === 'icons' 
        ? Math.round((currentIconSize - 32) / 8) + 1 
        : null;

  return (
    <div className={`z-50 flex flex-col items-end gap-3 pointer-events-none shrink-0 ${className}`}>
      
      {/* Show Hosting Button (Floating at bottom right when hidden) */}
      <AnimatePresence>
        {!isHostingVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsHostingVisible(true)}
            className="fixed bottom-5 right-5 w-14 h-14 bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)] rounded-lg flex items-center justify-center pointer-events-auto z-[60]"
          >
            <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M18 6v8M18 6H10" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHostingVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="flex flex-col items-end gap-3"
          >
            {/* Pulsor Giratorio (Spinning Indicator) */}
            {showPulsor && (
              <div className="absolute top-[-300px] left-[-300px] pointer-events-none">
                <div className="w-16 h-16 rounded-full border-[2.5px] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.8),inset_0_0_15px_rgba(255,215,0,0.5)] flex items-center justify-center bg-transparent relative">
                  <div className="absolute inset-[-5px] rounded-full border-[2px] border-dashed border-[#FFD700] animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-[4px] rounded-full border-[2px] border-[#FFD700] animate-[spin_4s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
                  <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,1)]" />
                </div>
              </div>
            )}

            {/* Communication Layer Overlay */}
            <AnimatePresence>
              {showCommLayer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-neutral-900/95 border border-orange-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto mb-2"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-orange-500 font-black tracking-widest text-xs uppercase">Comunicación</h3>
                    <button onClick={() => setShowCommLayer(false)} className="text-white/40 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {commButtons.map((btn) => (
                      <motion.button
                        key={btn.id}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 bg-gradient-to-br from-amber-700/20 to-orange-950/40 border border-orange-500/20 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-orange-500/20 transition-colors"
                      >
                        <div className="text-orange-400">{btn.icon}</div>
                        <span className="text-[8px] font-black text-white/60">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 items-end">
              {/* Play Bar */}
              <AnimatePresence>
                {showPlayBar && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, scale: playBarScale }}
                    exit={{ x: -20, opacity: 0 }}
                    className="bg-neutral-900/95 border border-white/20 rounded-xl p-2 flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md shrink-0 pointer-events-auto"
                  >
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
                    </motion.button>
                    <div className="flex flex-col w-full items-center px-0.5">
                      <span className="text-[9px] font-black text-white leading-none">0:00</span>
                      <span className="text-[8px] font-bold text-yellow-500 leading-none mt-1">{playbackSpeed.toFixed(2)}x</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <motion.button whileTap={{ scale: 0.9 }} className="w-8 h-8 bg-white/5 text-white rounded-md flex items-center justify-center border border-white/5"><RotateCcw size={14} /></motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} className="w-8 h-8 bg-white/5 text-white rounded-md flex items-center justify-center border border-white/5"><RotateCw size={14} /></motion.button>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => setPlayBarScale(prev => prev === 1 ? 1.3 : 1)}
                      className="w-8 h-8 bg-yellow-500/10 text-yellow-500 rounded-md flex items-center justify-center border border-yellow-500/10"
                    >
                      <Maximize2 size={14} />
                    </motion.button>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPlayBar(false)}
                      className="w-8 h-8 bg-red-500/10 text-red-500 rounded-md flex items-center justify-center border border-red-500/10"
                    >
                      <X size={14} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Interaction Section */}
              {showDynamic ? (
                <section className="flex flex-row gap-2 items-end pointer-events-auto">
                  {/* Dynamic Joystick Left Column: Tools, IA, Ocultar */}
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-white rounded-lg flex items-center justify-center shadow-md border border-cyan-400/30"
                    >
                      <SlidersHorizontal className="w-8 h-8" strokeWidth={2.5} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={onOpenIA}
                      className="w-14 h-14 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 text-yellow-950 rounded-lg flex items-center justify-center font-black text-xl shadow-md border border-yellow-300/50"
                    >
                      IA
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsHostingVisible(false)}
                      className="w-14 h-14 bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950 text-[#D4AF37] rounded-lg flex items-center justify-center shadow-md border border-white/10"
                    >
                      <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 6L6 18M6 18V10M6 18H14" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Dynamic Joystick Right Square: trackpad + corner buttons */}
                  <div className="relative" style={{ width: 184, height: 184 }}>
                    {/* Mode button — top right */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ width: 48, height: 48 }}
                      className="absolute top-1 right-1 rounded-lg bg-gradient-to-br from-[#4A3018] via-[#2A1A0A] to-[#1A0F05] border border-[#8B5A2B]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                    >
                      <SlidersHorizontal className="w-6 h-6 text-[#D4AF37]" strokeWidth={2.5} />
                    </motion.button>
                    {/* Filter button — top left */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ width: 48, height: 48 }}
                      className="absolute top-1 left-1 rounded-lg bg-gradient-to-br from-orange-800 via-orange-950 to-neutral-950 border border-orange-800/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                    >
                      <Search className="w-6 h-6 text-orange-200" strokeWidth={2.5} />
                    </motion.button>
                    {/* Actions button — bottom left */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ width: 48, height: 48 }}
                      className="absolute bottom-1 left-1 rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 border border-zinc-600/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center z-20 pointer-events-auto"
                    >
                      <LayoutGrid className="w-6 h-6 text-zinc-100" strokeWidth={2.5} />
                    </motion.button>
                    {/* Back to Fijo — bottom right */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDynamic(false)}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ width: 48, height: 48 }}
                      className="absolute bottom-1 right-1 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 rounded-lg flex items-center justify-center shadow-md border border-slate-200/50 z-20 pointer-events-auto"
                    >
                      <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
                    </motion.button>
                    {/* Trackpad circle */}
                    <div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-[inset_0_0_20px_rgba(212,175,55,0.1),0_10px_20px_rgba(0,0,0,0.8)] border border-yellow-900/50 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing select-none [-webkit-touch-callout:none] [-webkit-user-select:none] overflow-hidden pointer-events-auto"
                      onPointerDown={handleDynPointerDown}
                      onPointerMove={handleDynPointerMove}
                      onPointerUp={handleDynPointerUp}
                      onPointerCancel={handleDynPointerUp}
                      onPointerLeave={handleDynPointerUp}
                      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                    >
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      <div
                        className="rounded-full bg-gradient-to-br from-yellow-950 to-black shadow-[inset_0_0_15px_rgba(212,175,55,0.2),0_0_20px_rgba(212,175,55,0.1)] border border-yellow-600/30 flex items-center justify-center pointer-events-none relative"
                        style={{ width: 120, height: 120 }}
                      >
                        <div className="absolute inset-0 rounded-full border border-yellow-500/30 animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                        <div
                          className="rounded-full bg-gradient-to-br from-yellow-900 to-black shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center relative"
                          style={{ width: 79, height: 79 }}
                        >
                          <div
                            className="rounded-full bg-yellow-500/10 border border-yellow-400/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                            style={{ width: 40, height: 40 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
              <section className="flex flex-col items-end gap-2 pointer-events-auto">
                {/* Top Row */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPlayBar(!showPlayBar)}
                    className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white rounded-lg flex items-center justify-center shadow-md border border-blue-400/50"
                  >
                    <Volume2 className="w-8 h-8" strokeWidth={2.5} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsListening(!isListening)}
                    className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-md border transition-all ${
                      isListening ? 'bg-red-500 animate-pulse border-red-400' : 'bg-gradient-to-br from-indigo-400 via-indigo-600 to-indigo-800 text-white border-indigo-400/50'
                    }`}
                  >
                    <Mic className="w-8 h-8" strokeWidth={2.5} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenIA}
                    className="w-14 h-14 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 text-yellow-950 rounded-lg flex items-center justify-center font-black text-xl shadow-md border border-yellow-300/50"
                  >
                    IA
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    {...longPressBack}
                    className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-md border transition-colors ${
                      configMode !== 'none' ? 'bg-gradient-to-br from-red-400 via-red-600 to-red-800 text-white border-red-400/50' : 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 border-slate-200/50'
                    }`}
                  >
                    <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
                  </motion.button>
                </div>

                {/* Bottom Grid Area */}
                <div className="flex gap-2 items-start">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (configMode !== 'none') {
                            setConfigMode('none');
                          } else if (onOpenConfiguracion) {
                            onOpenConfiguracion();
                          } else {
                            setConfigMode('text');
                          }
                        }}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-md border transition-all ${
                          configMode !== 'none' ? 'bg-white text-black border-white ring-4 ring-white/20' : 'bg-gradient-to-br from-orange-800 via-orange-950 to-neutral-950 text-orange-200 border-orange-800/50'
                        }`}
                      >
                        <SlidersHorizontal className="w-8 h-8" strokeWidth={2.5} />
                      </motion.button>
                    </div>

                    {/* Dynamic joystick (left) + Plus (right) */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowDynamic(true); setShowAddMode(false); setAddLayerPath([]); }}
                        className="bg-gradient-to-br from-violet-900 via-purple-950 to-indigo-950 w-14 h-14 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/40 pointer-events-auto"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                          <ellipse cx="12" cy="19" rx="7" ry="3" stroke="#a78bfa" strokeWidth="1.5"/>
                          <line x1="12" y1="19" x2="10" y2="9" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="10" cy="7.5" r="2.5" fill="#a78bfa"/>
                        </svg>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => showAddMode ? handleAddBack() : (setShowAddMode(true), setAddLayerPath([]))}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-md border transition-colors ${showAddMode ? 'bg-gradient-to-br from-amber-700 via-amber-900 to-neutral-950 border-amber-500/50 text-amber-100' : 'bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 text-zinc-100 border-zinc-400/50'}`}
                      >
                        {showAddMode ? <ArrowLeft className="w-8 h-8" strokeWidth={2.5} /> : <PlusCircle className="w-8 h-8" strokeWidth={2.5} />}
                      </motion.button>
                    </div>

                    {/* Minimize (left) + Communications (right) */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsHostingVisible(false)}
                        className="bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950 text-[#D4AF37] w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-white/10"
                      >
                        <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 6L6 18M6 18V10M6 18H14" />
                        </svg>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCommLayer(!showCommLayer)}
                        className="bg-gradient-to-br from-amber-700 via-orange-800 to-orange-950 text-orange-100 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-orange-500/50"
                      >
                        <MessageSquareMore className="w-8 h-8" strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-[184px] h-[184px] relative">
                    {showAddMode && (
                      <div className="absolute -top-5 left-0 right-0 text-center z-10 pointer-events-none">
                        <span className="text-[6.5px] font-black text-[#D4AF37] tracking-wider bg-black/80 px-2 py-0.5 rounded border border-yellow-900/40">{getAddBreadcrumb()}</span>
                      </div>
                    )}
                    {showAddMode ? (
                      getAddItems().map((item, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddSelect(i)}
                          className={`${TESO_COLORS[(i + 1) as keyof typeof TESO_COLORS]} w-14 h-14 rounded-lg flex items-center justify-center border border-white/5 shadow-sm`}
                        >
                          <span className="font-black leading-tight text-center px-0.5" style={{ fontSize: '7px' }}>{item}</span>
                        </motion.button>
                      ))
                    ) : configMode !== 'none' || showPlayBar || !children ? (
                      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <motion.button
                          key={num}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleNumericClick(num)}
                          className={`${TESO_COLORS[num as keyof typeof TESO_COLORS]} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm transition-all ${
                            configMode !== 'none' ? (num === activeNum ? 'ring-4 ring-white scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'opacity-40 scale-90') : ''
                          }`}
                        >
                          <span className="text-center leading-none" style={{ fontSize: '16px' }}>
                            {getMenuLabel(num)}
                          </span>
                        </motion.button>
                      ))
                    ) : (
                      children
                    )}
                  </div>
                </div>
              </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
