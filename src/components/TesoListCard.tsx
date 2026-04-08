import React from 'react';
import { motion } from 'motion/react';
import { TESO_COLOR_INDICATORS, TesoColorKey } from '../constants';

interface TesoListCardProps {
  key?: React.Key;
  id: string | number;
  name: string;
  location: string;
  lastAction: string;
  color: TesoColorKey;
  onClick: () => void;
}

export default function TesoListCard({ id, name, location, lastAction, color, onClick }: TesoListCardProps) {
  const indicator = TESO_COLOR_INDICATORS[color];
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-2 p-1.5 border-b border-white/5 hover:bg-white/5 transition-colors text-left"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-black tracking-tighter opacity-80 w-4">{id}</span>
        <span className="text-sm font-bold truncate uppercase">{name}</span>
        <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${indicator.bg}`} />
        <span className="text-[14px] font-bold opacity-80 truncate uppercase">{location}</span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-black uppercase opacity-80">{lastAction}</p>
      </div>
    </motion.button>
  );
}
