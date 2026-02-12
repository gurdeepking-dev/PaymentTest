
import { GoogleGenAI } from "@google/genai";

export async function transformImage(
  base64Image: string,
  prompt: string
): Promise<string> {
  // Use a new instance for every call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const imageData = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data received from AI model.");
  } catch (error: any) {
    console.error("AI Transformation Error:", error);
    throw new Error(error.message || "Transformation failed. Please try again.");
  }
}
