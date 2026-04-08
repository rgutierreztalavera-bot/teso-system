import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Map as MapIcon, Info, ZoomIn, ZoomOut, Trash, X, Check } from 'lucide-react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { HostingButtons } from './TesoUniversalList';
import { useSettings } from '../contexts/SettingsContext';
import { TESO_COLOR_HEX, TESO_COLOR_STROKE, TESO_SUBZONES } from '../constants';

interface PlanoEmpresaPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA: () => void;
  onOpenConfiguracion?: () => void;
}

type OverlayType = 'trackpad' | 'none' | 'filters' | 'actions' | 'modes' | 'actions_enviar' | 'tools' | 'tools_velocidad' | 'tools_velocidad_listado' | 'tools_velocidad_hosting' | 'tools_tamano' | 'tools_tamano_letra' | 'tools_tamano_hosting' | 'tools_tamano_iconos';

// ── Pulsor ──────────────────────────────────────────────────────────────────
const Pulsor = ({ onDoubleTap }: { onDoubleTap?: () => void }) => {
  const lastTapRef = React.useRef(0);

  const handlePointerUp = (e: React.PointerEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      onDoubleTap?.();
      if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 60]);
    } else {
      lastTapRef.current = now;
      const overlay = e.currentTarget as HTMLElement;
      overlay.style.visibility = 'hidden';
      const below = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.visibility = '';
      if (below) (below as HTMLElement).click?.();
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center drop-shadow-[0_0_8px_rgba(0,0,0,1)]">
      <div className="pointer-events-none w-8 h-8 rounded-full border-[2px] border-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.8),inset_0_0_10px_rgba(255,215,0,0.5)] flex items-center justify-center bg-transparent relative">
        <div className="absolute inset-[-4px] rounded-full border-[1.5px] border-dashed border-[#FFD700] animate-[spin_6s_linear_infinite]" />
        <div className="absolute inset-[3px] rounded-full border-[1.5px] border-[#FFD700] animate-[spin_4s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,1)]" />
      </div>
      {onDoubleTap && (
        <div
          className="absolute w-16 h-16 rounded-full"
          style={{ pointerEvents: 'auto', touchAction: 'none' }}
          onPointerUp={handlePointerUp}
        />
      )}
    </div>
  );
};

// ── Pan bounds helper — corner of map stops at pulsor (screen center) ────────
const calcBounds = (
  px: number, py: number, scale: number,
  wrapper: HTMLDivElement | null, content: HTMLDivElement | null
) => {
  if (!wrapper || !content) return { x: px, y: py };
  const wW = wrapper.offsetWidth;
  const wH = wrapper.offsetHeight;
  const cW = content.offsetWidth * scale;
  const cH = content.offsetHeight * scale;
  return {
    x: Math.max(wW / 2 - cW, Math.min(wW / 2, px)),
    y: Math.max(wH / 2 - cH, Math.min(wH / 2, py)),
  };
};

// ── Pan Controller — conecta joystick con TransformWrapper ──────────────────
const MapPanController = memo(({ panRef, clampRef, stateRef, zoomRef }: {
  panRef: React.MutableRefObject<(dx: number, dy: number) => void>;
  clampRef: React.MutableRefObject<() => void>;
  stateRef?: React.MutableRefObject<() => { positionX: number; positionY: number; scale: number }>;
  zoomRef?: React.MutableRefObject<(delta: number) => void>;
}) => {
  const { setTransform, instance } = useControls();
  useEffect(() => {
    panRef.current = (dx: number, dy: number) => {
      const { positionX, positionY, scale } = instance.transformState;
      const { x, y } = calcBounds(positionX + dx * 2.5, positionY + dy * 2.5, scale, instance.wrapperComponent, instance.contentComponent);
      setTransform(x, y, scale, 0);
    };
    clampRef.current = () => {
      const { positionX, positionY, scale } = instance.transformState;
      const { x, y } = calcBounds(positionX, positionY, scale, instance.wrapperComponent, instance.contentComponent);
      if (x !== positionX || y !== positionY) setTransform(x, y, scale, 200);
    };
    if (stateRef) stateRef.current = () => instance.transformState;
    if (zoomRef) {
      zoomRef.current = (delta: number) => {
        const { positionX, positionY, scale } = instance.transformState;
        const wrapper = instance.wrapperComponent;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const lx = window.innerWidth / 2 - rect.left;
        const ly = window.innerHeight / 2 - rect.top;
        const minScale = 0.3;
        const maxScale = 8;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * (1 + delta)));
        const ratio = newScale / scale;
        const newX = lx - (lx - positionX) * ratio;
        const newY = ly - (ly - positionY) * ratio;
        const { x, y } = calcBounds(newX, newY, newScale, wrapper, instance.contentComponent);
        setTransform(x, y, newScale, 80);
      };
    }
  });
  return null;
});

// ── SVG Helpers ─────────────────────────────────────────────────────────────
const Col = ({ x, y }: { x: number; y: number }) => (
  <circle cx={x} cy={y} r="7" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
);
const Exit = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x="-18" y="-8" width="36" height="16" fill="#14532d" stroke="#16a34a" strokeWidth="1" rx="2" />
    <text textAnchor="middle" dominantBaseline="middle" fill="#4ade80" fontSize="7" fontWeight="bold">EXIT</text>
  </g>
);
const Extinguisher = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x - 3} y={y - 7} width="6" height="11" fill="#dc2626" rx="1.5" />
    <circle cx={x} cy={y - 9} r="3" fill="#7f1d1d" />
  </g>
);
const Door = ({ x, y, w, rot = 0 }: { x: number; y: number; w: number; rot?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <line x1="0" y1="0" x2={w} y2="0" stroke="#0a0a0a" strokeWidth="4" />
    <path d={`M0,0 Q${w},0 ${w},${w}`} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
  </g>
);
const Conveyor = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="4" strokeDasharray="10,6" opacity="0.85" />
    <line x1={x1} y1={y1 - 4} x2={x2} y2={y2 - 4} stroke="#92400e" strokeWidth="1" />
    <line x1={x1} y1={y1 + 4} x2={x2} y2={y2 + 4} stroke="#92400e" strokeWidth="1" />
  </>
);
const Machine = ({ x, y, w, h, label, color = '#1e293b', stroke = '#475569' }: { x: number; y: number; w: number; h: number; label: string; color?: string; stroke?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={color} stroke={stroke} strokeWidth="1.2" rx="2" />
    <rect x={x + 2} y={y + 2} width={w * 0.4} height="4" fill={stroke} opacity="0.5" rx="1" />
    <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="bold">{label}</text>
  </g>
);

// ── FLOOR PLANS ──────────────────────────────────────────────────────────────

const PlanoProduccion = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#f7f7f5' }}>
    <defs>
      <pattern id="p-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
      </pattern>
      <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#cccccc" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#p-grid)" />
    <rect x="8" y="8" width="884" height="684" fill="none" stroke="#888888" strokeWidth="3" rx="4" />
    {[80,220,360,500,640,780].map(cx => [60,190,320,450,580,650].map((cy,j) =>
      <rect key={`${cx}-${j}`} x={cx-5} y={cy-5} width="10" height="10" fill="#d8d8d8" stroke="#999999" strokeWidth="1" />
    ))}

    {/* MATERIA PRIMA */}
    <rect x="8" y="8" width="122" height="684" fill="#efefed" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="69" y="36" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold">MATERIA PRIMA</text>
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <g key={i}>
        <rect x="16" y={50+i*70} width="46" height="52" fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="0.8" rx="2" />
        <line x1="16" y1={76+i*70} x2="62" y2={76+i*70} stroke="#cccccc" strokeWidth="0.5" />
        <line x1="39" y1={50+i*70} x2="39" y2={102+i*70} stroke="#cccccc" strokeWidth="0.5" />
        <text x="39" y={80+i*70} textAnchor="middle" fill="#888888" fontSize="6">{`P-${i+1}`}</text>
        <rect x="70" y={50+i*70} width="50" height="52" fill="#e4e4e2" stroke="#c0c0c0" strokeWidth="0.8" rx="2" />
        <text x="95" y={80+i*70} textAnchor="middle" fill="#888888" fontSize="6">{`P-${i+10}`}</text>
      </g>
    ))}
    <g transform="translate(69,692)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>

    {/* LÍNEA 1 — MECANIZADO CNC */}
    <rect x="130" y="8" width="510" height="202" fill="#eaeaea" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="385" y="28" textAnchor="middle" fill="#555555" fontSize="10" fontWeight="bold">LÍNEA 1 — MECANIZADO CNC</text>
    <line x1="140" y1="120" x2="630" y2="120" stroke="#aaaaaa" strokeWidth="4" strokeDasharray="10,6" opacity="0.85" />
    <line x1="140" y1="116" x2="630" y2="116" stroke="#cccccc" strokeWidth="1" />
    <line x1="140" y1="124" x2="630" y2="124" stroke="#cccccc" strokeWidth="1" />
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x={145+i*96} y={38} width={78} height={68} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" />
        <rect x={147+i*96} y={40} width={31} height="4" fill="#bbbbbb" opacity="0.7" rx="1" />
        <circle cx={184+i*96} cy={75} r="12" fill="#e0e0de" stroke="#aaaaaa" strokeWidth="1" />
        <circle cx={184+i*96} cy={75} r="5" fill="#cccccc" opacity="0.6" />
        <text x={184+i*96} y="78" textAnchor="middle" fill="#888888" fontSize="6">5X</text>
        <text x={184+i*96} y={55} textAnchor="middle" fill="#666666" fontSize="7" fontWeight="bold">{`CNC-${i+1}`}</text>
      </g>
    ))}
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x={145+i*96} y={132} width={78} height={60} fill="#e8e8e6" stroke="#cccccc" strokeWidth="1.2" rx="2" />
        <rect x={147+i*96} y={134} width={31} height="4" fill="#cccccc" opacity="0.7" rx="1" />
        <text x={184+i*96} y={165} textAnchor="middle" fill="#888888" fontSize="7" fontWeight="bold">{`OP-${i+1}`}</text>
      </g>
    ))}
    <rect x="138" y="138" width="8" height="54" fill="#aaaaaa" opacity="0.4" />
    <g transform="translate(640,105) rotate(90)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>
    <g><rect x="137" y="18" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="140" cy="16" r="3" fill="#c0c0be" /></g>
    <g><rect x="617" y="18" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="620" cy="16" r="3" fill="#c0c0be" /></g>

    {/* LÍNEA 2 — SOLDADURA Y MONTAJE */}
    <rect x="130" y="210" width="510" height="210" fill="#f0f0ee" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="385" y="230" textAnchor="middle" fill="#555555" fontSize="10" fontWeight="bold">LÍNEA 2 — SOLDADURA Y MONTAJE</text>
    <line x1="140" y1="320" x2="630" y2="320" stroke="#aaaaaa" strokeWidth="4" strokeDasharray="10,6" opacity="0.85" />
    <line x1="140" y1="316" x2="630" y2="316" stroke="#cccccc" strokeWidth="1" />
    <line x1="140" y1="324" x2="630" y2="324" stroke="#cccccc" strokeWidth="1" />
    {[0,1,2].map(i => (
      <g key={i}>
        <rect x={145+i*155} y={243} width={130} height={64} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" />
        <text x={210+i*155} y={264} textAnchor="middle" fill="#666666" fontSize="8" fontWeight="bold">{`ROBOT-${i+1}`}</text>
        <circle cx={210+i*155} cy={285} r="18" fill="#ebebeb" stroke="#aaaaaa" strokeWidth="1" />
        <line x1={210+i*155} y1={267} x2={210+i*155} y2={303} stroke="#aaaaaa" strokeWidth="2" />
        <line x1={192+i*155} y1={285} x2={228+i*155} y2={285} stroke="#aaaaaa" strokeWidth="2" />
        <circle cx={210+i*155} cy={285} r="5" fill="#aaaaaa" opacity="0.7" />
      </g>
    ))}
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x={145+i*96} y={332} width={78} height={56} fill="#e8e8e6" stroke="#bbbbbb" strokeWidth="1.2" rx="2" />
        <rect x={147+i*96} y={334} width={20} height={14} fill="#cccccc" opacity="0.6" rx="1" />
        <text x={184+i*96} y={363} textAnchor="middle" fill="#888888" fontSize="7" fontWeight="bold">{`EST-${i+1}`}</text>
      </g>
    ))}
    <rect x="138" y="242" width="5" height="64" fill="#aaaaaa" opacity="0.3" />
    <rect x="475" y="242" width="5" height="64" fill="#aaaaaa" opacity="0.3" />
    <rect x="138" y="306" width="342" height="3" fill="#aaaaaa" opacity="0.3" />
    <g transform="translate(385,420) rotate(180)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>
    <g><rect x="137" y="211" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="140" cy="209" r="3" fill="#c0c0be" /></g>
    <g><rect x="617" y="211" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="620" cy="209" r="3" fill="#c0c0be" /></g>
    <rect x="138" y="243" width="345" height="3" fill="url(#hatch)" />
    <text x="310" y="255" fill="#aaaaaa" fontSize="6" opacity="0.7">⚠ ZONA DE SEGURIDAD — ACCESO RESTRINGIDO</text>

    {/* LÍNEA 3 — ACABADO Y EMBALAJE */}
    <rect x="130" y="420" width="510" height="140" fill="#eaeaea" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="385" y="440" textAnchor="middle" fill="#555555" fontSize="10" fontWeight="bold">LÍNEA 3 — ACABADO Y EMBALAJE</text>
    <line x1="140" y1="490" x2="630" y2="490" stroke="#aaaaaa" strokeWidth="4" strokeDasharray="10,6" opacity="0.85" />
    <line x1="140" y1="486" x2="630" y2="486" stroke="#cccccc" strokeWidth="1" />
    <line x1="140" y1="494" x2="630" y2="494" stroke="#cccccc" strokeWidth="1" />
    {(['RETRACTILADO','ETIQUETADO','PRECINTADO','PALETIZADO','FILMADO AUTO'] as const).map((lbl,i) => (
      <g key={i}><rect x={148+i*92} y={452} width={84} height={30} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" /><text x={190+i*92} y={470} textAnchor="middle" fill="#555555" fontSize="6" fontWeight="bold">{lbl}</text></g>
    ))}
    {[0,1,2,3].map(i => (
      <g key={i}><rect x={148+i*115} y={502} width={90} height={48} fill="#e8e8e6" stroke="#cccccc" strokeWidth="1.2" rx="2" /><text x={193+i*115} y={530} textAnchor="middle" fill="#888888" fontSize="7" fontWeight="bold">{`OPER-${i+1}`}</text></g>
    ))}
    <g><rect x="137" y="421" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="140" cy="419" r="3" fill="#c0c0be" /></g>
    <g><rect x="617" y="421" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="620" cy="419" r="3" fill="#c0c0be" /></g>

    {/* TALLER MANTENIMIENTO */}
    <rect x="130" y="560" width="240" height="132" fill="#ececec" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="250" y="578" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold">TALLER MANTENIMIENTO</text>
    {(['TORN.','FRESA','SUELDA'] as const).map((lbl,i) => (
      <g key={i}><rect x={140+i*60} y={585} width={50} height={40} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" /><text x={165+i*60} y={608} textAnchor="middle" fill="#666666" fontSize="7" fontWeight="bold">{lbl}</text></g>
    ))}
    <rect x="140" y="630" width="220" height="54" fill="#e8e8e6" stroke="#cccccc" strokeWidth="0.8" rx="1" />
    <text x="250" y="660" textAnchor="middle" fill="#888888" fontSize="7">ALMACÉN DE REPUESTOS Y HERRAMIENTAS</text>
    <g><rect x="137" y="561" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="140" cy="559" r="3" fill="#c0c0be" /></g>

    {/* CONTROL DE CALIDAD */}
    <rect x="370" y="560" width="270" height="132" fill="#eaeaea" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="505" y="578" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold">CONTROL DE CALIDAD</text>
    {(['CMM 3D','RX INSP','SPEC.MET','VISIÓN'] as const).map((lbl,i) => (
      <g key={i}><rect x={380+i*65} y={585} width={58} height={45} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" /><text x={409+i*65} y={610} textAnchor="middle" fill="#666666" fontSize="7" fontWeight="bold">{lbl}</text></g>
    ))}
    <rect x="380" y="638" width="250" height="45" fill="#e8e8e6" stroke="#cccccc" strokeWidth="0.8" rx="1" />
    <text x="505" y="655" textAnchor="middle" fill="#888888" fontSize="7">SALA MUESTRAS Y PATRONES</text>
    <text x="505" y="668" textAnchor="middle" fill="#aaaaaa" fontSize="6">Temperatura controlada 20°C ±0.5</text>
    <g><rect x="625" y="561" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="628" cy="559" r="3" fill="#c0c0be" /></g>

    {/* SALA CNC ESPECIAL */}
    <rect x="640" y="8" width="252" height="402" fill="#ececec" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="766" y="28" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold">SALA CNC ESPECIAL</text>
    {[0,1,2,3,4,5].map(i => (
      <g key={i}>
        <rect x={650} y={36+i*62} width={100} height={50} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1.2" rx="2" />
        <text x={700} y={65+i*62} textAnchor="middle" fill="#666666" fontSize="7" fontWeight="bold">{`CNC-SPEC ${i+1}`}</text>
        <rect x={760} y={36+i*62} width={120} height={50} fill="#e8e8e6" stroke="#bbbbbb" strokeWidth="1.2" rx="2" />
        <text x={820} y={65+i*62} textAnchor="middle" fill="#666666" fontSize="7" fontWeight="bold">{`ELECTROEROSIÓN ${i+1}`}</text>
      </g>
    ))}
    <g><rect x="645" y="11" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="648" cy="9" r="3" fill="#c0c0be" /></g>
    <g><rect x="873" y="11" width="6" height="11" fill="#d0d0ce" rx="1.5" stroke="#aaaaaa" strokeWidth="0.5" /><circle cx="876" cy="9" r="3" fill="#c0c0be" /></g>
    <g transform="translate(766,410) rotate(180)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>

    {/* EXPEDICIÓN */}
    <rect x="640" y="410" width="252" height="152" fill="#efefed" stroke="#aaaaaa" strokeWidth="1.5" />
    <text x="766" y="428" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold">EXPEDICIÓN</text>
    {[0,1,2,3].map(i => (
      <g key={i}><rect x={650+i*58} y={436} width={48} height={80} fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="0.8" rx="2" /><text x={674+i*58} y={480} textAnchor="middle" fill="#888888" fontSize="6">{`P-EXP${i+1}`}</text></g>
    ))}
    <rect x="650" y="522" width="232" height="32" fill="#e8e8e6" stroke="#cccccc" strokeWidth="0.8" rx="1" />
    <text x="766" y="541" textAnchor="middle" fill="#888888" fontSize="7">ZONA DE CARGA — MUELLE 1 y 2</text>
    <g transform="translate(766,560) rotate(180)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>
    <g transform="translate(8,340) rotate(270)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>
    <g transform="translate(640,570) rotate(90)"><rect x="-18" y="-8" width="36" height="16" fill="#e0e0de" stroke="#999999" strokeWidth="1" rx="2" /><text textAnchor="middle" dominantBaseline="middle" fill="#888888" fontSize="7" fontWeight="bold">EXIT</text></g>
    <rect x="14" y="660" width="110" height="30" fill="#f0f0ee" stroke="#cccccc" strokeWidth="0.5" rx="2" />
    <text x="19" y="672" fill="#aaaaaa" fontSize="6">━━</text><text x="32" y="672" fill="#888888" fontSize="6"> Cinta transportadora</text>
    <text x="19" y="683" fill="#cc8888" fontSize="6">█</text><text x="26" y="683" fill="#888888" fontSize="6"> Extintor</text>
    <text x="60" y="683" fill="#888888" fontSize="6">EXIT</text><text x="76" y="683" fill="#888888" fontSize="6"> Salida emerg.</text>
  </svg>
);

