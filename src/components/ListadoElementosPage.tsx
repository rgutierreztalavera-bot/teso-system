import React, { useMemo } from 'react';
import TesoUniversalList, { TesoListItemData } from './TesoUniversalList';

interface PlacedElement {
  id: string;
  category: string;
  subcategory: string;
  type: string;
  x: number;
  y: number;
  zoneId: string | null;
  colorKey?: number;
  subZoneId?: string;
}

interface ListadoElementosPageProps {
  zoneId: string;
  subZoneId: string | null;
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

function loadPlacedElements(): PlacedElement[] {
  try {
    const raw = localStorage.getItem('teso_placedElements');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function ListadoElementosPage({
  zoneId,
  subZoneId,
  onBack,
  onGoLanding,
  onOpenIA,
  onOpenConfiguracion,
}: ListadoElementosPageProps) {

  const title = subZoneId
    ? `LISTADO · ${subZoneId}`
    : `LISTADO · ${zoneId}`;

  const items: TesoListItemData[] = useMemo(() => {
    const all = loadPlacedElements();
    return all
      .filter((el) => {
        if (el.zoneId !== zoneId) return false;
        if (subZoneId && el.subZoneId !== subZoneId) return false;
        return true;
      })
      .map((el, i) => ({
        id: el.id,
        name: el.type,
        location: el.subZoneId ?? el.zoneId ?? '',
        stateColor: ((el.colorKey ?? 5) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
        numericValue: i + 1,
      }));
  }, [zoneId, subZoneId]);

  return (
    <TesoUniversalList
      title={title}
      items={items}
      onBack={onBack}
      onOpenIA={onOpenIA || (() => {})}
      onItemDoubleTap={() => {}}
    />
  );
}
