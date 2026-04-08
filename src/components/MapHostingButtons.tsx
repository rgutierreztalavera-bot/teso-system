import React from 'react';
import { TesoHostingButtons } from './TesoHostingButtons';

interface MapHostingButtonsProps {
  onOpenIA: () => void;
  onBack: () => void;
  isHostingVisible: boolean;
  setIsHostingVisible: (visible: boolean) => void;
  onPan: (dx: number, dy: number) => void;
}

export const MapHostingButtons: React.FC<MapHostingButtonsProps> = ({
  onOpenIA,
  onBack,
  isHostingVisible,
  setIsHostingVisible,
  onPan
}) => {
  const [activeOverlay, setActiveOverlay] = React.useState<'trackpad' | 'none' | 'filters' | 'actions' | 'modes' | 'actions_enviar' | 'tools' | 'tools_velocidad' | 'tools_velocidad_listado' | 'tools_velocidad_hosting' | 'tools_tamano' | 'tools_tamano_letra' | 'tools_tamano_hosting' | 'tools_tamano_iconos'>('trackpad');

  const getGridOptions = () => {
    if (activeOverlay === 'trackpad') return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  };

  return (
    <TesoHostingButtons
      onOpenIA={onOpenIA}
      onBack={onBack}
      activeOverlay={activeOverlay}
      setActiveOverlay={setActiveOverlay}
      getGridOptions={getGridOptions}
      onPan={onPan}
      onSelectFromCenter={() => console.log('Select from center')}
      isHostingVisible={isHostingVisible}
      setIsHostingVisible={setIsHostingVisible}
      onSelectAll={() => console.log('Select all')}
      allSelected={false}
      hostingSize={5}
      fontSizeLevel={5}
      iconSizeLevel={5}
    />
  );
};
