import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, PlusCircle, SlidersHorizontal, MessageSquareMore } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';
import TesoListCard from './TesoListCard';
import TesoHosting from './TesoHosting';
import { TESO_COLORS, TesoColorKey } from '../constants';

interface Extintor {
  id: string;
  nombre: string;
  ubicacion: string;
  ultimaAccion: string;
}

const EXAMPLE_DATA: Extintor[] = [
  { id: '01', nombre: 'EXTINTOR 01', ubicacion: 'Taller - Zona A', ultimaAccion: '10:15' },
  { id: '02', nombre: 'EXTINTOR 02', ubicacion: 'Almacén - Zona B', ultimaAccion: '11:30' },
  { id: '03', nombre: 'EXTINTOR 03', ubicacion: 'Oficina - Zona C', ultimaAccion: '12:45' },
  { id: '04', nombre: 'EXTINTOR 04', ubicacion: 'Entrada - Zona D', ultimaAccion: '14:00' },
  { id: '05', nombre: 'EXTINTOR 05', ubicacion: 'Cocina - Zona E', ultimaAccion: '15:15' },
  { id: '06', nombre: 'EXTINTOR 06', ubicacion: 'Pasillo - Zona F', ultimaAccion: '16:30' },
  { id: '07', nombre: 'EXTINTOR 07', ubicacion: 'Parking - Zona G', ultimaAccion: '17:45' },
  { id: '08', nombre: 'EXTINTOR 08', ubicacion: 'Muelle - Zona H', ultimaAccion: '19:00' },
  { id: '09', nombre: 'EXTINTOR 09', ubicacion: 'Sótano - Zona I', ultimaAccion: '20:15' },
];

interface UltimosUsadosPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onSelectExtintor: (id: string) => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

import { useSettings } from '../contexts/SettingsContext';

export default function UltimosUsadosPage({ onBack, onGoLanding, onSelectExtintor, onOpenIA, onOpenConfiguracion }: UltimosUsadosPageProps) {
  const { isHostingVisible } = useSettings();
  const [search, setSearch] = useState('');
  const longPressBack = useLongPress({ onShortPress: onBack, onLongPress: onGoLanding });

  const filteredData = EXAMPLE_DATA.filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans selection:bg-white/10 flex flex-col items-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        
        {/* Header - Minimalist */}
        <header className={`flex justify-between items-baseline pt-2 border-b border-white/10 pb-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-lg font-black tracking-tighter">TESO</p>
          <p className="text-xs font-black tracking-widest text-white uppercase">ÚLTIMOS USADOS</p>
        </header>

        {/* Search */}
        <div className={`relative transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="BUSCAR EQUIPO..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[14px] font-bold placeholder:text-white/10 focus:outline-none focus:border-white/20 uppercase"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <main className={`flex flex-col overflow-y-auto transition-all duration-500 ${isHostingVisible ? 'max-h-[55vh]' : 'max-h-[70vh] scale-110'}`}>
          {filteredData.map((item, index) => (
            <TesoListCard
              key={item.id}
              id={item.id}
              name={item.nombre}
              location={item.ubicacion}
              lastAction={item.ultimaAccion}
              color={((index % 9) + 1) as TesoColorKey}
              onClick={() => onSelectExtintor(item.id)}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="ultimos-usados"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        >
          <></>
        </TesoHosting>
      </div>
    </div>
  );
}
