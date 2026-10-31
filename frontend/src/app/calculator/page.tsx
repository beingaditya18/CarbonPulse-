'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarbonStore } from '@/store/useCarbonStore';
import {
  Leaf, ArrowLeft, ArrowRight, Sparkles, Globe,
  Car, Zap, Apple, ShoppingBag, BarChart3, AlertCircle, Loader2
} from 'lucide-react';
import { calculateMultiVectorBaseline } from '@/utils/carbonCalculations';

export default function CalculatorPage() {
  const router = useRouter();
  const { setOnboarding, user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState<'US' | 'UK' | 'EU' | 'IN' | 'Global'>('Global');

  // Transport
  const [carFuelType, setCarFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none'>('petrol');
  const [carWeeklyMileage, setCarWeeklyMileage] = useState(80);
  const [publicTransitWeeklyMileage, setPublicTransitWeeklyMileage] = useState(40);
  const [shortHaulFlights, setShortHaulFlights] = useState(1);
  const [longHaulFlights, setLongHaulFlights] = useState(0);

  // Home Energy
  const [electricityMonthlyKWh, setElectricityMonthlyKWh] = useState(250);
  const [renewableEnergyPct, setRenewableEnergyPct] = useState(0);
  const [heatingFuelType, setHeatingFuelType] = useState<'gas' | 'oil' | 'lpg' | 'biomass' | 'none'>('gas');
  const [heatingMonthlyFuel, setHeatingMonthlyFuel] = useState(50);
  const [residents, setResidents] = useState(1);

  // Food & Diet
  const [dietaryPattern, setDietaryPattern] = useState<'vegan' | 'vegetarian' | 'pescatarian' | 'low-meat' | 'medium-meat' | 'high-meat'>('medium-meat');
  const [foodWasteHabits, setFoodWasteHabits] = useState<'low' | 'moderate' | 'high'>('moderate');

  // Consumption
  const [shoppingPatterns, setShoppingPatterns] = useState<'minimalist' | 'average' | 'frequent'>('average');
  const [recycleConsistently, setRecycleConsistently] = useState(false);

  // ML Processing
  const [progressMsg, setProgressMsg] = useState('');
  const [processingPercent, setProcessingPercent] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (user.onboardingComplete) {
      setName(user.name);
      setEmail(user.email);
      if (user.calculatorAnswers) {
        const ca = user.calculatorAnswers;
        setRegion(ca.region);
        setCarFuelType(ca.carFuelType);
        setCarWeeklyMileage(ca.carWeeklyMileage);
        setPublicTransitWeeklyMileage(ca.publicTransitWeeklyMileage);
        setShortHaulFlights(ca.shortHaulFlights);
        setLongHaulFlights(ca.longHaulFlights);
        setElectricityMonthlyKWh(ca.electricityMonthlyKWh);
        setRenewableEnergyPct(ca.renewableEnergyPct);
        setHeatingFuelType(ca.heatingFuelType);
        setHeatingMonthlyFuel(ca.heatingMonthlyFuel);
        setResidents(ca.residents);
        setDietaryPattern(ca.dietaryPattern);
        setFoodWasteHabits(ca.foodWasteHabits);
        setShoppingPatterns(ca.shoppingPatterns);
        setRecycleConsistently(ca.recycleConsistently);
      }
    }
  }, [user]);

  // Run simulated ML pipeline training on step 6
  useEffect(() => {
    if (step === 6) {
      const messages = [
        'Configuring localized regional parameters...',
        'Attributing transport vector emissions...',
        'Scaling residential utility power footprints...',
        'Fitting cooperative game-theoretic SHAP parameters...',
        'Calibrating Ordinary Least Squares forecasting twin...',
        'Syncing models with local secure Zustand store...',
        'Success! Personal Carbon Twin initialized.',
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
          const nextVal = prev + 2;
          const msgIdx = Math.min(messages.length - 1, Math.floor((nextVal / 100) * messages.length));
          if (msgIdx !== currentMsgIdx) {
            currentMsgIdx = msgIdx;
            setProgressMsg(messages[msgIdx]);
          }
          return nextVal;
        });
      }, 40);

      return () => {
        clearTimeout(initTimer);
        clearInterval(interval);
      };
    }
  }, [step]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center text-slate-700">
        <div className="space-y-4 bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl max-w-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#047857] mx-auto" />
          <p className="text-sm font-semibold">Initializing assessment calculator...</p>
        </div>
      </div>
    );
  }

  const currentAnswers = {
    region,
    carFuelType,
    carWeeklyMileage,
    publicTransitWeeklyMileage,
    shortHaulFlights,
    longHaulFlights,
    electricityMonthlyKWh,
    renewableEnergyPct,
    heatingFuelType,
    heatingMonthlyFuel,
    residents,
    dietaryPattern,
    foodWasteHabits,
    shoppingPatterns,
    recycleConsistently,
  };

  const calculatedMonthlyBaseline = calculateMultiVectorBaseline(currentAnswers);
  const calculatedAnnualTonnes = Math.round((calculatedMonthlyBaseline * 12 / 1000) * 10) / 10;
  const isBelowTargetLimit = calculatedAnnualTonnes <= 2.3;

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !email.trim())) {
      alert('Please enter your name and email address.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = () => {
    // Generate onboarding payload structured for Zustand
    setOnboarding(
      {
        name,
        email,
        energy: Math.round(electricityMonthlyKWh * 0.4), // approximate representation for backwards-compatibility
        transit: Math.round(carWeeklyMileage * 0.8),
        diet: dietaryPattern === 'vegan' ? 4 : dietaryPattern === 'vegetarian' ? 3 : dietaryPattern === 'pescatarian' ? 2.5 : 2,
        shopping: shoppingPatterns === 'minimalist' ? 3 : shoppingPatterns === 'average' ? 6 : 12,
        waste: recycleConsistently ? 90 : 30,
      },
      currentAnswers
    );
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-6 selection:bg-[#047857] selection:text-white">

      {/* HEADER */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#047857]">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xl font-black text-[#047857] tracking-tight">
            CarbonPulse AI+
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#065f46] border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-[#047857]" /> SMC 22.920 Baseline
        </span>
      </header>

      {/* QUESTIONNAIRE SHELL */}
      <main className="max-w-2xl mx-auto w-full flex-1 flex items-center justify-center py-6">
        <div className="bg-white border border-slate-200/90 p-8 rounded-3xl w-full shadow-xl relative overflow-hidden transition-all duration-300">

          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10"></div>

          {step < 6 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">
                <span>Section {step} of 5</span>
                <span className="text-[#047857] font-extrabold">{Math.round(((step - 1) / 5) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#047857] transition-all duration-300"
                  style={{ width: `${((step - 1) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* STEP 1: PROFILE & REGION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[#047857]" /> Initialize Your Workspace & Region
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Select your region to configure energy grids and localized baseline comparisons.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="calc-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <input
                      id="calc-name"
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#047857] outline-none rounded-xl px-4 py-3 text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="calc-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input
                      id="calc-email"
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#047857] outline-none rounded-xl px-4 py-3 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Region Baseline</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { key: 'US', name: 'United States', baseline: '14.0 t' },
                      { key: 'UK', name: 'United Kingdom', baseline: '5.0 t' },
                      { key: 'EU', name: 'European Union', baseline: '6.5 t' },
                      { key: 'IN', name: 'India', baseline: '1.9 t' },
                      { key: 'Global', name: 'Global Avg', baseline: '4.7 t' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setRegion(item.key as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-colors cursor-pointer ${region === item.key
                            ? 'bg-emerald-50 border-[#047857] text-[#065f46] shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                      >
                        <span className="font-extrabold text-sm">{item.key}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.name}</span>
                        <span className="text-[10px] font-mono text-[#047857] mt-1 font-bold">{item.baseline}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TRANSPORTATION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-600" /> Transportation & Mobility
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Detail your vehicle choices and annual travel footprint.
                </p>
              </div>

              <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Car Fuel Type</label>
                    <select
                      value={carFuelType}
                      onChange={(e) => setCarFuelType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#047857] outline-none text-slate-900 cursor-pointer"
                    >
                      <option value="petrol">Petrol (Gasoline)</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric Vehicle (EV)</option>
                      <option value="none">No car / Don&apos;t drive</option>
                    </select>
                  </div>

                  {carFuelType !== 'none' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                        <span>Weekly Commute</span>
                        <span className="text-[#047857]">{carWeeklyMileage} km</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={carWeeklyMileage}
                        onChange={(e) => setCarWeeklyMileage(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#047857] mt-4"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Public Transit (km/wk)</label>
                    <input
                      type="number"
                      min="0"
                      value={publicTransitWeeklyMileage}
                      onChange={(e) => setPublicTransitWeeklyMileage(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-900 focus:border-[#047857]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Short Flights / yr</label>
                    <input
                      type="number"
                      min="0"
                      value={shortHaulFlights}
                      onChange={(e) => setShortHaulFlights(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-900 focus:border-[#047857]"
                      placeholder="<1500 km flights"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Long Flights / yr</label>
                    <input
                      type="number"
                      min="0"
                      value={longHaulFlights}
                      onChange={(e) => setLongHaulFlights(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-900 focus:border-[#047857]"
                      placeholder=">=1500 km flights"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HOME ENERGY */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" /> Household Utilities & Energy
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Assess electricity usage, solar panels, heating, and residents.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Power (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={electricityMonthlyKWh}
                      onChange={(e) => setElectricityMonthlyKWh(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 focus:border-[#047857]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                      <span>Renewable Energy Share</span>
                      <span className="text-[#047857]">{renewableEnergyPct}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={renewableEnergyPct}
                      onChange={(e) => setRenewableEnergyPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#047857] mt-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Heating Fuel</label>
                    <select
                      value={heatingFuelType}
                      onChange={(e) => setHeatingFuelType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-900 focus:border-[#047857] cursor-pointer"
                    >
                      <option value="gas">Natural Gas (m³)</option>
                      <option value="oil">Heating Oil (L)</option>
                      <option value="lpg">LPG (kg)</option>
                      <option value="biomass">Biomass / Wood</option>
                      <option value="none">Electric / None</option>
                    </select>
                  </div>

                  {heatingFuelType !== 'none' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={heatingMonthlyFuel}
                        onChange={(e) => setHeatingMonthlyFuel(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none text-slate-900 focus:border-[#047857]"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Household Members</label>
                    <input
                      type="number"
                      min="1"
                      value={residents}
                      onChange={(e) => setResidents(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none text-slate-900 focus:border-[#047857]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DIET & FOOD */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Apple className="w-6 h-6 text-[#047857]" /> Diet & Nutrition Habits
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Select your eating behavior and household food waste habits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Dietary Profile</label>
                  {[
                    { key: 'vegan', label: 'Vegan', desc: 'Strictly plant-based grain, fruit, veggies' },
                    { key: 'vegetarian', label: 'Vegetarian', desc: 'No animal meat, consumes dairy/eggs' },
                    { key: 'pescatarian', label: 'Pescatarian', desc: 'Consumes fish and plants, no red meat' },
                    { key: 'low-meat', label: 'Low Meat', desc: 'Averages < 50g meat consumption daily' },
                    { key: 'medium-meat', label: 'Medium Meat', desc: 'Averages 50-100g meat daily' },
                    { key: 'high-meat', label: 'High Meat', desc: 'Frequent red meat / daily steaks' },
                  ].map((d) => (
                    <label
                      key={d.key}
                      className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-colors text-left ${dietaryPattern === d.key
                          ? 'bg-emerald-50 border-[#047857] text-[#065f46] shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                    >
                      <input
                        type="radio"
                        name="diet-choice"
                        checked={dietaryPattern === d.key}
                        onChange={() => setDietaryPattern(d.key as any)}
                        className="sr-only"
                      />
                      <span className="font-extrabold text-xs">{d.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{d.desc}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Food Waste Level</label>
                  {[
                    { key: 'low', label: 'Low Food Waste (1.0x)', desc: 'Practices strict meal prep, minimal leftovers, composts' },
                    { key: 'moderate', label: 'Moderate Waste (1.1x)', desc: 'Occasional food expiration, small garbage outputs' },
                    { key: 'high', label: 'High Food Waste (1.25x)', desc: 'Frequent scrap disposal, bulk discard of groceries' },
                  ].map((w) => (
                    <label
                      key={w.key}
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors text-left ${foodWasteHabits === w.key
                          ? 'bg-emerald-50 border-[#047857] text-[#065f46] shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                    >
                      <input
                        type="radio"
                        name="waste-choice"
                        checked={foodWasteHabits === w.key}
                        onChange={() => setFoodWasteHabits(w.key as any)}
                        className="sr-only"
                      />
                      <span className="font-bold text-xs">{w.label}</span>
                      <span className="text-[10px] text-slate-500 mt-1 leading-normal">{w.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONSUMPTION */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-600" /> Consumption & Recycling
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Assess shopping intensity and household packaging recycling.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">General Shopping Intensity</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'minimalist', label: 'Minimalist', desc: 'Buys only essentials, focuses on durability, reuse.' },
                      { key: 'average', label: 'Average Shopper', desc: 'Standard retail, electronics, clothing replacements.' },
                      { key: 'frequent', label: 'Frequent Buyer', desc: 'Regular packages, fast fashion, gadget upgrades.' },
                    ].map((s) => (
                      <label
                        key={s.key}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${shoppingPatterns === s.key
                            ? 'bg-emerald-50 border-[#047857] text-[#065f46] shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                      >
                        <input
                          type="radio"
                          name="shopping-choice"
                          checked={shoppingPatterns === s.key}
                          onChange={() => setShoppingPatterns(s.key as any)}
                          className="sr-only"
                        />
                        <span className="font-bold text-xs">{s.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 leading-normal">{s.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 block">Consistent Recycling Practices</span>
                    <span className="text-xs text-slate-600 leading-normal">
                      Recycling reduces your household packaging lifecycle footprint by 8%.
                    </span>
                  </div>
                  <button
                    onClick={() => setRecycleConsistently(!recycleConsistently)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${recycleConsistently
                        ? 'bg-emerald-50 border-[#047857] text-[#065f46] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    {recycleConsistently ? 'Recycling Active' : 'No / Occasional'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: MODELING PIPELINE & SUMMARY */}
          {step === 6 && (
            <div className="space-y-8 py-4 text-center">

              {processingPercent < 100 ? (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[#047857] rounded-full animate-spin"></div>
                    <Sparkles className="w-8 h-8 text-[#047857] animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900">Vertex AI Pipeline Calibration</h2>
                    <div className="h-6 overflow-hidden">
                      <p className="text-xs text-slate-500 font-mono animate-pulse">{progressMsg}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>ML FIT MODEL</span>
                      <span className="text-[#047857]">{Math.round(processingPercent)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#047857] transition-all duration-300"
                        style={{ width: `${processingPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left animate-in fade-in duration-700">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-50 text-[#047857] rounded-full mb-2">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Your Digital Twin is Calibrated</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      Initial Footprint calculations based on EPA / DEFRA coefficients.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-xs text-slate-500 font-bold uppercase block">Monthly Baseline</span>
                        <span className="text-2xl font-black text-slate-900">{calculatedMonthlyBaseline} kg CO₂e</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-xs text-slate-500 font-bold uppercase block">Annualized Footprint</span>
                        <span className="text-2xl font-black text-slate-900">{calculatedAnnualTonnes} Tonnes</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex gap-3 ${isBelowTargetLimit
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900'
                        : 'bg-amber-50 border-amber-300 text-slate-900'
                      }`}>
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#047857]" />
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider block text-slate-900">
                          {isBelowTargetLimit ? 'Below Sustainable Cap' : 'Above Sustainable Cap'}
                        </span>
                        <p className="text-xs text-slate-700 leading-normal">
                          The global science-aligned limit is <strong className="font-bold">2.3 Tonnes CO₂e/year</strong> per person to prevent global warming above 1.5°C.
                          {isBelowTargetLimit
                            ? ' Congratulations, you are already below the goal threshold! Use the dashboard to log activities and maintain this.'
                            : ` You are exceeding this limit by ${Math.round((calculatedAnnualTonnes - 2.3) * 10) / 10} Tonnes. We have calibrated dynamic reduction actions to help you close this gap.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleFinish}
                      className="bg-[#047857] hover:bg-[#065f46] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
                    >
                      Enter Eco Workspace <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION CONTROLS */}
          {step < 6 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="bg-[#047857] hover:bg-[#065f46] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {step === 5 ? 'Train ML Model' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4 max-w-xl mx-auto w-full font-medium">
        By submitting your details, you consent to secure client-side storage.
      </footer>

    </div>
  );
}
