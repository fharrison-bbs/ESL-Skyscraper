
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { BuildingType, CityStats, AIGoal, NewsItem, TOOL_UPGRADE, BuildingConfig } from '../types';
import { BUILDINGS, UPGRADE_COST_MULTIPLIER } from '../constants';

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: string;
  onSelectTool: (type: string) => void;
  currentGoal: AIGoal | null;
  newsFeed: NewsItem[];
  onClaimReward: () => void;
  isGeneratingGoal: boolean;
  aiEnabled: boolean;
  onOpenQuiz: (topic?: string) => void;
}

const CATEGORIES = {
  "Infrastructure": [BuildingType.Road, BuildingType.Aqueduct, BuildingType.None, TOOL_UPGRADE],
  "Civilian": [BuildingType.Domus, BuildingType.Insula, BuildingType.Market, BuildingType.Works],
  "Grammar": [BuildingType.Forum, BuildingType.Baths, BuildingType.Colosseum, BuildingType.Senate],
};

const ToolButton: React.FC<{
  type: string;
  isSelected: boolean;
  onClick: () => void;
  money: number;
}> = ({ type, isSelected, onClick, money }) => {
  const isBulldoze = type === BuildingType.None;
  const isUpgrade = type === TOOL_UPGRADE;

  let config;
  let label;
  let color;
  let costText;
  let disabled = false;

  if (isUpgrade) {
    label = 'RENOVATE';
    color = '#a855f7';
    costText = `x${UPGRADE_COST_MULTIPLIER}`;
  } else {
    config = BUILDINGS[type as BuildingType];
    label = config.name;
    color = config.color;
    costText = config.cost > 0 ? `${config.cost} Dn.` : '';
    disabled = !isBulldoze && money < config.cost;
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center rounded-md border-2 transition-all shadow-md
        w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
        ${isSelected ? 'border-yellow-400 bg-stone-800 scale-105 z-10' : 'border-stone-600 bg-stone-900/90 hover:bg-stone-800'}
        ${disabled ? 'opacity-50 grayscale' : 'cursor-pointer'}
      `}
    >
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm mb-1 shadow-inner flex items-center justify-center border border-black/50" style={{ backgroundColor: color }}>
        {isBulldoze && <span className="text-white text-xl font-bold">✕</span>}
        {isUpgrade && <span className="text-white text-xl font-bold">⬆</span>}
      </div>
      <span className="text-[10px] md:text-xs font-serif font-bold text-stone-200 uppercase tracking-widest text-center px-1 leading-none">{label}</span>
      {costText && (
        <span className={`text-[9px] md:text-[10px] font-mono mt-1 ${disabled ? 'text-red-400' : 'text-yellow-400'}`}>{costText}</span>
      )}
    </button>
  );
};

const GuideButton = ({ category }: { category: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Determine content based on category
    let content = "";
    if (category === "Grammar") content = "These buildings unlock specific grammar training. Forum = Past Simple. Baths = Past Continuous. Senate = Subordinate Clauses.";
    else if (category === "Civilian") content = "Homes (Domus/Insula) increase citizens. Markets and Works generate Denarii.";
    else content = "Roads connect your city. Aqueducts provide beauty. Renovate to improve output.";

    return (
        <div className="relative inline-block ml-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-6 h-6 rounded-full bg-yellow-600 text-white font-serif font-bold flex items-center justify-center text-xs hover:bg-yellow-500 shadow-sm border border-yellow-400"
            >
                ?
            </button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                <div className="absolute bottom-full left-0 mb-2 w-48 md:w-64 bg-stone-100 text-stone-900 p-3 rounded border-2 border-yellow-600 shadow-xl z-50 text-xs md:text-sm font-serif">
                    <p>{content}</p>
                </div>
                </>
            )}
        </div>
    );
};

const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  onClaimReward,
  isGeneratingGoal,
  aiEnabled,
  onOpenQuiz
}) => {
  const newsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Civilian");

  useEffect(() => {
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [newsFeed]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-6 font-serif z-10 text-stone-100">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start pointer-events-auto gap-4 w-full">
        
        {/* Resource Display */}
        <div className="bg-stone-900/95 border-2 border-stone-600 rounded-lg p-3 md:p-4 shadow-2xl flex gap-6 items-center">
            <div className="text-center">
                <div className="text-[10px] uppercase text-stone-400 tracking-[0.2em] mb-1">Denarii</div>
                <div className="text-xl md:text-2xl font-bold text-yellow-500">{stats.money.toLocaleString()}</div>
            </div>
            <div className="w-px h-8 bg-stone-700"></div>
            <div className="text-center">
                <div className="text-[10px] uppercase text-stone-400 tracking-[0.2em] mb-1">Citizens</div>
                <div className="text-xl md:text-2xl font-bold text-stone-300">{stats.population.toLocaleString()}</div>
            </div>
            
            <button 
                onClick={() => onOpenQuiz()}
                className="ml-4 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white border-2 border-red-500 rounded px-4 py-2 shadow-[0_4px_0_rgb(69,10,10)] active:shadow-none active:translate-y-[4px] transition-all"
            >
                <div className="text-[10px] uppercase tracking-widest opacity-80">Perform Duty</div>
                <div className="font-bold flex items-center gap-2">
                    <span>Earn Denarii</span>
                </div>
            </button>
        </div>

        {/* Quest / Goal */}
        <div className="bg-stone-900/95 border-2 border-purple-900 rounded-lg p-3 md:p-4 shadow-2xl w-full md:w-80 relative overflow-hidden">
             {/* Decorative Laurel */}
             <div className="absolute -right-4 -top-4 text-purple-900/20 text-9xl">🌿</div>
             
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Senate Decree</span>
                 {isGeneratingGoal && <span className="text-[10px] animate-pulse">Consulting Oracles...</span>}
             </div>
             
             {currentGoal ? (
                 <>
                    <p className="text-sm italic text-stone-300 mb-3">"{currentGoal.description}"</p>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400">Target: {currentGoal.targetType === 'money' ? 'Denarii' : 'Pop.'} {currentGoal.targetValue}</span>
                        <span className="text-yellow-500 font-bold">Reward: {currentGoal.reward} Dn.</span>
                    </div>
                    {currentGoal.completed && (
                        <button onClick={onClaimReward} className="mt-3 w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded uppercase text-xs tracking-widest animate-bounce">
                            Claim Bounty
                        </button>
                    )}
                 </>
             ) : (
                 <div className="text-xs text-stone-500 italic">No active decree.</div>
             )}
        </div>
      </div>

      {/* Bottom Interface */}
      <div className="flex flex-col-reverse lg:flex-row items-end justify-between pointer-events-auto mt-auto gap-4 w-full">
        
        {/* Toolbelt */}
        <div className="w-full lg:w-auto bg-stone-900/95 border-t-2 md:border-2 border-stone-600 rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex bg-stone-950 border-b border-stone-700">
                {Object.keys(CATEGORIES).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === cat ? 'bg-stone-800 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Icons */}
            <div className="p-3 md:p-4 flex items-center gap-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max mx-auto">
                    {CATEGORIES[activeTab as keyof typeof CATEGORIES].map((type) => (
                        <ToolButton
                            key={type}
                            type={type}
                            isSelected={selectedTool === type}
                            onClick={() => onSelectTool(type)}
                            money={stats.money}
                        />
                    ))}
                </div>
                <GuideButton category={activeTab} />
            </div>
        </div>

        {/* News Scroll */}
        <div className="hidden md:flex flex-col w-64 bg-stone-900/80 border-2 border-stone-700 rounded-lg p-3 backdrop-blur-md">
            <div className="text-[10px] uppercase text-stone-500 tracking-widest mb-2 border-b border-stone-700 pb-1">Forum News</div>
            <div ref={newsRef} className="h-32 overflow-y-auto font-serif text-xs space-y-2 text-stone-300">
                {newsFeed.length === 0 && <span className="opacity-50 italic">The city is quiet...</span>}
                {newsFeed.map(news => (
                    <div key={news.id} className={`border-l-2 pl-2 ${news.type === 'negative' ? 'border-red-800' : 'border-green-800'}`}>
                        {news.text}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
