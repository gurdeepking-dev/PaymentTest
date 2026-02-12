
import React, { useState } from 'react';
import { AppState, TransformationStyle } from './types';
import { STYLES, PRICE_INR, PRICE_PAISE } from './constants';
import { transformImage } from './services/geminiService';

interface ExtendedAppState extends AppState {
  paymentId: string | null;
  refundRequested: boolean;
  refundStatus: 'idle' | 'processing' | 'success' | 'failed';
}

const App: React.FC = () => {
  const [state, setState] = useState<ExtendedAppState>({
    originalImage: null,
    selectedStyle: null,
    paymentAuthorized: false,
    isProcessing: false,
    resultImage: null,
    error: null,
    paymentId: null,
    refundRequested: false,
    refundStatus: 'idle',
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: "File too large. Please upload an image under 5MB." }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          originalImage: reader.result as string, 
          resultImage: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectStyle = (styleId: TransformationStyle) => {
    setState(prev => ({ ...prev, selectedStyle: styleId, error: null }));
  };

  const handlePayment = () => {
    if (!state.originalImage || !state.selectedStyle) {
      setState(prev => ({ ...prev, error: "Please upload a photo and select a style first." }));
      return;
    }

    try {
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay SDK not loaded. Check your internet.");
      }

      const options = {
        key: "rzp_live_SAmlkIP3G8lUma", 
        amount: PRICE_PAISE,
        currency: "INR",
        name: "AI Portrait Studio",
        description: `Transformation: ${state.selectedStyle}`,
        image: "https://picsum.photos/200",
        handler: function (response: any) {
          if (response.razorpay_payment_id) {
            processTransformation(response.razorpay_payment_id);
          }
        },
        prefill: {
          name: "Valued Customer",
          email: "customer@example.com",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: function() {
            setState(prev => ({ ...prev, isProcessing: false }));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setState(prev => ({ ...prev, error: resp.error.description, isProcessing: false }));
      });
      rzp.open();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  const processTransformation = async (paymentId: string) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, paymentId }));
    
    try {
      const selectedStyleObj = STYLES.find(s => s.id === state.selectedStyle);
      if (!selectedStyleObj || !state.originalImage) throw new Error("Configuration missing");

      const result = await transformImage(state.originalImage, selectedStyleObj.prompt);
      
      setState(prev => ({ 
        ...prev, 
        resultImage: result, 
        isProcessing: false,
        paymentAuthorized: true 
      }));
    } catch (err: any) {
      // Automatic Failure Handling
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: `Generation Failed. We are attempting to auto-refund Payment ID: ${paymentId}.` 
      }));
      // In a real app, you'd trigger handleRefund() automatically here.
    }
  };

  const handleRefund = async () => {
    if (!state.paymentId) return;
    
    setState(prev => ({ ...prev, refundStatus: 'processing', error: null }));
    
    try {
      /**
       * IMPORTANT FOR THE DEVELOPER:
       * To make this "Automatic", you must replace this fetch call with your real backend URL.
       * Your backend should use the Razorpay Node.js SDK to call: 
       * razorpay.payments.refund(paymentId, { amount: 500 })
       */
      const response = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: state.paymentId })
      });

      if (!response.ok) {
        throw new Error("Automated refund service is currently offline.");
      }

      setState(prev => ({ 
        ...prev, 
        refundStatus: 'success', 
        refundRequested: true,
        error: "Refund successful! The amount will be back in your account in 5-7 days."
      }));
    } catch (err: any) {
      console.error("Refund Automation Error:", err);
      setState(prev => ({ 
        ...prev, 
        refundStatus: 'failed',
        error: `Automatic refund failed: ${err.message}. Please take a screenshot of your Payment ID: ${state.paymentId} and contact support at support@aiportrait.studio for a manual refund.`
      }));
    }
  };

  const reset = () => {
    setState({
      originalImage: null,
      selectedStyle: null,
      paymentAuthorized: false,
      isProcessing: false,
      resultImage: null,
      error: null,
      paymentId: null,
      refundRequested: false,
      refundStatus: 'idle',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-slate-950 text-slate-50">
      <header className="mb-12 text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          AI Portrait Studio
        </h1>
        <p className="text-slate-400 text-lg">Artistic transformations for just ₹{PRICE_INR}.</p>
      </header>

      <main className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {!state.resultImage ? (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Upload Photo
              </h2>
              <div className="flex flex-col items-center">
                {state.originalImage ? (
                  <div className="relative group">
                    <img src={state.originalImage} className="w-64 h-64 object-cover rounded-2xl border-4 border-slate-800 group-hover:border-indigo-500 transition-all shadow-lg" />
                    <button onClick={() => setState(p => ({ ...p, originalImage: null }))} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-xl">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <svg className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-slate-400 group-hover:text-slate-200 font-medium">Choose a Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Choose Style
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STYLES.map((style) => (
                  <div key={style.id} onClick={() => selectStyle(style.id)} className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all ${state.selectedStyle === style.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                    <img src={style.previewUrl} className="w-full h-32 object-cover opacity-60" />
                    <div className="p-4 bg-slate-900/80">
                      <h3 className="font-bold">{style.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col items-center pt-8 border-t border-slate-800">
              {state.error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{state.error}</div>}
              <button disabled={state.isProcessing || !state.originalImage || !state.selectedStyle} onClick={handlePayment} className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${state.isProcessing ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl'}`}>
                {state.isProcessing ? "Working..." : `Pay ₹${PRICE_INR} & Generate`}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl font-bold">Success!</h2>
            <img src={state.resultImage} className="max-w-md w-full rounded-2xl shadow-2xl border-4 border-indigo-500/20" />
            
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {!state.refundRequested && (
                <>
                  <a href={state.resultImage} download className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 flex items-center gap-2">
                    Download
                  </a>
                  
                  <button 
                    onClick={handleRefund}
                    disabled={state.refundStatus === 'processing'}
                    className={`px-8 py-4 rounded-xl font-bold border transition-all flex items-center gap-2 ${
                      state.refundStatus === 'failed' 
                      ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                      : 'border-red-500 text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {state.refundStatus === 'processing' ? (
                      <span className="animate-pulse">Processing Refund...</span>
                    ) : state.refundStatus === 'failed' ? (
                      "Automatic Refund Failed - Help?"
                    ) : (
                      "I don't like it - Refund"
                    )}
                  </button>
                </>
              )}
              <button onClick={reset} className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">New Project</button>
            </div>
            
            {state.error && <div className={`w-full p-4 rounded-xl text-sm ${state.refundStatus === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{state.error}</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
