/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AIGoal, NewsItem, BuildingType, CityStats, Grid } from './types';
import { BUILDINGS } from './constants';

/**
 * Predefined city goals that cycle through
 */
const GOAL_TEMPLATES: Array<Omit<AIGoal, 'completed'>> = [
  {
    description: "Grow the city to 50 citizens",
    targetType: 'population',
    targetValue: 50,
    reward: 200
  },
  {
    description: "Accumulate $1,000 in the treasury",
    targetType: 'money',
    targetValue: 1000,
    reward: 300
  },
  {
    description: "Build 5 residential buildings",
    targetType: 'building_count',
    targetValue: 5,
    buildingType: BuildingType.Residential,
    reward: 250
  },
  {
    description: "Reach 100 citizens",
    targetType: 'population',
    targetValue: 100,
    reward: 400
  },
  {
    description: "Build 3 commercial buildings",
    targetType: 'building_count',
    targetValue: 3,
    buildingType: BuildingType.Commercial,
    reward: 300
  },
  {
    description: "Accumulate $2,500 in the treasury",
    targetType: 'money',
    targetValue: 2500,
    reward: 500
  },
  {
    description: "Build 2 schools",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.School,
    reward: 400
  },
  {
    description: "Reach 200 citizens",
    targetType: 'population',
    targetValue: 200,
    reward: 600
  },
  {
    description: "Build 2 industrial buildings",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Industrial,
    reward: 450
  },
  {
    description: "Accumulate $5,000 in the treasury",
    targetType: 'money',
    targetValue: 5000,
    reward: 800
  },
  {
    description: "Build 1 power plant",
    targetType: 'building_count',
    targetValue: 1,
    buildingType: BuildingType.PowerPlant,
    reward: 700
  },
  {
    description: "Build 5 parks",
    targetType: 'building_count',
    targetValue: 5,
    buildingType: BuildingType.Park,
    reward: 350
  },
  {
    description: "Reach 300 citizens",
    targetType: 'population',
    targetValue: 300,
    reward: 900
  },
  {
    description: "Accumulate $10,000 in the treasury",
    targetType: 'money',
    targetValue: 10000,
    reward: 1200
  },
  {
    description: "Build 3 hospitals",
    targetType: 'building_count',
    targetValue: 3,
    buildingType: BuildingType.Hospital,
    reward: 800
  },
  {
    description: "Build 2 libraries",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Library,
    reward: 600
  },
  {
    description: "Build 2 police stations",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Police,
    reward: 650
  },
  {
    description: "Build 2 fire stations",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.FireStation,
    reward: 650
  },
  {
    description: "Build 1 museum",
    targetType: 'building_count',
    targetValue: 1,
    buildingType: BuildingType.Museum,
    reward: 700
  },
  {
    description: "Reach 500 citizens",
    targetType: 'population',
    targetValue: 500,
    reward: 1500
  }
];

let currentGoalIndex = 0;

/**
 * Generate the next city goal from the predefined list
 */
export function getNextCityGoal(stats: CityStats, grid: Grid): AIGoal {
  // Cycle through goals
  const template = GOAL_TEMPLATES[currentGoalIndex % GOAL_TEMPLATES.length];
  currentGoalIndex++;

  return {
    ...template,
    completed: false
  };
}

/**
 * Positive news events
 */
const POSITIVE_NEWS = [
  "🎉 Tourism up 15% this quarter!",
  "📈 Local business growth exceeds expectations.",
  "🌟 City ranked among top liveable metros.",
  "🎪 Annual festival draws record crowds.",
  "🏆 Education scores improve citywide.",
  "💼 Unemployment hits historic low.",
  "🚇 New metro line approved by council.",
  "🌳 Tree-planting initiative exceeds goals.",
  "📚 Library sees surge in memberships.",
  "🎨 Art district receives cultural grant.",
  "🏥 Hospital expands emergency services.",
  "🎓 University announces new campus.",
  "🌤️ Air quality improves this month.",
  "🎵 Music venue opens downtown.",
  "🏃 Marathon raises funds for charity.",
  "👮 Crime rate drops 20% this year.",
  "🌍 Sister city partnership announced.",
  "🔬 Research lab opens in tech district.",
  "🍕 Restaurant week boosts local economy.",
  "⚡ Clean energy initiative launches.",
  "🎬 Film festival comes to the city.",
  "🏅 Athletes win regional championships.",
  "📱 Free WiFi expands to all parks.",
  "🌈 Pride parade draws thousands.",
  "🛒 Farmers market expands to weekends.",
  "🚴 Bike lanes added across downtown.",
  "🏛️ Historic building restoration complete.",
  "🎭 Theater season tickets sell out.",
  "📰 Local newspaper wins journalism award.",
  "🌸 Cherry blossom festival announced."
];

/**
 * Negative news events
 */
