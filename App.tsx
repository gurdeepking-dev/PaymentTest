
import React, { useState } from 'react';
import { AppState, TransformationStyle, PolicyType } from './types';
import { STYLES, PRICE_INR, PRICE_PAISE, POLICIES, BUSINESS_NAME, SUPPORT_EMAIL } from './constants';
import { transformImage } from './services/geminiService';

interface ExtendedAppState extends AppState {
  paymentId: string | null;
  refundRequested: boolean;
  refundStatus: 'idle' | 'processing' | 'success' | 'failed';
  activePolicy: PolicyType;
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
    activePolicy: null,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: "File too large (Max 5MB)." }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, originalImage: reader.result as string, resultImage: null, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = () => {
    if (!state.originalImage || !state.selectedStyle) {
      setState(prev => ({ ...prev, error: "Please upload a photo and select a style." }));
      return;
    }

    try {
      const options = {
        key: "rzp_live_SAmlkIP3G8lUma",
        amount: PRICE_PAISE,
        currency: "INR",
        name: BUSINESS_NAME,
        description: `Digital Portrait - ${state.selectedStyle}`,
        image: "https://picsum.photos/200",
        handler: function (response: any) {
          processTransformation(response.razorpay_payment_id);
        },
        prefill: { name: "Customer", email: "customer@example.com" },
        theme: { color: "#6366f1" },
        notes: { style: state.selectedStyle, type: "digital_art" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: "Payment system unavailable." }));
    }
  };

  const processTransformation = async (paymentId: string) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, paymentId }));
    try {
      const style = STYLES.find(s => s.id === state.selectedStyle);
      const result = await transformImage(state.originalImage!, style!.prompt);
      setState(prev => ({ ...prev, resultImage: result, isProcessing: false, paymentAuthorized: true }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: `Error: ${err.message}. Payment ID: ${paymentId}` }));
    }
  };

  const handleRefund = async () => {
    if (!state.paymentId) return;
    setState(prev => ({ ...prev, refundStatus: 'processing' }));
    // Simulate API call
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        refundStatus: 'failed', 
        error: `Automated refund failed. Please email ${SUPPORT_EMAIL} with ID: ${state.paymentId}` 
      }));
    }, 1500);
  };

  const PolicyModal = () => {
    if (!state.activePolicy) return null;
    const policy = POLICIES[state.activePolicy];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-8 animate-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{policy.title}</h3>
            <button onClick={() => setState(p => ({ ...p, activePolicy: null }))} className="text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{policy.content}</p>
          <button onClick={() => setState(p => ({ ...p, activePolicy: null }))} className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans">
      <PolicyModal />
      
      <div className="flex-grow flex flex-col items-center py-12 px-4">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AI Portrait Studio</h1>
          <p className="text-slate-400 text-lg">Instant AI Digital Art for just ₹{PRICE_INR}</p>
        </header>

        <main className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl">
          {!state.resultImage ? (
            <div className="space-y-10">
              <section className="text-center">
                <div className="inline-block p-1 rounded-full bg-slate-800 mb-6">
                   <div className="flex gap-2 px-4 py-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
                     <span>Instant Delivery</span>
                     <span className="text-slate-600">•</span>
                     <span>Secured by Razorpay</span>
                   </div>
                </div>
                
                <div className="flex justify-center">
                  {state.originalImage ? (
                    <div className="relative group">
                      <img src={state.originalImage} className="w-56 h-56 object-cover rounded-2xl border-2 border-indigo-500 shadow-xl" />
                      <button onClick={() => setState(p => ({ ...p, originalImage: null }))} className="absolute -top-3 -right-3 bg-red-500 rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <label className="w-full max-w-md h-40 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                      <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-slate-400 font-medium">Click to Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STYLES.map(style => (
                  <button key={style.id} onClick={() => setState(p => ({ ...p, selectedStyle: style.id }))} className={`text-left p-4 rounded-2xl border-2 transition-all ${state.selectedStyle === style.id ? 'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}>
                    <h3 className="font-bold text-lg mb-1">{style.name}</h3>
                    <p className="text-slate-400 text-sm">{style.description}</p>
                  </button>
                ))}
              </section>

              <div className="flex flex-col items-center pt-8 border-t border-slate-800">
                {state.error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{state.error}</div>}
                <button disabled={state.isProcessing || !state.originalImage || !state.selectedStyle} onClick={handlePayment} className="w-full md:w-auto px-16 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold text-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                  {state.isProcessing ? "Generating Art..." : `Pay ₹${PRICE_INR} & Generate`}
                </button>
                <div className="mt-6 flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                   <img src="https://razorpay.com/assets/razorpay-glyph.svg" className="h-6" alt="Razorpay" />
                   <span className="text-xs font-semibold tracking-widest uppercase">100% Secure Checkout</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
               <h2 className="text-3xl font-bold mb-8">Art Generated!</h2>
               <img src={state.resultImage} className="max-w-md w-full rounded-2xl shadow-2xl border-4 border-slate-800 mb-8" />
               <div className="flex flex-wrap gap-4">
                  <a href={state.resultImage} download className="px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100">Download PNG</a>
                  <button onClick={handleRefund} className="px-8 py-4 border border-red-500/50 text-red-400 rounded-xl font-bold hover:bg-red-500/5">Not Happy? Refund</button>
                  <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-800 rounded-xl font-bold hover:bg-slate-700">Start New</button>
               </div>
               {state.error && <p className="mt-8 text-red-400 text-center text-sm">{state.error}</p>}
            </div>
          )}
        </main>
      </div>

      <footer className="w-full bg-slate-900/50 border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold text-lg mb-4">{BUSINESS_NAME}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leading the way in accessible AI-generated digital art. Transform your portraits in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Compliance</h4>
            <nav className="flex flex-col gap-2 text-sm text-slate-400">
              <button onClick={() => setState(p => ({ ...p, activePolicy: 'privacy' }))} className="text-left hover:text-indigo-400 transition-colors">Privacy Policy</button>
              <button onClick={() => setState(p => ({ ...p, activePolicy: 'terms' }))} className="text-left hover:text-indigo-400 transition-colors">Terms & Conditions</button>
              <button onClick={() => setState(p => ({ ...p, activePolicy: 'refund' }))} className="text-left hover:text-indigo-400 transition-colors">Refund & Cancellation</button>
              <button onClick={() => setState(p => ({ ...p, activePolicy: 'shipping' }))} className="text-left hover:text-indigo-400 transition-colors">Shipping & Delivery</button>
            </nav>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <div className="text-sm text-slate-400 flex flex-col gap-2">
              <p>Email: {SUPPORT_EMAIL}</p>
              <button onClick={() => setState(p => ({ ...p, activePolicy: 'contact' }))} className="text-left text-indigo-400 font-semibold hover:underline">Full Contact Details</button>
              <div className="mt-4 flex gap-3">
                <img src="https://cdn.razorpay.com/static/assets/badgetest.png" className="h-8 opacity-70" alt="Razorpay Secure" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2024 AI Portrait Studio. All payments processed in INR.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
