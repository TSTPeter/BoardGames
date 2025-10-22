// Player abilities - asymmetrical powers that highlight diverse strengths
const playerAbilities = [
  {
    id: 'connector',
    name: 'The Connector',
    title: 'Bridge Builder',
    description: 'Pass one card to another player, they pass one back',
    symbol: '🌉',
    color: '#FF6B6B',
    thematic: 'Relationship builders, network weavers, social cohesion',
    execute: (room, playerId, data) => {
      // Simplified - just marks as used
      return {
        success: true,
        effect: 'Card exchange enabled'
      };
    }
  },
  {
    id: 'observer',
    name: 'The Observer',
    title: 'Deep Insight',
    description: 'Ask any player one yes/no question about their hand',
    symbol: '👁️',
    color: '#4ECDC4',
    thematic: 'Active listeners, data analysts, pattern recognizers',
    execute: (room, playerId, data) => {
      return {
        success: true,
        effect: 'Question asked'
      };
    }
  },
  {
    id: 'advocate',
    name: 'The Advocate',
    title: 'Amplify',
    description: 'Play a card on behalf of another player',
    symbol: '📢',
    color: '#95E1D3',
    thematic: 'Allies, sponsors, those who amplify others\' voices',
    execute: (room, playerId, data) => {
      return {
        success: true,
        effect: 'Advocated for teammate'
      };
    }
  },
  {
    id: 'innovator',
    name: 'The Innovator',
    title: 'Reframe',
    description: 'Lowest card wins the trick instead of highest',
    symbol: '💡',
    color: '#F9CA24',
    thematic: 'Creative thinkers, rule-questioners, new possibilities',
    execute: (room, playerId, data) => {
      return {
        success: true,
        effect: 'Rules reframed'
      };
    }
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    title: 'Share Wisdom',
    description: 'Reveal up to three cards from your hand to all players',
    symbol: '🎓',
    color: '#6C5CE7',
    thematic: 'Experienced guides, knowledge sharers, patient teachers',
    execute: (room, playerId, data) => {
      return {
        success: true,
        effect: 'Wisdom shared'
      };
    }
  },
  {
    id: 'adapter',
    name: 'The Adapter',
    title: 'Flexibility',
    description: 'Swap one card from hand with the deck',
    symbol: '🔄',
    color: '#A29BFE',
    thematic: 'Flexible thinkers, cultural translators, resilient problem-solvers',
    execute: (room, playerId, data) => {
      return {
        success: true,
        effect: 'Card swapped'
      };
    }
  }
];

module.exports = { playerAbilities };
