
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (aiEnabled: boolean) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-stone-100 font-serif p-6 bg-black/80 backdrop-blur-sm">
      <div className="max-w-xl w-full bg-stone-900 p-10 rounded-sm border-4 border-double border-yellow-700 shadow-2xl relative text-center">
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-yellow-600 uppercase tracking-widest drop-shadow-lg font-serif">
            Roma Aeterna
        </h1>
        <div className="w-24 h-1 bg-yellow-700 mx-auto mb-4"></div>
        <p className="text-stone-400 mb-10 text-lg uppercase tracking-widest">
            Grammar Edition
        </p>

        <p className="text-stone-300 mb-8 italic leading-relaxed">
            "To build the Empire, one must master the language. Construct your city, manage your citizens, and prove your knowledge of the past to the Senate."
        </p>

        <div className="bg-stone-800/50 p-6 rounded border border-stone-700 mb-8 hover:border-yellow-600/50 transition-colors">
            <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col gap-1 text-left">
                <span className="font-bold text-lg text-stone-200 group-hover:text-white transition-colors flex items-center gap-2">
                    Oracle AI
                    {aiEnabled && <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                </span>
                <span className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors">
                    Enable dynamic quests from the Gods (Gemini API)
                </span>
                </div>
                
                <input 
                    type="checkbox" 
                    className="accent-yellow-600 w-6 h-6"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                />
            </label>
        </div>

        <button 
            onClick={() => onStart(aiEnabled)}
            className="w-full py-5 bg-red-900 hover:bg-red-800 text-white font-bold rounded shadow-[0_5px_0_rgb(69,10,10)] active:translate-y-[5px] active:shadow-none transition-all text-xl uppercase tracking-widest border border-red-700"
        >
            Enter the City
        </button>

      </div>
    </div>
  );
};

export default StartScreen;
