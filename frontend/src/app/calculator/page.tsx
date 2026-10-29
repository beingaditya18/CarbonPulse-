'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarbonStore } from '@/store/useCarbonStore';
import { 
  Leaf, ArrowLeft, ArrowRight, Sparkles, Globe, 
  Car, Zap, Apple, ShoppingBag, BarChart3, AlertCircle 
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

  if (!mounted) return null;

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6">
      
      {/* HEADER */}
      <header className="max-w-2xl mx-auto w-full flex items-center gap-2 py-4 justify-center">
        <Leaf className="w-8 h-8 text-emerald-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          CarbonPulse AI+
        </span>
      </header>

      {/* QUESTIONNAIRE SHELL */}
      <main className="max-w-2xl mx-auto w-full flex-1 flex items-center justify-center py-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full shadow-2xl relative overflow-hidden transition-all duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10"></div>
          
          {step < 6 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs text-zinc-500 mb-2 uppercase font-bold tracking-wider">
                <span>Section {step} of 5</span>
                <span className="text-emerald-500">{Math.round(((step - 1) / 5) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((step - 1) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* STEP 1: PROFILE & REGION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  <Globe className="w-6 h-6 text-emerald-500" /> Initialize Your Workspace & Region
                </h1>
                <p className="text-sm text-zinc-400">
                  Select your region to configure energy grids and localized baseline comparisons.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="calc-name" className="text-sm font-semibold text-zinc-300">Full Name</label>
                    <input
                      id="calc-name"
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="calc-email" className="text-sm font-semibold text-zinc-300">Email Address</label>
                    <input
                      id="calc-email"
                      type="email"
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm text-zinc-200"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-zinc-300">Select Region Baseline</label>
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
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                          region === item.key 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-extrabold text-sm">{item.key}</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5">{item.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 mt-1 font-bold">{item.baseline}</span>
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
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-500" /> Transportation & Mobility
                </h1>
                <p className="text-sm text-zinc-400">
                  Detail your vehicle choices and annual travel footprint.
                </p>
              </div>

              <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-300">Car Fuel Type</label>
                    <select
                      value={carFuelType}
                      onChange={(e) => setCarFuelType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-zinc-300"
                    >
                      <option value="petrol">Petrol (Gasoline)</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric Vehicle (EV)</option>
                      <option value="none">No car / Don&apos;t drive</option>
                    </select>
                  </div>
                  
                  {carFuelType !== 'none' && (
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-300">Weekly Commute ({carWeeklyMileage} km)</label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={carWeeklyMileage}
                        onChange={(e) => setCarWeeklyMileage(Number(e.target.value))}
                        className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-4"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Public Transit (km/wk)</label>
                    <input
                      type="number"
                      min="0"
                      value={publicTransitWeeklyMileage}
                      onChange={(e) => setPublicTransitWeeklyMileage(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Short Flights / yr</label>
                    <input
                      type="number"
                      min="0"
                      value={shortHaulFlights}
                      onChange={(e) => setShortHaulFlights(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-300"
                      placeholder="<1500 km flights"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Long Flights / yr</label>
                    <input
                      type="number"
                      min="0"
                      value={longHaulFlights}
                      onChange={(e) => setLongHaulFlights(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-300"
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
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" /> Household Utilities & Energy
                </h1>
                <p className="text-sm text-zinc-400">
                  Assess electricity usage, solar panels, heating, and residents.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-300">Monthly Power (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={electricityMonthlyKWh}
                      onChange={(e) => setElectricityMonthlyKWh(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none text-zinc-300"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-300">Renewable energy: {renewableEnergyPct}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={renewableEnergyPct}
                      onChange={(e) => setRenewableEnergyPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Heating Fuel</label>
                    <select
                      value={heatingFuelType}
                      onChange={(e) => setHeatingFuelType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs outline-none text-zinc-300"
                    >
                      <option value="gas">Natural Gas (m³)</option>
                      <option value="oil">Heating Oil (L)</option>
                      <option value="lpg">LPG (kg)</option>
                      <option value="biomass">Biomass / Wood</option>
                      <option value="none">Electric / None</option>
                    </select>
                  </div>

                  {heatingFuelType !== 'none' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Monthly Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={heatingMonthlyFuel}
                        onChange={(e) => setHeatingMonthlyFuel(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none text-zinc-300"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Household Members</label>
                    <input
                      type="number"
                      min="1"
                      value={residents}
                      onChange={(e) => setResidents(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none text-zinc-300"
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
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  <Apple className="w-6 h-6 text-green-500" /> Diet & Nutrition Habits
                </h1>
                <p className="text-sm text-zinc-400">
                  Select your eating behavior and household food waste habits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 block">Dietary Profile</label>
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
                      className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-colors text-left ${
                        dietaryPattern === d.key 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
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
                      <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">{d.desc}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-300 block">Food Waste Level</label>
                  {[
                    { key: 'low', label: 'Low Food Waste (1.0x)', desc: 'Practices strict meal prep, minimal leftovers, composts' },
                    { key: 'moderate', label: 'Moderate Waste (1.1x)', desc: 'Occasional food expiration, small garbage outputs' },
                    { key: 'high', label: 'High Food Waste (1.25x)', desc: 'Frequent scrap disposal, bulk discard of groceries' },
                  ].map((w) => (
                    <label 
                      key={w.key} 
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors text-left ${
                        foodWasteHabits === w.key 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
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
                      <span className="text-[10px] text-zinc-500 mt-1 leading-normal">{w.desc}</span>
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
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-500" /> Consumption & Recycling
                </h1>
                <p className="text-sm text-zinc-400">
                  Assess shopping intensity and household packaging recycling.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 text-left">
                  <label className="text-sm font-semibold text-zinc-300 block">General Shopping Intensity</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'minimalist', label: 'Minimalist', desc: 'Buys only essentials, focuses on durability, reuse.' },
                      { key: 'average', label: 'Average Shopper', desc: 'Standard retail, electronics, clothing replacements.' },
                      { key: 'frequent', label: 'Frequent Buyer', desc: 'Regular packages, fast fashion, gadget upgrades.' },
                    ].map((s) => (
                      <label 
                        key={s.key}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${
                          shoppingPatterns === s.key 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
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
                        <span className="text-[10px] text-zinc-500 mt-1 leading-normal">{s.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-zinc-200 block">Consistent Recycling Practices</span>
                    <span className="text-xs text-zinc-500 leading-normal">
                      Recycling reduces your household packaging lifecycle footprint by 8%.
                    </span>
                  </div>
                  <button
                    onClick={() => setRecycleConsistently(!recycleConsistently)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      recycleConsistently 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
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
                      <span>ML FIT MODEL</span>
                      <span>{Math.round(processingPercent)}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${processingPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left animate-in fade-in duration-700">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-2">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black">Your Digital Twin is Calibrated</h2>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                      Initial Footprint calculations based on DEFRA coefficients.
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                      <div>
                        <span className="text-xs text-zinc-500 font-bold uppercase block">Monthly Baseline</span>
                        <span className="text-2xl font-extrabold text-white">{calculatedMonthlyBaseline} kg CO₂e</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="text-xs text-zinc-500 font-bold uppercase block">Annualized Footprint</span>
                        <span className="text-2xl font-extrabold text-white">{calculatedAnnualTonnes} Tonnes</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex gap-3 ${
                      isBelowTargetLimit 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                    }`}>
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider block">
                          {isBelowTargetLimit ? 'Below Sustainable Cap' : 'Above Sustainable Cap'}
                        </span>
                        <p className="text-xs text-zinc-300 leading-normal">
                          The global science-aligned limit is **2.3 Tonnes CO₂e/year** per person to prevent global warming above 1.5°C.
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer animate-bounce"
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
            <div className="flex items-center justify-between border-t border-zinc-800 pt-6 mt-8">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {step === 5 ? 'Train ML Model' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center text-xs text-zinc-600 py-4 max-w-xl mx-auto w-full">
        By submitting your details, you consent to secure client-side encryption.
      </footer>

    </div>
  );
}
