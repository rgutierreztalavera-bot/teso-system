import React from 'react';
import { motion } from 'motion/react';
import TesoUniversalList, { TesoListItemData } from './TesoUniversalList';

interface ListadoExtintoresPageProps {
  zonaName: string;
  onBack: () => void;
  onGoLanding: () => void;
  onSelectExtintor: (id: number) => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

const EXTINTORES_LIST: TesoListItemData[] = [
  // Color 9 (Black) - 91 to 99
  { id: 'EXT-099', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 9, numericValue: 99 },
  { id: 'EXT-095', name: 'Extintor CO2', location: 'Zona B', stateColor: 9, numericValue: 95 },
  { id: 'EXT-091', name: 'Extintor Agua', location: 'Zona C', stateColor: 9, numericValue: 91 },
  // Color 8 - 81 to 89
  { id: 'EXT-088', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 8, numericValue: 88 },
  { id: 'EXT-085', name: 'Extintor CO2', location: 'Zona B', stateColor: 8, numericValue: 85 },
  { id: 'EXT-082', name: 'Extintor Agua', location: 'Zona C', stateColor: 8, numericValue: 82 },
  // Color 7 - 71 to 79
  { id: 'EXT-079', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 7, numericValue: 79 },
  { id: 'EXT-075', name: 'Extintor CO2', location: 'Zona B', stateColor: 7, numericValue: 75 },
  { id: 'EXT-071', name: 'Extintor Agua', location: 'Zona C', stateColor: 7, numericValue: 71 },
  // Color 6 - 61 to 69
  { id: 'EXT-068', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 6, numericValue: 68 },
  { id: 'EXT-065', name: 'Extintor CO2', location: 'Zona B', stateColor: 6, numericValue: 65 },
  { id: 'EXT-062', name: 'Extintor Agua', location: 'Zona C', stateColor: 6, numericValue: 62 },
  // Color 5 - 51 to 59
  { id: 'EXT-059', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 5, numericValue: 59 },
  { id: 'EXT-055', name: 'Extintor CO2', location: 'Zona B', stateColor: 5, numericValue: 55 },
  { id: 'EXT-051', name: 'Extintor Agua', location: 'Zona C', stateColor: 5, numericValue: 51 },
  // Color 4 - 41 to 49
  { id: 'EXT-048', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 4, numericValue: 48 },
  { id: 'EXT-045', name: 'Extintor CO2', location: 'Zona B', stateColor: 4, numericValue: 45 },
  { id: 'EXT-042', name: 'Extintor Agua', location: 'Zona C', stateColor: 4, numericValue: 42 },
  // Color 3 - 31 to 39
  { id: 'EXT-039', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 3, numericValue: 39 },
  { id: 'EXT-035', name: 'Extintor CO2', location: 'Zona B', stateColor: 3, numericValue: 35 },
  { id: 'EXT-031', name: 'Extintor Agua', location: 'Zona C', stateColor: 3, numericValue: 31 },
  // Color 2 - 21 to 29
  { id: 'EXT-028', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 2, numericValue: 28 },
  { id: 'EXT-025', name: 'Extintor CO2', location: 'Zona B', stateColor: 2, numericValue: 25 },
  { id: 'EXT-022', name: 'Extintor Agua', location: 'Zona C', stateColor: 2, numericValue: 22 },
  // Color 1 - 11 to 19
  { id: 'EXT-019', name: 'Extintor Polvo ABC', location: 'Zona A', stateColor: 1, numericValue: 19 },
  { id: 'EXT-015', name: 'Extintor CO2', location: 'Zona B', stateColor: 1, numericValue: 15 },
  { id: 'EXT-011', name: 'Extintor Agua', location: 'Zona C', stateColor: 1, numericValue: 11 },
];

export default function ListadoExtintoresPage({ 
  zonaName, 
  onBack, 
  onGoLanding, 
  onSelectExtintor,
  onOpenIA,
  onOpenConfiguracion
}: ListadoExtintoresPageProps) {
  return (
    <TesoUniversalList 
      title="LISTADO EXTINTORES"
      items={EXTINTORES_LIST.map(item => ({
        ...item,
        location: `${zonaName} - ${item.location}`
      }))}
      onBack={onBack}
      onGoLanding={onGoLanding}
      onOpenIA={onOpenIA || (() => {})}
      onItemDoubleTap={(item) => onSelectExtintor(parseInt(item.id.replace('EXT-', '')))}
    />
  );
}