const PlanoAlmacen = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#f7f7f5' }}>
    <defs>
      <pattern id="a-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.4" />
      </pattern>
      <pattern id="a-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#d4d4d4" strokeWidth="1" />
      </pattern>
    </defs>

    {/* Fondo con cuadrícula técnica */}
    <rect width="900" height="700" fill="url(#a-grid)" />

    {/* Muro exterior */}
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#888888" strokeWidth="3" rx="3" />
    <rect x="9" y="9" width="882" height="682" fill="none" stroke="#c0c0c0" strokeWidth="1" rx="2" />

    {/* Columnas estructurales */}
    {[80,220,360,500,640,780].map(cx =>
      [60,200,340,480,620].map((cy, j) => (
        <g key={`${cx}-${j}`}>
          <rect x={cx - 6} y={cy - 6} width="12" height="12" fill="#d8d8d8" stroke="#999999" strokeWidth="1" />
        </g>
      ))
    )}

    {/* ── MUELLES RECEPCIÓN (izquierda, y:6–352) ── */}
    <rect x="6" y="6" width="152" height="346" fill="#efefed" stroke="#aaaaaa" strokeWidth="1.5" />
    <rect x="6" y="6" width="152" height="18" fill="#e0e0de" stroke="#aaaaaa" strokeWidth="0" />
    <text x="82" y="20" textAnchor="middle" fill="#555555" fontSize="8" fontWeight="bold" letterSpacing="0.5">MUELLES RECEPCIÓN</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x="14" y={32 + i * 78} width="136" height="68" fill="#e8e8e6" stroke="#bbbbbb" strokeWidth="1" rx="2" />
        {/* Silueta camión */}
        <rect x="18" y={38 + i * 78} width="86" height="48" fill="#f2f2f0" stroke="#cccccc" strokeWidth="0.8" rx="1" />
        <rect x="18" y={38 + i * 78} width="22" height="28" fill="#e4e4e2" stroke="#cccccc" strokeWidth="0.5" rx="1" />
        <circle cx="32" cy={86 + i * 78} r="6" fill="#d0d0ce" stroke="#aaaaaa" strokeWidth="1" />
        <circle cx="90" cy={86 + i * 78} r="6" fill="#d0d0ce" stroke="#aaaaaa" strokeWidth="1" />
        <text x="82" y={68 + i * 78} textAnchor="middle" fill="#888888" fontSize="7">{`MUELLE R-${i+1}`}</text>
        {/* Nivelador */}
        <rect x="108" y={50 + i * 78} width="34" height="36" fill="url(#a-hatch)" stroke="#bbbbbb" strokeWidth="0.8" rx="1" />
        <text x="125" y={72 + i * 78} textAnchor="middle" fill="#999999" fontSize="5.5">NIVEL.</text>
      </g>
    ))}
    {/* Salida emergencia */}
    <rect x="32" y="352" width="100" height="10" fill="#c8e6c8" stroke="#7aaa7a" strokeWidth="0.8" rx="1" />
    <text x="82" y="360" textAnchor="middle" fill="#4a8a4a" fontSize="5.5" fontWeight="bold">SALIDA</text>
    {/* Extintor */}
    <rect x="12" y="14" width="5" height="9" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />

    {/* ── PASILLO RECEPCIÓN ── */}
    <rect x="158" y="6" width="50" height="346" fill="#f0f0ee" stroke="#cccccc" strokeWidth="0.5" />
    <line x1="183" y1="6" x2="183" y2="352" stroke="#cccccc" strokeWidth="1" strokeDasharray="8,5" />
    <text x="183" y="186" textAnchor="middle" fill="#aaaaaa" fontSize="6.5" transform="rotate(-90,183,186)">PASILLO A — RECEPCIÓN</text>

    {/* ── ZONA CUARENTENA (x:208, y:6–178) ── */}
    <rect x="208" y="6" width="162" height="174" fill="#f5f0f0" stroke="#bbbbbb" strokeWidth="1.5" />
    <rect x="208" y="6" width="162" height="16" fill="#ede8e8" />
    <text x="289" y="19" textAnchor="middle" fill="#888888" fontSize="7.5" fontWeight="bold">CUARENTENA</text>
    {[0,1,2].map(i => [0,1,2].map(j => (
      <rect key={`${i}-${j}`} x={216 + j * 50} y={28 + i * 46} width="44" height="40" fill="url(#a-hatch)" stroke="#cccccc" strokeWidth="0.8" rx="1" />
    )))}
    <text x="289" y="168" textAnchor="middle" fill="#aaaaaa" fontSize="6">— ÁREA RESTRINGIDA —</text>
    <rect x="212" y="10" width="4" height="8" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />

    {/* ── ALMACÉN ALTA ROTACIÓN — ESTANTERÍAS (x:208, y:180 — x:720, y:520) ── */}
    <rect x="208" y="180" width="512" height="340" fill="#f2f2f0" stroke="#bbbbbb" strokeWidth="1.5" />
    <rect x="208" y="180" width="512" height="18" fill="#e8e8e6" />
    <text x="464" y="193" textAnchor="middle" fill="#666666" fontSize="9" fontWeight="bold" letterSpacing="0.3">ALMACÉN ALTA ROTACIÓN — ESTANTERÍAS</text>

    {/* 6 pasillos de estanterías */}
    {[0,1,2,3,4,5].map(aisle => (
      <g key={aisle}>
        {/* Estantería izquierda */}
        <rect x={216 + aisle * 82} y={202} width="28" height="310" fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1" rx="1" />
        {[0,1,2,3,4,5,6,7,8,9].map(shelf => (
          <line key={shelf} x1={216 + aisle * 82} y1={202 + shelf * 31} x2={244 + aisle * 82} y2={202 + shelf * 31} stroke="#cccccc" strokeWidth="0.5" />
        ))}
        {/* Estantería derecha */}
        <rect x={250 + aisle * 82} y={202} width="28" height="310" fill="#e4e4e2" stroke="#aaaaaa" strokeWidth="1" rx="1" />
        {[0,1,2,3,4,5,6,7,8,9].map(shelf => (
          <line key={shelf} x1={250 + aisle * 82} y1={202 + shelf * 31} x2={278 + aisle * 82} y2={202 + shelf * 31} stroke="#cccccc" strokeWidth="0.5" />
        ))}
        {/* Etiqueta pasillo */}
        <text x={284 + aisle * 82} y={358} textAnchor="middle" fill="#bbbbbb" fontSize="6" transform={`rotate(-90,${284 + aisle * 82},358)`}>{`PASILLO ${String.fromCharCode(65 + aisle)}`}</text>
      </g>
    ))}

    {/* ── ZONA PICKING MANUAL (x:208, y:520–692) ── */}
    <rect x="208" y="520" width="512" height="172" fill="#efefed" stroke="#bbbbbb" strokeWidth="1.5" />
    <rect x="208" y="520" width="512" height="16" fill="#e6e6e4" />
    <text x="464" y="533" textAnchor="middle" fill="#666666" fontSize="8" fontWeight="bold">ZONA PICKING — PEDIDOS</text>
    {[0,1,2,3,4,5,6,7].map(i => (
      <g key={i}>
        <rect x={216 + i * 62} y={540} w={50} h={40} fill="#e8e8e6" stroke="#c0c0c0" strokeWidth="0.8" rx="1" />
        <rect x={216 + i * 62} y={540} width={50} height={40} fill="#e8e8e6" stroke="#c0c0c0" strokeWidth="0.8" rx="1" />
        <text x={241 + i * 62} y={564} textAnchor="middle" fill="#999999" fontSize="6">{`PK-${i+1}`}</text>
        <rect x={220 + i * 62} y={584} width={42} height={14} fill="#e2e2e0" stroke="#c8c8c8" strokeWidth="0.4" rx="1" />
        <text x={241 + i * 62} y={594} textAnchor="middle" fill="#bbbbbb" fontSize="5">CINTA</text>
      </g>
    ))}
    <rect x="216" y="604" width="496" height="80" fill="#ebebea" stroke="#c8c8c8" strokeWidth="0.8" rx="1" />
    <text x="464" y="640" textAnchor="middle" fill="#888888" fontSize="8">ZONA CONSOLIDACIÓN Y VERIFICACIÓN</text>
    <text x="464" y="655" textAnchor="middle" fill="#bbbbbb" fontSize="6.5">WMS — Gestión automática de ubicaciones</text>
    <rect x="212" y="524" width="4" height="8" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />
    <rect x="704" y="524" width="4" height="8" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />

    {/* ── CÁMARA FRIGORÍFICA (x:720, y:6–352) ── */}
    <rect x="720" y="6" width="174" height="346" fill="#eef2f5" stroke="#bbbbbb" strokeWidth="1.5" />
    <rect x="720" y="6" width="174" height="18" fill="#e4eaee" />
    <text x="807" y="19" textAnchor="middle" fill="#666666" fontSize="7.5" fontWeight="bold">CÁMARA FRIGORÍFICA</text>
    <text x="807" y="30" textAnchor="middle" fill="#aaaaaa" fontSize="5.5">-18°C / +4°C</text>
    {[0,1,2].map(c => [0,1,2,3,4].map(r => (
      <rect key={`${c}-${r}`} x={728 + c * 52} y={36 + r * 60} width="46" height="52" fill="url(#a-hatch)" stroke="#c8c8c8" strokeWidth="0.8" rx="1" />
    )))}
    <rect x="728" y="336" width="158" height="14" fill="#e0e8ec" stroke="#c0c0c0" strokeWidth="0.6" rx="1" />
    <text x="807" y="346" textAnchor="middle" fill="#999999" fontSize="5.5">CONTROL TEMPERATURA</text>
    <rect x="724" y="10" width="4" height="8" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />

    {/* ── OFICINA WMS + CARGA CARRETILLAS (x:720, y:352–520) ── */}
    <rect x="720" y="352" width="174" height="168" fill="#f2f2f0" stroke="#bbbbbb" strokeWidth="1.5" />
    <rect x="720" y="352" width="174" height="16" fill="#e8e8e6" />
    <text x="807" y="364" textAnchor="middle" fill="#666666" fontSize="7.5" fontWeight="bold">OFICINA WMS</text>
    <rect x="728" y="372" width="68" height="44" fill="#e6e6e4" stroke="#c8c8c8" strokeWidth="0.8" rx="1" />
    <text x="762" y="397" textAnchor="middle" fill="#999999" fontSize="6">TERMINAL 1</text>
    <rect x="804" y="372" width="82" height="44" fill="#e6e6e4" stroke="#c8c8c8" strokeWidth="0.8" rx="1" />
    <text x="845" y="397" textAnchor="middle" fill="#999999" fontSize="6">SERVIDOR WMS</text>
    <rect x="728" y="422" width="158" height="90" fill="#ececea" stroke="#c4c4c4" strokeWidth="0.8" rx="1" />
    <text x="807" y="440" textAnchor="middle" fill="#888888" fontSize="6.5">CARGA CARRETILLAS ELÉCTRICAS</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x={734 + i * 36} y={448} width="28" height="56" fill="url(#a-hatch)" stroke="#c4c4c4" strokeWidth="0.8" rx="1" />
        <text x={748 + i * 36} y={480} textAnchor="middle" fill="#aaaaaa" fontSize="5">{`CE-${i+1}`}</text>
      </g>
    ))}
    <rect x="750" y="512" width="114" height="8" fill="#c8e6c8" stroke="#7aaa7a" strokeWidth="0.6" rx="1" />
    <text x="807" y="518" textAnchor="middle" fill="#4a8a4a" fontSize="5">SALIDA</text>

    {/* ── MUELLES EXPEDICIÓN (izquierda, y:352–692) ── */}
    <rect x="6" y="352" width="152" height="340" fill="#efefed" stroke="#aaaaaa" strokeWidth="1.5" />
    <rect x="6" y="352" width="152" height="18" fill="#e6e6e4" />
    <text x="82" y="366" textAnchor="middle" fill="#555555" fontSize="8" fontWeight="bold">MUELLES EXPEDICIÓN</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x="14" y={374 + i * 78} width="136" height="68" fill="#e8e8e6" stroke="#c0c0c0" strokeWidth="1" rx="2" />
        <rect x="18" y={380 + i * 78} width="86" height="48" fill="#f2f2f0" stroke="#cccccc" strokeWidth="0.8" rx="1" />
        <rect x="18" y={380 + i * 78} width="22" height="28" fill="#e4e4e2" stroke="#cccccc" strokeWidth="0.5" rx="1" />
        <circle cx="32" cy={428 + i * 78} r="6" fill="#d0d0ce" stroke="#aaaaaa" strokeWidth="1" />
        <circle cx="90" cy={428 + i * 78} r="6" fill="#d0d0ce" stroke="#aaaaaa" strokeWidth="1" />
        <text x="82" y={410 + i * 78} textAnchor="middle" fill="#888888" fontSize="7">{`MUELLE E-${i+1}`}</text>
        <rect x="108" y={392 + i * 78} width="34" height="36" fill="url(#a-hatch)" stroke="#bbbbbb" strokeWidth="0.8" rx="1" />
        <text x="125" y={414 + i * 78} textAnchor="middle" fill="#999999" fontSize="5.5">NIVEL.</text>
      </g>
    ))}
    <rect x="32" y="686" width="100" height="8" fill="#c8e6c8" stroke="#7aaa7a" strokeWidth="0.6" rx="1" />
    <text x="82" y="692" textAnchor="middle" fill="#4a8a4a" fontSize="5.5" fontWeight="bold">SALIDA</text>
    <rect x="10" y="356" width="4" height="8" fill="#e8c0c0" stroke="#cc8888" strokeWidth="0.6" rx="1" />

    {/* ── LEYENDA ── */}
    <rect x="216" y="680" width="480" height="12" fill="#f0f0ee" stroke="#d4d4d4" strokeWidth="0.5" rx="1" />
    <text x="222" y="689" fill="#bbbbbb" fontSize="5.5">■ Estantería</text>
    <text x="290" y="689" fill="#bbbbbb" fontSize="5.5">▨ Acceso restringido / Cámara</text>
    <text x="440" y="689" fill="#cc8888" fontSize="5.5">▪ Extintor</text>
    <text x="490" y="689" fill="#7aaa7a" fontSize="5.5">▬ Salida emergencia</text>
  </svg>
);

