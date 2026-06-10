'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarbonStore } from '@/store/useCarbonStore';
import { Leaf, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingFormSteps } from '@/features/onboarding/components/OnboardingFormSteps';

/**
 * OnboardingPage handles account and habit baseline questionnaire profiles configuration wizard.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarding, user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [energy, setEnergy] = useState(50); 
  const [transit, setTransit] = useState(40); 
  const [diet, setDiet] = useState(2); 
  const [shopping, setShopping] = useState(5); 
  const [waste, setWaste] = useState(30); 

  const [progressMsg, setProgressMsg] = useState('');
  const [processingPercent, setProcessingPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (user.onboardingComplete) {
        setName(user.name);
        setEmail(user.email);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Run simulated ML pipeline training when reaching step 7
  useEffect(() => {
    if (step === 7) {
      const messages = [
        'Connecting to Google Vertex AI cluster...',
        'Seeding synthetic consumption baseline dataset (N=500)...',
        'Fitting Random Forest Regressor on emissions matrix...',
        'Initializing Google Vision OCR receipt parser credentials...',
        'Running TreeExplainer to calculate base SHAP value matrix (E0 = 283 kg)...',
        'Generating baseline Digital Carbon Twin forecasting models...',
        'Success! Workspace initialized.',
      ];

      let currentMsgIdx = 0;
      const initTimer = setTimeout(() => {
        setProgressMsg(messages[0]);
      }, 0);

      const interval = setInterval(() => {
        setProcessingPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const nextVal = prev + 1.5;
          const msgIdx = Math.min(messages.length - 1, Math.floor((nextVal / 100) * messages.length));
          if (msgIdx !== currentMsgIdx) {
            currentMsgIdx = msgIdx;
            setProgressMsg(messages[msgIdx]);
          }
          return nextVal;
        });
      }, 50);

      return () => {
        clearTimeout(initTimer);
        clearInterval(interval);
      };
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !email.trim())) {
      alert('Please fill out your name and email address.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = () => {
    setOnboarding({
      name,
      email,
      energy,
      transit,
      diet,
      shopping,
      waste: 100 - waste,
    });
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6">
      
      {/* HEADER */}
      <header className="max-w-xl mx-auto w-full flex items-center gap-2 py-4 justify-center">
        <Leaf className="w-8 h-8 text-emerald-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          CarbonPulse AI+
        </span>
      </header>

      {/* BODY CARDS */}
      <main className="max-w-xl mx-auto w-full flex-1 flex items-center justify-center py-8">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full shadow-2xl relative overflow-hidden transition-all duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10"></div>
          
          {step < 7 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs text-zinc-500 mb-2 uppercase font-bold tracking-wider">
                <span>Step {step} of 6</span>
                <span className="text-emerald-500">{Math.round((step / 6) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Render individual step form */}
          <OnboardingFormSteps
            step={step}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            energy={energy}
            setEnergy={setEnergy}
            transit={transit}
            setTransit={setTransit}
            diet={diet}
            setDiet={setDiet}
            shopping={shopping}
            setShopping={setShopping}
            waste={waste}
            setWaste={setWaste}
          />

          {/* STEP 7: Processing ML Model */}
          {step === 7 && (
            <div className="space-y-8 text-center py-6 animate-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-emerald-400">Vertex AI Pipeline Training</h2>
                <div className="h-6 overflow-hidden">
                  <p className="text-xs text-zinc-400 font-mono animate-pulse">{progressMsg}</p>
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between text-xs font-bold text-zinc-500">
                  <span>ML FIT PREDICTION</span>
                  <span>{Math.round(processingPercent)}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${processingPercent}%` }}
                  ></div>
                </div>
              </div>

              {processingPercent >= 100 && (
                <button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 animate-bounce mt-4 inline-flex items-center gap-2"
                >
                  Unlock Eco Workspace <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* NAVIGATION CONTROLS */}
          {step < 7 && (
            <div className="flex items-center justify-between border-t border-zinc-800 pt-6 mt-8">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5"
              >
                {step === 6 ? 'Train ML Model' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center text-xs text-zinc-600 py-4 max-w-xl mx-auto w-full">
        By submitting your details, you consent to secure Google cloud data encryption.
      </footer>

    </div>
  );
}
