import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SettingsProvider } from './contexts/SettingsContext';
import LandingPage from './components/LandingPage';
import EmpresasPage from './components/EmpresasPage';
import HomeScreen from './components/HomeScreen';
import PRLPage from './components/PRLPage';
import ExtintoresPage from './components/ExtintoresPage';
import LocalizarExtintorPage from './components/LocalizarExtintorPage';
import UltimosUsadosPage from './components/UltimosUsadosPage';
import RegistrarEstadoExtintorPage from './components/RegistrarEstadoExtintorPage';
import CentroPage from './components/CentroPage';
import Centros2Page from './components/Centros2Page';
import ZonasPage from './components/ZonasPage';
import Zonas2Page from './components/Zonas2Page';
import ListadoExtintoresPage from './components/ListadoExtintoresPage';
import UsuariosRolesPage from './components/UsuariosRolesPage';
import IndustryPage from './components/IndustryPage';
import ConfiguracionCapaPage from './components/ConfiguracionCapaPage';
import AjustesLandingPage from './components/AjustesLandingPage';
import IAModal from './components/IAModal';

import DonarPage from './components/DonarPage';
import PlanoEmpresaPage from './components/PlanoEmpresaPage';
import TengoPage from './components/TengoPage';
import QuieroPage from './components/QuieroPage';
import CompartirPage from './components/CompartirPage';
import DatosPage from './components/DatosPage';
import ListadosPage from './components/ListadosPage';
import ListadoZonaPage from './components/ListadoZonaPage';
import ListadoElementosPage from './components/ListadoElementosPage';

import { ConstructorProvider, useConstructor } from './contexts/ConstructorContext';
import { LayerProvider, useLayerId } from './contexts/LayerContext';