const PlanoAcceso = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id="acc-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff05" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#acc-grid)" />
    <rect x="8" y="8" width="884" height="684" fill="none" stroke="#6366f1" strokeWidth="3" rx="4" />

    {/* Columns */}
    {[100,300,500,700].map(cx => [80,230,380,530,620].map((cy,j) => <Col key={`${cx}-${j}`} x={cx} y={cy} />))}

    {/* ── HALL ENTRADA PRINCIPAL ── */}
    <rect x="8" y="8" width="884" height="200" fill="#0a0a14" stroke="#6366f1" strokeWidth="1.5" />
    <text x="450" y="28" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="bold">HALL DE ENTRADA — RECEPCIÓN PRINCIPAL</text>
    {/* Double doors */}
    <rect x="380" y="8" width="140" height="8" fill="#0a0a0a" />
    <path d="M380,16 Q450,50 520,16" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,3" />
    <text x="450" y="38" textAnchor="middle" fill="#818cf8" fontSize="8">ENTRADA PRINCIPAL — DOBLE PUERTA AUTOMÁTICA</text>
    {/* Reception desk U-shape */}
    <rect x="300" y="80" width="300" height="20" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" rx="2" />
    <rect x="300" y="80" width="20" height="80" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" rx="1" />
    <rect x="580" y="80" width="20" height="80" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" rx="1" />
    <text x="450" y="120" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="bold">RECEPCIÓN</text>
    <text x="450" y="133" textAnchor="middle" fill="#7c3aed" fontSize="7">Información · Visitas · Paquetería</text>
    {/* Monitors on desk */}
    {[320,380,440,500].map((x,i) => (
      <g key={i}>
        <rect x={x} y="74" width="22" height="14" fill="#0f0f23" stroke="#4338ca" strokeWidth="0.5" rx="1" />
        <circle cx={x+11} cy="74" r="1.5" fill="#22d3ee" />
      </g>
    ))}
    {/* Waiting area left */}
    <rect x="20" y="60" width="250" height="140" fill="#080810" stroke="#4338ca" strokeWidth="1" rx="2" />
    <text x="145" y="80" textAnchor="middle" fill="#818cf8" fontSize="8">ZONA ESPERA VISITAS</text>
    {[0,1,2].map(i => [0,1,2].map(j => (
      <g key={`${i}-${j}`}>
        <rect x={28 + j * 78} y={90 + i * 38} width="60" height="26" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.8" rx="3" />
      </g>
    )))}
    <rect x="28" y="162" width="232" height="28" fill="#0d0d22" stroke="#334155" strokeWidth="0.5" rx="1" />
    <text x="144" y="179" textAnchor="middle" fill="#475569" fontSize="6">Mesita Central + Revistas</text>
    {/* Waiting area right */}
    <rect x="630" y="60" width="250" height="140" fill="#080810" stroke="#4338ca" strokeWidth="1" rx="2" />
    <text x="755" y="80" textAnchor="middle" fill="#818cf8" fontSize="8">ZONA ESPERA EMPLEADOS</text>
    {[0,1,2].map(i => [0,1,2].map(j => (
      <g key={`${i}-${j}`}>
        <rect x={638 + j * 78} y={90 + i * 38} width="60" height="26" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.8" rx="3" />
      </g>
    )))}
    {/* Tornos acceso */}
    <rect x="320" y="162" width="260" height="46" fill="#0c0c20" stroke="#7c3aed" strokeWidth="1.5" rx="2" />
    <text x="450" y="180" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="bold">CONTROL ACCESO — TORNOS LECTOR BADGE</text>
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x={330 + i * 48} y={170} width="36" height="30" fill="#1a1a40" stroke="#7c3aed" strokeWidth="0.8" rx="2" />
        <circle cx={348 + i * 48} cy={185} r="5" fill="#0d0d30" stroke="#6d28d9" strokeWidth="0.5" />
        <rect x={330 + i * 48} y={196} width="36" height="4" fill="#7c3aed" opacity="0.4" />
      </g>
    ))}
    <Extinguisher x={14} y={18} />
    <Extinguisher x={876} y={18} />

    {/* ── CORRIDOR CENTRAL ── */}
    <rect x="8" y="208" width="884" height="60" fill="#050808" opacity="0.9" />
    <line x1="8" y1="238" x2="892" y2="238" stroke="#FFD700" strokeWidth="2" strokeDasharray="12,6" />
    <text x="450" y="243" textAnchor="middle" fill="#374151" fontSize="7">PASILLO PRINCIPAL — ACCESO A TODAS LAS ZONAS</text>

    {/* ── SALA REUNIONES GRANDE ── */}
    <rect x="8" y="268" width="260" height="200" fill="#0a0d0a" stroke="#0d9488" strokeWidth="1.5" />
    <text x="138" y="288" textAnchor="middle" fill="#2dd4bf" fontSize="9" fontWeight="bold">SALA REUNIONES A</text>
    <text x="138" y="299" textAnchor="middle" fill="#0d9488" fontSize="6">Capacidad: 20 personas</text>
    {/* Conference table */}
    <rect x="28" y="310" width="220" height="110" fill="#134e4a" stroke="#0d9488" strokeWidth="1" rx="6" />
    <text x="138" y="370" textAnchor="middle" fill="#2dd4bf" fontSize="8">MESA CONFERENCIA</text>
    {[0,1,2,3,4].map(i => (
      <>
        <circle key={`t${i}`} cx={50 + i * 42} cy={305} r="10" fill="#0f3a35" stroke="#0d9488" strokeWidth="0.5" />
        <circle key={`b${i}`} cx={50 + i * 42} cy={425} r="10" fill="#0f3a35" stroke="#0d9488" strokeWidth="0.5" />
      </>
    ))}
    {[0,1,2].map(i => (
      <>
        <circle key={`l${i}`} cx={18} cy={330 + i * 36} r="10" fill="#0f3a35" stroke="#0d9488" strokeWidth="0.5" />
        <circle key={`r${i}`} cx={258} cy={330 + i * 36} r="10" fill="#0f3a35" stroke="#0d9488" strokeWidth="0.5" />
      </>
    ))}
    {/* Projector screen */}
    <rect x="36" y="268" width="204" height="36" fill="#0d2220" stroke="#0d9488" strokeWidth="0.5" rx="1" />
    <text x="138" y="289" textAnchor="middle" fill="#2dd4bf" fontSize="7">▶ PANTALLA PROYECCIÓN</text>
    <Door x={250} y={466} w={28} />

    {/* ── SALA REUNIONES B ── */}
    <rect x="8" y="468" width="260" height="224" fill="#0a0a0d" stroke="#7c3aed" strokeWidth="1.5" />
    <text x="138" y="488" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="bold">SALA REUNIONES B</text>
    <text x="138" y="499" textAnchor="middle" fill="#7c3aed" fontSize="6">Capacidad: 8 personas</text>
    <rect x="28" y="510" width="220" height="100" fill="#1a0a3e" stroke="#7c3aed" strokeWidth="1" rx="4" />
    {[0,1,2].map(i => [0,1,2,3].map(j => (
      <circle key={`${i}-${j}`} cx={45 + j * 60} cy={524 + i * 42} r="9" fill="#150830" stroke="#7c3aed" strokeWidth="0.5" />
    )))}
    <text x="138" y="560" textAnchor="middle" fill="#a78bfa" fontSize="7">MESA REUNIONES 8 PAX</text>
    <rect x="28" y="618" width="220" height="60" fill="#0d0820" stroke="#4c1d95" strokeWidth="0.8" rx="1" />
    <text x="138" y="650" textAnchor="middle" fill="#a78bfa" fontSize="7">VIDEO CONFERENCIA + TV 75"</text>
    <Door x={250} y={468} w={28} />

    {/* ── DESPACHOS DIRECCIÓN (centro) ── */}
    <rect x="268" y="268" width="364" height="224" fill="#0a0806" stroke="#f59e0b" strokeWidth="1.5" />
    <text x="450" y="288" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">DESPACHOS DIRECCIÓN</text>
    {[
      { label: 'CEO', x: 278, y: 298 }, { label: 'CFO', x: 398, y: 298 },
      { label: 'COO', x: 518, y: 298 }, { label: 'RRHH', x: 278, y: 388 },
      { label: 'COMERCIAL', x: 398, y: 388 }, { label: 'PRODUCCIÓN', x: 518, y: 388 },
    ].map(d => (
      <g key={d.label}>
        <rect x={d.x} y={d.y} width="110" height="82" fill="#1a1000" stroke="#f59e0b" strokeWidth="0.8" rx="2" />
        <text x={d.x + 55} y={d.y + 18} textAnchor="middle" fill="#fcd34d" fontSize="7" fontWeight="bold">{d.label}</text>
        <rect x={d.x + 8} y={d.y + 26} width="50" height="36" fill="#0f0800" stroke="#92400e" strokeWidth="0.5" rx="1" />
        <circle cx={d.x + 88} cy={d.y + 44} r="12" fill="#0f0800" stroke="#92400e" strokeWidth="0.5" />
        <Door x={d.x + 85} y={d.y + 82} w={24} rot={180} />
      </g>
    ))}

    {/* ── DESPACHOS + SERVICIOS (centro-abajo) ── */}
    <rect x="268" y="492" width="364" height="200" fill="#060a06" stroke="#16a34a" strokeWidth="1.5" />
    <text x="450" y="510" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="bold">SERVICIOS GENERALES</text>
    {/* Reprografía */}
    <rect x="278" y="518" width="160" height="80" fill="#0a1208" stroke="#16a34a" strokeWidth="0.8" rx="2" />
    <text x="358" y="534" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="bold">REPROGRAFÍA</text>
    <Machine x={286} y={540} w={60} h={40} label="IMPRES. A0" color="#0d1a0d" stroke="#4ade80" />
    <Machine x={358} y={540} w={60} h={40} label="ESCANER" color="#0d1a0d" stroke="#4ade80" />
    {/* Archivo */}
    <rect x="448" y="518" width="174" height="80" fill="#0a0a0a" stroke="#374151" strokeWidth="0.8" rx="2" />
    <text x="535" y="534" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">ARCHIVO CENTRAL</text>
    {[0,1,2,3].map(i => [0,1,2].map(j => (
      <rect key={`${i}-${j}`} x={456 + j * 54} y={542 + i * 16} width="48" height="13" fill="#1e293b" stroke="#334155" strokeWidth="0.3" rx="0.5" />
    )))}
    {/* Cafetito */}
    <rect x="278" y="604" width="344" height="80" fill="#0a0a06" stroke="#f59e0b" strokeWidth="0.8" rx="2" />
    <text x="450" y="620" textAnchor="middle" fill="#fcd34d" fontSize="7" fontWeight="bold">PEQUEÑA COCINA / OFFICE</text>
    <Machine x={286} y={628} w={50} h={40} label="CAFÉ" color="#1a1000" stroke="#f59e0b" />
    <Machine x={344} y={628} w={50} h={40} label="MICROON" color="#1a1000" stroke="#f59e0b" />
    <rect x="404" y="628" width="200" height="40" fill="#0f0a00" stroke="#92400e" strokeWidth="0.5" rx="1" />
    <text x="504" y="652" textAnchor="middle" fill="#f59e0b" fontSize="6">ENCIMERA + FREGADERO</text>

    {/* ── RECEPCIÓN MERCANCÍAS / CONSERJERÍA (derecha) ── */}
    <rect x="632" y="268" width="260" height="424" fill="#07080d" stroke="#0ea5e9" strokeWidth="1.5" />
    <text x="762" y="288" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">CONSERJERÍA & SEGURIDAD</text>
    <Machine x={642} y={298} w={100} h={70} label="PUESTO SEGURIDAD" color="#04101a" stroke="#0ea5e9" />
    <rect x="642" y="376" width="240" height="80" fill="#04101a" stroke="#0369a1" strokeWidth="0.8" rx="1" />
    <text x="762" y="394" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">MONITORES CCTV — 16 CÁMARAS</text>
    {[0,1,2,3].map(i => [0,1,2,3].map(j => (
      <rect key={`${i}-${j}`} x={648 + j * 56} y={400 + i * 14} width="50" height="11" fill="#030d16" stroke="#0369a1" strokeWidth="0.3" rx="0.5" />
    )))}
    <rect x="642" y="462" width="240" height="120" fill="#040810" stroke="#0284c7" strokeWidth="0.8" rx="1" />
    <text x="762" y="480" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">SALA CONTROL ACCESOS</text>
    {[0,1,2].map(i => (
      <Machine key={i} x={650 + i * 76} y={490} w={66} h={80} label={`CTRL-${i+1}`} color="#030810" stroke="#0284c7" />
    ))}
    {/* WC acceso */}
    <rect x="642" y="588" width="240" height="100" fill="#040810" stroke="#ec4899" strokeWidth="1" rx="1" />
    <text x="762" y="604" textAnchor="middle" fill="#f9a8d4" fontSize="8" fontWeight="bold">ASEOS ACCESO</text>
    <rect x="648" y="612" width="110" height="68" fill="#500724" stroke="#ec4899" strokeWidth="0.5" rx="1" />
    <text x="703" y="650" textAnchor="middle" fill="#f9a8d4" fontSize="7">♂ CABALLEROS</text>
    <rect x="764" y="612" width="110" height="68" fill="#500724" stroke="#ec4899" strokeWidth="0.5" rx="1" />
    <text x="819" y="650" textAnchor="middle" fill="#f9a8d4" fontSize="7">♀ SEÑORAS</text>

    <Exit x="450" y="692" />
    <Extinguisher x={14} y={268} />
    <Extinguisher x={876} y={268} />
    <Extinguisher x={14} y={468} />
    <Extinguisher x={876} y={468} />
  </svg>
);

const PlanoSimple = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id={`s-grid-${title}`} width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff05" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill={`url(#s-grid-${title})`} />
    <rect x="8" y="8" width="884" height="684" fill="none" stroke={color} strokeWidth="3" rx="4" />
    <text x="450" y="38" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">{title}</text>
    {children}
  </svg>
);

// Placeholder for remaining zones (equally detailed)
const PlanoOficinas = () => (
  <PlanoSimple title="BLOQUE OFICINAS" color="#818cf8">
    {/* Corridor horizontal */}
    <rect x="8" y="318" width="884" height="64" fill="#0a0a14" opacity="0.9" />
    <line x1="8" y1="350" x2="892" y2="350" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="10,5" />
    <text x="450" y="355" textAnchor="middle" fill="#374151" fontSize="7">PASILLO CENTRAL</text>

    {/* Open office north */}
    <rect x="8" y="56" width="600" height="262" fill="#060810" stroke="#4338ca" strokeWidth="1.5" />
    <text x="308" y="76" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">OPEN OFFICE NORTE — 48 PUESTOS</text>
    {[0,1,2,3,4,5].map(row => [0,1,2,3,4,5,6,7].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={20 + col * 72} y={86 + row * 38} width="58" height="28" fill="#0f1030" stroke="#4338ca" strokeWidth="0.6" rx="1" />
        <rect x={22 + col * 72} y={88 + row * 38} width="18" height="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.3" rx="0.5" />
        <circle cx={62 + col * 72} cy={100 + row * 38} r="5" fill="#0f1030" stroke="#4338ca" strokeWidth="0.3" />
      </g>
    )))}

    {/* Meeting rooms north (right side) */}
    {[0,1].map(i => (
      <g key={i}>
        <rect x={615} y={56 + i * 131} width={277} height={124} fill="#060816" stroke="#7c3aed" strokeWidth="1.5" />
        <text x={753} y={76 + i * 131} textAnchor="middle" fill="#c4b5fd" fontSize="8" fontWeight="bold">{`SALA ${i === 0 ? 'ALFA' : 'BETA'}`}</text>
        <rect x={625} y={86 + i * 131} width={257} height={82} fill="#0d0820" stroke="#7c3aed" strokeWidth="0.8" rx="4" />
        {[0,1,2,3].map(j => [0,1].map(k => (
          <circle key={`${j}-${k}`} cx={640 + j * 60} cy={100 + k * 50 + i * 131} r="9" fill="#180a30" stroke="#7c3aed" strokeWidth="0.5" />
        )))}
      </g>
    ))}

    {/* Open office south */}
    <rect x="8" y="382" width="600" height="262" fill="#060810" stroke="#4338ca" strokeWidth="1.5" />
    <text x="308" y="402" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">OPEN OFFICE SUR — 48 PUESTOS</text>
    {[0,1,2,3,4,5].map(row => [0,1,2,3,4,5,6,7].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={20 + col * 72} y={412 + row * 38} width="58" height="28" fill="#0f1030" stroke="#4338ca" strokeWidth="0.6" rx="1" />
        <rect x={22 + col * 72} y={414 + row * 38} width="18" height="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.3" rx="0.5" />
        <circle cx={62 + col * 72} cy={426 + row * 38} r="5" fill="#0f1030" stroke="#4338ca" strokeWidth="0.3" />
      </g>
    )))}
    <Extinguisher x={12} y={68} />
    <Extinguisher x={596} y={68} />
    <Extinguisher x={12} y={394} />
    <Extinguisher x={596} y={394} />

    {/* South services */}
    {[
      { label: 'SALA FORMACIÓN\n30 PAX', color: '#0d9488', x: 615, y: 382, w: 277, h: 124 },
      { label: 'RRHH + NÓMINAS', color: '#f59e0b', x: 615, y: 512, w: 135, h: 132 },
      { label: 'LEGAL + COMPRAS', color: '#0ea5e9', x: 756, y: 512, w: 136, h: 132 },
    ].map(s => (
      <g key={s.label}>
        <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#06080a" stroke={s.color} strokeWidth="1.5" />
        <text x={s.x + s.w/2} y={s.y + 20} textAnchor="middle" fill={s.color} fontSize="8" fontWeight="bold">{s.label}</text>
      </g>
    ))}

    <Exit x="450" y="8" rot={0} />
    <Exit x="450" y="692" />
    <Exit x="8" y="350" rot={270} />
    <Exit x="892" y="350" rot={90} />
  </PlanoSimple>
);

