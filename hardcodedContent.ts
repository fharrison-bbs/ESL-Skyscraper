/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AIGoal, NewsItem, BuildingType, CityStats, Grid } from './types';
import { BUILDINGS } from './constants';

/**
 * Predefined kingdom goals that cycle through
 */
const GOAL_TEMPLATES: Array<Omit<AIGoal, 'completed'>> = [
  {
    description: "Recruit 50 workers for the kingdom",
    targetType: 'population',
    targetValue: 50,
    reward: 200
  },
  {
    description: "Accumulate 1,000 gold in the royal treasury",
    targetType: 'money',
    targetValue: 1000,
    reward: 300
  },
  {
    description: "Build 5 worker dwellings",
    targetType: 'building_count',
    targetValue: 5,
    buildingType: BuildingType.Residential,
    reward: 250
  },
  {
    description: "Employ 100 workers in the kingdom",
    targetType: 'population',
    targetValue: 100,
    reward: 400
  },
  {
    description: "Establish 3 bazaars for trade",
    targetType: 'building_count',
    targetValue: 3,
    buildingType: BuildingType.Commercial,
    reward: 300
  },
  {
    description: "Gather 2,500 gold for the pharaoh",
    targetType: 'money',
    targetValue: 2500,
    reward: 500
  },
  {
    description: "Build 2 scribe halls",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.School,
    reward: 400
  },
  {
    description: "Grow the workforce to 200 laborers",
    targetType: 'population',
    targetValue: 200,
    reward: 600
  },
  {
    description: "Construct 2 workshops",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Industrial,
    reward: 450
  },
  {
    description: "Amass 5,000 gold in wealth",
    targetType: 'money',
    targetValue: 5000,
    reward: 800
  },
  {
    description: "Build 1 royal granary",
    targetType: 'building_count',
    targetValue: 1,
    buildingType: BuildingType.PowerPlant,
    reward: 700
  },
  {
    description: "Plant 5 oases in the desert",
    targetType: 'building_count',
    targetValue: 5,
    buildingType: BuildingType.Park,
    reward: 350
  },
  {
    description: "House 300 workers in the settlement",
    targetType: 'population',
    targetValue: 300,
    reward: 900
  },
  {
    description: "Collect 10,000 gold for pyramid construction",
    targetType: 'money',
    targetValue: 10000,
    reward: 1200
  },
  {
    description: "Erect 3 healing temples",
    targetType: 'building_count',
    targetValue: 3,
    buildingType: BuildingType.Hospital,
    reward: 800
  },
  {
    description: "Found 2 houses of life",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Library,
    reward: 600
  },
  {
    description: "Station 2 guard posts along the Nile",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.Police,
    reward: 650
  },
  {
    description: "Build 2 water stations",
    targetType: 'building_count',
    targetValue: 2,
    buildingType: BuildingType.FireStation,
    reward: 650
  },
  {
    description: "Construct 1 great sphinx monument",
    targetType: 'building_count',
    targetValue: 1,
    buildingType: BuildingType.Museum,
    reward: 700
  },
  {
    description: "Expand the kingdom to 500 subjects",
    targetType: 'population',
    targetValue: 500,
    reward: 1500
  }
];

let currentGoalIndex = 0;

/**
 * Generate the next kingdom goal from the predefined list
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
  "🎉 The Nile flood brings fertile silt to our fields!",
  "📈 Trade caravans report record profits from Nubia.",
  "🌟 Pharaoh praises our settlement's prosperity.",
  "🎪 Annual festival honoring Ra draws massive crowds.",
  "🏆 Scribes achieve highest literacy rates in the kingdom.",
  "💼 All able workers employed in royal projects.",
  "🚢 New trading route established with Mediterranean ports.",
  "🌴 Palm grove expansion exceeds expectations.",
  "📚 House of Life acquires rare papyrus scrolls.",
  "🎨 Temple murals receive royal commendation.",
  "🏥 Healing temple discovers new herbal remedies.",
  "🎓 Scribe academy welcomes students from distant lands.",
  "🌤️ Perfect weather for the harvest season.",
  "🎵 Musicians perform for the pharaoh's court.",
  "🏃 Chariot race raises funds for temple restoration.",
  "👮 Bandits cleared from desert trade routes.",
  "🌍 Alliance formed with neighboring kingdom.",
  "🔬 Astronomers predict favorable star alignments.",
  "🍇 Vineyard produces exceptional wine this year.",
  "⚡ Lightning rod invention protects granaries.",
  "🎬 Royal decree announces new monuments.",
  "🏅 Athletes win competitions at Memphis games.",
  "📱 Messenger system reaches all settlements instantly.",
  "🌈 Double rainbow seen over the Nile - good omen!",
  "🛒 Market day attracts traders from Thebes.",
  "🚴 Swift runners deliver messages faster than ever.",
  "🏛️ Ancient temple restoration completed successfully.",
  "🎭 Theater troupe performs for massive audiences.",
  "📰 Scribes record our achievements on temple walls.",
  "🌸 Lotus flowers bloom abundantly in sacred pools."
];

/**
 * Negative news events
 */
