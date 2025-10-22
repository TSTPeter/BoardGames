import React, { Suspense, useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import useGameStore from '../utils/gameStore';
import Card3D from '../scenes/Card3D';
import GameTable from '../scenes/GameTable';
import WaitingRoom from './WaitingRoom';
import GameHUD from './GameHUD';

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  color: var(--renault-yellow);
  font-size: 1.5rem;
  z-index: 100;
`;

function GameBoard() {
  const {
    gameState,
    myHand,
    currentTrick,
    currentPlayer,
    playerId,
    selectedCard,
    setSelectedCard,
    players,
    room
  } = useGameStore();

  const [cameraPosition, setCameraPosition] = useState([0, 8, 12]);

  // If in waiting room (game created but not started)
  if (room && room.state === 'waiting') {
    return <WaitingRoom />;
  }

  const isMyTurn = currentPlayer && currentPlayer.id === playerId;

  const handleCardClick = (index) => {
    if (isMyTurn) {
      setSelectedCard(selectedCard === index ? null : index);
    }
  };

  return (
    <BoardContainer>
      <Suspense fallback={
        <LoadingOverlay>
          Loading 3D Environment...
        </LoadingOverlay>
      }>
        <CanvasContainer>
          <Canvas shadows>
            <PerspectiveCamera
              makeDefault
              position={cameraPosition}
              fov={50}
            />

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={8}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
            />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <spotLight
              position={[0, 15, 0]}
              angle={0.6}
              penumbra={1}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[5, 10, 5]} intensity={0.5} />
            <pointLight position={[-5, 10, -5]} intensity={0.5} />

            {/* Game Table */}
            <GameTable />

            {/* Current Trick (cards in play) */}
            {currentTrick.map((play, index) => {
              const angle = (index / players.length) * Math.PI * 2;
              const radius = 2;
              const x = Math.sin(angle) * radius;
              const z = Math.cos(angle) * radius;

              return (
                <Card3D
                  key={`trick-${index}`}
                  position={[x, 0.5, z]}
                  rotation={[0, -angle, 0]}
                  card={play.card}
                  faceUp={true}
                  scale={0.8}
                />
              );
            })}

            {/* Player's Hand */}
            {myHand && myHand.map((card, index) => {
              const totalCards = myHand.length;
              const spread = Math.min(totalCards * 0.4, 8);
              const xOffset = ((index - (totalCards - 1) / 2) * spread) / totalCards;
              const yOffset = selectedCard === index ? 0.5 : 0;
              const zPosition = 6;

              return (
                <Card3D
                  key={`hand-${index}`}
                  position={[xOffset, 0.5 + yOffset, zPosition]}
                  rotation={[-0.3, 0, 0]}
                  card={card}
                  faceUp={true}
                  onClick={() => handleCardClick(index)}
                  isSelectable={isMyTurn}
                  isSelected={selectedCard === index}
                  scale={1}
                />
              );
            })}
          </Canvas>
        </CanvasContainer>

        {/* HUD Overlay */}
        <GameHUD />
      </Suspense>
    </BoardContainer>
  );
}

export default GameBoard;
