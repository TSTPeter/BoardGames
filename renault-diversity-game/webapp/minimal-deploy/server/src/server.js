const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const GameRoom = require('./game/GameRoom');
const AIPlayer = require('./game/AIPlayer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Store active game rooms
const gameRooms = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: gameRooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get list of public rooms
app.get('/api/rooms', (req, res) => {
  const publicRooms = Array.from(gameRooms.values())
    .filter(room => !room.isPrivate && room.state === 'waiting')
    .map(room => ({
      id: room.id,
      name: room.name,
      players: room.players.length,
      maxPlayers: room.maxPlayers,
      host: room.host
    }));

  res.json(publicRooms);
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
}

// Catchall handler - must be LAST, after all API routes
// Serves React app for any route not handled above (but won't affect socket.io)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create a new game room
  socket.on('createRoom', ({ playerName, roomName, isPrivate, maxPlayers }) => {
    const roomId = uuidv4().substring(0, 8);
    const room = new GameRoom(roomId, roomName, socket.id, isPrivate, maxPlayers || 6);

    gameRooms.set(roomId, room);

    const player = {
      id: socket.id,
      name: playerName,
      isHost: true,
      isAI: false
    };

    room.addPlayer(player);
    socket.join(roomId);

    socket.emit('roomCreated', {
      roomId,
      room: room.getPublicState()
    });

    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    if (room.state !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      isAI: false
    };

    room.addPlayer(player);
    socket.join(roomId);

    socket.emit('roomJoined', {
      roomId,
      room: room.getPublicState()
    });

    // Notify all players in the room
    io.to(roomId).emit('playerJoined', {
      player,
      players: room.players
    });

    console.log(`${playerName} joined room ${roomId}`);
  });

  // Add AI player
  socket.on('addAI', ({ roomId }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const aiId = `ai-${uuidv4().substring(0, 6)}`;
    const aiNames = ['Claude', 'Ada', 'Turing', 'Hopper', 'Lovelace', 'Nash'];
    const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];

    const aiPlayer = {
      id: aiId,
      name: `${aiName} (AI)`,
      isHost: false,
      isAI: true
    };

    room.addPlayer(aiPlayer);

    io.to(roomId).emit('playerJoined', {
      player: aiPlayer,
      players: room.players
    });

    console.log(`AI player ${aiName} added to room ${roomId}`);
  });

  // Start game
  socket.on('startGame', ({ roomId }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.host !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players to start' });
      return;
    }

    room.startGame();

    // Send initial game state to all players
    room.players.forEach(player => {
      const gameState = room.getGameStateForPlayer(player.id);

      if (player.isAI) {
        // AI players don't need socket emission
        return;
      }

      io.to(player.id).emit('gameStarted', gameState);
    });

    console.log(`Game started in room ${roomId}`);

    // Start the first trick
    scheduleNextTurn(room);
  });

  // Play a card
  socket.on('playCard', ({ roomId, cardIndex }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const result = room.playCard(socket.id, cardIndex);

    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }

    // Broadcast card played to all players
    io.to(roomId).emit('cardPlayed', {
      playerId: socket.id,
      card: result.card,
      currentTrick: room.currentTrick,
      trickNumber: room.trickNumber
    });

    // Update all players with new game state
    room.players.forEach(player => {
      const gameState = room.getGameStateForPlayer(player.id);

      if (!player.isAI) {
        io.to(player.id).emit('gameStateUpdate', gameState);
      }
    });

    // Check if trick is complete
    if (room.currentTrick.length === room.players.length) {
      setTimeout(() => {
        const winner = room.completeTrick();

        io.to(roomId).emit('trickComplete', {
          winner: winner.player,
          winningCard: winner.card,
          tricksWon: room.tricksWon
        });

        // Update game state
        room.players.forEach(player => {
          const gameState = room.getGameStateForPlayer(player.id);

          if (!player.isAI) {
            io.to(player.id).emit('gameStateUpdate', gameState);
          }
        });

        // Check if challenge is complete
        if (room.isRoundComplete()) {
          setTimeout(() => {
            const challengeResult = room.checkChallengeComplete();

            io.to(roomId).emit('challengeResult', challengeResult);

            if (challengeResult.success) {
              // Move to next challenge or show gold card
              if (room.shouldShowGoldCard()) {
                const goldCard = room.getNextGoldCard();
                io.to(roomId).emit('showGoldCard', goldCard);
              } else {
                room.nextChallenge();
                io.to(roomId).emit('nextChallenge', room.getCurrentChallenge());
              }
            } else {
              // Game over
              const finalScore = {
                challengesCompleted: room.currentChallengeIndex,
                finalChallenge: room.getCurrentChallenge()
              };
              io.to(roomId).emit('gameOver', finalScore);
            }
          }, 3000);
        } else {
          // Continue to next trick
          setTimeout(() => {
            scheduleNextTurn(room);
          }, 2000);
        }
      }, 2000);
    } else {
      // Next player's turn
      scheduleNextTurn(room);
    }
  });

  // Use player ability
  socket.on('useAbility', ({ roomId, abilityData }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const result = room.usePlayerAbility(socket.id, abilityData);

    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }

    io.to(roomId).emit('abilityUsed', {
      playerId: socket.id,
      ability: result.ability,
      effect: result.effect
    });

    // Update all players
    room.players.forEach(player => {
      const gameState = room.getGameStateForPlayer(player.id);

      if (!player.isAI) {
        io.to(player.id).emit('gameStateUpdate', gameState);
      }
    });
  });

  // Continue after gold card
  socket.on('continueAfterGoldCard', ({ roomId }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) return;

    room.nextChallenge();
    io.to(roomId).emit('nextChallenge', room.getCurrentChallenge());

    // Start next round
    scheduleNextTurn(room);
  });

  // Chat message
  socket.on('sendMessage', ({ roomId, message }) => {
    const room = gameRooms.get(roomId.toLowerCase());

    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);

    if (!player) return;

    io.to(roomId).emit('chatMessage', {
      playerId: socket.id,
      playerName: player.name,
      message,
      timestamp: Date.now()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Find and remove player from any rooms
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.removePlayer(socket.id);

        if (room.players.length === 0) {
          // Delete empty room
          gameRooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          io.to(roomId).emit('playerLeft', {
            playerId: socket.id,
            playerName: player.name,
            players: room.players
          });
        }
      }
    });
  });
});