const NEGATIVE_NEWS = [
  "⚠️ Sandstorm damages several market stalls.",
  "💨 Dust clouds reduce visibility on trade routes.",
  "🚧 Canal maintenance disrupts water distribution.",
  "📉 Grain prices fluctuate due to drought concerns.",
  "🌊 Unexpected Nile surge floods storage areas.",
  "🔌 Sacred flame in temple extinguished by winds.",
  "🏚️ Abandoned dwellings increase near quarry.",
  "🚨 Noise complaints from late-night festivals.",
  "🗑️ Waste collectors demand higher wages.",
  "🚦 Chariot traffic clogs main thoroughfare.",
  "💧 Water canal breached in southern district.",
  "📱 Messenger bird shortage delays communications.",
  "🏗️ Pyramid construction behind schedule.",
  "🚢 Nile boat traffic congestion causes delays.",
  "🦠 Minor illness spreads among workers.",
  "🌡️ Intense heat wave strains water supplies.",
  "🐕 Wild jackals spotted near settlement outskirts.",
  "🏭 Pottery kiln smoke exceeds acceptable levels.",
  "📊 Royal treasury expenses exceed projections.",
  "🚓 Guard overtime costs increase.",
  "🌊 Desert encroachment threatens eastern farmland.",
  "🎒 Scribe schools report overcrowding.",
  "🚗 Chariot parking shortage at marketplace.",
  "🔊 Temple ceremonies face noise complaints.",
  "🌿 Locusts spotted approaching grain fields.",
  "🚌 Ferry breakdowns delay Nile crossings.",
  "💼 Major workshop announces worker reductions.",
  "🏨 Inn occupancy rates decline this season.",
  "📉 Housing costs rise beyond worker means.",
  "🚮 Litter accumulates near bazaar district."
];

/**
 * Neutral news events
 */
const NEUTRAL_NEWS = [
  "📅 Pharaoh's council convenes this week.",
  "🏛️ Royal palace announces extended audience hours.",
  "🗳️ New scribes register for administrative duties.",
  "📢 Public decree reading scheduled for sunset.",
  "🗺️ Updated maps of the Nile delta published.",
  "📊 Kingdom census begins next full moon.",
  "🎤 Vizier holds monthly consultation sessions.",
  "📝 Building permits issued more efficiently now.",
  "🔔 Town gatherings commence after harvest.",
  "🏢 Administrative office hours adjusted for summer heat.",
  "📍 New boundary stones placed throughout kingdom.",
  "🚸 Temple guards resume morning patrols.",
  "📆 Festival calendar updated for the season.",
  "🔧 Routine maintenance on irrigation canals.",
  "🚥 Trade route survey commissioned.",
  "📋 Merchant licenses require renewal.",
  "🗃️ Royal archives undergo papyrus preservation.",
  "🎯 Kingdom expansion plan under review.",
  "📞 Emergency horn signal system upgraded.",
  "🏛️ Public records access policy clarified.",
  "🔄 Recycling of pottery shards encouraged.",
  "📺 Royal announcements now posted at all temples.",
  "🌐 Messenger network expanded to outer villages.",
  "🔍 Annual tax assessment underway.",
  "📬 District boundaries redrawn for administration.",
  "🎫 Temple entry tokens now distributed weekly.",
  "🏷️ Property registrations completed this month.",
  "📨 Papyrus newsletter distributed to scribes.",
  "🔔 Warning beacon system tested successfully.",
  "🗂️ Administrative restructuring announced."
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
 * Weather types with visual effects - Egyptian climate
 */
export type WeatherType = 'sunny' | 'hot' | 'dusty' | 'sandstorm' | 'cloudy';

export interface WeatherState {
  type: WeatherType;
  description: string;
  emoji: string;
}

const WEATHER_STATES: Record<WeatherType, WeatherState> = {
  sunny: {
    type: 'sunny',
    description: 'Clear desert skies',
    emoji: '☀️'
  },
  hot: {
    type: 'hot',
    description: 'Scorching heat',
    emoji: '🔥'
  },
  dusty: {
    type: 'dusty',
    description: 'Light dust winds',
    emoji: '🌫️'
  },
  sandstorm: {
    type: 'sandstorm',
    description: 'Raging sandstorm',
    emoji: '🌪️'
  },
  cloudy: {
    type: 'cloudy',
    description: 'Rare cloud cover',
    emoji: '☁️'
  }
};

/**
 * Get a random weather state appropriate for Ancient Egypt
 */
export function getRandomWeather(): WeatherState {
  const types: WeatherType[] = ['sunny', 'hot', 'dusty', 'sandstorm', 'cloudy'];
  const weights = [0.5, 0.25, 0.15, 0.05, 0.05]; // Sunny/hot most common, sandstorms rare

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
