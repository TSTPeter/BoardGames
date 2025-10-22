import React from 'react';
import { Text } from '@react-three/drei';
import Card3D from './Card3D';

/**
 * Renders another player's hand as face-down cards in a fan arrangement
 * Shows the player's name and card count above their position
 */
function PlayerHand3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  playerName = 'Player',
  cardCount = 0,
  isCurrentPlayer = false
}) {
  // Arrange cards in a fan
  const cards = [];
  const spreadAngle = Math.min(cardCount * 0.15, 1.2); // Max spread of ~70 degrees

  for (let i = 0; i < cardCount; i++) {
    const totalCards = cardCount;
    const angleOffset = ((i - (totalCards - 1) / 2) * spreadAngle) / totalCards;
    const cardSpacing = 0.15;
    const xOffset = Math.sin(angleOffset) * cardSpacing * totalCards * 0.3;
    const zOffset = Math.cos(angleOffset) * 0.3 - 0.3;
    const yOffset = Math.abs(angleOffset) * 0.1;

    cards.push(
      <Card3D
        key={`player-card-${i}`}
        position={[xOffset, yOffset, zOffset]}
        rotation={[0, angleOffset, 0]}
        card={null}
        faceUp={false}
        scale={0.7}
      />
    );
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Player name label */}
      <Text
        position={[0, 1.2, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.3}
        color={isCurrentPlayer ? '#FFCC00' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {playerName}
      </Text>

      {/* Card count badge */}
      <Text
        position={[0, 0.9, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.25}
        color="#FFCC00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {cardCount} {cardCount === 1 ? 'card' : 'cards'}
      </Text>

      {/* Current player indicator */}
      {isCurrentPlayer && (
        <>
          <pointLight
            position={[0, 1.5, 0]}
            intensity={1.5}
            distance={4}
            color="#FFCC00"
          />
          <Text
            position={[0, 1.6, 0]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.2}
            color="#FFCC00"
            anchorX="center"
            anchorY="middle"
          >
            ▼ TURN ▼
          </Text>
        </>
      )}

      {/* Render the cards */}
      {cards}
    </group>
  );
}

export default PlayerHand3D;
