/**
 * TESO System Color Palette
 * Standardized colors for the 3x3 grid interface.
 */
/**
 * TESO System Color Palette
 * Standardized colors for the 3x3 grid interface.
 */
export const TESO_COLORS = {
  1: 'bg-white text-black',
  2: 'bg-[#F5E6AB] text-black',
  3: 'bg-[#FFB3FF] text-black',
  4: 'bg-[#FFFF00] text-black',
  5: 'bg-[#228B22] text-white',
  6: 'bg-[#0044FF] text-white',
  7: 'bg-[#633F1B] text-white',
  8: 'bg-[#666666] text-white',
  9: 'bg-black text-white border border-white/20',
} as const;

export const TESO_COLOR_INDICATORS = {
  1: { bg: 'bg-white' },
  2: { bg: 'bg-[#F5E6AB]' },
  3: { bg: 'bg-[#FFB3FF]' },
  4: { bg: 'bg-[#FFFF00]' },
  5: { bg: 'bg-[#228B22]' },
  6: { bg: 'bg-[#0044FF]' },
  7: { bg: 'bg-[#633F1B]' },
  8: { bg: 'bg-[#666666]' },
  9: { bg: 'bg-black' },
} as const;

export type TesoColorKey = keyof typeof TESO_COLORS;

/** Hex fill colors for SVG icon rendering — matches TESO_COLORS 1-9 */
export const TESO_COLOR_HEX: Record<number, string> = {
  1: '#ffffff',
  2: '#F5E6AB',
  3: '#FFB3FF',
  4: '#FFFF00',
  5: '#228B22',
  6: '#0044FF',
  7: '#633F1B',
  8: '#888888',
  9: '#1a1a1a',
};

/** Slightly darker stroke colors for SVG icons */
export const TESO_COLOR_STROKE: Record<number, string> = {
  1: '#999999',
  2: '#b89a30',
  3: '#cc55cc',
  4: '#b8a000',
  5: '#145214',
  6: '#002ea8',
  7: '#3d2710',
  8: '#444444',
  9: '#555555',
};

/** Zones shown in the main building map */
export const TESO_ZONES: Array<{ id: string; label: string }> = [
  { id: 'ALMACÉN',       label: 'ALMACÉN' },
  { id: 'PRODUCCIÓN',    label: 'PRODUCCIÓN' },
  { id: 'OFICINAS',      label: 'OFICINAS' },
  { id: 'ACCESO',        label: 'ACCESO' },
  { id: 'CARGA',         label: 'CARGA' },
  { id: 'ZONAS COMUNES', label: 'ZONAS COMUNES' },
  { id: 'VESTUARIOS',    label: 'VESTUARIOS' },
  { id: 'SALA TÉCNICA',  label: 'SALA TÉCNICA' },
];

/** Sub-zones per zone — auto-detected from SVG coordinates (900×700 viewport) */
export const TESO_SUBZONES: Record<string, Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>> = {
  'ALMACÉN': [
    { id: 'MUELLES RECEPCIÓN',  x1:   6, y1:   6, x2: 158, y2: 352 },
    { id: 'MUELLES EXPEDICIÓN', x1:   6, y1: 352, x2: 158, y2: 692 },
    { id: 'CUARENTENA',         x1: 208, y1:   6, x2: 370, y2: 180 },
    { id: 'ALTA ROTACIÓN',      x1: 208, y1: 180, x2: 720, y2: 520 },
    { id: 'ZONA PICKING',       x1: 208, y1: 520, x2: 720, y2: 692 },
    { id: 'CÁMARA FRIGORÍFICA', x1: 720, y1:   6, x2: 894, y2: 352 },
    { id: 'OFICINA WMS',        x1: 720, y1: 352, x2: 894, y2: 520 },
  ],
  'OFICINAS': [
    { id: 'OPEN OFFICE NORTE',  x1:   8, y1:  56, x2: 608, y2: 318 },
    { id: 'OPEN OFFICE SUR',    x1:   8, y1: 382, x2: 608, y2: 644 },
    { id: 'SALA ALFA',          x1: 615, y1:  56, x2: 892, y2: 187 },
    { id: 'SALA BETA',          x1: 615, y1: 187, x2: 892, y2: 318 },
    { id: 'PASILLO CENTRAL',    x1:   8, y1: 318, x2: 892, y2: 382 },
  ],
  'PRODUCCIÓN': [
    { id: 'ZONA NORTE',         x1:   8, y1:   6, x2: 892, y2: 350 },
    { id: 'ZONA SUR',           x1:   8, y1: 350, x2: 892, y2: 694 },
  ],
};
