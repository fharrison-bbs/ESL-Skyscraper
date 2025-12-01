/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

// Map Settings
export const GRID_SIZE = 15;

// Game Settings
export const TICK_RATE_MS = 2000; // Game loop updates every 2 seconds
export const INITIAL_MONEY = 500; // Reduced to encourage quiz participation
export const QUIZ_REWARD_BASE = 150;
export const UPGRADE_COST_MULTIPLIER = 1.5;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Clear',
    description: 'Clear land ($5)',
    color: '#ef4444', // Used for UI
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 10,
    name: 'Path',
    description: 'Stone pathway.',
    color: '#d4a574', // sandy brown
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 100,
    name: 'Dwelling',
    description: '+5 Workers/day.',
    color: '#c2885a', // sandstone
    popGen: 5,
    incomeGen: 0,
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 200,
    name: 'Bazaar',
    description: '+15 Gold/day.',
    color: '#14b8a6', // turquoise
    popGen: 0,
    incomeGen: 15,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 400,
    name: 'Workshop',
    description: '+40 Gold/day.',
    color: '#d97706', // amber-600
    popGen: 0,
    incomeGen: 40,
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 50,
    name: 'Oasis',
    description: 'Palm garden.',
    color: '#22c55e', // green-500
    popGen: 1,
    incomeGen: 0,
  },
  [BuildingType.School]: {
    type: BuildingType.School,
    cost: 600,
    name: 'Scribe Hall',
    description: 'Boosts Quiz Rewards.',
    color: '#6366f1', // indigo-500
    popGen: 2,
    incomeGen: 5,
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant,
    cost: 1000,
    name: 'Granary',
    description: 'Stores grain wealth.',
    color: '#eab308', // yellow-500
    popGen: 0,
    incomeGen: 100,
  },
  [BuildingType.Hospital]: {
    type: BuildingType.Hospital,
    cost: 800,
    name: 'Healing Temple',
    description: '+3 Workers, +20 Gold/day.',
    color: '#ec4899', // pink-500
    popGen: 3,
    incomeGen: 20,
  },
  [BuildingType.Library]: {
    type: BuildingType.Library,
    cost: 500,
    name: 'House of Life',
    description: '+1 Worker, +10 Gold/day.',
    color: '#8b5cf6', // violet-500
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.Museum]: {
    type: BuildingType.Museum,
    cost: 900,
    name: 'Sphinx',
    description: '+2 Workers, +30 Gold/day.',
    color: '#f59e0b', // amber-500
    popGen: 2,
    incomeGen: 30,
  },
  [BuildingType.Police]: {
    type: BuildingType.Police,
    cost: 700,
    name: 'Guard Post',
    description: 'Reduces disasters.',
    color: '#ef4444', // red-500
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.FireStation]: {
    type: BuildingType.FireStation,
    cost: 700,
    name: 'Water Station',
    description: 'Prevents fires.',
    color: '#3b82f6', // blue-500
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.Stadium]: {
    type: BuildingType.Stadium,
    cost: 1500,
    name: 'Arena',
    description: '+10 Workers, +50 Gold/day.',
    color: '#fbbf24', // yellow-400 (gold)
    popGen: 10,
    incomeGen: 50,
  },
};