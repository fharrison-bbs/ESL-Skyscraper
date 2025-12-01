/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem, TOOL_UPGRADE, QuizQuestion } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_MONEY, QUIZ_REWARD_BASE, UPGRADE_COST_MULTIPLIER } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import QuizModal from './components/QuizModal';
import { getNextCityGoal, getRandomNews, getRandomWeather, WeatherState } from './hardcodedContent';
import { getRandomQuestion } from './questionBank';

// Initialize empty grid with island shape generation for 3D visual interest
const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  const center = GRID_SIZE / 2;
  // const radius = GRID_SIZE / 2 - 1;

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Simple circle crop for island look
      // const dist = Math.sqrt((x-center)*(x-center) + (y-center)*(y-center));
      
      row.push({ x, y, buildingType: BuildingType.None, level: 1, damaged: false });
    }
    grid.push(row);
  }
  return grid;
};

function App() {
  // --- Game State ---
  const [gameStarted, setGameStarted] = useState(false);

  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ money: INITIAL_MONEY, population: 0, day: 1, grammarScore: 0 });
  const [selectedTool, setSelectedTool] = useState<string>(BuildingType.Road);

  // --- Goal State ---
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);

  // --- Weather State ---
  const [weather, setWeather] = useState<WeatherState>(getRandomWeather());

  // --- Quiz State ---
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Refs for accessing state inside intervals without dependencies
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);

  // Sync refs
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);

  // --- Content Functions ---

  const addNewsItem = useCallback((item: NewsItem) => {
    setNewsFeed(prev => [...prev.slice(-12), item]); // Keep last few
  }, []);

  const fetchNewGoal = useCallback(() => {
    const newGoal = getNextCityGoal(statsRef.current, gridRef.current);
    setCurrentGoal(newGoal);
  }, []);

  const generateNews = useCallback(() => {
    // 10% chance to generate news per tick
    if (Math.random() > 0.1) return;
    const news = getRandomNews();
    addNewsItem(news);
  }, [addNewsItem]);

  const changeWeather = useCallback(() => {
    // Change weather every ~30 ticks (1 minute)
    if (Math.random() > 0.033) return;
    const newWeather = getRandomWeather();
    setWeather(newWeather);
    addNewsItem({
      id: Date.now().toString(),
      text: `Weather update: ${newWeather.description}`,
      type: 'neutral'
    });
  }, [addNewsItem]);

  const handleOpenQuiz = () => {
    setShowQuiz(true);
    setQuizLoading(true);
    setQuizQuestion(null);

    // Simulate a short delay for better UX
    setTimeout(() => {
      const q = getRandomQuestion();
      setQuizQuestion(q);
      setQuizLoading(false);
    }, 300);
  };

  const handleQuizAnswer = (correct: boolean) => {
    setShowQuiz(false);
    if (correct) {
      // Calculate reward based on number of schools
      let schoolCount = 0;
      gridRef.current.flat().forEach(t => { if (t.buildingType === BuildingType.School) schoolCount++; });
      const multiplier = 1 + (schoolCount * 0.5);
      const reward = Math.round(QUIZ_REWARD_BASE * multiplier);
      
      setStats(prev => ({ 
        ...prev, 
        money: prev.money + reward,
        grammarScore: prev.grammarScore + 1
      }));
      addNewsItem({ id: Date.now().toString(), text: `Task completed! Earned $${reward}.`, type: 'positive' });
    } else {
       addNewsItem({ id: Date.now().toString(), text: `Paperwork rejected. No funds awarded.`, type: 'negative' });
    }
  };

  // --- Initial Setup ---
  useEffect(() => {
    if (!gameStarted) return;
    addNewsItem({ id: Date.now().toString(), text: "Welcome to Sky Metropolis! Build schools to increase contract rewards.", type: 'positive' });
    fetchNewGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);


  // --- Game Loop ---
  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      let dailyIncome = 0;
      let dailyPopGrowth = 0;
      let buildingCounts: Record<string, number> = {};

      gridRef.current.flat().forEach(tile => {
        if (tile.buildingType !== BuildingType.None) {
          const config = BUILDINGS[tile.buildingType];
          
          // Levels boost stats. Damage halts production.
          const multiplier = tile.damaged ? 0 : tile.level;
          
          dailyIncome += config.incomeGen * multiplier;
          dailyPopGrowth += config.popGen * multiplier;
          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      // Special interactions
      if (buildingCounts[BuildingType.PowerPlant] > 0) {
        // Boost industrial income by 50% for each power plant
        const indIncome = (buildingCounts[BuildingType.Industrial] || 0) * BUILDINGS[BuildingType.Industrial].incomeGen;
        // The loop already added base income. We add the bonus here.
      }

      const resCount = buildingCounts[BuildingType.Residential] || 0;
      const maxPop = resCount * 50; 

      setStats(prev => {
        let newPop = prev.population + dailyPopGrowth;
        if (newPop > maxPop) newPop = maxPop;
        if (resCount === 0 && prev.population > 0) newPop = Math.max(0, prev.population - 5);

        const newStats = {
          ...prev,
          money: prev.money + dailyIncome,
          population: newPop,
          day: prev.day + 1,
        };

        const goal = goalRef.current;
        if (goal && !goal.completed) {
          let isMet = false;
          if (goal.targetType === 'money' && newStats.money >= goal.targetValue) isMet = true;
          if (goal.targetType === 'population' && newStats.population >= goal.targetValue) isMet = true;
          if (goal.targetType === 'building_count' && goal.buildingType) {
            if ((buildingCounts[goal.buildingType] || 0) >= goal.targetValue) isMet = true;
          }

          if (isMet) {
            setCurrentGoal({ ...goal, completed: true });
          }
        }

        return newStats;
      });

      // Natural Disasters
      if (Math.random() < 0.01) { // 1% chance per tick
        const occupiedTiles = gridRef.current.flat().filter(t => t.buildingType !== BuildingType.None && t.buildingType !== BuildingType.Road);
        
        if (occupiedTiles.length > 0) {
            const rand = Math.random();
            let disasterType = 'Fire';
            if (rand > 0.6) disasterType = 'Meteor';
            if (rand > 0.8) disasterType = 'Earthquake';
            
            const centerTile = occupiedTiles[Math.floor(Math.random() * occupiedTiles.length)];

            if (disasterType === 'Fire') {
                addNewsItem({id: Date.now().toString(), text: `🔥 Fire reported at a ${BUILDINGS[centerTile.buildingType].name}!`, type: 'negative'});
                 setGrid(prev => {
                    const newGrid = prev.map(row => [...row]);
                    newGrid[centerTile.y][centerTile.x] = { ...centerTile, damaged: true };
                    return newGrid;
                });
            } else if (disasterType === 'Meteor') {
                 addNewsItem({id: Date.now().toString(), text: `☄️ Meteor strike on a ${BUILDINGS[centerTile.buildingType].name}!`, type: 'negative'});
                 setGrid(prev => {
                    const newGrid = prev.map(row => [...row]);
                    newGrid[centerTile.y][centerTile.x] = { ...centerTile, buildingType: BuildingType.None, level: 1, damaged: false };
                    return newGrid;
                });
            } else if (disasterType === 'Earthquake') {
                 addNewsItem({id: Date.now().toString(), text: `📉 Earthquake hitting the district!`, type: 'negative'});
                 setGrid(prev => {
                    const newGrid = prev.map(row => [...row]);
                    // Affect 3x3 area
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = centerTile.y + dy;
                            const nx = centerTile.x + dx;
                            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
                                const tile = newGrid[ny][nx];
                                if (tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road) {
                                    // 70% chance to damage, 10% chance to destroy
                                    const damageRoll = Math.random();
                                    if (damageRoll < 0.1) {
                                         newGrid[ny][nx] = { ...tile, buildingType: BuildingType.None, level: 1, damaged: false };
                                    } else if (damageRoll < 0.8) {
                                         newGrid[ny][nx] = { ...tile, damaged: true };
                                    }
                                }
                            }
                        }
                    }
                    return newGrid;
                });
            }
        }
    }

      generateNews();
      changeWeather();

    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [generateNews, changeWeather, gameStarted]);


  // --- Interaction Logic ---

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return;

    const currentGrid = gridRef.current;
    const currentStats = statsRef.current;
    const tool = selectedTool;
    
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const currentTile = currentGrid[y][x];

    // Bulldoze
    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        const demolishCost = 5;
        if (currentStats.money >= demolishCost) {
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[y][x] = { ...currentTile, buildingType: BuildingType.None, level: 1, damaged: false };
            setGrid(newGrid);
            setStats(prev => ({ ...prev, money: prev.money - demolishCost }));
        } else {
            addNewsItem({id: Date.now().toString(), text: "Cannot afford demolition costs.", type: 'negative'});
        }
      }
      return;
    }

    // Upgrade / Repair
    if (tool === TOOL_UPGRADE) {
      if (currentTile.buildingType !== BuildingType.None && currentTile.buildingType !== BuildingType.Road) {
        const config = BUILDINGS[currentTile.buildingType];
        
        // If damaged, cost is 50% of base cost to repair. If fine, cost is upgrade logic.
        let action = 'upgrade';
        let cost = 0;

        if (currentTile.damaged) {
            action = 'repair';
            cost = Math.round(config.cost * 0.5);
        } else {
            cost = Math.round(config.cost * UPGRADE_COST_MULTIPLIER * currentTile.level);
        }
        
        if (currentStats.money >= cost) {
          const newGrid = currentGrid.map(row => [...row]);
          
          if (action === 'repair') {
             newGrid[y][x] = { ...currentTile, damaged: false }; // Just repair
             addNewsItem({id: Date.now().toString(), text: `Repaired ${config.name}.`, type: 'positive'});
          } else {
             newGrid[y][x] = { ...currentTile, level: currentTile.level + 1 };
          }
          
          setGrid(newGrid);
          setStats(prev => ({ ...prev, money: prev.money - cost }));
        } else {
          addNewsItem({id: Date.now().toString(), text: `Need $${cost} to ${action}.`, type: 'negative'});
        }
      }
      return;
    }

    // Placement
    if (currentTile.buildingType === BuildingType.None) {
      const buildingConfig = BUILDINGS[tool as BuildingType];
      if (currentStats.money >= buildingConfig.cost) {
        setStats(prev => ({ ...prev, money: prev.money - buildingConfig.cost }));
        
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, buildingType: tool as BuildingType, level: 1, damaged: false };
        setGrid(newGrid);
      } else {
        addNewsItem({id: Date.now().toString() + Math.random(), text: `Treasury insufficient for ${buildingConfig.name}.`, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameStarted]);

  const handleClaimReward = () => {
    if (currentGoal && currentGoal.completed) {
      setStats(prev => ({ ...prev, money: prev.money + currentGoal.reward }));
      addNewsItem({id: Date.now().toString(), text: `Goal achieved! Reward claimed.`, type: 'positive'});
      setCurrentGoal(null);
      fetchNewGoal();
    }
  };

  const handleStart = () => {
    setGameStarted(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-transparent selection:text-transparent bg-sky-900">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        population={stats.population}
      />
      
      {!gameStarted && (
        <StartScreen onStart={handleStart} />
      )}

      {gameStarted && (
        <UIOverlay
          stats={stats}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          currentGoal={currentGoal}
          newsFeed={newsFeed}
          onClaimReward={handleClaimReward}
          onOpenQuiz={handleOpenQuiz}
          weather={weather}
        />
      )}

      {showQuiz && (
        <QuizModal 
           question={quizQuestion} 
           loading={quizLoading} 
           onAnswer={handleQuizAnswer} 
           onClose={() => setShowQuiz(false)} 
        />
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .mask-image-b { -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%); mask-image: linear-gradient(to bottom, transparent 0%, black 15%); }
        .writing-mode-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

export default App;