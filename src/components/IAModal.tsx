import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export default function IAModal({ isOpen, onClose, onCommand }: IAModalProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola, soy tu asistente de Teso System. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const { setLayerSetting } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'es-ES';

      recognition.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        handleGeminiInteraction(transcript);
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Permiso de micrófono denegado.');
        } else {
          setError('Error al escuchar. Intenta escribir.');
        }
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      if (recognition.current && isListening) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  const handleGeminiInteraction = async (input: string) => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setText('');
    setIsLoading(true);

    try {
      // Convert messages to Gemini format
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await getGeminiResponse(input, history);
      
      // Handle function calls
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'navigateTo') {
            const { view } = call.args as { view: string };
            onCommand(view);
          } else if (call.name === 'updateSetting') {
            const { layerId: targetLayer, setting, value } = call.args as { layerId: string, setting: 'fontSize' | 'iconSize', value: number };
            setLayerSetting(targetLayer, setting, value);
          }
        }
      }

      const assistantContent = response.text || "Comando procesado correctamente.";
      const assistantMessage: Message = { role: 'assistant', content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(assistantContent);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError('Error al conectar con la IA.');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, he tenido un problema al procesar tu solicitud.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Ejecutar interpretación local primero
    onCommand(text);
    
    // Luego manejar la interacción con Gemini
    handleGeminiInteraction(text);
  };

  const speakMessage = (content: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md h-[80vh] flex flex-col bg-[#111] border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-white/10 bg-neutral-900">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-8 h-8 text-yellow-500" />
                <span className="font-black tracking-widest text-lg uppercase">TESO AI</span>
              </div>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl flex flex-col gap-1 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speakMessage(msg.content)}
                        className="self-end p-1 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-white/50" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-white/50 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-4 bg-neutral-900 border-t border-white/10">
              {error && <p className="text-red-500 text-xs mb-2 text-center">{error}</p>}
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                    isListening ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </motion.button>

                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe o habla..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                  />
                  <button 
                    type="submit"
                    disabled={!text.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 disabled:text-white/20 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
