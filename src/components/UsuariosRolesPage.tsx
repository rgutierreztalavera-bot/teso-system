import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PlusCircle, SlidersHorizontal, Users, Shield, Key, UserPlus, GitBranch, Activity, MailPlus, UserX, FileSearch, MessageSquareMore } from 'lucide-react';
import TesoHosting from './TesoHosting';
import { TESO_COLORS, TesoColorKey } from '../constants';
import { useLongPress } from '../hooks/useLongPress';
import TesoListItem from './TesoListItem';

import { useSettings } from '../contexts/SettingsContext';

interface UsuariosRolesPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const USUARIOS_LIST = [
  { id: 1, label: 'USUARIOS', icon: <Users className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '10:00' },
  { id: 2, label: 'ROLES', icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '11:00' },
  { id: 3, label: 'PERMISOS', icon: <Key className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '12:00' },
  { id: 4, label: 'ASIGNACIÓN', icon: <UserPlus className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '13:00' },
  { id: 5, label: 'JERARQUÍA', icon: <GitBranch className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '14:00' },
  { id: 6, label: 'ACTIVIDAD', icon: <Activity className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '15:00' },
  { id: 7, label: 'INVITAR', icon: <MailPlus className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '16:00' },
  { id: 8, label: 'BLOQUEOS', icon: <UserX className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '17:00' },
  { id: 9, label: 'AUDITORÍA', icon: <FileSearch className="w-7 h-7 sm:w-8 sm:h-8" />, location: 'Sistema', lastAction: '18:00' },
];

export default function UsuariosRolesPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: UsuariosRolesPageProps) {
  const { isHostingVisible } = useSettings();
  const longPressBack = useLongPress({
    onShortPress: onBack,
    onLongPress: onGoLanding,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/10 flex flex-col items-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}>
        
        {/* Header */}
        <header className={`space-y-1 pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">TESO</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">USUARIOS</p>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
        </header>

        {/* List */}
        <main className={`flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-2 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {USUARIOS_LIST.map((item) => (
            <TesoListItem
              key={item.id}
              id={item.id}
              name={item.label}
              location={item.location}
              lastAction={item.lastAction}
              colorKey={item.id as TesoColorKey}
              onClick={() => {}}
            />
          ))}
        </main>

        {/* Interaction Section (Thumb-friendly) */}
        <TesoHosting 
          layerId="usuarios-roles"
          onBack={onBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
        />

        <footer className={`text-center pb-4 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white font-bold">Gestión de Usuarios y Roles</p>
        </footer>
      </div>
    </div>
  );
}
