import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PlusCircle, SearchCheck, SlidersHorizontal, Settings, MapPin, MessageSquareMore } from 'lucide-react';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useLongPress } from '../hooks/useLongPress';
import { useSettings } from '../contexts/SettingsContext';
import { useLayerId } from '../contexts/LayerContext';

interface CentroPageProps {
  centroNames: Record<number, string>;
  setCentroNames: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onBack: () => void;
  onGoLanding: () => void;
  onSelectCentros2: () => void;
  onSelectZonas: (centroId: number) => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const BUTTONS = [
  { id: 1, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[1] },
  { id: 2, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[2] },
  { id: 3, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[3] },
  { id: 4, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[4] },
  { id: 5, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[5] },
  { id: 6, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[6] },
  { id: 7, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[7] },
  { id: 8, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[8] },
  { id: 9, label: 'EDITAR CENTRO', subLabel: 'Puls+ 1 Seg', color: TESO_COLORS[9] },
];

function CentroButton({ 
  btn, 
  onSelect, 
  onEdit, 
  isBlackText, 
  onBack, 
  onGoLanding, 
  onSelectCentros2 
}: any) {
  const contextLayerId = useLayerId();
  const { fontSize: globalFontSize, iconSize: globalIconSize, showIcons: globalShowIcons, showText: globalShowText, getLayerSettings } = useSettings();
  
  const layerSettings = contextLayerId ? getLayerSettings(contextLayerId) : {};
  const fontSize = layerSettings.fontSize ?? globalFontSize;
  const iconSize = layerSettings.iconSize ?? globalIconSize;
  const showIcons = layerSettings.showIcons ?? globalShowIcons;
  const showText = layerSettings.showText ?? globalShowText;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(btn.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlers = useLongPress({
    onShortPress: () => {
      if (isEditing) return;
      onSelect(btn.id);
    },
    onLongPress: () => {
      setIsEditing(true);
      setEditValue(btn.label);
    },
    longPressThreshold: 1000,
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue.trim() !== '' && editValue.trim() !== btn.label) {
      onEdit(btn.id, editValue.trim());
    } else {
      setEditValue(btn.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(btn.label);
    }
  };

  return (
    <motion.button
      whileTap={isEditing ? {} : { scale: 0.95 }}
      {...(isEditing ? {} : handlers)}
      onContextMenu={(e) => e.preventDefault()}
      className={`${btn.color} aspect-square rounded-2xl flex flex-col items-start p-3 shadow-lg relative overflow-hidden group`}
    >
      <span className={`text-lg font-black leading-none ${isBlackText ? 'text-black' : 'text-white'}`}>{btn.id}</span>
      <div className="flex-1 flex flex-col items-center justify-center w-full drop-shadow-md">
        {showIcons && btn.icon && (
          <div 
            style={{ width: iconSize, height: iconSize }}
            className={`flex items-center justify-center ${isBlackText ? 'text-black' : 'text-white'}`}
          >
            {React.isValidElement(btn.icon) 
              ? React.cloneElement(btn.icon as React.ReactElement<any>, { 
                  className: `${(btn.icon as React.ReactElement<any>).props.className || ''} w-full h-full`.replace(/w-\d+|h-\d+|sm:w-\d+|sm:h-\d+/g, '').trim() 
                }) 
              : btn.icon}
          </div>
        )}
        {(btn.label || isEditing) && (
          <div className={`flex flex-col items-center justify-center w-full ${isBlackText ? 'text-black' : 'text-white'}`}>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                style={{ fontSize: fontSize }}
                className={`w-full bg-black/10 text-center font-bold uppercase tracking-wider leading-tight rounded px-1 py-1 outline-none focus:ring-2 focus:ring-white/50 ${isBlackText ? 'text-black placeholder-black/50' : 'text-white placeholder-white/50'}`}
                placeholder="NOMBRE CENTRO"
              />
            ) : (
              showText && (
                <span 
                  style={{ fontSize: fontSize }}
                  className={`max-w-[85%] w-full flex items-center justify-center text-center break-normal whitespace-normal overflow-hidden line-clamp-2 font-black uppercase tracking-tighter leading-[1.1] mb-1 drop-shadow-sm`}
                >
                  {btn.label}
                </span>
              )
            )}
            {btn.subLabel && !isEditing && showText && (
              <span 
                style={{ fontSize: fontSize * 0.8 }}
                className={`font-bold tracking-wider text-center leading-tight mt-2`}
              >
                {btn.subLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-40" />
    </motion.button>
  );
}

export default function CentroPage({ centroNames, setCentroNames, onBack, onGoLanding, onSelectCentros2, onSelectZonas, onOpenIA, onOpenConfiguracion }: CentroPageProps) {
  const { isHostingVisible } = useSettings();
  const [buttons, setButtons] = useState(BUTTONS);

  // Sync state with BUTTONS constant in case of hot reloads during development
  React.useEffect(() => {
    setButtons(BUTTONS.map(b => ({
      ...b,
      label: centroNames[b.id] || b.label
    })));
  }, [centroNames]);

  const handleEdit = (id: number, newLabel: string) => {
    setCentroNames(prev => ({ ...prev, [id]: newLabel }));
    setButtons(prev => prev.map(b => b.id === id ? { ...b, label: newLabel } : b));
  };

  // Buttons 1-4 are "light" (black text), 5-9 are "dark" (white text)
  const isBlackText = (id: number) => id < 5;

  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
    longPressThreshold: 1000,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/10 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-white" />
            <p className="text-2xl font-black tracking-tight text-white uppercase">CENTROS 1</p>
          </div>
        </header>

        {/* Main 3x3 Grid */}
        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {buttons.map((btn) => (
            <CentroButton
              key={btn.id}
              btn={btn}
              onSelect={onSelectZonas}
              onEdit={handleEdit}
              isBlackText={isBlackText(btn.id)}
              onBack={onBack}
              onGoLanding={onGoLanding}
              onSelectCentros2={onSelectCentros2}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="centros"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
          onAdd={onSelectCentros2}
        >
          {buttons.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectZonas(btn.id)}
              className={`${btn.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{btn.id}</span>
            </motion.button>
          ))}
        </TesoHosting>

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Gestión de Centros Operativos</p>
        </footer>
      </div>
    </div>
  );
}