const NEGATIVE_NEWS = [
  "⚠️ Traffic congestion worsens on highways.",
  "💨 Air quality advisory issued.",
  "🚧 Bridge maintenance causes delays.",
  "📉 Retail sales decline this quarter.",
  "🌧️ Heavy rain floods low-lying areas.",
  "🔌 Power outage affects 500 homes.",
  "🏚️ Vacancy rates rise in office sector.",
  "🚨 Noise complaints increase downtown.",
  "🗑️ Sanitation workers strike for wages.",
  "🚦 Traffic lights malfunction citywide.",
  "💧 Water main break disrupts service.",
  "📱 Cell tower outage reported.",
  "🏗️ Construction delays push back opening.",
  "🚇 Metro line experiences signal issues.",
  "🦠 Flu season hits early this year.",
  "🌡️ Heat wave strains power grid.",
  "🐕 Stray animal reports increase.",
  "🏭 Factory emissions exceed limits.",
  "📊 Budget deficit concerns raised.",
  "🚓 Police overtime costs rise.",
  "🌊 Coastal erosion threatens boardwalk.",
  "🎒 School overcrowding reported.",
  "🚗 Parking shortage downtown.",
  "🔊 Concert venue faces noise lawsuit.",
  "🌿 Pest infestation in public parks.",
  "🚌 Bus breakdowns cause delays.",
  "💼 Major employer announces layoffs.",
  "🏨 Hotel occupancy rates drop.",
  "📉 Housing affordability worsens.",
  "🚮 Litter cleanup costs increase."
];

/**
 * Neutral news events
 */
const NEUTRAL_NEWS = [
  "📅 City council meeting scheduled for Tuesday.",
  "🏛️ Town hall hours extended for holidays.",
  "🗳️ Voter registration drive underway.",
  "📢 Public hearing on zoning tonight.",
  "🗺️ New city map published online.",
  "📊 Census data collection begins.",
  "🎤 Mayor holds monthly Q&A session.",
  "📝 Building permits processed faster.",
  "🔔 Community forums start next week.",
  "🏢 Office hours adjusted for summer.",
  "📍 New street signs installed citywide.",
  "🚸 School crossing guards return Monday.",
  "📆 Holiday garbage schedule posted.",
  "🔧 Routine maintenance on water system.",
  "🚥 Traffic study commissioned for Main St.",
  "📋 Business license renewals due.",
  "🗃️ Archives digitization project ongoing.",
  "🎯 Strategic plan update in progress.",
  "📞 Non-emergency number changed.",
  "🏛️ Public records request policy updated.",
  "🔄 Recycling guidelines clarified.",
  "📺 Council meetings now livestreamed.",
  "🌐 City website redesign launched.",
  "🔍 Audit of city finances underway.",
  "📬 Postal code boundaries adjusted.",
  "🎫 Parking permit process streamlined.",
  "🏷️ Property assessments mailed out.",
  "📨 Newsletter subscription available.",
  "🔔 Emergency alert system tested.",
  "🗂️ Department reorganization announced."
];

/**
 * Get a random news event
 */
export function getRandomNews(type?: 'positive' | 'negative' | 'neutral'): NewsItem {
  let newsArray: string[];
  let newsType: 'positive' | 'negative' | 'neutral';

  if (type) {
    newsType = type;
  } else {
    // Random distribution: 40% positive, 30% negative, 30% neutral
    const rand = Math.random();
    if (rand < 0.4) newsType = 'positive';
    else if (rand < 0.7) newsType = 'negative';
    else newsType = 'neutral';
  }

  switch (newsType) {
    case 'positive':
      newsArray = POSITIVE_NEWS;
      break;
    case 'negative':
      newsArray = NEGATIVE_NEWS;
      break;
    case 'neutral':
      newsArray = NEUTRAL_NEWS;
      break;
  }

  const text = newsArray[Math.floor(Math.random() * newsArray.length)];

  return {
    id: Date.now().toString() + Math.random(),
    text,
    type: newsType
  };
}

/**
 * Weather types with visual effects
 */
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

export interface WeatherState {
  type: WeatherType;
  description: string;
  emoji: string;
}

const WEATHER_STATES: Record<WeatherType, WeatherState> = {
  sunny: {
    type: 'sunny',
    description: 'Clear and sunny',
    emoji: '☀️'
  },
  cloudy: {
    type: 'cloudy',
    description: 'Partly cloudy',
    emoji: '⛅'
  },
  rainy: {
    type: 'rainy',
    description: 'Light rain',
    emoji: '🌧️'
  },
  stormy: {
    type: 'stormy',
    description: 'Thunderstorms',
    emoji: '⛈️'
  },
  snowy: {
    type: 'snowy',
    description: 'Snowing',
    emoji: '❄️'
  }
};

/**
 * Get a random weather state
 */
export function getRandomWeather(): WeatherState {
  const types: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
  const weights = [0.4, 0.25, 0.2, 0.1, 0.05]; // Sunny is most common

  let rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      return WEATHER_STATES[types[i]];
    }
  }

  return WEATHER_STATES.sunny;
}