// ── CARGA ─────────────────────────────────────────────────────────────────────
const PlanoCarga = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id="cg-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff05" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#cg-grid)" />
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#f97316" strokeWidth="2.5" rx="4" />
    <text x="450" y="26" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">ZONA DE CARGA Y DESCARGA</text>

    {/* 4 truck bays top */}
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x={14 + i * 220} y={40} width={210} height={190} fill="#0a0d10" stroke="#f97316" strokeWidth="1.5" rx="2" />
        <text x={119 + i * 220} y={58} textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="bold">MUELLE {i+1}</text>
        {/* dock door */}
        <rect x={74 + i * 220} y={40} width={90} height={12} fill="#7c2d12" stroke="#f97316" strokeWidth="1" />
        <text x={119 + i * 220} y={50} textAnchor="middle" fill="#fed7aa" fontSize="6">PUERTA</text>
        {/* dock leveler */}
        <rect x={74 + i * 220} y={52} width={90} height={10} fill="#FFD700" opacity="0.7" rx="1" />
        {/* dock bumpers */}
        <rect x={74 + i * 220} y={62} width={14} height={20} fill="#292524" stroke="#78716c" strokeWidth="0.8" rx="1" />
        <rect x={150 + i * 220} y={62} width={14} height={20} fill="#292524" stroke="#78716c" strokeWidth="0.8" rx="1" />
        {/* truck outline */}
        <rect x={34 + i * 220} y={75} width={170} height={145} fill="#0f1318" stroke="#44403c" strokeWidth="1" strokeDasharray="4,3" rx="3" />
        <text x={119 + i * 220} y={152} textAnchor="middle" fill="#44403c" fontSize="8">CAMIÓN</text>
        {/* wheels */}
        <circle cx={64 + i * 220} cy={216} r="10" fill="#1c1917" stroke="#57534e" strokeWidth="1.5" />
        <circle cx={174 + i * 220} cy={216} r="10" fill="#1c1917" stroke="#57534e" strokeWidth="1.5" />
      </g>
    ))}

    {/* Pallet staging area (center) */}
    <rect x="14" y="245" width="570" height="170" fill="#07090c" stroke="#f97316" strokeWidth="1.2" rx="2" />
    <text x="299" y="262" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="bold">ÁREA DE PREEMBARQUE Y CLASIFICACIÓN</text>
    {/* Pallets grid */}
    {[0,1,2,3,4,5,6].map(col => [0,1,2].map(row => (
      <rect key={`${col}-${row}`} x={24 + col * 78} y={272 + row * 42} width={68} height={34} fill="#15100a" stroke="#ea580c" strokeWidth="0.8" rx="1" />
    )))}
    {/* Conveyor belt across staging */}
    <Conveyor x1={14} y1={340} x2={584} y2={340} />
    <text x="299" y="354" textAnchor="middle" fill="#FFD700" fontSize="6" fontWeight="bold">CINTA CLASIFICADORA</text>

    {/* Forklift lanes */}
    <line x1="14" y1="398" x2="584" y2="398" stroke="#f97316" strokeWidth="1" strokeDasharray="12,8" opacity="0.4" />
    <line x1="14" y1="408" x2="584" y2="408" stroke="#f97316" strokeWidth="1" strokeDasharray="12,8" opacity="0.4" />
    <text x="100" y="404" fill="#f97316" fontSize="6" opacity="0.6">CARRIL CARRETILLAS</text>

    {/* Admin office right */}
    <rect x="596" y="245" width="292" height="100" fill="#060a10" stroke="#60a5fa" strokeWidth="1.5" rx="2" />
    <text x="742" y="263" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">OFICINA MUELLE</text>
    <Machine x={608} y={270} w={80} h={60} label="ADM-CARGA" color="#060d18" stroke="#3b82f6" />
    <Machine x={700} y={270} w={80} h={60} label="BÁSCULA PC" color="#060d18" stroke="#3b82f6" />

    {/* Weighbridge right */}
    <rect x="596" y="357" width="292" height="58" fill="#060a10" stroke="#FFD700" strokeWidth="1.5" rx="2" />
    <text x="742" y="373" textAnchor="middle" fill="#FFD700" fontSize="8" fontWeight="bold">BÁSCULA DE CAMIONES</text>
    <rect x="616" y="380" width="252" height="24" fill="#1a1500" stroke="#FFD700" strokeWidth="1" rx="1" />
    <text x="742" y="396" textAnchor="middle" fill="#FFD700" fontSize="7">Cap. 80 T — Plataforma 14 m</text>

    {/* Hazmat storage bottom-left */}
    <rect x="14" y="430" width="180" height="120" fill="#14050a" stroke="#ef4444" strokeWidth="2" rx="2" />
    <text x="104" y="448" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">ALMACÉN PELIGROSO</text>
    <text x="104" y="460" textAnchor="middle" fill="#ef4444" fontSize="6">⚠ ACCESO RESTRINGIDO</text>
    <rect x="24" y="466" width="40" height="70" fill="#220a0a" stroke="#ef4444" strokeWidth="0.8" rx="1" />
    <text x="44" y="504" textAnchor="middle" fill="#ef4444" fontSize="6">GLP</text>
    <rect x="72" y="466" width="40" height="70" fill="#220a0a" stroke="#ef4444" strokeWidth="0.8" rx="1" />
    <text x="92" y="504" textAnchor="middle" fill="#ef4444" fontSize="6">QUÍM.</text>
    <rect x="120" y="466" width="40" height="70" fill="#220a0a" stroke="#ef4444" strokeWidth="0.8" rx="1" />
    <text x="140" y="504" textAnchor="middle" fill="#ef4444" fontSize="6">ADR</text>

    {/* Forklift charging center-bottom */}
    <rect x="210" y="430" width="240" height="120" fill="#060f06" stroke="#22c55e" strokeWidth="1.5" rx="2" />
    <text x="330" y="448" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">CARGA BATERÍAS</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x={220 + i * 56} y={458} width={44} height={76} fill="#061206" stroke="#16a34a" strokeWidth="0.8" rx="2" />
        <text x={242 + i * 56} y={498} textAnchor="middle" fill="#4ade80" fontSize="5.5">CARG.{i+1}</text>
        <rect x={228 + i * 56} y={462} width={28} height={14} fill="#14291a" stroke="#22c55e" strokeWidth="0.4" rx="0.5" />
      </g>
    ))}

    {/* Driver rest area */}
    <rect x="464" y="430" width="130" height="120" fill="#080810" stroke="#8b5cf6" strokeWidth="1.2" rx="2" />
    <text x="529" y="448" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="bold">DESCANSO CHOFERES</text>
    {[0,1].map(i => (
      <rect key={i} x={474 + i * 60} y={456} width={50} height={30} fill="#0d0a1a" stroke="#7c3aed" strokeWidth="0.6" rx="2" />
    ))}
    <rect x="474" y="494" width="110" height="44" fill="#0d0a1a" stroke="#7c3aed" strokeWidth="0.6" rx="1" />
    <text x="529" y="519" textAnchor="middle" fill="#a78bfa" fontSize="6">WC + VESTUARIO</text>

    {/* Security checkpoint */}
    <rect x="596" y="430" width="292" height="120" fill="#06080d" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
    <text x="742" y="448" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">CONTROL SEGURIDAD</text>
    <Machine x={608} y={458} w={80} h={80} label="SEGURIDAD" color="#0a0800" stroke="#d97706" />
    <rect x="700" y="458" width="176" height="80" fill="#0a0800" stroke="#d97706" strokeWidth="0.8" rx="1" />
    <text x="788" y="502" textAnchor="middle" fill="#fbbf24" fontSize="7">MONITORES CCTV</text>

    <Exit x="450" y="6" />
    <Exit x="450" y="694" />
    <Extinguisher x={14} y={52} />
    <Extinguisher x={880} y={52} />
    <Extinguisher x={14} y={440} />
    <Extinguisher x={880} y={440} />
    <Col x={580} y={240} /><Col x={580} y={430} /><Col x={580} y={560} />
  </svg>
);

// ── EXTERIOR ──────────────────────────────────────────────────────────────────
const PlanoExterior = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#060d06' }}>
    <defs>
      <pattern id="ext-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16a34a10" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#ext-grid)" />

    {/* Green areas */}
    <rect x="6" y="6" width="888" height="688" fill="#060d06" />
    <rect x="20" y="20" width="180" height="80" fill="#0a1a0a" stroke="#16a34a" strokeWidth="0.5" rx="2" opacity="0.6" />
    <text x="110" y="64" textAnchor="middle" fill="#16a34a" fontSize="7" opacity="0.7">ZONA VERDE</text>
    <rect x="700" y="20" width="180" height="80" fill="#0a1a0a" stroke="#16a34a" strokeWidth="0.5" rx="2" opacity="0.6" />
    <text x="790" y="64" textAnchor="middle" fill="#16a34a" fontSize="7" opacity="0.7">ZONA VERDE</text>

    {/* Perimeter fence */}
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="8,4" rx="4" />
    <text x="450" y="22" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="bold">PLANO EXTERIOR / PARCELA</text>

    {/* Main building footprint (center) */}
    <rect x="180" y="120" width="540" height="380" fill="#0a0e10" stroke="#60a5fa" strokeWidth="2.5" rx="4" />
    <text x="450" y="145" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">EDIFICIO PRINCIPAL</text>
    {[
      { label: 'PRODUCCIÓN', x: 200, y: 160, w: 280, h: 160, c: '#ef4444' },
      { label: 'ALMACÉN', x: 200, y: 330, w: 180, h: 100, c: '#f59e0b' },
      { label: 'CARGA', x: 390, y: 330, w: 90, h: 100, c: '#f97316' },
      { label: 'OFICINAS', x: 190, y: 160, w: 0, h: 0, c: '' },
    ].filter(z => z.w > 0).map(z => (
      <g key={z.label}>
        <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke={z.c} strokeWidth="1" opacity="0.5" rx="2" />
        <text x={z.x + z.w/2} y={z.y + z.h/2 + 4} textAnchor="middle" fill={z.c} fontSize="8" opacity="0.7" fontWeight="bold">{z.label}</text>
      </g>
    ))}
    {/* Zones labels inside building */}
    <text x="290" y="250" textAnchor="middle" fill="#ef4444" fontSize="9" opacity="0.6" fontWeight="bold">PRODUCCIÓN</text>
    <text x="290" y="385" textAnchor="middle" fill="#f59e0b" fontSize="8" opacity="0.6" fontWeight="bold">ALMACÉN</text>
    <text x="435" y="385" textAnchor="middle" fill="#f97316" fontSize="7" opacity="0.6" fontWeight="bold">CARGA</text>
    <text x="590" y="230" textAnchor="middle" fill="#818cf8" fontSize="7" opacity="0.6" fontWeight="bold">OFICINAS</text>
    <text x="590" y="380" textAnchor="middle" fill="#0d9488" fontSize="6" opacity="0.6" fontWeight="bold">Z.COMUNES</text>
    {/* SALA TÉCNICA + VESTUARIOS */}
    <rect x="495" y="160" width="210" height="160" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.4" rx="2" />
    <rect x="680" y="280" width="30" height="150" fill="none" stroke="#ec4899" strokeWidth="0.8" opacity="0.4" rx="1" />
    <text x="695" y="360" textAnchor="middle" fill="#ec4899" fontSize="5.5" opacity="0.6">VEST.</text>

    {/* Loading docks (north of building) */}
    <rect x="180" y="65" width="540" height="55" fill="#0a0d10" stroke="#f97316" strokeWidth="1.5" rx="2" />
    <text x="450" y="82" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="bold">ZONA MUELLES DE CARGA</text>
    {[0,1,2,3].map(i => (
      <rect key={i} x={192 + i * 128} y={88} width={116} height={26} fill="#13090a" stroke="#f97316" strokeWidth="0.8" rx="1" />
    ))}

    {/* Main truck access road (south) */}
    <rect x="180" y="500" width="540" height="50" fill="#0d0d0d" stroke="#78716c" strokeWidth="1" />
    <line x1="180" y1="525" x2="720" y2="525" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="16,10" />
    <text x="450" y="518" textAnchor="middle" fill="#78716c" fontSize="7">VÍA DE ACCESO CAMIONES</text>

    {/* Main entrance gate (south-center) */}
    <rect x="380" y="550" width="140" height="60" fill="#080808" stroke="#FFD700" strokeWidth="2" rx="2" />
    <text x="450" y="568" textAnchor="middle" fill="#FFD700" fontSize="8" fontWeight="bold">ENTRADA PRINCIPAL</text>
    <rect x="388" y="575" width="54" height="26" fill="#0f0c00" stroke="#FFD700" strokeWidth="0.8" rx="1" />
    <rect x="458" y="575" width="54" height="26" fill="#0f0c00" stroke="#FFD700" strokeWidth="0.8" rx="1" />
    <text x="415" y="592" textAnchor="middle" fill="#FFD700" fontSize="5.5">BARRERA</text>
    <text x="485" y="592" textAnchor="middle" fill="#FFD700" fontSize="5.5">BARRERA</text>

    {/* Guardhouse */}
    <rect x="530" y="554" width="54" height="52" fill="#0a0800" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
    <text x="557" y="572" textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontWeight="bold">GARITA</text>
    <text x="557" y="584" textAnchor="middle" fill="#fbbf24" fontSize="5.5">24h</text>

    {/* Visitor parking (west-south) */}
    <rect x="14" y="420" width="160" height="220" fill="#07090a" stroke="#94a3b8" strokeWidth="1.2" rx="2" />
    <text x="94" y="438" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="bold">P. VISITANTES</text>
    {[0,1,2].map(col => [0,1,2,3,4].map(row => (
      <rect key={`${col}-${row}`} x={22 + col * 48} y={446 + row * 36} width={38} height={26} fill="#0c0e10" stroke="#475569" strokeWidth="0.6" rx="1" />
    )))}

    {/* Employee parking (east) */}
    <rect x="726" y="120" width="162" height="380" fill="#07090a" stroke="#475569" strokeWidth="1.2" rx="2" />
    <text x="807" y="138" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="bold">P. EMPLEADOS</text>
    {[0,1,2].map(col => [0,1,2,3,4,5,6,7,8].map(row => (
      <rect key={`${col}-${row}`} x={734 + col * 50} y={148 + row * 38} width={40} height={28} fill="#0c0e10" stroke="#374151" strokeWidth="0.5" rx="1" />
    )))}

    {/* Waste / generator (west-north) */}
    <rect x="14" y="120" width="160" height="290" fill="#07090a" stroke="#6b7280" strokeWidth="1" rx="2" />
    <text x="94" y="138" textAnchor="middle" fill="#6b7280" fontSize="7" fontWeight="bold">SERVICIOS EXTERIORES</text>
    <rect x="22" y="148" width="140" height="70" fill="#0a0a0a" stroke="#4b5563" strokeWidth="0.8" rx="1" />
    <text x="92" y="186" textAnchor="middle" fill="#6b7280" fontSize="7">GENERADOR 400kVA</text>
    <rect x="22" y="228" width="140" height="70" fill="#0a0a0a" stroke="#4b5563" strokeWidth="0.8" rx="1" />
    <text x="92" y="266" textAnchor="middle" fill="#6b7280" fontSize="7">DEPÓSITO AGUA</text>
    <rect x="22" y="308" width="140" height="90" fill="#0a0a0a" stroke="#4b5563" strokeWidth="0.8" rx="1" />
    <text x="92" y="356" textAnchor="middle" fill="#6b7280" fontSize="7">ZONA RESIDUOS</text>

    {/* Emergency road perimeter */}
    <rect x="14" y="14" width="872" height="672" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="6,6" opacity="0.25" rx="3" />
    <text x="450" y="690" textAnchor="middle" fill="#ef4444" fontSize="6" opacity="0.4">VÍA PERIMETRAL DE EMERGENCIA</text>

    <Extinguisher x={190} y={75} />
    <Extinguisher x={700} y={75} />
    <Exit x={450} y={550} rot={180} />
    <Exit x={14} y={310} rot={270} />
    <Exit x={886} y={310} rot={90} />
  </svg>
);

// ── ZONAS COMUNES ─────────────────────────────────────────────────────────────
const PlanoZonasComunes = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id="zc-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff05" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#zc-grid)" />
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#0d9488" strokeWidth="2.5" rx="4" />
    <text x="450" y="26" textAnchor="middle" fill="#0d9488" fontSize="11" fontWeight="bold">ZONAS COMUNES</text>

    {/* Entrance corridor top */}
    <rect x="6" y="36" width="888" height="52" fill="#060c0b" stroke="#0d9488" strokeWidth="1" rx="0" />
    <text x="450" y="65" textAnchor="middle" fill="#2dd4bf" fontSize="8" fontWeight="bold">CORREDOR PRINCIPAL</text>
    <line x1="6" y1="62" x2="894" y2="62" stroke="#0d9488" strokeWidth="0.8" strokeDasharray="10,6" opacity="0.5" />
    <Exit x={450} y={36} /><Exit x={14} y={62} rot={270} /><Exit x={886} y={62} rot={90} />

    {/* CAFETERIA left section */}
    <rect x="6" y="88" width="560" height="360" fill="#060a09" stroke="#0d9488" strokeWidth="1.8" rx="2" />
    <text x="286" y="108" textAnchor="middle" fill="#2dd4bf" fontSize="10" fontWeight="bold">CAFETERÍA — 120 PAX</text>
    {/* Servery counter */}
    <rect x="16" y="116" width="540" height="40" fill="#0a1210" stroke="#0d9488" strokeWidth="1.2" rx="1" />
    <text x="286" y="140" textAnchor="middle" fill="#5eead4" fontSize="7.5" fontWeight="bold">BARRA SERVICIO / LÍNEA BANDEJAS</text>
    {[0,1,2,3,4,5,6].map(i => (
      <rect key={i} x={18 + i * 77} y={118} width={70} height={16} fill="#0f1f1c" stroke="#0d9488" strokeWidth="0.4" rx="0.5" />
    ))}
    {/* Dining tables */}
    {[0,1,2,3,4].map(row => [0,1,2,3].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={22 + col * 132} y={168 + row * 54} width={80} height={40} fill="#0a1210" stroke="#0d9488" strokeWidth="0.8" rx="3" />
        {[-1,1].map(side => [0,1,2,3].map(s => (
          <circle key={`${side}-${s}`} cx={22 + col * 132 + 10 + s * 20} cy={168 + row * 54 + 20 + side * 28} r="7" fill="#061009" stroke="#0d9488" strokeWidth="0.5" />
        )))}
      </g>
    )))}
    {/* Kitchen */}
    <rect x="6" y="452" width="560" height="140" fill="#060c0a" stroke="#0d9488" strokeWidth="1.5" rx="0" />
    <text x="286" y="470" textAnchor="middle" fill="#2dd4bf" fontSize="8.5" fontWeight="bold">COCINA INDUSTRIAL</text>
    <Machine x={16} y={478} w={70} h={100} label="HORNOS" color="#0d1a10" stroke="#0d9488" />
    <Machine x={96} y={478} w={70} h={100} label="FREIDORAS" color="#0d1a10" stroke="#0d9488" />
    <Machine x={176} y={478} w={70} h={100} label="COCINAS" color="#0d1a10" stroke="#0d9488" />
    <rect x="256" y="478" width="130" height="100" fill="#0d1a10" stroke="#0d9488" strokeWidth="0.8" rx="1" />
    <text x="321" y="530" textAnchor="middle" fill="#5eead4" fontSize="7">PREP. + OFFICE</text>
    <rect x="396" y="478" width="160" height="100" fill="#06100e" stroke="#14b8a6" strokeWidth="1" rx="1" />
    <text x="476" y="530" textAnchor="middle" fill="#5eead4" fontSize="7">FRÍO COCINA</text>
    <Extinguisher x={16} y={468} /><Extinguisher x={550} y={468} />

    {/* Recreation area center-right */}
    <rect x="572" y="88" width="322" height="200" fill="#07080d" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="733" y="107" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="bold">SALA DESCANSO / TV</text>
    {/* Sofas */}
    {[0,1].map(i => (
      <g key={i}>
        <rect x={582 + i * 160} y={116} width={140} height={60} fill="#0e0d1a" stroke="#7c3aed" strokeWidth="1" rx="4" />
        <text x={652 + i * 160} y={150} textAnchor="middle" fill="#a78bfa" fontSize="7">SOFÁ {i+1}</text>
      </g>
    ))}
    {/* TV wall */}
    <rect x="582" y="194" width="302" height="30" fill="#0a0a12" stroke="#7c3aed" strokeWidth="1" rx="1" />
    <text x="733" y="213" textAnchor="middle" fill="#a78bfa" fontSize="7.5">TV PANTALLA GRANDE 85"</text>
    {/* Plants */}
    <circle cx={582} cy={116} r="10" fill="#0a1a08" stroke="#16a34a" strokeWidth="1" />
    <circle cx={882} cy={116} r="10" fill="#0a1a08" stroke="#16a34a" strokeWidth="1" />

    {/* Vending area */}
    <rect x="572" y="298" width="160" height="100" fill="#080a0d" stroke="#60a5fa" strokeWidth="1.2" rx="2" />
    <text x="652" y="315" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">VENDING</text>
    {[0,1,2].map(i => (
      <rect key={i} x={582 + i * 48} y={322} width={38} height={64} fill="#060c18" stroke="#3b82f6" strokeWidth="0.8" rx="2" />
    ))}

    {/* Notice boards / HR info */}
    <rect x="742" y="298" width="152" height="100" fill="#080a0d" stroke="#f59e0b" strokeWidth="1.2" rx="2" />
    <text x="818" y="315" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">INFO EMPRESA</text>
    {[0,1].map(i => (
      <rect key={i} x={752 + i * 72} y={322} width={62} height={64} fill="#0f0b00" stroke="#d97706" strokeWidth="0.6" rx="1" />
    ))}

    {/* WC block right-bottom */}
    <rect x="572" y="408" width="322" height="184" fill="#07080d" stroke="#ec4899" strokeWidth="1.5" rx="2" />
    <text x="733" y="426" textAnchor="middle" fill="#f9a8d4" fontSize="9" fontWeight="bold">ASEOS COMUNES</text>
    <rect x="582" y="434" width="142" height="148" fill="#14041a" stroke="#ec4899" strokeWidth="1" rx="1" />
    <text x="653" y="452" textAnchor="middle" fill="#f9a8d4" fontSize="7.5">♂ CABALLEROS</text>
    {[0,1,2].map(i => <rect key={i} x={590 + i * 44} y={460} width={36} height={50} fill="#200614" stroke="#ec4899" strokeWidth="0.6" rx="1" />)}
    {[0,1,2].map(i => <rect key={i} x={590 + i * 44} y={518} width={36} height={54} fill="#1a0510" stroke="#ec4899" strokeWidth="0.5" rx="1" />)}
    <rect x="734" y="434" width="150" height="148" fill="#14041a" stroke="#ec4899" strokeWidth="1" rx="1" />
    <text x="809" y="452" textAnchor="middle" fill="#f9a8d4" fontSize="7.5">♀ SEÑORAS</text>
    {[0,1,2].map(i => <rect key={i} x={742 + i * 46} y={460} width={38} height={50} fill="#200614" stroke="#ec4899" strokeWidth="0.6" rx="1" />)}
    {[0,1,2].map(i => <rect key={i} x={742 + i * 46} y={518} width={38} height={54} fill="#1a0510" stroke="#ec4899" strokeWidth="0.5" rx="1" />)}

    <Extinguisher x={580} y={98} /><Extinguisher x={880} y={98} />
    <Extinguisher x={580} y={415} /><Extinguisher x={880} y={415} />
    <Col x={566} y={88} /><Col x={566} y={298} /><Col x={566} y={460} /><Col x={566} y={600} />
  </svg>
);

