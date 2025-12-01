/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { BuildingType, CityStats, AIGoal, NewsItem, TOOL_UPGRADE } from '../types';
import { BUILDINGS, UPGRADE_COST_MULTIPLIER } from '../constants';
import { WeatherState } from '../hardcodedContent';

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: string;
  onSelectTool: (type: string) => void;
  currentGoal: AIGoal | null;
  newsFeed: NewsItem[];
  onClaimReward: () => void;
  onOpenQuiz: () => void;
  weather: WeatherState;
}

const tools = [
  BuildingType.None, // Bulldoze
  TOOL_UPGRADE,
  BuildingType.Road,
  BuildingType.Residential,
  BuildingType.Commercial,
  BuildingType.Industrial,
  BuildingType.Park,
  BuildingType.School,
  BuildingType.PowerPlant,
  BuildingType.Hospital,
  BuildingType.Library,
  BuildingType.Museum,
  BuildingType.Police,
  BuildingType.FireStation,
  BuildingType.Stadium,
];

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
    label = 'UPGRADE';
    color = '#c084fc';
    costText = `x${UPGRADE_COST_MULTIPLIER}`;
  } else {
    config = BUILDINGS[type as BuildingType];
    label = config.name;
    color = config.color;
    costText = config.cost > 0 ? `$${config.cost}` : '';
    disabled = !isBulldoze && money < config.cost;
  }
  
  // Use 3D color for preview
  const bgColor = isBulldoze || isUpgrade ? 'transparent' : color;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center rounded-lg border-2 transition-all shadow-lg backdrop-blur-sm flex-shrink-0
        w-14 h-14 md:w-16 md:h-16
        ${isSelected ? 'border-white bg-white/20 scale-110 z-10' : 'border-gray-600 bg-gray-900/80 hover:bg-gray-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="w-6 h-6 md:w-8 md:h-8 rounded mb-0.5 md:mb-1 border border-black/30 shadow-inner flex items-center justify-center overflow-hidden" style={{ backgroundColor: bgColor }}>
        {isBulldoze && <div className="w-full h-full bg-red-600 text-white flex justify-center items-center font-bold text-base md:text-lg">✕</div>}
        {isUpgrade && <div className="w-full h-full bg-purple-600 text-white flex justify-center items-center font-bold text-base md:text-lg">⬆</div>}
        {type === BuildingType.Road && <div className="w-full h-2 bg-gray-800 transform -rotate-45"></div>}
      </div>
      <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider drop-shadow-md leading-none text-center px-1">{label}</span>
      {costText && (
        <span className={`text-[8px] md:text-[9px] font-mono leading-none ${disabled ? 'text-red-400' : 'text-green-300'}`}>{costText}</span>
      )}
    </button>
  );
};

