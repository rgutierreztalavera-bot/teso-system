import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const navigateToFunction: FunctionDeclaration = {
  name: "navigateTo",
  description: "Cambia la pantalla actual de la aplicación.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      view: {
        type: Type.STRING,
        description: "El nombre de la vista a la que navegar (ej: 'prl', 'extintores', 'empresas', 'home', 'landing', 'industry', 'usuariosRoles').",
      },
    },
    required: ["view"],
  },
};

export const updateSettingFunction: FunctionDeclaration = {
  name: "updateSetting",
  description: "Ajusta el tamaño del texto o de los iconos de una capa específica.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      layerId: {
        type: Type.STRING,
        description: "El ID de la capa a modificar (ej: 'empresas', 'prl', 'home').",
      },
      setting: {
        type: Type.STRING,
        enum: ["fontSize", "iconSize"],
        description: "El ajuste que se desea cambiar.",
      },
      value: {
        type: Type.NUMBER,
        description: "El nuevo valor numérico para el ajuste (ej: 12 para texto, 48 para iconos).",
      },
    },
    required: ["layerId", "setting", "value"],
  },
};

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    const model = "gemini-3-flash-preview";
    
    // Convert history to Gemini format if needed
    const contents = history.length > 0 ? history : [];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "Eres el asistente inteligente y constructor de Teso System. Tu objetivo es ayudar al usuario a navegar por la aplicación y construir/personalizar su interfaz en tiempo real. Puedes cambiar pantallas y ajustar tamaños de texto o iconos usando las herramientas proporcionadas. Actúa como un diseñador experto que escucha y aplica cambios inmediatamente. Responde de forma breve y profesional en español. Mantén el contexto de la conversación.",
        tools: [{ functionDeclarations: [navigateToFunction, updateSettingFunction] }],
      },
    });

    return response;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
}
