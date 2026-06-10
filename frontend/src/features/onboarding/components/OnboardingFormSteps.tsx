'use client';

import { User, Zap, Car, Apple, ShoppingBag, Trash } from 'lucide-react';

interface OnboardingFormStepsProps {
  step: number;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  energy: number;
  setEnergy: (v: number) => void;
  transit: number;
  setTransit: (v: number) => void;
  diet: number;
  setDiet: (v: number) => void;
  shopping: number;
  setShopping: (v: number) => void;
  waste: number;
  setWaste: (v: number) => void;
}

/**
 * OnboardingFormSteps renders step form cards (1-6) for the onboarding questionnaire.
 */
export function OnboardingFormSteps({
  step,
  name,
  setName,
  email,
  setEmail,
  energy,
  setEnergy,
  transit,
  setTransit,
  diet,
  setDiet,
  shopping,
  setShopping,
  waste,
  setWaste,
}: OnboardingFormStepsProps) {
  switch (step) {
    case 1:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-500" /> Let&apos;s initialize your profile
            </h1>
            <p className="text-sm text-zinc-400">
              Welcome to CarbonPulse AI+. Enter your credentials to configure your enterprise carbon workspace.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name-input" className="text-sm font-semibold text-zinc-300">Full Name</label>
              <input
                id="name-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm transition-colors text-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email-input" className="text-sm font-semibold text-zinc-300">Email Address</label>
              <input
                id="email-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm transition-colors text-zinc-200"
              />
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" /> Utility Power & Electricity
            </h1>
            <p className="text-sm text-zinc-400">
              Estimate your average monthly household power consumption.
            </p>
          </div>
          <div className="space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">Electricity Bill Average</span>
                <span className="font-bold text-emerald-500">${energy} / month</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Electricity Bill Average slider"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Low conservation ($10)</span>
                <span>High consumption ($300+)</span>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/5 text-yellow-500/80 rounded-xl text-xs border border-yellow-500/10 leading-relaxed">
              💡 Power grids generate massive carbon footprints based on generation sources. Switching to clean energy options saves up to 1.5 tons of CO₂ annually.
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-500" /> Transportation & Mobility
            </h1>
            <p className="text-sm text-zinc-400">
              Estimate the average miles you drive per week in a fuel-powered vehicle.
            </p>
          </div>
          <div className="space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">Weekly Driving Distance</span>
                <span className="font-bold text-emerald-500">{transit} miles / wk</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={transit}
                onChange={(e) => setTransit(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Weekly Driving Distance slider"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>No driving (0 miles)</span>
                <span>Heavy commute (300+ miles)</span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 text-blue-500/80 rounded-xl text-xs border border-blue-500/10 leading-relaxed">
              🚘 Combustion engines are the single largest source of individual carbon emissions, averaging 0.4 kg CO₂ per mile driven.
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Apple className="w-6 h-6 text-green-500" /> Diet & Nutrition
            </h1>
            <p className="text-sm text-zinc-400">
              Select the description that best fits your daily diet layout.
            </p>
          </div>
          <div className="space-y-3 py-2" role="radiogroup" aria-label="Diet & Nutrition choices">
            {[
              { value: 4, label: 'Plant-based (Vegan/Vegetarian)', desc: 'Grains, legumes, vegetables, fruits. Zero animal meats.' },
              { value: 3, label: 'Veggie-forward (Flexitarian)', desc: 'Primarily plant foods, occasional poultry or dairy.' },
              { value: 2, label: 'Balanced diet', desc: 'Average intake of beef, pork, chicken, dairy, and greens.' },
              { value: 1, label: 'Heavy meat consumption', desc: 'Frequent red meat, beef, and processed dairy.' },
            ].map((item) => (
              <label 
                key={item.value}
                htmlFor={`diet-${item.value}`}
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${diet === item.value ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
              >
                <input
                  type="radio"
                  id={`diet-${item.value}`}
                  name="diet-option"
                  checked={diet === item.value}
                  onChange={() => setDiet(item.value)}
                  className="sr-only"
                />
                <span className="font-bold text-sm">{item.label}</span>
                <span className="text-xs text-zinc-400 mt-1">{item.desc}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-purple-500" /> Consumer Shopping Habits
            </h1>
            <p className="text-sm text-zinc-400">
              How many non-essential purchases (clothes, gadgets, decor) do you buy monthly?
            </p>
          </div>
          <div className="space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">Purchased Items</span>
                <span className="font-bold text-emerald-500">{shopping} items / month</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={shopping}
                onChange={(e) => setShopping(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Purchased Items slider"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Minimalist (0 items)</span>
                <span>Frequent packages (25+ items)</span>
              </div>
            </div>
            <div className="p-4 bg-purple-500/5 text-purple-500/80 rounded-xl text-xs border border-purple-500/10 leading-relaxed">
              📦 Manufacturing, long-haul shipping, and return delivery logistics contribute significantly to global shipping container vessel emissions.
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Trash className="w-6 h-6 text-teal-500" /> Waste & Recycling
            </h1>
            <p className="text-sm text-zinc-400">
              What percentage of your recyclable household materials do you compost or recycle?
            </p>
          </div>
          <div className="space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">Recycling Ratio</span>
                <span className="font-bold text-emerald-500">{waste}% recycled</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={waste}
                onChange={(e) => setWaste(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-500/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Recycling Ratio slider"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Zero recycling (0%)</span>
                <span>Full waste diversion (100%)</span>
              </div>
            </div>
            <div className="p-4 bg-teal-500/5 text-teal-500/80 rounded-xl text-xs border border-teal-500/10 leading-relaxed">
              ♻️ Organic food waste dumped in landfills decays anaerobically, generating methane, a greenhouse gas 25 times more potent than carbon dioxide.
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
