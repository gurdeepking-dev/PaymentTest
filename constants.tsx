
import { TransformationStyle, StyleOption } from './types';

export const PRICE_INR = 5;
export const PRICE_PAISE = 500;
export const SUPPORT_EMAIL = "support@aiportrait.studio";
export const BUSINESS_NAME = "AI Portrait Studio (Digital Arts)";

export const STYLES: StyleOption[] = [
  {
    id: TransformationStyle.CYBERPUNK,
    name: "Cyberpunk Edge",
    description: "Futuristic neon lighting and high-tech aesthetics.",
    previewUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=400&fit=crop",
    prompt: "Transform this portrait into a high-quality cyberpunk digital painting. Add neon glow and futuristic city lights."
  },
  {
    id: TransformationStyle.WATERCOLOR,
    name: "Dreamy Watercolor",
    description: "Soft textures and artistic splashes.",
    previewUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=400&fit=crop",
    prompt: "Transform this photo into a beautiful watercolor painting with soft pastel colors and paper texture."
  }
];

export const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    content: "We value your privacy. Your uploaded photos are processed temporarily via Google Gemini AI and are not stored on our servers permanently. We do not sell your personal data. Payment information is handled securely by Razorpay."
  },
  terms: {
    title: "Terms & Conditions",
    content: "By using AI Portrait Studio, you agree to pay ₹5 per image generation. You represent that you own the rights to the photos you upload. The AI-generated output is provided 'as-is' for personal use."
  },
  refund: {
    title: "Refund & Cancellation",
    content: "If the AI fails to generate your image, the payment will be automatically released. If you are unsatisfied with the artistic output, you can click the 'Refund' button immediately after generation. No refunds will be processed once the high-resolution image is downloaded."
  },
  shipping: {
    title: "Shipping & Delivery",
    content: "This is a digital product. No physical items will be shipped. The generated AI portrait is delivered instantly to your browser screen upon successful payment and processing. You can download it as a PNG file immediately."
  },
  contact: {
    title: "Contact Us",
    content: `For any queries, please reach out to us:\n\nEmail: ${SUPPORT_EMAIL}\nBusiness Hours: 10 AM - 6 PM (IST)\nAddress: Digital Arts Plaza, Sector 44, Gurgaon, Haryana, India.`
  }
};
