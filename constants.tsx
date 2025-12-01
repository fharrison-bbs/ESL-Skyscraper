
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

// Map Settings
export const GRID_SIZE = 15;

// Game Settings
export const TICK_RATE_MS = 2000;
export const INITIAL_MONEY = 800; // Denarii
export const QUIZ_REWARD_BASE = 200;
export const UPGRADE_COST_MULTIPLIER = 1.5;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Demolish',
    description: 'Clear land (5 Denarii)',
    color: '#ef4444', 
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 10,
    name: 'Via (Road)',
    description: 'Cobblestone roads.',
    color: '#78716c', // stone-500
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Domus]: {
    type: BuildingType.Domus,
    cost: 100,
    name: 'Domus',
    description: 'Private home. +5 Citizens.',
    color: '#f87171',
    popGen: 5,
    incomeGen: 0,
  },
  [BuildingType.Insula]: {
    type: BuildingType.Insula,
    cost: 200,
    name: 'Insula',
    description: 'Apartment block. +15 Citizens.',
    color: '#fb923c',
    popGen: 15,
    incomeGen: 5,
  },
  [BuildingType.Market]: {
    type: BuildingType.Market,
    cost: 250,
    name: 'Market',
    description: 'Trade goods. +20 Denarii.',
    color: '#facc15',
    popGen: 0,
    incomeGen: 20,
  },
  [BuildingType.Works]: {
    type: BuildingType.Works,
    cost: 400,
    name: 'Works',
    description: 'Production. +45 Denarii.',
    color: '#713f12', // bronze/brown
    popGen: 0,
    incomeGen: 45,
  },
  [BuildingType.Aqueduct]: {
    type: BuildingType.Aqueduct,
    cost: 150,
    name: 'Aqueduct',
    description: 'Water supply. Looks majestic.',
    color: '#3b82f6',
    popGen: 2,
    incomeGen: 0,
  },
  [BuildingType.Forum]: {
    type: BuildingType.Forum,
    cost: 600,
    name: 'Forum',
    description: 'Center of public life.',
    color: '#e2e8f0', // marble
    popGen: 5,
    incomeGen: 10,
    grammarTopic: 'Past Simple',
    guideText: 'Use Past Simple for completed actions in the past. (e.g., "Caesar conquered Gaul.")',
  },
  [BuildingType.Baths]: {
    type: BuildingType.Baths,
    cost: 800,
    name: 'Baths',
    description: 'Relaxation & hygiene.',
    color: '#06b6d4', // cyan
    popGen: 10,
    incomeGen: 0,
    grammarTopic: 'Past Continuous',
    guideText: 'Use Past Continuous for actions in progress in the past. (e.g., "The citizens were bathing when...")',
  },
  [BuildingType.Colosseum]: {
    type: BuildingType.Colosseum,
    cost: 1500,
    name: 'Colosseum',
    description: 'Games & Spectacles.',
    color: '#b91c1c', // red
    popGen: 0,
    incomeGen: 100,
    grammarTopic: 'Past Simple vs Continuous',
    guideText: 'Mix the tenses! Short action (Simple) interrupts long action (Continuous).',
  },
  [BuildingType.Senate]: {
    type: BuildingType.Senate,
    cost: 1200,
    name: 'Senate',
    description: 'Law & Order.',
    color: '#7e22ce', // purple
    popGen: 5,
    incomeGen: 50,
    grammarTopic: 'Subordinate Clauses',
    guideText: 'Complex sentences with time, reason, or condition. (e.g., "Although it rained, the games continued.")',
  },
};
