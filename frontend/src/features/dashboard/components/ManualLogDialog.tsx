'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { CategoryType } from '@/types/store';

interface ManualLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: CategoryType, amount: number, description: string) => void;
}

const CATEGORIES: Array<{ value: CategoryType; label: string }> = [
  { value: 'transportation', label: 'Transportation & Commutes' },
  { value: 'electricity', label: 'Household Power & Energy' },
  { value: 'food', label: 'Diet & Dining Intake' },
  { value: 'shopping', label: 'Retail & Consumer Shopping' },
  { value: 'waste', label: 'Trash Disposal & Landfill' },
];

/**
 * ManualLogDialog renders the accessible popup modal for manually entering carbon activity logs.
 */
export function ManualLogDialog({
  isOpen,
  onClose,
  onSubmit,
}: ManualLogDialogProps) {
  const [category, setCategory] = useState<CategoryType>('transportation');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Handle escape key closure
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive number for carbon emissions.');
      return;
    }

    onSubmit(category, parsedAmount, description.trim());
    
    // Reset inputs
    setCategory('transportation');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-850 cursor-pointer"
          aria-label="Close dialog modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 id="modal-title" className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-2">
          <Plus className="w-5 h-5 text-emerald-500" /> Log Carbon Activity
        </h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Manually specify your consumption habits to update your digital carbon twin model.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category SELECT */}
          <div className="space-y-1">
            <label htmlFor="log-category" className="text-xs font-semibold text-zinc-300">Category Type</label>
            <select
              id="log-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-3 py-2.5 text-xs md:text-sm text-zinc-200 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Amount INPUT */}
          <div className="space-y-1">
            <label htmlFor="log-amount" className="text-xs font-semibold text-zinc-300">Carbon Emission (kg CO₂)</label>
            <input
              id="log-amount"
              type="number"
              step="any"
              placeholder="e.g. 15.4"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-3 py-2.5 text-xs md:text-sm text-zinc-200"
              required
            />
          </div>

          {/* Description INPUT */}
          <div className="space-y-1">
            <label htmlFor="log-desc" className="text-xs font-semibold text-zinc-300">Activity Description</label>
            <input
              id="log-desc"
              type="text"
              placeholder="e.g. Weekly grocery store visit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-3 py-2.5 text-xs md:text-sm text-zinc-200"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-colors cursor-pointer mt-4"
          >
            Confirm Log Entry
          </button>
        </form>
      </div>
    </div>
  );
}