// ── VESTUARIOS ────────────────────────────────────────────────────────────────
const PlanoVestuarios = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id="vs-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff05" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#vs-grid)" />
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#ec4899" strokeWidth="2.5" rx="4" />
    <text x="450" y="26" textAnchor="middle" fill="#ec4899" fontSize="11" fontWeight="bold">VESTUARIOS</text>

    {/* Central dividing wall */}
    <rect x="444" y="36" width="12" height="658" fill="#1c1c1c" stroke="#374151" strokeWidth="1" />
    <text x="450" y="360" textAnchor="middle" fill="#374151" fontSize="7" fontWeight="bold" transform="rotate(-90,450,360)">MURO DIVISORIO</text>

    {/* MALE SIDE (left) */}
    <text x="224" y="52" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">♂ VESTUARIO CABALLEROS</text>

    {/* Entrance vestibule male */}
    <rect x="10" y="60" width="430" height="60" fill="#060a10" stroke="#60a5fa" strokeWidth="1.2" rx="1" />
    <text x="225" y="95" textAnchor="middle" fill="#93c5fd" fontSize="8">ENTRADA / CONTROL ACCESO</text>
    <Door x={180} y={120} w={40} />

    {/* Lockers male — 2 rows of 8 */}
    <rect x="10" y="130" width="430" height="120" fill="#060810" stroke="#60a5fa" strokeWidth="1.5" rx="1" />
    <text x="225" y="147" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">TAQUILLAS — 64 UNIDADES</text>
    {[0,1].map(row => [0,1,2,3,4,5,6,7].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={18 + col * 52} y={156 + row * 44} width={44} height={38} fill="#060c1a" stroke="#3b82f6" strokeWidth="0.8" rx="1" />
        <rect x={26 + col * 52} y={162 + row * 44} width={10} height={16} fill="#0a1428" stroke="#1d4ed8" strokeWidth="0.4" rx="0.5" />
        <circle cx={38 + col * 52} cy={178 + row * 44} r="3.5" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="0.5" />
      </g>
    )))}
    {/* Benches */}
    <rect x="10" y="258" width="430" height="22" fill="#0f0a04" stroke="#78716c" strokeWidth="1" rx="1" />
    <text x="225" y="273" textAnchor="middle" fill="#78716c" fontSize="6.5">BANCOS</text>

    {/* Showers male */}
    <rect x="10" y="290" width="280" height="160" fill="#060810" stroke="#38bdf8" strokeWidth="1.5" rx="1" />
    <text x="150" y="307" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="bold">DUCHAS — 8 CABINAS</text>
    {[0,1,2,3].map(col => [0,1].map(row => (
      <g key={`${col}-${row}`}>
        <rect x={18 + col * 66} y={316 + row * 64} width={56} height={56} fill="#05090f" stroke="#0284c7" strokeWidth="1" rx="1" />
        <circle cx={46 + col * 66} cy={344 + row * 64} r="12" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,2" />
        <circle cx={46 + col * 66} cy={344 + row * 64} r="3" fill="#0369a1" />
        <text x={46 + col * 66} y={374 + row * 64} textAnchor="middle" fill="#7dd3fc" fontSize="5">DU{col + 1 + row * 4}</text>
      </g>
    )))}

    {/* WC male */}
    <rect x="300" y="290" width="140" height="160" fill="#060810" stroke="#ec4899" strokeWidth="1.2" rx="1" />
    <text x="370" y="307" textAnchor="middle" fill="#f9a8d4" fontSize="8" fontWeight="bold">WC — 4 CABINAS</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x={308 + (i % 2) * 64} y={314 + Math.floor(i / 2) * 64} width={56} height={56} fill="#14041a" stroke="#db2777" strokeWidth="0.8" rx="1" />
        <text x={336 + (i % 2) * 64} y={345 + Math.floor(i / 2) * 64} textAnchor="middle" fill="#f9a8d4" fontSize="6">WC {i + 1}</text>
      </g>
    ))}

    {/* Sinks male */}
    <rect x="10" y="460" width="430" height="50" fill="#060810" stroke="#22d3ee" strokeWidth="1.2" rx="1" />
    <text x="225" y="477" textAnchor="middle" fill="#67e8f9" fontSize="8" fontWeight="bold">LAVABOS — 8 PUESTOS</text>
    {[0,1,2,3,4,5,6,7].map(i => (
      <ellipse key={i} cx={28 + i * 52} cy={492} rx="16" ry="10" fill="#060d10" stroke="#0891b2" strokeWidth="1" />
    ))}

    {/* Ironing + misc male */}
    <rect x="10" y="520" width="430" height="60" fill="#060810" stroke="#a3e635" strokeWidth="1" rx="1" />
    <text x="225" y="537" textAnchor="middle" fill="#bef264" fontSize="7.5">PLANCHADO + TAQUILLAS SECADO</text>
    {[0,1].map(i => <rect key={i} x={18 + i * 210} y={544} width={180} height={28} fill="#0a1202" stroke="#65a30d" strokeWidth="0.6" rx="1" />)}

    {/* FEMALE SIDE (right) */}
    <text x="676" y="52" textAnchor="middle" fill="#f9a8d4" fontSize="10" fontWeight="bold">♀ VESTUARIO SEÑORAS</text>

    {/* Entrance vestibule female */}
    <rect x="460" y="60" width="430" height="60" fill="#14041a" stroke="#ec4899" strokeWidth="1.2" rx="1" />
    <text x="675" y="95" textAnchor="middle" fill="#f9a8d4" fontSize="8">ENTRADA / CONTROL ACCESO</text>
    <Door x={630} y={120} w={40} />

    {/* Lockers female — 2 rows of 8 */}
    <rect x="460" y="130" width="430" height="120" fill="#14041a" stroke="#ec4899" strokeWidth="1.5" rx="1" />
    <text x="675" y="147" textAnchor="middle" fill="#f9a8d4" fontSize="8" fontWeight="bold">TAQUILLAS — 64 UNIDADES</text>
    {[0,1].map(row => [0,1,2,3,4,5,6,7].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={468 + col * 52} y={156 + row * 44} width={44} height={38} fill="#1a0614" stroke="#db2777" strokeWidth="0.8" rx="1" />
        <rect x={476 + col * 52} y={162 + row * 44} width={10} height={16} fill="#280a20" stroke="#be185d" strokeWidth="0.4" rx="0.5" />
        <circle cx={488 + col * 52} cy={178 + row * 44} r="3.5" fill="#3d0f2a" stroke="#ec4899" strokeWidth="0.5" />
      </g>
    )))}
    {/* Benches */}
    <rect x="460" y="258" width="430" height="22" fill="#0f0a04" stroke="#78716c" strokeWidth="1" rx="1" />
    <text x="675" y="273" textAnchor="middle" fill="#78716c" fontSize="6.5">BANCOS</text>

    {/* Showers female */}
    <rect x="460" y="290" width="280" height="160" fill="#14041a" stroke="#f472b6" strokeWidth="1.5" rx="1" />
    <text x="600" y="307" textAnchor="middle" fill="#f9a8d4" fontSize="8" fontWeight="bold">DUCHAS — 8 CABINAS</text>
    {[0,1,2,3].map(col => [0,1].map(row => (
      <g key={`${col}-${row}`}>
        <rect x={468 + col * 66} y={316 + row * 64} width={56} height={56} fill="#1a0518" stroke="#db2777" strokeWidth="1" rx="1" />
        <circle cx={496 + col * 66} cy={344 + row * 64} r="12" fill="none" stroke="#f472b6" strokeWidth="0.8" strokeDasharray="3,2" />
        <circle cx={496 + col * 66} cy={344 + row * 64} r="3" fill="#9d174d" />
      </g>
    )))}

    {/* WC female */}
    <rect x="750" y="290" width="140" height="160" fill="#14041a" stroke="#ec4899" strokeWidth="1.2" rx="1" />
    <text x="820" y="307" textAnchor="middle" fill="#f9a8d4" fontSize="8" fontWeight="bold">WC — 4 CABINAS</text>
    {[0,1,2,3].map(i => (
      <g key={i}>
        <rect x={758 + (i % 2) * 64} y={314 + Math.floor(i / 2) * 64} width={56} height={56} fill="#14041a" stroke="#db2777" strokeWidth="0.8" rx="1" />
        <text x={786 + (i % 2) * 64} y={345 + Math.floor(i / 2) * 64} textAnchor="middle" fill="#f9a8d4" fontSize="6">WC {i + 1}</text>
      </g>
    ))}

    {/* Sinks female */}
    <rect x="460" y="460" width="430" height="50" fill="#14041a" stroke="#22d3ee" strokeWidth="1.2" rx="1" />
    <text x="675" y="477" textAnchor="middle" fill="#67e8f9" fontSize="8" fontWeight="bold">LAVABOS — 8 PUESTOS</text>
    {[0,1,2,3,4,5,6,7].map(i => (
      <ellipse key={i} cx={478 + i * 52} cy={492} rx="16" ry="10" fill="#060d10" stroke="#0891b2" strokeWidth="1" />
    ))}

    {/* Ironing female */}
    <rect x="460" y="520" width="430" height="60" fill="#14041a" stroke="#a3e635" strokeWidth="1" rx="1" />
    <text x="675" y="537" textAnchor="middle" fill="#bef264" fontSize="7.5">PLANCHADO + TAQUILLAS SECADO</text>
    {[0,1].map(i => <rect key={i} x={468 + i * 210} y={544} width={180} height={28} fill="#0a1202" stroke="#65a30d" strokeWidth="0.6" rx="1" />)}

    {/* Mirror area both sides */}
    <rect x="10" y="588" width="430" height="40" fill="#07080d" stroke="#94a3b8" strokeWidth="0.8" rx="1" />
    <text x="225" y="611" textAnchor="middle" fill="#94a3b8" fontSize="7">ESPEJO CONTINUO + ACCESORIOS</text>
    <rect x="460" y="588" width="430" height="40" fill="#07080d" stroke="#94a3b8" strokeWidth="0.8" rx="1" />
    <text x="675" y="611" textAnchor="middle" fill="#94a3b8" fontSize="7">ESPEJO CONTINUO + ACCESORIOS</text>

    {/* Disability accessible WC bottom */}
    <rect x="10" y="638" width="430" height="50" fill="#060810" stroke="#fbbf24" strokeWidth="1.2" rx="1" />
    <text x="225" y="656" textAnchor="middle" fill="#fbbf24" fontSize="7.5">WC ADAPTADO PMR — COMÚN</text>
    <rect x="460" y="638" width="430" height="50" fill="#060810" stroke="#fbbf24" strokeWidth="1.2" rx="1" />
    <text x="675" y="656" textAnchor="middle" fill="#fbbf24" fontSize="7.5">WC ADAPTADO PMR — SEÑORAS</text>

    <Extinguisher x={12} y={68} /><Extinguisher x={880} y={68} />
    <Exit x={14} y={360} rot={270} /><Exit x={886} y={360} rot={90} />
    <Col x={10} y={130} /><Col x={440} y={130} /><Col x={460} y={130} /><Col x={890} y={130} />
    <Col x={10} y={400} /><Col x={440} y={400} /><Col x={460} y={400} /><Col x={890} y={400} />
  </svg>
);

