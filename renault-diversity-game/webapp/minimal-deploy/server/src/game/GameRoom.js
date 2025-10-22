const { challenges } = require('./challenges');
const { goldCards } = require('./goldCards');
const { playerAbilities } = require('./playerAbilities');

class GameRoom {
  constructor(id, name, hostId, isPrivate = false, maxPlayers = 6) {
    this.id = id;
    this.name = name;
    this.host = hostId;
    this.isPrivate = isPrivate;
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.state = 'waiting'; // waiting, playing, finished
    this.currentChallengeIndex = 0;
    this.goldCardsRevealed = 0;
    this.deck = [];
    this.playerHands = new Map();
    this.playerAbilities = new Map();
    this.currentTrick = [];
    this.trickNumber = 0;
    this.currentPlayerIndex = 0;
    this.tricksWon = new Map();
    this.leadSuit = null;
    this.abilityUsed = new Map();
  }

  addPlayer(player) {
    this.players.push(player);
    this.tricksWon.set(player.id, []);
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      this.playerHands.delete(playerId);
      this.tricksWon.delete(playerId);

      // If host left, assign new host
      if (this.host === playerId && this.players.length > 0) {
        this.host = this.players[0].id;
        this.players[0].isHost = true;
      }
    }
  }

  startGame() {
    this.state = 'playing';
    this.currentChallengeIndex = 0;
    this.goldCardsRevealed = 0;

    // Assign player abilities
    const abilities = [...playerAbilities].slice(0, this.players.length);
    this.players.forEach((player, index) => {
      this.playerAbilities.set(player.id, abilities[index]);
      this.abilityUsed.set(player.id, false);
    });

    // Deal cards for first challenge
    this.dealCards();
  }

  dealCards() {
    // Create standard 52-card deck
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.deck = [];

    suits.forEach(suit => {
      for (let value = 1; value <= 13; value++) {
        this.deck.push({ suit, value });
      }
    });

    // Shuffle deck
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }

    // Deal cards evenly to players
    this.playerHands.clear();
    const cardsPerPlayer = Math.floor(this.deck.length / this.players.length);

    this.players.forEach((player, index) => {
      const hand = this.deck.slice(
        index * cardsPerPlayer,
        (index + 1) * cardsPerPlayer
      );
      this.playerHands.set(player.id, hand);
    });

    // Reset trick tracking
    this.players.forEach(player => {
      this.tricksWon.set(player.id, []);
    });

    this.currentTrick = [];
    this.trickNumber = 0;
    this.currentPlayerIndex = 0;
    this.leadSuit = null;

    // Reset abilities for new round
    this.players.forEach(player => {
      this.abilityUsed.set(player.id, false);
    });
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getCurrentChallenge() {
    return challenges[this.currentChallengeIndex];
  }

  playCard(playerId, cardIndex) {
    const currentPlayer = this.getCurrentPlayer();

    if (currentPlayer.id !== playerId) {
      return { error: 'Not your turn' };
    }

    const hand = this.playerHands.get(playerId);

    if (!hand || cardIndex < 0 || cardIndex >= hand.length) {
      return { error: 'Invalid card' };
    }

    const card = hand[cardIndex];

    // Check if player must follow suit
    if (this.leadSuit && this.currentTrick.length > 0) {
      const hasLeadSuit = hand.some(c => c.suit === this.leadSuit);

      if (hasLeadSuit && card.suit !== this.leadSuit) {
        return { error: 'Must follow suit' };
      }
    }

    // If first card of trick, set lead suit
    if (this.currentTrick.length === 0) {
      this.leadSuit = card.suit;
    }

    // Remove card from hand
    hand.splice(cardIndex, 1);

    // Add to current trick
    this.currentTrick.push({
      playerId,
      card
    });

    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

    return { card };
  }

  completeTrick() {
    // Determine winner
    let winner = this.currentTrick[0];

    this.currentTrick.forEach(play => {
      if (play.card.suit === this.leadSuit) {
        if (play.card.value > winner.card.value || winner.card.suit !== this.leadSuit) {
          winner = play;
        }
      }
    });

    // Add trick to winner's pile
    const winnerTricks = this.tricksWon.get(winner.playerId);
    winnerTricks.push([...this.currentTrick]);

    // Reset for next trick
    this.currentTrick = [];
    this.leadSuit = null;
    this.trickNumber++;

    // Winner leads next trick
    this.currentPlayerIndex = this.players.findIndex(p => p.id === winner.playerId);

    return {
      player: this.players.find(p => p.id === winner.playerId),
      card: winner.card
    };
  }

  isRoundComplete() {
    // Check if all players have played all their cards
    for (const [playerId, hand] of this.playerHands) {
      if (hand.length > 0) {
        return false;
      }
    }
    return true;
  }

  checkChallengeComplete() {
    const challenge = this.getCurrentChallenge();
    const result = challenge.checkWinCondition(this);

    return {
      success: result.success,
      message: result.message,
      challenge: challenge.title
    };
  }

  shouldShowGoldCard() {
    // Show gold card every 2 challenges
    return (this.currentChallengeIndex + 1) % 2 === 0 &&
           this.goldCardsRevealed < goldCards.length;
  }

  getNextGoldCard() {
    const goldCard = goldCards[this.goldCardsRevealed];
    this.goldCardsRevealed++;
    return goldCard;
  }

  nextChallenge() {
    this.currentChallengeIndex++;

    if (this.currentChallengeIndex < challenges.length) {
      this.dealCards();
    } else {
      this.state = 'finished';
    }
  }

  usePlayerAbility(playerId, abilityData) {
    if (this.abilityUsed.get(playerId)) {
      return { error: 'Ability already used this round' };
    }

    const ability = this.playerAbilities.get(playerId);

    if (!ability) {
      return { error: 'No ability assigned' };
    }

    // Execute ability (simplified - would need more logic for each ability type)
    const result = ability.execute(this, playerId, abilityData);

    if (result.success) {
      this.abilityUsed.set(playerId, true);
    }

    return {
      ability: ability.name,
      effect: result.effect,
      error: result.error
    };
  }

  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      host: this.host,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isAI: p.isAI
      })),
      maxPlayers: this.maxPlayers,
      state: this.state,
      currentChallengeIndex: this.currentChallengeIndex,
      currentChallenge: this.state === 'playing' ? this.getCurrentChallenge() : null
    };
  }

  getGameStateForPlayer(playerId) {
    return {
      ...this.getPublicState(),
      myHand: this.playerHands.get(playerId) || [],
      myAbility: this.playerAbilities.get(playerId),
      abilityUsed: this.abilityUsed.get(playerId),
      currentTrick: this.currentTrick,
      trickNumber: this.trickNumber,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer(),
      tricksWon: Array.from(this.tricksWon.entries()).map(([pid, tricks]) => ({
        playerId: pid,
        playerName: this.players.find(p => p.id === pid)?.name,
        count: tricks.length
      })),
      leadSuit: this.leadSuit,
      handSizes: Array.from(this.playerHands.entries()).map(([pid, hand]) => ({
        playerId: pid,
        size: hand.length
      }))
    };
  }
}

module.exports = GameRoom;
