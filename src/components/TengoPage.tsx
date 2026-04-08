import React, { useState } from 'react';
import { motion } from 'motion/react';
import TesoButton from './TesoButton';
import TesoHosting from './TesoHosting';
import { TESO_COLORS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { TESO_DEMO } from '../data/tesoDemo';

interface TengoPageProps {
  onBack: () => void;
  onGoLanding: () => void;
  onOpenIA?: () => void;
  onOpenConfiguracion?: () => void;
}

export default function TengoPage({ onBack, onGoLanding, onOpenIA, onOpenConfiguracion }: TengoPageProps) {
  const { getLayerSettings, fontSize: globalFontSize, iconSize: globalIconSize, isHostingVisible } = useSettings();
  const [currentLayer, setCurrentLayer] = useState<string[]>([]);
  const [feedbackType, setFeedbackType] = useState<'none' | 'forward' | 'back' | 'confirm'>('none');
  
  const triggerFeedback = (type: 'forward' | 'back' | 'confirm') => {
    setFeedbackType(type);
    setTimeout(() => setFeedbackType('none'), 300);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(type === 'forward' ? 10 : type === 'back' ? 5 : 15);
    }
  };

  const layerId = 'tengo';
  const layerSettings = getLayerSettings(layerId);
  const currentFontSize = layerSettings.fontSize ?? globalFontSize;
  const currentIconSize = layerSettings.iconSize ?? globalIconSize;

  const getPathInfo = () => {
    const info: { title: string; path: string[] }[] = [{ title: 'TENGO', path: [] }];
    let current: any = TESO_DEMO;
    let path: string[] = [];
    for (const key of currentLayer) {
      path = [...path, key];
      const item = current[key];
      if (item) {
        info.push({ title: item.title || item, path: [...path] });
        current = item.children || item;
      }
    }
    return info.slice(0, 6);
  };

  const getCurrentData = () => {
    let current: any = TESO_DEMO;
    for (const key of currentLayer) {
      current = current.children ? current.children[key] : current[key];
    }
    return current;
  };

  const currentData = getCurrentData();
  const buttons = currentData.children
    ? Object.entries(currentData.children).map(([key, value]: [string, any]) => ({
        id: key,
        label: value.title || value,
        hasChildren: !!value.children,
      }))
    : Object.entries(currentData).map(([key, value]: [string, any]) => ({
        id: key,
        label: value.title || value,
        hasChildren: !!value.children,
      }));

  const handleButtonClick = (id: string) => {
    const clickedItem = buttons.find((b) => b.id === id);
    if (clickedItem?.hasChildren) {
      triggerFeedback('forward');
      setCurrentLayer([...currentLayer, id]);
    }
  };

  const handleBack = () => {
    if (currentLayer.length > 0) {
      triggerFeedback('back');
      setCurrentLayer(currentLayer.slice(0, -1));
    } else {
      onBack();
    }
  };

  const handleNavigate = (path: string[]) => {
    triggerFeedback('confirm');
    setCurrentLayer(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050A15] text-white font-sans flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <motion.div
        className={`w-full max-w-md flex flex-col ${isHostingVisible ? 'gap-4 sm:gap-6 my-auto' : 'gap-8 h-full justify-center'} shrink-0 py-6 transition-all duration-500`}
        animate={
          feedbackType === 'forward'
            ? { scale: [1, 1.02, 1], x: [0, 2, 0] }
            : feedbackType === 'back'
            ? { scale: [1, 0.98, 1], x: [0, -2, 0] }
            : feedbackType === 'confirm'
            ? { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }
            : {}
        }
        transition={{ duration: 0.2 }}
      >
        <header className={`flex justify-between items-center pt-2 transition-all duration-500 ${isHostingVisible ? 'opacity-100' : 'opacity-40 scale-90'}`}>
          <p className="text-2xl font-black tracking-tight">TESO</p>
          <div className="flex flex-col items-end">
            <p className="text-2xl font-black tracking-tight text-white uppercase">TENGO</p>
            <motion.div className="flex flex-wrap gap-1 items-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              {getPathInfo().map((item, index) => {
                const isLast = index === getPathInfo().length - 1;
                return (
                  <React.Fragment key={index}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigate(item.path)}
                      className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
                        isLast ? 'bg-yellow-500 text-black' : 'bg-white text-black hover:bg-gray-200'
                      }`}
                    >
                      {item.title}
                    </motion.button>
                    {!isLast && <span className="text-white/50 font-bold">&gt;</span>}
                  </React.Fragment>
                );
              })}
            </motion.div>
          </div>
        </header>

        <main className={`grid grid-cols-3 gap-3 sm:gap-4 transition-all duration-500 ${isHostingVisible ? '' : 'scale-110'}`}>
          {buttons.map((btn, index) => (
            <TesoButton
              key={btn.id}
              id={index + 1}
              label={btn.label}
              icon={null}
              color={TESO_COLORS[(index + 1) as keyof typeof TESO_COLORS]}
              fontSize={currentFontSize}
              iconSize={currentIconSize}
              onClick={() => handleButtonClick(btn.id)}
              centerContent={true}
            />
          ))}
        </main>

        <TesoHosting
          layerId={layerId}
          onBack={handleBack}
          onGoLanding={onGoLanding}
          onOpenIA={onOpenIA}
          onOpenConfiguracion={onOpenConfiguracion}
          breadcrumbItems={getPathInfo()}
          onNavigate={handleNavigate}
        >
          {buttons.map((btn, index) => (
            <motion.button
              key={`${btn.id}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleButtonClick(btn.id)}
              className={`${TESO_COLORS[(index + 1) as keyof typeof TESO_COLORS]} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-black border border-white/5 shadow-sm`}
            >
              <span style={{ fontSize: '16px' }}>{index + 1}</span>
            </motion.button>
          ))}
        </TesoHosting>
      </motion.div>
    </div>
  );
}