// ── SALA TÉCNICA ──────────────────────────────────────────────────────────────
const PlanoSalaTecnica = () => (
  <svg viewBox="0 0 900 700" className="w-full h-full" style={{ background: '#080c10' }}>
    <defs>
      <pattern id="st-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#06b6d410" strokeWidth="0.4" />
      </pattern>
    </defs>
    <rect width="900" height="700" fill="url(#st-grid)" />
    <rect x="6" y="6" width="888" height="688" fill="none" stroke="#06b6d4" strokeWidth="2.5" rx="4" />
    <text x="450" y="26" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">SALA TÉCNICA</text>

    {/* Access corridor top */}
    <rect x="6" y="36" width="888" height="44" fill="#060c10" stroke="#06b6d4" strokeWidth="0.8" />
    <text x="450" y="62" textAnchor="middle" fill="#67e8f9" fontSize="7.5" fontWeight="bold">CORREDOR TÉCNICO — ACCESO RESTRINGIDO ⚠</text>
    <Exit x={200} y={36} /><Exit x={700} y={36} />

    {/* ELECTRICAL SWITCHGEAR - top left */}
    <rect x="6" y="80" width="380" height="240" fill="#05080d" stroke="#06b6d4" strokeWidth="2" rx="2" />
    <text x="196" y="98" textAnchor="middle" fill="#67e8f9" fontSize="9" fontWeight="bold">CUADROS ELÉCTRICOS PRINCIPALES</text>
    {/* Main switchgear panels */}
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x={16 + i * 70} y={106} width={60} height={180} fill="#050d10" stroke="#0891b2" strokeWidth="1.2" rx="1" />
        <text x={46 + i * 70} y={122} textAnchor="middle" fill="#67e8f9" fontSize="6" fontWeight="bold">CQ-{i + 1}</text>
        {/* Breakers */}
        {[0,1,2,3,4,5,6,7,8,9].map(j => (
          <rect key={j} x={22 + i * 70} y={130 + j * 14} width={46} height={10} fill={j % 3 === 0 ? '#0f2a14' : '#060d10'} stroke="#0891b2" strokeWidth="0.3" rx="0.5" />
        ))}
        <rect x={16 + i * 70} y={290} width={60} height={16} fill="#0a1a10" stroke="#22c55e" strokeWidth="0.5" rx="0.5" />
      </g>
    ))}
    {/* BMS workstation */}
    <Machine x={366} y={106} w={14} h={180} label="BMS" color="#050d08" stroke="#22c55e" />
    <Extinguisher x={16} y={90} /><Extinguisher x={370} y={90} />

    {/* SERVER ROOM - top right */}
    <rect x="394" y="80" width="500" height="240" fill="#050810" stroke="#8b5cf6" strokeWidth="2" rx="2" />
    <text x="644" y="98" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="bold">SALA SERVIDORES / CPD</text>
    {/* Raised floor indicator */}
    <rect x="400" y="104" width="488" height="210" fill="#05060d" stroke="#6d28d9" strokeWidth="0.8" strokeDasharray="4,3" rx="1" />
    <text x="644" y="115" textAnchor="middle" fill="#6d28d9" fontSize="6">Suelo técnico elevado — T ≤ 21°C / HR ≤ 50%</text>
    {/* Server rack rows */}
    {[0,1,2,3,4,5].map(col => [0,1,2,3].map(row => (
      <g key={`${col}-${row}`}>
        <rect x={408 + col * 78} y={122 + row * 46} width={68} height={38} fill="#060810" stroke="#7c3aed" strokeWidth="1" rx="1" />
        {[0,1,2,3,4,5].map(u => (
          <rect key={u} x={412 + col * 78} y={126 + u * 5 + row * 46} width={60} height={3} fill={u % 4 === 0 ? '#1e0a40' : '#060810'} stroke="#4c1d95" strokeWidth="0.2" rx="0.2" />
        ))}
        <circle cx={470 + col * 78} cy={160 + row * 46} r="3" fill={row % 2 === 0 ? '#15803d' : '#1d4ed8'} />
        <text x={442 + col * 78} y={159 + row * 46} textAnchor="middle" fill="#a78bfa" fontSize="4.5">RACK {col + 1}-{row + 1}</text>
      </g>
    )))}
    {/* Cooling units */}
    <rect x="844" y="104" width="44" height="210" fill="#050810" stroke="#22d3ee" strokeWidth="1.2" rx="1" />
    <text x="866" y="180" textAnchor="middle" fill="#67e8f9" fontSize="5.5" transform="rotate(-90,866,180)">CRAC COOLING</text>
    <Extinguisher x={400} y={90} /><Extinguisher x={880} y={90} />

    {/* UPS ROOM - bottom left */}
    <rect x="6" y="330" width="240" height="200" fill="#060b05" stroke="#22c55e" strokeWidth="2" rx="2" />
    <text x="126" y="348" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="bold">SALA SAI / UPS</text>
    <text x="126" y="360" textAnchor="middle" fill="#4ade80" fontSize="6">Autonomía: 30 min — 160 kVA</text>
    {/* UPS units */}
    {[0,1].map(row => [0,1].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={16 + col * 110} y={368 + row * 84} width={100} height={74} fill="#060f05" stroke="#16a34a" strokeWidth="1.2" rx="2" />
        <text x={66 + col * 110} y={400 + row * 84} textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="bold">UPS {row * 2 + col + 1}</text>
        <rect x={22 + col * 110} y={376 + row * 84} width={88} height={16} fill="#0a1f08" stroke="#22c55e" strokeWidth="0.5" rx="0.5" />
        <circle cx={106 + col * 110} cy={426 + row * 84} r="6" fill={row === 0 ? '#14532d' : '#15803d'} stroke="#22c55e" strokeWidth="0.8" />
      </g>
    )))}
    <Extinguisher x={16} y={340} />

    {/* COMPRESSOR ROOM - bottom center */}
    <rect x="256" y="330" width="290" height="200" fill="#060a0a" stroke="#f59e0b" strokeWidth="2" rx="2" />
    <text x="401" y="348" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">SALA COMPRESORES</text>
    {/* Compressors */}
    {[0,1].map(i => (
      <g key={i}>
        <rect x={266 + i * 130} y={358} width={110} height={100} fill="#0a0800" stroke="#d97706" strokeWidth="1.5" rx="3" />
        <text x={321 + i * 130} y={395} textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="bold">COMP. {i + 1}</text>
        <text x={321 + i * 130} y={408} textAnchor="middle" fill="#fbbf24" fontSize="6">55 kW / 8 bar</text>
        <circle cx={321 + i * 130} cy={424} r="14" fill="#0d0900" stroke="#f59e0b" strokeWidth="1.2" />
        <circle cx={321 + i * 130} cy={424} r="7" fill="#f59e0b" opacity="0.3" />
      </g>
    ))}
    {/* Dryer */}
    <rect x="266" y="468" width="100" height="50" fill="#0a0800" stroke="#d97706" strokeWidth="1" rx="2" />
    <text x="316" y="497" textAnchor="middle" fill="#fbbf24" fontSize="6.5">SECADOR</text>
    {/* Air accumulator tank */}
    <ellipse cx={410} cy={494} rx={30} ry={16} fill="#0a0800" stroke="#d97706" strokeWidth="1.2" />
    <text x="410" y="498" textAnchor="middle" fill="#fbbf24" fontSize="5.5">ACUMULADOR</text>
    {/* Distribution manifold */}
    <rect x="450" y="468" width="86" height="50" fill="#0a0800" stroke="#d97706" strokeWidth="0.8" rx="1" />
    <text x="493" y="497" textAnchor="middle" fill="#fbbf24" fontSize="5.5">DISTRIBUCIÓN</text>
    <Extinguisher x={260} y={340} />

    {/* HVAC PLANT - bottom right */}
    <rect x="556" y="330" width="338" height="200" fill="#06080c" stroke="#38bdf8" strokeWidth="2" rx="2" />
    <text x="725" y="348" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="bold">PLANTA HVAC / CLIMATIZACIÓN</text>
    {/* AHU units */}
    {[0,1].map(i => (
      <g key={i}>
        <rect x={566 + i * 160} y={358} width={148} height={120} fill="#05080e" stroke="#0284c7" strokeWidth="1.5" rx="2" />
        <text x={640 + i * 160} y={378} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="bold">UTA-{i + 1}</text>
        <text x={640 + i * 160} y={390} textAnchor="middle" fill="#7dd3fc" fontSize="5.5">Caudal: 15.000 m³/h</text>
        {/* Fan circles */}
        <circle cx={610 + i * 160} cy={430} r={28} fill="#050a12" stroke="#0284c7" strokeWidth="1" />
        <circle cx={610 + i * 160} cy={430} r={16} fill="#040810" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4,2" />
        <circle cx={610 + i * 160} cy={430} r={5} fill="#0369a1" />
        {/* Filter bank */}
        <rect x={656 + i * 160} y={370} width={50} height={100} fill="#040a14" stroke="#0284c7" strokeWidth="0.6" rx="1" />
        <text x={681 + i * 160} y={424} textAnchor="middle" fill="#7dd3fc" fontSize="5" transform={`rotate(-90,${681 + i * 160},424)`}>FILTROS</text>
      </g>
    ))}
    {/* Chiller */}
    <rect x="880" y="358" width="8" height="120" fill="#0a1a10" stroke="#22c55e" strokeWidth="0.8" rx="0.5" />
    {/* Control panel */}
    <rect x="724" y="466" width="168" height="56" fill="#050810" stroke="#06b6d4" strokeWidth="1.2" rx="1" />
    <text x="808" y="484" textAnchor="middle" fill="#67e8f9" fontSize="7.5" fontWeight="bold">PANEL BMS-HVAC</text>
    <text x="808" y="498" textAnchor="middle" fill="#67e8f9" fontSize="6">Monitorización centralizada</text>
    <Extinguisher x={562} y={340} /><Extinguisher x={880} y={340} />

    {/* Fire suppression panel */}
    <rect x="6" y="540" width="888" height="60" fill="#05080c" stroke="#ef4444" strokeWidth="1.5" rx="1" />
    <text x="450" y="558" textAnchor="middle" fill="#f87171" fontSize="8.5" fontWeight="bold">SISTEMAS DE PROTECCIÓN CONTRA INCENDIOS</text>
    {[
      { x: 16, label: 'DETECCIÓN INCENDIO' }, { x: 196, label: 'ROCIADORES' },
      { x: 376, label: 'CENTRAL ALARMA' }, { x: 556, label: 'AGENTE LIMPIO FM200' },
      { x: 736, label: 'GRUPO PRESIÓN PCI' }
    ].map(p => (
      <g key={p.label}>
        <rect x={p.x} y={566} width={168} height={26} fill="#140608" stroke="#dc2626" strokeWidth="0.6" rx="1" />
        <text x={p.x + 84} y={583} textAnchor="middle" fill="#f87171" fontSize="5.5">{p.label}</text>
      </g>
    ))}

    {/* Grounding bus bottom */}
    <rect x="6" y="610" width="888" height="30" fill="#04060a" stroke="#FFD700" strokeWidth="1.2" rx="1" />
    <text x="450" y="629" textAnchor="middle" fill="#FFD700" fontSize="7">BUS DE TIERRA GENERAL — RED EQUIPOTENCIAL</text>

    <Col x={250} y={80} /><Col x={250} y={330} /><Col x={550} y={80} /><Col x={550} y={330} />
    <Col x={890} y={80} /><Col x={890} y={330} /><Col x={6} y={330} /><Col x={6} y={540} />
  </svg>
);

// ── ZONE FLOOR PLAN ROUTER ───────────────────────────────────────────────────
const ZoneFloorPlan = ({ zoneId }: { zoneId: string }) => {
  const map: Record<string, React.ReactNode> = {
    'PRODUCCIÓN': <PlanoProduccion />,
    'ALMACÉN': <PlanoAlmacen />,
    'ACCESO': <PlanoAcceso />,
    'OFICINAS': <PlanoOficinas />,
    'CARGA': <PlanoCarga />,
    'EXTERIOR': <PlanoExterior />,
    'ZONAS COMUNES': <PlanoZonasComunes />,
    'VESTUARIOS': <PlanoVestuarios />,
    'SALA TÉCNICA': <PlanoSalaTecnica />,
  };
  if (map[zoneId]) return <div className="w-full h-full">{map[zoneId]}</div>;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#080c10' }}>
      <text style={{ fill: '#666', fontSize: 14 }}>{zoneId}</text>
    </div>
  );
};

// ── Icono extintor SVG ───────────────────────────────────────────────────────
const EXTINTOR_INITIALS: Record<string, string> = {
  'Polvo': 'P', 'CO₂': 'C', 'Agua': 'A', 'Espuma': 'E',
  'Automático': 'Au', 'Industrial': 'I', 'Portátil': 'Po', 'Móvil': 'M', 'Otros': 'O',
};
function ExtintorIcon({ x, y, type }: { x: number; y: number; type: string }) {
  const ini = EXTINTOR_INITIALS[type] ?? type.charAt(0).toUpperCase();
  return (
    <g transform={`translate(${x},${y})`}>
      {/* cuerpo */}
      <rect x="-9" y="-13" width="18" height="26" rx="4" fill="#CC2200" stroke="#880000" strokeWidth="1.2" />
      {/* válvula superior */}
      <rect x="-5" y="-20" width="10" height="9" rx="2" fill="#991100" stroke="#660000" strokeWidth="1" />
      {/* manguera */}
      <line x1="5" y1="-16" x2="15" y2="-16" stroke="#771100" strokeWidth="3" strokeLinecap="round" />
      {/* inicial */}
      <text textAnchor="middle" y="7" fontSize={ini.length > 1 ? 7 : 10} fontWeight="bold" fill="white" fontFamily="monospace">{ini}</text>
    </g>
  );
}

function CocheIcon({ x, y, type }: { x: number; y: number; type: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-14" y="-8" width="28" height="14" rx="4" fill="#2563eb" stroke="#1e40af" strokeWidth="1.2" />
      <rect x="-9" y="-14" width="18" height="8" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
      <circle cx="-8" cy="7" r="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      <circle cx="8" cy="7" r="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      <rect x="-5" y="-12" width="10" height="5" rx="1" fill="#bfdbfe" opacity="0.8" />
      <text textAnchor="middle" y="-1" fontSize="5" fontWeight="bold" fill="white" fontFamily="monospace">{type.slice(0,3).toUpperCase()}</text>
    </g>
  );
}
function CamaraIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-12" y="-9" width="20" height="16" rx="3" fill="#374151" stroke="#6b7280" strokeWidth="1.2" />
      <circle cx="1" cy="-1" r="6" fill="#1f2937" stroke="#6b7280" strokeWidth="1" />
      <circle cx="1" cy="-1" r="3.5" fill="#111827" />
      <circle cx="1" cy="-1" r="1.5" fill="#3b82f6" opacity="0.8" />
      <rect x="9" y="-4" width="5" height="5" rx="1" fill="#4b5563" stroke="#6b7280" strokeWidth="0.8" />
      <rect x="-14" y="-5" width="3" height="3" rx="1" fill="#ef4444" opacity="0.9" />
    </g>
  );
}
function MaquinaIcon({ x, y, type }: { x: number; y: number; type: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-13" y="-14" width="26" height="26" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="-9" y="-10" width="18" height="14" rx="1" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
      <circle cx="0" cy="-3" r="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="0" cy="-3" r="2" fill="#94a3b8" opacity="0.7" />
      <rect x="-11" y="6" width="22" height="4" rx="1" fill="#64748b" />
      <text textAnchor="middle" y="17" fontSize="5" fontWeight="bold" fill="#94a3b8" fontFamily="monospace">{type.slice(0,4).toUpperCase()}</text>
    </g>
  );
}
function CascoIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M-12,4 Q-12,-14 0,-16 Q12,-14 12,4 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" />
      <rect x="-14" y="3" width="28" height="5" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
      <rect x="-6" y="-10" width="12" height="8" rx="1" fill="#fbbf24" opacity="0.5" />
      <text textAnchor="middle" y="16" fontSize="6" fontWeight="bold" fill="#92400e" fontFamily="monospace">EPI</text>
    </g>
  );
}
function PersonaIcon({ x, y, colorKey = 5 }: { x: number; y: number; colorKey?: number }) {
  const fill = TESO_COLOR_HEX[colorKey] ?? '#10b981';
  const stroke = TESO_COLOR_STROKE[colorKey] ?? '#059669';
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="-16" r="6" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <rect x="-7" y="-9" width="14" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="1" />
      <line x1="-7" y1="-5" x2="-14" y2="4" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="-5" x2="14" y2="4" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-4" y1="7" x2="-4" y2="20" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="7" x2="4" y2="20" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}
function CarretillaIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-14" y="-6" width="18" height="10" rx="2" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
      <rect x="-16" y="-14" width="4" height="22" rx="1" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
      <line x1="-14" y1="-10" x2="4" y2="-10" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-14" y1="-6" x2="4" y2="-6" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-6" cy="7" r="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      <circle cx="8" cy="7" r="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      <text textAnchor="middle" y="-1" fontSize="6" fontWeight="bold" fill="white" fontFamily="monospace">⬆</text>
    </g>
  );
}
function CajaIcon({ x, y, type }: { x: number; y: number; type: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-12" y="-8" width="24" height="20" rx="2" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1.2" />
      <line x1="-12" y1="-2" x2="12" y2="-2" stroke="#7c3aed" strokeWidth="1" />
      <line x1="0" y1="-8" x2="0" y2="12" stroke="#7c3aed" strokeWidth="1" />
      <text textAnchor="middle" y="5" fontSize={type.length > 4 ? 5 : 7} fontWeight="bold" fill="white" fontFamily="monospace">{type.slice(0,4)}</text>
    </g>
  );
}
function OrdenadorIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-13" y="-14" width="26" height="19" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <rect x="-11" y="-12" width="22" height="15" rx="1" fill="#0ea5e9" opacity="0.75" />
      <rect x="-11" y="-12" width="22" height="7" rx="1" fill="#38bdf8" opacity="0.4" />
      <rect x="-2" y="5" width="4" height="5" fill="#475569" />
      <rect x="-8" y="10" width="16" height="3" rx="1" fill="#64748b" />
    </g>
  );
}
function PlacedElementIcon({ el }: { el: PlacedElement }) {
  const { x, y, category, subcategory, type, colorKey } = el;
  if (subcategory === 'Extintores') return <ExtintorIcon x={x} y={y} type={type} />;
  if (subcategory === 'Cámaras') return <CamaraIcon x={x} y={y} />;
  if (subcategory === 'EPIs') return <CascoIcon x={x} y={y} />;
  if (category === 'Personas') return <PersonaIcon x={x} y={y} colorKey={colorKey ?? 5} />;
  if (category === 'Maquinaria') return <MaquinaIcon x={x} y={y} type={type} />;
  if (subcategory === 'Coches' || subcategory === 'Furgonetas' || subcategory === 'Camiones') return <CocheIcon x={x} y={y} type={type} />;
  if (subcategory === 'Carretillas' || subcategory === 'Maq. móvil') return <CarretillaIcon x={x} y={y} />;
  if (category === 'Vehículos') return <CocheIcon x={x} y={y} type={type} />;
  if (subcategory === 'Ordenadores' || subcategory === 'Pantallas') return <OrdenadorIcon x={x} y={y} />;
  if (category === 'Material' && (subcategory === 'Oficina')) return <OrdenadorIcon x={x} y={y} />;
  if (category === 'Material') return <CajaIcon x={x} y={y} type={type} />;
  return <CajaIcon x={x} y={y} type={type} />;
}

