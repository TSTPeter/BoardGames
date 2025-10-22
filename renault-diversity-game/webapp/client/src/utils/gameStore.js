import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Connection state
  connected: false,
  playerId: null,
  playerName: '',

  // Room state
  roomId: null,
  room: null,
  players: [],
  isHost: false,

  // Game state
  gameState: 'lobby', // lobby, playing, goldCard, finished
  myHand: [],
  myAbility: null,
  abilityUsed: false,
  currentTrick: [],
  trickNumber: 0,
  currentPlayerIndex: 0,
  currentPlayer: null,
  tricksWon: [],
  leadSuit: null,
  handSizes: [],
  currentChallenge: null,
  challengeIndex: 0,
  goldCard: null,

  // UI state
  selectedCard: null,
  showChallenge: true,
  showAbility: false,
  chatMessages: [],
  notification: null,

  // Actions
  setConnected: (connected) => set({ connected }),

  setPlayerId: (playerId) => set({ playerId }),

  setPlayerName: (name) => set({ playerName: name }),

  setRoom: (roomData) => set({
    roomId: roomData.roomId,
    room: roomData.room,
    players: roomData.room.players,
    isHost: roomData.room.host === get().playerId
  }),

  updatePlayers: (players) => set({ players }),

  setGameState: (state) => set({ gameState: state }),

  updateGameState: (gameStateData) => set({
    myHand: gameStateData.myHand || [],
    myAbility: gameStateData.myAbility || null,
    abilityUsed: gameStateData.abilityUsed || false,
    currentTrick: gameStateData.currentTrick || [],
    trickNumber: gameStateData.trickNumber || 0,
    currentPlayerIndex: gameStateData.currentPlayerIndex || 0,
    currentPlayer: gameStateData.currentPlayer || null,
    tricksWon: gameStateData.tricksWon || [],
    leadSuit: gameStateData.leadSuit || null,
    handSizes: gameStateData.handSizes || [],
    currentChallenge: gameStateData.currentChallenge || null,
    challengeIndex: gameStateData.currentChallengeIndex || 0,
    players: gameStateData.players || get().players
  }),

  setSelectedCard: (index) => set({ selectedCard: index }),

  setShowChallenge: (show) => set({ showChallenge: show }),

  setShowAbility: (show) => set({ showAbility: show }),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  setNotification: (notification) => set({ notification }),

  clearNotification: () => set({ notification: null }),

  setGoldCard: (card) => set({
    goldCard: card,
    gameState: 'goldCard'
  }),

  clearGoldCard: () => set({
    goldCard: null,
    gameState: 'playing'
  }),

  reset: () => set({
    roomId: null,
    room: null,
    players: [],
    isHost: false,
    gameState: 'lobby',
    myHand: [],
    myAbility: null,
    abilityUsed: false,
    currentTrick: [],
    trickNumber: 0,
    currentPlayerIndex: 0,
    currentPlayer: null,
    tricksWon: [],
    leadSuit: null,
    handSizes: [],
    currentChallenge: null,
    challengeIndex: 0,
    goldCard: null,
    selectedCard: null,
    showChallenge: true,
    showAbility: false,
    chatMessages: [],
    notification: null
  })
}));

export default useGameStore;
