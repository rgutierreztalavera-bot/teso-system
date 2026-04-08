import React from 'react';
import { motion } from 'motion/react';
import { TESO_COLORS, TesoColorKey } from '../constants';
import { useSettings } from '../contexts/SettingsContext';

interface TesoListItemProps {
  key?: React.Key;
  id: number;
  name: string;
  location: string;
  lastAction: string;
  colorKey: TesoColorKey;
  onClick: () => void;
}

export default function TesoListItem({ id, name, location, lastAction, colorKey, onClick }: TesoListItemProps) {
  const { fontSize } = useSettings();
  const isBlackText = colorKey < 5;
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        ${TESO_COLORS[colorKey]} 
        w-full p-4 rounded-2xl flex items-center justify-between 
        border border-white/10 shadow-lg
      `}
    >
      <div className="flex items-center gap-4">
        <span 
          style={{ fontSize: fontSize * 1.5 }}
          className={`font-black ${isBlackText ? 'text-black/50' : 'text-white/50'}`}
        >
          {id}
        </span>
        <div className="flex flex-col items-start">
          <span 
            style={{ fontSize: fontSize * 1.2 }}
            className={`font-black uppercase ${isBlackText ? 'text-black' : 'text-white'}`}
          >
            {name}
          </span>
          <span 
            style={{ fontSize: fontSize * 0.9 }}
            className={`font-medium ${isBlackText ? 'text-black/70' : 'text-white/70'}`}
          >
            {location}
          </span>
        </div>
      </div>
      <span 
        style={{ fontSize: fontSize * 0.9 }}
        className={`font-bold ${isBlackText ? 'text-black/60' : 'text-white/60'}`}
      >
        {lastAction}
      </span>
    </motion.button>
  );
}