const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  onClaimReward,
  onOpenQuiz,
  weather
}) => {
  const newsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll news
  useEffect(() => {
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [newsFeed]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-4 font-sans z-10">
      
      {/* Top Bar: Stats & Goal */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start pointer-events-auto gap-2 w-full max-w-full">
        
        {/* Stats */}
        <div className="bg-gray-900/90 text-white p-2 md:p-3 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md flex gap-2 md:gap-4 items-center justify-between md:justify-start w-full md:w-auto overflow-x-auto">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest">Treasury</span>
            <span className="text-lg md:text-2xl font-black text-green-400 font-mono drop-shadow-md">${stats.money.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 md:h-8 bg-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest">Citizens</span>
            <span className="text-base md:text-xl font-bold text-blue-300 font-mono drop-shadow-md">{stats.population.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 md:h-8 bg-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest">Weather</span>
            <span className="text-base md:text-xl font-bold text-yellow-300 drop-shadow-md">{weather.emoji} {weather.type}</span>
          </div>
          <div className="w-px h-6 md:h-8 bg-gray-700"></div>

          {/* Quiz Button - Major Call to Action */}
          <button
             onClick={onOpenQuiz}
             className="flex flex-col items-center bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 px-3 py-1 rounded-lg border border-indigo-400 shadow-lg animate-pulse hover:animate-none transition-transform active:scale-95"
          >
             <span className="text-[8px] md:text-[10px] text-indigo-100 uppercase font-bold tracking-widest">Work Shift</span>
             <span className="text-sm md:text-lg font-bold text-white flex gap-1 items-center">
                <span>Earn 💵</span>
             </span>
          </button>
        </div>

        {/* City Goal Panel */}
        <div className="w-full md:w-80 bg-indigo-900/90 text-white rounded-xl border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md overflow-hidden transition-all">
          <div className="bg-indigo-800/80 px-3 md:px-4 py-1.5 md:py-2 flex justify-between items-center border-b border-indigo-600">
            <span className="font-bold uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              City Goals
            </span>
          </div>

          <div className="p-3 md:p-4">
            {currentGoal ? (
              <>
                <p className="text-xs md:text-sm font-medium text-indigo-100 mb-2 md:mb-3 leading-tight drop-shadow">"{currentGoal.description}"</p>

                <div className="flex justify-between items-center mt-1 md:mt-2 bg-indigo-950/60 p-1.5 md:p-2 rounded-lg border border-indigo-700/50">
                  <div className="text-[10px] md:text-xs text-gray-300">
                    Goal: <span className="font-mono font-bold text-white">
                      {currentGoal.targetType === 'building_count' ? BUILDINGS[currentGoal.buildingType!].name :
                       currentGoal.targetType === 'money' ? '$' : 'Pop.'} {currentGoal.targetValue}
                    </span>
                  </div>
                  <div className="text-[10px] md:text-xs text-yellow-300 font-bold font-mono bg-yellow-900/50 px-2 py-0.5 rounded border border-yellow-600/50">
                    +${currentGoal.reward}
                  </div>
                </div>

                {currentGoal.completed && (
                  <button
                    onClick={onClaimReward}
                    className="mt-2 md:mt-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-1.5 md:py-2 px-4 rounded shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all animate-bounce text-xs md:text-sm uppercase tracking-wide border border-green-400/50"
                  >
                    Collect Reward
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs md:text-sm text-gray-400 py-2 italic">
                Loading next goal...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Tools & News */}
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-end pointer-events-auto mt-auto gap-2 w-full max-w-full">
        
        <div className="flex gap-1 md:gap-2 bg-gray-900/80 p-1 md:p-2 rounded-2xl border border-gray-600/50 backdrop-blur-xl shadow-2xl w-full md:w-auto overflow-x-auto no-scrollbar justify-start md:justify-start">
          <div className="flex gap-1 md:gap-2 min-w-max px-1">
            {tools.map((type) => (
              <ToolButton
                key={type}
                type={type}
                isSelected={selectedTool === type}
                onClick={() => onSelectTool(type)}
                money={stats.money}
              />
            ))}
          </div>
          <div className="text-[8px] text-gray-500 uppercase writing-mode-vertical flex items-center justify-center font-bold tracking-widest border-l border-gray-700 pl-1 ml-1 select-none">Build</div>
        </div>

        {/* News Feed */}
        <div className="w-full md:w-80 h-32 md:h-48 bg-black/80 text-white rounded-xl border border-gray-700/80 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden relative">
          <div className="bg-gray-800/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 border-b border-gray-600 flex justify-between items-center">
            <span>City Feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          </div>
          
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30 z-20"></div>
          
          <div ref={newsRef} className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 text-[10px] md:text-xs font-mono scroll-smooth mask-image-b z-10">
            {newsFeed.length === 0 && <div className="text-gray-500 italic text-center mt-10">No active news stream.</div>}
            {newsFeed.map((news) => (
              <div key={news.id} className={`
                border-l-2 pl-2 py-1 transition-all animate-fade-in leading-tight relative
                ${news.type === 'positive' ? 'border-green-500 text-green-200 bg-green-900/20' : ''}
                ${news.type === 'negative' ? 'border-red-500 text-red-200 bg-red-900/20' : ''}
                ${news.type === 'neutral' ? 'border-blue-400 text-blue-100 bg-blue-900/20' : ''}
              `}>
                <span className="opacity-70 text-[8px] absolute top-0.5 right-1">{new Date(Number(news.id.split('.')[0])).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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