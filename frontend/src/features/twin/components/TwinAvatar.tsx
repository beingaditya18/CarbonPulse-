'use client';

import { TrendingDown } from 'lucide-react';

interface TwinAvatarProps {
  isTwinHealthy: boolean;
}

/**
 * TwinAvatar displays the visual SVG representation of the user's carbon twin.
 * Displays a leaf structure if healthy, or a factory smoke structure if overloaded.
 */
export function TwinAvatar({ isTwinHealthy }: TwinAvatarProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl text-center space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-zinc-500">Twin Avatar Visualizer</h3>
          <h2 className="text-base font-bold text-zinc-300 mt-0.5">Your Digital Carbon Avatar</h2>
        </div>
        <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${isTwinHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/15'}`}>
          {isTwinHealthy ? 'Optimized' : 'Overloaded'}
        </span>
      </div>

      {/* Animated SVG Twin Avatar */}
      <div className="py-8 flex items-center justify-center flex-1">
        <div className={`relative w-48 h-48 rounded-full border-2 flex items-center justify-center ${
          isTwinHealthy 
            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
            : 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5'
        }`}>
          
          {/* Glowing rotating rings */}
          <div className={`absolute inset-4 rounded-full border border-dashed animate-spin ${
            isTwinHealthy ? 'border-emerald-500/30' : 'border-red-500/30'
          }`} style={{ animationDuration: '12s' }}></div>
          <div className={`absolute inset-8 rounded-full border border-dashed animate-spin ${
            isTwinHealthy ? 'border-emerald-500/20' : 'border-red-500/20'
          }`} style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>

          {/* Core SVG wireframe icon */}
          <svg 
            viewBox="0 0 100 100" 
            className={`w-24 h-24 transition-colors duration-500 ${isTwinHealthy ? 'text-emerald-500' : 'text-red-500'}`}
          >
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="animate-pulse" />
            {isTwinHealthy ? (
              <path 
                d="M50,20 C50,20 62,35 62,55 C62,65 50,75 50,75 C50,75 38,65 38,55 C38,35 50,20 50,20 Z M50,20 L50,75 M50,40 L60,35 M50,55 L40,50" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                className="animate-bounce"
                style={{ animationDuration: '3s' }}
              />
            ) : (
              <path 
                d="M25,75 L75,75 M30,75 L30,45 L45,55 L45,45 L60,55 L60,35 L70,35 L70,75 M35,45 L35,25 M50,45 L50,20 M65,35 L65,15 M32,20 C35,22 35,18 38,20 M47,15 C50,17 50,13 53,15 M62,10 C65,12 65,8 68,10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                className="animate-pulse"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Dynamic textual analysis */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left text-xs space-y-2 leading-relaxed mt-auto">
        <h4 className="font-bold flex items-center gap-1.5 text-zinc-300">
          <TrendingDown className="w-4 h-4 text-emerald-500" /> Twin Insights
        </h4>
        <p className="text-zinc-500 font-semibold">
          {isTwinHealthy 
            ? 'Your carbon twin is currently in balance! The linear regression models show a clean downward trajectory. Continue completing challenges to maintain this status.'
            : 'Your twin is currently overloaded. High emissions from carbon activities are causing an upward slope on the regression curves. Reduce transport or shopping to restore balance.'
          }
        </p>
      </div>
    </div>
  );
}