// Helper function to schedule next turn (including AI)
function scheduleNextTurn(room) {
  if (!room || room.state !== 'playing') return;

  const currentPlayer = room.getCurrentPlayer();

  if (!currentPlayer) return;

  if (currentPlayer.isAI) {
    // AI player's turn
    setTimeout(() => {
      const aiPlayer = new AIPlayer(currentPlayer.id, room);
      const cardToPlay = aiPlayer.decideCardToPlay();

      const result = room.playCard(currentPlayer.id, cardToPlay);

      if (!result.error) {
        io.to(room.id).emit('cardPlayed', {
          playerId: currentPlayer.id,
          card: result.card,
          currentTrick: room.currentTrick,
          trickNumber: room.trickNumber
        });

        room.players.forEach(player => {
          const gameState = room.getGameStateForPlayer(player.id);

          if (!player.isAI) {
            io.to(player.id).emit('gameStateUpdate', gameState);
          }
        });

        // Check if trick is complete
        if (room.currentTrick.length === room.players.length) {
          setTimeout(() => {
            const winner = room.completeTrick();

            io.to(room.id).emit('trickComplete', {
              winner: winner.player,
              winningCard: winner.card,
              tricksWon: room.tricksWon
            });

            if (room.isRoundComplete()) {
              setTimeout(() => {
                const challengeResult = room.checkChallengeComplete();
                io.to(room.id).emit('challengeResult', challengeResult);

                if (challengeResult.success) {
                  if (room.shouldShowGoldCard()) {
                    const goldCard = room.getNextGoldCard();
                    io.to(room.id).emit('showGoldCard', goldCard);
                  } else {
                    room.nextChallenge();
                    io.to(room.id).emit('nextChallenge', room.getCurrentChallenge());
                    scheduleNextTurn(room);
                  }
                } else {
                  const finalScore = {
                    challengesCompleted: room.currentChallengeIndex,
                    finalChallenge: room.getCurrentChallenge()
                  };
                  io.to(room.id).emit('gameOver', finalScore);
                }
              }, 3000);
            } else {
              setTimeout(() => scheduleNextTurn(room), 2000);
            }
          }, 2000);
        } else {
          scheduleNextTurn(room);
        }
      }
    }, 1500); // AI thinks for 1.5 seconds
  }
  // Human players will emit playCard event
}

server.listen(PORT, () => {
  console.log(`🎮 Renault D&I Game Server running on port ${PORT}`);
  console.log(`🌍 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
