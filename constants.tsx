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
    name: 'Bulldoze',
    description: 'Clear a tile ($5)',
    color: '#ef4444', // Used for UI
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 10,
    name: 'Road',
    description: 'Connects buildings.',
    color: '#374151', // gray-700
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 100,
    name: 'Res.',
    description: '+5 Pop/day. Upgradeable.',
    color: '#f87171', // red-400
    popGen: 5,
    incomeGen: 0,
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 200,
    name: 'Com.',
    description: '+$15/day. Upgradeable.',
    color: '#60a5fa', // blue-400
    popGen: 0,
    incomeGen: 15,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 400,
    name: 'Ind.',
    description: '+$40/day. Pollutes.',
    color: '#facc15', // yellow-400
    popGen: 0,
    incomeGen: 40,
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 50,
    name: 'Park',
    description: 'Looks nice.',
    color: '#4ade80', // green-400
    popGen: 1,
    incomeGen: 0,
  },
  [BuildingType.School]: {
    type: BuildingType.School,
    cost: 600,
    name: 'School',
    description: 'Boosts Quiz Rewards.',
    color: '#c084fc', // purple-400
    popGen: 2,
    incomeGen: 5,
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant,
    cost: 1000,
    name: 'Power',
    description: 'Boosts Industrial Output.',
    color: '#ea580c', // orange-600
    popGen: 0,
    incomeGen: 100,
  },
  [BuildingType.Hospital]: {
    type: BuildingType.Hospital,
    cost: 800,
    name: 'Hospital',
    description: '+3 Pop/day, +$20/day.',
    color: '#ef4444', // red-500
    popGen: 3,
    incomeGen: 20,
  },
  [BuildingType.Library]: {
    type: BuildingType.Library,
    cost: 500,
    name: 'Library',
    description: '+1 Pop/day, +$10/day.',
    color: '#f59e0b', // amber-500
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.Museum]: {
    type: BuildingType.Museum,
    cost: 900,
    name: 'Museum',
    description: '+2 Pop/day, +$30/day.',
    color: '#8b5cf6', // violet-500
    popGen: 2,
    incomeGen: 30,
  },
  [BuildingType.Police]: {
    type: BuildingType.Police,
    cost: 700,
    name: 'Police',
    description: 'Reduces disasters.',
    color: '#3b82f6', // blue-500
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.FireStation]: {
    type: BuildingType.FireStation,
    cost: 700,
    name: 'Fire Stn',
    description: 'Reduces fire damage.',
    color: '#dc2626', // red-600
    popGen: 1,
    incomeGen: 10,
  },
  [BuildingType.Stadium]: {
    type: BuildingType.Stadium,
    cost: 1500,
    name: 'Stadium',
    description: '+10 Pop/day, +$50/day.',
    color: '#10b981', // emerald-500
    popGen: 10,
    incomeGen: 50,
  },
};