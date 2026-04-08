import { GoogleGenAI } from "@google/genai";

async function generateRealisticIcon() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("ERROR: No API key found in environment.");
    process.exit(1);
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

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      console.log("---BEGIN_IMAGE_BASE64---");
      console.log(part.inlineData.data);
      console.log("---END_IMAGE_BASE64---");
    } else {
      console.error("ERROR: No image data returned from model.");
    }
  } catch (error) {
    console.error("ERROR during generation:", error);
  }
}

generateRealisticIcon();
