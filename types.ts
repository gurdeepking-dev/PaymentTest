
export enum TransformationStyle {
  CYBERPUNK = 'Cyberpunk Neon',
  WATERCOLOR = 'Watercolor Masterpiece'
}

export interface StyleOption {
  id: TransformationStyle;
  name: string;
  description: string;
  previewUrl: string;
  prompt: string;
}

export interface AppState {
  originalImage: string | null;
  selectedStyle: TransformationStyle | null;
  paymentAuthorized: boolean;
  isProcessing: boolean;
  resultImage: string | null;
  error: string | null;
}

// Razorpay types for window object
declare global {
  interface Window {
    Razorpay: any;
  }
}