const DEMO_OFICINAS: PlacedElement[] = [
  // Open Office Norte — 8 personas con distintos colorKey
  { id: 'o1',  category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 49,  y: 96,  zoneId: 'OFICINAS', colorKey: 1 },
  { id: 'o2',  category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 193, y: 96,  zoneId: 'OFICINAS', colorKey: 2 },
  { id: 'o3',  category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 337, y: 96,  zoneId: 'OFICINAS', colorKey: 3 },
  { id: 'o4',  category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 481, y: 96,  zoneId: 'OFICINAS', colorKey: 4 },
  { id: 'o5',  category: 'Personas', subcategory: 'Técnicos',     type: 'IT',      x: 121, y: 172, zoneId: 'OFICINAS', colorKey: 6 },
  { id: 'o6',  category: 'Personas', subcategory: 'Técnicos',     type: 'IT',      x: 265, y: 172, zoneId: 'OFICINAS', colorKey: 6 },
  { id: 'o7',  category: 'Personas', subcategory: 'Supervisores', type: 'Jefe',    x: 409, y: 172, zoneId: 'OFICINAS', colorKey: 7 },
  { id: 'o8',  category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 553, y: 172, zoneId: 'OFICINAS', colorKey: 8 },
  // Open Office Norte — 6 ordenadores (rows 1 y 3)
  { id: 'o9',  category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 49,  y: 134, zoneId: 'OFICINAS' },
  { id: 'o10', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 193, y: 134, zoneId: 'OFICINAS' },
  { id: 'o11', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 337, y: 134, zoneId: 'OFICINAS' },
  { id: 'o12', category: 'Material', subcategory: 'Ordenadores',  type: 'MAC',     x: 121, y: 210, zoneId: 'OFICINAS' },
  { id: 'o13', category: 'Material', subcategory: 'Ordenadores',  type: 'MAC',     x: 265, y: 210, zoneId: 'OFICINAS' },
  { id: 'o14', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 409, y: 210, zoneId: 'OFICINAS' },
  // Open Office Sur — 3 personas
  { id: 'o15', category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 49,  y: 422, zoneId: 'OFICINAS', colorKey: 2 },
  { id: 'o16', category: 'Personas', subcategory: 'Trabajadores', type: 'Admin.',  x: 193, y: 422, zoneId: 'OFICINAS', colorKey: 3 },
  { id: 'o17', category: 'Personas', subcategory: 'Dirección',    type: 'Dir.',    x: 337, y: 422, zoneId: 'OFICINAS', colorKey: 7 },
  // Open Office Sur — 6 ordenadores
  { id: 'o18', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 121, y: 422, zoneId: 'OFICINAS' },
  { id: 'o19', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 265, y: 422, zoneId: 'OFICINAS' },
  { id: 'o20', category: 'Material', subcategory: 'Ordenadores',  type: 'MAC',     x: 409, y: 422, zoneId: 'OFICINAS' },
  { id: 'o21', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 49,  y: 460, zoneId: 'OFICINAS' },
  { id: 'o22', category: 'Material', subcategory: 'Ordenadores',  type: 'PC',      x: 193, y: 460, zoneId: 'OFICINAS' },
  { id: 'o23', category: 'Material', subcategory: 'Ordenadores',  type: 'MAC',     x: 337, y: 460, zoneId: 'OFICINAS' },
  // Salas de reunión — 2 personas
  { id: 'o24', category: 'Personas', subcategory: 'Dirección',    type: 'Dir.',    x: 680, y: 120, zoneId: 'OFICINAS', colorKey: 9 },
  { id: 'o25', category: 'Personas', subcategory: 'Técnicos',     type: 'IT',      x: 740, y: 251, zoneId: 'OFICINAS', colorKey: 5 },
];

const DEMO_ALMACEN: PlacedElement[] = [
  // MUELLES RECEPCIÓN (x:6-158, y:6-352)
  { id: 'a1',  category: 'Personas', subcategory: 'Trabajadores', type: 'Mozos',   x: 55,  y: 80,  zoneId: 'ALMACÉN', colorKey: 2, subZoneId: 'MUELLES RECEPCIÓN' },
  { id: 'a2',  category: 'Personas', subcategory: 'Trabajadores', type: 'Mozos',   x: 100, y: 80,  zoneId: 'ALMACÉN', colorKey: 3, subZoneId: 'MUELLES RECEPCIÓN' },
  { id: 'a3',  category: 'Personas', subcategory: 'Supervisores', type: 'Jefe Rec',x: 75,  y: 200, zoneId: 'ALMACÉN', colorKey: 7, subZoneId: 'MUELLES RECEPCIÓN' },
  // MUELLES EXPEDICIÓN (x:6-158, y:352-692)
  { id: 'a4',  category: 'Personas', subcategory: 'Trabajadores', type: 'Mozos',   x: 55,  y: 430, zoneId: 'ALMACÉN', colorKey: 2, subZoneId: 'MUELLES EXPEDICIÓN' },
  { id: 'a5',  category: 'Personas', subcategory: 'Supervisores', type: 'Jefe Exp',x: 100, y: 510, zoneId: 'ALMACÉN', colorKey: 7, subZoneId: 'MUELLES EXPEDICIÓN' },
  // CUARENTENA (x:208-370, y:6-180)
  { id: 'a6',  category: 'Personas', subcategory: 'Técnicos',     type: 'Control', x: 280, y: 80,  zoneId: 'ALMACÉN', colorKey: 4, subZoneId: 'CUARENTENA' },
  // ALTA ROTACIÓN (x:208-720, y:180-520)
  { id: 'a7',  category: 'Personas', subcategory: 'Trabajadores', type: 'Carret.', x: 300, y: 280, zoneId: 'ALMACÉN', colorKey: 5, subZoneId: 'ALTA ROTACIÓN' },
  { id: 'a8',  category: 'Personas', subcategory: 'Trabajadores', type: 'Carret.', x: 450, y: 280, zoneId: 'ALMACÉN', colorKey: 5, subZoneId: 'ALTA ROTACIÓN' },
  { id: 'a9',  category: 'Personas', subcategory: 'Trabajadores', type: 'Carret.', x: 600, y: 350, zoneId: 'ALMACÉN', colorKey: 6, subZoneId: 'ALTA ROTACIÓN' },
  { id: 'a10', category: 'Personas', subcategory: 'Supervisores', type: 'Jefe AR', x: 400, y: 430, zoneId: 'ALMACÉN', colorKey: 7, subZoneId: 'ALTA ROTACIÓN' },
  // ZONA PICKING (x:208-720, y:520-692)
  { id: 'a11', category: 'Personas', subcategory: 'Trabajadores', type: 'Picking', x: 350, y: 580, zoneId: 'ALMACÉN', colorKey: 3, subZoneId: 'ZONA PICKING' },
  { id: 'a12', category: 'Personas', subcategory: 'Trabajadores', type: 'Picking', x: 550, y: 580, zoneId: 'ALMACÉN', colorKey: 4, subZoneId: 'ZONA PICKING' },
  // CÁMARA FRIGORÍFICA (x:720-894, y:6-352)
  { id: 'a13', category: 'Personas', subcategory: 'Técnicos',     type: 'Frío',    x: 800, y: 120, zoneId: 'ALMACÉN', colorKey: 6, subZoneId: 'CÁMARA FRIGORÍFICA' },
  // OFICINA WMS (x:720-894, y:352-520)
  { id: 'a14', category: 'Personas', subcategory: 'Técnicos',     type: 'WMS Op.', x: 780, y: 410, zoneId: 'ALMACÉN', colorKey: 1, subZoneId: 'OFICINA WMS' },
  { id: 'a15', category: 'Personas', subcategory: 'Supervisores', type: 'Resp. WMS',x: 840, y: 410, zoneId: 'ALMACÉN', colorKey: 9, subZoneId: 'OFICINA WMS' },
];

const DEMO_PRODUCCION: PlacedElement[] = [
  { id: 'd1',  category: 'Seguridad',  subcategory: 'Extintores', type: 'Polvo',    x: 145, y: 35,  zoneId: 'PRODUCCIÓN' },
  { id: 'd2',  category: 'Seguridad',  subcategory: 'Extintores', type: 'CO₂',      x: 620, y: 35,  zoneId: 'PRODUCCIÓN' },
  { id: 'd3',  category: 'Seguridad',  subcategory: 'Extintores', type: 'Polvo',    x: 145, y: 225, zoneId: 'PRODUCCIÓN' },
  { id: 'd4',  category: 'Seguridad',  subcategory: 'Extintores', type: 'Espuma',   x: 620, y: 435, zoneId: 'PRODUCCIÓN' },
  { id: 'd5',  category: 'Vehículos',  subcategory: 'Coches',     type: 'Eléctrico',x: 655, y: 455, zoneId: 'PRODUCCIÓN' },
  { id: 'd6',  category: 'Vehículos',  subcategory: 'Coches',     type: 'Diésel',   x: 710, y: 455, zoneId: 'PRODUCCIÓN' },
  { id: 'd7',  category: 'Vehículos',  subcategory: 'Coches',     type: 'Gasolina', x: 765, y: 455, zoneId: 'PRODUCCIÓN' },
  { id: 'd8',  category: 'Maquinaria', subcategory: 'Producción', type: 'CNC',      x: 195, y: 80,  zoneId: 'PRODUCCIÓN' },
  { id: 'd9',  category: 'Maquinaria', subcategory: 'Producción', type: 'Robot',    x: 300, y: 80,  zoneId: 'PRODUCCIÓN' },
  { id: 'd10', category: 'Maquinaria', subcategory: 'Producción', type: 'CNC',      x: 395, y: 80,  zoneId: 'PRODUCCIÓN' },
  { id: 'd11', category: 'Maquinaria', subcategory: 'Industrial', type: 'Prensa',   x: 210, y: 285, zoneId: 'PRODUCCIÓN' },
  { id: 'd12', category: 'Maquinaria', subcategory: 'Producción', type: 'CNC',      x: 365, y: 285, zoneId: 'PRODUCCIÓN' },
  { id: 'd13', category: 'Seguridad',  subcategory: 'Cámaras',    type: 'IP',       x: 170, y: 22,  zoneId: 'PRODUCCIÓN' },
  { id: 'd14', category: 'Seguridad',  subcategory: 'Cámaras',    type: 'IP',       x: 640, y: 22,  zoneId: 'PRODUCCIÓN' },
  { id: 'd15', category: 'Seguridad',  subcategory: 'Cámaras',    type: 'PTZ',      x: 400, y: 22,  zoneId: 'PRODUCCIÓN' },
  { id: 'd16', category: 'Seguridad',  subcategory: 'EPIs',       type: 'Casco',    x: 500, y: 580, zoneId: 'PRODUCCIÓN' },
  { id: 'd17', category: 'Seguridad',  subcategory: 'EPIs',       type: 'Casco',    x: 560, y: 580, zoneId: 'PRODUCCIÓN' },
  { id: 'd18', category: 'Personas',   subcategory: 'Trabajadores',type: 'Prod.',   x: 250, y: 165, zoneId: 'PRODUCCIÓN' },
  { id: 'd19', category: 'Personas',   subcategory: 'Técnicos',   type: 'CNC',      x: 490, y: 165, zoneId: 'PRODUCCIÓN' },
  { id: 'd20', category: 'Vehículos',  subcategory: 'Carretillas',type: 'Eléct.',   x: 820, y: 455, zoneId: 'PRODUCCIÓN' },
];

interface PlacedElement { id: string; category: string; subcategory: string; type: string; x: number; y: number; zoneId: string | null; colorKey?: number; subZoneId?: string; }

function detectSubZone(zoneId: string | null, x: number, y: number): string | undefined {
  if (!zoneId) return undefined;
  const zones = TESO_SUBZONES[zoneId];
  if (!zones) return undefined;
  const found = zones.find(z => x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2);
  return found?.id;
}

// ── ELEMENT HIT AREA ─────────────────────────────────────────────────────────
function ElementHitArea({ el, isSelected, onLongPress, onTap }: {
  el: PlacedElement;
  isSelected: boolean;
  onLongPress: (el: PlacedElement) => void;
  onTap: (el: PlacedElement) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);
  const fired = useRef(false);
  const [pressing, setPressing] = useState(false);
  const HIT = 48;

  const clear = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: el.x - HIT / 2,
        top: el.y - HIT / 2,
        width: HIT,
        height: HIT,
        pointerEvents: 'auto',
        zIndex: 30,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        startPos.current = { x: e.clientX, y: e.clientY };
        moved.current = false;
        fired.current = false;
        setPressing(true);
        timerRef.current = setTimeout(() => {
          if (!moved.current) {
            fired.current = true;
            setPressing(false);
            onLongPress(el);
            if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 60]);
          }
        }, 1000);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          moved.current = true;
          clear();
          setPressing(false);
        }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        clear();
        setPressing(false);
        if (!moved.current && !fired.current) onTap(el);
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        clear();
        setPressing(false);
      }}
    >
      {pressing && (
        <div style={{
          position: 'absolute',
          inset: -6,
          border: '2.5px solid #ef4444',
          borderRadius: 4,
          backgroundColor: 'rgba(239,68,68,0.10)',
          boxShadow: '0 0 10px rgba(239,68,68,0.5)',
          pointerEvents: 'none',
          animation: 'tesoRedPulse 0.6s ease-in-out infinite alternate',
        }} />
      )}
    </div>
  );
}