function ConstructorManager({ children }: { children: React.ReactNode }) {
  const { openConstructor } = useConstructor();
  const layerId = useLayerId();

  // Expose the command globally
  (window as any).abrir_constructor_actual = () => {
    const context = {
      pantalla: layerId,
      capa: 'principal',
      zona: 'hosting_inferior_derecha',
      elementos_visibles: ['boton_ia', 'boton_atras', 'panel_constructor'],
      modo: 'constructor'
    };
    openConstructor(context);
    console.log('Constructor abierto:', context);
  };

  (window as any).duplicar_elemento = (elementId: string) => {
    const element = document.getElementById(`teso-button-${elementId}`);
    if (!element) {
      console.error(`Elemento teso-button-${elementId} no encontrado`);
      return;
    }
    const clone = element.cloneNode(true) as HTMLElement;
    clone.id = `teso-button-${elementId}_clone_${Date.now()}`;
    clone.style.marginLeft = '10px';
    element.parentNode?.insertBefore(clone, element);
    console.log(`Elemento teso-button-${elementId} duplicado`);
  };

  return <>{children}</>;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'home' | 'prl' | 'empresas' | 'extintores' | 'localizarExtintor' | 'ultimosUsados' | 'registrarEstado' | 'centros1' | 'centros2' | 'zonas' | 'zonas2' | 'listadoExtintores' | 'usuariosRoles' | 'industry' | 'configuracionCapa' | 'ajustesLanding' | 'donar' | 'planoEmpresa' | 'tengo' | 'quiero' | 'compartir' | 'datos' | 'listados' | 'listadoZona' | 'listadoElementos'>('landing');
  const [previousView, setPreviousView] = useState<typeof view>('landing');
  const [selectedCentroId, setSelectedCentroId] = useState<number | null>(null);
  const [selectedExtintorId, setSelectedExtintorId] = useState<number | null>(null);
  const [selectedZonaName, setSelectedZonaName] = useState<string | null>(null);
  const [selectedDatosZoneId, setSelectedDatosZoneId] = useState<string>('ALMACÉN');
  const [selectedDatosSubZoneId, setSelectedDatosSubZoneId] = useState<string | null>(null);
  const [centroNames, setCentroNames] = useState<Record<number, string>>({});
  const [isIAOpen, setIsIAOpen] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  const handleIACommand = (command: string) => {
    setDebugMessage("INTERPRETAR OK");
    setTimeout(() => setDebugMessage(null), 2000);

    if (command === 'abrir_constructor_actual') {
        (window as any).abrir_constructor_actual();
        return;
    }
    
    const lower = command.toLowerCase();
    
    if (lower.includes('duplicar')) {
        // Mapeo simple de nombres de elementos a IDs
        if (lower.includes('ia')) {
            (window as any).duplicar_elemento('teso-button-ia');
        } else if (lower.includes('atrás') || lower.includes('atras')) {
            (window as any).duplicar_elemento('teso-button-atras');
        } else if (lower.includes('sistema')) {
            (window as any).duplicar_elemento('teso-button-1');
        } else if (lower.includes('mensajes')) {
            (window as any).duplicar_elemento('teso-button-2');
        } else if (lower.includes('productos')) {
            (window as any).duplicar_elemento('teso-button-3');
        } else if (lower.includes('clientes')) {
            (window as any).duplicar_elemento('teso-button-4');
        } else if (lower.includes('proveedores')) {
            (window as any).duplicar_elemento('teso-button-5');
        } else if (lower.includes('documentos')) {
            (window as any).duplicar_elemento('teso-button-6');
        } else if (lower.includes('compras')) {
            (window as any).duplicar_elemento('teso-button-7');
        } else if (lower.includes('ventas')) {
            (window as any).duplicar_elemento('teso-button-8');
        } else if (lower.includes('datos')) {
            (window as any).duplicar_elemento('teso-button-9');
        }
        return;
    }

    // Direct view names from Gemini function calls
    const validViews = ['landing', 'home', 'prl', 'empresas', 'extintores', 'industry', 'usuariosRoles'];
    const matchedView = validViews.find(v => v.toLowerCase() === lower);
    if (matchedView) {
      setView(matchedView as any);
      return;
    }

    if (lower.includes('prl')) setView('prl');
    else if (lower.includes('extintor')) setView('extintores');
    else if (lower.includes('empresa')) setView('empresas');
    else if (lower.includes('centro') && !lower.includes('2')) setView('centros1');
    else if (lower.includes('centro') && lower.includes('2')) setView('centros2');
    else if (lower.includes('zona')) setView('zonas');
    else if (lower.includes('usuario') || lower.includes('rol')) setView('usuariosRoles');
    else if (lower.includes('industry') || lower.includes('produccion') || lower.includes('industria')) setView('industry');
    else if (lower.includes('system')) setView('home');
    else if (lower.includes('inicio') || lower.includes('home') || lower.includes('principal') || lower.includes('landing') || lower.includes('salir')) setView('landing');
    // Si no reconoce el comando exacto, no hace ninguna acción para evitar errores.
  };

  const renderView = () => {
    if (view === 'landing') {
      return (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="landing">
            <ConstructorManager>
              <LandingPage 
                onAction={(id) => {
                  switch(id) {
                    case 1: setView('tengo'); break;
                    case 2: setView('quiero'); break;
                    case 3: setView('donar'); break;
                    case 4: setView('empresas'); break;
                    case 6: setView('compartir'); break;
                    case 99: setView('ajustesLanding'); break;
                    default:
                      console.log(`Button ${id} clicked - Pending implementation`);
                  }
                }} 
                onOpenIA={() => setIsIAOpen(true)}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'home') {
      return (
        <motion.div
          key="home"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="home">
            <ConstructorManager>
              <HomeScreen 
                onSelectPRL={() => setView('prl')} 
                onSelectEmpresas={() => setView('empresas')}
                onSelectUsuariosRoles={() => setView('usuariosRoles')}
                onSelectIndustry={() => setView('industry')}
                onSelectMaps={() => setView('planoEmpresa')}
                onBack={() => setView('empresas')} 
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView(view);
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'empresas') {
      return (
        <motion.div
          key="empresas"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="empresas">
            <ConstructorManager>
              <EmpresasPage 
                onBack={() => setView('landing')} 
                onGoLanding={() => setView('landing')}
                onGoHome={() => setView('home')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView(view);
                  setView('configuracionCapa');
                }}
                onVoiceCommand={handleIACommand}
                onOpenDatos={() => setView('datos')}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'prl') {
      return (
        <motion.div
          key="prl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="prl">
            <ConstructorManager>
              <PRLPage 
                onBack={() => setView('home')} 
                onGoLanding={() => setView('landing')}
                onSelectCentros={() => setView('centros1')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView(view);
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'extintores') {
      return (
        <motion.div
          key="extintores"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="extintores">
            <ConstructorManager>
              <ExtintoresPage 
                centroName={selectedCentroId ? centroNames[selectedCentroId] : 'No seleccionado'}
                zonaName={selectedZonaName || 'No seleccionada'}
                onBack={() => {
                  setView('zonas');
                }} 
                onGoLanding={() => {
                  setSelectedCentroId(null);
                  setSelectedZonaName(null);
                  setView('landing');
                }}
                onSelectRegistrarEstado={() => setView('localizarExtintor')}
                onSelectListado={() => setView('listadoExtintores')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView(view);
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'localizarExtintor') {
      return (
        <motion.div
          key="localizarExtintor"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="localizarExtintor">
            <LocalizarExtintorPage 
              onBack={() => setView('extintores')} 
              onGoLanding={() => setView('landing')}
              onSelectPorZonas={() => setView('centros1')}
              onSelectUltimosUsados={() => setView('ultimosUsados')}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'ultimosUsados') {
      return (
        <motion.div
          key="ultimosUsados"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="ultimosUsados">
            <UltimosUsadosPage 
              onBack={() => setView('localizarExtintor')}
              onGoLanding={() => setView('landing')}
              onSelectExtintor={(id) => {
                setSelectedExtintorId(parseInt(id));
                setView('registrarEstado');
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'registrarEstado') {
      return (
        <motion.div
          key="registrarEstado"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="registrarEstado">
            <RegistrarEstadoExtintorPage 
              extintorId={selectedExtintorId?.toString() || 'N/A'}
              onBack={() => setView('ultimosUsados')}
              onGoLanding={() => setView('landing')}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'centros1') {
      return (
        <motion.div
          key="centros1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="centros1">
            <CentroPage 
              centroNames={centroNames}
              setCentroNames={setCentroNames}
              onBack={() => setView('prl')} 
              onGoLanding={() => setView('landing')}
              onSelectCentros2={() => setView('centros2')}
              onSelectZonas={(id) => {
                setSelectedCentroId(id);
                setView('zonas');
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'centros2') {
      return (
        <motion.div
          key="centros2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="centros2">
            <Centros2Page 
              centroNames={centroNames}
              setCentroNames={setCentroNames}
              onBack={() => setView('centros1')} 
              onGoLanding={() => setView('landing')}
              onSelectZonas={(id) => {
                setSelectedCentroId(id);
                setView('zonas');
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'zonas') {
      return (
        <motion.div
          key="zonas"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="zonas">
            <ZonasPage 
              centroId={selectedCentroId || 1}
              centroName={selectedCentroId ? centroNames[selectedCentroId] : undefined}
              onBack={() => setView(selectedCentroId && selectedCentroId > 7 ? 'centros2' : 'centros1')} 
              onGoLanding={() => setView('landing')}
              onSelectZonas2={() => setView('zonas2')}
              onSelectZona={(id, name) => {
                setSelectedZonaName(name);
                setView('extintores');
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'zonas2') {
      return (
        <motion.div
          key="zonas2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="zonas2">
            <Zonas2Page 
              centroId={selectedCentroId || 1}
              centroName={selectedCentroId ? centroNames[selectedCentroId] : undefined}
              onBack={() => setView('zonas')} 
              onGoLanding={() => setView('landing')}
              onSelectZona={(id, name) => {
                setSelectedZonaName(name);
                setView('extintores');
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'listadoExtintores') {
      return (
        <motion.div
          key="listadoExtintores"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="listadoExtintores">
            <ListadoExtintoresPage 
              zonaName={selectedZonaName || ''}
              onBack={() => setView('extintores')}
              onGoLanding={() => setView('landing')}
              onSelectExtintor={(id) => {
                // Navigation disabled for now as per user request
                console.log(`Extintor ${id} selected. Technical sheet pending.`);
              }}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'usuariosRoles') {
      return (
        <motion.div
          key="usuariosRoles"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="usuariosRoles">
            <UsuariosRolesPage 
              onBack={() => setView('home')} 
              onGoLanding={() => setView('landing')}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'industry') {
      return (
        <motion.div
          key="industry"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id="industry">
            <IndustryPage 
              onBack={() => setView('home')} 
              onGoLanding={() => setView('landing')}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView(view);
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'configuracionCapa') {
      const LAYER_NAMES: Record<string, string> = {
        home: 'SISTEMA',
        prl: 'PRL',
        empresas: 'EMPRESAS',
        extintores: 'EXTINTORES',
        centros1: 'CENTROS',
        centros2: 'CENTROS 2',
        zonas: 'ZONAS',
        zonas2: 'ZONAS 2',
        usuariosRoles: 'USUARIOS',
        industry: 'INDUSTRIA',
        configuracionCapa: 'CAPA',
        listadoExtintores: 'LISTADO',
        localizarExtintor: 'LOCALIZAR',
        ultimosUsados: 'HISTORIAL',
        donar: 'DONAR',
        planoEmpresa: 'PLANO',
        tengo: 'TENGO',
        quiero: 'QUIERO',
        compartir: 'COMPARTIR'
      };

      const previousViewId = previousView || 'home';

      return (
        <motion.div
          key="configuracionCapa"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <LayerProvider id={previousViewId}>
            <ConfiguracionCapaPage 
              layerId={previousViewId}
              layerName={LAYER_NAMES[previousViewId] || previousViewId.toUpperCase()}
              onBack={() => setView(previousViewId as any)} 
              onGoLanding={() => setView('landing')}
              onOpenIA={() => setIsIAOpen(true)}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'ajustesLanding') {
      return (
        <motion.div
          key="ajustesLanding"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <AjustesLandingPage onBack={() => setView('landing')} />
        </motion.div>
      );
    }

    if (view === 'donar') {
      return (
        <motion.div
          key="donar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <DonarPage 
            onBack={() => setView('landing')} 
            onGoLanding={() => setView('landing')}
            onOpenIA={() => setIsIAOpen(true)}
            onOpenConfiguracion={() => {
              setPreviousView('donar');
              setView('configuracionCapa');
            }}
          />
        </motion.div>
      );
    }

    if (view === 'planoEmpresa') {
      return (
        <motion.div
          key="planoEmpresa"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <LayerProvider id="plano-empresa">
            <PlanoEmpresaPage 
              onBack={() => setView('home')} 
              onGoLanding={() => setView('landing')}
              onOpenIA={() => setIsIAOpen(true)}
              onOpenConfiguracion={() => {
                setPreviousView('planoEmpresa');
                setView('configuracionCapa');
              }}
            />
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'tengo') {
      return (
        <motion.div
          key="tengo"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <LayerProvider id="tengo">
            <ConstructorManager>
              <TengoPage
                onBack={() => setView('landing')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView('tengo');
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'quiero') {
      return (
        <motion.div
          key="quiero"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <LayerProvider id="quiero">
            <ConstructorManager>
              <QuieroPage
                onBack={() => setView('landing')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView('quiero');
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'compartir') {
      return (
        <motion.div
          key="compartir"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full min-h-screen"
        >
          <LayerProvider id="compartir">
            <ConstructorManager>
              <CompartirPage
                onBack={() => setView('landing')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => {
                  setPreviousView('compartir');
                  setView('configuracionCapa');
                }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'datos') {
      return (
        <motion.div key="datos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="w-full h-full">
          <LayerProvider id="datos">
            <ConstructorManager>
              <DatosPage
                onBack={() => setView('empresas')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => { setPreviousView(view); setView('configuracionCapa'); }}
                onOpenListados={() => setView('listados')}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'listados') {
      return (
        <motion.div key="listados" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="w-full h-full">
          <LayerProvider id="listados">
            <ConstructorManager>
              <ListadosPage
                onBack={() => setView('datos')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => { setPreviousView(view); setView('configuracionCapa'); }}
                onSelectZone={(zoneId) => { setSelectedDatosZoneId(zoneId); setView('listadoZona'); }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'listadoZona') {
      return (
        <motion.div key="listadoZona" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="w-full h-full">
          <LayerProvider id="listadoZona">
            <ConstructorManager>
              <ListadoZonaPage
                onBack={() => setView('listados')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => { setPreviousView(view); setView('configuracionCapa'); }}
                zoneId={selectedDatosZoneId}
                onSelectSubZone={(subZoneId) => { setSelectedDatosSubZoneId(subZoneId); setView('listadoElementos'); }}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    if (view === 'listadoElementos') {
      return (
        <motion.div key="listadoElementos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="w-full h-full">
          <LayerProvider id="listadoElementos">
            <ConstructorManager>
              <ListadoElementosPage
                onBack={() => setView('listadoZona')}
                onGoLanding={() => setView('landing')}
                onOpenIA={() => setIsIAOpen(true)}
                onOpenConfiguracion={() => { setPreviousView(view); setView('configuracionCapa'); }}
                zoneId={selectedDatosZoneId}
                subZoneId={selectedDatosSubZoneId}
              />
            </ConstructorManager>
          </LayerProvider>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <ConstructorProvider>
      <SettingsProvider>
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
        <IAModal 
          isOpen={isIAOpen} 
          onClose={() => setIsIAOpen(false)} 
          onCommand={handleIACommand} 
        />
        {debugMessage && (
          <div className="fixed top-10 left-0 w-full text-center z-[100]">
            <span className="bg-yellow-500 text-black font-black px-4 py-2 rounded-lg shadow-xl uppercase tracking-widest">
              {debugMessage}
            </span>
          </div>
        )}
        <a
          href="/teso-export.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Exportar código — copiar todo"
          className="fixed top-3 left-3 z-[200] w-9 h-9 bg-gradient-to-br from-[#4A3018] to-[#1A0F05] border border-[#D4AF37]/60 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:border-[#D4AF37] hover:shadow-[0_0_16px_rgba(212,175,55,0.5)] transition-all"
        >
          <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10" />
          </svg>
        </a>
      </SettingsProvider>
    </ConstructorProvider>
  );
}
