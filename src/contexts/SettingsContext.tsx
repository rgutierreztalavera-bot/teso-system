import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayerSettings {
  fontSize?: number;
  iconSize?: number;
  showIcons?: boolean;
  showText?: boolean;
}

interface SettingsContextType {
  fontSize: number;
  iconSize: number;
  showIcons: boolean;
  showText: boolean;
  motherHostingFontSize: number;
  motherHostingIconSize: number;
  motherHostingShowIcons: boolean;
  motherHostingShowText: boolean;
  setMotherHostingFontSize: (size: number | ((prev: number) => number)) => void;
  setMotherHostingIconSize: (size: number | ((prev: number) => number)) => void;
  setMotherHostingShowIcons: (show: boolean | ((prev: boolean) => boolean)) => void;
  setMotherHostingShowText: (show: boolean | ((prev: boolean) => boolean)) => void;
  configMode: 'none' | 'text' | 'icons' | 'menu';
  isHostingVisible: boolean;
  layerSettings: Record<string, LayerSettings>;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  setIconSize: (size: number | ((prev: number) => number)) => void;
  setShowIcons: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowText: (show: boolean | ((prev: boolean) => boolean)) => void;
  setConfigMode: (mode: 'none' | 'text' | 'icons' | 'menu') => void;
  setIsHostingVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setLayerSetting: (layerId: string, setting: keyof LayerSettings, value: any) => void;
  resetLayerSettings: (layerId: string) => void;
  getLayerSettings: (layerId: string) => LayerSettings;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Load initial values from localStorage or use defaults
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('teso_fontSize_v2');
    return saved ? parseInt(saved, 10) : 10;
  });
  
  const [iconSize, setIconSize] = useState(() => {
    const saved = localStorage.getItem('teso_iconSize_v2');
    return saved ? parseInt(saved, 10) : 55;
  });
  
  const [showIcons, setShowIcons] = useState(() => {
    const saved = localStorage.getItem('teso_showIcons_v2');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [showText, setShowText] = useState(() => {
    const saved = localStorage.getItem('teso_showText_v2');
    return saved !== null ? saved === 'true' : true;
  });

  const [motherHostingFontSize, setMotherHostingFontSize] = useState(() => {
    const saved = localStorage.getItem('teso_motherHostingFontSize');
    return saved ? parseInt(saved, 10) : 10;
  });
  
  const [motherHostingIconSize, setMotherHostingIconSize] = useState(() => {
    const saved = localStorage.getItem('teso_motherHostingIconSize');
    return saved ? parseInt(saved, 10) : 55;
  });
  
  const [motherHostingShowIcons, setMotherHostingShowIcons] = useState(() => {
    const saved = localStorage.getItem('teso_motherHostingShowIcons');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [motherHostingShowText, setMotherHostingShowText] = useState(() => {
    const saved = localStorage.getItem('teso_motherHostingShowText');
    return saved !== null ? saved === 'true' : true;
  });

  const [configMode, setConfigMode] = useState<'none' | 'text' | 'icons' | 'menu'>('none');
  const [isHostingVisible, setIsHostingVisible] = useState(true);

  const [layerSettings, setLayerSettings] = useState<Record<string, LayerSettings>>(() => {
    const saved = localStorage.getItem('teso_layerSettings_v2');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('teso_fontSize_v2', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('teso_iconSize_v2', iconSize.toString());
  }, [iconSize]);

  useEffect(() => {
    localStorage.setItem('teso_showIcons_v2', showIcons.toString());
  }, [showIcons]);

  useEffect(() => {
    localStorage.setItem('teso_showText_v2', showText.toString());
  }, [showText]);

  useEffect(() => {
    localStorage.setItem('teso_motherHostingFontSize', motherHostingFontSize.toString());
  }, [motherHostingFontSize]);

  useEffect(() => {
    localStorage.setItem('teso_motherHostingIconSize', motherHostingIconSize.toString());
  }, [motherHostingIconSize]);

  useEffect(() => {
    localStorage.setItem('teso_motherHostingShowIcons', motherHostingShowIcons.toString());
  }, [motherHostingShowIcons]);

  useEffect(() => {
    localStorage.setItem('teso_motherHostingShowText', motherHostingShowText.toString());
  }, [motherHostingShowText]);

  useEffect(() => {
    localStorage.setItem('teso_layerSettings_v2', JSON.stringify(layerSettings));
  }, [layerSettings]);

  const setLayerSetting = (layerId: string, setting: keyof LayerSettings, value: any) => {
    setLayerSettings(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        [setting]: value
      }
    }));
  };

  const resetLayerSettings = (layerId: string) => {
    setLayerSettings(prev => {
      const next = { ...prev };
      delete next[layerId];
      return next;
    });
  };

  const getLayerSettings = (layerId: string) => {
    return layerSettings[layerId] || {};
  };

  return (
    <SettingsContext.Provider value={{
      motherHostingFontSize,
      motherHostingIconSize,
      motherHostingShowIcons,
      motherHostingShowText,
      setMotherHostingFontSize,
      setMotherHostingIconSize,
      setMotherHostingShowIcons,
      setMotherHostingShowText,
      fontSize,
      iconSize,
      showIcons,
      showText,
      configMode,
      isHostingVisible,
      layerSettings,
      setFontSize,
      setIconSize,
      setShowIcons,
      setShowText,
      setConfigMode,
      setIsHostingVisible,
      setLayerSetting,
      resetLayerSettings,
      getLayerSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
