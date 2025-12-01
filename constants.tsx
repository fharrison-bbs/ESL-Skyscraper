
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
    description: 'Improves Public Health.',
    color: '#f43f5e', // rose-500
    popGen: 8,
    incomeGen: 0,
  },
  [BuildingType.PoliceStation]: {
    type: BuildingType.PoliceStation,
    cost: 800,
    name: 'Police',
    description: 'Improves Safety.',
    color: '#1e3a8a', // blue-900
    popGen: 2,
    incomeGen: 20,
  },
};
