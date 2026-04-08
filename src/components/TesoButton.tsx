import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { useLayerId } from '../contexts/LayerContext';

interface TesoButtonProps {
  key?: React.Key;
  id?: number;
  label: string;
  icon?: React.ReactNode;
  image?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
  showId?: boolean;
  layerId?: string;
  centerContent?: boolean;
  fontSize?: number;
  iconSize?: number;
  showIcons?: boolean;
  showText?: boolean;
}

export default function TesoButton({ 
  id, 
  label, 
  icon, 
  image, 
  color, 
  onClick, 
  className, 
  showId = true, 
  layerId, 
  centerContent = false,
  fontSize: overrideFontSize,
  iconSize: overrideIconSize,
  showIcons: overrideShowIcons,
  showText: overrideShowText
}: TesoButtonProps) {
  const contextLayerId = useLayerId();
  const effectiveLayerId = layerId || contextLayerId;
  const { fontSize: globalFontSize, iconSize: globalIconSize, showIcons: globalShowIcons, showText: globalShowText, getLayerSettings } = useSettings();

  const layerSettings = effectiveLayerId ? getLayerSettings(effectiveLayerId) : {};
  
  const fontSize = overrideFontSize ?? (layerSettings.fontSize ?? globalFontSize);
  const iconSize = overrideIconSize ?? (layerSettings.iconSize ?? globalIconSize);
  const showIcons = overrideShowIcons ?? (layerSettings.showIcons ?? globalShowIcons);
  const showText = overrideShowText ?? (layerSettings.showText ?? globalShowText);

  const isBlackText = id !== undefined && id < 5;

  return (
    <motion.button
      id={id !== undefined ? `teso-button-${id}` : undefined}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${color || 'bg-white/5'} 
        aspect-square rounded-2xl flex flex-col items-center p-3 shadow-lg 
        transition-shadow hover:shadow-white/5 relative overflow-hidden group
        ${centerContent ? 'justify-center' : 'justify-between'}
        ${className || ''}
      `}
    >
      {showId && id !== undefined && (
        <span className={`${centerContent ? 'absolute top-3 left-3' : 'self-start'} text-lg font-black leading-none ${isBlackText ? 'text-black/60' : 'text-white/60'}`}>{id}</span>
      )}
      
      {(!centerContent || (showIcons && (icon || image))) && (
        <div className={`${centerContent ? '' : 'flex-1'} flex items-center justify-center w-full ${centerContent ? 'mb-2' : '-mt-2'} drop-shadow-md`}>
          {showIcons && (
            <>
              {icon && (
                <div 
                  style={{ width: iconSize, height: iconSize }} 
                  className={`flex items-center justify-center ${isBlackText ? 'text-black' : 'text-white'}`}
                >
                  {React.isValidElement(icon) 
                    ? React.cloneElement(icon as React.ReactElement<any>, { 
                        className: `${(icon as React.ReactElement<any>).props.className || ''} w-full h-full`.replace(/w-\d+|h-\d+|sm:w-\d+|sm:h-\d+/g, '').trim() 
                      }) 
                    : icon}
                </div>
              )}
              {image && (
                <img 
                  src={image} 
                  alt={label} 
                  style={{ width: iconSize, height: iconSize }} 
                  className={`object-contain ${isBlackText ? 'brightness-0' : ''}`}
                  referrerPolicy="no-referrer"
                />
              )}
            </>
          )}
        </div>
      )}

      {showText && (
        <span 
          style={{ fontSize: fontSize }}
          className={`max-w-[85%] w-full flex items-center justify-center text-center break-normal whitespace-normal overflow-hidden line-clamp-2 font-black uppercase tracking-tighter leading-[1.1] ${centerContent ? '' : 'mb-1'} drop-shadow-sm ${isBlackText ? 'text-black' : 'text-white'}`}
        >
          {label}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-40" />
    </motion.button>
  );
}
