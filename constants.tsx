
import { TransformationStyle, StyleOption } from './types';

export const PRICE_INR = 5;
export const PRICE_PAISE = 500;

export const STYLES: StyleOption[] = [
  {
    id: TransformationStyle.CYBERPUNK,
    name: "Cyberpunk Edge",
    description: "Futuristic neon lighting, high-tech aesthetics, and vibrant night-city colors.",
    previewUrl: "https://picsum.photos/seed/cyber/400/400",
    prompt: "Transform this portrait into a high-quality cyberpunk digital painting. Add neon glow, cybernetic enhancements, futuristic city lights in the background, and sharp cinematic lighting. Retain the person's identity but give them a futuristic vibe."
  },
  {
    id: TransformationStyle.WATERCOLOR,
    name: "Dreamy Watercolor",
    description: "Soft textures, artistic splashes, and a hand-painted traditional look.",
    previewUrl: "https://picsum.photos/seed/paint/400/400",
    prompt: "Transform this photo into a beautiful, professional watercolor painting. Use soft pastel colors, artistic paint drips, and textured paper effects. Maintain the core features of the subject while giving it an ethereal, hand-crafted feel."
  }
];
