// AI Player logic for single-player and filling out teams
class AIPlayer {
  constructor(playerId, gameRoom) {
    this.playerId = playerId;
    this.room = gameRoom;
    this.hand = gameRoom.playerHands.get(playerId) || [];
  }

  decideCardToPlay() {
    const leadSuit = this.room.leadSuit;
    const currentTrick = this.room.currentTrick;

    // If we can follow suit, filter to those cards
    let playableCards = this.hand;

    if (leadSuit && currentTrick.length > 0) {
      const suitCards = this.hand.filter(card => card.suit === leadSuit);

      if (suitCards.length > 0) {
        playableCards = suitCards;
      }
    }

    // Simple AI strategy: try to win if leading, otherwise play low
    if (currentTrick.length === 0) {
      // Leading - play a mid-range card
      playableCards.sort((a, b) => a.value - b.value);
      const midIndex = Math.floor(playableCards.length / 2);
      return this.hand.indexOf(playableCards[midIndex]);
    } else {
      // Following - try to win if possible, otherwise play lowest
      const highestInTrick = Math.max(...currentTrick
        .filter(p => p.card.suit === leadSuit)
        .map(p => p.card.value));

      const winningCards = playableCards.filter(
        card => card.suit === leadSuit && card.value > highestInTrick
      );

      if (winningCards.length > 0) {
        // Play lowest winning card
        winningCards.sort((a, b) => a.value - b.value);
        return this.hand.indexOf(winningCards[0]);
      } else {
        // Can't win, play lowest card
        playableCards.sort((a, b) => a.value - b.value);
        return this.hand.indexOf(playableCards[0]);
      }
    }
  }

  // Could add more sophisticated strategies based on challenge type
  analyzeChallenge() {
    const challenge = this.room.getCurrentChallenge();
    // Could adjust strategy based on challenge requirements
    return {};
  }
}

module.exports = AIPlayer;
