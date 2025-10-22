// Challenges from the physical game adapted for web play
const challenges = [
  {
    id: 1,
    title: 'Building the Foundation',
    difficulty: 1,
    scenario: 'Starting your D&I journey - everyone contributes',
    winCondition: 'Each player must win at least one trick',
    description: 'Everyone must contribute - each player needs to win at least one trick',
    checkWinCondition: (room) => {
      for (const [playerId, tricks] of room.tricksWon) {
        if (tricks.length === 0) {
          const player = room.players.find(p => p.id === playerId);
          return {
            success: false,
            message: `${player.name} didn't win any tricks`
          };
        }
      }
      return {
        success: true,
        message: 'Everyone contributed! Challenge complete!'
      };
    }
  },
  {
    id: 2,
    title: 'The Quiet Voices',
    difficulty: 1,
    scenario: 'Ensuring everyone has a voice',
    winCondition: 'Last player to join must win at least 2 tricks',
    description: 'The last player to join the game must win at least 2 tricks',
    checkWinCondition: (room) => {
      const lastPlayer = room.players[room.players.length - 1];
      const tricksCount = room.tricksWon.get(lastPlayer.id)?.length || 0;

      if (tricksCount >= 2) {
        return {
          success: true,
          message: `${lastPlayer.name} found their voice! Challenge complete!`
        };
      }
      return {
        success: false,
        message: `${lastPlayer.name} only won ${tricksCount} trick(s), needed 2`
      };
    }
  },
  {
    id: 3,
    title: 'Cross-Cultural Collaboration',
    difficulty: 2,
    scenario: 'Working across cultural communication styles',
    winCondition: 'Red and black suits must alternate winning tricks',
    description: 'Tricks must alternate between red suits (Hearts/Diamonds) and black suits (Clubs/Spades)',
    checkWinCondition: (room) => {
      let lastColor = null;
      let alternating = true;

      for (const [playerId, tricks] of room.tricksWon) {
        tricks.forEach(trick => {
          const winningPlay = trick[trick.length - 1];
          const isRed = winningPlay.card.suit === 'hearts' || winningPlay.card.suit === 'diamonds';

          if (lastColor !== null && lastColor === isRed) {
            alternating = false;
          }
          lastColor = isRed;
        });
      }

      if (alternating) {
        return {
          success: true,
          message: 'Perfect cultural balance! Challenge complete!'
        };
      }
      return {
        success: false,
        message: 'Colors didn\'t alternate properly'
      };
    }
  },
  {
    id: 4,
    title: 'Limited Resources',
    difficulty: 2,
    scenario: 'When D&I initiatives have constrained budgets',
    winCondition: 'Team must win exactly 5 tricks total',
    description: 'The team must win exactly 5 specific tricks (not more, not less)',
    checkWinCondition: (room) => {
      let totalTricks = 0;
      for (const [_, tricks] of room.tricksWon) {
        totalTricks += tricks.length;
      }

      if (totalTricks === 5) {
        return {
          success: true,
          message: 'Perfect resource management! Challenge complete!'
        };
      }
      return {
        success: false,
        message: `Won ${totalTricks} tricks, needed exactly 5`
      };
    }
  },
  {
    id: 5,
    title: 'The Hiring Panel',
    difficulty: 2,
    scenario: 'Ensuring balanced representation in decisions',
    winCondition: 'Each player must win at least 1 trick, no more than 3',
    description: 'Balance is key - each player wins 1-3 tricks',
    checkWinCondition: (room) => {
      for (const [playerId, tricks] of room.tricksWon) {
        const count = tricks.length;
        if (count < 1 || count > 3) {
          const player = room.players.find(p => p.id === playerId);
          return {
            success: false,
            message: `${player.name} won ${count} tricks, needed 1-3`
          };
        }
      }
      return {
        success: true,
        message: 'Perfectly balanced panel! Challenge complete!'
      };
    }
  },
  {
    id: 6,
    title: 'Building Belonging',
    difficulty: 3,
    scenario: 'Creating a culture where everyone feels they belong',
    winCondition: 'Every player must win at least 2 tricks, no player more than 4',
    description: 'Everyone contributes meaningfully without anyone dominating',
    checkWinCondition: (room) => {
      for (const [playerId, tricks] of room.tricksWon) {
        const count = tricks.length;
        const player = room.players.find(p => p.id === playerId);

        if (count < 2) {
          return {
            success: false,
            message: `${player.name} only won ${count} trick(s), needed at least 2`
          };
        }
        if (count > 4) {
          return {
            success: false,
            message: `${player.name} won ${count} tricks, maximum is 4`
          };
        }
      }
      return {
        success: true,
        message: 'Everyone belongs! Challenge complete!'
      };
    }
  },
  {
    id: 7,
    title: 'Unconscious Bias',
    difficulty: 3,
    scenario: 'When assumptions affect decision-making',
    winCondition: 'First player must win first trick, last player must win last trick',
    description: 'Challenge assumptions - specific players must win specific tricks',
    checkWinCondition: (room) => {
      const allTricks = [];

      // Collect all tricks in order
      for (let i = 0; i < Math.max(...Array.from(room.tricksWon.values()).map(t => t.length)); i++) {
        for (const [playerId, tricks] of room.tricksWon) {
          if (tricks[i]) {
            const winner = room.players.find(p => p.id === playerId);
            allTricks.push({ index: i, winner, playerId });
          }
        }
      }

      if (allTricks.length === 0) return { success: false, message: 'No tricks won' };

      const firstPlayer = room.players[0];
      const lastPlayer = room.players[room.players.length - 1];

      // Check first trick
      const firstTrickWinner = allTricks[0].playerId;
      if (firstTrickWinner !== firstPlayer.id) {
        return {
          success: false,
          message: `${firstPlayer.name} needed to win the first trick`
        };
      }

      // Check last trick
      const lastTrickWinner = allTricks[allTricks.length - 1].playerId;
      if (lastTrickWinner !== lastPlayer.id) {
        return {
          success: false,
          message: `${lastPlayer.name} needed to win the last trick`
        };
      }

      return {
        success: true,
        message: 'Bias overcome! Challenge complete!'
      };
    }
  },
  {
    id: 8,
    title: 'Pay Equity Analysis',
    difficulty: 4,
    scenario: 'Addressing compensation disparities',
    winCondition: 'Each player must win the same number of tricks',
    description: 'Perfect equity - all players must win the exact same number of tricks',
    checkWinCondition: (room) => {
      const trickCounts = Array.from(room.tricksWon.values()).map(t => t.length);
      const firstCount = trickCounts[0];

      if (trickCounts.every(count => count === firstCount)) {
        return {
          success: true,
          message: 'Perfect equity achieved! Challenge complete!'
        };
      }

      return {
        success: false,
        message: 'Players didn\'t win equal tricks'
      };
    }
  },
  {
    id: 9,
    title: 'Psychological Safety',
    difficulty: 4,
    scenario: 'Creating an environment where people can take risks',
    winCondition: 'Win at least 7 tricks total',
    description: 'Take strategic risks and win at least 7 tricks as a team',
    checkWinCondition: (room) => {
      let totalTricks = 0;
      for (const [_, tricks] of room.tricksWon) {
        totalTricks += tricks.length;
      }

      if (totalTricks >= 7) {
        return {
          success: true,
          message: 'Safe environment created! Challenge complete!'
        };
      }
      return {
        success: false,
        message: `Only won ${totalTricks} tricks, needed at least 7`
      };
    }
  },
  {
    id: 10,
    title: 'Systemic Change',
    difficulty: 5,
    scenario: 'Transforming organizational systems and culture',
    winCondition: 'Each player must win at least 2 tricks AND total must be at least 8',
    description: 'Multiple goals simultaneously - individual and collective success',
    checkWinCondition: (room) => {
      let totalTricks = 0;

      for (const [playerId, tricks] of room.tricksWon) {
        const count = tricks.length;
        totalTricks += count;

        if (count < 2) {
          const player = room.players.find(p => p.id === playerId);
          return {
            success: false,
            message: `${player.name} only won ${count} trick(s), everyone needs at least 2`
          };
        }
      }

      if (totalTricks < 8) {
        return {
          success: false,
          message: `Team won ${totalTricks} tricks total, needed at least 8`
        };
      }

      return {
        success: true,
        message: 'Systemic change achieved! Challenge complete!'
      };
    }
  }
];

module.exports = { challenges };
