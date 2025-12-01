/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-sans p-6 bg-black/30 backdrop-blur-sm transition-all duration-1000">
      <div className="max-w-md w-full bg-slate-900/90 p-8 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-fade-in">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent tracking-tight text-center">
            Pharaoh's Kingdom
            </h1>
            <p className="text-slate-400 mb-8 text-sm font-medium uppercase tracking-widest text-center">
            Past Simple & Past Continuous
            </p>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 mb-8 shadow-inner">
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 text-lg">🏛️</span>
                  <span>Build a mighty Egyptian settlement along the Nile</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-lg">📜</span>
                  <span>Complete grammar scrolls to earn gold</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-lg">👑</span>
                  <span>Fulfill the pharaoh's decrees for rewards</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">☀️</span>
                  <span>Experience the desert climate</span>
                </div>
              </div>
            </div>

            <button
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] text-lg tracking-wide"
            >
            Begin Your Reign
            </button>

        </div>
      </div>
    </div>
  );
};

export default StartScreen;