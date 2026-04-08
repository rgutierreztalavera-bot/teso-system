import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion } from 'motion/react';
import { ArrowLeft, Map as MapIcon, Globe as GlobeIcon } from 'lucide-react';
import TesoHosting from './TesoHosting';

interface DonarPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA: () => void;
  onOpenConfiguracion?: () => void;
}

import { useSettings } from '../contexts/SettingsContext';

export default function DonarPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: DonarPageProps) {
  const { isHostingVisible } = useSettings();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -30, 0]);
  const [worldData, setWorldData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data && data.objects && data.objects.countries) {
          setWorldData(feature(data as any, data.objects.countries));
        } else {
          throw new Error('Invalid topojson data structure');
        }
      })
      .catch(err => {
        console.error('Error loading world data:', err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    try {
      const width = 800;
      const height = 600;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const projection = isExpanded
        ? d3.geoEquirectangular().scale(width / (2 * Math.PI)).translate([width / 2, height / 2])
        : d3.geoOrthographic().scale(280).translate([width / 2, height / 2]).rotate(rotation);

      const path = d3.geoPath().projection(projection);

      // Background circle for the globe
      if (!isExpanded) {
        svg.append('circle')
          .attr('cx', width / 2)
          .attr('cy', height / 2)
          .attr('r', 280)
          .attr('fill', '#1a365d') // Deep ocean blue
          .attr('stroke', '#2c5282')
          .attr('stroke-width', 2);
        
        // Add a gradient for realism
        const gradient = svg.append('defs')
          .append('radialGradient')
          .attr('id', 'globe-gradient')
          .attr('cx', '35%')
          .attr('cy', '35%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#4299e1');
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#1a365d');
        
        svg.select('circle').attr('fill', 'url(#globe-gradient)');
      }

      // Draw countries
      svg.append('g')
        .selectAll('path')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', '#48bb78') // Lush green
        .attr('stroke', '#2f855a')
        .attr('stroke-width', 0.5)
        .attr('class', 'country')
        .on('mouseover', function() {
          d3.select(this).attr('fill', '#38a169');
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill', '#48bb78');
        });

      // Add graticule (lines of latitude and longitude)
      const graticule = d3.geoGraticule();
      svg.append('path')
        .datum(graticule())
        .attr('d', path as any)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-width', 0.5);

      // Drag behavior for rotation
      const drag = d3.drag<SVGSVGElement, unknown>()
        .on('drag', (event) => {
          const rotate = projection.rotate();
          // Increased sensitivity (2880 instead of 1440) for "double speed" and finer control
          const k = 2880 / projection.scale();
          setRotation([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k,
            rotate[2]
          ]);
        });
      svg.call(drag as any);
    } catch (err: any) {
      console.error('Error rendering globe:', err);
      setError(err.message);
    }
  }, [worldData, isExpanded, rotation]);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header */}
      <div className={`absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-bold backdrop-blur-md hover:bg-white/20 transition-all"
          >
            {isExpanded ? <GlobeIcon size={18} /> : <MapIcon size={18} />}
            <span>{isExpanded ? 'Ver Globo' : 'Expandir Mapa'}</span>
          </button>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">TESO DONAR</h1>
        <div className="w-[100px]"></div>
      </div>

      {/* Main Content */}
      <div className={`relative w-full max-w-4xl aspect-[4/3] min-h-[300px] flex items-center justify-center transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 z-50">
            Error loading map: {error}
          </div>
        )}
        {!worldData && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 z-50">
            Cargando globo...
          </div>
        )}
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 600"
          className="w-full h-full cursor-move drop-shadow-2xl z-30 relative"
        />
        
        {/* Glow effect for the globe */}
        {!isExpanded && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]"></div>
          </div>
        )}

        {/* Pulsor Giratorio (Spinning Indicator) - Centered on Globe/Map */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
          <div className="w-24 h-24 rounded-full border-[2.5px] border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.3),inset_0_0_20px_rgba(255,215,0,0.2)] flex items-center justify-center bg-transparent relative">
            <div className="absolute inset-[-10px] rounded-full border-[2px] border-dashed border-[#FFD700]/30 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-[8px] rounded-full border-[2px] border-[#FFD700]/30 animate-[spin_5s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
            <div className="w-3 h-3 rounded-full bg-[#FFD700]/60 shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
          </div>
        </div>
      </div>

      {/* Teso Hosting (Bottom Right) */}
      <TesoHosting 
        layerId="donar"
        onBack={onBack}
        onGoLanding={onGoLanding}
        onOpenIA={onOpenIA}
        onOpenConfiguracion={onOpenConfiguracion}
        className="fixed bottom-5 right-5 z-50"
      />

      {/* Instructions */}
      <div className={`absolute bottom-10 left-10 text-white/30 text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-0'}`}>
        {isExpanded ? 'Mapa Expandido' : 'Globo Interactivo'}
      </div>
    </div>
  );
}
