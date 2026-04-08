import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generateRealisticReportsIcon() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A photorealistic, ultra-high-detail 3D icon of a professional report stack for an industrial mobile app. The object is a stack of thick, premium white matte paper sheets. The top sheet has a subtle, natural curl at the bottom-right corner. On the face of the top sheet, there are four embossed horizontal grey bars representing text lines. To the left of each bar is a small, slightly raised 3D circular dot in these specific colors: top is bright yellow, second is vibrant blue, third is deep green, and fourth is rich red. The lighting is soft studio lighting with realistic ambient occlusion and soft shadows. The background is a clean, smooth gradient of deep blue to light blue. The overall aesthetic is premium, tactile, and realistic, like a physical product photograph. Square composition, centered, 3/4 perspective view. No text, no logos, no watermarks.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        fs.writeFileSync("reports_icon_base64.txt", base64Data);
        console.log("SUCCESS: Image generated and saved to reports_icon_base64.txt");
        return;
      }
    }
    console.error("No image data in response");
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

generateRealisticReportsIcon();
