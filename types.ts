/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None', // Acts as Bulldoze
  Road = 'Road',
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Park = 'Park',
  School = 'School',
  PowerPlant = 'PowerPlant',
}

export const TOOL_UPGRADE = 'Upgrade'; // Special tool identifier

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // Main color for 3D material
  popGen: number; // Population generation per tick
  incomeGen: number; // Money generation per tick
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  // Suggested by AI for visual variety later
  variant?: number;
  level: number;
  damaged?: boolean;
}

export type Grid = TileData[][];

export interface CityStats {
  money: number;
  population: number;
  day: number;
  grammarScore: number; // New stat tracking correct answers
}

export interface AIGoal {
  description: string;
  targetType: 'population' | 'money' | 'building_count';
  targetValue: number;
  buildingType?: BuildingType; // If target is building_count
  reward: number;
  completed: boolean;
}

export interface NewsItem {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}