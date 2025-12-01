
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None', // Acts as Demolish
  Road = 'Road', // Via
  Domus = 'Domus', // Residential (Low)
  Insula = 'Insula', // Residential (High)
  Market = 'Market', // Commercial
  Works = 'Works', // Industrial
  Forum = 'Forum', // Past Simple Hub
  Baths = 'Baths', // Past Continuous Hub
  Colosseum = 'Colosseum', // Mixed Practice
  Senate = 'Senate', // Subordinate Clauses
  Aqueduct = 'Aqueduct', // Decorative/Infrastructure
}

export const TOOL_UPGRADE = 'Upgrade'; // Renovate

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // UI Color
  popGen: number; // Citizens
  incomeGen: number; // Denarii
  grammarTopic?: string; // The grammar rule this building represents
  guideText?: string; // Explanation for the ? button
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  level: number;
  damaged?: boolean;
}

export type Grid = TileData[][];

export interface CityStats {
  money: number; // Denarii
  population: number; // Citizens
  day: number;
  grammarScore: number;
}

export interface AIGoal {
  description: string;
  targetType: 'population' | 'money' | 'building_count';
  targetValue: number;
  buildingType?: BuildingType;
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
