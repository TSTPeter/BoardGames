# Renault D&I Game - Web Application

A stunning 3D multiplayer web application for the Renault Diversity & Inclusion cooperative card game.

![Game Preview](docs/preview.png)

## Features

### 🎮 Gameplay
- **Full 3D Graphics** - Beautiful 3D card rendering using Three.js
- **Multiplayer Support** - Real-time multiplayer via WebSocket
- **AI Players** - Add AI players to fill out your team
- **Mobile Responsive** - Play on desktop, tablet, or phone
- **Touch Controls** - Optimized for touch devices

### 🎨 Visuals
- **3D Card Animations** - Smooth animations and transitions
- **Renault Branding** - Official colors and styling
- **Dynamic Lighting** - Professional 3D environment
- **Particle Effects** - Visual feedback for actions

### 🤝 Social Features
- **Room System** - Create or join game rooms
- **Player Abilities** - Asymmetrical powers for each player
- **Gold Cards** - Interactive learning moments
- **Challenge System** - 10 progressive challenges

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Three.js** - 3D graphics engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Zustand** - State management
- **Framer Motion** - Animations
- **Styled Components** - CSS-in-JS styling

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **Game Logic** - Custom game engine

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Install dependencies:**
```bash
cd webapp
npm install
```

This will install dependencies for both client and server.

2. **Start development servers:**
```bash
npm run dev
```

This starts:
- Frontend dev server on `http://localhost:3000`
- Backend server on `http://localhost:3001`

3. **Open your browser:**
Navigate to `http://localhost:3000`

## Project Structure

```
webapp/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── scenes/        # 3D scenes and objects
│   │   ├── utils/         # Utilities and store
│   │   ├── styles/        # Global styles
│   │   └── App.js         # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── game/          # Game logic
│   │   │   ├── GameRoom.js
│   │   │   ├── AIPlayer.js
│   │   │   ├── challenges.js
│   │   │   ├── goldCards.js
│   │   │   └── playerAbilities.js
│   │   └── server.js      # Express + Socket.io server
│   └── package.json
│
├── package.json           # Root package.json
└── README.md             # This file
```

## How to Play

### Creating a Game

1. **Enter Your Name**
   - Type your name on the lobby screen

2. **Create Room**
   - Click "Create New Room"
   - Optionally set a room name
   - Share the room code with friends

3. **Add Players**
   - Wait for friends to join
   - Or click "Add AI Player" to add computer players
   - Need 3-6 total players

4. **Start Game**
   - Host clicks "Start Game"
   - Game begins!

### Playing Cards

1. **View Your Hand**
   - Your cards appear at the bottom of the screen in 3D
   - Drag to rotate the camera and view the table

2. **Select a Card**
   - Click/tap a card to select it
   - Selected card glows and rises up

3. **Play Card**
   - Click "Play Selected Card" button
   - Card animates to the center of the table

4. **Complete Tricks**
   - Highest card of led suit wins
   - Winner leads next trick

5. **Complete Challenge**
   - Meet the challenge's win condition
   - Progress to next challenge or reveal Gold Card

### Gold Cards

- Unlocked every 2 challenges
- Pause for learning and discussion
- Connect game mechanics to D&I concepts
- Reflect on workplace applications

## Game Controls

### Desktop
- **Mouse** - Click cards to select
- **Click & Drag** - Rotate camera
- **Scroll** - Zoom in/out
- **Buttons** - UI interactions

### Mobile
- **Tap** - Select cards
- **Touch & Drag** - Rotate camera
- **Pinch** - Zoom
- **Buttons** - UI interactions

## Configuration

### Environment Variables

Create `.env` files for configuration:

**Client (.env in client/):**
```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

**Server (.env in server/):**
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## Development

### Running in Development

```bash
# Install all dependencies
npm run install:all

# Start both client and server
npm run dev

# Or run individually:
npm run dev:client   # Client only
npm run dev:server   # Server only
```

### Building for Production

```bash
# Build client
npm run build

# Start production server
npm start
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Heroku
- AWS
- DigitalOcean
- Vercel + Railway
- Docker

## API Documentation

### Socket Events

**Client → Server**

- `createRoom` - Create a new game room
- `joinRoom` - Join existing room
- `addAI` - Add AI player
- `startGame` - Start the game
- `playCard` - Play a card
- `useAbility` - Use player ability
- `continueAfterGoldCard` - Continue after Gold Card
- `sendMessage` - Send chat message

**Server → Client**

- `roomCreated` - Room created successfully
- `roomJoined` - Joined room successfully
- `playerJoined` - Player joined room
- `playerLeft` - Player left room
- `gameStarted` - Game has started
- `cardPlayed` - Card was played
- `gameStateUpdate` - Game state updated
- `trickComplete` - Trick completed
- `challengeResult` - Challenge completed/failed
- `showGoldCard` - Display Gold Card
- `nextChallenge` - New challenge started
- `gameOver` - Game ended
- `abilityUsed` - Ability was used
- `chatMessage` - Chat message received
- `error` - Error occurred

## Troubleshooting

### Common Issues

**Cannot connect to server**
- Check that server is running on port 3001
- Verify SOCKET_URL in client .env
- Check firewall settings

**Cards not rendering**
- Ensure WebGL is enabled in browser
- Update graphics drivers
- Try a different browser

**Mobile controls not working**
- Disable browser zoom
- Use landscape orientation for better experience
- Ensure touch events are enabled

**Game state out of sync**
- Refresh the page
- Rejoin the room
- Check network connection

## Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile Safari** 14+
- **Chrome Android** 90+

**Requirements:**
- WebGL 2.0 support
- WebSocket support
- ES6+ JavaScript

## Performance Tips

### For Best Performance

1. **Close unnecessary tabs**
2. **Use hardware acceleration**
3. **Update graphics drivers**
4. **Reduce camera movement**
5. **Close background applications**

### Adjusting Quality

The game automatically adjusts quality based on device capabilities, but you can manually:
- Reduce zoom for better performance
- Close other applications
- Use a more powerful device

## Contributing

This is a private project for Renault. For internal contributions:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit for review

## Support

For technical support:
- [Internal support channel]
- [Renault D&I team contact]

## License

Private - Renault Internal Use Only

---

## Credits

**Game Design:** Renault D&I Team
**Technology:** React, Three.js, Node.js, Socket.io
**Graphics:** Custom 3D rendering engine
**AI:** Custom game AI system

---

**Powered by:**
- React Three Fiber ❤️
- Socket.io 🔌
- Renault Innovation 🚗

Enjoy the game and build a more inclusive workplace! 🌈
