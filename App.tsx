
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
import { generateCityGoal, generateNewsEvent, generateESLQuestion } from './services/geminiService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, buildingType: BuildingType.None, level: 1, damaged: false });
    }
    grid.push(row);
  }
  return grid;
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ money: INITIAL_MONEY, population: 0, day: 1, grammarScore: 0 });
  const [selectedTool, setSelectedTool] = useState<string>(BuildingType.Road);
  const [weather, setWeather] = useState<'sunny' | 'rainy'>('sunny');
  
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);
  const aiEnabledRef = useRef(aiEnabled);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);
  useEffect(() => { aiEnabledRef.current = aiEnabled; }, [aiEnabled]);

  const addNewsItem = useCallback((item: NewsItem) => {
    setNewsFeed(prev => [...prev.slice(-12), item]); 
  }, []);

  const fetchNewGoal = useCallback(async () => {
    if (isGeneratingGoal || !aiEnabledRef.current) return;
    setIsGeneratingGoal(true);
    await new Promise(r => setTimeout(r, 500));
    
    const newGoal = await generateCityGoal(statsRef.current, gridRef.current);
    if (newGoal) {
      setCurrentGoal(newGoal);
    } else {
      if(aiEnabledRef.current) setTimeout(fetchNewGoal, 30000); 
    }
    setIsGeneratingGoal(false);
  }, [isGeneratingGoal]); 

  const fetchNews = useCallback(async () => {
    if (!aiEnabledRef.current || Math.random() > 0.02) return; 
    const news = await generateNewsEvent(statsRef.current, null);
    if (news) addNewsItem(news);
  }, [addNewsItem]);

  const handleOpenQuiz = async (specificTopic?: string) => {
    setShowQuiz(true);
    setQuizLoading(true);
    setQuizQuestion(null);
    
    // If no specific topic (clicking "Perform Duty"), pick random from available buildings
    let topic = specificTopic;
    if (!topic) {
        const topics = ['Past Simple', 'Past Continuous', 'Subordinate Clauses', 'Past Simple vs Continuous'];
        topic = topics[Math.floor(Math.random() * topics.length)];
    }

    const q = await generateESLQuestion(topic);
    setQuizQuestion(q);
    setQuizLoading(false);
  };

  const handleQuizAnswer = (correct: boolean) => {
    setShowQuiz(false);
    if (correct) {
      // Reward calculation: Base + Bonus for having a Senate or Forum
      let bonus = 1;
      gridRef.current.flat().forEach(t => { 
          if (t.buildingType === BuildingType.Forum || t.buildingType === BuildingType.Senate) bonus += 0.2; 
      });
      const reward = Math.round(QUIZ_REWARD_BASE * bonus);
      
      setStats(prev => ({ 
        ...prev, 
        money: prev.money + reward,
        grammarScore: prev.grammarScore + 1
      }));
      addNewsItem({ id: Date.now().toString(), text: `Grammar Approved! +${reward} Denarii.`, type: 'positive' });
    } else {
       addNewsItem({ id: Date.now().toString(), text: `Inaccurate Latin translation. No Denarii.`, type: 'negative' });
    }
  };

  useEffect(() => {
    if (!gameStarted) return;
    addNewsItem({ id: Date.now().toString(), text: "Ave! Build a Forum to begin political life.", type: 'positive' });
    if (aiEnabled) fetchNewGoal();
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      let dailyIncome = 0;
      let dailyPopGrowth = 0;
      let buildingCounts: Record<string, number> = {};

      gridRef.current.flat().forEach(tile => {
        if (tile.buildingType !== BuildingType.None) {
          const config = BUILDINGS[tile.buildingType];
          const multiplier = tile.damaged ? 0 : tile.level;
          
          dailyIncome += config.incomeGen * multiplier;
          dailyPopGrowth += config.popGen * multiplier;
          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      const resCount = (buildingCounts[BuildingType.Domus] || 0) + (buildingCounts[BuildingType.Insula] || 0);
      const maxPop = resCount * 100; 

      setStats(prev => {
        let newPop = prev.population + dailyPopGrowth;
        if (newPop > maxPop) newPop = maxPop;
        
        const newStats = {
          ...prev,
          money: prev.money + dailyIncome,
          population: newPop,
          day: prev.day + 1,
        };
        
        const goal = goalRef.current;
        if (aiEnabledRef.current && goal && !goal.completed) {
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
      
      if (Math.random() < 0.05) {
        setWeather(prev => prev === 'sunny' ? 'rainy' : 'sunny');
      }

      fetchNews();

    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [fetchNews, gameStarted]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return;

    const currentGrid = gridRef.current;
    const currentStats = statsRef.current;
    const tool = selectedTool;
    
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const currentTile = currentGrid[y][x];

    // Interaction with existing building (Perform Duty specific to that building)
    if (currentTile.buildingType !== BuildingType.None && currentTile.buildingType !== BuildingType.Road && tool !== BuildingType.None && tool !== TOOL_UPGRADE) {
        // If clicking a grammar building, open specific quiz
        const config = BUILDINGS[currentTile.buildingType];
        if (config.grammarTopic) {
            handleOpenQuiz(config.grammarTopic);
            return;
        }
    }

    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        const demolishCost = 5;
        if (currentStats.money >= demolishCost) {
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[y][x] = { ...currentTile, buildingType: BuildingType.None, level: 1, damaged: false };
            setGrid(newGrid);
            setStats(prev => ({ ...prev, money: prev.money - demolishCost }));
        }
      }
      return;
    }

    if (tool === TOOL_UPGRADE) {
      if (currentTile.buildingType !== BuildingType.None && currentTile.buildingType !== BuildingType.Road) {
        const config = BUILDINGS[currentTile.buildingType];
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
             newGrid[y][x] = { ...currentTile, damaged: false };
             addNewsItem({id: Date.now().toString(), text: `Restored ${config.name}.`, type: 'positive'});
          } else {
             newGrid[y][x] = { ...currentTile, level: currentTile.level + 1 };
          }
          setGrid(newGrid);
          setStats(prev => ({ ...prev, money: prev.money - cost }));
        } else {
          addNewsItem({id: Date.now().toString(), text: `Need ${cost} Denarii.`, type: 'negative'});
        }
      }
      return;
    }

    if (currentTile.buildingType === BuildingType.None) {
      const buildingConfig = BUILDINGS[tool as BuildingType];
      if (currentStats.money >= buildingConfig.cost) {
        setStats(prev => ({ ...prev, money: prev.money - buildingConfig.cost }));
        
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, buildingType: tool as BuildingType, level: 1, damaged: false };
        setGrid(newGrid);
      } else {
        addNewsItem({id: Date.now().toString(), text: `Treasury Insufficient for ${buildingConfig.name}.`, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameStarted]);

  const handleClaimReward = () => {
    if (currentGoal && currentGoal.completed) {
      setStats(prev => ({ ...prev, money: prev.money + currentGoal.reward }));
      addNewsItem({id: Date.now().toString(), text: `Goal achieved! Bounty claimed.`, type: 'positive'});
      setCurrentGoal(null);
      fetchNewGoal();
    }
  };

  const handleStart = (enabled: boolean) => {
    setAiEnabled(enabled);
    setGameStarted(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-transparent selection:text-transparent bg-[#0f172a]">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        population={stats.population}
        weather={weather}
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
          isGeneratingGoal={isGeneratingGoal}
          aiEnabled={aiEnabled}
          onOpenQuiz={handleOpenQuiz}
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
    </div>
  );
}

export default App;
