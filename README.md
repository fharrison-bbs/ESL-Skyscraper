# ESL Sky Metropolis 🏙️

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/ESL-Skyscraper)

An interactive educational city-building game designed to help ESL students practice **Past Simple** and **Past Continuous** grammar through engaging gameplay.

## Features

- **🏗️ City Building**: Build a thriving metropolis with 14 different building types
- **📝 Grammar Quizzes**: 100 handcrafted fill-in-the-blank questions focused on Past Simple and Past Continuous
- **🎯 City Goals**: Progressive challenges to keep players engaged
- **☀️ Dynamic Weather**: Experience changing weather conditions
- **📰 News Feed**: Real-time city events and updates
- **💰 School Multipliers**: Build schools to increase quiz rewards
- **📱 Responsive Design**: Optimized for tablets and desktop computers

## Building Types

| Building | Cost | Features |
|----------|------|----------|
| Road | $10 | Connects buildings |
| Residential | $100 | +5 Population/day |
| Commercial | $200 | +$15/day |
| Industrial | $400 | +$40/day |
| Park | $50 | +1 Population/day |
| School | $600 | Boosts quiz rewards |
| PowerPlant | $1000 | +$100/day |
| Hospital | $800 | +3 Pop, +$20/day |
| Library | $500 | +1 Pop, +$10/day |
| Museum | $900 | +2 Pop, +$30/day |
| Police | $700 | Reduces disasters |
| Fire Station | $700 | Reduces fire damage |
| Stadium | $1500 | +10 Pop, +$50/day |

## Grammar Focus

The app contains **100 carefully crafted questions** covering:
- **Past Simple**: Regular and irregular verbs, completed actions
- **Past Continuous**: Ongoing actions, interrupted actions, simultaneous actions

All questions use city/urban contexts to maintain thematic consistency.

## Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ESL-Skyscraper.git
   cd ESL-Skyscraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Deploy to Vercel

### One-Click Deploy

Click the button below to deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/ESL-Skyscraper)

### Manual Deploy

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D isometric city visualization
- **React Three Fiber** - React renderer for Three.js
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Educational Use

This app is designed for:
- ESL Grade 4 students (or equivalent level)
- Classroom interactive activities
- Homework assignments
- Self-paced learning
- Grammar practice in engaging contexts

## Game Mechanics

1. **Starting Money**: Players begin with $500
2. **Earning Money**:
   - Complete grammar quizzes for $150 (base amount)
   - School multiplier: +50% per school built
   - Building income generation
3. **City Goals**: Progressive challenges with monetary rewards
4. **Disasters**: Random events (fires, meteors, earthquakes) add challenge
5. **Weather System**: Dynamic weather changes every ~1 minute

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for ESL education