// ── FICHA PANEL ──────────────────────────────────────────────────────────────
function FichaPanel({ el, onClose }: { el: PlacedElement; onClose: () => void }) {
  const fichaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fichaRef.current) fichaRef.current.scrollTop = 0;
  }, []);
  const data: Record<string, string> = {
    id: el.id,
    type: el.type,
    location: el.subZoneId ?? el.zoneId,
    client: 'Empresa Demo S.L.',
    installDate: '2024-01-15',
    lastRev: '2025-01-10',
    nextRev: '2026-01-10',
    state: 'Operativo',
    responsible: 'Juan Pérez',
    serial: `SN-${el.id.slice(-4).toUpperCase()}`,
    capacity: '6 kg',
    pressure: '15 bar',
    notes: `${el.category} · ${el.subcategory}`,
  };
  const fields = [
    { id: 'id', label: 'Código' }, { id: 'type', label: 'Tipo' }, { id: 'location', label: 'Ubicación' },
    { id: 'client', label: 'Empresa / Cliente' }, { id: 'installDate', label: 'Fecha Instalación' },
    { id: 'lastRev', label: 'Última Revisión' }, { id: 'nextRev', label: 'Próxima Revisión' },
    { id: 'state', label: 'Estado' }, { id: 'responsible', label: 'Responsable' },
    { id: 'serial', label: 'Número de Serie' }, { id: 'capacity', label: 'Capacidad' },
    { id: 'pressure', label: 'Presión' }, { id: 'notes', label: 'Observaciones' },
  ];
  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className="absolute inset-0 z-50 bg-neutral-950/95 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-white/10 flex-shrink-0">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-black text-[#D4AF37] flex-1 tracking-tight">FICHA TÉCNICA</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>
      <div ref={fichaRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-4 no-scrollbar">
        <div className="flex flex-col gap-2">
          {fields.map(f => (
            <div key={f.id} className="p-3 rounded-lg border bg-white/5 border-white/10">
              <label className="text-[10px] uppercase font-bold tracking-wider mb-1 block text-white/50">{f.label}</label>
              <div className="text-white font-bold min-h-[24px]">{data[f.id] || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── PRESSING SQUARE ──────────────────────────────────────────────────────────
function PressingSquare({ pressingElement, zoneContainerRef, zoneStateRef }: {
  pressingElement: PlacedElement | null;
  zoneContainerRef: React.RefObject<HTMLDivElement | null>;
  zoneStateRef: React.RefObject<() => { positionX: number; positionY: number; scale: number }>;
}) {
  if (!pressingElement) return null;
  const container = zoneContainerRef.current;
  if (!container) return null;
  const st = zoneStateRef.current();
  const s = st.scale;
  const elScreenX = pressingElement.x * (container.offsetWidth / 900) * s + st.positionX;
  const elScreenY = pressingElement.y * (container.offsetHeight / 700) * s + st.positionY;
  const half = Math.max(20, 24 * s);
  return (
    <div style={{
      position: 'absolute',
      left: elScreenX - half,
      top: elScreenY - half,
      width: half * 2,
      height: half * 2,
      border: '2.5px solid #ef4444',
      borderRadius: 5,
      backgroundColor: 'rgba(239,68,68,0.12)',
      boxShadow: '0 0 12px rgba(239,68,68,0.6)',
      pointerEvents: 'none',
      zIndex: 40,
      animation: 'tesoRedPulse 0.5s ease-in-out infinite alternate',
    }} />
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PlanoEmpresaPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: PlanoEmpresaPageProps) {
  const { isHostingVisible, setIsHostingVisible } = useSettings();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>(() => {
    try {
      const saved = localStorage.getItem('teso_placedElements');
      if (saved) {
        const parsed = JSON.parse(saved) as PlacedElement[];
        const hasAlmacen = parsed.some(el => el.zoneId === 'ALMACÉN');
        if (!hasAlmacen) {
          const merged = [...DEMO_ALMACEN, ...parsed];
          try { localStorage.setItem('teso_placedElements', JSON.stringify(merged)); } catch { /* ignore */ }
          return merged;
        }
        return parsed;
      }
    } catch { /* ignore */ }
    return [...DEMO_ALMACEN, ...DEMO_PRODUCCION, ...DEMO_OFICINAS];
  });
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>('trackpad');
  const [hostingSize, setHostingSize] = useState(() => Number(localStorage.getItem('teso_hostingSize')) || 7);
  const [fontSizeLevel, setFontSizeLevel] = useState(() => Number(localStorage.getItem('teso_fontSizeLevel')) || 1);
  const [iconSizeLevel, setIconSizeLevel] = useState(() => Number(localStorage.getItem('teso_iconSizeLevel')) || 5);
  const [hostingScrollSpeed, setHostingScrollSpeed] = useState(() => Number(localStorage.getItem('teso_hostingScrollSpeed')) || 5);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [fichaElement, setFichaElement] = useState<PlacedElement | null>(null);
  const [pressingElement, setPressingElement] = useState<PlacedElement | null>(null);

  useEffect(() => {
    try { localStorage.setItem('teso_placedElements', JSON.stringify(placedElements)); } catch { /* ignore */ }
  }, [placedElements]);

  const handleAddElement = useCallback((category: string, subcategory: string, type: string, colorKey: number = 5) => {
    let x = 450, y = 350;
    if (zoneContainerRef.current) {
      const { positionX, positionY, scale } = zoneStateRef.current();
      const rect = zoneContainerRef.current.getBoundingClientRect();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x = Math.max(20, Math.min(880, (cx - rect.left - positionX) / scale));
      y = Math.max(20, Math.min(680, (cy - rect.top - positionY) / scale));
    }
    const subZoneId = detectSubZone(selectedZone, x, y);
    const newEl: PlacedElement = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category, subcategory, type, x, y,
      zoneId: selectedZone,
      colorKey,
      subZoneId,
    };
    setPlacedElements(prev => {
      const next = [...prev, newEl];
      try { localStorage.setItem('teso_placedElements', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [selectedZone]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) { if (window.navigator.vibrate) window.navigator.vibrate(30); return; }
    setPlacedElements(prev => {
      const next = prev.filter(el => el.id !== selectedElementId);
      try { localStorage.setItem('teso_placedElements', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setSelectedElementId(null);
    setFichaElement(null);
    if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 80]);
  }, [selectedElementId]);

  const handleElementLongPress = useCallback((el: PlacedElement) => {
    setSelectedElementId(prev => prev === el.id ? null : el.id);
  }, []);

  const handleElementTap = useCallback((el: PlacedElement) => {
    setFichaElement(el);
  }, []);

  // ── Listener nativo de captura para long-press sobre elementos en zona ───────
  const zoneLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zonePressMovedRef = useRef(false);
  const zonePressStartRef = useRef({ x: 0, y: 0 });
  const zonePressElRef = useRef<PlacedElement | null>(null);
  const zonePressPointerId = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedZone) return;
    const container = zoneContainerRef.current;
    if (!container) return;

    const clearTimer = () => {
      if (zoneLongPressTimerRef.current) { clearTimeout(zoneLongPressTimerRef.current); zoneLongPressTimerRef.current = null; }
    };

    const onDown = (e: PointerEvent) => {
      const st = zoneStateRef.current();
      const rect = container.getBoundingClientRect();
      const scaleX = 900 / container.offsetWidth;
      const scaleY = 700 / container.offsetHeight;
      const svgX = ((e.clientX - rect.left) - st.positionX) / st.scale * scaleX;
      const svgY = ((e.clientY - rect.top) - st.positionY) / st.scale * scaleY;
      const HIT = 32;
      const hit = placedElements.filter(el => el.zoneId === selectedZone)
        .find(el => Math.abs(el.x - svgX) < HIT && Math.abs(el.y - svgY) < HIT);
      if (!hit) return;
      e.stopPropagation();
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      zonePressPointerId.current = e.pointerId;
      zonePressMovedRef.current = false;
      zonePressStartRef.current = { x: e.clientX, y: e.clientY };
      zonePressElRef.current = hit;
      setPressingElement(hit);
      zoneLongPressTimerRef.current = setTimeout(() => {
        if (!zonePressMovedRef.current && zonePressElRef.current) {
          setPressingElement(null);
          setSelectedElementId(prev => prev === zonePressElRef.current!.id ? null : zonePressElRef.current!.id);
          if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 60]);
        }
      }, 1000);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== zonePressPointerId.current) return;
      const dx = e.clientX - zonePressStartRef.current.x;
      const dy = e.clientY - zonePressStartRef.current.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        zonePressMovedRef.current = true;
        clearTimer();
        setPressingElement(null);
        try { container.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        zonePressPointerId.current = null;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== zonePressPointerId.current) return;
      clearTimer();
      const el = zonePressElRef.current;
      setPressingElement(null);
      zonePressPointerId.current = null;
      if (!zonePressMovedRef.current && el) setFichaElement(el);
    };

    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== zonePressPointerId.current) return;
      clearTimer();
      setPressingElement(null);
      zonePressPointerId.current = null;
    };

    container.addEventListener('pointerdown', onDown, { capture: true });
    container.addEventListener('pointermove', onMove, { capture: false });
    container.addEventListener('pointerup', onUp, { capture: false });
    container.addEventListener('pointercancel', onCancel, { capture: false });
    return () => {
      container.removeEventListener('pointerdown', onDown, { capture: true });
      container.removeEventListener('pointermove', onMove, { capture: false });
      container.removeEventListener('pointerup', onUp, { capture: false });
      container.removeEventListener('pointercancel', onCancel, { capture: false });
      clearTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, placedElements]);

  const mapPanRef = useRef<(dx: number, dy: number) => void>(() => {});
  const zonePanRef = useRef<(dx: number, dy: number) => void>(() => {});
  const mapClampRef = useRef<() => void>(() => {});
  const zoneClampRef = useRef<() => void>(() => {});

  const mapStateRef = useRef<() => { positionX: number; positionY: number; scale: number }>(() => ({ positionX: 0, positionY: 0, scale: 1 }));
  const zoneStateRef = useRef<() => { positionX: number; positionY: number; scale: number }>(() => ({ positionX: 0, positionY: 0, scale: 1 }));
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const zoneContainerRef = useRef<HTMLDivElement | null>(null);
  const mapZoomRef = useRef<(delta: number) => void>(() => {});
  const zoneZoomRef = useRef<(delta: number) => void>(() => {});

  useEffect(() => { localStorage.setItem('teso_hostingSize', hostingSize.toString()); }, [hostingSize]);
  useEffect(() => { localStorage.setItem('teso_fontSizeLevel', fontSizeLevel.toString()); }, [fontSizeLevel]);
  useEffect(() => { localStorage.setItem('teso_iconSizeLevel', iconSizeLevel.toString()); }, [iconSizeLevel]);
  useEffect(() => { localStorage.setItem('teso_hostingScrollSpeed', hostingScrollSpeed.toString()); }, [hostingScrollSpeed]);

  const zones = [
    { id: 'acceso', label: 'ACCESO', x: 50, y: 500, w: 100, h: 60, color: 'bg-blue-500/20' },
    { id: 'oficinas', label: 'OFICINAS', x: 50, y: 300, w: 200, h: 180, color: 'bg-indigo-500/20' },
    { id: 'produccion', label: 'PRODUCCIÓN', x: 270, y: 100, w: 400, h: 300, color: 'bg-red-500/20' },
    { id: 'almacen', label: 'ALMACÉN', x: 270, y: 420, w: 250, h: 140, color: 'bg-amber-500/20' },
    { id: 'carga', label: 'CARGA', x: 540, y: 420, w: 130, h: 140, color: 'bg-orange-500/20' },
    { id: 'exterior', label: 'EXTERIOR', x: 0, y: 0, w: 800, h: 600, color: 'bg-emerald-500/5', isBackground: true },
    { id: 'comunes', label: 'ZONAS COMUNES', x: 50, y: 100, w: 200, h: 180, color: 'bg-teal-500/20' },
    { id: 'vestuarios', label: 'VESTUARIOS', x: 690, y: 100, w: 90, h: 150, color: 'bg-pink-500/20' },
    { id: 'tecnica', label: 'SALA TÉCNICA', x: 690, y: 270, w: 90, h: 130, color: 'bg-slate-500/20' },
  ];

  const handleSelectFromCenter = useCallback(() => {
    if (!mapContainerRef.current) return;
    const { positionX, positionY, scale } = mapStateRef.current();
    const rect = mapContainerRef.current.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const contentX = (cx - rect.left - positionX) / scale;
    const contentY = (cy - rect.top - positionY) / scale;
    const W = rect.width;
    const H = rect.height;
    for (const zone of zones) {
      if ((zone as any).isBackground) continue;
      const l = (zone.x / 800) * W;
      const t = (zone.y / 600) * H;
      const r = ((zone.x + zone.w) / 800) * W;
      const b = ((zone.y + zone.h) / 600) * H;
      if (contentX >= l && contentX <= r && contentY >= t && contentY <= b) {
        setSelectedZone(zone.label);
        if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 60]);
        return;
      }
    }
  }, [zones]);

  const getGridOptions = (): string[] => {
    switch (activeOverlay) {
      case 'filters': return ['Zona', 'Estado', 'Tipo', 'Tiempo', 'Prioridad', 'Responsable', 'Relación', 'Propiedades', 'ID'];
      case 'actions': return ['Abrir', 'Editar', 'Historial', 'Copiar', 'Mover', 'Marcar', 'Enviar', 'Exportar', 'Eliminar'];
      case 'modes': return ['Ver', 'Selección', 'Edición', 'Ordenar', 'Agrupar', 'Compacto', 'Expandido', 'MULTI VISITA', 'Resumen'];
      case 'actions_enviar': return ['WhatsApp', 'Email', 'SMS', 'Sistema', 'PDF', 'Excel', 'Imprimir', 'Nube', 'Otro'];
      case 'tools': return ['Velocidad', 'Tema', 'Tamaño', 'Densidad', 'Háptica', 'Idioma', 'Exportar', 'Nube', 'Reset'];
      case 'tools_velocidad': return ['Hosting', 'Listado', 'Selección', 'Animación', 'Arrastre', 'Scroll', 'Doble Toque', 'Gestos', 'Por Defecto'];
      case 'tools_tamano': return ['Hosting', 'Letra', 'Iconos', 'Botones', 'Margen', 'Espacio', 'Grosor', 'Sombra', 'Borde'];
      case 'tools_tamano_letra': return ['Aa', 'Texto', 'Botón', 'Teso', 'Listado', 'Ficha', 'Grande', 'Título', 'MÁXIMO'];
      case 'tools_tamano_iconos': return ['Settings', 'ArrowLeft', 'ChevronDown', 'Search', 'Check', 'Plus', 'Cloud', 'Trash', 'Menu'];
      default: return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }
  };

  const sharedHostingProps = {
    onOpenIA,
    activeOverlay,
    setActiveOverlay,
    getGridOptions,
    isHostingVisible,
    setIsHostingVisible,
    onSelectAll: () => {
      const nonBgZones = zones.filter(z => !(z as any).isBackground).map(z => z.label);
      const allSelected = nonBgZones.every(l => selectedZones.has(l));
      if (allSelected) {
        setSelectedZones(new Set());
      } else {
        setSelectedZones(new Set(nonBgZones));
      }
    },
    allSelected: zones.filter(z => !(z as any).isBackground).every(z => selectedZones.has(z.label)) && selectedZones.size > 0,
    showDynamicToggle: false,
    onUploadMap: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.svg,.pdf';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) alert(`Plano seleccionado: ${file.name}\n(Función de importación en desarrollo)`);
      };
      input.click();
    },
    onHostingSizeSelect: setHostingSize,
    onHostingSpeedSelect: setHostingScrollSpeed,
    onFontSizeSelect: setFontSizeLevel,
    onIconSizeSelect: setIconSizeLevel,
    hostingSize,
    fontSizeLevel,
    iconSizeLevel,
    hostingScrollSpeed,
    onDeleteElement: handleDeleteSelected,
    onSelectFromCenter: handleSelectFromCenter,
    onLongPressCenter: handleSelectFromCenter,
  };

  if (selectedZone) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-start relative overflow-hidden p-4 pt-5">
        {activeOverlay === 'trackpad' && isHostingVisible && <Pulsor onDoubleTap={handleSelectFromCenter} />}
        <div className="w-full max-w-5xl mb-3 flex justify-between items-center z-10">
          <button onClick={() => setSelectedZone(null)} className="text-white flex items-center gap-2">
            <ArrowLeft size={18} />
            <span className="text-sm font-black uppercase tracking-wider">Volver al Plano General</span>
          </button>
          <h1 className="text-lg font-black text-white uppercase italic tracking-tight">{selectedZone}</h1>
        </div>
        <div ref={zoneContainerRef} className={`relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${isHostingVisible ? 'mb-52' : 'scale-105'}`} style={{ height: 'calc(100vh - 200px)' }}>
          <TransformWrapper initialScale={0.8} minScale={0.3} maxScale={8} centerOnInit limitToBounds={false} onPanningStop={() => zoneClampRef.current()} onZoomStop={() => zoneClampRef.current()}>
            <>
              <MapPanController panRef={zonePanRef} clampRef={zoneClampRef} stateRef={zoneStateRef} zoomRef={zoneZoomRef} />
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div style={{ width: '900px', height: '700px', flexShrink: 0, position: 'relative' }}>
                  <ZoneFloorPlan zoneId={selectedZone} />
                  {/* Iconos incorporados en esta zona */}
                  <svg viewBox="0 0 900 700" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {placedElements.filter(el => el.zoneId === selectedZone).map(el => (
                      <PlacedElementIcon key={el.id} el={el} />
                    ))}
                    {/* Anillo de selección */}
                    {placedElements.filter(el => el.id === selectedElementId && el.zoneId === selectedZone).map(el => (
                      <g key={`sel-${el.id}`} pointerEvents="none">
                        <circle cx={el.x} cy={el.y} r={22} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth={2.5} />
                        <circle cx={el.x} cy={el.y} r={30} fill="none" stroke="#60A5FA" strokeWidth={1} opacity={0.5}>
                          <animate attributeName="r" values="28;32;28" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    ))}
                  </svg>
                  {/* Capa interactiva eliminada — eventos manejados por listener nativo */}
                </div>
              </TransformComponent>
            </>
          </TransformWrapper>
          {/* Cuadrado rojo de pressing — fuera del TransformWrapper, en coordenadas de contenedor */}
          <PressingSquare pressingElement={pressingElement} zoneContainerRef={zoneContainerRef} zoneStateRef={zoneStateRef} />
          {/* Zoom controls */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-auto">
            <div className="bg-black/60 border border-white/10 rounded-lg p-1 text-white/40 text-[8px] font-bold tracking-widest uppercase">PLANO DETALLE</div>
          </div>
          <div className="absolute top-3 right-3 flex flex-col items-center opacity-40 pointer-events-none">
            <div className="w-5 h-5 border-2 border-white rounded-full relative flex items-center justify-center">
              <div className="w-0.5 h-3 bg-red-500 absolute top-0" />
              <span className="text-[5px] font-black text-white absolute -top-3">N</span>
            </div>
          </div>
          {/* Ficha panel */}
          <AnimatePresence>
            {fichaElement && (
              <FichaPanel el={fichaElement} onClose={() => setFichaElement(null)} />
            )}
          </AnimatePresence>
        </div>
        <HostingButtons
          {...sharedHostingProps}
          onBack={() => setSelectedZone(null)}
          onPan={(dx, dy) => { const s = hostingScrollSpeed / 5; zonePanRef.current(dx * s, dy * s); }}
          onAddElement={handleAddElement}
          onZoom={(delta) => zoneZoomRef.current(delta)}
          onLongPressCenter={() => {
            const container = zoneContainerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const st = zoneStateRef.current();
            const svgW = container.offsetWidth;
            const svgH = container.offsetHeight;
            const scaleX = 900 / svgW;
            const scaleY = 700 / svgH;
            const svgX = ((cx - rect.left) - st.positionX) / st.scale * scaleX;
            const svgY = ((cy - rect.top) - st.positionY) / st.scale * scaleY;
            const HIT = 30;
            const hit = placedElements.filter(el => el.zoneId === selectedZone).find(el => Math.abs(el.x - svgX) < HIT && Math.abs(el.y - svgY) < HIT);
            if (hit) {
              handleElementLongPress(hit);
              if (window.navigator.vibrate) window.navigator.vibrate([30, 20, 60]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-start relative overflow-hidden p-4 pt-6">
      {activeOverlay === 'trackpad' && isHostingVisible && <Pulsor onDoubleTap={handleSelectFromCenter} />}

      <div className={`w-full max-w-5xl mb-4 flex justify-between items-center z-10 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">PLANO EMPRESA</h1>
          <span className="text-[10px] font-bold text-emerald-500 tracking-[0.3em] -mt-1">TESO SYSTEM / MAPS — DEMO</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <MapIcon size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">Vista General</span>
        </div>
      </div>

      <div ref={mapContainerRef} className={`relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${isHostingVisible ? 'mb-52' : 'scale-105 mb-0'}`} style={{ height: 'calc(100vh - 280px)', minHeight: '320px' }}>
        <TransformWrapper initialScale={1} minScale={0.4} maxScale={6} limitToBounds={false} onPanningStop={() => mapClampRef.current()} onZoomStop={() => mapClampRef.current()}>
          <>
            <MapPanController panRef={mapPanRef} clampRef={mapClampRef} stateRef={mapStateRef} zoomRef={mapZoomRef} />
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="absolute inset-0">
                {zones.map((zone) => (
                  <motion.div
                    key={zone.id}
                    data-zone-id={zone.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => setSelectedZone(zone.label)}
                    className={`absolute border flex items-center justify-center transition-colors cursor-pointer group ${zone.color} ${(zone as any).isBackground ? '-z-10 border-white/10' : `z-0 ${selectedZones.has(zone.label) ? 'border-[#D4AF37] border-2 shadow-[0_0_12px_rgba(212,175,55,0.5)]' : 'border-white/10'}`}`}
                    style={{
                      left: `${(zone.x / 800) * 100}%`,
                      top: `${(zone.y / 600) * 100}%`,
                      width: `${(zone.w / 800) * 100}%`,
                      height: `${(zone.h / 600) * 100}%`,
                      borderRadius: (zone as any).isBackground ? '0' : '10px',
                    }}
                  >
                    {!(zone as any).isBackground && (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[9px] sm:text-[11px] font-black tracking-tighter text-center px-1 leading-none transition-colors ${selectedZones.has(zone.label) ? 'text-[#D4AF37]' : 'text-white/80 group-hover:text-white'}`}>{zone.label}</span>
                        <div className={`w-3 h-0.5 transition-colors ${selectedZones.has(zone.label) ? 'bg-[#D4AF37]/60' : 'bg-white/20 group-hover:bg-white/60'}`} />
                      </div>
                    )}
                    {selectedZones.has(zone.label) && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <svg viewBox="0 0 10 10" fill="none" width="10" height="10"><polyline points="2,5 4,7.5 8,2.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    {zone.id === 'exterior' && (
                      <span className="absolute top-2 left-2 text-[7px] font-black text-emerald-500/40 tracking-widest uppercase">Perímetro Exterior</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </TransformComponent>
          </>
        </TransformWrapper>

        <div className={`absolute bottom-3 left-3 bg-black/70 backdrop-blur border border-white/10 p-2.5 rounded-xl flex items-start gap-2 max-w-[180px] transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Info className="text-blue-400 shrink-0 mt-0.5" size={12} />
          <p className="text-[7px] text-white/50 leading-relaxed">Pulsa una zona para ver su plano detallado. Navega con el joystick o con gestos.</p>
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-center opacity-40 pointer-events-none">
          <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center relative">
            <div className="w-0.5 h-3 bg-red-500 absolute top-0" />
            <span className="text-[6px] font-black text-white absolute -top-3">N</span>
          </div>
        </div>
      </div>

      <HostingButtons {...sharedHostingProps} onBack={onBack} onPan={(dx, dy) => { const s = hostingScrollSpeed / 5; mapPanRef.current(dx * s, dy * s); }} onAddElement={handleAddElement} onZoom={(delta) => mapZoomRef.current(delta)} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-500/5 rounded-full blur-[150px] -z-20" />
    </div>
  );
}
